// src/agents/analytics-learner.js
// ANALYTICS LEARNING ENGINE
// Runs weekly. Analyses all post performance, extracts patterns,
// updates the agent's long-term strategy. This is what makes it
// smarter every week instead of randomly posting forever.

import OpenAI from "openai";
import { config, BRAND } from "../config/index.js";
import {
  getTopPerformingPosts, getBestPerformingPatterns,
  getAgentState, setAgentState, supabase
} from "../db/index.js";
import { notifyTelegram } from "../services/notifications.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("LEARNER");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function runLearningCycle() {
  log.info("🧠 Weekly learning cycle starting...");

  // Pull all published posts with analytics
  const { data: posts } = await supabase
    .from("agent_posts")
    .select(`
      id, platform, content_type, topic, hook, caption, hashtags,
      quality_score, posted_at,
      agent_analytics(impressions, likes, comments, shares, saves, performance_score)
    `)
    .eq("status", "published")
    .not("agent_analytics", "is", null)
    .order("posted_at", { ascending: false })
    .limit(50);

  if (!posts || posts.length < 5) {
    log.warn("Not enough data for learning cycle yet (need 5+ published posts)");
    return null;
  }

  // Separate into high/low performers
  const sorted = posts.sort((a, b) => {
    const aScore = a.agent_analytics?.[0]?.performance_score || 0;
    const bScore = b.agent_analytics?.[0]?.performance_score || 0;
    return bScore - aScore;
  });

  const topPerformers = sorted.slice(0, Math.ceil(sorted.length * 0.3));
  const lowPerformers = sorted.slice(Math.floor(sorted.length * 0.7));

  // Compute platform averages
  const byPlatform = {};
  for (const p of posts) {
    const plat = p.platform;
    const score = p.agent_analytics?.[0]?.performance_score || 0;
    if (!byPlatform[plat]) byPlatform[plat] = { scores: [], types: {} };
    byPlatform[plat].scores.push(score);
    const t = p.content_type;
    if (!byPlatform[plat].types[t]) byPlatform[plat].types[t] = [];
    byPlatform[plat].types[t].push(score);
  }

  const platformSummary = Object.entries(byPlatform).map(([plat, data]) => {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const bestType = Object.entries(data.types)
      .map(([t, scores]) => ({ t, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
      .sort((a, b) => b.avg - a.avg)[0];
    return `${plat}: avg score ${avg.toFixed(0)}, best type: ${bestType?.t} (${bestType?.avg.toFixed(0)})`;
  }).join("\n");

  // Format top/low performers for AI
  const topContext = topPerformers.slice(0, 8).map(p =>
    `[${p.content_type}/${p.platform}] Score: ${p.agent_analytics?.[0]?.performance_score || 0} | Hook: "${p.hook?.slice(0, 60)}" | Topic: ${p.topic?.slice(0, 50)}`
  ).join("\n");

  const lowContext = lowPerformers.slice(0, 5).map(p =>
    `[${p.content_type}/${p.platform}] Score: ${p.agent_analytics?.[0]?.performance_score || 0} | Hook: "${p.hook?.slice(0, 60)}"`
  ).join("\n");

  // AI analysis
  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [{
      role: "system",
      content: `You are the Growth Intelligence analyst for ${BRAND.name}. You analyse content performance data and extract actionable strategic insights to improve future content. Be specific, data-driven, and contrarian when needed.`,
    }, {
      role: "user",
      content: `Analyse ${posts.length} posts from the last period for ${BRAND.name}.

PLATFORM AVERAGES:
${platformSummary}

TOP PERFORMERS (${topPerformers.length} posts):
${topContext}

LOW PERFORMERS:
${lowContext}

Brand: ${BRAND.name} — ${BRAND.tagline}
Audience: ${config.agent.targetAudience}

Extract strategic learnings. Be specific. What should the agent DO MORE of, DO LESS of, and NEVER DO again?

JSON:
{
  "overallHealthScore": 72,
  "topPatterns": [
    "Specific pattern that works (e.g. 'curiosity hooks with data perform 2x better on X')"
  ],
  "avoidPatterns": [
    "Specific pattern that fails"
  ],
  "bestContentTypes": {
    "twitter": "content_type that wins",
    "instagram": "content_type that wins"
  },
  "hookInsights": "What kind of hooks get most engagement",
  "topicInsights": "What topics resonate most",
  "platformInsights": {
    "twitter": "specific insight",
    "instagram": "specific insight"
  },
  "strategyAdjustments": [
    "Concrete change to make in next week"
  ],
  "weeklyGoal": "One clear focus for the next 7 days",
  "summaryForAgent": "2-3 sentence brief the agent reads before every post"
}`,
    }],
  });

  let learnings;
  try {
    learnings = JSON.parse(res.choices[0].message.content);
  } catch {
    log.error("Failed to parse learnings");
    return null;
  }

  // Store learnings in agent state
  const state = await getAgentState();
  await setAgentState({
    learnings: [
      ...(state.learnings || []).slice(-4), // Keep last 5 cycles
      {
        week: new Date().toISOString().slice(0, 10),
        ...learnings,
      },
    ],
    currentStrategy: {
      healthScore: learnings.overallHealthScore,
      weeklyGoal: learnings.weeklyGoal,
      summaryBrief: learnings.summaryForAgent,
      updatedAt: new Date().toISOString(),
    },
    bestContentTypes: learnings.bestContentTypes,
  });

  log.info(`✅ Learning cycle complete — Health: ${learnings.overallHealthScore}/100`);
  log.info(`Weekly goal: ${learnings.weeklyGoal}`);
  log.info(`Top patterns: ${learnings.topPatterns?.slice(0, 2).join(" | ")}`);

  // Save best hooks to hooks library
  for (const p of topPerformers.slice(0, 5)) {
    if (p.hook) {
      await supabase.from("agent_hooks").upsert({
        hook_text: p.hook,
        hook_type: p.content_type,
        performance: p.agent_analytics?.[0]?.performance_score || 0,
      }, { onConflict: "hook_text" });
    }
  }

  // Notify
  await notifyTelegram(
    `📊 *Weekly Learning Report*\n\n` +
    `Health Score: ${learnings.overallHealthScore}/100\n` +
    `Goal: ${learnings.weeklyGoal}\n\n` +
    `Top pattern: ${learnings.topPatterns?.[0] || "—"}\n\n` +
    `Brief: ${learnings.summaryForAgent}`
  );

  return learnings;
}

// Read current strategy brief — called by strategist before every post
export async function getCurrentStrategyBrief() {
  const state = await getAgentState();
  return state.currentStrategy?.summaryBrief || null;
}

export async function getBestHooks(limit = 10) {
  const { data } = await supabase
    .from("agent_hooks")
    .select("*")
    .order("performance", { ascending: false })
    .limit(limit);
  return data || [];
}
