// src/agents/copywriter.js
// AGENT 3: Copywriter
// Generates platform-native captions, hooks, threads. Human voice, not robotic.

import OpenAI from "openai";
import { config, BRAND } from "../config/index.js";
import { getRecentPosts } from "../db/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("COPYWRITER");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

// Platform-specific constraints
const PLATFORM_RULES = {
  twitter: {
    maxChars: 280,
    style: "Sharp, minimal, punchy. No paragraph walls. Use line breaks. Threads work. Never use all-caps. End with a soft CTA or question.",
    format: "tweet or thread (label each tweet 1/N if thread)",
    hashtagCount: "2-3 max, at end only",
  },
  instagram: {
    maxChars: 2200,
    style: "Hook in first line (before 'more'). Storytelling works. Use emojis sparingly. CTA before hashtags. Paragraph breaks for readability.",
    format: "caption with hook, body, CTA, then hashtags",
    hashtagCount: "15-25, mix of sizes",
  },
};

const CONTENT_TYPE_PROMPTS = {
  ai_insight: "A sharp, data-backed insight about AI, content creation, or the creator economy. Take a clear stance.",
  feature_showcase: `A showcase of one specific ${BRAND.name} capability. Show the value, not just features. Make it feel like a revelation.`,
  meme: "Relatable creator/founder/AI humor. Keep it current and punchy. Avoid cringe. Reference real pain points.",
  tutorial: "A practical how-to that genuinely helps creators or founders. Give real value, not teasers.",
  comparison: `A comparison between old way vs new way (${BRAND.name} way). Contrarian take works well.`,
  carousel: "The first slide hook + key insights. Write as if the viewer only reads slide 1.",
  founder_vibe: `Build-in-public energy. Share a real insight from building ${BRAND.name}. Authentic, not performative.`,
};

export async function runCopywriter(strategy, platform, imageDescription = null) {
  log.info(`✍️ Copywriter generating [${strategy.contentType}] for ${platform}...`);

  const rules = PLATFORM_RULES[platform];
  const typePrompt = CONTENT_TYPE_PROMPTS[strategy.contentType] || CONTENT_TYPE_PROMPTS.ai_insight;

  // Get recent captions to avoid similarity
  const recent = await getRecentPosts(15, platform);
  const recentHooks = recent.map(p => p.hook).filter(Boolean).slice(0, 8).join("\n- ");

  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.72,
    response_format: { type: "json_object" },
    messages: [{
      role: "system",
      content: `You are an elite social media copywriter for ${BRAND.name}. You write content that feels human, premium, and native to each platform. You are NOT a bot. You write like the smartest founder in the room.

Brand personality: ${BRAND.personality}
What to avoid: ${BRAND.voice.avoids.join(", ")}
What works: ${BRAND.voice.loves.join(", ")}`,
    }, {
      role: "user",
      content: `Write ${platform} content for ${BRAND.name}.

PLATFORM RULES:
- Max chars: ${rules.maxChars}
- Style: ${rules.style}
- Format: ${rules.format}
- Hashtags: ${rules.hashtagCount}

CONTENT TYPE: ${strategy.contentType}
GUIDANCE: ${typePrompt}

TODAY'S ANGLE: ${strategy.chosenTrend}
CREOVA CONNECTION: ${strategy.angle}
TARGET EMOTION: ${strategy.targetEmotion}
CTA GOAL: ${strategy.callToAction}
WEBSITE: ${config.agent.websiteUrl}

${imageDescription ? `IMAGE DESCRIPTION (write caption to complement this): ${imageDescription}` : ""}

RECENTLY USED HOOKS (DO NOT REPEAT SIMILAR):
- ${recentHooks || "none yet"}

Write 3 variants — pick the best one as "chosen".

Respond in JSON:
{
  "chosen": {
    "hook": "the opening line (before the fold)",
    "caption": "full caption text",
    "hashtags": ["array", "of", "hashtags"],
    "altText": "image alt text for accessibility"
  },
  "variants": [
    { "hook": "alt hook 1", "caption": "alt caption 1" },
    { "hook": "alt hook 2", "caption": "alt caption 2" }
  ],
  "contentInsight": "why this angle will work"
}`,
    }],
  });

  let content;
  try {
    content = JSON.parse(res.choices[0].message.content);
  } catch {
    content = {
      chosen: {
        hook: `AI is changing content creation — and ${BRAND.name} is leading it.`,
        caption: `AI is changing content creation — and ${BRAND.name} is leading it.\n\nWhile most tools give you features, we give you an operating system.\n\nScript → Voice → Edit → Optimize → Publish.\nAll automated. All premium.\n\n${config.agent.websiteUrl}`,
        hashtags: [...BRAND.hashtags.brand, ...BRAND.hashtags.reach.slice(0, 4)],
        altText: "Creova Studio interface",
      },
      variants: [],
      contentInsight: "Fallback content",
    };
  }

  log.info(`Caption generated: "${content.chosen.hook.slice(0, 60)}..."`);
  log.info(`Insight: ${content.contentInsight}`);

  return content;
}

// Generate a thread (for Twitter)
export async function generateThread(strategy) {
  log.info(`🧵 Generating thread: "${strategy.chosenTrend.slice(0, 50)}..."`);

  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.65,
    response_format: { type: "json_object" },
    messages: [{
      role: "system",
      content: `You write viral Twitter threads for ${BRAND.name}. Each tweet must standalone but flow into the next. No filler tweets.`,
    }, {
      role: "user",
      content: `Write a 5-8 tweet thread about: ${strategy.chosenTrend}
Creova angle: ${strategy.angle}
CTA: Visit ${config.agent.websiteUrl}

Rules:
- Tweet 1: Powerful hook with scroll-stop power
- Tweets 2-6: Each tweet = one valuable insight
- Last tweet: CTA + website link
- Each tweet < 270 chars
- Human voice, never robotic

JSON: { "tweets": ["tweet1", "tweet2", ...] }`,
    }],
  });

  try {
    const parsed = JSON.parse(res.choices[0].message.content);
    return parsed.tweets || [];
  } catch { return []; }
}
