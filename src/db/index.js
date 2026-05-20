// src/db/index.js
// Memory system — every agent reads/writes through here.
// Supabase + pgvector for semantic search.

import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("DB");

// Lazy Supabase client — validates URL format before connecting
let _sb = null;
function getSB() {
  if (_sb) return _sb;
  const url = config.supabase.url;
  const key = config.supabase.serviceKey;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required. Add them to GitHub Secrets.");
  }
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    throw new Error(
      `SUPABASE_URL must be your project URL (e.g. https://abc123.supabase.co), not an API key.\n` +
      `Current value starts with: "${url.slice(0, 20)}..."\n` +
      `Fix: Supabase Dashboard → Settings → API → copy Project URL`
    );
  }
  _sb = createClient(url, key);
  return _sb;
}
export const supabase = new Proxy({}, {
  get(_, prop) { return getSB()[prop]; },
});

// ─── POST MEMORY ─────────────────────────────────────────────────────────────

export async function savePost(post) {
  const { data, error } = await supabase
    .from("agent_posts")
    .insert({
      platform: post.platform,
      content_type: post.contentType,
      caption: post.caption,
      hashtags: post.hashtags,
      image_url: post.imageUrl,
      image_prompt: post.imagePrompt,
      hook: post.hook,
      topic: post.topic,
      trend_source: post.trendSource,
      status: post.status || "pending",
      quality_score: post.qualityScore,
      scheduled_at: post.scheduledAt,
      platform_post_id: post.platformPostId,
      metadata: post.metadata || {},
    });
  if (error) { log.error("savePost failed", error); throw error; }
  log.info(`Saved post [${post.platform}] "${post.topic}"`);
  return data;
}

export async function updatePostStatus(id, status, platformPostId, engagementData) {
  const { error } = await supabase
    .from("agent_posts")
    .update({ status, platform_post_id: platformPostId, engagement: engagementData,
      posted_at: status === "published" ? new Date().toISOString() : undefined })
    .eq("id", id);
  if (error) log.error("updatePostStatus failed", error);
}

export async function getRecentPosts(limit = 30, platform = null) {
  let q = supabase.from("agent_posts").select("*")
    .order("created_at", { ascending: false }).limit(limit);
  if (platform) q = q.eq("platform", platform);
  const { data, error } = await q;
  if (error) { log.error("getRecentPosts failed", error); return []; }
  return data || [];
}

export async function getTopPerformingPosts(limit = 10) {
  const { data, error } = await supabase.from("agent_posts").select("*")
    .eq("status", "published")
    .order("engagement->likes", { ascending: false }).limit(limit);
  if (error) { log.error("getTopPerformingPosts failed", error); return []; }
  return data || [];
}

export async function getUsedTopics(days = 14) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase.from("agent_posts")
    .select("topic, hook, caption").gte("created_at", since)
    .order("created_at", { ascending: false });
  return data || [];
}

// ─── TREND MEMORY ─────────────────────────────────────────────────────────────

export async function saveTrend(trend) {
  const { error } = await supabase.from("agent_trends").upsert({
    trend_id: trend.id, topic: trend.topic, source: trend.source,
    velocity: trend.velocity, relevance_score: trend.relevanceScore,
    raw_data: trend.rawData, expires_at: trend.expiresAt,
  }, { onConflict: "trend_id" });
  if (error) log.error("saveTrend failed", error);
}

export async function getActiveTrends() {
  const { data } = await supabase.from("agent_trends").select("*")
    .gt("expires_at", new Date().toISOString())
    .order("relevance_score", { ascending: false }).limit(20);
  return data || [];
}

// ─── PERFORMANCE ANALYTICS ───────────────────────────────────────────────────

export async function saveAnalytics(postId, metrics) {
  const { error } = await supabase.from("agent_analytics").upsert({
    post_id: postId, impressions: metrics.impressions || 0,
    likes: metrics.likes || 0, comments: metrics.comments || 0,
    shares: metrics.shares || 0, saves: metrics.saves || 0,
    clicks: metrics.clicks || 0, engagement_rate: metrics.engagementRate || 0,
    performance_score: metrics.performanceScore || 0,
    checked_at: new Date().toISOString(),
  }, { onConflict: "post_id" });
  if (error) log.error("saveAnalytics failed", error);
}

export async function getBestPerformingPatterns() {
  const { data } = await supabase.from("agent_posts").select(`
    content_type, hook, topic, hashtags,
    agent_analytics(performance_score, likes, shares, saves)
  `).eq("status", "published").not("agent_analytics", "is", null)
    .order("agent_analytics.performance_score", { ascending: false }).limit(20);
  return data || [];
}

// ─── AGENT STATE ─────────────────────────────────────────────────────────────

export async function getAgentState() {
  const { data } = await supabase.from("agent_state").select("*")
    .eq("key", "main").single();
  return data?.value || {};
}

export async function setAgentState(updates) {
  const current = await getAgentState();
  const { error } = await supabase.from("agent_state").upsert({
    key: "main", value: { ...current, ...updates, updatedAt: new Date().toISOString() }
  });
  if (error) log.error("setAgentState failed", error);
}

// ─── GITHUB FEATURES ─────────────────────────────────────────────────────────

export async function saveDetectedFeature(feature) {
  const { error } = await supabase.from("agent_features").upsert({
    commit_sha: feature.sha, title: feature.title,
    description: feature.description,
    detected_at: new Date().toISOString(), announced: false,
  }, { onConflict: "commit_sha" });
  if (error) log.error("saveDetectedFeature failed", error);
}

export async function getUnAnnouncedFeatures() {
  const { data } = await supabase.from("agent_features").select("*")
    .eq("announced", false).order("detected_at", { ascending: false }).limit(5);
  return data || [];
}

export async function markFeatureAnnounced(sha) {
  await supabase.from("agent_features").update({
    announced: true, announced_at: new Date().toISOString()
  }).eq("commit_sha", sha);
}
