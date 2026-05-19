// src/agents/trend-hunter.js
// AGENT 1: Trend Hunter
// Scrapes internet, finds viral trends, scores them for Creova relevance.

import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { config, BRAND } from "../config/index.js";
import { saveTrend, getActiveTrends } from "../db/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("TREND-HUNTER");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

// ─── SCRAPERS ───────────────────────────────────────────────────────────────

async function scrapeHackerNews() {
  try {
    const res = await axios.get("https://hn.algolia.com/api/v1/search?query=AI&tags=front_page&hitsPerPage=15", { timeout: 8000 });
    return res.data.hits.map(h => ({
      id: `hn-${h.objectID}`,
      topic: h.title,
      source: "hackernews",
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      score: h.points || 0,
    }));
  } catch (e) { log.warn("HN scrape failed", e.message); return []; }
}

async function scrapeProductHunt() {
  try {
    // Product Hunt's public API (no auth needed for basic)
    const res = await axios.get("https://www.producthunt.com/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CreovaAgent/1.0)" },
      timeout: 8000,
    });
    const $ = cheerio.load(res.data);
    const items = [];
    $("[data-test='post-name']").each((_, el) => {
      items.push({ id: `ph-${Date.now()}-${_}`, topic: $(el).text().trim(), source: "producthunt" });
    });
    return items.slice(0, 10);
  } catch (e) { log.warn("ProductHunt scrape failed", e.message); return []; }
}

async function scrapeRedditAI() {
  try {
    const subs = ["artificial", "MachineLearning", "AItools", "ChatGPT", "LocalLLaMA"];
    const results = [];
    for (const sub of subs.slice(0, 3)) {
      const res = await axios.get(`https://www.reddit.com/r/${sub}/hot.json?limit=10`, {
        headers: { "User-Agent": "CreovaGrowthAgent/1.0" },
        timeout: 8000,
      });
      const posts = res.data?.data?.children || [];
      for (const p of posts) {
        if (p.data.score > 100) {
          results.push({
            id: `reddit-${p.data.id}`,
            topic: p.data.title,
            source: "reddit",
            url: `https://reddit.com${p.data.permalink}`,
            score: p.data.score,
          });
        }
      }
    }
    return results.slice(0, 15);
  } catch (e) { log.warn("Reddit scrape failed", e.message); return []; }
}

async function scrapeXTrends() {
  // X API v2 — get trending topics
  if (!config.twitter.bearerToken) {
    log.warn("No X bearer token — using fallback topics");
    return [
      { id: "x-ai-agents", topic: "AI agents are replacing human workflows", source: "twitter" },
      { id: "x-vibe-coding", topic: "Vibe coding and AI-generated startups", source: "twitter" },
      { id: "x-creator-economy", topic: "Creator economy AI tools", source: "twitter" },
    ];
  }
  try {
    // X API trending — requires subscription, fallback to search
    const res = await axios.get("https://api.twitter.com/2/tweets/search/recent?query=AI+startup+creator&max_results=10&tweet.fields=public_metrics", {
      headers: { Authorization: `Bearer ${config.twitter.bearerToken}` },
      timeout: 8000,
    });
    return (res.data?.data || []).map(t => ({
      id: `x-${t.id}`,
      topic: t.text.slice(0, 100),
      source: "twitter",
      score: (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0) * 2,
    }));
  } catch (e) { log.warn("X scrape failed", e.message); return []; }
}

// ─── AI SCORING ──────────────────────────────────────────────────────────────

async function scoreAndFilterTrends(rawTrends, recentTopics) {
  if (rawTrends.length === 0) return [];

  const recentContext = recentTopics.map(p => p.topic).join(", ");
  const trendsText = rawTrends.map((t, i) => `${i + 1}. [${t.source}] ${t.topic}`).join("\n");

  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [{
      role: "system",
      content: `You are the Trend Intelligence AI for ${BRAND.name}. Score each trend for our relevance and content opportunity.`,
    }, {
      role: "user",
      content: `Brand: ${BRAND.name} — ${BRAND.tagline}
Target audience: ${config.agent.targetAudience}
Website: ${config.agent.websiteUrl}

Recently posted topics (AVOID THESE): ${recentContext || "none"}

Score each trend 0-100 for Creova content relevance. Consider:
- Relevance to AI, content creation, startups, creator tools
- Viral potential for our audience
- Whether we can authentically connect it to Creova
- NOT already covered recently

Trends to score:
${trendsText}

Respond in JSON:
{
  "scored": [
    {
      "index": 1,
      "score": 85,
      "velocity": "exploding",
      "contentAngle": "How Creova already solves this...",
      "topic": "clean reformatted topic"
    }
  ]
}`,
    }],
  });

  let scored;
  try {
    const parsed = JSON.parse(res.choices[0].message.content);
    scored = parsed.scored || [];
  } catch { return []; }

  // Map scores back to original trends
  const result = [];
  for (const s of scored) {
    if (s.score >= 55) {
      const original = rawTrends[s.index - 1];
      if (original) {
        result.push({
          ...original,
          relevanceScore: s.score,
          velocity: s.velocity || "rising",
          contentAngle: s.contentAngle,
          topic: s.topic || original.topic,
        });
      }
    }
  }

  return result.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export async function runTrendHunter(recentTopics = []) {
  log.info("🔍 Trend Hunter awakening — scanning internet...");

  // Scrape all sources in parallel
  const [hn, ph, reddit, twitter] = await Promise.all([
    scrapeHackerNews(),
    scrapeProductHunt(),
    scrapeRedditAI(),
    scrapeXTrends(),
  ]);

  const all = [...hn, ...ph, ...reddit, ...twitter];
  log.info(`Scraped ${all.length} raw signals from ${4} sources`);

  if (all.length === 0) {
    log.warn("All scrapers returned empty — using built-in fallback trends");
    return getFallbackTrends();
  }

  // AI scores and filters
  const scored = await scoreAndFilterTrends(all, recentTopics);
  log.info(`${scored.length} trends passed relevance threshold`);

  // Save to DB
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  for (const trend of scored) {
    await saveTrend({ ...trend, id: trend.id, expiresAt, rawData: trend });
  }

  return scored;
}

function getFallbackTrends() {
  return [
    { id: "fb-1", topic: "AI agents are taking over content workflows in 2025", source: "fallback", relevanceScore: 90, velocity: "exploding", contentAngle: "Creova is the creator-native AI agent OS" },
    { id: "fb-2", topic: "Creators are burning out from manual content editing", source: "fallback", relevanceScore: 85, velocity: "rising", contentAngle: "Creova eliminates the manual work entirely" },
    { id: "fb-3", topic: "Build in public movement gaining momentum", source: "fallback", relevanceScore: 80, velocity: "rising", contentAngle: "Share Creova build journey" },
    { id: "fb-4", topic: "Short-form video dominates creator revenue in 2025", source: "fallback", relevanceScore: 82, velocity: "exploding", contentAngle: "Creova generates Shorts and Reels automatically" },
  ];
}
