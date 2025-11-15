# ================================================
# Run Supabase Migrations via REST API
# ================================================

param(
    [string]$ServiceRoleKey = $env:VITE_SUPABASE_SERVICE_ROLE_KEY,
    [string]$ProjectUrl = $env:VITE_SUPABASE_URL
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Supabase Migrations Runner" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $ServiceRoleKey) {
    $ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY"
}

if (-not $ProjectUrl) {
    $ProjectUrl = "https://diexsbzqwsbpilsymnfb.supabase.co"
}

$headers = @{
    'apikey' = $ServiceRoleKey
    'Authorization' = "Bearer $ServiceRoleKey"
    'Content-Type' = 'application/json'
    'Prefer' = 'return=representation'
}

Write-Host "Project URL: $ProjectUrl" -ForegroundColor Gray
Write-Host ""

# Get all migration files
$migrationsPath = Join-Path $PSScriptRoot "..\supabase\migrations"
$migrationFiles = Get-ChildItem -Path $migrationsPath -Filter "*.sql" | Sort-Object Name

Write-Host "Found $($migrationFiles.Count) migration files" -ForegroundColor Yellow
Write-Host ""

# Read and execute each migration
foreach ($file in $migrationFiles) {
    Write-Host "[$($file.Name)]" -ForegroundColor Cyan -NoNewline
    Write-Host " Running..." -NoNewline
    
    try {
        $sqlContent = Get-Content -Path $file.FullName -Raw
        
        # Execute via Supabase SQL endpoint (using rpc if available)
        $body = @{
            query = $sqlContent
        } | ConvertTo-Json
        
        # Note: This is a simplified approach. For production, use Supabase CLI or Database SDK
        # For now, we'll output the SQL for manual execution
        
        Write-Host " ⚠️  MANUAL EXECUTION REQUIRED" -ForegroundColor Yellow
        Write-Host "     Copy SQL from: $($file.FullName)" -ForegroundColor Gray
        
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migration Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: REST API cannot execute DDL SQL" -ForegroundColor Yellow
Write-Host ""
Write-Host "To run migrations, you have 3 options:" -ForegroundColor White
Write-Host ""
Write-Host "Option 1: Supabase Dashboard (Recommended)" -ForegroundColor Green
Write-Host "  1. Go to: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/editor/sql" -ForegroundColor Gray
Write-Host "  2. Copy content from: $migrationsPath" -ForegroundColor Gray
Write-Host "  3. Paste and run each migration file" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Supabase CLI" -ForegroundColor Green
Write-Host "  Run: supabase db push" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 3: Use Node.js script" -ForegroundColor Green
Write-Host "  Run: node scripts/run-migrations.js" -ForegroundColor Gray
Write-Host ""

# Show migration files to run
Write-Host "Migration files to execute:" -ForegroundColor Cyan
foreach ($file in $migrationFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to open migration files folder..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open migrations folder
Start-Process explorer.exe $migrationsPath
