/**
 * YouTube Channel Knowledge Importer
 * Import ALL transcripts from a YouTube channel into Brain
 *
 * Usage:
 *   node scripts/import-youtube-channel.cjs @AlexHormozi
 *   node scripts/import-youtube-channel.cjs UCVHFbqXqoYvEWM1Ddxl0QDg
 *   node scripts/import-youtube-channel.cjs --limit 50 @AlexHormozi
 */

const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");
const { google } = require("googleapis");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
require("dotenv").config(); // Also load .env as fallback

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

// YouTube OAuth credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET
);

// Set credentials from env
oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN,
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

// User ID for Brain
const USER_ID = "default-longsang-user";

// Rate limiting
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Get channel ID from handle or URL
 */
async function getChannelId(input) {
  // If already a channel ID (starts with UC)
  if (input.startsWith("UC") && input.length === 24) {
    return input;
  }

  // Remove @ prefix if present
  const handle = input.replace(/^@/, "");

  console.log(`🔍 Looking up channel: ${handle}`);

  try {
    // Search for channel by handle
    const response = await youtube.search.list({
      part: "snippet",
      q: handle,
      type: "channel",
      maxResults: 1,
    });

    if (response.data.items && response.data.items.length > 0) {
      const channelId = response.data.items[0].snippet.channelId;
      const channelTitle = response.data.items[0].snippet.channelTitle;
      console.log(`✅ Found channel: ${channelTitle} (${channelId})`);
      return channelId;
    }

    throw new Error(`Channel not found: ${handle}`);
  } catch (error) {
    console.error("Error looking up channel:", error.message);
    throw error;
  }
}

/**
 * Get channel info
 */
async function getChannelInfo(channelId) {
  const response = await youtube.channels.list({
    part: "snippet,statistics",
    id: channelId,
  });

  if (!response.data.items || response.data.items.length === 0) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const channel = response.data.items[0];
  return {
    id: channelId,
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnail: channel.snippet.thumbnails?.high?.url,
    subscriberCount: channel.statistics.subscriberCount,
    videoCount: channel.statistics.videoCount,
  };
}

/**
 * Get all video IDs from channel (paginated)
 */
async function getAllVideoIds(channelId, limit = 500) {
  console.log(`📋 Fetching video list from channel (limit: ${limit})...`);

  const videoIds = [];
  let nextPageToken = null;

  do {
    const response = await youtube.search.list({
      part: "id",
      channelId: channelId,
      type: "video",
      maxResults: 50,
      pageToken: nextPageToken,
      order: "date", // newest first
    });

    const ids = response.data.items
      .filter((item) => item.id.videoId)
      .map((item) => item.id.videoId);

    videoIds.push(...ids);
    nextPageToken = response.data.nextPageToken;

    console.log(`   Fetched ${videoIds.length} videos...`);

    if (videoIds.length >= limit) {
      break;
    }

    // Rate limiting
    await sleep(200);
  } while (nextPageToken);

  return videoIds.slice(0, limit);
}

/**
 * Get video details
 */
async function getVideoDetails(videoId) {
  const response = await youtube.videos.list({
    part: "snippet,contentDetails,statistics",
    id: videoId,
  });

  if (!response.data.items || response.data.items.length === 0) {
    return null;
  }

  const video = response.data.items[0];
  return {
    id: videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    publishedAt: video.snippet.publishedAt,
    duration: video.contentDetails.duration,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
    thumbnail: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url,
  };
}

/**
 * Fetch transcript using multiple methods
 */
async function fetchTranscript(videoId) {
  // Method 1: youtube-transcript.io API (có 25 lần free)
  try {
    const response = await fetch("https://www.youtube-transcript.io/api/transcripts", {
      method: "POST",
      headers: {
        Authorization: "Basic 6958bebf4ffea701a5bd35d6",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: [videoId] }),
      signal: AbortSignal.timeout(30000),
    });

    if (response.ok) {
      const responseData = await response.json();
      // Response is an array, get first item
      const data = Array.isArray(responseData) ? responseData[0] : responseData;

      // Check "text" field first (combined transcript)
      if (data.text && data.text.length > 100) {
        console.log("   [✓] Got transcript from youtube-transcript.io");
        return data.text;
      }
      // Check tracks array (each track has language and transcript segments)
      if (data.tracks && data.tracks.length > 0) {
        // Prefer English track
        const englishTrack =
          data.tracks.find(
            (t) =>
              t.language?.toLowerCase().includes("english") || t.language?.toLowerCase() === "en"
          ) || data.tracks[0];

        if (englishTrack && englishTrack.transcript && englishTrack.transcript.length > 0) {
          const fullText = englishTrack.transcript
            .map((t) => t.text)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          if (fullText.length > 50) {
            console.log("   [✓] Got transcript from youtube-transcript.io");
            return fullText;
          }
        }
      }
      // Video has no captions
      if (!data.tracks || data.tracks.length === 0) {
        console.log("   [i] Video has no captions/subtitles");
      }
    } else {
      const errorText = await response.text();
      console.log(
        `   [Debug] youtube-transcript.io status ${response.status}: ${errorText.substring(0, 100)}`
      );
    }
  } catch (e) {
    console.log(`   [Debug] youtube-transcript.io: ${e.message}`);
  }

  // Method 2: Direct YouTube innertube API
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const html = await response.text();

    // Extract captions track URL from player response
    const playerMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/);
    if (playerMatch) {
      try {
        const playerData = JSON.parse(playerMatch[1]);
        const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (captionTracks && captionTracks.length > 0) {
          // Prefer English, then auto-generated
          const track =
            captionTracks.find((t) => t.languageCode === "en") ||
            captionTracks.find((t) => t.languageCode.startsWith("en")) ||
            captionTracks[0];

          if (track && track.baseUrl) {
            const captionResponse = await fetch(track.baseUrl + "&fmt=json3");
            const captionData = await captionResponse.json();

            if (captionData.events) {
              const texts = captionData.events
                .filter((e) => e.segs)
                .map((e) => e.segs.map((s) => s.utf8).join(""))
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

              if (texts.length > 100) {
                console.log("   [✓] Got transcript from YouTube direct");
                return texts;
              }
            }
          }
        }
      } catch (parseError) {
        // Try XML format fallback
      }
    }

    // Try XML caption format
    const captionMatch = html.match(/"captionTracks":\s*\[(.*?)\]/);
    if (captionMatch) {
      try {
        const captionData = JSON.parse(`[${captionMatch[1]}]`);
        const track =
          captionData.find((t) => t.languageCode === "en" || t.languageCode === "en-US") ||
          captionData[0];

        if (track && track.baseUrl) {
          const captionResponse = await fetch(track.baseUrl);
          const captionXml = await captionResponse.text();

          // Parse XML transcript
          const textMatches = captionXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
          const texts = [];
          for (const match of textMatches) {
            let text = match[1]
              .replace(/&amp;/g, "&")
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/\n/g, " ");
            texts.push(text);
          }

          if (texts.length > 0) {
            console.log("   [✓] Got transcript from YouTube XML");
            return texts.join(" ").replace(/\s+/g, " ").trim();
          }
        }
      } catch (e) {
        // Silent fail
      }
    }
  } catch (e) {
    console.log(`   [Debug] YouTube direct failed: ${e.message}`);
  }

  // Method 3: Third-party API (kome.ai)
  try {
    const response = await fetch(
      `https://api.kome.ai/api/tools/youtube-transcripts?video_id=${videoId}&format=text`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.transcript && data.transcript.length > 100) {
        console.log("   [✓] Got transcript from kome.ai");
        return data.transcript;
      }
    }
  } catch (e) {
    // Silent fail
  }

  return null;
}

/**
 * Generate embedding
 */
async function generateEmbedding(text) {
  const truncatedText = text.slice(0, 8000);

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: truncatedText,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

/**
 * Generate summary using AI
 */
async function generateSummary(title, transcript, videoInfo) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Bạn là AI assistant tóm tắt video về business/entrepreneurship.
Tạo summary ngắn gọn với format:

## Key Points
- [3-5 bullet points chính]

## Actionable Takeaways
- [2-3 điều có thể áp dụng ngay]

## Quote đáng nhớ
> [1 quote hay nhất từ video]`,
      },
      {
        role: "user",
        content: `Video: ${title}
Views: ${videoInfo.viewCount}

Transcript (excerpt):
${transcript.slice(0, 6000)}`,
      },
    ],
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Check if video already imported
 */
async function isVideoImported(videoId) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", `https://youtube.com/watch?v=${videoId}`)
    .limit(1);

  return data && data.length > 0;
}

/**
 * Import single video
 */
async function importVideo(videoId, channelInfo, stats) {
  // Check if already imported
  if (await isVideoImported(videoId)) {
    stats.skipped++;
    return { skipped: true };
  }

  // Get video details
  const videoInfo = await getVideoDetails(videoId);
  if (!videoInfo) {
    stats.failed++;
    stats.errors.push({ videoId, error: "Video not found" });
    return { error: "Video not found" };
  }

  // Get transcript
  const transcript = await fetchTranscript(videoId);
  if (!transcript || transcript.length < 100) {
    stats.noTranscript++;
    return { error: "No transcript available" };
  }

  // Generate summary
  let summary = "";
  try {
    summary = await generateSummary(videoInfo.title, transcript, videoInfo);
  } catch (e) {
    console.warn("Summary generation failed:", e.message);
  }

  // Build content
  const fullContent = `# ${videoInfo.title}

**Channel:** ${channelInfo.title}
**Published:** ${new Date(videoInfo.publishedAt).toLocaleDateString()}
**Views:** ${parseInt(videoInfo.viewCount).toLocaleString()}
**Likes:** ${parseInt(videoInfo.likeCount || 0).toLocaleString()}
**Source:** https://youtube.com/watch?v=${videoId}

---

${summary}

---

## Full Transcript

${transcript}`;

  // Generate embedding
  const embedding = await generateEmbedding(
    `${videoInfo.title}\n${channelInfo.title}\n${summary}\n${transcript.slice(0, 3000)}`
  );

  // Insert into knowledge_base
  const { data, error } = await supabase
    .from("knowledge_base")
    .insert({
      user_id: USER_ID,
      category: "youtube",
      subcategory: channelInfo.title.toLowerCase().replace(/\s+/g, "-"),
      title: videoInfo.title,
      content: fullContent,
      summary: summary,
      source: "youtube",
      source_url: `https://youtube.com/watch?v=${videoId}`,
      tags: ["youtube", channelInfo.title, "business", "entrepreneurship"],
      importance: 8,
      is_public: false,
      is_active: true,
      embedding: embedding,
    })
    .select("id")
    .single();

  if (error) {
    stats.failed++;
    stats.errors.push({ videoId, title: videoInfo.title, error: error.message });
    return { error: error.message };
  }

  stats.success++;
  return { success: true, id: data.id };
}

/**
 * Main import function
 */
async function importChannel(channelInput, options = {}) {
  const { limit = 100, startFrom = 0 } = options;

  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║     📺 YOUTUBE CHANNEL KNOWLEDGE IMPORTER            ║");
  console.log("║     Import all videos from a channel to Brain        ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("");

  // Get channel ID
  const channelId = await getChannelId(channelInput);

  // Get channel info
  const channelInfo = await getChannelInfo(channelId);

  console.log("\n📺 Channel Info:");
  console.log("─".repeat(50));
  console.log(`   Name: ${channelInfo.title}`);
  console.log(`   Subscribers: ${parseInt(channelInfo.subscriberCount).toLocaleString()}`);
  console.log(`   Total Videos: ${channelInfo.videoCount}`);
  console.log("─".repeat(50));

  // Get all video IDs (fetch enough to include offset + limit)
  const totalToFetch = startFrom + limit;
  console.log(`📋 Fetching video list from channel (limit: ${limit}, start from: ${startFrom})...`);
  const allVideoIds = await getAllVideoIds(channelId, totalToFetch);

  // Slice to get videos from startFrom to startFrom + limit
  const videoIds = allVideoIds.slice(startFrom, startFrom + limit);
  console.log(
    `\n📋 Found ${videoIds.length} videos to process (from index ${startFrom} to ${
      startFrom + videoIds.length - 1
    })`
  );

  // Stats
  const stats = {
    total: videoIds.length,
    success: 0,
    failed: 0,
    skipped: 0,
    noTranscript: 0,
    errors: [],
  };

  // Process videos
  console.log("\n🚀 Starting import...\n");

  for (let i = 0; i < videoIds.length; i++) {
    const videoId = videoIds[i];
    const actualIndex = startFrom + i;
    const progress = `[${actualIndex + 1}/${startFrom + videoIds.length}]`;

    try {
      process.stdout.write(`${progress} Processing ${videoId}... `);

      const result = await importVideo(videoId, channelInfo, stats);

      if (result.skipped) {
        console.log("⏭️ Already imported");
      } else if (result.error) {
        console.log(`❌ ${result.error}`);
      } else {
        console.log("✅ Imported");
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      stats.failed++;
      stats.errors.push({ videoId, error: error.message });
    }

    // Rate limiting (avoid API quota issues)
    await sleep(1500);

    // Progress report every 20 videos
    if ((i + 1) % 20 === 0) {
      console.log(
        `\n📊 Progress: ${stats.success} imported, ${stats.skipped} skipped, ${stats.noTranscript} no transcript, ${stats.failed} failed\n`
      );
    }
  }

  // Final report
  console.log("\n" + "═".repeat(50));
  console.log("📊 IMPORT COMPLETE");
  console.log("═".repeat(50));
  console.log(`   ✅ Successfully imported: ${stats.success}`);
  console.log(`   ⏭️ Already existed: ${stats.skipped}`);
  console.log(`   📝 No transcript: ${stats.noTranscript}`);
  console.log(`   ❌ Failed: ${stats.failed}`);
  console.log("═".repeat(50));

  if (stats.errors.length > 0 && stats.errors.length <= 10) {
    console.log("\n❌ Errors:");
    stats.errors.forEach((e) => {
      console.log(`   - ${e.videoId}: ${e.error}`);
    });
  }

  return stats;
}

// Parse arguments
const args = process.argv.slice(2);
let channelInput = null;
let limit = 500;
let startFrom = 0;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit" && args[i + 1]) {
    limit = parseInt(args[++i]);
  } else if (args[i] === "--start" && args[i + 1]) {
    startFrom = parseInt(args[++i]);
  } else if (!args[i].startsWith("--")) {
    channelInput = args[i];
  }
}

if (!channelInput) {
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/import-youtube-channel.cjs @ChannelHandle");
  console.log("  node scripts/import-youtube-channel.cjs UCxxxxxxx");
  console.log("");
  console.log("Options:");
  console.log("  --limit <n>    Maximum videos to import (default: 500)");
  console.log("  --start <n>    Start from video index (for resuming)");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/import-youtube-channel.cjs @AlexHormozi");
  console.log("  node scripts/import-youtube-channel.cjs @AlexHormozi --limit 100");
  console.log("  node scripts/import-youtube-channel.cjs @AlexHormozi --start 50 --limit 100");
  process.exit(0);
}

// Run
importChannel(channelInput, { limit, startFrom })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Fatal error:", err.message);
    process.exit(1);
  });
