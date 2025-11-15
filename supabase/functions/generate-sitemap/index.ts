import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import sitemap generator (you'll need to adapt this for Deno)
// For now, we'll inline the sitemap generation logic

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

serve(async (req) => {
  try {
    // CORS headers
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
    const pathname = url.pathname;
    const baseUrl = Deno.env.get('BASE_URL') || 'https://saboarena.com';

    // Generate different sitemaps based on path
    if (pathname.includes('sitemap.xml')) {
      return await generateMainSitemap(supabaseClient, baseUrl, corsHeaders);
    } else if (pathname.includes('sitemap-blog.xml')) {
      return await generateBlogSitemap(supabaseClient, baseUrl, corsHeaders);
    } else if (pathname.includes('sitemap-tournaments.xml')) {
      return await generateTournamentSitemap(supabaseClient, baseUrl, corsHeaders);
    } else if (pathname.includes('robots.txt')) {
      return generateRobotsTxt(baseUrl, corsHeaders);
    }

    return new Response('Sitemap endpoint', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('Error in sitemap function:', error);
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
});

async function generateMainSitemap(supabaseClient: any, baseUrl: string, corsHeaders: Record<string, string>) {
  const urls: SitemapURL[] = [];

  // Static pages
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' as const },
    { path: '/about', priority: '0.8', changefreq: 'monthly' as const },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' as const },
    { path: '/gaming', priority: '0.9', changefreq: 'weekly' as const },
    { path: '/tournaments', priority: '0.9', changefreq: 'daily' as const },
    { path: '/blog', priority: '0.8', changefreq: 'daily' as const },
    { path: '/agents', priority: '0.9', changefreq: 'weekly' as const },
  ];

  for (const page of staticPages) {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // Add agent pages
  try {
    const { data: agents } = await supabaseClient
      .from('ai_agents')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (agents) {
      for (const agent of agents) {
        urls.push({
          loc: `${baseUrl}/agents/${agent.id}`,
          lastmod: agent.updated_at?.split('T')[0],
          changefreq: 'weekly',
          priority: '0.7',
        });
      }
    }
  } catch (error) {
    console.error('Error fetching agents:', error);
  }

  const xml = generateSitemapXML(urls);
  
  return new Response(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

async function generateBlogSitemap(supabaseClient: any, baseUrl: string, corsHeaders: Record<string, string>) {
  const urls: SitemapURL[] = [];

  try {
    const { data: posts } = await supabaseClient
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000); // Limit for performance

    if (posts) {
      for (const post of posts) {
        urls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: post.updated_at?.split('T')[0] || post.created_at?.split('T')[0],
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }

  const xml = generateSitemapXML(urls);
  
  return new Response(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
    },
  });
}

async function generateTournamentSitemap(supabaseClient: any, baseUrl: string, corsHeaders: Record<string, string>) {
  const urls: SitemapURL[] = [];

  try {
    const { data: tournaments } = await supabaseClient
      .from('tournaments')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (tournaments) {
      for (const tournament of tournaments) {
        urls.push({
          loc: `${baseUrl}/tournaments/${tournament.id}`,
          lastmod: tournament.updated_at?.split('T')[0],
          changefreq: 'daily',
          priority: '0.9',
        });
      }
    }
  } catch (error) {
    console.error('Error fetching tournaments:', error);
  }

  const xml = generateSitemapXML(urls);
  
  return new Response(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
    },
  });
}

function generateRobotsTxt(baseUrl: string, corsHeaders: Record<string, string>) {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/api/sitemap.xml
Sitemap: ${baseUrl}/api/sitemap-blog.xml
Sitemap: ${baseUrl}/api/sitemap-tournaments.xml

# Block admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$

# Allow important resources
Allow: /api/og
Allow: /assets/
Allow: /images/
Allow: /_next/static/

# Crawl delay
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}

function generateSitemapXML(urls: SitemapURL[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlEntries = urls.map(url => {
    let urlXML = `  <url>
    <loc>${escapeXML(url.loc)}</loc>`;
    
    if (url.lastmod) {
      urlXML += `
    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      urlXML += `
    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority) {
      urlXML += `
    <priority>${url.priority}</priority>`;
    }
    
    urlXML += `
  </url>`;
    return urlXML;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}