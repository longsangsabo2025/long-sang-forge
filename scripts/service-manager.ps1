# ================================================
# WINDOWS SERVICE WRAPPER FOR LONG SANG AI AUTOMATION
# Tạo Windows Service để hệ thống tự động khởi động
# ================================================

param(
    [Parameter()]
    [ValidateSet("install", "uninstall", "start", "stop", "status")]
    [string]$Action = "status"
)

$ServiceName = "LongSangAIAutomation"
$ServiceDisplayName = "Long Sang AI Automation System"
$ServiceDescription = "AI Automation system with N8N and React interface"
$ProjectPath = "d:\0.APP\1510\long-sang-forge"
$ServiceExePath = "$ProjectPath\scripts\service-wrapper.exe"

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Service {
    if (!(Test-AdminRights)) {
        Write-Host "❌ Administrator rights required to install service" -ForegroundColor Red
        Write-Host "💡 Run PowerShell as Administrator and try again" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🔧 Installing Windows Service..." -ForegroundColor Cyan
    
    # Create service wrapper script
    $wrapperScript = @"
# Service Wrapper for Long Sang AI Automation
while (`$true) {
    try {
        Set-Location "$ProjectPath"
        & "$ProjectPath\scripts\system-manager.ps1" -Action start -Background -WithTunnel
        Start-Sleep 30
    } catch {
        Write-EventLog -LogName Application -Source "$ServiceName" -EventId 1001 -EntryType Error -Message "Service error: `$(`$_.Exception.Message)"
        Start-Sleep 10
    }
}
"@
    
    $wrapperScript | Out-File "$ProjectPath\scripts\service-wrapper.ps1" -Encoding UTF8
    
    # Install service using sc.exe
    $cmd = "sc.exe create `"$ServiceName`" binpath= `"powershell.exe -ExecutionPolicy Bypass -File '$ProjectPath\scripts\service-wrapper.ps1'`" displayname= `"$ServiceDisplayName`" start= auto"
    
    try {
        Invoke-Expression $cmd
        Write-Host "✅ Service installed successfully!" -ForegroundColor Green
        Write-Host "🚀 Service will auto-start with Windows" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to install service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Uninstall-Service {
    if (!(Test-AdminRights)) {
        Write-Host "❌ Administrator rights required to uninstall service" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🗑️ Uninstalling Windows Service..." -ForegroundColor Yellow
    
    try {
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        sc.exe delete $ServiceName
        Write-Host "✅ Service uninstalled successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to uninstall service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-LongSangService {
    try {
        Start-Service -Name $ServiceName
        Write-Host "✅ Service started successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Stop-LongSangService {
    try {
        Stop-Service -Name $ServiceName -Force
        Write-Host "✅ Service stopped successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to stop service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-ServiceStatus {
    Write-Host "📊 LONG SANG AI AUTOMATION SERVICE STATUS:" -ForegroundColor Green
    
    try {
        $service = Get-Service -Name $ServiceName -ErrorAction Stop
        Write-Host "Service Status: $($service.Status)" -ForegroundColor $(if($service.Status -eq 'Running') {'Green'} else {'Red'})
        Write-Host "Service Name: $($service.ServiceName)" -ForegroundColor Cyan
        Write-Host "Display Name: $($service.DisplayName)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Service not installed" -ForegroundColor Red
        Write-Host "💡 Run: .\service-manager.ps1 -Action install" -ForegroundColor Yellow
        return
    }
    
    # Check actual processes
    Write-Host "`n📈 Process Status:" -ForegroundColor Cyan
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "✅ Node processes running: $($nodeProcesses.Count)" -ForegroundColor Green
    } else {
        Write-Host "❌ No Node processes found" -ForegroundColor Red
    }
}

# Main execution
Write-Host "`n🤖 ================================" -ForegroundColor Cyan
Write-Host "   LONG SANG AI AUTOMATION SERVICE" -ForegroundColor Green
Write-Host "   Action: $Action" -ForegroundColor Yellow
Write-Host "================================🤖`n" -ForegroundColor Cyan

switch ($Action) {
    "install" { Install-Service }
    "uninstall" { Uninstall-Service }
    "start" { Start-LongSangService }
    "stop" { Stop-LongSangService }
    "status" { Show-ServiceStatus }
}

Write-Host "`n🎉 Action '$Action' completed!" -ForegroundColor Green