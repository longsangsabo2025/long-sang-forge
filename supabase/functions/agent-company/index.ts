import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "dashboard";

    // ═══════════════════════════════════════════
    // ACTION: DASHBOARD — Full company overview
    // ═══════════════════════════════════════════
    if (action === "dashboard") {
      // Department summary
      const { data: departments } = await supabase.rpc("get_agent_departments");
      
      // If RPC doesn't exist, do it manually
      const { data: agents } = await supabase
        .from("agent_registry")
        .select("*")
        .order("department", { ascending: true });

      const { data: recentExecs } = await supabase
        .from("agent_execution_log")
        .select("*, agent_registry(name, codename, avatar_emoji)")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: todayReports } = await supabase
        .from("agent_daily_report")
        .select("*, agent_registry(name, codename, avatar_emoji)")
        .eq("report_date", new Date().toISOString().split("T")[0])
        .order("executions_count", { ascending: false });

      // Compute department stats
      const deptStats: Record<string, any> = {};
      for (const agent of agents || []) {
        if (!deptStats[agent.department]) {
          deptStats[agent.department] = {
            total: 0, active: 0, idle: 0, busy: 0, error: 0,
            total_cost: 0, total_revenue: 0, total_executions: 0,
            agents: []
          };
        }
        const d = deptStats[agent.department];
        d.total++;
        d[agent.status] = (d[agent.status] || 0) + 1;
        d.total_cost += parseFloat(agent.total_cost_usd || 0);
        d.total_revenue += parseFloat(agent.total_revenue_usd || 0);
        d.total_executions += agent.total_executions || 0;
        d.agents.push({
          id: agent.id,
          name: agent.name,
          codename: agent.codename,
          emoji: agent.avatar_emoji,
          status: agent.status,
          type: agent.type,
          model: agent.model,
          cost_per_run: agent.cost_per_run,
          success_rate: agent.success_rate,
          total_executions: agent.total_executions,
          last_active: agent.last_active_at,
        });
      }

      return new Response(JSON.stringify({
        success: true,
        company: {
          name: "LongSang AI Empire",
          total_agents: agents?.length || 0,
          active: agents?.filter(a => a.status === "active").length || 0,
          idle: agents?.filter(a => a.status === "idle").length || 0,
          busy: agents?.filter(a => a.status === "busy").length || 0,
          error: agents?.filter(a => a.status === "error").length || 0,
          total_cost: agents?.reduce((s, a) => s + parseFloat(a.total_cost_usd || 0), 0) || 0,
          total_revenue: agents?.reduce((s, a) => s + parseFloat(a.total_revenue_usd || 0), 0) || 0,
          departments: deptStats,
        },
        recent_executions: recentExecs || [],
        today_reports: todayReports || [],
        timestamp: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ═══════════════════════════════════════════
    // ACTION: AGENTS — List all agents (optionally by department)
    // ═══════════════════════════════════════════
    if (action === "agents") {
      const dept = url.searchParams.get("department");
      let query = supabase.from("agent_registry").select("*").order("department");
      if (dept) query = query.eq("department", dept);
      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, agents: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════
    // ACTION: EXECUTE — Log an agent execution start
    // ═══════════════════════════════════════════
    if (action === "execute" && req.method === "POST") {
      const body = await req.json();
      const { agent_codename, trigger_type, input, pipeline_id, stage_number } = body;

      // Find agent
      const { data: agent } = await supabase
        .from("agent_registry")
        .select("id")
        .eq("codename", agent_codename)
        .single();

      if (!agent) {
        return new Response(JSON.stringify({ error: `Agent ${agent_codename} not found` }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create execution log
      const { data: exec, error } = await supabase
        .from("agent_execution_log")
        .insert({
          agent_id: agent.id,
          trigger_type: trigger_type || "manual",
          input,
          pipeline_id,
          stage_number,
          status: "running",
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, execution: exec }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════
    // ACTION: COMPLETE — Log execution completion
    // ═══════════════════════════════════════════
    if (action === "complete" && req.method === "POST") {
      const body = await req.json();
      const { execution_id, status, output, error_message, cost_usd, tokens_used } = body;

      const { data, error } = await supabase
        .from("agent_execution_log")
        .update({
          status: status || "success",
          output,
          error_message,
          cost_usd: cost_usd || 0,
          tokens_used: tokens_used || 0,
          completed_at: new Date().toISOString(),
          duration_ms: null, // Will be calculated by trigger or client
        })
        .eq("id", execution_id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, execution: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════
    // ACTION: MESSAGE — Send message between agents/CEO
    // ═══════════════════════════════════════════
    if (action === "message" && req.method === "POST") {
      const body = await req.json();
      const { from_codename, to_codename, message_type, content, metadata } = body;

      const agents: Record<string, string> = {};
      if (from_codename) {
        const { data } = await supabase.from("agent_registry").select("id").eq("codename", from_codename).single();
        if (data) agents.from = data.id;
      }
      if (to_codename) {
        const { data } = await supabase.from("agent_registry").select("id").eq("codename", to_codename).single();
        if (data) agents.to = data.id;
      }

      const { data, error } = await supabase
        .from("agent_messages")
        .insert({
          from_agent_id: agents.from || null,
          to_agent_id: agents.to || null,
          message_type: message_type || "task",
          content,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════
    // ACTION: MORNING-BRIEFING — CEO daily briefing
    // ═══════════════════════════════════════════
    if (action === "morning-briefing") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Yesterday's reports
      const { data: reports } = await supabase
        .from("agent_daily_report")
        .select("*, agent_registry(name, codename, department, avatar_emoji)")
        .eq("report_date", yesterdayStr);

      // Agents with errors
      const { data: errorAgents } = await supabase
        .from("agent_registry")
        .select("name, codename, department, avatar_emoji")
        .eq("status", "error");

      // Total stats
      const { data: allAgents } = await supabase
        .from("agent_registry")
        .select("status, total_cost_usd, total_revenue_usd, total_executions");

      const totalCost = allAgents?.reduce((s, a) => s + parseFloat(a.total_cost_usd || 0), 0) || 0;
      const totalRevenue = allAgents?.reduce((s, a) => s + parseFloat(a.total_revenue_usd || 0), 0) || 0;
      const totalExecs = allAgents?.reduce((s, a) => s + (a.total_executions || 0), 0) || 0;

      // Pending messages (decisions)
      const { data: pendingMessages } = await supabase
        .from("agent_messages")
        .select("*, agent_registry!from_agent_id(name, avatar_emoji)")
        .eq("message_type", "decision")
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      const briefing = {
        date: new Date().toISOString().split("T")[0],
        greeting: `Chào CEO! Đây là Morning Briefing ngày ${new Date().toLocaleDateString("vi-VN")}`,
        company_stats: {
          total_agents: allAgents?.length || 0,
          active: allAgents?.filter(a => a.status === "active").length || 0,
          idle: allAgents?.filter(a => a.status === "idle").length || 0,
          error: allAgents?.filter(a => a.status === "error").length || 0,
          total_cost_usd: totalCost,
          total_revenue_usd: totalRevenue,
          total_executions: totalExecs,
          roi: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100).toFixed(1) + "%" : "N/A",
        },
        yesterday_summary: {
          reports_count: reports?.length || 0,
          total_executions: reports?.reduce((s, r) => s + (r.executions_count || 0), 0) || 0,
          total_cost: reports?.reduce((s, r) => s + parseFloat(r.total_cost_usd || 0), 0) || 0,
          top_performers: reports?.sort((a, b) => (b.executions_count || 0) - (a.executions_count || 0)).slice(0, 3) || [],
        },
        alerts: {
          error_agents: errorAgents || [],
          pending_decisions: pendingMessages || [],
        },
      };

      return new Response(JSON.stringify({ success: true, briefing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: health check
    return new Response(JSON.stringify({
      success: true,
      service: "agent-company",
      version: "1.0.0",
      actions: ["dashboard", "agents", "execute", "complete", "message", "morning-briefing"],
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
