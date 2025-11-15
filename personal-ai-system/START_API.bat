@echo off
echo ========================================
echo   Personal AI Agent System - API Mode
echo ========================================
echo.

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate
) else (
    echo Error: Virtual environment not found!
    echo Please run START.bat first.
    pause
    exit
)

echo Starting API Server...
echo.
echo API will be available at:
echo   • http://localhost:8000
echo   • Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo.

REM Start API server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

pause
