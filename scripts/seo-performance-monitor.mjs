#!/usr/bin/env node
/**
 * SEO Performance Monitoring & Keyword Tracking
 * Theo dõi rankings, traffic và performance metrics
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SEOPerformanceMonitor {
  constructor() {
    this.metrics = {
      keywords: {},
      pages: {},
      traffic: {},
      rankings: {},
      competitors: {}
    };
  }

  // Theo dõi keyword rankings (simulation - thực tế cần API từ SEMrush/Ahrefs)
  async trackKeywordRankings() {
    console.log('📊 Tracking keyword rankings...');
    
    const targetKeywords = [
      'sabo arena',
      'gaming platform vietnam',
      'esports vietnam',
      'billiards vietnam',
      'ai gaming automation',
      'gaming tournament vietnam',
      'online gaming vietnam',
      'esports platform',
      'competitive gaming vietnam',
      'gaming community vietnam'
    ];

    // Simulation data - thay bằng API thực
    const rankingData = {};
    
    for (const keyword of targetKeywords) {
      // Giả lập ranking data
      rankingData[keyword] = {
        current_position: Math.floor(Math.random() * 50) + 1,
        previous_position: Math.floor(Math.random() * 50) + 1,
        search_volume: Math.floor(Math.random() * 10000) + 500,
        competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        trend: Math.random() > 0.5 ? 'up' : 'down',
        last_updated: new Date().toISOString()
      };
      
      // Tính toán change
      rankingData[keyword].position_change = 
        rankingData[keyword].previous_position - rankingData[keyword].current_position;
    }

    this.metrics.rankings = rankingData;
    
    // Lưu vào database
    await this.saveRankingData(rankingData);
    
    console.log(`✅ Tracked ${targetKeywords.length} keywords`);
  }

  // Lưu ranking data vào Supabase
  async saveRankingData(rankingData) {
    const records = Object.entries(rankingData).map(([keyword, data]) => ({
      keyword,
      position: data.current_position,
      previous_position: data.previous_position,
      position_change: data.position_change,
      search_volume: data.search_volume,
      competition: data.competition,
      trend: data.trend,
      tracked_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('seo_keyword_rankings')
      .upsert(records, { onConflict: 'keyword' });

    if (error) {
      console.error('Error saving ranking data:', error);
    }
  }

  // Phân tích page performance
  async analyzePagePerformance() {
    console.log('📈 Analyzing page performance...');
    
    // Lấy data từ blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('id, title, slug, views, created_at, seo_title, seo_description')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(50);

    if (!posts) return;

    const pageMetrics = {};
    
    for (const post of posts) {
      const seoScore = this.calculatePageSEOScore(post);
      
      pageMetrics[post.slug] = {
        title: post.title,
        views: post.views || 0,
        seo_score: seoScore,
        days_since_published: Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        performance_rating: this.getPerformanceRating(post.views || 0, seoScore)
      };
    }

    this.metrics.pages = pageMetrics;
    
    // Tìm top & bottom performers
    const sortedPages = Object.entries(pageMetrics)
      .sort(([,a], [,b]) => b.views - a.views);
    
    console.log('\n🏆 Top Performing Pages:');
    sortedPages.slice(0, 5).forEach(([slug, metrics], index) => {
      console.log(`   ${index + 1}. ${metrics.title} (${metrics.views} views)`);
    });
    
    console.log('\n⚠️ Low Performing Pages:');
    sortedPages.slice(-5).forEach(([slug, metrics], index) => {
      console.log(`   ${index + 1}. ${metrics.title} (${metrics.views} views, SEO: ${metrics.seo_score}/100)`);
    });
  }

  // Tính SEO score cho page
  calculatePageSEOScore(post) {
    let score = 0;
    
    // Title check
    if (post.seo_title) {
      const titleLength = post.seo_title.length;
      if (titleLength >= 30 && titleLength <= 60) score += 25;
      else if (titleLength >= 20 && titleLength <= 70) score += 15;
    }
    
    // Description check  
    if (post.seo_description) {
      const descLength = post.seo_description.length;
      if (descLength >= 120 && descLength <= 160) score += 25;
      else if (descLength >= 100 && descLength <= 180) score += 15;
    }
    
    // Slug check
    if (post.slug && post.slug.length <= 60) score += 20;
    
    // Views performance
    const views = post.views || 0;
    if (views > 1000) score += 30;
    else if (views > 500) score += 20;
    else if (views > 100) score += 10;
    
    return Math.min(score, 100);
  }

  // Đánh giá performance
  getPerformanceRating(views, seoScore) {
    if (views > 1000 && seoScore >= 80) return 'Excellent';
    if (views > 500 && seoScore >= 70) return 'Good';
    if (views > 100 && seoScore >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  // Phân tích competitor (simulation)
  async analyzeCompetitors() {
    console.log('🎯 Analyzing competitors...');
    
    const competitors = [
      'gamezing.vn',
      'vtcgame.vn',
      'gamek.vn',
      'tinhte.vn/gaming',
      '360game.vn'
    ];

    const competitorData = {};
    
    for (const competitor of competitors) {
      // Simulation data - thay bằng API thực
      competitorData[competitor] = {
        estimated_traffic: Math.floor(Math.random() * 100000) + 10000,
        domain_authority: Math.floor(Math.random() * 40) + 30,
        backlinks: Math.floor(Math.random() * 50000) + 5000,
        top_keywords: Math.floor(Math.random() * 500) + 100,
        content_gap_opportunities: Math.floor(Math.random() * 20) + 5,
        last_analyzed: new Date().toISOString()
      };
    }

    this.metrics.competitors = competitorData;
    
    console.log('\n🏢 Competitor Analysis:');
    Object.entries(competitorData).forEach(([domain, data]) => {
      console.log(`   ${domain}: ${data.estimated_traffic.toLocaleString()} traffic, DA: ${data.domain_authority}`);
    });
  }

  // Tạo content recommendations
  generateContentRecommendations() {
    console.log('💡 Generating content recommendations...');
    
    const recommendations = [];
    
    // Recommendations dựa trên keyword gaps
    const lowRankingKeywords = Object.entries(this.metrics.rankings)
      .filter(([, data]) => data.current_position > 20)
      .slice(0, 5);
    
    if (lowRankingKeywords.length > 0) {
      recommendations.push({
        type: 'keyword_optimization',
        priority: 'high',
        title: 'Improve rankings for underperforming keywords',
        keywords: lowRankingKeywords.map(([keyword]) => keyword),
        action: 'Create targeted content for these keywords'
      });
    }

    // Recommendations dựa trên page performance
    const lowPerformingPages = Object.entries(this.metrics.pages)
      .filter(([, data]) => data.performance_rating === 'Needs Improvement')
      .slice(0, 3);
    
    if (lowPerformingPages.length > 0) {
      recommendations.push({
        type: 'content_optimization',
        priority: 'medium',
        title: 'Optimize underperforming content',
        pages: lowPerformingPages.map(([slug, data]) => ({ slug, title: data.title })),
        action: 'Improve SEO and content quality'
      });
    }

    // Trending topics recommendations
    recommendations.push({
      type: 'trending_content',
      priority: 'medium',
      title: 'Create content for trending gaming topics',
      topics: [
        'AI in Gaming 2025',
        'Vietnam Esports Championship',
        'Mobile Gaming Trends',
        'Gaming Hardware Reviews',
        'Esports Career Guide'
      ],
      action: 'Research and create comprehensive guides'
    });

    return recommendations;
  }

  // Tạo báo cáo hiệu suất
  async generatePerformanceReport() {
    const recommendations = this.generateContentRecommendations();
    
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_keywords_tracked: Object.keys(this.metrics.rankings).length,
        total_pages_analyzed: Object.keys(this.metrics.pages).length,
        average_keyword_position: this.calculateAveragePosition(),
        top_performing_keywords: this.getTopKeywords(5),
        improvement_opportunities: recommendations.length
      },
      rankings: this.metrics.rankings,
      pages: this.metrics.pages,
      competitors: this.metrics.competitors,
      recommendations: recommendations,
      next_actions: [
        'Focus on improving rankings for keywords below position 20',
        'Optimize underperforming content with low views',
        'Create new content targeting competitor keyword gaps',
        'Improve technical SEO issues identified',
        'Monitor and track performance weekly'
      ]
    };

    // Save report
    const timestamp = new Date().toISOString().slice(0, 10);
    const reportPath = path.join(process.cwd(), `seo-performance-report-${timestamp}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 SEO Performance Report Generated!');
    console.log('=====================================');
    console.log(`📄 Report saved: ${reportPath}`);
    console.log(`📈 Avg Keyword Position: ${report.summary.average_keyword_position}`);
    console.log(`🎯 Pages Analyzed: ${report.summary.total_pages_analyzed}`);
    console.log(`💡 Recommendations: ${report.summary.improvement_opportunities}`);
    
    return report;
  }

  // Tính average keyword position
  calculateAveragePosition() {
    const positions = Object.values(this.metrics.rankings).map(data => data.current_position);
    return positions.length > 0 ? 
      Math.round(positions.reduce((sum, pos) => sum + pos, 0) / positions.length) : 0;
  }

  // Lấy top keywords
  getTopKeywords(limit) {
    return Object.entries(this.metrics.rankings)
      .sort(([,a], [,b]) => a.current_position - b.current_position)
      .slice(0, limit)
      .map(([keyword, data]) => ({
        keyword,
        position: data.current_position,
        change: data.position_change
      }));
  }
}

// Chạy monitoring
async function runSEOMonitoring() {
  console.log('🚀 Starting SEO Performance Monitoring...');
  console.log('==========================================\n');
  
  const monitor = new SEOPerformanceMonitor();
  
  try {
    await monitor.trackKeywordRankings();
    await monitor.analyzePagePerformance();
    await monitor.analyzeCompetitors();
    await monitor.generatePerformanceReport();
    
    console.log('\n✅ SEO Monitoring Complete!');
  } catch (error) {
    console.error('❌ Error during SEO monitoring:', error);
    process.exit(1);
  }
}

// Chạy script
if (import.meta.url === `file://${process.argv[1]}`) {
  await runSEOMonitoring();
}

export default SEOPerformanceMonitor;