// src/agents/engagement-farmer.js
// ENGAGEMENT FARMING AGENT
// Finds viral posts in the AI/creator/startup space and drops
// smart, human-sounding replies that drive inbound traffic to Creova.
// This is how accounts actually grow — not just posting into the void.

import { TwitterApi } from "twitter-api-v2";
import OpenAI from "openai";
import { config, BRAND } from "../config/index.js";
import { supabase } from "../db/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("ENGAGEMENT");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

const ENGAGEMENT_TARGETS = [
  // Big AI/creator accounts to engage with
  "levelsio",        // @levelsio — indie hacker
  "swyx",            // @swyx — AI dev
  "GarryTan",        // @GarryTan — YC
  "benedictevans",   // @benedictevans — tech analysis
  "venturetwins",    // @venturetwins — founders
];

const SEARCH_QUERIES = [
  "AI content creator tool",
  "automate content creation",
  "AI video script generator",
  "creator burnout editing",
  "AI startup tools 2025",
  "short form video automation",
  "creator economy AI",
];

// Track replied tweet IDs to avoid double-replying
const repliedCache = new Set();

export async function runEngagementFarmer() {
  if (!config.twitter.apiKey) {
    log.warn("Twitter not configured — skipping engagement farming");
    return;
  }

  log.info("🌾 Engagement farmer starting...");

  const client = new TwitterApi({
    appKey: config.twitter.apiKey,
    appSecret: config.twitter.apiSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
  });

  let replyCount = 0;
  const maxReplies = 5; // Conservative — avoid Twitter rate limits

  // Find high-engagement tweets in our space
  for (const query of SEARCH_QUERIES.slice(0, 4)) {
    if (replyCount >= maxReplies) break;

    try {
      const { data } = await client.v2.search(query, {
        max_results: 10,
        "tweet.fields": ["public_metrics", "author_id", "created_at"],
        "user.fields": ["username"],
        expansions: ["author_id"],
      });

      if (!data?.data) continue;

      // Filter: only reply to tweets with real engagement
      const worthReplying = data.data.filter(t => {
        const m = t.public_metrics;
        const totalEngagement = (m?.like_count || 0) + (m?.retweet_count || 0) * 2;
        return totalEngagement > 50 && !repliedCache.has(t.id);
      }).slice(0, 2);

      for (const tweet of worthReplying) {
        if (replyCount >= maxReplies) break;

        const reply = await generateReply(tweet.text, query);
        if (!reply) continue;

        // Quality check — never reply with anything generic
        if (reply.length < 20 || reply.includes("Great post!") || reply.includes("Well said")) {
          log.warn("Reply too generic — skipping");
          continue;
        }

        if (config.env === "production") {
          try {
            await client.v2.reply(reply, tweet.id);
            repliedCache.add(tweet.id);
            replyCount++;
            log.info(`✅ Replied to tweet ${tweet.id}: "${reply.slice(0, 60)}..."`);

            // Log engagement activity
            await supabase.from("agent_engagement").upsert({
              platform: "twitter",
              action: "reply",
              target_id: tweet.id,
              content: reply,
              created_at: new Date().toISOString(),
            }).catch(() => {}); // Table may not exist yet

            // Rate limit safety
            await new Promise(r => setTimeout(r, 8000));
          } catch (e) {
            log.warn(`Reply failed for ${tweet.id}: ${e.message}`);
          }
        } else {
          log.info(`[DEV] Would reply to ${tweet.id}: "${reply.slice(0, 80)}..."`);
          replyCount++;
        }
      }
    } catch (e) {
      log.warn(`Search failed for "${query}": ${e.message}`);
    }
  }

  log.info(`Engagement farming complete — ${replyCount} replies sent`);
}

async function generateReply(originalTweet, context) {
  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.7,
    messages: [{
      role: "system",
      content: `You are the social media voice of ${BRAND.name}. You write smart, human replies to tweets in the AI/creator/startup space. You add genuine value — you never shill or spam. Replies should feel like they come from a thoughtful founder, not a marketing bot.

Rules:
- Add genuine insight or question
- Max 200 chars
- Never say "Great post!" or anything sycophantic  
- Optionally mention ${BRAND.name} if it's GENUINELY relevant (not forced)
- Sound human and smart
- If you can't add real value, output exactly: SKIP`,
    }, {
      role: "user",
      content: `Tweet: "${originalTweet}"
Context: ${context}

Write a smart reply (or SKIP if you can't add real value):`,
    }],
  });

  const reply = res.choices[0].message.content.trim();
  if (reply === "SKIP" || reply.includes("SKIP")) return null;
  return reply;
}

// Quote-tweet high-performing content (higher visibility than replies)
export async function quoteViralTweet() {
  if (!config.twitter.apiKey || config.env !== "production") return;
  log.info("Checking for quote-tweet opportunities...");

  const client = new TwitterApi({
    appKey: config.twitter.apiKey,
    appSecret: config.twitter.apiSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
  });

  try {
    const { data } = await client.v2.search("AI content creation OR creator automation", {
      max_results: 20,
      "tweet.fields": ["public_metrics"],
    });

    // Find the most viral one
    const best = (data?.data || [])
      .filter(t => (t.public_metrics?.like_count || 0) > 200)
      .sort((a, b) => (b.public_metrics?.like_count || 0) - (a.public_metrics?.like_count || 0))[0];

    if (!best) return;

    const quoteText = await generateQuoteTweet(best.text);
    if (!quoteText) return;

    const tweetUrl = `https://twitter.com/i/web/status/${best.id}`;
    await client.v2.tweet({ text: quoteText, quote_tweet_id: best.id });
    log.info(`✅ Quote-tweeted: "${quoteText.slice(0, 60)}..."`);
  } catch (e) {
    log.warn("Quote-tweet failed:", e.message);
  }
}

async function generateQuoteTweet(originalText) {
  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.65,
    messages: [{
      role: "user",
      content: `Write a smart quote-tweet for ${BRAND.name} about this post:
"${originalText}"

Requirements:
- Add a sharp contrarian or complementary take
- Mention ${config.agent.websiteUrl} only if very natural
- Under 240 chars
- No hashtags
- Human, startup founder voice
- Output SKIP if can't add real value`,
    }],
  });

  const text = res.choices[0].message.content.trim();
  return text === "SKIP" ? null : text;
}
