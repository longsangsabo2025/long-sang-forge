/**
 * 🗺️ Generate sitemap.xml for SABO ARENA
 */

import { writeFileSync } from 'fs';
import { generateSitemap, saboArenaSitemap } from '../src/lib/seo/sitemap-generator';

console.log('🗺️  Generating sitemap.xml for SABO ARENA...\n');

try {
  const sitemap = generateSitemap(saboArenaSitemap);
  
  // Save to public folder
  writeFileSync('public/sitemap.xml', sitemap, 'utf-8');
  
  console.log('✅ Sitemap generated successfully!');
  console.log('📁 Location: public/sitemap.xml');
  console.log(`📊 Total URLs: ${saboArenaSitemap.urls.length}`);
  console.log('🌐 URL: https://saboarena.com/sitemap.xml\n');
  
  console.log('📋 Pages included:');
  saboArenaSitemap.urls.forEach((url, index) => {
    const priority = url.priority !== undefined ? ` (Priority: ${url.priority.toFixed(1)})` : '';
    console.log(`   ${index + 1}. ${url.loc}${priority}`);
  });
  
  console.log('\n✨ Next steps:');
  console.log('   1. Upload sitemap.xml to https://saboarena.com/sitemap.xml');
  console.log('   2. Submit to Google: node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap.xml');
  console.log('   3. Verify in Search Console');
  
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
