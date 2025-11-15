@echo off
echo ========================================
echo   CHATWOOT + CAPTAIN AI SETUP
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✓ Docker is installed

echo.
echo [2/5] Generating SECRET_KEY_BASE...
powershell -Command "$key = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 128 | ForEach-Object {[char]$_}); (Get-Content .env) -replace 'SECRET_KEY_BASE=replace_with_lengthy_secure_hex', \"SECRET_KEY_BASE=$key\" | Set-Content .env"
echo ✓ Secret key generated

echo.
echo [3/5] Creating data directories...
if not exist "data\postgres" mkdir data\postgres
if not exist "data\redis" mkdir data\redis
if not exist "data\storage" mkdir data\storage
echo ✓ Directories created

echo.
echo [4/5] Starting Chatwoot services...
docker-compose up -d
echo ✓ Services started

echo.
echo [5/5] Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Chatwoot is now running at: http://localhost:3000
echo.
echo Next steps:
echo 1. Open http://localhost:3000 in your browser
echo 2. Create your admin account
echo 3. Configure Captain AI in Settings
echo 4. Add website widget to your site
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
