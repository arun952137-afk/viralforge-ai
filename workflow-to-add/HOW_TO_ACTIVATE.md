# How to activate the GitHub Actions workflow

## Option A — GitHub Web UI (easiest, 2 minutes)

1. Go to: https://github.com/arun952137-afk/viralforge-ai/new/creova-agent
2. In the filename box, type: `.github/workflows/agent.yml`
3. Copy the contents of `PASTE_THIS_AS_agent.yml.txt` in this folder
4. Paste into the editor
5. Click "Commit changes" → "Commit directly to creova-agent branch"

Done. The agent starts running on schedule immediately.

## Option B — Generate a token with workflow scope

1. Go to: https://github.com/settings/tokens/new
2. Select scopes: `repo` + `workflow`
3. Generate token
4. Run: `GITHUB_TOKEN=ghp_yourtoken node scripts/deploy-workflow.js`
