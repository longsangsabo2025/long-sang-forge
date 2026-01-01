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
    // POST /investment/apply - Submit investment application
    if (req.method === "POST" && path === "apply") {
      const body = await req.json();
      const {
        projectId,
        projectSlug,
        projectName,
        fullName,
        email,
        phone,
        address,
        investmentAmount,
        investorType,
        companyName,
        investmentPurpose,
        investmentExperience,
        riskTolerance,
        identityDocument,
        agreeTerms,
        agreeRisk,
        agreePrivacy,
      } = body;

      // Validation
      if (!fullName || !email || !phone || !address) {
        return new Response(JSON.stringify({ error: "Missing required personal information" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!investmentAmount || !investorType || !investmentPurpose) {
        return new Response(JSON.stringify({ error: "Missing required investment details" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!agreeTerms || !agreeRisk || !agreePrivacy) {
        return new Response(
          JSON.stringify({ error: "You must agree to all terms and conditions" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert into database
      const { data, error } = await supabase
        .from("investment_applications")
        .insert({
          project_id: projectId,
          project_slug: projectSlug,
          project_name: projectName,
          full_name: fullName,
          email,
          phone,
          address,
          investment_amount: investmentAmount,
          investor_type: investorType,
          company_name: companyName || null,
          investment_purpose: investmentPurpose,
          investment_experience: investmentExperience,
          risk_tolerance: riskTolerance,
          identity_document: identityDocument,
          agree_terms: agreeTerms,
          agree_risk: agreeRisk,
          agree_privacy: agreePrivacy,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to submit application", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send notification emails
      try {
        // Email to investor
        await resend.emails.send({
          from: "Long Sang <noreply@longsang.org>",
          to: email,
          subject: `✅ Đơn đầu tư của bạn đã được ghi nhận - ${projectName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Xin chào ${fullName},</h2>
              <p>Cảm ơn bạn đã quan tâm đến dự án <strong>${projectName}</strong>!</p>
              <p>Đơn đăng ký đầu tư của bạn đã được ghi nhận với thông tin:</p>
              <ul>
                <li>Số tiền dự kiến: <strong>${formatCurrency(investmentAmount)}</strong></li>
                <li>Loại nhà đầu tư: <strong>${investorType}</strong></li>
              </ul>
              <p>Team của chúng tôi sẽ liên hệ với bạn trong vòng 24-48 giờ.</p>
              <p>Trân trọng,<br>Long Sang Team</p>
            </div>
          `,
        });

        // Email to admin
        await resend.emails.send({
          from: "Long Sang System <noreply@longsang.org>",
          to: ADMIN_EMAIL,
          subject: `🔔 Đơn đầu tư mới: ${fullName} - ${formatCurrency(investmentAmount)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Đơn Đầu Tư Mới!</h2>
              <h3>Dự án: ${projectName}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td><strong>Họ tên:</strong></td><td>${fullName}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                <tr><td><strong>SĐT:</strong></td><td>${phone}</td></tr>
                <tr><td><strong>Số tiền:</strong></td><td>${formatCurrency(
                  investmentAmount
                )}</td></tr>
                <tr><td><strong>Loại NĐT:</strong></td><td>${investorType}</td></tr>
                <tr><td><strong>Công ty:</strong></td><td>${companyName || "N/A"}</td></tr>
                <tr><td><strong>Mục đích:</strong></td><td>${investmentPurpose}</td></tr>
                <tr><td><strong>Kinh nghiệm:</strong></td><td>${investmentExperience}</td></tr>
                <tr><td><strong>Chấp nhận rủi ro:</strong></td><td>${riskTolerance}</td></tr>
              </table>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Investment application submitted successfully",
          applicationId: data.id,
          data,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /investment/applications - Get all applications (admin)
    if (req.method === "GET" && path === "applications") {
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("investment_applications")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch applications", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ success: true, data, count, limit, offset }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Test endpoint
    if (req.method === "GET" && path === "test") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Investment Edge Function is ready!",
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
    console.error("Investment error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
