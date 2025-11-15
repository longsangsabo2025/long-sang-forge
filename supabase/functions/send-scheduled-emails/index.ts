// Supabase Edge Function: Send Scheduled Emails
// Processes email queue and sends emails via Resend/SendGrid

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

    // Get pending emails from content queue
    const now = new Date().toISOString()
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from('content_queue')
      .select('*')
      .eq('content_type', 'email')
      .eq('status', 'pending')
      .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
      .limit(10)

    if (fetchError) throw fetchError

    console.log(`Found ${pendingEmails?.length || 0} pending emails`)

    const results = []

    for (const emailItem of pendingEmails || []) {
      try {
        // Check budget before sending
        const { data: budgetCheck } = await supabaseClient.rpc('check_agent_budget', {
          p_agent_id: emailItem.agent_id
        })

        if (budgetCheck === false) {
          console.log(`⚠️ Budget exceeded for agent ${emailItem.agent_id}, skipping email`)
          await supabaseClient
            .from('content_queue')
            .update({ 
              status: 'failed',
              error_message: 'Budget exceeded',
            })
            .eq('id', emailItem.id)
          
          results.push({ id: emailItem.id, success: false, error: 'Budget exceeded' })
          continue
        }

        // Update status to processing
        await supabaseClient
          .from('content_queue')
          .update({ status: 'processing' })
          .eq('id', emailItem.id)

        // Send email
        const emailResult = await sendEmail(emailItem.content)

        if (emailResult.success) {
          // Mark as published
          await supabaseClient
            .from('content_queue')
            .update({ 
              status: 'published',
              published_at: new Date().toISOString(),
            })
            .eq('id', emailItem.id)

          // Track cost ($0.001 per email)
          const emailCost = 0.001
          await supabaseClient.rpc('track_agent_cost', {
            p_agent_id: emailItem.agent_id,
            p_model_name: 'resend_email',
            p_tokens_used: 0,
            p_cost: emailCost,
            p_operation_type: 'send_email',
          })

          // Log success
          await supabaseClient
            .from('activity_logs')
            .insert({
              agent_id: emailItem.agent_id,
              action: 'Email sent successfully',
              status: 'success',
              details: {
                content_queue_id: emailItem.id,
                to: emailItem.content.to,
                subject: emailItem.content.subject,
                message_id: emailResult.messageId,
                cost: emailCost,
              },
            })

          results.push({ id: emailItem.id, success: true, cost: emailCost })
        } else {
          throw new Error(emailResult.error || 'Email sending failed')
        }

      } catch (error) {
        console.error(`Failed to send email ${emailItem.id}:`, error)

        // Update retry count
        const retryCount = (emailItem.retry_count || 0) + 1
        const maxRetries = 3

        await supabaseClient
          .from('content_queue')
          .update({ 
            status: retryCount >= maxRetries ? 'failed' : 'pending',
            retry_count: retryCount,
            error_message: error.message,
          })
          .eq('id', emailItem.id)

        // Log error
        await supabaseClient
          .from('activity_logs')
          .insert({
            agent_id: emailItem.agent_id,
            action: 'Email sending failed',
            status: 'error',
            error_message: error.message,
            details: {
              content_queue_id: emailItem.id,
              retry_count: retryCount,
            },
          })

        results.push({ id: emailItem.id, success: false, error: error.message })
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

// Send email via Resend or SendGrid
async function sendEmail(emailContent: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const sendgridKey = Deno.env.get('SENDGRID_API_KEY')

  // Prefer Resend
  if (resendKey) {
    return await sendViaResend(emailContent, resendKey)
  }

  if (sendgridKey) {
    return await sendViaSendGrid(emailContent, sendgridKey)
  }

  return {
    success: false,
    error: 'No email provider configured',
  }
}

async function sendViaResend(content: any, apiKey: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: content.from || 'noreply@longsang.org',
      to: Array.isArray(content.to) ? content.to : [content.to],
      subject: content.subject,
      html: content.body,
      reply_to: content.replyTo,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend error: ${error.message}`)
  }

  const data = await response.json()
  return { success: true, messageId: data.id }
}

async function sendViaSendGrid(content: any, apiKey: string) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{
        to: Array.isArray(content.to) 
          ? content.to.map((email: string) => ({ email }))
          : [{ email: content.to }],
        subject: content.subject,
      }],
      from: { email: content.from || 'noreply@longsang.org' },
      content: [
        { type: 'text/html', value: content.body },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`SendGrid error: ${JSON.stringify(error)}`)
  }

  return { 
    success: true, 
    messageId: response.headers.get('x-message-id') || undefined 
  }
}
