// src/agents/designer.js
// AGENT 4: Designer
// Generates visuals using OpenAI DALL-E 3. Always Creova brand-consistent.

import OpenAI from "openai";
import axios from "axios";
import { config, BRAND } from "../config/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("DESIGNER");
const openai = new OpenAI({ apiKey: config.openai.apiKey });

// Visual styles that rotate to avoid repetition
const VISUAL_STYLES = [
  "futuristic dark UI dashboard with neon purple and teal accents on deep black background",
  "minimal startup poster, dark background, geometric shapes, premium typography, electric purple gradient",
  "cinematic AI visualization, deep space dark, glowing data streams in purple and teal",
  "premium SaaS screenshot mockup on dark background, modern UI, neon highlights",
  "bold startup announcement graphic, dark theme, Syne-style typography, minimal design",
  "abstract AI neural network visualization, dark, glowing purple connections, premium feel",
  "startup founder aesthetic, dark moody background, minimal text, premium gradient accent",
  "product showcase on dark background, floating UI elements, neon glow, ultra premium",
];

// Content type → visual strategy mapping
const VISUAL_MAP = {
  ai_insight:       "data visualization or abstract AI concept",
  feature_showcase: "product UI mockup or feature demonstration",
  meme:             "relatable creator scene or comparison graphic",
  tutorial:         "step-by-step visual or infographic style",
  comparison:       "before/after or split comparison layout",
  carousel:         "first slide hero graphic",
  founder_vibe:     "startup journey or building aesthetic",
};

export async function runDesigner(strategy, content) {
  log.info(`🎨 Designer generating visual for [${strategy.contentType}]...`);

  const styleIndex = Math.floor(Date.now() / 86400000) % VISUAL_STYLES.length;
  const visualStyle = VISUAL_STYLES[styleIndex];
  const visualApproach = VISUAL_MAP[strategy.contentType] || "premium startup poster";

  // Build the prompt
  const prompt = await buildImagePrompt(strategy, content, visualStyle, visualApproach);
  log.info(`Image prompt: "${prompt.slice(0, 100)}..."`);

  try {
    const response = await openai.images.generate({
      model: config.openai.imageModel,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    log.info(`✅ Image generated successfully`);
    return {
      url: imageUrl,
      prompt,
      revisedPrompt,
      description: await describeImageForCaption(prompt, strategy),
    };
  } catch (e) {
    log.error("Image generation failed", e.message);
    // Return a fallback text-only signal
    return { url: null, prompt, revisedPrompt: null, description: null };
  }
}

async function buildImagePrompt(strategy, content, visualStyle, visualApproach) {
  const res = await openai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.5,
    messages: [{
      role: "system",
      content: "You write precise DALL-E 3 image prompts for premium startup social media content. Be specific about composition, colors, typography placement, and mood.",
    }, {
      role: "user",
      content: `Create a DALL-E 3 prompt for ${BRAND.name} social media.

Content topic: ${strategy.chosenTrend}
Content type: ${strategy.contentType} — ${visualApproach}
Brand colors: Deep black (#07070F), Electric Purple (#6E42F5), Teal (#0DCCB5), Rose (#F5426E)
Visual style: ${visualStyle}
Caption hook: "${content?.chosen?.hook || ""}"

Requirements:
- NO faces (avoids DALL-E policy issues)
- NO text in image (we add text separately)
- Ultra premium, investor-grade aesthetic
- Looks like Linear, Notion, or Vercel's design team made it
- NOT generic or stock-photo-looking
- Very specific about lighting, composition, details

Write ONLY the image prompt (1 paragraph, ~100 words):`,
    }],
  });

  return res.choices[0].message.content.trim();
}

async function describeImageForCaption(prompt, strategy) {
  // A short description the copywriter can reference
  return `${strategy.contentType} visual: ${strategy.chosenTrend.slice(0, 60)}`;
}

// Download image buffer (for Instagram upload)
export async function downloadImageBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
    return Buffer.from(res.data);
  } catch (e) {
    log.error("Image download failed", e.message);
    return null;
  }
}

// Upload image to Cloudflare R2 (for permanent URL)
export async function uploadToStorage(buffer, filename) {
  // R2 upload via S3-compatible API
  // If no R2 configured, just return the OpenAI URL (temporary)
  if (!config.r2.accessKeyId) {
    log.warn("No R2 configured — using direct OpenAI URL (expires in 1 hour)");
    return null;
  }

  try {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
    });

    const key = `agent-posts/${new Date().toISOString().slice(0,10)}/${filename}`;
    await client.send(new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    }));

    return `${config.r2.publicUrl}/${key}`;
  } catch (e) {
    log.error("R2 upload failed", e.message);
    return null;
  }
}
