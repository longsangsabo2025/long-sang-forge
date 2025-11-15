#!/bin/bash
# ================================================
# DEPLOY ALL - One-command deployment script
# ================================================

set -e  # Exit on error

echo "🚀 Starting Full Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ================================================
# 1. CHECK PREREQUISITES
# ================================================
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# ================================================
# 2. LINK SUPABASE PROJECT
# ================================================
echo -e "${BLUE}🔗 Linking Supabase project...${NC}"

# Extract project ref from .env
PROJECT_ID=$(grep VITE_SUPABASE_PROJECT_ID .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$PROJECT_ID" ]; then
    echo "❌ VITE_SUPABASE_PROJECT_ID not found in .env"
    exit 1
fi

echo "Project ID: $PROJECT_ID"
supabase link --project-ref $PROJECT_ID || true

echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# ================================================
# 3. APPLY DATABASE MIGRATIONS
# ================================================
echo -e "${BLUE}🗄️  Applying database migrations...${NC}"

supabase db push

echo -e "${GREEN}✅ Migrations applied${NC}"
echo ""

# ================================================
# 4. SET EDGE FUNCTION SECRETS
# ================================================
echo -e "${BLUE}🔐 Setting Edge Function secrets...${NC}"

# Extract keys from .env
OPENAI_KEY=$(grep VITE_OPENAI_API_KEY .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
ANTHROPIC_KEY=$(grep VITE_ANTHROPIC_API_KEY .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
RESEND_KEY=$(grep VITE_RESEND_API_KEY .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
LINKEDIN_TOKEN=$(grep VITE_LINKEDIN_ACCESS_TOKEN .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
FACEBOOK_TOKEN=$(grep VITE_FACEBOOK_ACCESS_TOKEN .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
FACEBOOK_PAGE=$(grep VITE_FACEBOOK_PAGE_ID .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

# Set secrets (only if not empty)
[ ! -z "$OPENAI_KEY" ] && supabase secrets set OPENAI_API_KEY="$OPENAI_KEY" || echo "⚠️  OpenAI key not set"
[ ! -z "$ANTHROPIC_KEY" ] && supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_KEY" || echo "⚠️  Anthropic key not set"
[ ! -z "$RESEND_KEY" ] && supabase secrets set RESEND_API_KEY="$RESEND_KEY" || echo "⚠️  Resend key not set"
[ ! -z "$LINKEDIN_TOKEN" ] && supabase secrets set LINKEDIN_ACCESS_TOKEN="$LINKEDIN_TOKEN" || echo "⚠️  LinkedIn token not set"
[ ! -z "$FACEBOOK_TOKEN" ] && supabase secrets set FACEBOOK_ACCESS_TOKEN="$FACEBOOK_TOKEN" || echo "⚠️  Facebook token not set"
[ ! -z "$FACEBOOK_PAGE" ] && supabase secrets set FACEBOOK_PAGE_ID="$FACEBOOK_PAGE" || echo "⚠️  Facebook page ID not set"

echo -e "${GREEN}✅ Secrets configured${NC}"
echo ""

# ================================================
# 5. DEPLOY EDGE FUNCTIONS
# ================================================
echo -e "${BLUE}⚡ Deploying Edge Functions...${NC}"

echo "  📦 Deploying trigger-content-writer..."
supabase functions deploy trigger-content-writer

echo "  📦 Deploying send-scheduled-emails..."
supabase functions deploy send-scheduled-emails

echo "  📦 Deploying publish-social-posts..."
supabase functions deploy publish-social-posts

echo -e "${GREEN}✅ Edge Functions deployed${NC}"
echo ""

# ================================================
# 6. BUILD FRONTEND
# ================================================
echo -e "${BLUE}🏗️  Building frontend...${NC}"

npm install
npm run build

echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# ================================================
# 7. VERIFICATION
# ================================================
echo -e "${BLUE}🔍 Verifying deployment...${NC}"

echo "  • Supabase functions:"
supabase functions list

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "Next steps:"
echo "  1. Go to Supabase Dashboard > Database > Replication"
echo "  2. Enable realtime for: ai_agents, activity_logs, content_queue"
echo "  3. Setup cron jobs (see PRODUCTION_DEPLOYMENT_GUIDE.md)"
echo "  4. Deploy frontend to Netlify/Vercel"
echo "  5. Test the system: npm run dev"
echo ""
echo "📚 Full guide: PRODUCTION_DEPLOYMENT_GUIDE.md"
