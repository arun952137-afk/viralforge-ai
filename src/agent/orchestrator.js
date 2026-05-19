// src/agent/orchestrator.js
// ═══════════════════════════════════════════════════════════════════
// THE BRAIN — CREOVA GROWTH AGENT ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════
//
// This is the central nervous system. It coordinates all 7 agents:
//   1. Trend Hunter    → finds what's happening on the internet
//   2. Strategist      → decides what content to create today
//   3. Copywriter      → writes the captions and hooks
//   4. Designer        → generates the visuals
//   5. Quality Review  → gates content before publishing
//   6. Publisher       → posts to Twitter/Instagram
//   7. Analytics       → tracks engagement, feeds learnings back
//
// Runs on a cron schedule. Fully autonomous.
// ═══════════════════════════════════════════════════════════════════

import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
import { config, POSTING_SCHEDULE, BRAND } from "../config/index.js";
import { createLogger } from "../lib/logger.js";

import { runTrendHunter } from "../agents/trend-hunter.js";
import { runStrategist } from "../agents/strategist.js";
import { runCopywriter, generateThread } from "../agents/copywriter.js";
import { runDesigner, downloadImageBuffer, uploadToStorage } from "../agents/designer.js";
import { runQualityReview } from "../agents/quality-reviewer.js";
import { publishToTwitter, publishToInstagram, trackTwitterEngagement, trackInstagramEngagement } from "../agents/publisher.js";
import { detectNewFeatures, getUnAnnouncedFeatures, generateFeatureLaunchPost } from "../agents/github-detector.js";
import { getRecentPosts, getAgentState, setAgentState, getActiveTrends } from "../db/index.js";
import { notifyAgentStarted, notifyTelegram, notifyQCRejected, notifyPostFailed } from "../services/notifications.js";

const log = createLogger("ORCHESTRATOR");

// ─── DAILY CONTENT PIPELINE ──────────────────────────────────────────────────

async function runDailyPipeline(platform) {
  const runId = uuidv4().slice(0, 8);
  log.info(`\n${"═".repeat(60)}`);
  log.info(`[${runId}] 🤖 CREOVA GROWTH AGENT — Daily Pipeline`);
  log.info(`[${runId}] Platform: ${platform.toUpperCase()} | ${new Date().toLocaleString("en-IN", { timeZone: config.agent.timezone })}`);
  log.info(`${"═".repeat(60)}\n`);

  try {
    // ── STEP 0: Check for GitHub feature announcements first ────────
    log.info(`[${runId}] STEP 0: Checking for new features to announce...`);
    const unannounced = await getUnAnnouncedFeatures();
    if (unannounced.length > 0) {
      log.info(`[${runId}] Found ${unannounced.length} unannounced feature(s) — prioritizing launch post`);
      const feature = unannounced[0];
      const launchPost = await generateFeatureLaunchPost(feature, platform);
      if (launchPost) {
        await runPostingFlow({
          runId, platform,
          hook: launchPost.hook,
          caption: launchPost.caption,
          hashtags: launchPost.hashtags,
          contentType: "feature_showcase",
          topic: feature.title,
          imagePrompt: launchPost.imagePrompt,
          isFeaturedLaunch: true,
        });
        return; // Feature launches take the day's slot
      }
    }

    // ── STEP 1: Trend Intelligence ───────────────────────────────────
    log.info(`[${runId}] STEP 1: Trend Hunter scanning...`);
    const recentPosts = await getRecentPosts(20);
    const recentTopics = recentPosts.map(p => ({ topic: p.topic || "" }));

    // Check for cached trends first
    let trends = await getActiveTrends();
    if (trends.length < 3) {
      trends = await runTrendHunter(recentTopics);
    } else {
      log.info(`[${runId}] Using ${trends.length} cached trends`);
    }

    if (trends.length === 0) {
      log.warn(`[${runId}] No trends available — using brand defaults`);
      trends = [{ topic: "AI is transforming how creators work", relevanceScore: 75, contentAngle: `${BRAND.name} leads this transformation`, velocity: "rising" }];
    }

    // ── STEP 2: Strategy Decision ────────────────────────────────────
    log.info(`[${runId}] STEP 2: Strategist deciding...`);
    const strategy = await runStrategist(trends, platform);

    // ── STEP 3: Copy Generation ──────────────────────────────────────
    log.info(`[${runId}] STEP 3: Copywriter generating...`);
    const content = await runCopywriter(strategy, platform);

    // Generate thread for Twitter if high engagement potential
    let threads = null;
    if (platform === "twitter" && strategy.estimatedEngagement === "high") {
      threads = await generateThread(strategy);
    }

    // ── STEP 4: Visual Generation ────────────────────────────────────
    log.info(`[${runId}] STEP 4: Designer creating visual...`);
    const visual = await runDesigner(strategy, content);

    // ── STEP 5: Quality Gate ─────────────────────────────────────────
    log.info(`[${runId}] STEP 5: Quality Reviewer checking...`);
    const draft = {
      id: uuidv4(),
      platform,
      hook: content.chosen.hook,
      caption: content.chosen.caption,
      hashtags: content.chosen.hashtags,
      contentType: strategy.contentType,
      topic: strategy.chosenTrend,
      imageUrl: visual.url,
      imagePrompt: visual.prompt,
      threads,
    };

    const review = await runQualityReview(draft);

    if (!review.approved) {
      log.warn(`[${runId}] ❌ QC REJECTED — score ${review.overallScore} < ${config.agent.minQualityScore}`);
      await notifyQCRejected(draft.hook, review.overallScore);
      await setAgentState({ lastRejection: { platform, reason: review.reviewNote, score: review.overallScore, at: new Date().toISOString() } });
      return;
    }

    // ── STEP 6: Publish ──────────────────────────────────────────────
    await runPostingFlow({ runId, platform, ...review.finalDraft, qualityScore: review.overallScore });

  } catch (e) {
    log.error(`[${runId}] Pipeline FAILED`, e.message);
    await notifyPostFailed(platform, e.message);
    await setAgentState({ lastError: { platform, error: e.message, at: new Date().toISOString() } });
  }
}

async function runPostingFlow({ runId, platform, hook, caption, hashtags, contentType, topic, imageUrl, imagePrompt, threads, qualityScore, isFeaturedLaunch }) {
  log.info(`[${runId}] STEP 6: Publishing to ${platform.toUpperCase()}...`);

  // Download image buffer for upload
  let imageBuffer = null;
  let finalImageUrl = imageUrl;
  if (imageUrl) {
    imageBuffer = await downloadImageBuffer(imageUrl);
    // Upload to R2 for permanent URL
    if (imageBuffer) {
      const filename = `${contentType}-${Date.now()}.png`;
      const r2Url = await uploadToStorage(imageBuffer, filename);
      if (r2Url) finalImageUrl = r2Url;
    }
  }

  const postData = { hook, caption, hashtags, contentType, topic, imageUrl: finalImageUrl, imageBuffer, imagePrompt, threads, qualityScore: qualityScore || 80, scheduledAt: new Date().toISOString() };

  let result;
  if (platform === "twitter") {
    result = await publishToTwitter(postData);
  } else if (platform === "instagram") {
    result = await publishToInstagram(postData);
  }

  if (result?.success) {
    log.info(`[${runId}] ✅ PUBLISHED SUCCESSFULLY — ${platform} ${result.postId}`);
    if (result.url) log.info(`[${runId}] URL: ${result.url}`);

    // Update agent state
    const state = await getAgentState();
    await setAgentState({
      totalPostsPublished: (state.totalPostsPublished || 0) + 1,
      lastPost: {
        platform, topic: topic?.slice(0, 60), hook: hook?.slice(0, 60),
        postId: result.postId, publishedAt: new Date().toISOString(),
        score: qualityScore,
      },
    });

    // Schedule analytics check in 24 hours
    scheduleAnalyticsCheck(result.postId, platform, result.postId);
  } else {
    log.error(`[${runId}] ❌ Publish failed: ${result?.error}`);
  }
}

// ─── ANALYTICS SCHEDULER ─────────────────────────────────────────────────────

const pendingAnalytics = new Map();

function scheduleAnalyticsCheck(dbPostId, platform, platformPostId) {
  // Check analytics 24 hours after posting
  const delay = 24 * 60 * 60 * 1000;
  setTimeout(async () => {
    log.info(`Checking analytics for ${platform} post ${platformPostId}`);
    if (platform === "twitter") {
      await trackTwitterEngagement(dbPostId, platformPostId);
    } else if (platform === "instagram") {
      await trackInstagramEngagement(dbPostId, platformPostId);
    }
  }, delay);
}

// ─── CRON SCHEDULE ───────────────────────────────────────────────────────────

export async function startOrchestrator() {
  log.info("\n" + "█".repeat(50));
  log.info("█  CREOVA GROWTH AGENT — STARTING                 █");
  log.info("█  Autonomous social operating system             █");
  log.info("█".repeat(50) + "\n");

  await notifyAgentStarted();

  // Detect GitHub features every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    log.info("🔍 Scheduled GitHub feature scan...");
    await detectNewFeatures();
  }, { timezone: config.agent.timezone });

  // Twitter posts — 3x per day
  for (const slot of POSTING_SCHEDULE.twitter) {
    cron.schedule(`${slot.minute} ${slot.hour} * * *`, async () => {
      log.info(`⏰ Twitter posting slot: ${slot.hour}:${String(slot.minute).padStart(2,"0")}`);
      await runDailyPipeline("twitter");
    }, { timezone: config.agent.timezone });
  }

  // Instagram posts — 3x per day
  for (const slot of POSTING_SCHEDULE.instagram) {
    cron.schedule(`${slot.minute} ${slot.hour} * * *`, async () => {
      log.info(`⏰ Instagram posting slot: ${slot.hour}:${String(slot.minute).padStart(2,"0")}`);
      await runDailyPipeline("instagram");
    }, { timezone: config.agent.timezone });
  }

  // Trend refresh every 3 hours
  cron.schedule("0 */3 * * *", async () => {
    log.info("🔄 Refreshing trend intelligence...");
    const recent = await getRecentPosts(10);
    await runTrendHunter(recent.map(p => ({ topic: p.topic || "" })));
  }, { timezone: config.agent.timezone });

  log.info("✅ All cron jobs scheduled");
  log.info(`📅 Twitter slots: ${POSTING_SCHEDULE.twitter.map(s => `${s.hour}:${String(s.minute).padStart(2,"0")}`).join(", ")} IST`);
  log.info(`📷 Instagram slots: ${POSTING_SCHEDULE.instagram.map(s => `${s.hour}:${String(s.minute).padStart(2,"0")}`).join(", ")} IST`);

  // Run immediately on startup for testing
  if (config.env === "development") {
    log.info("\n🔧 DEV MODE — running test pipeline in 3s...");
    setTimeout(async () => {
      await runDailyPipeline("twitter");
    }, 3000);
  }
}

// ─── MANUAL TRIGGER ─────────────────────────────────────────────────────────
// Call this to run a pipeline immediately without waiting for cron

export async function triggerNow(platform = "twitter") {
  log.info(`⚡ Manual trigger: ${platform}`);
  await runDailyPipeline(platform);
}
