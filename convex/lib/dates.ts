/**
 * Calculate network days (business days) between two dates, excluding weekends.
 * Similar to Excel's NETWORKDAYS function.
 */
export function calculateNetworkDays(
  startDateStr: string,
  endDateStr: string
): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Check if two date ranges overlap.
 * overlap = (startA <= endB) && (startB <= endA)
 */
export function detectOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA <= endB && startB <= endA;
}
