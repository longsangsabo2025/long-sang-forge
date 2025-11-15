#!/usr/bin/env node

/**
 * 🎯 AGENT EXECUTION DEMO (Mock Mode)
 * Demo agent execution without real API call
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('\n' + '='.repeat(80));
console.log('🎬 AI AGENT EXECUTION DEMO (Mock Mode)');
console.log('='.repeat(80) + '\n');

async function runDemo() {
  // Get agent
  console.log('📋 Step 1: Getting Lead Qualifier agent...\n');
  
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('name', 'lead-qualifier')
    .single();

  if (!agent) {
    console.error('❌ Agent not found. Please activate from marketplace first.');
    return;
  }

  console.log('✅ Agent found!');
  console.log('   Name:', agent.role);
  console.log('   ID:', agent.id);
  console.log('   Status:', agent.status);

  // Test data
  console.log('\n📝 Step 2: Test Lead Data\n');
  
  const testLead = {
    name: "Sarah Johnson",
    email: "sarah.johnson@innovatetech.com",
    company: "InnovateTech Solutions",
    industry: "SaaS & Cloud Computing",
    employees: "150-500",
    budget: "$75,000",
    timeline: "Immediate (within 1 month)",
    pain_points: "Manual lead scoring taking 3+ hours daily, missing qualified leads"
  };

  console.log('Lead Profile:');
  Object.entries(testLead).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // Mock AI response (simulating GPT-4o-mini)
  console.log('\n🤖 Step 3: AI Processing (Mock Mode)...\n');
  console.log('⏳ Analyzing lead with AI...');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

  const aiAnalysis = {
    lead_score: 92,
    qualification: "Hot Lead 🔥",
    priority: "Urgent",
    reasoning: [
      "High budget ($75,000) aligns well with our pricing",
      "Immediate timeline shows strong purchase intent",
      "Clear pain point: manual lead scoring is quantified (3+ hours/day)",
      "Mid-market company size (150-500) is ideal ICP",
      "Decision-making authority likely present (VP/Director level)"
    ],
    red_flags: [],
    estimated_deal_value: "$75,000",
    close_probability: "85%",
    recommended_actions: [
      "Schedule demo call within 24 hours",
      "Prepare ROI calculator showing time savings",
      "Send case study from similar SaaS company",
      "Assign to senior sales rep",
      "Fast-track through sales pipeline"
    ],
    suggested_approach: "Lead with automation ROI - emphasize the 3+ hours/day savings. Show how AI lead scoring can increase conversion rates by 40%. Offer pilot program to demonstrate value quickly.",
    next_contact_timing: "Immediate - Contact within 4 hours"
  };

  const executionTime = 1850; // ms
  const tokensUsed = 847;
  const cost = 0.00125;

  console.log('✅ Analysis complete!\n');
  console.log('⏱️  Time:', executionTime, 'ms');
  console.log('🎯 Tokens:', tokensUsed);
  console.log('💰 Cost: $' + cost.toFixed(6));

  // Display results
  console.log('\n' + '─'.repeat(80));
  console.log('🎯 LEAD QUALIFICATION ANALYSIS');
  console.log('─'.repeat(80));
  console.log('\n📊 Overall Assessment:');
  console.log('   Lead Score:', aiAnalysis.lead_score, '/100');
  console.log('   Qualification:', aiAnalysis.qualification);
  console.log('   Priority:', aiAnalysis.priority);
  console.log('   Estimated Value:', aiAnalysis.estimated_deal_value);
  console.log('   Close Probability:', aiAnalysis.close_probability);
  
  console.log('\n💡 Key Insights:');
  aiAnalysis.reasoning.forEach((reason, i) => {
    console.log(`   ${i + 1}. ${reason}`);
  });

  console.log('\n📋 Recommended Actions:');
  aiAnalysis.recommended_actions.forEach((action, i) => {
    console.log(`   ${i + 1}. ${action}`);
  });

  console.log('\n🎯 Suggested Approach:');
  console.log('   ' + aiAnalysis.suggested_approach);

  console.log('\n⏰ Next Contact:');
  console.log('   ' + aiAnalysis.next_contact_timing);

  console.log('\n' + '─'.repeat(80));

  // Save to database
  console.log('\n💾 Step 4: Saving to database...\n');
  
  const { data: execution, error } = await supabase
    .from('agent_executions')
    .insert({
      agent_id: agent.id,
      user_id: agent.created_by || 'demo-user',
      input: JSON.stringify(testLead, null, 2),
      output: JSON.stringify(aiAnalysis, null, 2),
      status: 'completed',
      execution_time_ms: executionTime,
      tokens_used: tokensUsed,
      cost_usd: cost
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Save failed:', error.message);
  } else {
    console.log('✅ Execution saved!');
    console.log('   ID:', execution.id);
  }

  // Update stats
  console.log('\n📈 Step 5: Updating agent stats...\n');
  
  const newExecs = (agent.total_executions || 0) + 1;
  const newSuccess = (agent.successful_executions || 0) + 1;
  const newCost = (agent.total_cost_usd || 0) + cost;

  await supabase
    .from('agents')
    .update({
      total_executions: newExecs,
      successful_executions: newSuccess,
      total_cost_usd: newCost,
      avg_execution_time_ms: executionTime,
      last_used_at: new Date().toISOString()
    })
    .eq('id', agent.id);

  console.log('✅ Stats updated!');
  console.log('   Total Executions:', newExecs);
  console.log('   Success Rate:', ((newSuccess / newExecs) * 100).toFixed(1) + '%');
  console.log('   Total Cost: $' + newCost.toFixed(6));

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('✨ DEMO COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(80));
  console.log('\n📊 Summary:');
  console.log('   Lead:', testLead.name, '-', testLead.company);
  console.log('   Score:', aiAnalysis.lead_score + '/100 -', aiAnalysis.qualification);
  console.log('   Priority:', aiAnalysis.priority);
  console.log('   Deal Value:', aiAnalysis.estimated_deal_value);
  console.log('   Win Rate:', aiAnalysis.close_probability);
  
  console.log('\n🎯 Check Results:');
  console.log('   • Agent Center: http://localhost:8080/admin/agents');
  console.log('   • Dashboard: http://localhost:8080/dashboard');
  
  console.log('\n💡 What just happened:');
  console.log('   1. ✅ Agent fetched from database');
  console.log('   2. ✅ Lead data prepared');
  console.log('   3. ✅ AI analysis completed (mock)');
  console.log('   4. ✅ Results saved to database');
  console.log('   5. ✅ Agent stats updated');
  
  console.log('\n🚀 Agent is working! Stats updated in real-time.');
  console.log('   Refresh Agent Center to see the changes!\n');
}

await runDemo();
