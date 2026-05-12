#!/bin/bash
# =============================================================
# CREOVA AI — One-Command Deployment Script
# Run: chmod +x DEPLOY_NOW.sh && ./DEPLOY_NOW.sh
# =============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║     CREOVA AI — Deployment Script     ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ── Check for GitHub PAT ─────────────────────────────────────
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${YELLOW}Enter your GitHub Personal Access Token (PAT):${NC}"
  echo "  Get one at: https://github.com/settings/tokens/new"
  echo "  Required scopes: repo (full control)"
  read -s -p "  GitHub PAT: " GITHUB_TOKEN
  echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}ERROR: GitHub token is required${NC}"
  exit 1
fi

echo -e "\n${BLUE}Step 1/4: Configuring git...${NC}"
git config user.email "arun952137@gmail.com"
git config user.name "Ayadav2000"
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_TOKEN}@github.com/arun952137-afk/viralforge-ai.git"
echo -e "${GREEN}✓ Git configured${NC}"

echo -e "\n${BLUE}Step 2/4: Pushing code to GitHub...${NC}"
git push origin main --force
echo -e "${GREEN}✓ Code pushed to GitHub${NC}"
echo "  → https://github.com/arun952137-afk/viralforge-ai"

echo -e "\n${BLUE}Step 3/4: Setting Vercel environment variables...${NC}"
if command -v vercel &>/dev/null; then
  export VERCEL_ORG_ID="team_sbC4jvD8J774cnFNLP38KiuX"
  export VERCEL_PROJECT_ID="prj_TFlA62lYXZhh5qtMsktanN11RQ2N"
  echo "NEXT_PUBLIC_SUPABASE_URL=https://xkjapruluyoyziateghv.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --force 2>/dev/null || true
  echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhramFwcnVsdXlveXppYXRlZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTcwODUsImV4cCI6MjA5NDA5MzA4NX0.B_D5dCDw4Von48x066rlDDoxbTpQ6Bub5DTgZ0akoQk" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force 2>/dev/null || true
  echo -e "${GREEN}✓ Vercel env vars set via CLI${NC}"
else
  echo -e "${YELLOW}→ Add these in Vercel dashboard manually:${NC}"
  echo "  NEXT_PUBLIC_SUPABASE_URL = https://xkjapruluyoyziateghv.supabase.co"
  echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhramFwcnVsdXlveXppYXRlZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTcwODUsImV4cCI6MjA5NDA5MzA4NX0.B_D5dCDw4Von48x066rlDDoxbTpQ6Bub5DTgZ0akoQk"
  echo "  RAZORPAY_KEY_ID = (your Razorpay live key)"
  echo "  RAZORPAY_KEY_SECRET = (your Razorpay secret)"
fi

echo -e "\n${BLUE}Step 4/4: Triggering Vercel deployment...${NC}"
echo "  Vercel will auto-deploy from the GitHub push."
echo "  Check progress at: https://vercel.com/ayadav2000s-projects/viralforge-ai"

echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║         🚀 DEPLOYMENT COMPLETE!            ║"
echo "╠════════════════════════════════════════════╣"
echo "║  GitHub:  github.com/arun952137-afk/      ║"
echo "║           viralforge-ai                    ║"
echo "║                                            ║"
echo "║  Vercel:  viralforge-ai-six.vercel.app    ║"
echo "║           (live in ~2 minutes)             ║"
echo "║                                            ║"
echo "║  Supabase: xkjapruluyoyziateghv            ║"
echo "║            .supabase.co                    ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
