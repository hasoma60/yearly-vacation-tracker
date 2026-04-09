import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";
import { calculateCalendarDays, detectOverlap, calculateLeaveSalary } from "./lib/dates";

export const submit = mutation({
  args: {
    leaveType: v.union(
      v.literal("annual"),
      v.literal("sick"),
      v.literal("maternity"),
      v.literal("paternity"),
      v.literal("bereavement"),
      v.literal("hajj"),
      v.literal("unpaid")
    ),
    periodNumber: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
    startDate: v.string(),
    endDate: v.string(),
    replacementId: v.optional(v.id("users")),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireAuth(ctx);

    if (args.startDate > args.endDate) {
      throw new Error("Start date must be before end date");
    }

    // UAE: Calendar days (public holidays excluded)
    const daysUsed = calculateCalendarDays(args.startDate, args.endDate);
    if (daysUsed <= 0) {
      throw new Error("Leave must include at least one day");
    }

    // For annual leave, check existing requests and balance
    if (args.leaveType === "annual") {
      const existingRequests = await ctx.db
        .query("vacationRequests")
        .withIndex("by_employee_year", (q) =>
          q.eq("employeeId", userId).eq("year", args.year)
        )
        .filter((q) =>
          q.and(
            q.neq(q.field("status"), "rejected"),
            q.eq(q.field("leaveType"), "annual")
          )
        )
        .collect();

      const samePeriod = existingRequests.find(
        (r) => r.periodNumber === args.periodNumber
      );
      if (samePeriod) {
        throw new Error(
          `You already have annual leave for period ${args.periodNumber} this year`
        );
      }

      // UAE: 30 calendar days annual leave entitlement
      const totalUsed = existingRequests.reduce((sum, r) => sum + r.daysUsed, 0);
      const totalAllowance = user.annualAllowance + (user.carryForwardDays || 0);
      if (totalUsed + daysUsed > totalAllowance) {
        throw new Error(
          `Insufficient balance. You have ${totalAllowance - totalUsed} days remaining (including carry-forward).`
        );
      }
    }

    // Hajj leave: once per employment
    if (args.leaveType === "hajj") {
      const existingHajj = await ctx.db
        .query("vacationRequests")
        .withIndex("by_employee", (q) => q.eq("employeeId", userId))
        .filter((q) =>
          q.and(
            q.neq(q.field("status"), "rejected"),
            q.eq(q.field("leaveType"), "hajj")
          )
        )
        .collect();
      if (existingHajj.length > 0) {
        throw new Error("Hajj leave can only be taken once per employment");
      }
    }

    const requestId = await ctx.db.insert("vacationRequests", {
      employeeId: userId,
      leaveType: args.leaveType,
      periodNumber: args.periodNumber,
      startDate: args.startDate,
      endDate: args.endDate,
      daysUsed,
      replacementId: args.replacementId,
      status: "pending",
      isConfidential: false,
      year: args.year,
    });

    // Notify managers
    if (user.departmentId) {
      const managers = await ctx.db
        .query("users")
        .withIndex("by_department", (q) =>
          q.eq("departmentId", user.departmentId!)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("isActive"), true),
            q.or(
              q.eq(q.field("role"), "manager"),
              q.eq(q.field("role"), "admin")
            )
          )
        )
        .collect();

      for (const manager of managers) {
        await ctx.db.insert("notifications", {
          userId: manager._id,
          type: "request_submitted",
          message: `${user.name} submitted ${args.leaveType} leave (${args.startDate} to ${args.endDate}, ${daysUsed} calendar days)`,
          relatedRequestId: requestId,
          isRead: false,
        });
      }
    }

    return requestId;
  },
});

export const cancel = mutation({
  args: { id: v.id("vacationRequests") },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Request not found");
    if (request.employeeId !== userId) {
      throw new Error("You can only cancel your own requests");
    }
    if (request.status !== "pending") {
      throw new Error("Can only cancel pending requests");
    }
    await ctx.db.delete(args.id);
  },
});

export const approve = mutation({
  args: {
    id: v.id("vacationRequests"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, ["admin", "manager"]);
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") {
      throw new Error("Can only approve pending requests");
    }

    await ctx.db.patch(args.id, {
      status: "approved",
      reviewedBy: userId,
      reviewedAt: Date.now(),
      reviewNote: args.note,
    });

    // Create leave salary record with UAE calculation
    const employee = await ctx.db.get(request.employeeId);
    if (employee && request.leaveType === "annual") {
      const basicSalary = employee.basicSalary || 0;
      const fixedAllowances = employee.fixedAllowances || 0;
      const salaryCalc = calculateLeaveSalary(
        basicSalary,
        fixedAllowances,
        request.daysUsed
      );

      await ctx.db.insert("leaveSalary", {
        vacationRequestId: args.id,
        employeeId: request.employeeId,
        basicAmount: salaryCalc.basicAmount,
        allowancesAmount: salaryCalc.allowancesAmount,
        totalAmount: salaryCalc.totalAmount,
        status: "pending",
      });
    }

    // Notify employee
    await ctx.db.insert("notifications", {
      userId: request.employeeId,
      type: "request_approved",
      message: `Your ${request.leaveType} leave (${request.startDate} to ${request.endDate}) has been approved${args.note ? `: ${args.note}` : ""}`,
      relatedRequestId: args.id,
      isRead: false,
    });

    // Notify accounts for annual leave
    if (request.leaveType === "annual") {
      const accountsUsers = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "accounts"))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
      for (const acc of accountsUsers) {
        await ctx.db.insert("notifications", {
          userId: acc._id,
          type: "request_approved",
          message: `${employee?.name}'s annual leave approved - leave salary pending release`,
          relatedRequestId: args.id,
          isRead: false,
        });
      }
    }
  },
});

export const reject = mutation({
  args: {
    id: v.id("vacationRequests"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, ["admin", "manager"]);
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") {
      throw new Error("Can only reject pending requests");
    }

    await ctx.db.patch(args.id, {
      status: "rejected",
      reviewedBy: userId,
      reviewedAt: Date.now(),
      reviewNote: args.note,
    });

    await ctx.db.insert("notifications", {
      userId: request.employeeId,
      type: "request_rejected",
      message: `Your ${request.leaveType} leave (${request.startDate} to ${request.endDate}) was rejected${args.note ? `: ${args.note}` : ""}`,
      relatedRequestId: args.id,
      isRead: false,
    });
  },
});

export const toggleConfidential = mutation({
  args: { id: v.id("vacationRequests") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Request not found");
    await ctx.db.patch(args.id, {
      isConfidential: !request.isConfidential,
    });
  },
});

export const listMine = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    const year = args.year || new Date().getFullYear();
    const requests = await ctx.db
      .query("vacationRequests")
      .withIndex("by_employee_year", (q) =>
        q.eq("employeeId", userId).eq("year", year)
      )
      .collect();

    const result = [];
    for (const req of requests) {
      const replacement = req.replacementId
        ? await ctx.db.get(req.replacementId)
        : null;
      const reviewer = req.reviewedBy
        ? await ctx.db.get(req.reviewedBy)
        : null;
      result.push({ ...req, replacement, reviewer });
    }
    return result;
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireRole(ctx, ["admin", "manager"]);

    let requests = await ctx.db
      .query("vacationRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    if (user.role === "manager" && user.departmentId) {
      const deptUsers = await ctx.db
        .query("users")
        .withIndex("by_department", (q) =>
          q.eq("departmentId", user.departmentId!)
        )
        .collect();
      const deptUserIds = new Set(deptUsers.map((u) => u._id));
      requests = requests.filter((r) => deptUserIds.has(r.employeeId));
    }

    const result = [];
    for (const req of requests) {
      const employee = await ctx.db.get(req.employeeId);
      const replacement = req.replacementId
        ? await ctx.db.get(req.replacementId)
        : null;
      result.push({ ...req, employee, replacement });
    }
    return result;
  },
});

export const listAll = query({
  args: {
    year: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const year = args.year || new Date().getFullYear();

    let requests = await ctx.db
      .query("vacationRequests")
      .withIndex("by_year", (q) => q.eq("year", year))
      .collect();

    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }

    const result = [];
    for (const req of requests) {
      const employee = await ctx.db.get(req.employeeId);
      const replacement = req.replacementId
        ? await ctx.db.get(req.replacementId)
        : null;
      result.push({ ...req, employee, replacement });
    }
    return result;
  },
});

export const listVisible = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { userId, user } = await requireAuth(ctx);
    const year = args.year || new Date().getFullYear();

    const requests = await ctx.db
      .query("vacationRequests")
      .withIndex("by_year", (q) => q.eq("year", year))
      .filter((q) => q.neq(q.field("status"), "rejected"))
      .collect();

    const visible =
      user.role === "employee"
        ? requests.filter(
            (r) => !r.isConfidential || r.employeeId === userId
          )
        : requests;

    const result = [];
    for (const req of visible) {
      const employee = await ctx.db.get(req.employeeId);
      const replacement = req.replacementId
        ? await ctx.db.get(req.replacementId)
        : null;
      result.push({ ...req, employee, replacement });
    }
    return result;
  },
});

export const checkOverlap = query({
  args: {
    replacementId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const replacementRequests = await ctx.db
      .query("vacationRequests")
      .withIndex("by_employee_year", (q) =>
        q.eq("employeeId", args.replacementId).eq("year", args.year)
      )
      .filter((q) => q.neq(q.field("status"), "rejected"))
      .collect();

    for (const req of replacementRequests) {
      if (detectOverlap(args.startDate, args.endDate, req.startDate, req.endDate)) {
        return {
          hasOverlap: true,
          conflictingRequest: req,
        };
      }
    }
    return { hasOverlap: false, conflictingRequest: null };
  },
});

export const getYearSummary = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const year = args.year || new Date().getFullYear();

    const requests = await ctx.db
      .query("vacationRequests")
      .withIndex("by_year", (q) => q.eq("year", year))
      .collect();

    const activeUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const approved = requests.filter((r) => r.status === "approved");
    const pending = requests.filter((r) => r.status === "pending");
    const totalDaysUsed = approved.reduce((sum, r) => sum + r.daysUsed, 0);
    const totalAllowance = activeUsers.reduce(
      (sum, u) => sum + u.annualAllowance,
      0
    );

    // Count by leave type
    const byLeaveType: Record<string, number> = {};
    for (const req of requests.filter((r) => r.status !== "rejected")) {
      byLeaveType[req.leaveType] = (byLeaveType[req.leaveType] || 0) + 1;
    }

    let overlapsFound = 0;
    for (const req of requests.filter((r) => r.status !== "rejected" && r.replacementId)) {
      const replacementRequests = requests.filter(
        (r2) =>
          r2.employeeId === req.replacementId &&
          r2.status !== "rejected" &&
          r2._id !== req._id
      );
      for (const repReq of replacementRequests) {
        if (detectOverlap(req.startDate, req.endDate, repReq.startDate, repReq.endDate)) {
          overlapsFound++;
          break;
        }
      }
    }

    return {
      totalEmployees: activeUsers.filter((u) => u.role === "employee" || u.role === "manager").length,
      totalApproved: approved.length,
      totalPending: pending.length,
      totalRejected: requests.filter((r) => r.status === "rejected").length,
      totalDaysUsed,
      avgDaysPerPerson:
        activeUsers.length > 0
          ? Math.round((totalDaysUsed / activeUsers.length) * 10) / 10
          : 0,
      totalAllowance,
      overlapsFound,
      byLeaveType,
    };
  },
});
