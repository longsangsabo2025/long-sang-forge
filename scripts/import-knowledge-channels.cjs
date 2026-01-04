/**
 * Import top videos from multiple YouTube channels to Brain
 * Phase 6: VERIFIED Channels - AI, Business, Finance, Philosophy
 * Using youtube-transcript.io API
 */

// Load .env FIRST (has the real keys), then .env.local (but don't override existing)
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const { google } = require("googleapis");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

// ============================================
// Configuration
// ============================================
const CONFIG = {
  // YouTube channels - Phase 6 (ALL VERIFIED!)
  CHANNELS: [
    // === SELF-IMPROVEMENT & PRODUCTIVITY ===
    {
      name: "Improvement Pill",
      id: "UCBIt1VN5j37PVM8LLSuTTlw",
      videosToImport: 12,
      minDuration: "PT5M",
      category: "self-improvement",
      description: "Animated self-improvement, habits, motivation",
    },
    {
      name: "Better Ideas",
      id: "UCtUId5WFnN82GdDy7DgaQ7w",
      videosToImport: 12,
      minDuration: "PT6M",
      category: "productivity",
      description: "Productivity tips, getting out of ruts, lifestyle",
    },
    // === PHILOSOPHY ===
    {
      name: "Freedom in Thought",
      id: "UCd6Za0CXVldhY8fK8eYoIuw",
      videosToImport: 12,
      minDuration: "PT5M",
      category: "philosophy",
      description: "Animated philosophy, discipline, wisdom",
    },
    {
      name: "Aperture",
      id: "UCO5QSoES5yn2Dw7YixDYT5Q",
      videosToImport: 12,
      minDuration: "PT8M",
      category: "philosophy",
      description: "Stoicism, philosophy, deep thinking",
    },
    // === BUSINESS ===
    {
      name: "Valuetainment",
      id: "UCIHdDJ0tjn_3j-FS7s_X1kQ",
      videosToImport: 12,
      minDuration: "PT8M",
      category: "business",
      description: "Business strategy, entrepreneurship, Patrick Bet-David",
    },
    // === AI & TECH ===
    {
      name: "AI Explained",
      id: "UCNJ1Ymd5yFuUPtn21xtRbbw",
      videosToImport: 12,
      minDuration: "PT8M",
      category: "ai",
      description: "AI news, GPT analysis, tech deep dives",
    },
    {
      name: "Bycloud",
      id: "UCgfe2ooZD3VJPB6aJAnuQng",
      videosToImport: 10,
      minDuration: "PT6M",
      category: "ai",
      description: "AI tools tutorials, practical AI applications",
    },
    // === FINANCE ===
    {
      name: "Humphrey Yang",
      id: "UCFCEuCsyWP0YkP3CZ3Mr01Q",
      videosToImport: 12,
      minDuration: "PT5M",
      category: "finance",
      description: "Personal finance, money tips, financial literacy",
    },
  ],

  // API Keys
  TRANSCRIPT_API_KEY: "6958bebf4ffea701a5bd35d6",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Supabase
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // User
  USER_ID: "default-longsang-user",

  // Rate limiting
  DELAY_BETWEEN_VIDEOS: 2500, // 2.5s delay
};

// ============================================
// Initialize clients
// ============================================
// Use OAuth2 like the Hormozi script
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET
);
oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN,
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({ version: "v3", auth: oauth2Client });

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// ============================================
// Helper Functions
// ============================================
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseDuration(duration) {
  // Parse ISO 8601 duration (PT1H2M3S) to seconds
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

// ============================================
// YouTube API Functions
// ============================================
async function getTopVideos(channelId, maxResults = 15) {
  console.log(`   🔍 Searching for top videos...`);

  // Step 1: Search for videos from channel
  const searchResponse = await youtube.search.list({
    part: "snippet",
    channelId: channelId,
    order: "viewCount",
    type: "video",
    videoDuration: "medium", // 4-20 minutes
    maxResults: maxResults * 2, // Get more to filter
  });

  const videoIds = searchResponse.data.items.map((item) => item.id.videoId);

  if (videoIds.length === 0) {
    console.log("   ⚠️ No videos found");
    return [];
  }

  // Step 2: Get video details (duration, views)
  const detailsResponse = await youtube.videos.list({
    part: "snippet,contentDetails,statistics",
    id: videoIds.join(","),
  });

  // Filter and sort by views
  const videos = detailsResponse.data.items
    .filter((video) => {
      const duration = parseDuration(video.contentDetails.duration);
      return duration >= 240 && duration <= 3600; // 4min to 1hour
    })
    .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount))
    .slice(0, maxResults);

  console.log(`   ✓ Found ${videos.length} qualifying videos`);
  return videos;
}

// ============================================
// Transcript Functions
// ============================================
async function fetchTranscript(videoId) {
  try {
    const response = await axios.post(
      "https://www.youtube-transcript.io/api/transcripts",
      { ids: [videoId] },
      {
        headers: {
          Authorization: `Basic ${CONFIG.TRANSCRIPT_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    if (!data || data.length === 0) return null;

    const videoData = data[0];

    // Check for errors
    if (videoData.error) {
      console.log(`      ⚠️ Transcript error: ${videoData.error}`);
      return null;
    }

    // Get English transcript
    const tracks = videoData.tracks || [];
    const englishTrack =
      tracks.find((t) => t.language === "en" || t.language === "en-US" || t.language === "en-GB") ||
      tracks[0];

    if (!englishTrack || !englishTrack.transcript) {
      return null;
    }

    // Combine transcript segments
    const fullText = englishTrack.transcript
      .map((segment) => segment.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return fullText;
  } catch (error) {
    console.log(`      ⚠️ Fetch error: ${error.message}`);
    return null;
  }
}

// ============================================
// OpenAI Functions
// ============================================
async function generateSummary(title, content, channelName) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a knowledge curator. Create a comprehensive summary of this ${channelName} video transcript.
Format:
- Start with a brief overview (2-3 sentences)
- List 5-7 key points/takeaways as bullet points
- Include any specific frameworks, numbers, or actionable advice
- End with 1-2 sentences on who would benefit from this content

Keep the language engaging and practical.`,
            },
            {
              role: "user",
              content: `Video Title: "${title}"\n\nTranscript:\n${content.slice(0, 10000)}`,
            },
          ],
          max_tokens: 800,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30s timeout
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (attempt < 3) {
        console.log(`      ⚠️ Retry ${attempt}/3...`);
        await sleep(2000);
      } else {
        console.log(`      ⚠️ Summary failed: ${error.message}`);
        return `Summary of ${title} from ${channelName}`;
      }
    }
  }
}

async function generateEmbedding(text) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/embeddings",
        {
          model: "text-embedding-3-small",
          input: text.slice(0, 8000),
        },
        {
          headers: {
            Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 20000, // 20s timeout
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      if (attempt < 3) {
        await sleep(1000);
      } else {
        console.log(`      ⚠️ Embedding failed`);
        return null;
      }
    }
  }
}

// ============================================
// Database Functions
// ============================================
async function checkExists(sourceUrl) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", sourceUrl)
    .single();
  return !!data;
}

async function saveToKnowledgeBase(
  video,
  content,
  summary,
  embedding,
  channelName,
  category = "learning"
) {
  const { data, error } = await supabase
    .from("knowledge_base")
    .insert({
      title: video.snippet.title,
      content: content,
      summary: summary,
      source: "YouTube",
      source_url: `https://www.youtube.com/watch?v=${video.id}`,
      tags: [channelName.toLowerCase().replace(/\s+/g, "-"), category, "youtube", "video"],
      embedding: embedding,
      user_id: CONFIG.USER_ID,
      category: category,
      importance: 7,
      is_public: true,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Import Single Video
// ============================================
async function importVideo(video, index, total, channelName, category = "learning") {
  const title = video.snippet.title.slice(0, 50);
  const views = formatNumber(video.statistics.viewCount);
  const duration = video.contentDetails.duration;
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

  console.log(`\n[${index}/${total}] ${title}...`);
  console.log(`   👁️ ${views} views | ⏱️ ${duration}`);

  // Check if already exists
  if (await checkExists(videoUrl)) {
    console.log(`   ⏭️ Already imported, skipping`);
    return { status: "skipped" };
  }

  // Fetch transcript
  process.stdout.write(`   📝 Fetching transcript... `);
  const transcript = await fetchTranscript(video.id);
  if (!transcript) {
    console.log(`❌ No transcript`);
    return { status: "no_transcript" };
  }
  console.log(`✓ (${transcript.length} chars)`);

  // Generate summary
  process.stdout.write(`   🤖 Generating summary... `);
  const summary = await generateSummary(video.snippet.title, transcript, channelName);
  if (!summary) {
    console.log(`❌ Failed`);
    return { status: "failed" };
  }
  console.log(`✓`);

  // Generate embedding
  process.stdout.write(`   🧮 Generating embedding... `);
  const embedding = await generateEmbedding(summary + "\n\n" + transcript.slice(0, 4000));
  if (!embedding) {
    console.log(`❌ Failed`);
    return { status: "failed" };
  }
  console.log(`✓`);

  // Save to database
  process.stdout.write(`   💾 Saving to Brain... `);
  try {
    await saveToKnowledgeBase(video, transcript, summary, embedding, channelName, category);
    console.log(`✓`);
    return { status: "success" };
  } catch (error) {
    console.log(`❌ ${error.message}`);
    return { status: "failed" };
  }
}

// ============================================
// Import Channel
// ============================================
async function importChannel(channel) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`📺 ${channel.name.toUpperCase()}`);
  console.log(`   ${channel.description}`);
  console.log(`${"═".repeat(60)}`);

  const videos = await getTopVideos(channel.id, channel.videosToImport);

  if (videos.length === 0) {
    console.log("❌ No videos to import");
    return { success: 0, skipped: 0, noTranscript: 0, failed: 0 };
  }

  const stats = { success: 0, skipped: 0, noTranscript: 0, failed: 0 };
  const category = channel.category || "learning";

  for (let i = 0; i < videos.length; i++) {
    const result = await importVideo(videos[i], i + 1, videos.length, channel.name, category);

    switch (result.status) {
      case "success":
        stats.success++;
        break;
      case "skipped":
        stats.skipped++;
        break;
      case "no_transcript":
        stats.noTranscript++;
        break;
      case "failed":
        stats.failed++;
        break;
    }

    // Rate limiting
    if (i < videos.length - 1 && result.status !== "skipped") {
      await sleep(CONFIG.DELAY_BETWEEN_VIDEOS);
    }
  }

  return stats;
}

// ============================================
// Main
// ============================================
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  🧠 BRAIN KNOWLEDGE IMPORTER - Phase 6                   ║");
  console.log("║  AI | Business | Finance | Philosophy (VERIFIED)        ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  // Validate config
  if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_ACCESS_TOKEN) {
    console.error("❌ YouTube OAuth credentials not found in environment");
    process.exit(1);
  }
  if (!CONFIG.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found in environment");
    process.exit(1);
  }

  const totalStats = { success: 0, skipped: 0, noTranscript: 0, failed: 0 };

  for (const channel of CONFIG.CHANNELS) {
    try {
      const stats = await importChannel(channel);
      totalStats.success += stats.success;
      totalStats.skipped += stats.skipped;
      totalStats.noTranscript += stats.noTranscript;
      totalStats.failed += stats.failed;
    } catch (error) {
      console.error(`❌ Error importing ${channel.name}: ${error.message}`);
    }
  }

  // Final summary
  console.log(`\n${"═".repeat(60)}`);
  console.log("📊 IMPORT COMPLETE - TOTAL SUMMARY");
  console.log(`${"═".repeat(60)}`);
  console.log(`   ✅ Successfully imported: ${totalStats.success}`);
  console.log(`   ⏭️ Already existed: ${totalStats.skipped}`);
  console.log(`   📝 No transcript: ${totalStats.noTranscript}`);
  console.log(`   ❌ Failed: ${totalStats.failed}`);
  console.log(`${"═".repeat(60)}`);
}

main().catch(console.error);
