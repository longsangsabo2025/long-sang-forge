@echo off
echo ========================================
echo   Personal AI Agent System
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo [1/4] Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
    echo.
) else (
    echo [1/4] Virtual environment exists
    echo.
)

REM Activate virtual environment
echo [2/4] Activating virtual environment...
call venv\Scripts\activate
echo ✓ Virtual environment activated
echo.

REM Install dependencies
echo [3/4] Installing dependencies...
pip install -r requirements.txt --quiet
echo ✓ Dependencies installed
echo.

REM Check if .env exists
if not exist ".env" (
    echo [4/4] Creating .env file...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file with your API keys!
    echo    Open .env and add your:
    echo    - OPENAI_API_KEY
    echo    - ANTHROPIC_API_KEY
    echo.
    pause
)

REM Create directories
if not exist "logs" mkdir logs
if not exist "user_data" mkdir user_data
if not exist "memory_data" mkdir memory_data

echo ========================================
echo   Starting Personal AI Assistant
echo ========================================
echo.
echo   Interactive Mode
echo   Type your requests or 'exit' to quit
echo.
echo ========================================
echo.

REM Run the CLI
python -m cli.main interactive

pause
