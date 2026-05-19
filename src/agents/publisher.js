// src/agents/publisher.js
// AGENT 6: Publisher — posts to Twitter/X and Instagram automatically.
// AGENT 7: Analytics — tracks engagement and feeds back to memory.

import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import FormData from "form-data";
import { config } from "../config/index.js";
import { savePost, updatePostStatus, saveAnalytics } from "../db/index.js";
import { downloadImageBuffer } from "./designer.js";
import { notifyTelegram } from "../services/notifications.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("PUBLISHER");

// ─── TWITTER / X ─────────────────────────────────────────────────────────────

function getTwitterClient() {
  if (!config.twitter.apiKey) throw new Error("Twitter API not configured");
  return new TwitterApi({
    appKey: config.twitter.apiKey,
    appSecret: config.twitter.apiSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
  });
}

export async function publishToTwitter(post) {
  log.info(`📤 Publishing to X: "${post.hook?.slice(0, 50)}..."`);

  // Save to DB first (pending)
  await savePost({ ...post, platform: "twitter", status: "pending" });

  if (config.env !== "production") {
    log.warn("⚠️ DEV MODE — skipping real Twitter publish");
    return { success: true, postId: `dev-${Date.now()}`, url: "https://x.com/dev" };
  }

  try {
    const client = getTwitterClient().readWrite;
    let tweetId;

    if (post.threads && post.threads.length > 1) {
      // Thread posting
      let replyToId = null;
      for (const tweetText of post.threads) {
        const params = { text: tweetText };
        if (replyToId) params.reply = { in_reply_to_tweet_id: replyToId };

        // Attach media to first tweet if available
        if (!replyToId && post.imageBuffer) {
          const media = await client.v1.uploadMedia(post.imageBuffer, { mimeType: "image/png" });
          params.media = { media_ids: [media.media_id_string] };
        }

        const { data } = await client.v2.tweet(params);
        if (!replyToId) tweetId = data.id;
        replyToId = data.id;
      }
    } else {
      // Single tweet
      const params = { text: post.caption };
      if (post.imageBuffer) {
        const media = await client.v1.uploadMedia(post.imageBuffer, { mimeType: "image/png" });
        params.media = { media_ids: [media.media_id_string] };
      }
      const { data } = await client.v2.tweet(params);
      tweetId = data.id;
    }

    const tweetUrl = `https://x.com/i/web/status/${tweetId}`;
    await updatePostStatus(post.id, "published", tweetId, {});
    await notifyTelegram(`✅ Posted to X!\n\n"${post.hook}"\n\n${tweetUrl}`);

    log.info(`✅ X post published: ${tweetUrl}`);
    return { success: true, postId: tweetId, url: tweetUrl };
  } catch (e) {
    log.error("X publish failed", e.message);
    await updatePostStatus(post.id, "failed", null, { error: e.message });
    return { success: false, error: e.message };
  }
}

// ─── INSTAGRAM ──────────────────────────────────────────────────────────────

export async function publishToInstagram(post) {
  log.info(`📸 Publishing to Instagram: "${post.hook?.slice(0, 50)}..."`);
  await savePost({ ...post, platform: "instagram", status: "pending" });

  if (config.env !== "production") {
    log.warn("⚠️ DEV MODE — skipping real Instagram publish");
    return { success: true, postId: `dev-ig-${Date.now()}` };
  }

  if (!config.instagram.accessToken || !config.instagram.accountId) {
    log.error("Instagram not configured");
    return { success: false, error: "Instagram credentials missing" };
  }

  try {
    const baseUrl = `https://graph.facebook.com/v19.0/${config.instagram.accountId}`;
    const caption = `${post.caption}\n\n${post.hashtags?.join(" ") || ""}`;

    // Step 1: Create media container
    const mediaParams = new URLSearchParams({
      access_token: config.instagram.accessToken,
      caption,
    });

    if (post.imageUrl) {
      mediaParams.set("image_url", post.imageUrl);
    }

    const containerRes = await axios.post(`${baseUrl}/media?${mediaParams}`);
    const containerId = containerRes.data.id;

    // Step 2: Check container status (Instagram needs processing time)
    let status = "IN_PROGRESS";
    let attempts = 0;
    while (status === "IN_PROGRESS" && attempts < 10) {
      await new Promise(r => setTimeout(r, 3000));
      const statusRes = await axios.get(`https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${config.instagram.accessToken}`);
      status = statusRes.data.status_code;
      attempts++;
    }

    if (status !== "FINISHED") throw new Error(`Container not ready: ${status}`);

    // Step 3: Publish
    const publishRes = await axios.post(`${baseUrl}/media_publish`, null, {
      params: {
        creation_id: containerId,
        access_token: config.instagram.accessToken,
      },
    });

    const igPostId = publishRes.data.id;
    await updatePostStatus(post.id, "published", igPostId, {});
    await notifyTelegram(`📸 Posted to Instagram!\n\n"${post.hook}"`);

    log.info(`✅ Instagram post published: ${igPostId}`);
    return { success: true, postId: igPostId };
  } catch (e) {
    log.error("Instagram publish failed", e.message);
    await updatePostStatus(post.id, "failed", null, { error: e.message });
    return { success: false, error: e.message };
  }
}

// ─── ANALYTICS TRACKER ──────────────────────────────────────────────────────

export async function trackTwitterEngagement(postId, tweetId) {
  if (!tweetId || !config.twitter.bearerToken) return;
  try {
    const client = new TwitterApi(config.twitter.bearerToken);
    const { data } = await client.v2.singleTweet(tweetId, {
      "tweet.fields": ["public_metrics"],
    });
    const m = data.public_metrics;
    const perf = computeScore(m.impression_count || 0, m.like_count, m.retweet_count, m.reply_count, 0, m.bookmark_count);
    await saveAnalytics(postId, {
      impressions: m.impression_count || 0,
      likes: m.like_count || 0,
      shares: m.retweet_count || 0,
      comments: m.reply_count || 0,
      saves: m.bookmark_count || 0,
      engagementRate: m.impression_count > 0 ? ((m.like_count + m.retweet_count) / m.impression_count * 100).toFixed(2) : 0,
      performanceScore: perf,
    });
    log.info(`Analytics tracked for tweet ${tweetId} — score: ${perf}`);
  } catch (e) { log.warn("Twitter analytics failed", e.message); }
}

export async function trackInstagramEngagement(postId, igId) {
  if (!igId || !config.instagram.accessToken) return;
  try {
    const res = await axios.get(`https://graph.facebook.com/v19.0/${igId}/insights`, {
      params: {
        metric: "impressions,reach,likes,comments,saved,shares",
        access_token: config.instagram.accessToken,
      },
    });
    const d = {};
    for (const item of res.data?.data || []) d[item.name] = item.values?.[0]?.value || 0;
    const perf = computeScore(d.impressions, d.likes, d.shares, d.comments, d.saved, 0);
    await saveAnalytics(postId, {
      impressions: d.impressions, likes: d.likes, shares: d.shares,
      comments: d.comments, saves: d.saved, performanceScore: perf,
    });
    log.info(`Analytics tracked for IG ${igId} — score: ${perf}`);
  } catch (e) { log.warn("Instagram analytics failed", e.message); }
}

// Weighted performance score 0-100
function computeScore(impressions, likes, shares, comments, saves, bookmarks) {
  if (!impressions || impressions === 0) return 0;
  const engagementActions = (likes * 1) + (shares * 3) + (comments * 2) + (saves * 2.5) + (bookmarks * 2);
  const rate = engagementActions / impressions;
  // Benchmark: 3% engagement is great for social
  return Math.min(100, Math.round((rate / 0.03) * 70 + (impressions > 1000 ? 20 : impressions / 50) + (shares > 10 ? 10 : shares)));
}
