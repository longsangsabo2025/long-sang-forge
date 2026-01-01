/**
 * Hybrid Brain Service
 * Intelligent routing between Cloud (Supabase) and Local (LEANN) brain
 *
 * HYBRID APPROACH:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    USER REQUEST                         │
 * │                         ↓                               │
 * │              ┌─────────────────────┐                   │
 * │              │   Hybrid Router     │                   │
 * │              │   (Smart Routing)   │                   │
 * │              └──────────┬──────────┘                   │
 * │                         │                               │
 * │         ┌───────────────┼───────────────┐              │
 * │         ↓               ↓               ↓              │
 * │   ┌──────────┐   ┌──────────┐   ┌──────────┐          │
 * │   │  Cloud   │   │  Local   │   │   Both   │          │
 * │   │ Supabase │   │  LEANN   │   │  Merge   │          │
 * │   └──────────┘   └──────────┘   └──────────┘          │
 * │         │               │               │              │
 * │         └───────────────┼───────────────┘              │
 * │                         ↓                               │
 * │                   RESPONSE                              │
 * └─────────────────────────────────────────────────────────┘
 */

const brainService = require("./brain-service");
const leannBridge = require("./leann-bridge");

// Hybrid mode configuration
const HYBRID_CONFIG = {
  // Default mode: 'cloud', 'local', 'hybrid'
  defaultMode: process.env.BRAIN_MODE || "hybrid",

  // Priority for hybrid mode: 'cloud-first', 'local-first', 'merge'
  hybridPriority: process.env.BRAIN_HYBRID_PRIORITY || "cloud-first",

  // Merge threshold - minimum similarity to include result
  mergeThreshold: parseFloat(process.env.BRAIN_MERGE_THRESHOLD || "0.6"),

  // Max results per source in hybrid mode
  maxResultsPerSource: parseInt(process.env.BRAIN_MAX_RESULTS_PER_SOURCE || "5"),
};

/**
 * Determine which brain to use based on context
 * @param {Object} options - Request options
 * @returns {'cloud' | 'local' | 'hybrid'} - Brain mode to use
 */
function determineMode(options = {}) {
  // Explicit mode override
  if (options.brainMode) {
    return options.brainMode;
  }

  // Check if user wants private/local only
  if (options.privateOnly || options.localOnly) {
    return "local";
  }

  // Check if LEANN is available
  if (!leannBridge.isAvailable()) {
    return "cloud";
  }

  // Check for specific domain hints
  if (options.domain) {
    // Personal domains → prefer local
    const personalDomains = ["personal", "private", "notes", "journal", "diary"];
    if (personalDomains.some((d) => options.domain.toLowerCase().includes(d))) {
      return "local";
    }

    // Public/shared domains → prefer cloud
    const publicDomains = ["business", "team", "shared", "public"];
    if (publicDomains.some((d) => options.domain.toLowerCase().includes(d))) {
      return "cloud";
    }
  }

  return HYBRID_CONFIG.defaultMode;
}

/**
 * Search knowledge using hybrid approach
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Combined search results
 */
async function searchKnowledge(query, options = {}) {
  const mode = determineMode(options);
  console.log(`[Hybrid Brain] Search mode: ${mode}`);

  const results = {
    cloud: [],
    local: [],
    mode,
    timestamp: new Date().toISOString(),
  };

  try {
    switch (mode) {
      case "cloud":
        results.cloud = await searchCloud(query, options);
        break;

      case "local":
        results.local = await searchLocal(query, options);
        break;

      case "hybrid":
      default:
        // Search both in parallel
        const [cloudResults, localResults] = await Promise.allSettled([
          searchCloud(query, options),
          searchLocal(query, options),
        ]);

        results.cloud = cloudResults.status === "fulfilled" ? cloudResults.value : [];
        results.local = localResults.status === "fulfilled" ? localResults.value : [];

        // Log results
        console.log(
          `[Hybrid Brain] Cloud: ${results.cloud.length}, Local: ${results.local.length}`
        );
        break;
    }
  } catch (error) {
    console.error("[Hybrid Brain] Search error:", error);
  }

  // Merge and rank results
  return mergeResults(results, options);
}

/**
 * Search cloud brain (Supabase)
 */
async function searchCloud(query, options = {}) {
  try {
    const cloudOptions = {
      matchThreshold: options.matchThreshold || 0.7,
      matchCount: options.matchCount || HYBRID_CONFIG.maxResultsPerSource,
      domainIds: options.domainIds,
      userId: options.userId,
    };

    const results = await brainService.searchKnowledge(query, cloudOptions, options.userId);

    return results.map((r) => ({
      ...r,
      source: "cloud",
      sourceLabel: "☁️ Cloud Brain",
    }));
  } catch (error) {
    console.log("[Hybrid Brain] Cloud search error:", error.message);
    return [];
  }
}

/**
 * Search local brain (LEANN)
 */
async function searchLocal(query, options = {}) {
  try {
    if (!leannBridge.isAvailable()) {
      return [];
    }

    const localOptions = {
      matchCount: options.matchCount || HYBRID_CONFIG.maxResultsPerSource,
      topK: options.matchCount || HYBRID_CONFIG.maxResultsPerSource,
    };

    const indexName = options.indexName || leannBridge.config.defaultIndex;
    const results = await leannBridge.searchIndex(query, localOptions, indexName);

    return results.map((r, i) => ({
      id: `local-${i}`,
      title: r.metadata?.title || `Local Result ${i + 1}`,
      content: r.content,
      similarity: r.similarity || 0.8,
      source: "local",
      sourceLabel: "🏠 Local Brain (LEANN)",
      metadata: r.metadata,
    }));
  } catch (error) {
    console.log("[Hybrid Brain] Local search error:", error.message);
    return [];
  }
}

/**
 * Merge results from cloud and local
 */
function mergeResults(results, options = {}) {
  const priority = options.hybridPriority || HYBRID_CONFIG.hybridPriority;
  const threshold = options.mergeThreshold || HYBRID_CONFIG.mergeThreshold;

  let merged = [];

  switch (priority) {
    case "cloud-first":
      // Cloud results first, then local
      merged = [
        ...results.cloud,
        ...results.local.filter(
          (l) =>
            !results.cloud.some(
              (c) =>
                c.content &&
                l.content &&
                c.content.substring(0, 100) === l.content.substring(0, 100)
            )
        ),
      ];
      break;

    case "local-first":
      // Local results first, then cloud
      merged = [
        ...results.local,
        ...results.cloud.filter(
          (c) =>
            !results.local.some(
              (l) =>
                c.content &&
                l.content &&
                c.content.substring(0, 100) === l.content.substring(0, 100)
            )
        ),
      ];
      break;

    case "merge":
    default:
      // Interleave based on similarity score
      merged = [...results.cloud, ...results.local]
        .filter((r) => (r.similarity || 0) >= threshold)
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      break;
  }

  // Deduplicate by content similarity
  const seen = new Set();
  merged = merged.filter((r) => {
    const key = r.content?.substring(0, 100) || r.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Add metadata
  return merged.map((r) => ({
    ...r,
    _hybrid: {
      mode: results.mode,
      cloudCount: results.cloud.length,
      localCount: results.local.length,
      timestamp: results.timestamp,
    },
  }));
}

/**
 * Ingest knowledge to appropriate brain
 * @param {Object} data - Knowledge data
 * @param {Object} options - Ingestion options
 */
async function ingestKnowledge(data, options = {}) {
  const mode = determineMode(options);
  const results = { cloud: null, local: null };

  try {
    switch (mode) {
      case "cloud":
        results.cloud = await brainService.ingestKnowledge(data, options.userId);
        break;

      case "local":
        if (leannBridge.isAvailable()) {
          results.local = await leannBridge.addToIndex(
            `${data.title}\n\n${data.content}`,
            { title: data.title, ...data.metadata },
            options.indexName || leannBridge.config.defaultIndex
          );
        }
        break;

      case "hybrid":
      default:
        // Ingest to both
        const [cloudResult, localResult] = await Promise.allSettled([
          brainService.ingestKnowledge(data, options.userId),
          leannBridge.isAvailable()
            ? leannBridge.addToIndex(
                `${data.title}\n\n${data.content}`,
                { title: data.title, ...data.metadata },
                options.indexName || leannBridge.config.defaultIndex
              )
            : Promise.resolve(null),
        ]);

        results.cloud = cloudResult.status === "fulfilled" ? cloudResult.value : null;
        results.local = localResult.status === "fulfilled" ? localResult.value : null;
        break;
    }
  } catch (error) {
    console.error("[Hybrid Brain] Ingest error:", error);
    throw error;
  }

  return results;
}

/**
 * Get hybrid brain status
 */
async function getStatus() {
  const [cloudStatus, localStatus] = await Promise.allSettled([
    Promise.resolve({
      available: true, // Assuming cloud is always available if configured
      type: "Supabase + pgvector",
      features: ["Multi-user", "Realtime sync", "RLS security"],
    }),
    leannBridge.getStatus(),
  ]);

  return {
    mode: HYBRID_CONFIG.defaultMode,
    config: HYBRID_CONFIG,
    cloud: cloudStatus.status === "fulfilled" ? cloudStatus.value : { available: false },
    local: localStatus.status === "fulfilled" ? localStatus.value : { available: false },
    recommendation: getRecommendation(cloudStatus.value, localStatus.value),
  };
}

/**
 * Get recommendation for brain usage
 */
function getRecommendation(cloudStatus, localStatus) {
  if (localStatus?.available && cloudStatus?.available) {
    return {
      message: "🎯 Hybrid mode recommended! Use cloud for shared data, local for private.",
      tips: [
        "Use 'privateOnly: true' for sensitive queries",
        "Cloud brain syncs across devices",
        "Local brain has 97% less storage cost",
      ],
    };
  }

  if (!localStatus?.available) {
    return {
      message: "💡 Install LEANN for hybrid mode: pip install leann",
      tips: [
        "LEANN enables 100% private local search",
        "97% storage savings compared to traditional vector DB",
        "Perfect for personal notes, chat history, code search",
      ],
    };
  }

  return {
    message: "Cloud brain active",
    tips: [],
  };
}

module.exports = {
  searchKnowledge,
  ingestKnowledge,
  getStatus,
  determineMode,
  config: HYBRID_CONFIG,
};
