/**
 * Local Brain Bridge Service
 * Connects Node.js app to Python local_brain.py for local/private RAG
 *
 * Uses HNSWLIB + SentenceTransformers instead of LEANN
 * (LEANN has dependency issues on Windows/Python 3.13)
 *
 * HYBRID APPROACH:
 * - Production: Supabase + OpenAI (cloud, multi-user, realtime sync)
 * - Local/Private: HNSWLIB (100% private, zero cloud cost)
 */

const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Local Brain configuration
const LEANN_CONFIG = {
  // Path to local_brain.py script
  scriptPath: path.join(__dirname, "local_brain.py"),
  // Index directory
  indexPath: process.env.LEANN_INDEX_PATH || path.join(process.cwd(), ".leann", "indexes"),
  // Default index name
  defaultIndex: process.env.LEANN_DEFAULT_INDEX || "longsang-brain",
  // Python executable - use venv
  pythonCmd:
    process.env.LEANN_PYTHON || path.join(process.cwd(), "..", ".venv", "Scripts", "python.exe"),
  // Whether local brain is enabled
  enabled: process.env.LEANN_ENABLED === "true",
};

let isLeannAvailable = false;

/**
 * Check if local brain dependencies are installed
 */
async function checkLeannAvailability() {
  return new Promise((resolve) => {
    const checkCmd = `"${LEANN_CONFIG.pythonCmd}" -c "import hnswlib; import numpy; print('ok')"`;

    exec(checkCmd, (error, stdout, stderr) => {
      if (error) {
        console.log("[Local Brain] Dependencies not available:", error.message);
        isLeannAvailable = false;
        resolve(false);
      } else {
        console.log("[Local Brain] ✅ hnswlib + numpy available");
        isLeannAvailable = true;
        resolve(true);
      }
    });
  });
}

/**
 * Run local_brain.py command
 */
function runPythonCommand(args) {
  return new Promise((resolve, reject) => {
    const fullArgs = [LEANN_CONFIG.scriptPath, ...args, "--path", LEANN_CONFIG.indexPath];

    console.log(`[Local Brain] Running: python ${args[0]} --index ${args[2] || "default"}`);

    const proc = spawn(LEANN_CONFIG.pythonCmd, fullArgs, {
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        try {
          // Get the last line which should be JSON
          const lines = stdout.trim().split("\n");
          const jsonLine = lines[lines.length - 1];
          const result = JSON.parse(jsonLine);
          resolve(result);
        } catch (e) {
          resolve({ success: true, output: stdout.trim() });
        }
      } else {
        console.error(`[Local Brain] Error: ${stderr}`);
        reject(new Error(stderr || `Process exited with code ${code}`));
      }
    });
  });
}

/**
 * Initialize local brain index with sample data
 */
async function initializeIndex(documents = [], indexName = LEANN_CONFIG.defaultIndex) {
  if (!isLeannAvailable) {
    throw new Error("Local Brain not available. Run: pip install hnswlib sentence-transformers");
  }

  // If no documents provided, use init command with sample data
  if (!documents || documents.length === 0) {
    return runPythonCommand(["init", "--index", indexName]);
  }

  // Add documents one by one
  let added = 0;
  for (const doc of documents) {
    const text = typeof doc === "string" ? doc : doc.text;
    const metadata = typeof doc === "object" && doc.metadata ? doc.metadata : {};

    try {
      await addToIndex(text, metadata, indexName);
      added++;
    } catch (error) {
      console.error(`[Local Brain] Failed to add document:`, error.message);
    }
  }

  return { success: true, added };
}

/**
 * Add text to local brain index
 */
async function addToIndex(text, metadata = {}, indexName = LEANN_CONFIG.defaultIndex) {
  if (!isLeannAvailable) {
    throw new Error("Local Brain not available");
  }

  const args = ["add", "--index", indexName, "--text", text];

  if (metadata && Object.keys(metadata).length > 0) {
    args.push("--metadata", JSON.stringify(metadata));
  }

  return runPythonCommand(args);
}

/**
 * Search local brain index
 */
async function searchIndex(query, options = {}, indexName = LEANN_CONFIG.defaultIndex) {
  if (!isLeannAvailable) {
    console.log("[Local Brain] Not available, returning empty results");
    return [];
  }

  const topK = options.matchCount || options.topK || 5;

  try {
    const result = await runPythonCommand([
      "search",
      "--index",
      indexName,
      "--text",
      query,
      "--top-k",
      topK.toString(),
    ]);

    if (result.success && result.results) {
      return result.results;
    }
    return [];
  } catch (error) {
    console.error("[Local Brain] Search error:", error.message);
    return [];
  }
}

/**
 * List all local brain indexes
 */
async function listIndexes() {
  if (!isLeannAvailable) {
    return [];
  }

  try {
    const result = await runPythonCommand(["list"]);
    return result.indexes || [];
  } catch (error) {
    console.error("[Local Brain] List error:", error.message);
    return [];
  }
}

/**
 * Get local brain status
 */
async function getStatus() {
  const available = await checkLeannAvailability();
  let indexes = [];

  if (available) {
    try {
      indexes = await listIndexes();
    } catch (e) {
      // Ignore
    }
  }

  return {
    available,
    enabled: LEANN_CONFIG.enabled,
    indexPath: LEANN_CONFIG.indexPath,
    indexes,
    config: {
      pythonCmd: LEANN_CONFIG.pythonCmd,
      defaultIndex: LEANN_CONFIG.defaultIndex,
    },
    technology: "hnswlib + sentence-transformers",
  };
}

/**
 * Chat with local brain (RAG)
 * Note: Uses local embeddings for search, returns context for LLM
 */
async function chat(query, context = [], options = {}) {
  if (!isLeannAvailable) {
    throw new Error("Local Brain not available");
  }

  const indexName = options.indexName || LEANN_CONFIG.defaultIndex;
  const topK = options.topK || 3;

  // Search for relevant documents
  const searchResults = await searchIndex(query, { topK }, indexName);

  // Build context from search results
  const knowledgeContext = searchResults
    .map((r) => `[Score: ${r.similarity?.toFixed(2) || "N/A"}] ${r.content}`)
    .join("\n\n");

  return {
    response: `Found ${searchResults.length} relevant documents.`,
    context: knowledgeContext,
    sources: searchResults,
  };
}

// Initialize on load
checkLeannAvailability();

module.exports = {
  checkLeannAvailability,
  initializeIndex,
  addToIndex,
  searchIndex,
  chat,
  listIndexes,
  getStatus,
  isAvailable: () => isLeannAvailable,
  config: LEANN_CONFIG,
};
