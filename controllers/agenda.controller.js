import agenda from "../services/agenda.service.js";

/**
 * Schedule an email job
 * @param {string} email - The email address to send the email to
 * @param {string} recipient - The name of the recipient
 * @param {Date} sendAt - The date and time to send the email
 * @returns {object} - The scheduled job
 */
export const scheduleEmail = async (email, recipient, sendAt) => {
  try {
    const job = await agenda.schedule(sendAt, "send email", {
      email,
      recipient,
    });
    return job;
  } catch (error) {
    throw new Error(`Failed to schedule email: ${error.message}`);
  }
}

/*
 * Cancel an email job
 * @param {string} email - The email address to cancel the job for
 * @returns {object} - The canceled job
 */
export const cancelEmail = async (email) => {
  try {
    // Delete all jobs for the given email
    const jobs = await agenda.jobs({ "data.email": email });
    if (jobs.length === 0) {
      return null;
    }
    await Promise.all(jobs.map(job => job.remove()));
    return jobs;
  } catch (error) {
    throw new Error(`Failed to cancel email job: ${error.message}`);
  }
}