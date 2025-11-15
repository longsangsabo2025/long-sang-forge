@echo off
REM Quick Start Script for Consultation Booking System (Windows)
REM This script helps you set up the consultation booking feature

echo.
echo 🚀 Consultation Booking System - Quick Start
echo ============================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Supabase CLI not found. Please install it first:
    echo    npm install -g supabase
    echo.
    echo Or run the migration manually in Supabase SQL Editor:
    echo    File: supabase/migrations/20250111_create_consultation_booking.sql
    pause
    exit /b 1
)

echo ✅ Supabase CLI detected
echo.

echo This will:
echo   1. Create consultation booking tables
echo   2. Set up Row Level Security policies
echo   3. Insert default consultation types
echo.

set /p CONFIRM="Continue? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Setup cancelled
    pause
    exit /b 1
)

echo.
echo 📦 Running database migration...
supabase db push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo.
    echo 🎉 Next steps:
    echo   1. Start your dev server: npm run dev
    echo   2. Login as admin
    echo   3. Go to /admin/consultations
    echo   4. Click 'Cấu hình lịch làm việc'
    echo   5. Add your working hours
    echo   6. Share /consultation link with customers
    echo.
    echo 📖 For detailed guide, see: CONSULTATION_BOOKING_GUIDE.md
) else (
    echo.
    echo ❌ Migration failed!
    echo Please run the SQL manually in Supabase SQL Editor
)

echo.
pause
