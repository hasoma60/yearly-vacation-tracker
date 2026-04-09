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
    // UAE Labor Law: 30 calendar days after 1 year of service,
    // 2 days/month for 6-12 months service
    annualAllowance: v.number(),
    // Join date for service length calculation (UAE labor law entitlement)
    joinDate: v.optional(v.string()),
    // Basic salary for leave salary calculation (UAE: basic + fixed allowances)
    basicSalary: v.optional(v.number()),
    // Fixed allowances (housing, transport) added to leave salary
    fixedAllowances: v.optional(v.number()),
    // Max 15 days carry-forward per UAE law
    carryForwardDays: v.optional(v.number()),
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
    // UAE labor law leave types
    leaveType: v.union(
      v.literal("annual"),        // 30 calendar days/year (after 1yr service)
      v.literal("sick"),          // 90 days: 15 full + 30 half + 45 unpaid
      v.literal("maternity"),     // 60 days: 45 full + 15 half pay
      v.literal("paternity"),     // 5 working days within 6 months of birth
      v.literal("bereavement"),   // 5 days (spouse) or 3 days (family)
      v.literal("hajj"),          // Up to 30 days unpaid, once per employment
      v.literal("unpaid")         // Unpaid leave
    ),
    periodNumber: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
    startDate: v.string(),
    endDate: v.string(),
    // UAE: Calendar days (including weekends), not business days
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
    // UAE: Leave salary = (Basic + Fixed Allowances) / 30 * Leave Days
    basicAmount: v.optional(v.number()),
    allowancesAmount: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
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
