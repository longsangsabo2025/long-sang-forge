@echo off
echo ========================================
echo   Long Sang Forge - Integration Setup
echo   AI Automation System Full Stack
echo ========================================
echo.

REM Check Docker
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker not found! Please install Docker Desktop.
    echo Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check .env file
if not exist ".env" (
    echo [SETUP] Creating .env file from example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file with your API keys!
    echo    Required keys:
    echo    - OPENAI_API_KEY or ANTHROPIC_API_KEY
    echo    - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    echo.
    notepad .env
    echo.
    echo Press any key after saving your API keys...
    pause >nul
)

echo [1/4] Checking environment configuration...
findstr /C:"OPENAI_API_KEY" .env >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ OpenAI API key configured
) else (
    findstr /C:"ANTHROPIC_API_KEY" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Anthropic API key configured
    ) else (
        echo ⚠️  Warning: No AI API key found. System will use mock responses.
    )
)
echo.

echo [2/4] Building Docker images...
docker-compose -f docker-compose.integration.yml build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)
echo ✓ Docker images built successfully
echo.

echo [3/4] Starting services...
docker-compose -f docker-compose.integration.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start services!
    pause
    exit /b 1
)
echo ✓ Services started
echo.

echo [4/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check AI Backend
echo Checking AI Backend...
curl -s http://localhost:8000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ AI Backend is running
) else (
    echo ⚠️  AI Backend not ready yet, might need a few more seconds...
)

REM Check Frontend
echo Checking Frontend...
curl -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Frontend is running
) else (
    echo ⚠️  Frontend not ready yet, building...
)

echo.
echo ========================================
echo   🎉 Integration Setup Complete!
echo ========================================
echo.
echo Services running:
echo   • Frontend:     http://localhost:5173
echo   • AI Backend:   http://localhost:8000
echo   • API Docs:     http://localhost:8000/docs
echo   • Qdrant UI:    http://localhost:6333/dashboard
echo   • Redis:        localhost:6379
echo.
echo Automation Dashboard:
echo   → http://localhost:5173/automation
echo.
echo View logs:
echo   docker-compose -f docker-compose.integration.yml logs -f
echo.
echo Stop services:
echo   docker-compose -f docker-compose.integration.yml down
echo.
echo Press any key to open the dashboard...
pause >nul

start http://localhost:5173/automation

echo.
echo System is running! Check the browser.
echo Press Ctrl+C to view this window's logs or close to continue.
pause
