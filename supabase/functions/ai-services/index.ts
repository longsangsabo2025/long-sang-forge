/**
 * AI Services - Unified Supabase Edge Function
 * =============================================
 * ELON EDITION: One function to rule them all
 *
 * Endpoints:
 * - POST /ai-assistant - Academy lesson chat
 * - POST /ai-review - Project review
 * - GET ?service=health - Health check
 */

import OpenAI from "https://esm.sh/openai@4.104.0";

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  MODELS: {
    chat: "gpt-4o-mini",
    review: "gpt-4o-mini",
  },
  MAX_TOKENS: {
    chat: 800,
    review: 1500,
  },
  PRICING: {
    input: 0.15 / 1_000_000,
    output: 0.6 / 1_000_000,
  },
};

// ============================================
// CORS
// ============================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

// ============================================
// DEMO RESPONSES (when no OpenAI key)
// ============================================
const DEMO_RESPONSES = {
  assistant: [
    `👋 Xin chào! Tôi là AI Assistant của Long Sang Academy.

🔧 **Chế độ Demo**: AI đang chạy demo mode.

💡 Bạn có thể:
- Xem nội dung bài học
- Đọc documentation
- Liên hệ support nếu cần hỗ trợ

📧 Contact: hi@longsang.org`,
    `Cảm ơn bạn đã quan tâm! 🚀

**Long Sang Academy** cung cấp:
• 🤖 Khóa học AI Agent Development
• 💼 Real-world Projects
• 🎯 1-on-1 Mentoring

_(Demo mode - liên hệ để được hỗ trợ đầy đủ)_`,
  ],
  review: {
    score: 75,
    grade: "B",
    strengths: ["Demo review - cần cấu hình OpenAI API"],
    improvements: ["Liên hệ admin để kích hoạt AI review"],
    feedback: "Đây là demo review. Vui lòng liên hệ admin để kích hoạt tính năng AI review đầy đủ.",
    next_steps: ["Liên hệ hi@longsang.org"],
    business_potential: "N/A - Demo mode",
    estimated_value: "N/A",
  },
};

// ============================================
// AI ASSISTANT
// ============================================
async function handleAssistant(body: Record<string, unknown>, openai: OpenAI | null) {
  const { lessonId, lessonTitle, lessonContext = "", messages = [], userMessage } = body;

  if (!userMessage || (userMessage as string).trim().length === 0) {
    return { error: "Message is required", status: 400 };
  }

  // Demo mode
  if (!openai) {
    const randomIdx = Math.floor(Math.random() * DEMO_RESPONSES.assistant.length);
    return {
      success: true,
      message: DEMO_RESPONSES.assistant[randomIdx],
      demo: true,
    };
  }

  const systemPrompt = `Bạn là AI trợ giảng của Long Sang Academy.

📚 BÀI HỌC HIỆN TẠI: ${lessonTitle || "General"}
${lessonContext ? `\n📝 NỘI DUNG:\n${lessonContext}` : ""}

🎯 NHIỆM VỤ:
- Giải đáp thắc mắc về bài học
- Hướng dẫn code, debug
- Gợi ý resources học thêm

💬 STYLE:
- Thân thiện, dễ hiểu
- Ví dụ thực tế
- Code samples khi cần
- Mix Việt-Anh tự nhiên`;

  const completion = await openai.chat.completions.create({
    model: CONFIG.MODELS.chat,
    messages: [
      { role: "system", content: systemPrompt },
      ...(messages as Array<{ role: string; content: string }>).slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage as string },
    ],
    max_tokens: CONFIG.MAX_TOKENS.chat,
    temperature: 0.7,
  });

  const response = completion.choices[0]?.message?.content || "Xin lỗi, có lỗi xảy ra.";
  const usage = completion.usage || {};

  return {
    success: true,
    message: response,
    usage: {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
    },
    lessonId,
  };
}

// ============================================
// AI REVIEW
// ============================================
async function handleReview(body: Record<string, unknown>, openai: OpenAI | null) {
  const { submissionId, title, description, github_url, demo_url } = body;

  if (!title || !description) {
    return { error: "Title and description are required", status: 400 };
  }

  // Demo mode
  if (!openai) {
    return {
      success: true,
      review: DEMO_RESPONSES.review,
      demo: true,
    };
  }

  const prompt = `You are an expert AI agent developer at Long Sang Academy.

Review this student project:

**Project:**
- Title: ${title}
- Description: ${description}
- GitHub: ${github_url || "Not provided"}
- Demo: ${demo_url || "Not provided"}

**Criteria (100 points):**
1. Functionality (30): Does it work?
2. Code Quality (20): Clean, documented?
3. Innovation (20): Creative approach?
4. Business Value (20): Can it be sold?
5. Deployment (10): Is it live?

**Response (JSON only):**
{
  "score": <0-100>,
  "grade": "<A/B/C/D/F>",
  "strengths": ["3-5 items"],
  "improvements": ["3-5 items"],
  "feedback": "2-3 paragraphs",
  "next_steps": ["3-4 items"],
  "business_potential": "1 paragraph",
  "estimated_value": "Monthly price range"
}`;

  const completion = await openai.chat.completions.create({
    model: CONFIG.MODELS.review,
    messages: [
      {
        role: "system",
        content:
          "You are an expert AI developer and instructor. Provide detailed, practical reviews.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: CONFIG.MAX_TOKENS.review,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const reviewText = completion.choices[0]?.message?.content || "{}";
  let review;
  try {
    review = JSON.parse(reviewText);
  } catch {
    review = { error: "Failed to parse review", raw: reviewText };
  }

  return {
    success: true,
    review,
    submissionId,
    usage: completion.usage,
  };
}

// ============================================
// MAIN HANDLER
// ============================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

  // GET - Health check
  if (req.method === "GET") {
    const service = url.searchParams.get("service");

    if (service === "health") {
      return new Response(
        JSON.stringify({
          status: openai ? "OK" : "DEMO",
          services: ["ai-assistant", "ai-review"],
          openai: !!openai,
          version: "1.0-unified",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        api: "AI Services v1.0",
        endpoints: {
          "GET ?service=health": "Health check",
          "POST ?service=assistant": "Academy AI chat",
          "POST ?service=review": "Project AI review",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // POST - AI Services
  if (req.method === "POST") {
    const service = url.searchParams.get("service");

    try {
      const body = await req.json();
      let result;

      switch (service) {
        case "assistant":
          result = await handleAssistant(body, openai);
          break;
        case "review":
          result = await handleReview(body, openai);
          break;
        default:
          return new Response(
            JSON.stringify({
              error: "Invalid service. Use ?service=assistant or ?service=review",
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
      console.error("[AI Services Error]", err);
      const error = err as Error;
      return new Response(
        JSON.stringify({
          error: "AI_ERROR",
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
