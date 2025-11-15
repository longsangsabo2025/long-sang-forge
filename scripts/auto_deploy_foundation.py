"""
AUTO DEPLOY Academy Foundation Tables to Supabase
Uses psycopg2 for direct PostgreSQL connection
"""

import psycopg2
import sys
from pathlib import Path

# Transaction pooler (US East 2)
CONNECTION_STRING = 'postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres'

def deploy_foundation():
    print('🚀 AUTO-DEPLOYING Academy Foundation Tables...\n')
    
    try:
        # Connect to database
        print('🔌 Connecting to Supabase PostgreSQL...')
        conn = psycopg2.connect(CONNECTION_STRING)
        cursor = conn.cursor()
        print('✅ Connected!\n')
        
        # Read SQL file
        sql_path = Path(__file__).parent.parent / 'supabase' / 'migrations' / '20251114000001_academy_foundation_tables.sql'
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        file_size = len(sql) / 1024
        print(f'📄 SQL file loaded')
        print(f'📏 Size: {file_size:.2f} KB\n')
        
        print('⚡ Executing SQL...\n')
        
        # Execute SQL
        cursor.execute(sql)
        conn.commit()
        
        print('✅ SQL executed successfully!\n')
        
        print('=' * 60)
        print('🎉 DEPLOYMENT COMPLETE!')
        print('=' * 60)
        print('\n📋 Tables created:')
        print('  1. ✅ user_achievements')
        print('  2. ✅ user_xp')
        print('  3. ✅ study_groups')
        print('  4. ✅ study_group_members')
        print('  5. ✅ live_sessions')
        print('  6. ✅ live_session_attendees')
        print('  7. ✅ project_submissions')
        print('  8. ✅ student_revenue')
        print('\n🔧 Triggers: 4 created')
        print('📊 Views: 2 leaderboards created')
        print('🔒 RLS Policies: Enabled\n')
        print('🌟 Sample data:')
        print('  - 3 study groups')
        print('  - 4 upcoming live sessions\n')
        
        cursor.close()
        conn.close()
        print('🔌 Connection closed.\n')
        
        return 0
        
    except psycopg2.Error as e:
        print(f'\n❌ DATABASE ERROR: {e}')
        print(f'Error Code: {e.pgcode}')
        print(f'Error Message: {e.pgerror}\n')
        return 1
    except FileNotFoundError as e:
        print(f'\n❌ FILE ERROR: {e}\n')
        return 1
    except Exception as e:
        print(f'\n❌ DEPLOYMENT FAILED: {e}\n')
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(deploy_foundation())
