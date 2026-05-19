// src/lib/logger.js
import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";

mkdirSync("logs", { recursive: true });

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const COLORS = { debug: "\x1b[36m", info: "\x1b[32m", warn: "\x1b[33m", error: "\x1b[31m" };
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

const logFile = createWriteStream(join("logs", `agent-${new Date().toISOString().slice(0,10)}.log`), { flags: "a" });

function log(level, prefix, message, data) {
  const ts = new Date().toISOString();
  const color = COLORS[level] || "";
  const icon = { debug: "🔍", info: "✦", warn: "⚠", error: "✗" }[level] || "·";

  const meta = data ? ` ${JSON.stringify(data)}` : "";
  const line = `[${ts}] [${level.toUpperCase()}] [${prefix}] ${message}${meta}`;
  const colored = `${color}${icon} ${BOLD}[${prefix}]${RESET}${color} ${message}${RESET}${meta ? ` \x1b[90m${meta}\x1b[0m` : ""}`;

  console.log(colored);
  logFile.write(line + "\n");
}

export function createLogger(prefix) {
  return {
    debug: (msg, data) => log("debug", prefix, msg, data),
    info:  (msg, data) => log("info",  prefix, msg, data),
    warn:  (msg, data) => log("warn",  prefix, msg, data),
    error: (msg, data) => log("error", prefix, msg, data),
  };
}

export const logger = createLogger("SYSTEM");
