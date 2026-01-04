@echo off
title Long Sang Portfolio
cd /d "D:\0.PROJECTS\01-MAIN-PRODUCTS\long-sang-forge"

echo.
echo  ========================================
echo    LONG SANG PORTFOLIO
echo    100%% SERVERLESS - SUPABASE EDGE
echo  ========================================
echo.

REM Start dev server
start /min cmd /c "npm run dev"

echo  Starting Vite dev server...
timeout /t 3 /nobreak > nul

echo  Launching app...
start http://localhost:5000

echo.
echo  [OK] Frontend running at http://localhost:5000
echo  [OK] All APIs on Supabase Edge Functions
echo.
echo  Press any key to stop...
pause > nul

REM Kill processes on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| find "5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo  Server stopped.
