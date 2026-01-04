/**
 * SEO Tools - Supabase Edge Function
 * ===================================
 * ELON EDITION: Fast, Simple, Effective
 *
 * Endpoints:
 * - POST ?tool=analyze - Analyze website SEO
 * - POST ?tool=keywords - Extract keywords
 * - POST ?tool=audit - Quick SEO audit
 * - GET ?tool=health - Health check
 */

import OpenAI from "https://esm.sh/openai@4.104.0";

// ============================================
// CORS
// ============================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

// ============================================
// FETCH HTML (with timeout)
// ============================================
async function fetchHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LongSangBot/1.0; +https://longsang.org)",
      },
    });
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// PARSE HTML (basic - no cheerio in Deno)
// ============================================
function parseHTML(html: string) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || "";

  // Extract meta description
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch?.[1]?.trim() || "";

  // Extract H1s
  const h1Matches = html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi);
  const h1s = [...h1Matches].map((m) => m[1].trim()).filter(Boolean);

  // Extract H2s
  const h2Matches = html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi);
  const h2s = [...h2Matches].map((m) => m[1].trim()).filter(Boolean);

  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const canonical = canonicalMatch?.[1] || "";

  // Check viewport
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);

  // Check robots
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  const robots = robotsMatch?.[1] || "";

  // Extract text content (rough)
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);

  return {
    title,
    description,
    h1s,
    h2s,
    canonical,
    hasViewport,
    robots,
    textContent,
    htmlLength: html.length,
  };
}

// ============================================
// SEO ANALYZE
// ============================================
async function analyzeSEO(body: Record<string, unknown>, openai: OpenAI | null) {
  const { url, domain } = body;
  const targetUrl = (url || domain) as string;

  if (!targetUrl) {
    return { error: "URL or domain is required", status: 400 };
  }

  const fullUrl = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;

  try {
    const html = await fetchHTML(fullUrl);
    const parsed = parseHTML(html);

    // Basic SEO scores
    const scores = {
      title:
        parsed.title.length > 0 && parsed.title.length <= 60
          ? 100
          : parsed.title.length > 60
          ? 70
          : 0,
      description:
        parsed.description.length >= 120 && parsed.description.length <= 160
          ? 100
          : parsed.description.length > 0
          ? 70
          : 0,
      h1: parsed.h1s.length === 1 ? 100 : parsed.h1s.length > 1 ? 70 : 0,
      viewport: parsed.hasViewport ? 100 : 0,
      canonical: parsed.canonical ? 100 : 50,
    };

    const overallScore = Math.round(
      (scores.title + scores.description + scores.h1 + scores.viewport + scores.canonical) / 5
    );

    // AI analysis if available
    let aiAnalysis = null;
    if (openai && parsed.textContent.length > 100) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an SEO expert. Analyze briefly in Vietnamese." },
          {
            role: "user",
            content: `Analyze SEO for: ${fullUrl}\n\nTitle: ${parsed.title}\nDescription: ${
              parsed.description
            }\nH1: ${parsed.h1s.join(", ")}\n\nProvide 3 quick improvements.`,
          },
        ],
        max_tokens: 300,
      });
      aiAnalysis = completion.choices[0]?.message?.content;
    }

    return {
      success: true,
      url: fullUrl,
      scores,
      overallScore,
      data: {
        title: parsed.title,
        titleLength: parsed.title.length,
        description: parsed.description,
        descriptionLength: parsed.description.length,
        h1Count: parsed.h1s.length,
        h1s: parsed.h1s.slice(0, 3),
        h2Count: parsed.h2s.length,
        hasViewport: parsed.hasViewport,
        canonical: parsed.canonical,
        robots: parsed.robots,
      },
      aiAnalysis,
    };
  } catch (err) {
    const error = err as Error;
    return { error: `Failed to analyze: ${error.message}`, status: 500 };
  }
}

// ============================================
// KEYWORD EXTRACTION
// ============================================
async function extractKeywords(body: Record<string, unknown>, openai: OpenAI | null) {
  const { url, text, topic } = body;

  if (!openai) {
    return { error: "OpenAI not configured", status: 503 };
  }

  let content = (text as string) || "";

  if (url && !content) {
    const fullUrl = (url as string).startsWith("http") ? (url as string) : `https://${url}`;
    const html = await fetchHTML(fullUrl);
    const parsed = parseHTML(html);
    content = `${parsed.title}. ${parsed.description}. ${parsed.textContent}`;
  }

  if (!content && !topic) {
    return { error: "URL, text, or topic is required", status: 400 };
  }

  const prompt = topic
    ? `Generate 10 SEO keywords for topic: "${topic}" (Vietnamese market)`
    : `Extract 10 main SEO keywords from this text:\n\n${content.slice(0, 2000)}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an SEO keyword expert. Return JSON array of keywords with search volume estimate.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  let keywords;
  try {
    keywords = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch {
    keywords = { raw: completion.choices[0]?.message?.content };
  }

  return {
    success: true,
    keywords,
    source: url || topic || "text",
  };
}

// ============================================
// QUICK AUDIT
// ============================================
async function quickAudit(body: Record<string, unknown>, openai: OpenAI | null) {
  const { url } = body;

  if (!url) {
    return { error: "URL is required", status: 400 };
  }

  const fullUrl = (url as string).startsWith("http") ? (url as string) : `https://${url}`;

  try {
    const html = await fetchHTML(fullUrl);
    const parsed = parseHTML(html);

    const issues: string[] = [];
    const passed: string[] = [];

    // Check title
    if (!parsed.title) issues.push("❌ Missing title tag");
    else if (parsed.title.length > 60) issues.push("⚠️ Title too long (>60 chars)");
    else passed.push("✅ Title OK");

    // Check description
    if (!parsed.description) issues.push("❌ Missing meta description");
    else if (parsed.description.length < 120) issues.push("⚠️ Description too short (<120 chars)");
    else if (parsed.description.length > 160) issues.push("⚠️ Description too long (>160 chars)");
    else passed.push("✅ Description OK");

    // Check H1
    if (parsed.h1s.length === 0) issues.push("❌ Missing H1 tag");
    else if (parsed.h1s.length > 1) issues.push("⚠️ Multiple H1 tags");
    else passed.push("✅ H1 OK");

    // Check viewport
    if (!parsed.hasViewport) issues.push("❌ Missing viewport meta");
    else passed.push("✅ Viewport OK");

    // Check canonical
    if (!parsed.canonical) issues.push("⚠️ Missing canonical URL");
    else passed.push("✅ Canonical OK");

    // Check robots
    if (parsed.robots.includes("noindex")) issues.push("⚠️ Page set to noindex");

    return {
      success: true,
      url: fullUrl,
      score: Math.round((passed.length / (passed.length + issues.length)) * 100),
      passed,
      issues,
      summary: {
        title: parsed.title,
        description: parsed.description?.slice(0, 100) + "...",
        h1: parsed.h1s[0] || "None",
      },
    };
  } catch (err) {
    const error = err as Error;
    return { error: `Audit failed: ${error.message}`, status: 500 };
  }
}

// ============================================
// MAIN HANDLER
// ============================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const tool = url.searchParams.get("tool");
  const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

  // GET - Health/Info
  if (req.method === "GET") {
    if (tool === "health") {
      return new Response(
        JSON.stringify({
          status: "OK",
          tools: ["analyze", "keywords", "audit"],
          openai: !!openai,
          version: "1.0",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        api: "SEO Tools v1.0",
        endpoints: {
          "GET ?tool=health": "Health check",
          "POST ?tool=analyze": "Full SEO analysis",
          "POST ?tool=keywords": "Keyword extraction",
          "POST ?tool=audit": "Quick SEO audit",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // POST - Tools
  if (req.method === "POST") {
    try {
      const body = await req.json();
      let result;

      switch (tool) {
        case "analyze":
          result = await analyzeSEO(body, openai);
          break;
        case "keywords":
          result = await extractKeywords(body, openai);
          break;
        case "audit":
          result = await quickAudit(body, openai);
          break;
        default:
          return new Response(
            JSON.stringify({
              error: "Invalid tool. Use ?tool=analyze|keywords|audit",
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }

      if (result.status) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("[SEO Tools Error]", err);
      const error = err as Error;
      return new Response(
        JSON.stringify({
          error: "SEO_ERROR",
          message: error.message,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
