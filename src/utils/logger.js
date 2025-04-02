import winston from "winston";

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
    new winston.transports.File({ filename: "logs/combined.log" }) // All logs
  ]
});

export default logger;
