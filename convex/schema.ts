import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
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
    isActive: v.boolean(),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_department", ["departmentId"])
    .index("by_role", ["role"]),

  departments: defineTable({
    name: v.string(),
    headId: v.optional(v.id("users")),
  }).index("by_name", ["name"]),

  vacationRequests: defineTable({
    employeeId: v.id("users"),
    periodNumber: v.union(v.literal(1), v.literal(2)),
    startDate: v.string(),
    endDate: v.string(),
    daysUsed: v.number(),
    replacementId: v.optional(v.id("users")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNote: v.optional(v.string()),
    isConfidential: v.boolean(),
    year: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_employee_year", ["employeeId", "year"])
    .index("by_status", ["status"])
    .index("by_year", ["year"]),

  leaveSalary: defineTable({
    vacationRequestId: v.id("vacationRequests"),
    employeeId: v.id("users"),
    amount: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("released")),
    releasedBy: v.optional(v.id("users")),
    releasedAt: v.optional(v.number()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"])
    .index("by_request", ["vacationRequestId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("request_submitted"),
      v.literal("request_approved"),
      v.literal("request_rejected"),
      v.literal("salary_released")
    ),
    message: v.string(),
    relatedRequestId: v.optional(v.id("vacationRequests")),
    isRead: v.boolean(),
  }).index("by_user_unread", ["userId", "isRead"]),
});
