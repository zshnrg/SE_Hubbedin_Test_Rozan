import { scheduleBirthdayEmail, cancelBirthdayEmail } from "../src/controllers/agenda.controller.js";
import agenda from "../src/services/agenda.service.js";
import { connectWithRetry, closeConnection } from '../src/services/db.service.js';

describe("Agenda Controller", () => {
  beforeAll(async () => {
    await connectWithRetry(); // Ensure DB connection is established
    await agenda.start(); // Start Agenda service
  });

  afterAll(async () => {
    await agenda.stop(); // Stop Agenda service
    await closeConnection(); // Close DB connection
  });

  beforeEach(async () => {
    await agenda.cancel({}); // Clear all jobs before each test
  });

  test("should schedule an email successfully", async () => {
    const birthday = new Date(Date.now() + 10000); // Schedule for 10 seconds in the future
    const job = await scheduleBirthdayEmail("test@example.com", "John Doe", birthday);

    expect(job).toBeDefined();
    expect(job.attrs.name).toBe("send birthday");
    expect(job.attrs.data).toEqual({
      email: "test@example.com",
      recipient: "John Doe",
      birthday: birthday
    });

    // Verify job exists in DB
    const scheduledJobs = await agenda.jobs({});
    expect(scheduledJobs.length).toBe(1);
  });

  test("should cancel scheduled email job", async () => {
    const birthday = new Date(Date.now() + 10000); // Schedule for 10 seconds in the future
    await scheduleBirthdayEmail("test@example.com", "John Doe", birthday);

    const canceledJobs = await cancelBirthdayEmail("test@example.com");
    expect(canceledJobs).toHaveLength(1);

    // Verify no jobs exist after cancellation
    const remainingJobs = await agenda.jobs({});
    expect(remainingJobs.length).toBe(0);
  });

  test("should return null if no job exists for email", async () => {
    const result = await cancelBirthdayEmail("nonexistent@example.com");
    expect(result).toBeNull();
  });
});
