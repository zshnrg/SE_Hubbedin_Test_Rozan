import Agenda from "agenda";
import config from "../config/db.config.js";

import { sendBirthdayEmail } from "../controllers/mailer.controller.js";
import { isLeapYear } from "../utils/date.js";

/*
 * Agenda service for scheduling and managing jobs
 * @module services/agenda.service
 */
const agenda = new Agenda({
  db: {
    address: config.DB_URL,
    collection: "agendaJobs",
  },
  processEvery: "30 minute", // Agenda will check for jobs every 30 minutes because the smallest timezone difference is 30 minutes. It can be changed to 1 minute if needed for other jobs.
  maxConcurrency: 20, // Set the maximum number of concurrent jobs to 20 to avoid overwhelming the server and the email service
});

// Define a job to send an email

/*
 * Schedule an email job
 * @param {string} email - The recipient's email address
 * @param {string} recipient - The recipient's name
 * @param {Date} date - The date and time to send the email
 */
agenda.define("send birthday", async (job, done) => {
  const { email, recipient, birthday } = job.attrs.data;
  try {
    // Send the birthday email
    await sendBirthdayEmail(email, "Happy Birthday!", recipient);
    
    // If successful, schedule for next year
    const nextBirthdayDate = new Date(birthday);
    nextBirthdayDate.setFullYear(new Date().getFullYear() + 1); // Set to next year

    // Check if birthday is 29th February and the next year is not a leap year
    if (birthday.getDate() === 29 && birthday.getMonth() === 1 && !isLeapYear(nextBirthdayDate.getFullYear())) {
      nextBirthdayDate.setMonth(1); // February
      nextBirthdayDate.setDate(28); // Set to February 28th
    }

    job.attrs.nextRunAt = nextBirthdayDate; // Set the next run date to the next birthday date
    
    await job.save();
  } catch (error) {
    console.error(`Failed to send birthday to ${recipient}:`, error);

    // Retry the job after 5 minutes
    const retryDate = new Date();
    retryDate.setMinutes(retryDate.getMinutes() + 5);
    job.attrs.nextRunAt = retryDate;

    await job.save();
  }
});

// Start the Agenda instance
agenda.on("ready", () => {
  agenda.start();
});

agenda.on("error", (error) => {
  console.error("Agenda error:", error);
});

export default agenda;