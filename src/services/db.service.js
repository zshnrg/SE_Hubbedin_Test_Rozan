import mongoose from "mongoose";
import config from "../config/db.config.js";

/**
 * MongoDB connection service
 * @module services/db.service
 */

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

let retries = 0;

/**
 * Connect to MongoDB with retry logic
 * @function connectWithRetry
 * @returns {Promise<void>} - A promise that resolves when the connection is successful
 * @throws {Error} - Throws an error if the connection fails after max retries
 * @description This function attempts to connect to MongoDB and retries if the connection fails.
 */
const connectWithRetry = async () => {
  console.log("MongoDB connection with retry");
  mongoose
    .connect(config.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB is connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      if (retries < MAX_RETRIES) {
        retries++;
        setTimeout(connectWithRetry, RETRY_DELAY);
      } else {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
    });
}

const closeConnection = async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

export { mongoose as db, connectWithRetry, closeConnection };