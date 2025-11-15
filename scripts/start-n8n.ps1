# ================================================
# N8N STARTUP SCRIPT (Windows PowerShell)
# Starts n8n with optimized configuration
# ================================================

Write-Host "🚀 Starting n8n with optimized configuration..." -ForegroundColor Green

# Load environment variables from .n8n.env
if (Test-Path ".n8n.env") {
    Write-Host "📋 Loading n8n environment variables..." -ForegroundColor Yellow
    Get-Content ".n8n.env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Create n8n data directory if it doesn't exist
$n8nDir = "$env:USERPROFILE\.n8n"
if (!(Test-Path $n8nDir)) {
    Write-Host "📁 Creating n8n data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $n8nDir -Force | Out-Null
}

Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   - Database: SQLite with pool size $($env:DB_SQLITE_POOL_SIZE ?? '10')" -ForegroundColor White
Write-Host "   - Task Runners: $($env:N8N_RUNNERS_ENABLED ?? 'true')" -ForegroundColor White
Write-Host "   - Host: $($env:N8N_HOST ?? 'localhost'):$($env:N8N_PORT ?? '5678')" -ForegroundColor White
Write-Host "   - Webhook URL: $($env:WEBHOOK_URL ?? 'http://localhost:5678')" -ForegroundColor White
Write-Host ""

# Start n8n
Write-Host "⚡ Starting n8n..." -ForegroundColor Green
try {
    npx n8n start
} catch {
    Write-Host "❌ Failed to start n8n: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🛑 n8n stopped." -ForegroundColor Yellow