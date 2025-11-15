@echo off
echo ========================================
echo   AI AGENT CENTER - QUICK START
echo ========================================
echo.

echo [1/3] Starting Backend API Server...
start "Backend API" cmd /k "cd personal-ai-system && python -m uvicorn api.main:app --reload --port 8000"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Frontend Dev Server...
start "Frontend Dev" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo [3/3] Opening Browser...
timeout /t 5 /nobreak > nul
start http://localhost:5173/agent-center

echo.
echo ========================================
echo   SERVERS STARTED!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo API Docs:    http://localhost:8000/docs
echo Frontend:    http://localhost:5173
echo Agent Center: http://localhost:5173/agent-center
echo.
echo Press any key to exit...
pause > nul
