// src/jobs/queue.js
// BullMQ Job Queue — for Railway/Render daemon mode only.
// Lazily imported — never runs in GitHub Actions CLI mode.
// Queue instances created on demand, not at module load time.

import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("QUEUE");

let _queues = null;

async function getQueues() {
  if (_queues) return _queues;
  if (!config.redis?.url) throw new Error("Redis not configured — queue unavailable in GitHub Actions mode");
  const { Queue } = await import("bullmq");
  _queues = {
    content:  new Queue("content-pipeline",  { connection: { url: config.redis.url } }),
    analytics: new Queue("analytics-tracker", { connection: { url: config.redis.url } }),
    engagement: new Queue("engagement-farmer", { connection: { url: config.redis.url } }),
    learning: new Queue("learning-cycle",    { connection: { url: config.redis.url } }),
  };
  return _queues;
}

export async function enqueueContentJob(platform, priority = "normal") {
  const q = await getQueues();
  const jobId = `content-${platform}-${Date.now()}`;
  await q.content.add("run-pipeline", { platform, triggeredAt: new Date().toISOString() }, {
    jobId, priority: priority === "high" ? 1 : 10,
    attempts: 3, backoff: { type: "exponential", delay: 60000 },
    removeOnComplete: { count: 100 }, removeOnFail: { count: 50 },
  });
  log.info(`Queued content job: ${jobId}`);
  return jobId;
}

export async function enqueueAnalyticsJob(postId, platform, platformPostId, delayMs = 86400000) {
  const q = await getQueues();
  await q.analytics.add("track-post", { postId, platform, platformPostId }, {
    delay: delayMs, attempts: 5, backoff: { type: "exponential", delay: 3600000 },
  });
}

export async function getQueueStats() {
  const q = await getQueues();
  const [c, a] = await Promise.all([q.content.getJobCounts(), q.analytics.getJobCounts()]);
  return { content: c, analytics: a };
}
