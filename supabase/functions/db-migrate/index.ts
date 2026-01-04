/**
 * DB Migration Edge Function
 * Run SQL migrations safely
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action } = await req.json();

    if (action === "create_ai_sales_config") {
      // Create table
      const { error: tableError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS ai_sales_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            version INT NOT NULL DEFAULT 1,
            is_active BOOLEAN DEFAULT false,
            model VARCHAR(50) DEFAULT 'gpt-4o-mini',
            max_tokens INT DEFAULT 1200,
            temperature DECIMAL(2,1) DEFAULT 0.8,
            system_prompt TEXT NOT NULL,
            name VARCHAR(100),
            description TEXT,
            created_by UUID,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            total_chats INT DEFAULT 0,
            avg_satisfaction DECIMAL(3,2)
          );

          ALTER TABLE ai_sales_config ENABLE ROW LEVEL SECURITY;

          CREATE POLICY IF NOT EXISTS "Service role full access"
            ON ai_sales_config FOR ALL USING (true);
        `,
      });

      if (tableError) {
        return new Response(JSON.stringify({ error: tableError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Table created" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
