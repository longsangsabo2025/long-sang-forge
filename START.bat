@echo off
title Long Sang Portfolio
cd /d "D:\0.PROJECTS\01-MAIN-PRODUCTS\long-sang-forge"

echo.
echo  ========================================
echo    LONG SANG PORTFOLIO
echo  ========================================
echo.

REM Start dev servers in background
start /min cmd /c "npm run dev"

echo  Starting servers...
timeout /t 4 /nobreak > nul

echo  Launching app...
start http://localhost:8080

echo.
echo  [OK] Portfolio running at http://localhost:8080
echo  [OK] API running at http://localhost:3001
echo.
echo  Press any key to stop servers...
pause > nul

REM Kill processes on ports
for /f "tokens=5" %%a in ('netstat -ano ^| find "8080" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| find "3001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo  Servers stopped.
