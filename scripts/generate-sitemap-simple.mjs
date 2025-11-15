/**
 * 🗺️ Generate sitemap.xml for SABO ARENA
 */

import { writeFileSync } from 'node:fs';

const baseUrl = 'https://saboarena.com';
const today = new Date().toISOString().split('T')[0];

const urls = [
  // Homepage - Highest priority
  { loc: '/', lastmod: today, changefreq: 'daily', priority: 1 },
  
  // Main sections - High priority
  { loc: '/tournaments', lastmod: today, changefreq: 'daily', priority: 0.9 },
  { loc: '/players', changefreq: 'weekly', priority: 0.8 },
  { loc: '/games', changefreq: 'weekly', priority: 0.8 },
  { loc: '/leaderboard', changefreq: 'daily', priority: 0.7 },
  
  // Content sections - Medium priority
  { loc: '/blog', changefreq: 'daily', priority: 0.6 },
  { loc: '/news', changefreq: 'daily', priority: 0.6 },
  { loc: '/guides', changefreq: 'weekly', priority: 0.6 },
  
  // Community - Medium priority
  { loc: '/community', changefreq: 'weekly', priority: 0.5 },
  { loc: '/teams', changefreq: 'weekly', priority: 0.5 },
  
  // Static pages - Lower priority
  { loc: '/about', changefreq: 'monthly', priority: 0.4 },
  { loc: '/contact', changefreq: 'monthly', priority: 0.4 },
  { loc: '/faq', changefreq: 'monthly', priority: 0.3 },
  { loc: '/terms', changefreq: 'yearly', priority: 0.2 },
  { loc: '/privacy', changefreq: 'yearly', priority: 0.2 },
];

console.log('🗺️  Generating sitemap.xml for SABO ARENA...\n');

try {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const url of urls) {
    const fullUrl = `${baseUrl}${url.loc}`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${fullUrl}</loc>\n`;
    
    if (url.lastmod) {
      sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    if (url.changefreq) {
      sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    
    if (url.priority !== undefined) {
      sitemap += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    }
    
    sitemap += `  </url>\n`;
  }
  
  sitemap += `</urlset>`;
  
  // Save to public folder
  writeFileSync('public/sitemap.xml', sitemap, 'utf-8');
  
  console.log('✅ Sitemap generated successfully!');
  console.log('📁 Location: public/sitemap.xml');
  console.log(`📊 Total URLs: ${urls.length}`);
  console.log('🌐 URL: https://saboarena.com/sitemap.xml\n');
  
  console.log('📋 Pages included:');
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const priority = url.priority !== undefined ? ` (Priority: ${url.priority.toFixed(1)})` : '';
    console.log(`   ${i + 1}. ${url.loc}${priority}`);
  }
  
  console.log('\n✨ Next steps:');
  console.log('   1. Upload sitemap.xml to https://saboarena.com/sitemap.xml');
  console.log('   2. Submit to Google: node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap.xml');
  console.log('   3. Verify in Search Console: node scripts/seo-actions.mjs sitemaps');
  
} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}
