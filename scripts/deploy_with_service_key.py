"""
AUTO DEPLOY Academy Foundation Tables using Supabase REST API
Uses service role key - NO PASSWORD NEEDED
"""

import requests
import json
from pathlib import Path

# Supabase config
SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY'

def execute_sql_via_api(sql):
    """Execute SQL using Supabase REST API"""
    
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Try to execute via RPC function or create tables directly
    # Supabase doesn't have direct SQL execution via REST API
    # We need to run it manually or use Edge Functions
    
    print('⚠️  Supabase REST API does not support direct SQL execution')
    print('We need to use the SQL Editor in Supabase Dashboard\n')
    
    return False

def deploy_foundation():
    print('🚀 AUTO-DEPLOY Academy Foundation Tables\n')
    
    # Read SQL file
    sql_path = Path(__file__).parent.parent / 'supabase' / 'migrations' / '20251114000001_academy_foundation_tables.sql'
    with open(sql_path, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    file_size = len(sql) / 1024
    print(f'📄 SQL file loaded: {sql_path}')
    print(f'📏 Size: {file_size:.2f} KB\n')
    
    # Test connection
    print('🔗 Testing Supabase connection with service key...')
    
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}'
    }
    
    try:
        response = requests.get(f'{SUPABASE_URL}/rest/v1/', headers=headers)
        if response.status_code == 200:
            print('✅ Service key is valid!\n')
        else:
            print(f'❌ Connection failed: {response.status_code}\n')
            return 1
    except Exception as e:
        print(f'❌ Connection error: {e}\n')
        return 1
    
    # Provide manual instructions
    print('=' * 60)
    print('📋 MANUAL DEPLOYMENT REQUIRED')
    print('=' * 60)
    print('\n💡 Supabase REST API does not support direct SQL execution.')
    print('Please follow these steps:\n')
    print('1. Open Supabase SQL Editor:')
    print(f'   👉 {SUPABASE_URL.replace("https://", "https://supabase.com/dashboard/project/")}/sql/new\n')
    print('2. Copy SQL content (already in your clipboard if you ran the copy command)\n')
    print('3. Paste into SQL Editor and click "RUN"\n')
    print('4. Wait for success message\n')
    print('=' * 60)
    
    # Show SQL preview
    print('\n📝 SQL Preview (first 800 chars):')
    print('─' * 60)
    print(sql[:800] + '...')
    print('─' * 60)
    
    print(f'\n📊 Total SQL: {len(sql)} characters')
    print(f'📁 File location: {sql_path}\n')
    
    print('💡 TIP: Run this PowerShell command to copy SQL to clipboard:')
    print(f'   Get-Content "{sql_path}" | Set-Clipboard\n')
    
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(deploy_foundation())
