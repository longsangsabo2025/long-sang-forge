# ================================================
# LONG SANG AI AUTOMATION - SYSTEM MANAGER
# Quản lý toàn bộ hệ thống AI Automation
# ================================================

param(
    [Parameter()]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action = "start",
    
    [switch]$Background,
    [switch]$WithTunnel
)

$ProjectPath = "d:\0.APP\1510\long-sang-forge"

function Write-Banner {
    Write-Host "`n🤖 ================================" -ForegroundColor Cyan
    Write-Host "   LONG SANG AI AUTOMATION SYSTEM" -ForegroundColor Green
    Write-Host "   Action: $Action" -ForegroundColor Yellow
    Write-Host "================================🤖`n" -ForegroundColor Cyan
}

function Stop-AllServices {
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    
    # Stop N8N processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop any npm/yarn processes
    Get-Process -Name "npm", "yarn", "npx" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Start-Sleep 3
    Write-Host "✅ All services stopped" -ForegroundColor Green
}

function Start-N8NService {
    Write-Host "🚀 Starting N8N Automation Server..." -ForegroundColor Cyan
    
    # Set optimal environment variables
    $env:N8N_USER_MANAGEMENT_DISABLED = "true"
    $env:N8N_SECURE_COOKIE = "false"
    $env:N8N_METRICS = "false"
    $env:N8N_LOG_LEVEL = "info"
    $env:N8N_WORKFLOWS_INACTIVE_ON_STARTUP = "false"
    $env:DB_SQLITE_POOL_SIZE = "10"
    $env:N8N_RUNNERS_ENABLED = "true"
    
    Set-Location $ProjectPath
    
    if ($WithTunnel) {
        Write-Host "🌐 Starting with public tunnel..." -ForegroundColor Yellow
        if ($Background) {
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectPath'; npx n8n start --tunnel" -WindowStyle Minimized
        } else {
            npx n8n start --tunnel
        }
    } else {
        Write-Host "🏠 Starting locally..." -ForegroundColor Yellow
        if ($Background) {
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectPath'; npx n8n start" -WindowStyle Minimized
        } else {
            npx n8n start
        }
    }
}

function Start-ReactApp {
    Write-Host "⚛️ Starting React Development Server..." -ForegroundColor Cyan
    Set-Location $ProjectPath
    
    if ($Background) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectPath'; npm run dev" -WindowStyle Minimized
    } else {
        Start-Job -ScriptBlock {
            param($path)
            Set-Location $path
            npm run dev
        } -ArgumentList $ProjectPath
    }
}

function Show-Status {
    Write-Host "📊 SYSTEM STATUS:" -ForegroundColor Green
    
    # Check N8N
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5678/healthz" -TimeoutSec 5
        Write-Host "✅ N8N Server: RUNNING (http://localhost:5678)" -ForegroundColor Green
    } catch {
        Write-Host "❌ N8N Server: NOT RUNNING" -ForegroundColor Red
    }
    
    # Check React App
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5
        Write-Host "✅ React App: RUNNING (http://localhost:8080)" -ForegroundColor Green
    } catch {
        Write-Host "❌ React App: NOT RUNNING" -ForegroundColor Red
    }
    
    # Show processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "`n🔧 Active Node Processes:" -ForegroundColor Cyan
        $nodeProcesses | ForEach-Object { Write-Host "   - PID: $($_.Id) | Started: $($_.StartTime)" -ForegroundColor Yellow }
    }
}

# Main execution
Write-Banner

switch ($Action) {
    "start" {
        Write-Host "🚀 Starting Long Sang AI Automation System..." -ForegroundColor Green
        
        # Start N8N
        Start-N8NService
        Start-Sleep 5
        
        # Start React App if not running in background N8N mode
        if (!$Background) {
            Start-ReactApp
        }
        
        Write-Host "`n✅ System startup completed!" -ForegroundColor Green
        Write-Host "📊 N8N: http://localhost:5678" -ForegroundColor Cyan
        Write-Host "⚛️ React App: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "🧪 Workflow Tester: http://localhost:8080/workflow-test" -ForegroundColor Cyan
    }
    
    "stop" {
        Stop-AllServices
    }
    
    "restart" {
        Stop-AllServices
        Start-Sleep 2
        & $PSCommandPath -Action "start" -Background:$Background -WithTunnel:$WithTunnel
    }
    
    "status" {
        Show-Status
    }
}

Write-Host "`n🎉 Action '$Action' completed!" -ForegroundColor Green