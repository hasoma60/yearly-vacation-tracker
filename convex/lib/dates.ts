/**
 * UAE Labor Law date calculations.
 *
 * UAE expat labor law: Annual leave is counted in CALENDAR DAYS
 * (including weekends AND public holidays).
 */

/**
 * Calculate calendar days between two dates (inclusive).
 * UAE: All calendar days count, including weekends and public holidays.
 */
export function calculateCalendarDays(
  startDateStr: string,
  endDateStr: string
): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) return 0;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}

/**
 * Calculate UAE annual leave entitlement based on service length.
 * - Less than 6 months: 0 days
 * - 6 months to 1 year: 2 days per month of service
 * - 1 year or more: 30 calendar days
 */
export function calculateAnnualEntitlement(
  joinDateStr: string,
  currentYear: number = new Date().getFullYear()
): number {
  const joinDate = new Date(joinDateStr);
  const yearEnd = new Date(currentYear, 11, 31);
  const monthsOfService = Math.floor(
    (yearEnd.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  if (monthsOfService < 6) return 0;
  if (monthsOfService < 12) return monthsOfService * 2;
  return 30;
}

/**
 * Calculate leave salary per UAE labor law.
 * When taking leave: (Basic Salary + Fixed Allowances) / 30 * Leave Days
 * When encashing (termination): Basic Salary / 30 * Unused Days
 */
export function calculateLeaveSalary(
  basicSalary: number,
  fixedAllowances: number,
  leaveDays: number,
  isEncashment: boolean = false
): { basicAmount: number; allowancesAmount: number; totalAmount: number } {
  if (isEncashment) {
    const dailyRate = basicSalary / 30;
    const totalAmount = Math.round(dailyRate * leaveDays * 100) / 100;
    return { basicAmount: totalAmount, allowancesAmount: 0, totalAmount };
  }

  const dailyBasic = basicSalary / 30;
  const dailyAllowances = fixedAllowances / 30;
  const basicAmount = Math.round(dailyBasic * leaveDays * 100) / 100;
  const allowancesAmount =
    Math.round(dailyAllowances * leaveDays * 100) / 100;
  const totalAmount = Math.round((basicAmount + allowancesAmount) * 100) / 100;
  return { basicAmount, allowancesAmount, totalAmount };
}

/**
 * Check if two date ranges overlap.
 */
export function detectOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA <= endB && startB <= endA;
}

/**
 * UAE leave type configurations with pay rules.
 */
export const LEAVE_TYPE_CONFIG = {
  annual: {
    label: "Annual Leave",
    maxDays: 30,
    payRule: "Full pay (basic + allowances)",
  },
  sick: {
    label: "Sick Leave",
    maxDays: 90,
    payRule: "15 days full → 30 days half → 45 days unpaid",
  },
  maternity: {
    label: "Maternity Leave",
    maxDays: 60,
    payRule: "45 days full pay + 15 days half pay",
  },
  paternity: {
    label: "Paternity Leave",
    maxDays: 5,
    payRule: "Full pay (within 6 months of birth)",
  },
  bereavement: {
    label: "Bereavement Leave",
    maxDays: 5,
    payRule: "5 days (spouse) or 3 days (family)",
  },
  hajj: {
    label: "Hajj Leave",
    maxDays: 30,
    payRule: "Unpaid (once per employment)",
  },
  unpaid: {
    label: "Unpaid Leave",
    maxDays: 365,
    payRule: "No pay",
  },
};
