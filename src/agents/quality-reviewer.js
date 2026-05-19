// src/agents/quality-reviewer.js
// AGENT 5: Quality Reviewer
// Every post passes through here before publishing.
// Checks brand consistency, cringe, grammar, engagement quality, repetition.

import OpenAI from "openai";
import { config, BRAND } from "../config/index.js";
import { getRecentPosts } from "../db/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("QC-REVIEWER");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

const MIN_SCORE = config.agent.minQualityScore;

export async function runQualityReview(draft) {
  log.info(`🔍 Quality review starting...`);

  const recentPosts = await getRecentPosts(20, draft.platform);
  const recentCaptions = recentPosts.map(p => p.caption).slice(0, 10).join("\n---\n");

  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [{
      role: "system",
      content: `You are a brutal, honest content quality reviewer for ${BRAND.name}. You are protecting the brand's premium reputation. You reject mediocre content without hesitation.`,
    }, {
      role: "user",
      content: `Review this ${draft.platform} post for ${BRAND.name}.

─── CONTENT TO REVIEW ───
Hook: ${draft.hook}
Caption: ${draft.caption}
Hashtags: ${draft.hashtags?.join(", ")}
Content Type: ${draft.contentType}
Topic: ${draft.topic}

─── BRAND STANDARDS ───
Personality: ${BRAND.personality}
Must avoid: ${BRAND.voice.avoids.join(", ")}
Must feel like: ${BRAND.voice.loves.join(", ")}

─── RECENT POSTS (check for repetition) ───
${recentCaptions || "None"}

─── EVALUATION CRITERIA ───
Score each 0-100:
1. Brand consistency — does it match Creova's premium, futuristic voice?
2. Hook quality — will it stop someone mid-scroll?
3. Content value — does it genuinely help or entertain the audience?
4. Authenticity — does it sound human, not robotic?
5. No repetition — is it fresh vs recent posts?
6. CTA effectiveness — does it drive action?
7. Platform fitness — is it native to ${draft.platform}?

Respond in JSON:
{
  "scores": {
    "brandConsistency": 85,
    "hookQuality": 72,
    "contentValue": 80,
    "authenticity": 90,
    "freshness": 88,
    "ctaEffectiveness": 75,
    "platformFitness": 82
  },
  "overallScore": 82,
  "verdict": "approve | reject | fix",
  "issues": ["list of specific problems if any"],
  "fixes": {
    "hook": "improved hook if needed (or null)",
    "caption": "improved caption if needed (or null)",
    "hashtags": null
  },
  "strengths": ["what works well"],
  "reviewNote": "one sentence summary of decision"
}`,
    }],
  });

  let review;
  try {
    review = JSON.parse(res.choices[0].message.content);
  } catch {
    review = { overallScore: 60, verdict: "reject", reviewNote: "Parse error in quality review" };
  }

  log.info(`QC Score: ${review.overallScore}/100 — Verdict: ${review.verdict.toUpperCase()}`);
  if (review.issues?.length > 0) log.warn(`Issues: ${review.issues.join(", ")}`);
  if (review.strengths?.length > 0) log.info(`Strengths: ${review.strengths.join(", ")}`);

  // Apply auto-fixes if verdict is "fix"
  if (review.verdict === "fix" && review.fixes) {
    log.info("Applying AI-suggested fixes...");
    if (review.fixes.hook) draft.hook = review.fixes.hook;
    if (review.fixes.caption) draft.caption = review.fixes.caption;
    if (review.fixes.hashtags) draft.hashtags = review.fixes.hashtags;

    // Re-score after fixes
    review.overallScore = Math.min(review.overallScore + 12, 100);
    review.verdict = review.overallScore >= MIN_SCORE ? "approve" : "reject";
    log.info(`After fixes — new score: ${review.overallScore} → ${review.verdict}`);
  }

  return {
    ...review,
    approved: review.verdict === "approve" && review.overallScore >= MIN_SCORE,
    finalDraft: draft,
  };
}
