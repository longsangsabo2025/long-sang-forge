#!/usr/bin/env bash

# ================================================
# N8N STARTUP SCRIPT
# Starts n8n with optimized configuration
# ================================================

echo "🚀 Starting n8n with optimized configuration..."

# Load environment variables
if [ -f .n8n.env ]; then
    echo "📋 Loading n8n environment variables..."
    export $(cat .n8n.env | grep -v '^#' | xargs)
fi

# Create n8n data directory if it doesn't exist
if [ ! -d ~/.n8n ]; then
    echo "📁 Creating n8n data directory..."
    mkdir -p ~/.n8n
fi

echo "🔧 Configuration:"
echo "   - Database: SQLite with pool size ${DB_SQLITE_POOL_SIZE:-10}"
echo "   - Task Runners: ${N8N_RUNNERS_ENABLED:-true}"
echo "   - Host: ${N8N_HOST:-localhost}:${N8N_PORT:-5678}"
echo "   - Webhook URL: ${WEBHOOK_URL:-http://localhost:5678}"
echo ""

# Start n8n
echo "⚡ Starting n8n..."
npx n8n start

echo "🛑 n8n stopped."