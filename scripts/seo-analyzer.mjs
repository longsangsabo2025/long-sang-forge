#!/usr/bin/env node
/**
 * SEO Analysis và Audit Script
 * Phân tích và đánh giá SEO cho tất cả content
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Khởi tạo Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SEO Analysis Functions
class SEOAnalyzer {
  constructor() {
    this.results = {
      totalPages: 0,
      seoIssues: [],
      recommendations: [],
      scores: {},
      summary: {}
    };
  }

  // Phân tích SEO cho blog posts
  async analyzeBlogPosts() {
    console.log('🔍 Analyzing blog posts SEO...');
    
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching blog posts:', error);
      return;
    }

    let totalScore = 0;
    const issues = [];
    const recommendations = [];

    for (const post of posts) {
      const analysis = this.analyzeContentSEO(post);
      totalScore += analysis.score;
      
      if (analysis.issues.length > 0) {
        issues.push({
          type: 'blog_post',
          id: post.id,
          title: post.title,
          issues: analysis.issues
        });
      }
      
      recommendations.push(...analysis.recommendations.map(rec => ({
        type: 'blog_post',
        id: post.id,
        title: post.title,
        recommendation: rec
      })));
    }

    this.results.scores.blog_posts = {
      average: posts.length > 0 ? Math.round(totalScore / posts.length) : 0,
      total_posts: posts.length,
      issues_count: issues.length
    };

    this.results.seoIssues.push(...issues);
    this.results.recommendations.push(...recommendations);
    
    console.log(`✅ Analyzed ${posts.length} blog posts`);
    console.log(`📊 Average SEO Score: ${this.results.scores.blog_posts.average}/100`);
  }

  // Phân tích SEO content cơ bản
  analyzeContentSEO(content) {
    const issues = [];
    const recommendations = [];
    let score = 0;

    // Kiểm tra title
    if (!content.seo_title) {
      issues.push('Missing SEO title');
    } else {
      const titleLength = content.seo_title.length;
      if (titleLength < 30) {
        issues.push(`SEO title too short: ${titleLength} chars (recommended: 30-60)`);
      } else if (titleLength > 60) {
        issues.push(`SEO title too long: ${titleLength} chars (recommended: 30-60)`);
      } else {
        score += 20;
      }
    }

    // Kiểm tra description
    if (!content.seo_description) {
      issues.push('Missing SEO description');
    } else {
      const descLength = content.seo_description.length;
      if (descLength < 120) {
        issues.push(`SEO description too short: ${descLength} chars (recommended: 120-160)`);
      } else if (descLength > 160) {
        issues.push(`SEO description too long: ${descLength} chars (recommended: 120-160)`);
      } else {
        score += 20;
      }
    }

    // Kiểm tra content length
    if (content.content) {
      const wordCount = content.content.split(/\s+/).length;
      if (wordCount < 300) {
        recommendations.push(`Content too short: ${wordCount} words. Consider adding more content for better SEO.`);
      } else {
        score += 15;
      }
    }

    // Kiểm tra tags
    if (!content.tags || content.tags.length === 0) {
      recommendations.push('Add tags to improve content categorization');
    } else if (content.tags.length < 3) {
      recommendations.push('Consider adding more tags (recommended: 3-5)');
    } else {
      score += 10;
    }

    // Kiểm tra images
    if (!content.featured_image) {
      recommendations.push('Add featured image for better social sharing');
    } else {
      score += 5;
    }

    // Kiểm tra URL slug
    if (content.slug) {
      const slugLength = content.slug.length;
      if (slugLength > 60) {
        recommendations.push(`URL slug too long: ${slugLength} chars. Consider shortening for better SEO.`);
      } else {
        score += 10;
      }
    }

    return {
      score: Math.min(score, 100),
      issues,
      recommendations
    };
  }

  // Phân tích technical SEO
  async analyzeTechnicalSEO() {
    console.log('🔧 Analyzing technical SEO...');
    
    const technicalIssues = [];
    const technicalRecommendations = [];

    // Kiểm tra sitemap
    try {
      const response = await fetch('https://saboarena.com/api/sitemap.xml');
      if (response.ok) {
        console.log('✅ Sitemap accessible');
      } else {
        technicalIssues.push('Sitemap not accessible or returning errors');
      }
    } catch (error) {
      technicalIssues.push('Unable to access sitemap');
    }

    // Kiểm tra robots.txt
    try {
      const response = await fetch('https://saboarena.com/robots.txt');
      if (response.ok) {
        console.log('✅ Robots.txt accessible');
      } else {
        technicalIssues.push('Robots.txt not accessible');
      }
    } catch (error) {
      technicalIssues.push('Unable to access robots.txt');
    }

    this.results.seoIssues.push({
      type: 'technical',
      issues: technicalIssues
    });

    this.results.recommendations.push(...technicalRecommendations.map(rec => ({
      type: 'technical',
      recommendation: rec
    })));
  }

  // Phân tích keyword distribution
  async analyzeKeywords() {
    console.log('🔤 Analyzing keyword distribution...');
    
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('title, seo_title, seo_description, content, tags')
      .eq('status', 'published');

    if (!posts) return;

    const keywordFrequency = {};
    const targetKeywords = [
      'gaming', 'esports', 'vietnam', 'tournament', 'billiards',
      'ai', 'automation', 'platform', 'competitive', 'arena'
    ];

    for (const post of posts) {
      const text = `${post.title} ${post.seo_title} ${post.seo_description} ${post.content}`.toLowerCase();
      
      targetKeywords.forEach(keyword => {
        const count = (text.match(new RegExp(keyword, 'g')) || []).length;
        keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + count;
      });
    }

    // Tìm keywords thiếu
    const underusedKeywords = targetKeywords.filter(keyword => 
      (keywordFrequency[keyword] || 0) < 5
    );

    if (underusedKeywords.length > 0) {
      this.results.recommendations.push({
        type: 'keywords',
        recommendation: `Consider using these keywords more: ${underusedKeywords.join(', ')}`
      });
    }

    this.results.scores.keywords = {
      total_keywords_tracked: targetKeywords.length,
      keyword_frequency: keywordFrequency,
      underused: underusedKeywords
    };
  }

  // Tạo báo cáo tổng quan
  generateSummary() {
    const totalIssues = this.results.seoIssues.reduce((sum, item) => 
      sum + (Array.isArray(item.issues) ? item.issues.length : 1), 0
    );
    
    const totalRecommendations = this.results.recommendations.length;
    
    this.results.summary = {
      total_issues: totalIssues,
      total_recommendations: totalRecommendations,
      overall_health: totalIssues < 5 ? 'Good' : totalIssues < 15 ? 'Fair' : 'Needs Attention',
      priority_actions: this.getPriorityActions()
    };
  }

  // Lấy actions ưu tiên
  getPriorityActions() {
    const actions = [];
    
    // Kiểm tra missing title/description
    const missingMetaIssues = this.results.seoIssues.filter(issue => 
      issue.issues?.includes('Missing SEO title') || 
      issue.issues?.includes('Missing SEO description')
    );
    
    if (missingMetaIssues.length > 0) {
      actions.push(`Fix missing meta tags for ${missingMetaIssues.length} pages`);
    }

    // Kiểm tra content length
    const shortContentRecommendations = this.results.recommendations.filter(rec => 
      rec.recommendation?.includes('Content too short')
    );
    
    if (shortContentRecommendations.length > 0) {
      actions.push(`Expand content for ${shortContentRecommendations.length} posts`);
    }

    return actions.slice(0, 5); // Top 5 priority actions
  }

  // Xuất báo cáo
  async exportReport() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const reportPath = path.join(process.cwd(), `seo-analysis-${timestamp}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 SEO Analysis Complete!');
    console.log('=====================================');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`🎯 Overall Health: ${this.results.summary.overall_health}`);
    console.log(`⚠️ Total Issues: ${this.results.summary.total_issues}`);
    console.log(`💡 Total Recommendations: ${this.results.summary.total_recommendations}`);
    
    if (this.results.summary.priority_actions.length > 0) {
      console.log('\n🚀 Priority Actions:');
      this.results.summary.priority_actions.forEach((action, index) => {
        console.log(`   ${index + 1}. ${action}`);
      });
    }
    
    if (this.results.scores.blog_posts) {
      console.log(`\n📈 Blog Posts Average SEO Score: ${this.results.scores.blog_posts.average}/100`);
    }
  }
}

// Chạy analysis
async function runSEOAnalysis() {
  console.log('🚀 Starting SEO Analysis...');
  console.log('=====================================\n');
  
  const analyzer = new SEOAnalyzer();
  
  try {
    await analyzer.analyzeBlogPosts();
    await analyzer.analyzeTechnicalSEO();
    await analyzer.analyzeKeywords();
    analyzer.generateSummary();
    await analyzer.exportReport();
  } catch (error) {
    console.error('❌ Error during SEO analysis:', error);
    process.exit(1);
  }
}

// Chạy script nếu được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  runSEOAnalysis();
}

export default SEOAnalyzer;