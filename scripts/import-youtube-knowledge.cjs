/**
 * YouTube Knowledge Importer
 * Import YouTube video transcripts into Brain knowledge base
 *
 * Usage:
 *   node scripts/import-youtube-knowledge.cjs <youtube-url> [options]
 *
 * Options:
 *   --domain-id <id>   Domain to import into (optional)
 *   --category <cat>   Category name (default: "youtube")
 *   --tags <tags>      Comma-separated tags
 */

const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");
require("dotenv").config();

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

// User ID - cố định cho Brain
const USER_ID = "default-longsang-user";

/**
 * Extract video ID từ YouTube URL
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Fetch video info từ YouTube (basic - không cần API key)
 */
async function fetchVideoInfo(videoId) {
  try {
    // Dùng noembed service
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    const data = await response.json();

    return {
      title: data.title || `YouTube Video ${videoId}`,
      author: data.author_name || "Unknown",
      thumbnail: data.thumbnail_url,
    };
  } catch (error) {
    console.warn("⚠️ Could not fetch video info:", error.message);
    return {
      title: `YouTube Video ${videoId}`,
      author: "Unknown",
      thumbnail: null,
    };
  }
}

/**
 * Interactive prompt để nhập transcript
 */
async function promptForTranscript() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n📝 Paste transcript below (press Enter twice to finish):");
    console.log("─".repeat(50));

    let transcript = "";
    let emptyLineCount = 0;

    rl.on("line", (line) => {
      if (line === "") {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          rl.close();
          resolve(transcript.trim());
          return;
        }
      } else {
        emptyLineCount = 0;
      }
      transcript += line + "\n";
    });
  });
}

/**
 * Fetch transcript từ YouTube video
 * Sử dụng nhiều phương pháp thử
 */
async function fetchTranscript(videoId, interactive = true) {
  console.log("📝 Fetching transcript for:", videoId);

  // Method 1: youtube-transcript library approach (direct scraping)
  try {
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    }).then((r) => r.text());

    // Extract captions URL từ HTML
    const captionMatch = html.match(
      /"captions":\s*(\{[^}]+playerCaptionsTracklistRenderer[^}]+\})/
    );
    if (captionMatch) {
      console.log("🔍 Found captions data in page");
    }
  } catch (e) {
    console.log("Direct scraping failed...");
  }

  // Method 2: Sử dụng youtube-transcript-api service (public)
  try {
    const response = await fetch(
      `https://api.kome.ai/api/tools/youtube-transcripts?video_id=${videoId}&format=text`,
      { timeout: 10000 }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.transcript) {
        console.log("✅ Got transcript from Kome.ai");
        return data.transcript;
      }
    }
  } catch (e) {
    console.log("Method 2 failed, trying next...");
  }

  // Method 3: Try tactiq (free tier)
  try {
    const response = await fetch(
      `https://tactiq-apps-prod.tactiq.io/transcript?videoId=${videoId}&langCode=en`,
      { timeout: 10000 }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.transcript) {
        const text = data.transcript.map((t) => t.text).join(" ");
        console.log("✅ Got transcript from Tactiq");
        return text;
      }
    }
  } catch (e) {
    console.log("Method 3 failed...");
  }

  // Method 4: Interactive - prompt user to paste
  if (interactive) {
    console.log("\n⚠️ Auto-fetch transcript không thành công.");
    console.log("📋 Bạn có thể:");
    console.log("   1. Mở video YouTube");
    console.log('   2. Click "..." > "Show transcript"');
    console.log("   3. Copy transcript và paste vào đây");

    return await promptForTranscript();
  }

  return null;
}

/**
 * Generate embedding sử dụng OpenAI
 */
async function generateEmbedding(text) {
  const truncatedText = text.slice(0, 8000); // Limit to ~8k chars

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: truncatedText,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

/**
 * Summarize transcript using AI
 */
async function summarizeTranscript(title, transcript) {
  console.log("🤖 Summarizing transcript with AI...");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Bạn là AI assistant giúp tóm tắt video YouTube.
Hãy tạo summary ngắn gọn bằng tiếng Việt với format:

## Tóm tắt nhanh
[2-3 câu tóm tắt nội dung chính]

## Điểm chính
- [Bullet points các ý chính]

## Key takeaways
- [Những điều cần nhớ]`,
      },
      {
        role: "user",
        content: `Tiêu đề video: ${title}\n\nTranscript:\n${transcript.slice(0, 10000)}`,
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || null;
}

/**
 * Import video vào knowledge base
 */
async function importVideo(url, options = {}) {
  const { domainId, category = "youtube", tags = [], transcriptFile } = options;

  // Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${url}`);
  }

  console.log(`\n🎬 Processing video: ${videoId}`);
  console.log("═".repeat(50));

  // Get video info
  const videoInfo = await fetchVideoInfo(videoId);
  console.log(`📹 Title: ${videoInfo.title}`);
  console.log(`👤 Author: ${videoInfo.author}`);

  // Get transcript
  let transcript;
  if (transcriptFile) {
    // Read from file
    const fs = require("fs");
    transcript = fs.readFileSync(transcriptFile, "utf-8");
    console.log("📄 Loaded transcript from file");
  } else {
    transcript = await fetchTranscript(videoId, true);
  }

  if (!transcript || transcript.length < 50) {
    console.log("\n❌ Không có transcript hoặc transcript quá ngắn.");
    console.log("💡 TIP: Bạn có thể:");
    console.log(
      `   - Lưu transcript vào file và chạy: node scripts/import-youtube-knowledge.cjs "${url}" --transcript-file transcript.txt`
    );
    return null;
  }

  console.log(`📝 Transcript length: ${transcript.length} chars`);

  // Generate summary
  const summary = await summarizeTranscript(videoInfo.title, transcript);
  console.log("✅ Generated summary");

  // Build content
  const fullContent = `# ${videoInfo.title}

**Channel:** ${videoInfo.author}
**Source:** https://youtube.com/watch?v=${videoId}

---

${summary}

---

## Full Transcript

${transcript}`;

  // Generate embedding
  console.log("🧠 Generating embedding...");
  const embedding = await generateEmbedding(
    `${videoInfo.title}\n\n${summary}\n\n${transcript.slice(0, 3000)}`
  );
  console.log("✅ Embedding generated");

  // Insert vào knowledge_base
  console.log("💾 Saving to knowledge base...");
  const { data, error } = await supabase
    .from("knowledge_base")
    .insert({
      user_id: USER_ID,
      category: category,
      title: videoInfo.title,
      content: fullContent,
      summary: summary,
      source: "youtube",
      source_url: `https://youtube.com/watch?v=${videoId}`,
      tags: ["youtube", videoInfo.author, ...tags],
      importance: 7,
      is_public: false,
      is_active: true,
      embedding: embedding,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  console.log("\n✅ SUCCESS!");
  console.log("═".repeat(50));
  console.log(`📚 Knowledge ID: ${data.id}`);
  console.log(`📝 Title: ${data.title}`);
  console.log(`🏷️ Tags: ${data.tags.join(", ")}`);
  console.log(`📊 Content size: ${data.content.length} chars`);

  return data;
}

/**
 * Batch import từ file URLs
 */
async function batchImport(urlsFile, options = {}) {
  const fs = require("fs");
  const urls = fs
    .readFileSync(urlsFile, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  console.log(`\n📋 Found ${urls.length} URLs to import\n`);

  let success = 0;
  let failed = 0;

  for (const url of urls) {
    try {
      await importVideo(url, options);
      success++;
    } catch (error) {
      console.error(`❌ Failed: ${url}`, error.message);
      failed++;
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n" + "═".repeat(50));
  console.log("📊 BATCH IMPORT COMPLETE");
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
}

// Parse arguments
const args = process.argv.slice(2);
const options = {
  domainId: null,
  category: "youtube",
  tags: [],
  transcriptFile: null,
  batchFile: null,
};

let targetUrl = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--domain-id" && args[i + 1]) {
    options.domainId = args[++i];
  } else if (arg === "--category" && args[i + 1]) {
    options.category = args[++i];
  } else if (arg === "--tags" && args[i + 1]) {
    options.tags = args[++i].split(",").map((t) => t.trim());
  } else if (arg === "--transcript-file" && args[i + 1]) {
    options.transcriptFile = args[++i];
  } else if (arg === "--batch" && args[i + 1]) {
    options.batchFile = args[++i];
  } else if (!arg.startsWith("--")) {
    targetUrl = arg;
  }
}

// Main execution
console.log("");
console.log("╔══════════════════════════════════════════════════╗");
console.log("║     🎬 YOUTUBE KNOWLEDGE IMPORTER                ║");
console.log("║     Import YouTube videos to Brain               ║");
console.log("╚══════════════════════════════════════════════════╝");
console.log("");

if (options.batchFile) {
  batchImport(options.batchFile, options)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
} else if (targetUrl) {
  importVideo(targetUrl, options)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
} else {
  console.log("Usage:");
  console.log("  node scripts/import-youtube-knowledge.cjs <youtube-url>");
  console.log("  node scripts/import-youtube-knowledge.cjs <url> --transcript-file transcript.txt");
  console.log("  node scripts/import-youtube-knowledge.cjs --batch urls.txt");
  console.log("");
  console.log("Options:");
  console.log("  --domain-id <id>       Domain to import into");
  console.log("  --category <cat>       Category name (default: youtube)");
  console.log("  --tags <tag1,tag2>     Comma-separated tags");
  console.log("  --transcript-file <f>  Use transcript from file");
  console.log("  --batch <file>         Batch import URLs from file");
  console.log("");
  console.log("Examples:");
  console.log('  node scripts/import-youtube-knowledge.cjs "https://youtube.com/watch?v=abc123"');
  console.log(
    '  node scripts/import-youtube-knowledge.cjs "https://youtu.be/abc" --category ai --tags "machine learning,tutorial"'
  );
  process.exit(0);
}
