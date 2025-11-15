import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Google Search Console Data Integration
 * Tự động sync data từ GSC vào Supabase để tracking SEO performance
 */

interface SearchConsoleData {
  query: string;
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  date: string;
  country: string;
  device: string;
}

serve(async (req) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'sync';

    switch (action) {
      case 'sync':
        return await syncSearchConsoleData(supabaseClient, corsHeaders);
      case 'analyze':
        return await analyzeSearchPerformance(supabaseClient, corsHeaders);
      case 'keywords':
        return await getTopKeywords(supabaseClient, corsHeaders);
      default:
        return new Response('Invalid action', { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Error in search console function:', error);
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Sync dữ liệu từ Google Search Console
async function syncSearchConsoleData(supabaseClient: any, corsHeaders: Record<string, string>) {
  console.log('🔄 Syncing Search Console data...');

  // Simulation data - trong thực tế sẽ call Google Search Console API
  const searchConsoleData: SearchConsoleData[] = [
    {
      query: 'sabo arena',
      page: 'https://saboarena.com/',
      impressions: 8950,
      clicks: 2340,
      ctr: 26.14,
      position: 1.2,
      date: new Date().toISOString().split('T')[0],
      country: 'VN',
      device: 'desktop'
    },
    {
      query: 'gaming platform vietnam',
      page: 'https://saboarena.com/gaming',
      impressions: 3200,
      clicks: 180,
      ctr: 5.63,
      position: 15.8,
      date: new Date().toISOString().split('T')[0],
      country: 'VN',
      device: 'mobile'
    },
    {
      query: 'esports tournament vietnam',
      page: 'https://saboarena.com/tournaments',
      impressions: 5600,
      clicks: 892,
      ctr: 15.93,
      position: 8.4,
      date: new Date().toISOString().split('T')[0],
      country: 'VN',
      device: 'desktop'
    },
    {
      query: 'billiards techniques',
      page: 'https://saboarena.com/blog/billiards-guide',
      impressions: 1800,
      clicks: 234,
      ctr: 13.0,
      position: 5.2,
      date: new Date().toISOString().split('T')[0],
      country: 'VN',
      device: 'mobile'
    },
    {
      query: 'ai gaming automation',
      page: 'https://saboarena.com/blog/ai-automation',
      impressions: 890,
      clicks: 45,
      ctr: 5.06,
      position: 25.3,
      date: new Date().toISOString().split('T')[0],
      country: 'VN',
      device: 'desktop'
    }
  ];

  // Prepare data for insertion
  const records = searchConsoleData.map(data => ({
    page_url: data.page,
    query: data.query,
    impressions: data.impressions,
    clicks: data.clicks,
    position: data.position,
    date_recorded: data.date,
    country_code: data.country,
    device_type: data.device
  }));

  // Upsert data ke Supabase
  const { data, error } = await supabaseClient
    .from('seo_search_console_data')
    .upsert(records, { 
      onConflict: 'page_url,query,date_recorded,device_type'
    });

  if (error) {
    console.error('Error upserting search console data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Update keyword rankings table
  await updateKeywordRankings(supabaseClient, searchConsoleData);

  console.log(`✅ Synced ${records.length} search console records`);

  return new Response(JSON.stringify({
    success: true,
    message: `Synced ${records.length} search console records`,
    data: {
      total_impressions: searchConsoleData.reduce((sum, d) => sum + d.impressions, 0),
      total_clicks: searchConsoleData.reduce((sum, d) => sum + d.clicks, 0),
      average_ctr: searchConsoleData.reduce((sum, d) => sum + d.ctr, 0) / searchConsoleData.length,
      average_position: searchConsoleData.reduce((sum, d) => sum + d.position, 0) / searchConsoleData.length
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Update keyword rankings từ Search Console data
async function updateKeywordRankings(supabaseClient: any, searchData: SearchConsoleData[]) {
  console.log('📊 Updating keyword rankings...');

  for (const data of searchData) {
    // Get current ranking if exists
    const { data: existing } = await supabaseClient
      .from('seo_keyword_rankings')
      .select('position')
      .eq('keyword', data.query)
      .single();

    const previousPosition = existing?.position || null;

    // Upsert ranking data
    await supabaseClient
      .from('seo_keyword_rankings')
      .upsert({
        keyword: data.query,
        position: Math.round(data.position),
        previous_position: previousPosition,
        search_volume: data.impressions,
        competition: data.position <= 10 ? 'high' : data.position <= 20 ? 'medium' : 'low',
        trend: previousPosition ? (data.position < previousPosition ? 'up' : 
                                  data.position > previousPosition ? 'down' : 'stable') : 'stable',
        tracked_at: new Date().toISOString()
      }, { 
        onConflict: 'keyword' 
      });
  }
}

// Phân tích Search Performance
async function analyzeSearchPerformance(supabaseClient: any, corsHeaders: Record<string, string>) {
  console.log('📈 Analyzing search performance...');

  // Get recent search console data
  const { data: searchData, error } = await supabaseClient
    .from('seo_search_console_data')
    .select('*')
    .gte('date_recorded', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date_recorded', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Calculate metrics
  const totalImpressions = searchData.reduce((sum: number, row: any) => sum + row.impressions, 0);
  const totalClicks = searchData.reduce((sum: number, row: any) => sum + row.clicks, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = searchData.length > 0 ? 
    searchData.reduce((sum: number, row: any) => sum + row.position, 0) / searchData.length : 0;

  // Top performing queries
  const queryPerformance = searchData
    .reduce((acc: any, row: any) => {
      if (!acc[row.query]) {
        acc[row.query] = { impressions: 0, clicks: 0, positions: [] };
      }
      acc[row.query].impressions += row.impressions;
      acc[row.query].clicks += row.clicks;
      acc[row.query].positions.push(row.position);
      return acc;
    }, {});

  const topQueries = Object.entries(queryPerformance)
    .map(([query, data]: [string, any]) => ({
      query,
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
      avg_position: data.positions.reduce((sum: number, pos: number) => sum + pos, 0) / data.positions.length
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Page performance
  const pagePerformance = searchData
    .reduce((acc: any, row: any) => {
      if (!acc[row.page_url]) {
        acc[row.page_url] = { impressions: 0, clicks: 0, queries: new Set() };
      }
      acc[row.page_url].impressions += row.impressions;
      acc[row.page_url].clicks += row.clicks;
      acc[row.page_url].queries.add(row.query);
      return acc;
    }, {});

  const topPages = Object.entries(pagePerformance)
    .map(([url, data]: [string, any]) => ({
      url,
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
      total_queries: data.queries.size
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const analysis = {
    summary: {
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      average_ctr: parseFloat(avgCTR.toFixed(2)),
      average_position: parseFloat(avgPosition.toFixed(1)),
      data_range_days: 30
    },
    top_queries: topQueries,
    top_pages: topPages,
    insights: [
      {
        type: 'opportunity',
        message: `${topQueries.filter(q => q.avg_position > 10 && q.avg_position <= 20).length} queries in positions 11-20 could be optimized for first page`,
      },
      {
        type: 'performance',
        message: `Average CTR of ${avgCTR.toFixed(1)}% is ${avgCTR > 5 ? 'above' : 'below'} industry average`,
      },
      {
        type: 'content',
        message: `Top performing page generates ${Math.max(...topPages.map(p => p.clicks))} clicks from ${Math.max(...topPages.map(p => p.total_queries))} different queries`,
      }
    ]
  };

  return new Response(JSON.stringify(analysis), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Lấy top keywords
async function getTopKeywords(supabaseClient: any, corsHeaders: Record<string, string>) {
  const { data: keywords, error } = await supabaseClient
    .from('seo_keyword_rankings')
    .select('*')
    .order('tracked_at', { ascending: false })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Group by keyword to get latest data
  const latestKeywords = keywords.reduce((acc: any, keyword: any) => {
    if (!acc[keyword.keyword] || new Date(keyword.tracked_at) > new Date(acc[keyword.keyword].tracked_at)) {
      acc[keyword.keyword] = keyword;
    }
    return acc;
  }, {});

  const keywordAnalysis = Object.values(latestKeywords)
    .sort((a: any, b: any) => a.position - b.position)
    .map((keyword: any) => ({
      keyword: keyword.keyword,
      position: keyword.position,
      previous_position: keyword.previous_position,
      position_change: keyword.position_change,
      search_volume: keyword.search_volume,
      competition: keyword.competition,
      trend: keyword.trend,
      opportunity_score: calculateOpportunityScore(keyword)
    }));

  return new Response(JSON.stringify({
    total_keywords: keywordAnalysis.length,
    top_10_count: keywordAnalysis.filter((k: any) => k.position <= 10).length,
    improving_count: keywordAnalysis.filter((k: any) => k.trend === 'up').length,
    keywords: keywordAnalysis
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Tính opportunity score cho keyword
function calculateOpportunityScore(keyword: any): number {
  let score = 0;
  
  // Position opportunity (closer to page 1 = higher score)
  if (keyword.position <= 3) score += 20;
  else if (keyword.position <= 10) score += 15;
  else if (keyword.position <= 20) score += 10;
  else if (keyword.position <= 50) score += 5;
  
  // Search volume
  if (keyword.search_volume > 10000) score += 25;
  else if (keyword.search_volume > 1000) score += 15;
  else if (keyword.search_volume > 100) score += 10;
  
  // Competition level
  if (keyword.competition === 'low') score += 20;
  else if (keyword.competition === 'medium') score += 10;
  
  // Trend
  if (keyword.trend === 'up') score += 15;
  else if (keyword.trend === 'stable') score += 5;
  
  // Position improvement potential
  if (keyword.position > 10 && keyword.position <= 20) score += 20; // Page 2 opportunity
  if (keyword.position > 3 && keyword.position <= 10) score += 10; // Top 3 opportunity
  
  return Math.min(score, 100);
}