// Supabase Edge Function: Publish Social Media Posts
// Processes social post queue and publishes to platforms

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending social posts
    const now = new Date().toISOString()
    const { data: pendingPosts, error: fetchError } = await supabaseClient
      .from('content_queue')
      .select('*')
      .eq('content_type', 'social_post')
      .eq('status', 'pending')
      .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
      .limit(10)

    if (fetchError) throw fetchError

    console.log(`Found ${pendingPosts?.length || 0} pending social posts`)

    const results = []

    for (const post of pendingPosts || []) {
      try {
        // Check budget before publishing
        const { data: budgetCheck } = await supabaseClient.rpc('check_agent_budget', {
          p_agent_id: post.agent_id
        })

        if (budgetCheck === false) {
          console.log(`⚠️ Budget exceeded for agent ${post.agent_id}, skipping post`)
          await supabaseClient
            .from('content_queue')
            .update({ 
              status: 'failed',
              error_message: 'Budget exceeded',
            })
            .eq('id', post.id)
          
          results.push({ id: post.id, success: false, error: 'Budget exceeded' })
          continue
        }

        await supabaseClient
          .from('content_queue')
          .update({ status: 'processing' })
          .eq('id', post.id)

        // Publish to platform
        const publishResult = await publishToSocialMedia(post.content)

        if (publishResult.success) {
          // Track cost ($0.0001 per post)
          const postCost = 0.0001
          await supabaseClient.rpc('track_agent_cost', {
            p_agent_id: post.agent_id,
            p_model_name: 'social_publish',
            p_tokens_used: 0,
            p_cost: postCost,
            p_operation_type: 'publish_social',
          })

          await supabaseClient
            .from('content_queue')
            .update({ 
              status: 'published',
              published_at: new Date().toISOString(),
              metadata: {
                ...post.metadata,
                post_id: publishResult.postId,
                post_url: publishResult.postUrl,
              },
            })
            .eq('id', post.id)

          await supabaseClient
            .from('activity_logs')
            .insert({
              agent_id: post.agent_id,
              action: `Posted to ${post.content.platform}`,
              status: 'success',
              details: {
                content_queue_id: post.id,
                platform: post.content.platform,
                post_id: publishResult.postId,
                post_url: publishResult.postUrl,
                cost: postCost,
              },
            })

          results.push({ id: post.id, success: true, platform: post.content.platform, cost: postCost })
        } else {
          throw new Error(publishResult.error || 'Publishing failed')
        }

      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error)

        const retryCount = (post.retry_count || 0) + 1
        const maxRetries = 3

        await supabaseClient
          .from('content_queue')
          .update({ 
            status: retryCount >= maxRetries ? 'failed' : 'pending',
            retry_count: retryCount,
            error_message: error.message,
          })
          .eq('id', post.id)

        await supabaseClient
          .from('activity_logs')
          .insert({
            agent_id: post.agent_id,
            action: `Failed to post to ${post.content.platform}`,
            status: 'error',
            error_message: error.message,
            details: {
              content_queue_id: post.id,
              retry_count: retryCount,
            },
          })

        results.push({ id: post.id, success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Publish to social media platform
async function publishToSocialMedia(content: any): Promise<{
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
}> {
  const platform = content.platform

  switch (platform) {
    case 'linkedin':
      return await publishToLinkedIn(content)
    case 'twitter':
      return await publishToTwitter(content)
    case 'facebook':
      return await publishToFacebook(content)
    default:
      return { success: false, error: `Unsupported platform: ${platform}` }
  }
}

async function publishToLinkedIn(content: any) {
  const token = Deno.env.get('LINKEDIN_ACCESS_TOKEN')
  if (!token) {
    return { success: false, error: 'LinkedIn token not configured' }
  }

  try {
    // Get profile
    const profileRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const profile = await profileRes.json()

    // Create post
    const postText = content.hashtags && content.hashtags.length > 0
      ? `${content.text}\n\n${content.hashtags.map((tag: string) => `#${tag}`).join(' ')}`
      : content.text

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${profile.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: postText },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    })

    const data = await response.json()
    return {
      success: true,
      postId: data.id,
      postUrl: `https://www.linkedin.com/feed/update/${data.id}`,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function publishToTwitter(content: any) {
  // Twitter v2 API requires OAuth 1.0a which is complex
  // Recommend using Zapier or Buffer for Twitter
  console.log('Twitter posting via edge function not implemented - use Zapier/Buffer')
  return {
    success: false,
    error: 'Twitter API requires OAuth 1.0a - use Zapier or Buffer integration',
  }
}

async function publishToFacebook(content: any) {
  const token = Deno.env.get('FACEBOOK_ACCESS_TOKEN')
  const pageId = Deno.env.get('FACEBOOK_PAGE_ID')

  if (!token || !pageId) {
    return { success: false, error: 'Facebook credentials not configured' }
  }

  try {
    const postText = content.hashtags && content.hashtags.length > 0
      ? `${content.text}\n\n${content.hashtags.map((tag: string) => `#${tag}`).join(' ')}`
      : content.text

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: postText,
          access_token: token,
        }),
      }
    )

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    return {
      success: true,
      postId: data.id,
      postUrl: `https://www.facebook.com/${data.id}`,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
