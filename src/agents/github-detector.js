// src/agents/github-detector.js
// AUTO FEATURE DETECTION
// Watches GitHub commits — when you push updates to Creova,
// this agent automatically creates announcement posts.

import axios from "axios";
import OpenAI from "openai";
import { config, BRAND } from "../config/index.js";
import { saveDetectedFeature, getUnAnnouncedFeatures, markFeatureAnnounced } from "../db/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("GITHUB-DETECTOR");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

const IGNORE_COMMITS = [
  "merge", "wip", "fix typo", "update readme", "chore:", "docs:", "style:",
  "refactor:", "test:", "bump version", "update dependencies",
];

export async function detectNewFeatures() {
  log.info("🔍 Checking GitHub for new features...");

  if (!config.github.token) {
    log.warn("No GitHub token — skipping feature detection");
    return [];
  }

  try {
    const res = await axios.get(
      `https://api.github.com/repos/${config.github.repo}/commits?per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${config.github.token}`,
          "User-Agent": "CreovaGrowthAgent/1.0",
        },
        timeout: 10000,
      }
    );

    const commits = res.data || [];
    const newFeatures = [];

    for (const commit of commits) {
      const msg = commit.commit.message.toLowerCase();
      const sha = commit.sha.slice(0, 8);

      // Skip boring commits
      if (IGNORE_COMMITS.some(ig => msg.includes(ig))) continue;

      // Only care about feat/add/build/launch commits
      const isFeature = msg.startsWith("feat") || msg.startsWith("add") ||
                        msg.startsWith("build") || msg.startsWith("launch") ||
                        msg.includes("new:") || msg.includes("✨") || msg.includes("🚀");

      if (!isFeature) continue;

      // AI: is this worth announcing?
      const analysis = await analyzeCommit(commit.commit.message, commit.commit.author.date);
      if (analysis.shouldAnnounce) {
        await saveDetectedFeature({
          sha: commit.sha,
          title: analysis.featureTitle,
          description: analysis.announcement,
        });
        newFeatures.push(analysis);
        log.info(`🚀 New feature detected: ${analysis.featureTitle}`);
      }
    }

    return newFeatures;
  } catch (e) {
    log.error("GitHub detection failed", e.message);
    return [];
  }
}

async function analyzeCommit(commitMessage, commitDate) {
  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [{
      role: "user",
      content: `Analyze this Git commit for ${BRAND.name} and decide if it's worth a social media announcement.

Commit: "${commitMessage}"
Date: ${commitDate}

${BRAND.name} is a creator AI OS (scripts, analytics, voice, video editor, trends, calendar).

Should this be announced publicly? Only "yes" if it's a meaningful new feature or improvement that users/creators would care about.

JSON:
{
  "shouldAnnounce": true/false,
  "featureTitle": "Clean short feature name",
  "userBenefit": "What value this gives creators",
  "announcement": "2-3 sentence social media teaser",
  "excitement": "high | medium | low"
}`,
    }],
  });

  try { return JSON.parse(res.choices[0].message.content); }
  catch { return { shouldAnnounce: false }; }
}

// Generate launch post for a detected feature
export async function generateFeatureLaunchPost(feature, platform) {
  log.info(`🎉 Generating launch post for: ${feature.title}`);

  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.65,
    response_format: { type: "json_object" },
    messages: [{
      role: "system",
      content: `You write launch announcements for ${BRAND.name}. Startup energy. Premium tone. Gets people excited about new features.`,
    }, {
      role: "user",
      content: `Write a ${platform} launch announcement for this new Creova feature.

Feature: ${feature.title}
What it does: ${feature.description}

Requirements:
- Platform: ${platform}
- Startup launch energy (not corporate)
- Make creators feel FOMO if they're not using it
- Link to ${config.agent.websiteUrl}
- ${platform === "twitter" ? "Under 270 chars or thread" : "Hook + body + CTA + hashtags"}

JSON: {
  "hook": "first line",
  "caption": "full post",
  "hashtags": ["tags"],
  "imagePrompt": "DALL-E prompt for launch visual"
}`,
    }],
  });

  try {
    const post = JSON.parse(res.choices[0].message.content);
    await markFeatureAnnounced(feature.commit_sha);
    return post;
  } catch { return null; }
}
