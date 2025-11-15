# ================================================
# DEPLOY ALL - Windows PowerShell deployment script
# ================================================

$ErrorActionPreference = "Stop"

Write-Host "Starting Full Deployment..." -ForegroundColor Cyan
Write-Host ""

# ================================================
# 1. CHECK PREREQUISITES
# ================================================
Write-Host "Checking prerequisites..." -ForegroundColor Blue

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check Supabase CLI (prefer local; fallback to npx)
$UseNpxSupabase = $false
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "[WARN] Supabase CLI not found in PATH. Will use 'npx supabase'." -ForegroundColor Yellow
    $UseNpxSupabase = $true
}

function Invoke-Supabase {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )
    if ($UseNpxSupabase) {
        & npx supabase @Args
    } else {
        & supabase @Args
    }
}

Write-Host "[OK] Prerequisites OK" -ForegroundColor Green
Write-Host ""

# ================================================
# 2. LINK SUPABASE PROJECT
# ================================================
Write-Host "Linking Supabase project..." -ForegroundColor Blue

# Read .env and provide a robust env parser
$envContent = Get-Content .env -Raw

function Get-EnvVar {
    param([string]$name)
    $pattern = "^\s*$name\s*=\s*(.+)$"
    foreach ($line in ($envContent -split "`n")) {
        if ($line -match $pattern) {
            $val = $matches[1].Trim()
            $val = $val.Trim('"').Trim("'")
            return $val
        }
    }
    return $null
}

$projectId = Get-EnvVar "VITE_SUPABASE_PROJECT_ID"

if (-not $projectId) {
    Write-Host "[ERROR] VITE_SUPABASE_PROJECT_ID not found in .env" -ForegroundColor Red
    exit 1
}

Write-Host "Project ID: $projectId"
Invoke-Supabase link --project-ref $projectId

Write-Host "[OK] Project linked" -ForegroundColor Green
Write-Host ""

# ================================================
# 3. APPLY DATABASE MIGRATIONS
# ================================================
Write-Host "Applying database migrations..." -ForegroundColor Blue

Invoke-Supabase db push

Write-Host "[OK] Migrations applied" -ForegroundColor Green
Write-Host ""

# ================================================
# 4. SET EDGE FUNCTION SECRETS
# ================================================
Write-Host "Setting Edge Function secrets..." -ForegroundColor Blue

$openaiKey = Get-EnvVar "VITE_OPENAI_API_KEY"
$anthropicKey = Get-EnvVar "VITE_ANTHROPIC_API_KEY"
$resendKey = Get-EnvVar "VITE_RESEND_API_KEY"
$linkedinToken = Get-EnvVar "VITE_LINKEDIN_ACCESS_TOKEN"
$facebookToken = Get-EnvVar "VITE_FACEBOOK_ACCESS_TOKEN"
$facebookPage = Get-EnvVar "VITE_FACEBOOK_PAGE_ID"

# Set secrets (only if not empty)
if ($openaiKey) { Invoke-Supabase secrets set OPENAI_API_KEY="$openaiKey" } else { Write-Host "[WARN] OpenAI key not set" -ForegroundColor Yellow }
if ($anthropicKey) { Invoke-Supabase secrets set ANTHROPIC_API_KEY="$anthropicKey" } else { Write-Host "[WARN] Anthropic key not set" -ForegroundColor Yellow }
if ($resendKey) { Invoke-Supabase secrets set RESEND_API_KEY="$resendKey" } else { Write-Host "[WARN] Resend key not set" -ForegroundColor Yellow }
if ($linkedinToken) { Invoke-Supabase secrets set LINKEDIN_ACCESS_TOKEN="$linkedinToken" } else { Write-Host "[WARN] LinkedIn token not set" -ForegroundColor Yellow }
if ($facebookToken) { Invoke-Supabase secrets set FACEBOOK_ACCESS_TOKEN="$facebookToken" } else { Write-Host "[WARN] Facebook token not set" -ForegroundColor Yellow }
if ($facebookPage) { Invoke-Supabase secrets set FACEBOOK_PAGE_ID="$facebookPage" } else { Write-Host "[WARN] Facebook page ID not set" -ForegroundColor Yellow }

Write-Host "[OK] Secrets configured" -ForegroundColor Green
Write-Host ""

# ================================================
# 5. DEPLOY EDGE FUNCTIONS
# ================================================
Write-Host "Deploying Edge Functions..." -ForegroundColor Blue

Write-Host "  Deploying trigger-content-writer..."
Invoke-Supabase functions deploy trigger-content-writer

Write-Host "  Deploying send-scheduled-emails..."
Invoke-Supabase functions deploy send-scheduled-emails

Write-Host "  Deploying publish-social-posts..."
Invoke-Supabase functions deploy publish-social-posts

Write-Host "[OK] Edge Functions deployed" -ForegroundColor Green
Write-Host ""

# ================================================
# 6. BUILD FRONTEND
# ================================================
Write-Host "Building frontend..." -ForegroundColor Blue

npm install
npm run build

Write-Host "[OK] Frontend built" -ForegroundColor Green
Write-Host ""

# ================================================
# 7. VERIFICATION
# ================================================
Write-Host "Verifying deployment..." -ForegroundColor Blue

Write-Host "  • Supabase functions:"
Invoke-Supabase functions list

Write-Host ""
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Go to Supabase Dashboard > Database > Replication"
Write-Host "  2. Enable realtime for: ai_agents, activity_logs, content_queue"
Write-Host "  3. Setup cron jobs (see PRODUCTION_DEPLOYMENT_GUIDE.md)"
Write-Host "  4. Deploy frontend to Netlify/Vercel"
Write-Host "  5. Test the system: npm run dev"
Write-Host ""
Write-Host "Full guide: PRODUCTION_DEPLOYMENT_GUIDE.md"
