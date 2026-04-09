import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);
    let department = null;
    if (user.departmentId) {
      department = await ctx.db.get(user.departmentId);
    }
    return { ...user, department };
  },
});

export const listEmployees = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("manager"),
        v.literal("employee"),
        v.literal("accounts")
      )
    ),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    let users;
    if (args.departmentId) {
      users = await ctx.db
        .query("users")
        .withIndex("by_department", (q) =>
          q.eq("departmentId", args.departmentId!)
        )
        .collect();
    } else if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    if (args.activeOnly !== false) {
      users = users.filter((u) => u.isActive);
    }

    const departments = await ctx.db.query("departments").collect();
    const deptMap = new Map(departments.map((d) => [d._id, d]));

    return users.map((u) => ({
      ...u,
      department: u.departmentId ? deptMap.get(u.departmentId) : null,
    }));
  },
});

export const listByDepartment = query({
  args: { departmentId: v.id("departments"), excludeUserId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const users = await ctx.db
      .query("users")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    if (args.excludeUserId) {
      return users.filter((u) => u._id !== args.excludeUserId);
    }
    return users;
  },
});

export const createEmployee = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("employee"),
      v.literal("accounts")
    ),
    departmentId: v.optional(v.id("departments")),
    annualAllowance: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing) {
      throw new Error("An employee with this email already exists");
    }

    return await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      role: args.role,
      departmentId: args.departmentId,
      annualAllowance: args.annualAllowance,
      isActive: true,
    });
  },
});

export const updateEmployee = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("manager"),
        v.literal("employee"),
        v.literal("accounts")
      )
    ),
    departmentId: v.optional(v.id("departments")),
    annualAllowance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deactivateEmployee = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.patch(args.id, { isActive: false });
  },
});

export const reactivateEmployee = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.patch(args.id, { isActive: true });
  },
});
