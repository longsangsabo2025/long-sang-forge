# ================================================
# Setup Test Admin User for Development
# ================================================
# This script creates a test admin account using Supabase CLI
# Email: admin@test.com
# Password: admin123
# ================================================

Write-Host "🚀 Setting up test admin user..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase is running
Write-Host "Checking Supabase status..." -ForegroundColor Yellow
$supabaseStatus = supabase status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase is not running. Starting Supabase..." -ForegroundColor Red
    supabase start
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start Supabase. Please check your setup." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Supabase is running" -ForegroundColor Green
Write-Host ""

# Run the migration to create test user
Write-Host "Creating test admin user..." -ForegroundColor Yellow
supabase db reset --linked-database=false

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Test admin user created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Email: admin@test.com" -ForegroundColor Cyan
    Write-Host "🔑 Password: admin123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 You can now use the 'Quick Login as Admin' button in dev mode!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to create test admin user" -ForegroundColor Red
    Write-Host "Please check the migration files and try again" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
