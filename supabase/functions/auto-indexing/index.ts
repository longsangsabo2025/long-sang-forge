import Deno from "https://deno.land/x/deno@v1.32.0/mod.ts";

/**
 * Auto-indexing Service
 * Tự động submit URLs mới vào Google Indexing API và Bing
 * 
 * Chạy service này như một Supabase Edge Function hoặc standalone script
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { google } from 'https://esm.sh/googleapis@105';

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface IndexingQueueItem {
  id: string;
  domain_id: string;
  url: string;
  status: string;
  search_engine: string;
  retry_count: number;
}

interface Domain {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  auto_index: boolean;
  google_service_account_json: any;
  bing_api_key?: string;
}

/**
 * Submit URL to Google Indexing API
 */
async function submitToGoogle(url: string, serviceAccountJson: any) {
  try {
    const jwtClient = new google.auth.JWT(
      serviceAccountJson.client_email,
      undefined,
      serviceAccountJson.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      undefined
    );

    await jwtClient.authorize();

    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED'
      }
    });

    console.log(`✅ Google indexed: ${url}`, response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`❌ Google indexing failed for ${url}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Submit URL to Bing Webmaster API
 */
async function submitToBing(url: string, apiKey: string, siteUrl: string) {
  try {
    const response = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteUrl: siteUrl,
          url: url
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bing API error: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Bing indexed: ${url}`, data);
    return { success: true, data };
  } catch (error: any) {
    console.error(`❌ Bing indexing failed for ${url}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Process indexing queue
 */
async function processIndexingQueue() {
  console.log('🔄 Processing indexing queue...');

  // Get all pending URLs
  const { data: queueItems, error: queueError } = await supabase
    .from('seo_indexing_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50); // Process 50 URLs at a time

  if (queueError) {
    console.error('❌ Error fetching queue:', queueError);
    return;
  }

  if (!queueItems || queueItems.length === 0) {
    console.log('✅ No pending URLs in queue');
    return;
  }

  console.log(`📋 Found ${queueItems.length} URLs to process`);

  // Process each URL
  for (const item of queueItems as IndexingQueueItem[]) {
    // Get domain info
    const { data: domain, error: domainError } = await supabase
      .from('seo_domains')
      .select('*')
      .eq('id', item.domain_id)
      .single();

    if (domainError || !domain) {
      console.error(`❌ Domain not found for queue item ${item.id}`);
      continue;
    }

    const domainData = domain as Domain;

    if (!domainData.enabled || !domainData.auto_index) {
      console.log(`⏭️ Skipping ${item.url} - domain not enabled or auto-index off`);
      continue;
    }

    // Update status to crawling
    await supabase
      .from('seo_indexing_queue')
      .update({ status: 'crawling' })
      .eq('id', item.id);

    let result;
    let success = false;

    // Submit to appropriate search engine
    if (item.search_engine === 'google' && domainData.google_service_account_json) {
      result = await submitToGoogle(
        item.url,
        domainData.google_service_account_json
      );
      success = result.success;
    } else if (item.search_engine === 'bing' && domainData.bing_api_key) {
      result = await submitToBing(
        item.url,
        domainData.bing_api_key,
        domainData.url
      );
      success = result.success;
    } else {
      console.warn(`⚠️ Missing API credentials for ${item.search_engine}`);
      await supabase
        .from('seo_indexing_queue')
        .update({
          status: 'failed',
          error_message: `Missing ${item.search_engine} API credentials`
        })
        .eq('id', item.id);
      continue;
    }

    // Update queue item based on result
    if (success) {
      await supabase
        .from('seo_indexing_queue')
        .update({
          status: 'indexed',
          indexed_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', item.id);
    } else {
      const newRetryCount = (item.retry_count || 0) + 1;
      const maxRetries = 3;

      await supabase
        .from('seo_indexing_queue')
        .update({
          status: newRetryCount >= maxRetries ? 'failed' : 'pending',
          retry_count: newRetryCount,
          error_message: result?.error || 'Unknown error'
        })
        .eq('id', item.id);
    }

    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Queue processing complete');
}

/**
 * Main function - run continuously or on schedule
 */
async function main() {
  console.log('🚀 Starting SEO Auto-indexing Service');

  // Run immediately
  await processIndexingQueue();

  // Then run every 5 minutes
  setInterval(async () => {
    await processIndexingQueue();
  }, 5 * 60 * 1000); // 5 minutes
}

// For Supabase Edge Function
Deno.serve(async (req) => {
  const { method } = req;

  if (method === 'POST') {
    // Trigger manual processing
    await processIndexingQueue();
    return new Response(
      JSON.stringify({ message: 'Indexing queue processed' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (method === 'GET') {
    // Health check
    return new Response(
      JSON.stringify({ status: 'OK', message: 'Auto-indexing service is running' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response('Method not allowed', { status: 405 });
});

// For standalone script
if (import.meta.main) {
  main();
}
