#!/usr/bin/env node
/**
 * Simple Web Vitals Table Creator
 * Creates table directly via Supabase client
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

async function testAndCreateTable() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('agents')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
    } else {
      console.log('✅ Supabase connection successful!\n');
    }

    // Check if table exists
    console.log('🔍 Checking if web_vitals_metrics table exists...\n');
    
    const { data: existing, error: checkError } = await supabase
      .from('web_vitals_metrics')
      .select('*')
      .limit(1);

    if (!checkError) {
      console.log('✅ Table already exists!');
      console.log('📊 Sample data:', existing);
      return;
    }

    console.log('⚠️  Table does not exist yet');
    console.log('\n📋 MANUAL DEPLOYMENT REQUIRED:\n');
    console.log('1. Open Supabase Dashboard:');
    console.log('   https://app.supabase.com/project/diexsbzqwsbpilsymnfb/editor\n');
    console.log('2. Go to SQL Editor (left sidebar)\n');
    console.log('3. Click "New query"\n');
    console.log('4. Copy and paste this SQL:\n');
    console.log('─'.repeat(60));
    
    const sql = `
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

    console.log(sql);
    console.log('─'.repeat(60));
    console.log('\n5. Click "Run" button\n');
    console.log('6. Run this script again to verify: node scripts/test-web-vitals-table.mjs\n');

    // Test SEO analyzer with current credentials
    console.log('\n🔍 Testing SEO Analyzer configuration...\n');
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('id, title, seo_title, seo_description')
      .limit(5);

    if (blogError) {
      console.log('⚠️  No blog_posts table or no access');
    } else {
      console.log(`✅ Found ${blogPosts?.length || 0} blog posts`);
      if (blogPosts && blogPosts.length > 0) {
        console.log('   Sample:', blogPosts[0].title);
      }
    }

    // Test Google credentials
    console.log('\n🔍 Checking Google Service Account...\n');
    const googleCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (googleCreds) {
      try {
        const parsed = JSON.parse(googleCreds);
        console.log('✅ Google Service Account configured');
        console.log(`   Project: ${parsed.project_id}`);
        console.log(`   Email: ${parsed.client_email}`);
      } catch (e) {
        console.log('⚠️  Google credentials parsing error');
      }
    } else {
      console.log('⚠️  No Google Service Account configured');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAndCreateTable();
