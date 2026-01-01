/**
 * AI Assistant API Routes
 * Handles chat requests for Academy lessons using OpenAI GPT-4
 * With DEMO MODE fallback when no API key is configured
 * 🧠 CONNECTED TO BRAIN - Uses knowledge base for RAG
 */

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const brainService = require("../brain/services/brain-service");

const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "";
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// Demo responses for when OpenAI is not configured
const demoResponses = [
  `Xin chào! 👋 Tôi là AI Assistant của Long Sang.

🔧 **Chế độ Demo**: Hiện tại AI đang chạy ở chế độ demo. Để kích hoạt đầy đủ tính năng AI:

1. Tạo file \`.env\` từ \`.env.example\`
2. Thêm \`OPENAI_API_KEY=sk-your-key\`
3. Restart server

💡 Trong khi chờ đợi, bạn có thể khám phá website và các dịch vụ của chúng tôi!`,

  `Cảm ơn bạn đã quan tâm! 🚀

**Long Sang** chuyên về:
• 🌐 Web/App Development (React, Flutter)
• 🤖 AI Integration & Automation
• 📈 SEO & Digital Marketing
• 💼 Business Process Automation

📧 Liên hệ ngay để được tư vấn miễn phí!

_(Đây là chế độ demo - cấu hình OpenAI API key để có trải nghiệm AI đầy đủ)_`,

  `Ý tưởng hay đó! 💡

Tôi hiểu bạn muốn thảo luận thêm. Một số câu hỏi gợi ý:

1. **Bạn đang làm trong lĩnh vực nào?**
2. **Vấn đề lớn nhất bạn muốn giải quyết là gì?**
3. **Budget và timeline dự kiến?**

🎯 Đặt lịch tư vấn FREE 30 phút với team Long Sang để brainstorm ý tưởng!

_(Chế độ demo - thêm OPENAI_API_KEY để AI trả lời thông minh hơn)_`,

  `Tuyệt vời! Bạn đang đi đúng hướng! 🎯

**Một số dự án gần đây của Long Sang:**
• AI Marketplace Platform
• Automated SEO System
• Business Automation Tools
• E-learning Academy

👉 Xem thêm tại phần **Projects** trên website!

_(Demo mode - cấu hình API key trong file .env để chat AI thực sự)_`,
];

function getDemoResponse(userMessage) {
  // Simple keyword matching for demo
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes("xin chào") || lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    return demoResponses[0];
  }
  if (lowerMsg.includes("dịch vụ") || lowerMsg.includes("service") || lowerMsg.includes("làm gì")) {
    return demoResponses[1];
  }
  if (lowerMsg.includes("ý tưởng") || lowerMsg.includes("idea") || lowerMsg.includes("dự án")) {
    return demoResponses[2];
  }

  // Random response for other messages
  return demoResponses[Math.floor(Math.random() * demoResponses.length)];
}

/**
 * POST /api/ai-assistant
 * Send message to AI assistant and get response
 */
router.post("/", async (req, res) => {
  try {
    const { lessonId, lessonTitle, lessonContext = "", messages = [], userMessage } = req.body;

    // Validate input
    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!lessonId || !lessonTitle) {
      return res.status(400).json({
        error: "Lesson information is required",
      });
    }

    // DEMO MODE: Return smart fallback response if no API key
    if (!openai) {
      console.log("[AI Assistant] Demo mode - no API key configured");
      return res.status(200).json({
        success: true,
        response: getDemoResponse(userMessage),
        demo: true,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });
    }

    // 🧠 BRAIN INTEGRATION: Search knowledge base for relevant context
    let brainContext = "";
    let brainSources = [];
    try {
      console.log(`[AI Assistant] 🧠 Searching brain for: "${userMessage.substring(0, 50)}..."`);
      const knowledgeResults = await brainService.searchKnowledge(userMessage, {
        matchThreshold: 0.7,
        matchCount: 3,
      });

      if (knowledgeResults && knowledgeResults.length > 0) {
        console.log(`[AI Assistant] 🧠 Found ${knowledgeResults.length} relevant knowledge chunks`);
        brainContext = knowledgeResults
          .map((k, i) => `[Knowledge ${i + 1}] ${k.title}:\n${k.content}`)
          .join("\n\n---\n\n");
        brainSources = knowledgeResults.map((k) => ({
          id: k.id,
          title: k.title,
          similarity: k.similarity,
        }));
      }
    } catch (brainError) {
      console.log("[AI Assistant] 🧠 Brain search skipped:", brainError.message);
      // Continue without brain context - not critical
    }

    // Build system prompt with lesson context AND brain knowledge
    const systemPrompt = `You are an expert AI learning assistant for Long Sang - specializing in Web/App Development, AI Integration, Automation, and SEO.

🧠 **You have access to Long Sang's Knowledge Base** - Use this information to provide accurate, context-aware answers.

Your role:
- Help users understand concepts and solve problems
- Provide practical examples and real-world applications
- Be encouraging and supportive
- Keep responses concise and actionable (max 3-4 paragraphs)
- Reference knowledge from the brain when relevant

Current Context: "${lessonTitle}"
${lessonContext ? `\nLesson Context:\n${lessonContext}` : ""}

${brainContext ? `\n🧠 **Relevant Knowledge from Brain:**\n${brainContext}` : ""}

Philosophy: "AI làm việc cho bạn" - Focus on practical solutions, not just theory.

Guidelines:
1. Use Vietnamese mixed with English technical terms naturally
2. Provide code examples when relevant
3. Link concepts to real business applications
4. If you use knowledge from the brain, mention it naturally
5. Celebrate small wins`;

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    console.log(
      `[AI Assistant] Processing request for: ${lessonId} (with ${brainSources.length} brain sources)`
    );

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAIMessages,
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const assistantResponse =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response. Please try again.";

    console.error(`[AI Assistant] Response generated (${assistantResponse.length} chars)`);

    // Return response with brain sources
    return res.status(200).json({
      success: true,
      response: assistantResponse,
      brainConnected: brainSources.length > 0,
      brainSources: brainSources,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("[AI Assistant] Error:", error);

    // Handle OpenAI specific errors
    if (error.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a moment and try again.",
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        error: "OpenAI API key is invalid or missing.",
      });
    }

    // Generic error
    return res.status(500).json({
      error: "Failed to process your message. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/ai-assistant/health
 * Check if OpenAI API is configured
 */
router.get("/health", (req, res) => {
  const hasApiKey = !!(process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY);

  res.json({
    status: hasApiKey ? "OK" : "ERROR",
    configured: hasApiKey,
    message: hasApiKey ? "AI Assistant is ready" : "OpenAI API key is missing",
  });
});

module.exports = router;
