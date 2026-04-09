import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "../_generated/dataModel";

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  const user = await ctx.db.get(userId);
  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }
  return { userId, user };
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Doc<"users">["role"][]
) {
  const { userId, user } = await requireAuth(ctx);
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Access denied. Required roles: ${allowedRoles.join(", ")}`
    );
  }
  return { userId, user };
}
