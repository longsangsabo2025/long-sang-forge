/**
 * Import top 25 most viewed LONG videos from Alex Hormozi
 * Using youtube-transcript.io API
 */

// Load .env FIRST (has the real keys), then .env.local (but don't override existing)
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const { google } = require("googleapis");
const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");

// Initialize clients
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET
);
oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN,
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({ version: "v3", auth: oauth2Client });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Get top 25 most viewed medium-duration videos
 */
async function getTop25Videos() {
  console.log("📊 Fetching top 25 most viewed videos (4-20 min)...\n");

  // Get channel ID
  const channelRes = await youtube.search.list({
    part: "snippet",
    q: "AlexHormozi",
    type: "channel",
    maxResults: 1,
  });
  const channelId = channelRes.data.items[0].snippet.channelId;

  // Search for medium duration videos sorted by viewCount
  const searchRes = await youtube.search.list({
    part: "id",
    channelId: channelId,
    type: "video",
    videoDuration: "medium", // 4-20 minutes
    order: "viewCount",
    maxResults: 50,
  });

  const videoIds = searchRes.data.items.map((i) => i.id.videoId);

  // Get video details
  const detailsRes = await youtube.videos.list({
    part: "snippet,contentDetails,statistics",
    id: videoIds.slice(0, 25).join(","),
  });

  return detailsRes.data.items.map((v) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    publishedAt: v.snippet.publishedAt,
    duration: v.contentDetails.duration,
    viewCount: parseInt(v.statistics.viewCount),
    thumbnail: v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url,
  }));
}

/**
 * Fetch transcript using youtube-transcript.io API
 */
async function fetchTranscript(videoId) {
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

    if (!response.ok) {
      console.log(`   ❌ API error: ${response.status}`);
      return null;
    }

    const responseData = await response.json();
    const data = Array.isArray(responseData) ? responseData[0] : responseData;

    // Check for combined text field first
    if (data.text && data.text.length > 100) {
      return data.text;
    }

    // Check tracks array
    if (data.tracks && data.tracks.length > 0) {
      const englishTrack =
        data.tracks.find((t) => t.language?.toLowerCase().includes("english")) || data.tracks[0];

      if (englishTrack?.transcript?.length > 0) {
        const fullText = englishTrack.transcript
          .map((t) => t.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (fullText.length > 100) {
          return fullText;
        }
      }
    }

    console.log(`   ⚠️ No transcript available (tracks: ${data.tracks?.length || 0})`);
    return null;
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
    return null;
  }
}

/**
 * Generate summary using GPT
 */
async function generateSummary(title, transcript) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a knowledge extraction expert. Create concise, actionable summaries of business and entrepreneurship content. Focus on key insights, frameworks, and practical advice. Output in Vietnamese.",
      },
      {
        role: "user",
        content: `Summarize this video transcript. Extract the main insights, key lessons, and actionable advice.

Title: ${title}

Transcript (first 8000 chars):
${transcript.substring(0, 8000)}

Provide:
1. Main topic (1 sentence)
2. Key insights (3-5 bullet points)
3. Actionable takeaways (2-3 points)`,
      },
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

/**
 * Generate embedding
 */
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}

/**
 * Check if video already imported
 */
async function isAlreadyImported(videoId) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", `https://www.youtube.com/watch?v=${videoId}`)
    .single();

  return !!data;
}

/**
 * Import single video
 */
async function importVideo(video, index, total) {
  const sourceUrl = `https://www.youtube.com/watch?v=${video.id}`;

  console.log(`\n[${index}/${total}] ${video.title.substring(0, 50)}...`);
  console.log(`   👁️ ${video.viewCount.toLocaleString()} views | ⏱️ ${video.duration}`);

  // Check if already imported
  if (await isAlreadyImported(video.id)) {
    console.log("   ⏭️ Already imported");
    return { skipped: true };
  }

  // Fetch transcript
  process.stdout.write("   📝 Fetching transcript... ");
  const transcript = await fetchTranscript(video.id);

  if (!transcript) {
    return { noTranscript: true };
  }
  console.log(`✓ (${transcript.length} chars)`);

  // Generate summary
  process.stdout.write("   🤖 Generating summary... ");
  const summary = await generateSummary(video.title, transcript);
  console.log("✓");

  // Generate embedding
  process.stdout.write("   🧮 Generating embedding... ");
  const embedding = await generateEmbedding(video.title + "\n" + summary);
  console.log("✓");

  // Insert to database
  process.stdout.write("   💾 Saving to Brain... ");
  const { error } = await supabase.from("knowledge_base").insert({
    user_id: "default-longsang-user",
    category: "Business & Entrepreneurship",
    subcategory: "Alex Hormozi",
    title: video.title,
    content: transcript,
    summary: summary,
    source: "YouTube",
    source_url: sourceUrl,
    tags: ["Alex Hormozi", "Business", "Entrepreneurship", "Sales", "Marketing"],
    importance: 5,
    embedding: embedding,
  });

  if (error) {
    console.log("❌");
    return { error: error.message };
  }

  console.log("✓");
  return { success: true };
}

/**
 * Main import function
 */
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  📺 ALEX HORMOZI TOP 25 VIDEOS IMPORTER              ║");
  console.log("║  Importing most viewed long-form content to Brain    ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Get top 25 videos
  const videos = await getTop25Videos();
  console.log(`Found ${videos.length} videos\n`);

  // Stats
  const stats = {
    success: 0,
    skipped: 0,
    noTranscript: 0,
    failed: 0,
  };

  // Import each video
  for (let i = 0; i < videos.length; i++) {
    const result = await importVideo(videos[i], i + 1, videos.length);

    if (result.success) stats.success++;
    else if (result.skipped) stats.skipped++;
    else if (result.noTranscript) stats.noTranscript++;
    else stats.failed++;

    // Rate limiting - youtube-transcript.io allows 5 req/10sec
    await sleep(2500);
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
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Fatal error:", err.message);
    process.exit(1);
  });
