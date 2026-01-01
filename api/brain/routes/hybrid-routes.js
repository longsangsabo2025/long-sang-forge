/**
 * Hybrid Brain API Routes
 * Endpoints for hybrid cloud + local brain operations
 *
 * Routes:
 * - GET  /api/brain/hybrid/status    - Check hybrid brain status
 * - POST /api/brain/hybrid/search    - Search across cloud + local
 * - POST /api/brain/hybrid/ingest    - Ingest to appropriate brain
 * - POST /api/brain/hybrid/chat      - Chat with hybrid RAG
 */

const express = require("express");
const router = express.Router();
const hybridBrainService = require("../services/hybrid-brain-service");
const { OpenAI } = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GET /api/brain/hybrid/status
 * Get hybrid brain status
 */
router.get("/status", async (req, res) => {
  try {
    const status = await hybridBrainService.getStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("[Hybrid Route] Status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/hybrid/search
 * Search across hybrid brain
 *
 * Body:
 * - query: string
 * - options: object (optional)
 *   - brainMode: 'cloud' | 'local' | 'hybrid'
 *   - hybridPriority: 'cloud-first' | 'local-first' | 'merge'
 *   - privateOnly: boolean
 *   - domain: string
 *   - matchCount: number
 */
router.post("/search", async (req, res) => {
  try {
    const { query, options = {} } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    const results = await hybridBrainService.searchKnowledge(query, options);

    res.json({
      success: true,
      count: results.length,
      mode: results[0]?._hybrid?.mode || "unknown",
      results,
    });
  } catch (error) {
    console.error("[Hybrid Route] Search error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/hybrid/ingest
 * Ingest knowledge to appropriate brain
 *
 * Body:
 * - title: string
 * - content: string
 * - metadata: object (optional)
 * - options: object (optional)
 *   - brainMode: 'cloud' | 'local' | 'hybrid'
 *   - privateOnly: boolean
 *   - domain: string
 */
router.post("/ingest", async (req, res) => {
  try {
    const { title, content, metadata = {}, options = {} } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: "Title and content are required",
      });
    }

    const result = await hybridBrainService.ingestKnowledge({ title, content, metadata }, options);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("[Hybrid Route] Ingest error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/hybrid/chat
 * Chat with hybrid RAG
 *
 * Body:
 * - message: string
 * - context: Array<{ role: string, content: string }> (optional)
 * - options: object (optional)
 *   - brainMode: 'cloud' | 'local' | 'hybrid'
 *   - privateOnly: boolean
 *   - systemPrompt: string
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, context = [], options = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Search knowledge using hybrid brain
    const knowledge = await hybridBrainService.searchKnowledge(message, {
      ...options,
      matchCount: 5,
    });

    // Build context from knowledge
    const knowledgeContext = knowledge
      .map(
        (k) =>
          `[${k.sourceLabel || k.source}] ${k.title || ""}: ${k.content?.substring(0, 500) || ""}`
      )
      .join("\n\n");

    // Build system prompt
    const systemPrompt =
      options.systemPrompt ||
      `Bạn là trợ lý AI thông minh của Long Sang.
Trả lời dựa trên kiến thức được cung cấp.
Nếu không có thông tin phù hợp, hãy nói rõ và đề xuất hướng đi.

${knowledgeContext ? `--- KIẾN THỨC TÌM ĐƯỢC ---\n${knowledgeContext}\n--- KẾT THÚC ---` : ""}`;

    // Build messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...context.slice(-10), // Last 10 messages
      { role: "user", content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời.";

    res.json({
      success: true,
      response,
      sources: knowledge.map((k) => ({
        title: k.title,
        source: k.source,
        sourceLabel: k.sourceLabel,
        similarity: k.similarity,
      })),
      usage: completion.usage,
      mode: knowledge[0]?._hybrid?.mode || "unknown",
    });
  } catch (error) {
    console.error("[Hybrid Route] Chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
