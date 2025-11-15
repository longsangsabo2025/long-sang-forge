// ================================================
// CONTENT WRITER AGENT - Edge Function  
// ================================================
// Generates blog posts using OpenAI/Claude
// Triggered manually or automatically

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agent_id, context = {} } = await req.json();
    console.log('🤖 Agent triggered:', agent_id);

    // Get agent config
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agent_id)
      .single();

    if (!agent) throw new Error('Agent not found');

    // Check budget before execution
    const { data: budgetCheck } = await supabase.rpc('check_agent_budget', {
      p_agent_id: agent_id
    });

    if (budgetCheck === false) {
      console.log('❌ Budget exceeded, agent execution blocked');
      
      await supabase.from('activity_logs').insert({
        agent_id,
        action: 'execution_blocked',
        status: 'error',
        details: { reason: 'budget_exceeded' },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Budget limit exceeded. Agent has been auto-paused.',
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = agent.config || {};
    const aiModel = config.ai_model || 'gpt-4';
    const tone = config.tone || 'professional';
    const maxLength = config.max_length || 2000;
    const topic = context.topic || 'Billiards tips and techniques';

    // Enhanced SEO-focused prompt
    const targetKeywords = context.target_keywords || [];
    const searchIntent = context.search_intent || 'informational';
    
    const systemPrompt = `You are an expert SEO content writer specializing in Vietnamese content.
CONTENT REQUIREMENTS:
- Tone: ${tone}
- Length: ${maxLength} words
- Language: Vietnamese
- Target Keywords: ${targetKeywords.join(', ') || 'gaming, esports, billiards'}
- Search Intent: ${searchIntent}
- Include semantic keywords related to the topic
- Optimize for featured snippets
- Create compelling, click-worthy titles
- Include FAQ section if relevant
- Use proper heading structure (H2, H3)
- Add internal linking opportunities
${config.custom_prompt || ''}

Return JSON with: 
{
  "title": "Engaging title for readers",
  "seo_title": "SEO-optimized title (30-60 chars)",
  "seo_description": "Meta description (120-160 chars)",
  "meta_keywords": ["keyword1", "keyword2", "keyword3"],
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Full article content with proper HTML formatting",
  "schema_type": "Article|BlogPosting|NewsArticle",
  "target_keywords": ["primary", "secondary", "longtail"],
  "featured_snippet_target": true/false,
  "readability_score": 70-90,
  "internal_linking_opportunities": ["anchor text 1", "anchor text 2"]
}`;

    const userPrompt = `Create SEO-optimized content about: ${topic}
    
Additional context:
- Focus on Vietnamese gaming audience
- Include actionable tips and insights
- Optimize for search engines while maintaining readability
- Target search intent: ${searchIntent}
- Primary keywords: ${targetKeywords.join(', ')}`;

    console.log('🎯 Calling AI:', aiModel);

    let blogPost;
    let tokensUsed = 0;

    if (aiModel.startsWith('gpt-')) {
      const key = Deno.env.get('OPENAI_API_KEY');
      if (!key) throw new Error('OPENAI_API_KEY missing');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await res.json();
      blogPost = JSON.parse(data.choices[0].message.content);
      tokensUsed = data.usage?.total_tokens || 0;

    } else if (aiModel.startsWith('claude-')) {
      const key = Deno.env.get('ANTHROPIC_API_KEY');
      if (!key) throw new Error('ANTHROPIC_API_KEY missing');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: aiModel,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = await res.json();
      const text = data.content[0].text;
      const match = text.match(/\{[\s\S]*\}/);
      blogPost = match ? JSON.parse(match[0]) : JSON.parse(text);
      tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    }

    console.log('✅ Generated:', blogPost.title);

    // Save to queue
    const { data: queueItem } = await supabase
      .from('content_queue')
      .insert({
        agent_id,
        content_type: 'blog_post',
        title: blogPost.title,
        content: {
          body: blogPost.content,
          seo_title: blogPost.seo_title,
          seo_description: blogPost.seo_description,
          tags: blogPost.tags,
        },
        metadata: { topic, ai_model: aiModel, tokens_used: tokensUsed },
        status: config.require_approval ? 'pending' : 'published',
        priority: 5,
      })
      .select()
      .single();

    // Calculate cost
    const costPerToken = aiModel.startsWith('gpt-4') ? 0.00003 : 0.000015; // GPT-4: $0.03/1K, Claude: $0.015/1K
    const totalCost = (tokensUsed / 1000) * costPerToken;

    // Track cost in database
    await supabase.rpc('track_agent_cost', {
      p_agent_id: agent_id,
      p_model_name: aiModel,
      p_tokens_used: tokensUsed,
      p_cost: totalCost,
      p_operation_type: 'generate_content',
    });

    // Log activity
    await supabase.from('activity_logs').insert({
      agent_id,
      action: 'generate_content',
      status: 'success',
      details: { 
        content_id: queueItem.id, 
        title: blogPost.title, 
        tokens_used: tokensUsed,
        cost: totalCost,
        model: aiModel,
      },
    });

    // Update stats
    await supabase
      .from('ai_agents')
      .update({
        total_runs: (agent.total_runs || 0) + 1,
        successful_runs: (agent.successful_runs || 0) + 1,
        last_run: new Date().toISOString(),
      })
      .eq('id', agent_id);

    return new Response(
      JSON.stringify({
        success: true,
        content_id: queueItem.id,
        title: blogPost.title,
        tokens_used: tokensUsed,
        cost: totalCost,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
