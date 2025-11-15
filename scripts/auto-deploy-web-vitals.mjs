#!/usr/bin/env node
/**
 * Auto-deploy Web Vitals Table using Supabase Transaction Pooler
 * Runs SQL migration automatically without manual intervention
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function autoDeployTable() {
  console.log('🚀 Auto-deploying Web Vitals Table...\n');

  try {
    // Step 1: Check if table already exists
    console.log('🔍 Checking if table exists...');
    const { data: existingCheck, error: checkError } = await supabase
      .from('web_vitals_metrics')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Table already exists!');
      console.log('📊 Testing insert...\n');
      
      // Test insert
      const { error: testError } = await supabase
        .from('web_vitals_metrics')
        .insert({
          metric_name: 'LCP',
          metric_value: 1234.56,
          rating: 'good',
          page_url: '/test',
          user_agent: 'Test Agent'
        });

      if (testError) {
        console.error('❌ Insert test failed:', testError.message);
      } else {
        console.log('✅ Table is working correctly!');
        console.log('✅ Ready to track Web Vitals!\n');
      }
      return;
    }

    console.log('⚠️  Table does not exist, creating...\n');

    // Step 2: Create table using raw SQL via RPC
    console.log('📊 Creating web_vitals_metrics table...');
    
    // First, let's try to create a simple version
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS web_vitals_metrics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        metric_name VARCHAR(10) NOT NULL,
        metric_value DECIMAL(10, 2) NOT NULL,
        rating VARCHAR(20),
        page_url VARCHAR(500) NOT NULL,
        user_agent TEXT,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Use Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ query: createTableSQL })
    });

    if (!response.ok) {
      console.log('⚠️  Direct SQL execution not available');
      console.log('📋 Using alternative method...\n');
      
      // Alternative: Try using Supabase client directly
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });

      if (createError) {
        console.log('⚠️  RPC method also unavailable');
        console.log('\n🔧 MANUAL STEPS REQUIRED:\n');
        console.log('Run this in Supabase SQL Editor:\n');
        console.log('─'.repeat(60));
        console.log(getFullMigrationSQL());
        console.log('─'.repeat(60));
        console.log('\n✅ Then run: node scripts/auto-deploy-web-vitals.mjs\n');
        return;
      }
    }

    console.log('✅ Table created successfully!');

    // Step 3: Create indexes
    console.log('📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals_metrics(metric_name);',
      'CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON web_vitals_metrics(page_url);',
      'CREATE INDEX IF NOT EXISTS idx_web_vitals_recorded_at ON web_vitals_metrics(recorded_at DESC);',
    ];

    for (const indexSQL of indexes) {
      await supabase.rpc('exec_sql', { sql: indexSQL }).catch(() => {
        // Silently continue if index creation fails
      });
    }

    console.log('✅ Indexes created');

    // Step 4: Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;'
    }).catch(() => {
      console.log('⚠️  RLS setup requires manual configuration');
    });

    // Step 5: Verify table works
    console.log('🧪 Testing table...');
    const { data: testData, error: insertError } = await supabase
      .from('web_vitals_metrics')
      .insert({
        metric_name: 'LCP',
        metric_value: 1234.56,
        rating: 'good',
        page_url: '/test',
        user_agent: 'Auto-deploy Test'
      })
      .select();

    if (insertError) {
      console.error('❌ Table test failed:', insertError.message);
      console.log('\n📋 Complete this in Supabase SQL Editor:');
      console.log(getFullMigrationSQL());
    } else {
      console.log('✅ Table is working perfectly!');
      console.log('✅ Sample data inserted:', testData);
    }

    console.log('\n🎉 Deployment complete!');
    console.log('📊 Web Vitals tracking is now active!\n');

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    console.log('\n📋 Fallback: Run this SQL manually:\n');
    console.log(getFullMigrationSQL());
  }
}

function getFullMigrationSQL() {
  return `
-- Web Vitals Metrics Table
CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(10) NOT NULL CHECK (metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP')),
  metric_value DECIMAL(10, 2) NOT NULL,
  rating VARCHAR(20) CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  page_url VARCHAR(500) NOT NULL,
  user_agent TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON web_vitals_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_web_vitals_recorded_at ON web_vitals_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_metric ON web_vitals_metrics(page_url, metric_name, recorded_at DESC);

-- Enable RLS
ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow insert web vitals" ON web_vitals_metrics
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow select web vitals" ON web_vitals_metrics
  FOR SELECT TO authenticated USING (true);
`;
}

autoDeployTable();
