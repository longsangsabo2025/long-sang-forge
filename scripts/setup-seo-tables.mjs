#!/usr/bin/env node
/**
 * Setup SEO Management Tables
 * Chạy script này để tạo tables cho SEO Management Center
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSEOTables() {
  console.log('🚀 Setting up SEO Management Tables...\n');

  try {
    // Check if tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .from('seo_domains')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ SEO tables already exist!');
      console.log('📊 Current data:');
      
      const { data: domains } = await supabase
        .from('seo_domains')
        .select('*');
      
      console.log(`   - Domains: ${domains?.length || 0}`);
      return;
    }

    console.log('📋 Creating SEO tables...\n');

    // Execute SQL to create tables
    const sql = `
      -- Table: seo_domains
      CREATE TABLE IF NOT EXISTS public.seo_domains (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          url TEXT NOT NULL UNIQUE,
          enabled BOOLEAN DEFAULT true,
          auto_index BOOLEAN DEFAULT true,
          google_service_account_json JSONB,
          bing_api_key TEXT,
          total_urls INTEGER DEFAULT 0,
          indexed_urls INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
      );

      -- Table: seo_indexing_queue
      CREATE TABLE IF NOT EXISTS public.seo_indexing_queue (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          domain_id UUID REFERENCES public.seo_domains(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'indexed', 'failed')),
          search_engine TEXT DEFAULT 'google' CHECK (search_engine IN ('google', 'bing')),
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          indexed_at TIMESTAMP WITH TIME ZONE,
          error_message TEXT,
          retry_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.seo_domains ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.seo_indexing_queue ENABLE ROW LEVEL SECURITY;

      -- Policies
      CREATE POLICY "Authenticated users can manage SEO domains"
          ON public.seo_domains FOR ALL
          TO authenticated
          USING (true);

      CREATE POLICY "Authenticated users can manage indexing queue"
          ON public.seo_indexing_queue FOR ALL
          TO authenticated
          USING (true);
    `;

    // Note: Supabase JS client doesn't support raw SQL execution
    // You need to run this via Supabase Dashboard SQL Editor
    console.log('⚠️  Please run the SQL via Supabase Dashboard SQL Editor');
    console.log('📝 Or use: npx supabase db execute --file setup-seo-tables.sql\n');
    
    console.log('✅ Script prepared!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupSEOTables();
