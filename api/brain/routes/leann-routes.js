/**
 * LEANN API Routes
 * Endpoints for managing local LEANN brain
 *
 * Routes:
 * - GET  /api/brain/leann/status     - Check LEANN availability
 * - POST /api/brain/leann/init       - Initialize LEANN index
 * - POST /api/brain/leann/add        - Add content to index
 * - POST /api/brain/leann/search     - Search LEANN index
 * - POST /api/brain/leann/chat       - Chat with LEANN RAG
 * - GET  /api/brain/leann/indexes    - List all indexes
 */

const express = require("express");
const router = express.Router();
const leannBridge = require("../services/leann-bridge");

/**
 * GET /api/brain/leann/status
 * Check LEANN availability and configuration
 */
router.get("/status", async (req, res) => {
  try {
    const status = await leannBridge.getStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("[LEANN Route] Status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/leann/init
 * Initialize a new LEANN index
 *
 * Body:
 * - indexName: string (optional, default from config)
 * - documents: Array<{ text: string, metadata?: object }>
 */
router.post("/init", async (req, res) => {
  try {
    const { indexName, documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        error: "Documents array is required",
      });
    }

    const result = await leannBridge.initializeIndex(documents, indexName);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[LEANN Route] Init error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/leann/add
 * Add content to existing LEANN index
 *
 * Body:
 * - text: string
 * - metadata: object (optional)
 * - indexName: string (optional)
 */
router.post("/add", async (req, res) => {
  try {
    const { text, metadata, indexName } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required",
      });
    }

    const result = await leannBridge.addToIndex(text, metadata, indexName);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[LEANN Route] Add error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/leann/search
 * Search LEANN index
 *
 * Body:
 * - query: string
 * - topK: number (optional, default 5)
 * - indexName: string (optional)
 */
router.post("/search", async (req, res) => {
  try {
    const { query, topK = 5, indexName } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    const results = await leannBridge.searchIndex(query, { topK }, indexName);
    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("[LEANN Route] Search error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/leann/chat
 * Chat with LEANN RAG
 *
 * Body:
 * - message: string
 * - context: Array<{ role: string, content: string }> (optional)
 * - options: object (optional)
 *   - topK: number
 *   - indexName: string
 *   - useOpenAI: boolean
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

    const response = await leannBridge.chat(message, context, options);
    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("[LEANN Route] Chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/brain/leann/indexes
 * List all LEANN indexes
 */
router.get("/indexes", async (req, res) => {
  try {
    const indexes = await leannBridge.listIndexes();
    res.json({
      success: true,
      count: indexes.length,
      indexes,
    });
  } catch (error) {
    console.error("[LEANN Route] List indexes error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/brain/leann/batch-add
 * Batch add multiple documents to LEANN index
 *
 * Body:
 * - documents: Array<{ text: string, metadata?: object }>
 * - indexName: string (optional)
 */
router.post("/batch-add", async (req, res) => {
  try {
    const { documents, indexName } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        error: "Documents array is required",
      });
    }

    const results = [];
    for (const doc of documents) {
      try {
        const result = await leannBridge.addToIndex(doc.text, doc.metadata, indexName);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      total: documents.length,
      successful: results.filter((r) => r.success).length,
      results,
    });
  } catch (error) {
    console.error("[LEANN Route] Batch add error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
