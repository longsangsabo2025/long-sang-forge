import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test different connection methods
connections = [
    {
        'name': 'Transaction Pooler (6543)',
        'config': {
            'host': 'aws-0-ap-southeast-1.pooler.supabase.com',
            'port': 6543,
            'database': 'postgres',
            'user': 'postgres.diexsbzqwsbpilsymnfb',
            'password': 'Acookingoil123'
        }
    },
    {
        'name': 'Session Pooler (5432)',
        'config': {
            'host': 'aws-0-ap-southeast-1.pooler.supabase.com',
            'port': 5432,
            'database': 'postgres',
            'user': 'postgres.diexsbzqwsbpilsymnfb',
            'password': 'Acookingoil123'
        }
    },
    {
        'name': 'Session Pooler - Simple User (5432)',
        'config': {
            'host': 'aws-0-ap-southeast-1.pooler.supabase.com',
            'port': 5432,
            'database': 'postgres',
            'user': 'postgres',
            'password': 'Acookingoil123'
        }
    }
]

print('🔍 TESTING SUPABASE CONNECTIONS...\n')

for conn_test in connections:
    print(f'Testing: {conn_test["name"]}')
    print(f'  Host: {conn_test["config"]["host"]}')
    print(f'  Port: {conn_test["config"]["port"]}')
    print(f'  User: {conn_test["config"]["user"]}')
    
    try:
        conn = psycopg2.connect(**conn_test['config'])
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        print(f'  ✅ SUCCESS! PostgreSQL version: {version[0][:50]}...')
        cursor.close()
        conn.close()
        
        # If this works, use it for deployment
        print(f'\n🎉 FOUND WORKING CONNECTION: {conn_test["name"]}')
        print('Will use this for deployment...\n')
        break
        
    except Exception as e:
        print(f'  ❌ FAILED: {str(e)[:100]}')
    
    print()

print('\n✅ Connection test complete!')
