import { query } from "./_generated/server";
import { requireAuth } from "./lib/auth";

export const getMyBalance = query({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireAuth(ctx);
    const year = new Date().getFullYear();

    const requests = await ctx.db
      .query("vacationRequests")
      .withIndex("by_employee_year", (q) =>
        q.eq("employeeId", userId).eq("year", year)
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "rejected"),
          q.eq(q.field("leaveType"), "annual")
        )
      )
      .collect();

    const totalUsed = requests
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + r.daysUsed, 0);

    const pendingDays = requests
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + r.daysUsed, 0);

    // UAE: max 15 days carry-forward
    const carryForward = Math.min(user.carryForwardDays || 0, 15);

    return {
      allowance: user.annualAllowance,
      carryForward,
      used: totalUsed,
      pending: pendingDays,
      remaining: user.annualAllowance + carryForward - totalUsed,
      requests,
    };
  },
});
