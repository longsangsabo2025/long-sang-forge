/**
 * Knowledge Management API Routes
 * Handles knowledge ingestion and search operations
 */

const express = require("express");
const router = express.Router();
const brainService = require("../services/brain-service");

/**
 * POST /api/brain/knowledge/ingest
 * Add new knowledge to the brain
 */
router.post("/ingest", async (req, res) => {
  try {
    const {
      domainId,
      title,
      content,
      contentType = "document",
      tags = [],
      sourceUrl = null,
      sourceFile = null,
      metadata = {},
    } = req.body;

    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User ID is required. Please authenticate.",
      });
    }

    // Validate required fields
    if (!domainId) {
      return res.status(400).json({
        success: false,
        error: "domainId is required",
      });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "title is required",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "content is required",
      });
    }

    const knowledge = await brainService.ingestKnowledge(
      {
        domainId,
        title: title.trim(),
        content: content.trim(),
        contentType,
        tags: Array.isArray(tags) ? tags : [],
        sourceUrl,
        sourceFile,
        metadata,
      },
      userId
    );

    res.status(201).json({
      success: true,
      data: knowledge,
    });
  } catch (error) {
    console.error("[Knowledge API] Error ingesting knowledge:", error);

    // Handle specific errors
    if (error.message.includes("not configured")) {
      return res.status(503).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to ingest knowledge",
    });
  }
});

/**
 * GET /api/brain/knowledge/search
 * Search knowledge using vector similarity
 */
router.get("/search", async (req, res) => {
  try {
    const { q, domainId, domainIds, matchThreshold, matchCount } = req.query;
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User ID is required. Please authenticate.",
      });
    }

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'q' is required",
      });
    }

    // Build domain IDs array
    let domainIdsArray = null;
    if (domainId) {
      domainIdsArray = [domainId];
    } else if (domainIds) {
      // Support comma-separated domain IDs
      domainIdsArray = Array.isArray(domainIds)
        ? domainIds
        : domainIds.split(",").map((id) => id.trim());
    }

    // Parse options
    const options = {
      domainIds: domainIdsArray,
      matchThreshold: matchThreshold ? Number.parseFloat(matchThreshold) : 0.7,
      matchCount: matchCount ? Number.parseInt(matchCount, 10) : 10,
    };

    // Validate options
    if (options.matchThreshold < 0 || options.matchThreshold > 1) {
      return res.status(400).json({
        success: false,
        error: "matchThreshold must be between 0 and 1",
      });
    }

    if (options.matchCount < 1 || options.matchCount > 100) {
      return res.status(400).json({
        success: false,
        error: "matchCount must be between 1 and 100",
      });
    }

    const results = await brainService.searchKnowledge(q.trim(), options, userId);

    res.json({
      success: true,
      data: results,
      count: results.length,
      query: q,
      options,
    });
  } catch (error) {
    console.error("[Knowledge API] Error searching knowledge:", error);

    if (error.message.includes("not configured")) {
      return res.status(503).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to search knowledge",
    });
  }
});

/**
 * GET /api/brain/knowledge/:id
 * Get a specific knowledge item by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const retrievalService = require("../services/retrieval-service");
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User ID is required. Please authenticate.",
      });
    }

    const knowledge = await retrievalService.getKnowledgeById(id);

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        error: "Knowledge not found",
      });
    }

    // Note: RLS will handle user isolation, but we can add explicit check if needed

    res.json({
      success: true,
      data: knowledge,
    });
  } catch (error) {
    console.error("[Knowledge API] Error getting knowledge:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get knowledge",
    });
  }
});

module.exports = router;
