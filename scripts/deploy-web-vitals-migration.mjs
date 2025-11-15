#!/usr/bin/env node
/**
 * Deploy Web Vitals Migration to Supabase
 * Runs SQL migration directly using Supabase API
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployMigration() {
  console.log('🚀 Deploying Web Vitals Migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251112_web_vitals_metrics.sql');
    const sql = await fs.readFile(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL...\n');

    // Execute SQL using Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n⚠️  Manual deployment required:');
      console.log('1. Go to Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste content from:');
      console.log(`   ${migrationPath}`);
      console.log('4. Click "Run"\n');
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!');
    console.log('✅ Table "web_vitals_metrics" created');
    console.log('✅ Indexes created');
    console.log('✅ RLS policies enabled\n');

    // Verify table exists
    const { data: tables, error: verifyError } = await supabase
      .from('web_vitals_metrics')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  Table verification failed:', verifyError.message);
      console.log('Please verify manually in Supabase Dashboard\n');
    } else {
      console.log('✅ Table verified and ready to use!\n');
    }

    console.log('🎉 Deployment complete!');
    console.log('📊 You can now track Core Web Vitals\n');

  } catch (error) {
    console.error('❌ Deployment error:', error);
    console.log('\n📝 Manual deployment steps:');
    console.log('1. Open Supabase Dashboard: https://app.supabase.com/project/diexsbzqwsbpilsymnfb');
    console.log('2. Go to SQL Editor');
    console.log('3. Run this SQL:\n');
    
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251112_web_vitals_metrics.sql');
    const sql = await fs.readFile(migrationPath, 'utf-8');
    console.log(sql);
    
    process.exit(1);
  }
}

deployMigration();
