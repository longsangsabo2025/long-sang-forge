@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     CONSULTATION BOOKING - QUICK MIGRATION SETUP          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ⏱️  This will take 30 seconds...
echo.

REM Step 1: Copy SQL to clipboard
echo [1/3] 📋 Copying SQL to clipboard...
type "supabase\migrations\20250111_create_consultation_booking.sql" | clip
echo       ✅ SQL copied to clipboard!
timeout /t 1 /nobreak >nul

REM Step 2: Open SQL Editor
echo.
echo [2/3] 🌐 Opening Supabase SQL Editor...
start https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new
echo       ✅ Browser opened!
timeout /t 2 /nobreak >nul

REM Step 3: Show instructions
echo.
echo [3/3] 📝 Instructions
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  IN THE BROWSER (SQL Editor):                             ║
echo ║                                                            ║
echo ║  1. Press Ctrl+V (paste SQL)                              ║
echo ║  2. Press Ctrl+Enter (or click RUN button)                ║
echo ║  3. Wait for "Success" message (5-10 seconds)             ║
echo ║                                                            ║
echo ║  THEN COME BACK HERE AND PRESS ANY KEY                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause

REM Step 4: Verify migration
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     VERIFYING MIGRATION...                                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
node verify-migration.js

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     SETUP COMPLETE!                                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Open in browser:
echo    • Public booking: http://localhost:8083/consultation
echo    • Admin panel:    http://localhost:8083/admin/consultations
echo.
pause
