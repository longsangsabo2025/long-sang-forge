@echo off
REM ================================================
REM START ALL SERVICES - Windows Batch Script
REM ================================================

echo.
echo ============================================
echo    SABO ARENA - Complete Stack Startup
echo ============================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found! Please install Node.js
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%

REM Install dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

if not exist "api\node_modules" (
    echo [INFO] Installing API dependencies...
    cd api
    call npm install
    cd ..
)

REM Create logs directory
if not exist "logs" mkdir logs

echo.
echo [INFO] Starting services...
echo.

REM Kill existing processes
echo [INFO] Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start API Server
echo [OK] Starting API Server (Port 3001)...
start "SABO API Server" cmd /k "cd api && echo Starting API Server... && node server.js"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [OK] Starting Frontend (Port 8080)...
start "SABO Frontend" cmd /k "echo Starting Frontend... && npm run dev:frontend"
timeout /t 5 /nobreak >nul

REM Health checks
echo.
echo [INFO] Running health checks...
curl -s http://localhost:3001/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] API Server: Running
) else (
    echo [WARN] API Server: Not responding yet
)

curl -s http://localhost:8080 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend: Running
) else (
    echo [WARN] Frontend: Not responding yet
)

echo.
echo ============================================
echo    SABO ARENA is starting up!
echo ============================================
echo.
echo Access Points:
echo    Frontend:  http://localhost:8080
echo    API:       http://localhost:3001
echo    Admin:     http://localhost:8080/admin
echo    Agents:    http://localhost:8080/agent-center
echo.
echo Press any key to exit (services will continue running)...
pause >nul
