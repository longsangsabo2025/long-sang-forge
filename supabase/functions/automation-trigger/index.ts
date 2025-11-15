// ================================================
// AUTOMATION TRIGGER EDGE FUNCTION
// ================================================
// Purpose: Handle automation triggers from various sources
// ================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerRequest {
  trigger_type: 'database' | 'schedule' | 'webhook' | 'manual';
  agent_id?: string;
  workflow_id?: string;
  context?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request
    const { trigger_type, agent_id, workflow_id, context }: TriggerRequest = await req.json();

    console.log('Automation trigger received:', { trigger_type, agent_id, workflow_id });

    // Get workflow or agent
    let workflow;
    if (workflow_id) {
      const { data, error } = await supabaseClient
        .from('workflows')
        .select('*')
        .eq('id', workflow_id)
        .single();
      
      if (error) throw error;
      workflow = data;
    } else if (agent_id) {
      // Find default workflow for agent
      const { data, error } = await supabaseClient
        .from('workflows')
        .select('*')
        .contains('agents_used', [agent_id])
        .eq('status', 'active')
        .limit(1)
        .single();
      
      if (error) throw error;
      workflow = data;
    } else {
      throw new Error('Either agent_id or workflow_id must be provided');
    }

    // Create execution record
    const { data: execution, error: execError } = await supabaseClient
      .from('workflow_executions')
      .insert({
        workflow_id: workflow.id,
        status: 'pending',
        input_data: context || {},
        started_at: new Date().toISOString(),
        total_steps: workflow.definition?.steps?.length || 0,
        completed_steps: 0
      })
      .select()
      .single();

    if (execError) throw execError;

    // Log the trigger
    await supabaseClient
      .from('execution_logs')
      .insert({
        execution_id: execution.id,
        level: 'info',
        message: `Workflow triggered via ${trigger_type}`,
        data: {
          trigger_type,
          agent_id,
          workflow_id: workflow.id,
          context
        }
      });

    // Execute workflow asynchronously
    executeWorkflow(supabaseClient, execution.id, workflow, context || {})
      .catch(error => {
        console.error('Workflow execution error:', error);
        // Update execution status
        supabaseClient
          .from('workflow_executions')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id)
          .then(() => {
            // Log error
            supabaseClient
              .from('execution_logs')
              .insert({
                execution_id: execution.id,
                level: 'error',
                message: 'Workflow execution failed',
                error_message: error.message,
                stack_trace: error.stack
              });
          });
      });

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: execution.id,
        workflow_id: workflow.id,
        status: 'pending'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// ================================================
// WORKFLOW EXECUTION
// ================================================

async function executeWorkflow(
  supabase: any,
  executionId: string,
  workflow: any,
  context: Record<string, any>
) {
  console.log('Executing workflow:', workflow.id);

  // Update status to running
  await supabase
    .from('workflow_executions')
    .update({ status: 'running' })
    .eq('id', executionId);

  const startTime = Date.now();
  const steps = workflow.definition?.steps || [];
  let currentStep = 0;

  try {
    // Execute each step
    for (const step of steps) {
      currentStep++;
      
      // Update progress
      await supabase
        .from('workflow_executions')
        .update({
          current_step: step.name,
          completed_steps: currentStep - 1
        })
        .eq('id', executionId);

      // Log step start
      await supabase
        .from('execution_logs')
        .insert({
          execution_id: executionId,
          level: 'info',
          message: `Executing step: ${step.name}`,
          step_name: step.name,
          data: { step_number: currentStep, total_steps: steps.length }
        });

      // Execute step based on action
      await executeStep(supabase, step, context);

      // Log step completion
      await supabase
        .from('execution_logs')
        .insert({
          execution_id: executionId,
          level: 'info',
          message: `Step completed: ${step.name}`,
          step_name: step.name
        });
    }

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    // Mark as completed
    await supabase
      .from('workflow_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTime,
        completed_steps: steps.length,
        final_result: { success: true, steps_completed: steps.length }
      })
      .eq('id', executionId);

    console.log('Workflow completed:', executionId);

  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
}

// ================================================
// STEP EXECUTION
// ================================================

async function executeStep(
  supabase: any,
  step: any,
  context: Record<string, any>
) {
  console.log('Executing step:', step.name, step.action);

  switch (step.action) {
    case 'generate_content':
      await generateContent(supabase, step, context);
      break;
    
    case 'send_email':
      await sendEmail(supabase, step, context);
      break;
    
    case 'post_social':
      await postToSocial(supabase, step, context);
      break;
    
    case 'analyze_data':
      await analyzeData(supabase, step, context);
      break;
    
    case 'wait':
      await wait(step.config?.duration_ms || 1000);
      break;
    
    default:
      console.log('Unknown action:', step.action);
  }
}

// ================================================
// ACTION IMPLEMENTATIONS
// ================================================

async function generateContent(supabase: any, step: any, context: any) {
  // TODO: Integrate with OpenAI or other AI service
  console.log('Generating content...', context);
  
  // Simulate content generation
  await wait(2000);
  
  // Store in content queue
  await supabase
    .from('content_queue')
    .insert({
      content_type: 'blog_post',
      title: `Generated: ${context.topic || 'Sample Topic'}`,
      content: {
        body: 'AI-generated content will appear here',
        topic: context.topic
      },
      status: 'pending',
      priority: 1
    });
}

async function sendEmail(supabase: any, step: any, context: any) {
  // TODO: Integrate with Resend or other email service
  console.log('Sending email...', context);
  await wait(1000);
}

async function postToSocial(supabase: any, step: any, context: any) {
  // TODO: Integrate with social media APIs
  console.log('Posting to social media...', context);
  await wait(1000);
}

async function analyzeData(supabase: any, step: any, context: any) {
  // TODO: Implement data analysis
  console.log('Analyzing data...', context);
  await wait(1500);
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
