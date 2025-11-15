@echo off
echo ============================================================
echo    CONSULTATION BOOKING - MANUAL MIGRATION GUIDE
echo ============================================================
echo.
echo Step 1: Copy SQL to clipboard...
type "supabase\migrations\20250111_create_consultation_booking.sql" | clip
echo ✅ SQL copied to clipboard!
echo.
echo Step 2: Opening Supabase SQL Editor...
start https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new
echo.
echo ============================================================
echo 📋 INSTRUCTIONS:
echo ============================================================
echo 1. Wait for SQL Editor to open in browser
echo 2. Press Ctrl+V to paste the SQL
echo 3. Click "RUN" button (or press Ctrl+Enter)
echo 4. Wait for success message
echo 5. Come back here and press any key to verify
echo ============================================================
echo.
pause

echo.
echo 🔍 Verifying migration...
node verify-migration.js

pause
