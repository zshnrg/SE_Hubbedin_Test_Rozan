import agenda from "../services/agenda.service.js";
import logger from "../utils/logger.js";
import { isLeapYear } from "../utils/date.js";

/**
 * Schedule a birthday email job
 * @param {string} email - The email address to send the email to
 * @param {string} recipient - The name of the recipient
 * @param {Date} birthday - The date and time to send the email
 * @returns {object} - The scheduled job
 */

export const scheduleBirthdayEmail = async (email, recipient, birthday) => {

  // Check if the date is valid on leap year birthdays
  const isLeapBirthday = ( isLeapYear(birthday.getFullYear()) ) && birthday.getDate() === 29 && birthday.getMonth() === 1;

  // Set year to the current year
  const birthdayDate = new Date( new Date(birthday).setFullYear( new Date(2028,4,5).getFullYear() ) )
  if (birthdayDate < new Date(2028,4,5)) {
    // If the birthday date is in the past, set it to next year
    birthdayDate.setFullYear(birthdayDate.getFullYear() + 1);
  }

  // Check if the birthday date is valid on leap year birthdays
  if (isLeapBirthday && !isLeapYear(birthdayDate.getFullYear())) {
    birthdayDate.setMonth(1) // February
    birthdayDate.setDate(28); // Set to February 28th
  }

  try {
    const job = await agenda.schedule(birthdayDate, "send birthday", {
      email,
      recipient,
      birthday
    });
    return job;
  } catch (error) {
    logger.error(`Failed to schedule birthday email for ${recipient}:`, error);
    throw new Error(`Failed to schedule email: ${error.message}`);
  }
}

/*
 * Cancel a birthday  email job
 * @param {string} email - The email address to cancel the job for
 * @returns {object} - The canceled job
 */
export const cancelBirthdayEmail = async (email) => {
  try {
    // Delete all jobs for the given email
    const jobs = await agenda.jobs({ "name": "send birthday", "data.email": email });
    if (jobs.length === 0) {
      return null;
    }
    await Promise.all(jobs.map(job => job.remove()));
    return jobs;
  } catch (error) {
    logger.error(`Failed to cancel birthday email job for ${email}:`, error);
    throw new Error(`Failed to cancel email job: ${error.message}`);
  }
}