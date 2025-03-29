import mongoose from "mongoose";
import config from "../config/db.config.js";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

let retries = 0;

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

export { mongoose as db, connectWithRetry };