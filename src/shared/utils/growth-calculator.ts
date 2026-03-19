/**
 * Calculate projected future value using compound interest.
 * futureValue = presentValue × (1 + annualReturn)^years
 */
export function calculateGrowth(
  amount: number,
  annualReturn: number,
  years: number
): number {
  return amount * Math.pow(1 + annualReturn, years);
}

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
