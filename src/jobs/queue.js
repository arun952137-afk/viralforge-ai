// src/jobs/queue.js
// BullMQ Job Queue — makes the agent reliable.
// Jobs are persisted in Redis. If the process crashes, jobs resume.
// Prevents duplicate posts. Handles retries with backoff.

import { Queue, Worker, QueueEvents } from "bullmq";
import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("QUEUE");

const connection = { url: config.redis.url };

// ─── QUEUES ──────────────────────────────────────────────────────────────────

export const contentQueue = new Queue("content-pipeline", { connection });
export const analyticsQueue = new Queue("analytics-tracker", { connection });
export const engagementQueue = new Queue("engagement-farmer", { connection });
export const learningQueue = new Queue("learning-cycle", { connection });

// ─── JOB TYPES ────────────────────────────────────────────────────────────────

export async function enqueueContentJob(platform, priority = "normal") {
  const jobId = `content-${platform}-${Date.now()}`;
  await contentQueue.add(
    "run-pipeline",
    { platform, triggeredAt: new Date().toISOString() },
    {
      jobId,
      priority: priority === "high" ? 1 : 10,
      attempts: 3,
      backoff: { type: "exponential", delay: 60000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    }
  );
  log.info(`📥 Queued content job: ${jobId}`);
  return jobId;
}

export async function enqueueAnalyticsJob(postId, platform, platformPostId, delayMs = 86400000) {
  await analyticsQueue.add(
    "track-post",
    { postId, platform, platformPostId },
    {
      delay: delayMs, // 24 hours by default
      attempts: 5,
      backoff: { type: "exponential", delay: 3600000 },
    }
  );
}

export async function enqueueEngagementJob(delayMs = 0) {
  await engagementQueue.add(
    "engage",
    { triggeredAt: new Date().toISOString() },
    {
      delay: delayMs,
      attempts: 2,
      backoff: { type: "fixed", delay: 30000 },
    }
  );
}

export async function enqueueLearningJob() {
  await learningQueue.add(
    "weekly-learning",
    { triggeredAt: new Date().toISOString() },
    {
      attempts: 2,
      backoff: { type: "fixed", delay: 60000 },
    }
  );
}

// ─── WORKERS ─────────────────────────────────────────────────────────────────

export function startWorkers() {
  log.info("Starting BullMQ workers...");

  // Content pipeline worker
  const contentWorker = new Worker("content-pipeline", async (job) => {
    log.info(`Processing content job: ${job.id} — platform: ${job.data.platform}`);
    const { runDailyPipeline } = await import("../agent/orchestrator.js");
    await runDailyPipeline(job.data.platform);
  }, {
    connection,
    concurrency: 1, // Never run 2 pipelines at once
    limiter: { max: 6, duration: 86400000 }, // Max 6 posts per day
  });

  // Analytics worker
  const analyticsWorker = new Worker("analytics-tracker", async (job) => {
    const { trackTwitterEngagement, trackInstagramEngagement } = await import("../agents/publisher.js");
    const { postId, platform, platformPostId } = job.data;
    if (platform === "twitter") await trackTwitterEngagement(postId, platformPostId);
    if (platform === "instagram") await trackInstagramEngagement(postId, platformPostId);
  }, { connection, concurrency: 3 });

  // Engagement worker
  const engagementWorker = new Worker("engagement-farmer", async (job) => {
    const { runEngagementFarmer } = await import("../agents/engagement-farmer.js");
    await runEngagementFarmer();
  }, { connection, concurrency: 1 });

  // Learning worker
  const learningWorker = new Worker("learning-cycle", async (job) => {
    const { runLearningCycle } = await import("../agents/analytics-learner.js");
    await runLearningCycle();
  }, { connection, concurrency: 1 });

  // Error handlers
  for (const worker of [contentWorker, analyticsWorker, engagementWorker, learningWorker]) {
    worker.on("failed", (job, err) => {
      log.error(`Job ${job?.id} failed: ${err.message}`);
    });
    worker.on("completed", (job) => {
      log.info(`Job ${job.id} completed`);
    });
  }

  log.info("✅ All workers running");
  return { contentWorker, analyticsWorker, engagementWorker, learningWorker };
}

// ─── QUEUE STATS ─────────────────────────────────────────────────────────────

export async function getQueueStats() {
  const [contentCounts, analyticsCounts] = await Promise.all([
    contentQueue.getJobCounts(),
    analyticsQueue.getJobCounts(),
  ]);
  return { content: contentCounts, analytics: analyticsCounts };
}
