import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const departments = await ctx.db.query("departments").collect();
    const result = [];
    for (const dept of departments) {
      const head = dept.headId ? await ctx.db.get(dept.headId) : null;
      const employeeCount = (
        await ctx.db
          .query("users")
          .withIndex("by_department", (q) => q.eq("departmentId", dept._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
      ).length;
      result.push({ ...dept, head, employeeCount });
    }
    return result;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    headId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const existing = await ctx.db
      .query("departments")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) {
      throw new Error("A department with this name already exists");
    }
    return await ctx.db.insert("departments", {
      name: args.name,
      headId: args.headId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("departments"),
    name: v.optional(v.string()),
    headId: v.optional(v.id("users")),
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

export const remove = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const employees = await ctx.db
      .query("users")
      .withIndex("by_department", (q) => q.eq("departmentId", args.id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    if (employees.length > 0) {
      throw new Error(
        "Cannot delete department with active employees. Reassign them first."
      );
    }
    await ctx.db.delete(args.id);
  },
});
