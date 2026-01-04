/**
 * Brain Chat - Supabase Edge Function
 * ====================================
 * Personal AI chat with user's Second Brain knowledge
 *
 * Deploy: npx supabase functions deploy brain-chat --no-verify-jwt
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import OpenAI from "https://esm.sh/openai@4.104.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

interface ChatRequest {
  userId: string;
  message: string;
  sessionId?: string;
  domainId?: string;
  messages?: Array<{ role: string; content: string }>;
}

interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const openai = new OpenAI({ apiKey: openaiKey });

  try {
    const body: ChatRequest = await req.json();
    const { userId, message, sessionId, domainId, messages = [] } = body;

    if (!userId || !message) {
      return new Response(JSON.stringify({ error: "userId and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check quota
    const { data: quotaCheck } = await supabase.rpc("check_brain_quota", {
      p_user_id: userId,
      p_action: "query",
    });

    if (!quotaCheck?.allowed) {
      return new Response(
        JSON.stringify({
          error: "Query limit exceeded",
          reason: quotaCheck?.reason,
          limit: quotaCheck?.limit,
          upgradeUrl: "/brain/pricing",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embedding for user message
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search user's knowledge base
    const { data: knowledgeResults, error: searchError } = await supabase.rpc("search_user_brain", {
      p_user_id: userId,
      p_domain_id: domainId,
      p_query_embedding: JSON.stringify(queryEmbedding),
      p_match_count: 5,
      p_match_threshold: 0.5,
    });

    if (searchError) {
      console.error("Search error:", searchError);
    }

    const knowledge: KnowledgeResult[] = knowledgeResults || [];

    // Build context from knowledge
    const knowledgeContext =
      knowledge.length > 0
        ? knowledge.map((k, i) => `[${i + 1}] ${k.title}\n${k.content}`).join("\n\n---\n\n")
        : "Không tìm thấy thông tin liên quan trong brain của bạn.";

    // Build conversation
    const systemPrompt = `Bạn là AI assistant của Second Brain - hệ thống quản lý tri thức cá nhân.

NHIỆM VỤ:
- Trả lời câu hỏi dựa trên kiến thức đã lưu trong brain của user
- Nếu không có thông tin, nói rõ là chưa có trong brain
- Đề xuất user thêm kiến thức mới nếu cần

KIẾN THỨC TÌM ĐƯỢC:
${knowledgeContext}

NGUYÊN TẮC:
1. Chỉ trả lời dựa trên kiến thức đã tìm được
2. Nếu kiến thức không đủ, gợi ý user import thêm
3. Trích dẫn nguồn khi có thể
4. Ngắn gọn, súc tích, đi thẳng vào vấn đề`;

    const conversationMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Generate response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "Không thể tạo phản hồi.";

    // Increment query count
    await supabase.rpc("increment_brain_usage", {
      p_user_id: userId,
      p_action: "query",
      p_amount: 1,
    });

    // Save to chat history if sessionId provided
    if (sessionId) {
      const newMessages = [
        ...messages,
        { role: "user", content: message },
        { role: "assistant", content: response },
      ];

      await supabase.from("user_brain_chats").upsert(
        {
          user_id: userId,
          session_id: sessionId,
          domain_id: domainId,
          messages: newMessages,
          knowledge_ids: knowledge.map((k) => k.id),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "session_id",
        }
      );
    }

    // Get updated quota
    const { data: currentQuota } = await supabase
      .from("user_brain_quotas")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", new Date().toISOString().slice(0, 7))
      .single();

    return new Response(
      JSON.stringify({
        response,
        knowledge: knowledge.map((k) => ({
          id: k.id,
          title: k.title,
          similarity: k.similarity,
        })),
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        quota: currentQuota
          ? {
              queriesUsed: currentQuota.queries_count,
              queriesLimit: currentQuota.max_queries_per_month,
              documentsCount: currentQuota.documents_count,
            }
          : null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Brain Chat Error]", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
