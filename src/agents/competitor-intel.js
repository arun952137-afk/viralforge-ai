// src/agents/competitor-intel.js
// COMPETITOR INTELLIGENCE
// Monitors Canva, Notion, Runway, Midjourney, Adobe — tracks what content
// formats they use, what goes viral, what gaps Creova can exploit.
// Runs weekly. Feeds insights into the Strategist.

import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { config, BRAND } from "../config/index.js";
import { supabase, setAgentState, getAgentState } from "../db/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("COMPETITOR-INTEL");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

const COMPETITORS = [
  { name: "Canva", twitter: "canva", focus: "design tools" },
  { name: "Notion", twitter: "notionhq", focus: "productivity" },
  { name: "Runway", twitter: "runwayml", focus: "AI video" },
  { name: "Descript", twitter: "descriptapp", focus: "video editing" },
  { name: "CapCut", twitter: "capcutapp", focus: "video editing" },
  { name: "Midjourney", twitter: "midjourney", focus: "AI art" },
];

export async function runCompetitorIntel() {
  log.info("🕵️ Competitor intelligence scan starting...");

  // Check their Product Hunt launches (public data)
  const phInsights = await scrapeProductHuntCompetitors();

  // Check HN discussions mentioning competitors
  const hnInsights = await scrapeHNCompetitorMentions();

  // AI analysis: what gaps can Creova exploit?
  const analysis = await analyzeCompetitorLandscape(phInsights, hnInsights);

  if (analysis) {
    const state = await getAgentState();
    await setAgentState({
      competitorIntel: {
        updatedAt: new Date().toISOString(),
        gaps: analysis.gaps,
        opportunities: analysis.opportunities,
        trendingCompetitorContent: analysis.trendingFormats,
        creovaAdvantages: analysis.creovaAdvantages,
      },
    });
    log.info(`✅ Competitor intel updated — ${analysis.gaps.length} gaps found`);
  }

  return analysis;
}

async function scrapeProductHuntCompetitors() {
  const results = [];
  for (const comp of COMPETITORS.slice(0, 4)) {
    try {
      const res = await axios.get(
        `https://hn.algolia.com/api/v1/search?query=${comp.name}&tags=comment&hitsPerPage=10`,
        { timeout: 8000 }
      );
      const hits = res.data?.hits || [];
      const topComments = hits
        .filter(h => h.points > 5)
        .map(h => h.comment_text?.slice(0, 200) || "")
        .slice(0, 3)
        .join(" | ");

      if (topComments) {
        results.push({ competitor: comp.name, comments: topComments, focus: comp.focus });
      }
    } catch (e) {
      log.warn(`${comp.name} PH scrape failed: ${e.message}`);
    }
  }
  return results;
}

async function scrapeHNCompetitorMentions() {
  try {
    const competitorNames = COMPETITORS.map(c => c.name).join(" OR ");
    const res = await axios.get(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent("AI content tool")} &tags=story&hitsPerPage=20`,
      { timeout: 8000 }
    );
    return (res.data?.hits || [])
      .filter(h => h.points > 50)
      .map(h => ({ title: h.title, points: h.points, url: h.url }))
      .slice(0, 8);
  } catch {
    return [];
  }
}

async function analyzeCompetitorLandscape(phInsights, hnInsights) {
  const insightText = [
    ...phInsights.map(i => `${i.competitor}: "${i.comments}"`),
    ...hnInsights.map(i => `HN (${i.points} pts): "${i.title}"`),
  ].join("\n");

  if (!insightText.trim()) return null;

  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [{
      role: "user",
      content: `Analyse this competitor intelligence for ${BRAND.name}.

${BRAND.name}: ${BRAND.tagline}
Our competitors: ${COMPETITORS.map(c => c.name).join(", ")}

INTELLIGENCE:
${insightText}

What gaps can Creova exploit? What are competitors doing wrong that we can position against?

JSON:
{
  "gaps": ["specific market gap", "another gap"],
  "opportunities": ["content angle we should post about"],
  "trendingFormats": ["format that works for competitors we should adapt"],
  "creovaAdvantages": ["specific Creova advantage vs competitors"],
  "positioningStatement": "One sentence that positions Creova vs competitors",
  "suggestedPosts": [
    "Specific post idea exploiting a gap"
  ]
}`,
    }],
  });

  try { return JSON.parse(res.choices[0].message.content); }
  catch { return null; }
}

// Get competitor intel for strategist
export async function getCompetitorInsights() {
  const state = await getAgentState();
  return state.competitorIntel || null;
}
