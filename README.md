# 🤖 Creova Growth Agent

**Autonomous social growth operating system for Creova Studio.**  
**INTERNAL USE ONLY — Not for users.**

---

## What This Does

Every day, automatically:
1. **Scans the internet** — HN, Reddit, Product Hunt, X for AI/creator trends
2. **Thinks strategically** — decides best content type for the day (follows calendar)
3. **Writes copy** — platform-native captions, hooks, threads (human voice, not robotic)
4. **Generates visuals** — DALL-E 3 branded images
5. **Reviews quality** — AI gates every post (rejects < 75/100 score)
6. **Posts automatically** — Twitter/X + Instagram
7. **Tracks analytics** — logs engagement 24h later, feeds learnings back
8. **Detects new features** — watches GitHub, auto-announces your updates

---

## Architecture

```
src/
├── agent/
│   └── orchestrator.js    ← THE BRAIN (central coordinator)
├── agents/
│   ├── trend-hunter.js    ← Agent 1: Scrapes internet for trends
│   ├── strategist.js      ← Agent 2: Decides what to post today
│   ├── copywriter.js      ← Agent 3: Writes captions & hooks
│   ├── designer.js        ← Agent 4: Generates images
│   ├── quality-reviewer.js← Agent 5: Gates content quality
│   ├── publisher.js       ← Agent 6+7: Posts & tracks analytics
│   └── github-detector.js ← Agent 8: Auto feature announcement
├── db/
│   ├── index.js           ← All database operations
│   └── schema.sql         ← Supabase tables (run once)
├── services/
│   └── notifications.js   ← Telegram alerts
├── config/
│   └── index.js           ← All config + brand identity
├── lib/
│   └── logger.js          ← Logging
└── index.js               ← Entry point
```

---

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/arun952137-afk/creova-growth-agent
cd creova-growth-agent
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
# Fill in all values
```

**Required:**
- `OPENAI_API_KEY` — GPT-4o + DALL-E 3
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` — memory system
- `X_API_KEY` + secrets — Twitter posting (needs write access)
- `INSTAGRAM_ACCESS_TOKEN` + `INSTAGRAM_ACCOUNT_ID` — Meta Graph API

**Optional but recommended:**
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — get alerts when it posts
- `GITHUB_TOKEN` — auto feature announcement
- `R2_*` — permanent image storage

### 3. Database Setup
Run `src/db/schema.sql` in Supabase SQL Editor.

### 4. Twitter API Setup
1. Go to [developer.x.com](https://developer.x.com)
2. Create app with **Read + Write** permissions
3. Generate Access Token & Secret under your account
4. Copy all 4 keys to `.env`

### 5. Instagram API Setup
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create app → Add Instagram Graph API
3. Connect your Instagram Business account
4. Get long-lived access token
5. Get your Instagram Account ID

---

## Running

### Development (test mode — doesn't actually post)
```bash
NODE_ENV=development node src/index.js start
```

### Production (live posting)
```bash
NODE_ENV=production node src/index.js start
```

### Manual Commands
```bash
# Post right now to Twitter
node src/index.js post-now twitter

# Post right now to Instagram  
node src/index.js post-now instagram

# Check GitHub for new features to announce
node src/index.js detect-features
```

---

## Deployment (Railway — Recommended)

Railway runs persistent Node.js workers. Perfect for this.

1. Push to GitHub
2. Connect repo to Railway
3. Set all env vars in Railway dashboard
4. Deploy — it runs 24/7

**Alternative:** Render, Fly.io, or any VPS.

---

## Posting Schedule (IST)

**Twitter/X:**
- 8:30 AM — Morning scroll
- 1:00 PM — Lunch break
- 8:00 PM — Evening

**Instagram:**
- 9:00 AM — Morning
- 3:30 PM — Afternoon peak
- 9:00 PM — Night (highest saves)

---

## Content Calendar

| Day | Content Type |
|-----|-------------|
| Monday | AI/startup insight |
| Tuesday | Feature showcase |
| Wednesday | Meme / relatable |
| Thursday | Tutorial / how-to |
| Friday | Comparison / contrarian |
| Saturday | Carousel / visual |
| Sunday | Founder vibe / build-in-public |

---

## Quality Gate

Every post is scored by AI before publishing:

| Metric | Weight |
|--------|--------|
| Brand consistency | 15% |
| Hook quality | 20% |
| Content value | 20% |
| Authenticity | 15% |
| Freshness (no repeat) | 15% |
| CTA effectiveness | 10% |
| Platform fitness | 5% |

**Minimum score: 75/100** — below this, the post is rejected and you get a Telegram alert.

---

## Security

- No passwords stored anywhere
- All tokens in environment variables
- Supabase RLS enabled
- Service key only (no anon access)
- Non-root Docker user

---

## Monitoring

- **Logs:** `logs/agent-YYYY-MM-DD.log`
- **Telegram:** Real-time alerts for posts, failures, QC rejects
- **Supabase:** Full post history in `agent_posts` table
- **Dashboard view:** `agent_activity_feed` SQL view
