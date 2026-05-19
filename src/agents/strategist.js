// src/agents/strategist.js
// AGENT 2: Strategist
// Analyses trends, memory, and goals — decides what the best post to make is today.

import OpenAI from "openai";
import { config, BRAND, CONTENT_CALENDAR } from "../config/index.js";
import { getRecentPosts, getTopPerformingPosts, getBestPerformingPatterns } from "../db/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("STRATEGIST");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function runStrategist(trends, platform) {
  log.info(`🧠 Strategist thinking for [${platform}]...`);

  // Load memory
  const [recentPosts, topPosts, patterns] = await Promise.all([
    getRecentPosts(20, platform),
    getTopPerformingPosts(10),
    getBestPerformingPatterns(),
  ]);

  // Get today's calendar type
  const dayOfWeek = new Date().getDay();
  const calendarDay = CONTENT_CALENDAR[dayOfWeek];

  // Build context
  const recentContext = recentPosts.map(p =>
    `- [${p.content_type}] "${p.topic}" (score: ${p.quality_score})`
  ).join("\n");

  const topPerformers = topPosts.map(p =>
    `- "${p.topic}" → likes: ${p.engagement?.likes || 0}, shares: ${p.engagement?.shares || 0}`
  ).join("\n");

  const trendContext = trends.slice(0, 6).map((t, i) =>
    `${i + 1}. [Score: ${t.relevanceScore}] ${t.topic} — angle: "${t.contentAngle}"`
  ).join("\n");

  const bestPatterns = patterns.slice(0, 5).map(p =>
    `- ${p.content_type} on ${p.platform}: avg score ${Math.round(p.agent_analytics?.[0]?.performance_score || 0)}`
  ).join("\n");

  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [{
      role: "system",
      content: `You are the Growth Strategist for ${BRAND.name}. Your job is to make one great strategic decision about what content to create today. You think like a top-tier social media growth consultant, not a bot.`,
    }, {
      role: "user",
      content: `BRAND: ${BRAND.name} — ${BRAND.tagline}
PLATFORM: ${platform}
AUDIENCE: ${config.agent.targetAudience}
WEBSITE: ${config.agent.websiteUrl}
TODAY'S CALENDAR: ${calendarDay.desc}

RECENT POSTS (avoid repetition):
${recentContext || "None yet"}

WHAT WORKED BEST:
${topPerformers || "No data yet"}

BEST CONTENT PATTERNS:
${bestPatterns || "No data yet"}

TODAY'S TRENDS:
${trendContext || "No trends available"}

YOUR MISSION:
Pick ONE winning content strategy for today. Consider the calendar day, avoid repeating recent topics, leverage trends when possible.

Respond in JSON:
{
  "contentType": "ai_insight | feature_showcase | meme | tutorial | comparison | carousel | founder_vibe",
  "chosenTrend": "the trend or topic you're building around",
  "reasoning": "why this is the right move today",
  "angle": "the specific Creova angle or connection",
  "targetEmotion": "curiosity | inspiration | humor | surprise | validation",
  "estimatedEngagement": "high | medium | low",
  "callToAction": "what you want viewers to do",
  "postCount": 1,
  "platforms": ["${platform}"]
}`,
    }],
  });

  let strategy;
  try {
    strategy = JSON.parse(res.choices[0].message.content);
  } catch {
    strategy = {
      contentType: calendarDay.type,
      chosenTrend: trends[0]?.topic || "AI is changing content creation forever",
      reasoning: "Default to calendar day type",
      angle: "Creova automates the hardest parts of being a creator",
      targetEmotion: "curiosity",
      estimatedEngagement: "medium",
      callToAction: "Try Creova free",
      postCount: 1,
      platforms: [platform],
    };
  }

  log.info(`Strategy decided: ${strategy.contentType} — "${strategy.chosenTrend.slice(0, 60)}..."`);
  log.info(`Reasoning: ${strategy.reasoning}`);

  return strategy;
}
