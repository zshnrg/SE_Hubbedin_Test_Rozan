import winston from "winston";

// Determine log file based on environment
const isTestEnv = process.env.NODE_ENV === "test";
const logFile = isTestEnv ? "logs/test.log" : "logs/combined.log";

// Define logger
const logger = winston.createLogger({
  level: "info", // Log level (error, warn, info, debug)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Store logs in JSON format
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Error logs
    new winston.transports.File({ filename: logFile }) // All logs (or test logs)
  ]
});

export default logger;
