import Agenda from "agenda";
import config from "../config/db.config.js";

import { sendBirthdayEmail } from "../controllers/mailer.controller.js";

/*
 * Agenda service for scheduling and managing jobs
 * @module services/agenda.service
 */
const agenda = new Agenda({
  db: {
    address: config.DB_URL,
    collection: "agendaJobs",
  },
  maxConcurrency: 20,
});

// Define a job to send an email

/*
 * Schedule an email job
 * @param {string} email - The recipient's email address
 * @param {string} recipient - The recipient's name
 * @param {Date} date - The date and time to send the email
 */
agenda.define("send email", async (job) => {
  const { email, recipient } = job.attrs.data;
  try {
    await sendBirthdayEmail(email, "Happy Birthday!", recipient);
    console.log(`Email sent to ${recipient} at ${new Date()}`);
  } catch (error) {
    console.error(`Failed to send email to ${recipient}:`, error);
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