// src/config/index.js
// Central config — single source of truth for all agent settings

import dotenv from "dotenv";
dotenv.config();

export const config = {
  // AI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o",
    imageModel: process.env.OPENAI_IMAGE_MODEL || "dall-e-3",
  },

  // Database
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  databaseUrl: process.env.DATABASE_URL,

  // Queue
  redis: { url: process.env.REDIS_URL || "redis://localhost:6379" },

  // Platforms
  twitter: {
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
    bearerToken: process.env.X_BEARER_TOKEN,
  },
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    accountId: process.env.INSTAGRAM_ACCOUNT_ID,
  },

  // Storage
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET || "creova-agent-assets",
    publicUrl: process.env.R2_PUBLIC_URL || "https://assets.creovas.studio",
  },

  // Agent behavior
  agent: {
    timezone: process.env.AGENT_TIMEZONE || "Asia/Kolkata",
    dailyPostLimit: parseInt(process.env.AGENT_DAILY_POST_LIMIT || "3"),
    minQualityScore: parseInt(process.env.AGENT_MIN_QUALITY_SCORE || "75"),
    brandName: process.env.AGENT_BRAND_NAME || "Creova Studio",
    websiteUrl: process.env.AGENT_WEBSITE_URL || "https://creovas.studio",
    targetAudience: process.env.AGENT_TARGET_AUDIENCE || "AI founders, indie hackers, creators, startups",
  },

  // Notifications
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },

  // GitHub
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO || "arun952137-afk/viralforge-ai",
  },

  env: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
};

// ─── BRAND IDENTITY ─────────────────────────────────────────────────────────
// The permanent DNA of Creova Studio that ALL agents use.
export const BRAND = {
  name: "Creova Studio",
  tagline: "The AI-native creator operating system",
  personality: [
    "Futuristic, minimal, premium SaaS aesthetic",
    "Smart and confident — not arrogant",
    "Startup energy — building in public",
    "Slightly bold, never corporate",
    "Speaks to builders, founders, and creators",
    "Uses plain English, no jargon",
    "Occasionally uses metrics and data to build credibility",
    "Never uses generic motivational quotes",
    "Never sounds like a bot — always human",
  ].join(". "),
  voice: {
    tone: "confident, minimal, smart",
    avoids: ["exclamation spam", "cringe phrases", "robotic lists", "generic advice", "motivational fluff"],
    loves: ["sharp insights", "data points", "build-in-public content", "honest founder energy", "contrarian takes"],
  },
  visualStyle: {
    palette: ["#07070F", "#6E42F5", "#0DCCB5", "#F5426E", "#F5A623"],
    theme: "dark, neon-accented, minimal, premium SaaS",
    typography: "Syne display + Inter body",
  },
  competitors: ["Canva", "Midjourney", "Notion", "Runway", "Adobe", "CapCut", "Descript"],
  hashtags: {
    brand: ["#CreovaStudio", "#CreatorOS", "#AIContent"],
    reach: ["#AIStartup", "#BuildInPublic", "#IndieHacker", "#ContentCreation", "#AITools"],
    niche: ["#CreatorEconomy", "#SaaSFounder", "#AIProductivity", "#StartupLife", "#AIFirst"],
  },
};

// ─── CONTENT CALENDAR ───────────────────────────────────────────────────────
// The weekly rotation that prevents repetition and keeps account healthy.
export const CONTENT_CALENDAR = {
  0: { type: "founder_vibe", desc: "Sunday: Founder/startup vibe. Reflect, share journey, build in public." },
  1: { type: "ai_insight", desc: "Monday: AI/startup insight. Sharp take on industry trend." },
  2: { type: "feature_showcase", desc: "Tuesday: Feature showcase. Highlight one Creova capability." },
  3: { type: "meme", desc: "Wednesday: Meme or relatable creator content. High reach day." },
  4: { type: "tutorial", desc: "Thursday: Tutorial or how-to. Educational thread or carousel." },
  5: { type: "comparison", desc: "Friday: Comparison or contrarian take. Before/after or vs content." },
  6: { type: "carousel", desc: "Saturday: Carousel or visual-first post. High saves day." },
};

// ─── POSTING SCHEDULE ───────────────────────────────────────────────────────
// Best engagement windows (IST)
export const POSTING_SCHEDULE = {
  twitter: [
    { hour: 8, minute: 30 },   // Morning scroll
    { hour: 13, minute: 0 },   // Lunch
    { hour: 20, minute: 0 },   // Evening
  ],
  instagram: [
    { hour: 9, minute: 0 },    // Morning
    { hour: 15, minute: 30 },  // Afternoon peak
    { hour: 21, minute: 0 },   // Night (highest saves)
  ],
};
