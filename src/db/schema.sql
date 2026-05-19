-- ═══════════════════════════════════════════════════════════════
-- CREOVA GROWTH AGENT — Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── POSTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform          TEXT NOT NULL,           -- 'twitter' | 'instagram'
  content_type      TEXT NOT NULL,           -- 'ai_insight' | 'feature_showcase' | 'meme' | etc
  topic             TEXT,
  hook              TEXT,
  caption           TEXT NOT NULL,
  hashtags          TEXT[],
  image_url         TEXT,
  image_prompt      TEXT,
  trend_source      TEXT,
  quality_score     INT DEFAULT 0,
  status            TEXT DEFAULT 'pending',  -- 'pending' | 'approved' | 'published' | 'failed' | 'skipped'
  scheduled_at      TIMESTAMPTZ,
  posted_at         TIMESTAMPTZ,
  platform_post_id  TEXT,
  engagement        JSONB DEFAULT '{}',
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Semantic embedding for duplicate detection
ALTER TABLE agent_posts ADD COLUMN IF NOT EXISTS
  caption_embedding vector(1536);

CREATE INDEX IF NOT EXISTS agent_posts_platform_idx ON agent_posts(platform);
CREATE INDEX IF NOT EXISTS agent_posts_status_idx ON agent_posts(status);
CREATE INDEX IF NOT EXISTS agent_posts_created_at_idx ON agent_posts(created_at DESC);

-- ─── TRENDS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_trends (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id         TEXT UNIQUE NOT NULL,
  topic            TEXT NOT NULL,
  source           TEXT NOT NULL,           -- 'twitter' | 'reddit' | 'producthunt' | 'hackernews'
  velocity         TEXT,                    -- 'exploding' | 'rising' | 'stable'
  relevance_score  INT DEFAULT 0,
  raw_data         JSONB DEFAULT '{}',
  expires_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_trends_expires_idx ON agent_trends(expires_at);
CREATE INDEX IF NOT EXISTS agent_trends_score_idx ON agent_trends(relevance_score DESC);

-- ─── ANALYTICS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_analytics (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id          UUID UNIQUE REFERENCES agent_posts(id) ON DELETE CASCADE,
  impressions      INT DEFAULT 0,
  likes            INT DEFAULT 0,
  comments         INT DEFAULT 0,
  shares           INT DEFAULT 0,
  saves            INT DEFAULT 0,
  clicks           INT DEFAULT 0,
  engagement_rate  DECIMAL(5,2) DEFAULT 0,
  performance_score INT DEFAULT 0,          -- Computed weighted score 0-100
  checked_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AGENT STATE ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_state (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO agent_state (key, value)
VALUES ('main', '{
  "totalPostsPublished": 0,
  "totalImpressions": 0,
  "currentGoal": "grow followers and drive signups",
  "learnings": [],
  "brandScore": 80
}')
ON CONFLICT (key) DO NOTHING;

-- ─── FEATURES (GitHub auto-detection) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_features (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commit_sha   TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  announced    BOOLEAN DEFAULT false,
  detected_at  TIMESTAMPTZ DEFAULT NOW(),
  announced_at TIMESTAMPTZ
);

-- ─── HOOKS LIBRARY ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_hooks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hook_text     TEXT NOT NULL,
  hook_type     TEXT,                       -- 'curiosity' | 'authority' | 'pain' | 'contrast' | etc
  performance   INT DEFAULT 0,
  used_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USEFUL VIEWS ────────────────────────────────────────────────────────────

-- Best performing content types
CREATE OR REPLACE VIEW agent_performance_by_type AS
SELECT
  p.content_type,
  p.platform,
  COUNT(*) as post_count,
  AVG(a.performance_score) as avg_score,
  AVG(a.likes) as avg_likes,
  AVG(a.engagement_rate) as avg_engagement
FROM agent_posts p
LEFT JOIN agent_analytics a ON a.post_id = p.id
WHERE p.status = 'published'
GROUP BY p.content_type, p.platform
ORDER BY avg_score DESC;

-- Recent activity feed
CREATE OR REPLACE VIEW agent_activity_feed AS
SELECT
  p.id,
  p.platform,
  p.content_type,
  p.topic,
  p.caption,
  p.status,
  p.posted_at,
  p.quality_score,
  a.likes,
  a.impressions,
  a.performance_score
FROM agent_posts p
LEFT JOIN agent_analytics a ON a.post_id = p.id
ORDER BY COALESCE(p.posted_at, p.created_at) DESC;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Service key bypasses RLS, but enable for safety
ALTER TABLE agent_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_features ENABLE ROW LEVEL SECURITY;

-- Only service role can access (no anon access)
CREATE POLICY "service_only" ON agent_posts USING (true) WITH CHECK (true);
CREATE POLICY "service_only" ON agent_trends USING (true) WITH CHECK (true);
CREATE POLICY "service_only" ON agent_analytics USING (true) WITH CHECK (true);
CREATE POLICY "service_only" ON agent_state USING (true) WITH CHECK (true);
CREATE POLICY "service_only" ON agent_features USING (true) WITH CHECK (true);
