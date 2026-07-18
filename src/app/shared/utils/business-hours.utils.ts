/**
 * Business hours utility for calculating end dates based on working hours.
 *
 * Business hours: Monday to Friday, 08:00 - 17:00 (Colombian time).
 * Weekends are skipped entirely.
 *
 * This is a pure function with no dependencies — suitable for both
 * frontend previews and backend validation.
 */

export interface BusinessHoursConfig {
  /** Total business hours to add (can be fractional, e.g. 1.5) */
  totalHours: number;
  /** Starting date/time for the calculation */
  startDateTime: Date;
  /** Business day start hour (default: 8) */
  dayStartHour?: number;
  /** Business day end hour (default: 17) */
  dayEndHour?: number;
}

export interface BusinessHoursResult {
  /** The calculated end date/time */
  endDate: Date;
  /** Total business hours consumed */
  totalHoursConsumed: number;
}

/**
 * Calculate the end date/time by adding business hours to a start date.
 *
 * Business rules:
 * - Working hours: Monday–Friday, 08:00–17:00 (9-hour window, 8 effective hours)
 * - Saturdays and Sundays are completely skipped
 * - If the start time is before 08:00, the day starts at 08:00
 * - If all hours are consumed within the current day, returns the end time
 * - Otherwise, advances to the next business day at 08:00
 *
 * @param config - Configuration object
 * @returns The calculated end date/time
 *
 * @example
 * ```ts
 * const start = new Date('2026-01-12T08:00:00');
 * const end = calculateBusinessHoursEnd({ totalHours: 16, startDateTime: start });
 * // end is Monday + 8 hours = Tuesday 08:00
 * ```
 */
export function calculateBusinessHoursEnd(config: BusinessHoursConfig): Date {
  const {
    totalHours,
    startDateTime,
    dayStartHour = 8,
    dayEndHour = 17,
  } = config;

  // Guard: no hours or negative → return start as-is
  if (!totalHours || totalHours <= 0) {
    return new Date(startDateTime);
  }

  const current = new Date(startDateTime);
  let hoursRemaining = totalHours;

  while (hoursRemaining > 0) {
    const dayOfWeek = current.getDay();

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Jump to next Monday at day start
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
      current.setDate(current.getDate() + daysUntilMonday);
      current.setHours(dayStartHour, 0, 0, 0);
      continue;
    }

    // Calculate the effective day window
    const dayStart = new Date(current);
    const dayEnd = new Date(current);
    dayEnd.setHours(dayEndHour, 0, 0, 0);

    // If current time is before business start, adjust
    if (current.getHours() < dayStartHour) {
      dayStart.setHours(dayStartHour, 0, 0, 0);
    }

    const availableMs = dayEnd.getTime() - dayStart.getTime();
    const availableHours = availableMs / (1000 * 60 * 60);

    // No available hours left in this day
    if (availableHours <= 0) {
      const nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(dayStartHour, 0, 0, 0);
      current.setTime(nextDay.getTime());
      continue;
    }

    // Can we finish within this day?
    if (hoursRemaining <= availableHours) {
      const endMs = current.getTime() + hoursRemaining * 60 * 60 * 1000;
      return new Date(endMs);
    }

    // Consume today, move to next day
    hoursRemaining -= availableHours;
    const nextDay = new Date(current);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(dayStartHour, 0, 0, 0);
    current.setTime(nextDay.getTime());
  }

  return new Date(current);
}
