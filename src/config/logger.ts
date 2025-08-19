import fs from "fs";
import path from "path";

export type LogLevel = "debug" | "info" | "warn" | "error";
const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  setLevel(level: LogLevel): void;
}

export class SimpleLogger implements ILogger {
  private minLevel: LogLevel = "debug";
  private colors: Record<LogLevel, string> = {
    debug: "36",
    info: "32",
    warn: "33",
    error: "31",
  };
  private jsonPath = path.join(__dirname, "logs.json");

  setLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ) {
    if (levels[level] < levels[this.minLevel]) return;
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, meta: meta || null };

    console.log(
      `\x1b[${this.colors[level]}m[${timestamp}] [${level}] - ${message}${
        meta ? " " + JSON.stringify(meta) : ""
      }\x1b[0m`
    );
    fs.appendFileSync(this.jsonPath, JSON.stringify(entry) + "\n");
  }

  // TS מזהה שהפונקציות קיימות
  debug(message: string, meta?: Record<string, unknown>) {
    this.log("debug", message, meta);
  }
  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  }
  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  }
  error(message: string, meta?: Record<string, unknown>) {
    this.log("error", message, meta);
  }
}


export const logger: ILogger = new SimpleLogger();

// import winston from "winston"; // Import Winston logging library
// import path from "path"; // Import path module to handle file paths

// const logDir = "logs"; // Directory to store log files

// export const logger = winston.createLogger({
//   level: "debug", // Capture all levels: debug, info, warn, error
//   transports: [
//     // --- Console transport ---
//     // Prints colored logs in terminal
//     new winston.transports.Console({
//       format: winston.format.combine(
//         // Add timestamp in Israel timezone
//         winston.format.timestamp({
//           format: () =>
//             new Date().toLocaleString("en-IL", { timeZone: "Asia/Jerusalem" }),
//         }),
//         winston.format.colorize({ all: true }), // Add colors based on log level
//         winston.format.printf(({ timestamp, level, message }) => {
//           // Output format for console: [timestamp] [LEVEL] - message
//           return `[${timestamp}] [${level}] - ${message}`;
//         })
//       ),
//     }),

//     // --- File transport ---
//     // Save logs to file as clean JSON (no color codes)
//     new winston.transports.File({
//       filename: path.join(logDir, "log.json"),
//       format: winston.format.combine(
//         winston.format.timestamp({
//           format: () =>
//             new Date().toLocaleString("en-IL", { timeZone: "Asia/Jerusalem" }),
//         }),
//         winston.format.json() // Output JSON structure: { timestamp, level, message }
//       ),
//     }),
//   ],
// });

// // +-------------------+
// // |   Application     |
// // |  (calls logger)   |
// // +-------------------+
// //            |
// //            v
// // +-------------------+
// // |      Logger       |
// // | (level, format)   |
// // +-------------------+
// //            |
// //            v
// // +-------------------+
// // | Format LogEntry   |
// // | (timestamp, level,|
// // | message, meta)    |
// // +-------------------+
// //            |
// //            v
// // +-------------------+
// // |   Transports      |
// // |-------------------|
// // | Console           |
// // | File (JSON)       |
// // | MongoDB           |
// // | Elasticsearch     |
// // +-------------------+
// //    |       |       |       |
// //    v       v       v       v
// // [Console] [File] [MongoDB] [Elasticsearch]
// //  (colored) (JSON) (DB)      (Index)
