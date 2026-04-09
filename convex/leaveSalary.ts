import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./lib/auth";

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "accounts"]);
    const records = await ctx.db
      .query("leaveSalary")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const result = [];
    for (const rec of records) {
      const employee = await ctx.db.get(rec.employeeId);
      const request = await ctx.db.get(rec.vacationRequestId);
      result.push({ ...rec, employee, request });
    }
    return result;
  },
});

export const listReleased = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "accounts"]);
    const records = await ctx.db
      .query("leaveSalary")
      .withIndex("by_status", (q) => q.eq("status", "released"))
      .collect();

    const result = [];
    for (const rec of records) {
      const employee = await ctx.db.get(rec.employeeId);
      const request = await ctx.db.get(rec.vacationRequestId);
      const releasedByUser = rec.releasedBy
        ? await ctx.db.get(rec.releasedBy)
        : null;
      result.push({ ...rec, employee, request, releasedByUser });
    }
    return result;
  },
});

export const listByEmployee = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "accounts"]);
    const records = await ctx.db
      .query("leaveSalary")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    const result = [];
    for (const rec of records) {
      const request = await ctx.db.get(rec.vacationRequestId);
      result.push({ ...rec, request });
    }
    return result;
  },
});

export const release = mutation({
  args: {
    id: v.id("leaveSalary"),
    // Override amounts if needed
    totalAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, ["admin", "accounts"]);
    const record = await ctx.db.get(args.id);
    if (!record) throw new Error("Record not found");
    if (record.status === "released") {
      throw new Error("Already released");
    }

    await ctx.db.patch(args.id, {
      status: "released",
      totalAmount: args.totalAmount ?? record.totalAmount,
      releasedBy: userId,
      releasedAt: Date.now(),
    });

    // Notify employee
    const request = await ctx.db.get(record.vacationRequestId);
    const displayAmount = args.totalAmount ?? record.totalAmount;
    await ctx.db.insert("notifications", {
      userId: record.employeeId,
      type: "salary_released",
      message: `Your leave salary${displayAmount ? ` of AED ${displayAmount.toLocaleString()}` : ""} for leave (${request?.startDate} to ${request?.endDate}) has been released`,
      relatedRequestId: record.vacationRequestId,
      isRead: false,
    });
  },
});
