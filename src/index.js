// src/index.js
// CREOVA GROWTH AGENT — Entry Point
// All commands callable from GitHub Actions — no server needed.

import { createLogger } from "./lib/logger.js";
import { config } from "./config/index.js";

const log = createLogger("MAIN");

async function main() {
  const command = process.argv[2] || "start";
  log.info(`▶ Command: ${command}`);

  switch (command) {

    case "post-now": {
      const { triggerNow } = await import("./agent/orchestrator.js");
      const platform = process.argv[3] || "twitter";
      await triggerNow(platform);
      break;
    }

    case "refresh-trends": {
      const { getRecentPosts } = await import("./db/index.js");
      const { runTrendHunter } = await import("./agents/trend-hunter.js");
      const recent = await getRecentPosts(10);
      const trends = await runTrendHunter(recent.map(p => ({ topic: p.topic || "" })));
      log.info(`Refreshed ${trends.length} trends`);
      break;
    }

    case "detect-features": {
      const { detectNewFeatures } = await import("./agents/github-detector.js");
      const features = await detectNewFeatures();
      log.info(`Detected ${features.length} new features`);
      break;
    }

    case "run-learning": {
      const { runLearningCycle } = await import("./agents/analytics-learner.js");
      await runLearningCycle();
      break;
    }

    case "run-engagement": {
      const { runEngagementFarmer } = await import("./agents/engagement-farmer.js");
      await runEngagementFarmer();
      break;
    }

    case "competitor-intel": {
      const { runCompetitorIntel } = await import("./agents/competitor-intel.js");
      await runCompetitorIntel();
      break;
    }

    case "start":
    default: {
      // Traditional daemon mode — only needed if self-hosting on Railway/Render
      const { startOrchestrator } = await import("./agent/orchestrator.js");
      await startOrchestrator();
      log.info("Agent daemon running. Ctrl+C to stop.");
      process.on("SIGINT", () => { log.info("Stopped."); process.exit(0); });
      break;
    }
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
