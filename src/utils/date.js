/**
 * Determines whether a given year is a leap year.
 *
 * A year is a leap year if it is divisible by 4 but not divisible by 100,
 * unless it is also divisible by 400.
 *
 * @param {number} year - The year to check.
 * @returns {boolean} True if the year is a leap year, otherwise false.
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};