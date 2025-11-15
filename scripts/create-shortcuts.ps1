# Script tạo Desktop Shortcut cho Long Sang AI Automation
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ProjectPath = "d:\0.APP\1510\long-sang-forge"

# Tạo shortcut START
$StartShortcut = "$DesktopPath\Start Long Sang AI.lnk"
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($StartShortcut)
$Shortcut.TargetPath = "$ProjectPath\START-SYSTEM.bat"
$Shortcut.WorkingDirectory = $ProjectPath
$Shortcut.Description = "Start Long Sang AI Automation System"
$Shortcut.Save()

# Tạo shortcut STOP  
$StopShortcut = "$DesktopPath\Stop Long Sang AI.lnk"
$Shortcut2 = $WshShell.CreateShortcut($StopShortcut)
$Shortcut2.TargetPath = "$ProjectPath\STOP-SYSTEM.bat"
$Shortcut2.WorkingDirectory = $ProjectPath
$Shortcut2.Description = "Stop Long Sang AI Automation System"
$Shortcut2.Save()

Write-Host "✅ Desktop shortcuts created:" -ForegroundColor Green
Write-Host "🚀 Start Long Sang AI.lnk" -ForegroundColor Cyan
Write-Host "🛑 Stop Long Sang AI.lnk" -ForegroundColor Cyan