import { scheduleEmail, cancelEmail } from "../src/controllers/agenda.controller.js";
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
    const sendAt = new Date(Date.now() + 10000); // 10 sec in future
    const job = await scheduleEmail("test@example.com", "John Doe", sendAt);

    expect(job).toBeDefined();
    expect(job.attrs.name).toBe("send email");
    expect(job.attrs.data).toEqual({
      email: "test@example.com",
      recipient: "John Doe",
    });

    // Verify job exists in DB
    const scheduledJobs = await agenda.jobs({});
    expect(scheduledJobs.length).toBe(1);
  });

  test("should cancel scheduled email job", async () => {
    const sendAt = new Date(Date.now() + 10000);
    await scheduleEmail("test@example.com", "John Doe", sendAt);

    const canceledJobs = await cancelEmail("test@example.com");
    expect(canceledJobs).toHaveLength(1);

    // Verify no jobs exist after cancellation
    const remainingJobs = await agenda.jobs({});
    expect(remainingJobs.length).toBe(0);
  });

  test("should return null if no job exists for email", async () => {
    const result = await cancelEmail("nonexistent@example.com");
    expect(result).toBeNull();
  });
});
