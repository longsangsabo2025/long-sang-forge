# ================================================
# N8N SERVICE MANAGER (Windows PowerShell)
# Quản lý n8n như một service ổn định
# ================================================

param(
    [string]$Action = "start"
)

$N8N_PID_FILE = "$PWD\.n8n.pid"
$N8N_LOG_FILE = "$PWD\.n8n.log"

function Start-N8nService {
    Write-Host "🚀 Starting N8n Service..." -ForegroundColor Green
    
    # Check if already running
    if (Test-Path $N8N_PID_FILE) {
        $processId = Get-Content $N8N_PID_FILE
        if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
            Write-Host "✅ N8n is already running (PID: $processId)" -ForegroundColor Yellow
            return
        }
    }
    
    # Set environment variables
    $env:N8N_HOST = "0.0.0.0"
    $env:N8N_PORT = "5678"
    $env:N8N_PROTOCOL = "http"
    $env:WEBHOOK_URL = "http://localhost:5678"
    $env:N8N_LOG_LEVEL = "info"
    $env:N8N_LOG_OUTPUT = "file"
    $env:N8N_LOG_FILE = $N8N_LOG_FILE
    
    # Start n8n in background
    $process = Start-Process -FilePath "n8n" -ArgumentList "start" -NoNewWindow -PassThru
    
    # Save PID
    $process.Id | Out-File -FilePath $N8N_PID_FILE -Encoding UTF8
    
    Write-Host "✅ N8n started with PID: $($process.Id)" -ForegroundColor Green
    Write-Host "📊 Dashboard: http://localhost:5678" -ForegroundColor Cyan
    Write-Host "📋 Logs: $N8N_LOG_FILE" -ForegroundColor Gray
    
    # Wait for startup
    Write-Host "⏳ Waiting for n8n to be ready..." -ForegroundColor Yellow
    $timeout = 30
    $count = 0
    do {
        Start-Sleep 2
        $count += 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5678" -Method GET -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ N8n is ready!" -ForegroundColor Green
                return
            }
        } catch {
            # Continue waiting
        }
    } while ($count -lt $timeout)
    
    Write-Host "⚠️ N8n may still be starting up. Check logs for details." -ForegroundColor Yellow
}

function Stop-N8nService {
    Write-Host "🛑 Stopping N8n Service..." -ForegroundColor Red
    
    if (Test-Path $N8N_PID_FILE) {
        $processId = Get-Content $N8N_PID_FILE
        try {
            Stop-Process -Id $processId -Force
            Remove-Item $N8N_PID_FILE -Force
            Write-Host "✅ N8n stopped (PID: $processId)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Process $processId not found or already stopped" -ForegroundColor Yellow
            Remove-Item $N8N_PID_FILE -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "⚠️ N8n PID file not found" -ForegroundColor Yellow
    }
}

function Get-N8nStatus {
    Write-Host "📊 N8n Service Status:" -ForegroundColor Cyan
    
    if (Test-Path $N8N_PID_FILE) {
        $processId = Get-Content $N8N_PID_FILE
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "✅ Running (PID: $processId)" -ForegroundColor Green
            Write-Host "   CPU: $($process.CPU)" -ForegroundColor Gray
            Write-Host "   Memory: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
            
            # Test API
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:5678" -Method GET -TimeoutSec 5 -UseBasicParsing
                Write-Host "🌐 API Status: Ready (HTTP $($response.StatusCode))" -ForegroundColor Green
            } catch {
                Write-Host "🌐 API Status: Not Ready" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Not Running (stale PID file)" -ForegroundColor Red
            Remove-Item $N8N_PID_FILE -Force
        }
    } else {
        Write-Host "❌ Not Running" -ForegroundColor Red
    }
}

function Restart-N8nService {
    Stop-N8nService
    Start-Sleep 3
    Start-N8nService
}

# Main execution
switch ($Action.ToLower()) {
    "start" { Start-N8nService }
    "stop" { Stop-N8nService }
    "restart" { Restart-N8nService }
    "status" { Get-N8nStatus }
    default { 
        Write-Host "Usage: .\n8n-service.ps1 [start|stop|restart|status]" -ForegroundColor Yellow
    }
}