// src/index.js
// CREOVA GROWTH AGENT — Entry Point
// Start with: node src/index.js

import { createLogger } from "./lib/logger.js";
import { startOrchestrator, triggerNow } from "./agent/orchestrator.js";
import { detectNewFeatures } from "./agents/github-detector.js";
import { config } from "./config/index.js";

const log = createLogger("MAIN");

// ─── STARTUP ─────────────────────────────────────────────────────────────────

async function main() {
  log.info("╔═══════════════════════════════════════════════╗");
  log.info("║   CREOVA GROWTH AGENT v2.0                    ║");
  log.info("║   Autonomous Social Growth Operating System   ║");
  log.info("║   INTERNAL USE ONLY — Creova Studio           ║");
  log.info("╚═══════════════════════════════════════════════╝\n");

  // Parse CLI args
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "post-now":
      // Manual trigger: node src/index.js post-now [twitter|instagram]
      const platform = args[1] || "twitter";
      log.info(`⚡ Manual post trigger for: ${platform}`);
      await triggerNow(platform);
      process.exit(0);
      break;

    case "detect-features":
      // Manually check GitHub for new features
      log.info("🔍 Manual GitHub feature scan...");
      const features = await detectNewFeatures();
      log.info(`Found ${features.length} new features to announce`);
      process.exit(0);
      break;

    case "start":
    default:
      // Normal daemon mode — runs 24/7
      log.info("Starting autonomous agent daemon...");
      await startOrchestrator();
      log.info("Agent is alive and watching. 👁\n");
      // Keep process alive
      process.on("SIGINT", () => {
        log.info("Agent stopped by user.");
        process.exit(0);
      });
      break;
  }
}

main().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
