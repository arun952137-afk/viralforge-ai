// src/services/notifications.js
// Sends Telegram alerts so you know when the agent posts, fails, or detects features.

import axios from "axios";
import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("NOTIF");

export async function notifyTelegram(message) {
  if (!config.telegram.botToken || !config.telegram.chatId) return;
  try {
    await axios.post(
      `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
      {
        chat_id: config.telegram.chatId,
        text: `🤖 *Creova Agent*\n\n${message}`,
        parse_mode: "Markdown",
      },
      { timeout: 5000 }
    );
  } catch (e) {
    log.warn("Telegram notify failed", e.message);
  }
}

export async function notifyAgentStarted() {
  await notifyTelegram(`🟢 Agent started\nTime: ${new Date().toLocaleString("en-IN", { timeZone: config.agent.timezone })}`);
}

export async function notifyPostFailed(platform, reason) {
  await notifyTelegram(`❌ Post FAILED on ${platform}\nReason: ${reason}`);
}

export async function notifyQCRejected(hook, score) {
  await notifyTelegram(`🚫 QC REJECTED\nScore: ${score}/100\nHook: "${hook}"`);
}

export async function notifyFeatureDetected(feature) {
  await notifyTelegram(`🚀 New feature detected!\n\n*${feature.featureTitle}*\n${feature.announcement}`);
}
