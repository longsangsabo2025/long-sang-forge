import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = "longsangsabo@gmail.com";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // POST /project-interest/interest - Submit project interest
    if (req.method === "POST" && path === "interest") {
      const body = await req.json();
      const { projectId, projectSlug, projectName, fullName, email, phone, message } = body;

      // Validation
      if (!fullName || !email || !phone) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: fullName, email, phone" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!projectId || !projectSlug || !projectName) {
        return new Response(JSON.stringify({ error: "Missing project information" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert into database
      const { data, error } = await supabase
        .from("project_interests")
        .insert({
          project_id: projectId,
          project_slug: projectSlug,
          project_name: projectName,
          full_name: fullName,
          email,
          phone,
          message: message || null,
          status: "new",
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to submit interest", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send notification emails
      try {
        // Thank you email to user
        await resend.emails.send({
          from: "Long Sang <noreply@longsang.org>",
          to: email,
          subject: `Cảm ơn bạn đã quan tâm - ${projectName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Xin chào ${fullName},</h2>
              <p>Cảm ơn bạn đã quan tâm đến dự án <strong>${projectName}</strong>!</p>
              <p>Team của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để tư vấn chi tiết.</p>
              ${message ? `<p>Ghi chú của bạn: <em>${message}</em></p>` : ""}
              <p>Trân trọng,<br>Long Sang Team</p>
            </div>
          `,
        });

        // Notification to sales team
        await resend.emails.send({
          from: "Long Sang System <noreply@longsang.org>",
          to: ADMIN_EMAIL,
          subject: `🔔 Lead mới: ${fullName} quan tâm ${projectName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Lead Mới!</h2>
              <h3>Dự án: ${projectName}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td><strong>Họ tên:</strong></td><td>${fullName}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                <tr><td><strong>SĐT:</strong></td><td>${phone}</td></tr>
                ${message ? `<tr><td><strong>Ghi chú:</strong></td><td>${message}</td></tr>` : ""}
              </table>
              <p style="margin-top: 20px;"><a href="tel:${phone}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Gọi ngay</a></p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Your interest has been recorded successfully",
          interestId: data.id,
          data,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /project-interest/interests - Get all interests (admin)
    if (req.method === "GET" && path === "interests") {
      const status = url.searchParams.get("status");
      const projectSlug = url.searchParams.get("projectSlug");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("project_interests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq("status", status);
      if (projectSlug) query = query.eq("project_slug", projectSlug);

      const { data, error, count } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch interests", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ success: true, data, count, limit, offset }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PATCH /project-interest/:id - Update interest status
    if (req.method === "PATCH") {
      const id = path;
      const body = await req.json();
      const { status, notes } = body;

      const { data, error } = await supabase
        .from("project_interests")
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to update interest", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Test endpoint
    if (req.method === "GET" && path === "test") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Project Interest Edge Function is ready!",
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Project interest error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
