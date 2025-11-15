@echo off
echo.
echo ========================================
echo   CONSULTATION BOOKING - QUICK SETUP
echo ========================================
echo.

REM Step 1: Show SQL file location
echo Step 1: Migration SQL File
echo --------------------------
echo Location: supabase\migrations\20250111_create_consultation_booking.sql
echo.

REM Step 2: Copy SQL to clipboard (Windows)
echo Step 2: Copying SQL to clipboard...
type "supabase\migrations\20250111_create_consultation_booking.sql" | clip
echo ✅ SQL copied to clipboard!
echo.

REM Step 3: Open Supabase Dashboard
echo Step 3: Opening Supabase Dashboard...
start https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/editor
echo ✅ Browser opened!
echo.

echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. In the Supabase SQL Editor:
echo    - Click "New query"
echo    - Press Ctrl+V to paste SQL
echo    - Click "RUN" or press Ctrl+Enter
echo.
echo 2. Wait for "Success" message (~30 seconds)
echo.
echo 3. Close this window and run:
echo    node run-migration.js
echo.
echo    This will verify the migration!
echo.
echo ========================================
echo.
pause
