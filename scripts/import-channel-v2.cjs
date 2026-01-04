/**
 * BRAIN KNOWLEDGE IMPORT - V2 (Using youtube-transcript.io API)
 *
 * Cách dùng:
 *   node scripts/import-channel-v2.cjs 0       # Import channel đầu tiên
 *   node scripts/import-channel-v2.cjs 1       # Import channel thứ 2
 *   node scripts/import-channel-v2.cjs all     # Import tất cả
 */

const config = require("./_config.cjs");

// Validate required keys
config.validate(["SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]);

// ===================== CONFIG =====================
const TRANSCRIPT_API_KEY = config.TRANSCRIPT_API_KEY;
const USER_ID = config.DEFAULT_USER_ID;

const supabase = config.getSupabaseClient();
const openai = config.getOpenAIClient();

// ===================== CHANNELS =====================
const CHANNELS = [
  // ========== P0: AI AUTOMATION MASTERS ==========
  {
    name: "Liam Ottley",
    id: "UCui4jxDaMb53Gdh-AZUTPAg",
    category: "ai-automation-agency",
    videos: 15,
  },
  { name: "Skill Leap AI", id: "UCwSozl89jl2zUDzQ4jGJD3g", category: "ai-tutorials", videos: 15 },

  // ========== P0: PRODUCTIVITY & OFFICE AUTOMATION ==========
  {
    name: "Thomas Frank",
    id: "UCd_WBvzBg1UbHE8j8MIL5Ng",
    category: "productivity-notion",
    videos: 12,
  },
  {
    name: "Ali Abdaal",
    id: "UCoOae5nYA7VqaXzerajD0lg",
    category: "productivity-doctor",
    videos: 12,
  },
  { name: "Tiago Forte", id: "UCmvYCRYPDlzSHVNCI_ViJDQ", category: "second-brain", videos: 10 },

  // ========== P0: MARKETING & SALES AI ==========
  { name: "Alex Hormozi", id: "UCUyDOdBWhC1MCxEjC46d-zw", category: "sales-business", videos: 15 },
  { name: "Pat Flynn", id: "UCGk1LitxAZVnqQn0_nt5qxw", category: "online-business", videos: 10 },

  // ========== P1: REAL ESTATE AI ==========
  {
    name: "Graham Stephan",
    id: "UCV6KDgJskWaEckne5aPA0aQ",
    category: "real-estate-finance",
    videos: 12,
  },
  { name: "BiggerPockets", id: "UCHEUaxGFRkaVB5Vp0EqNuoA", category: "real-estate", videos: 10 },

  // ========== P1: ACCOUNTING & FINANCE ==========
  { name: "Accounting Stuff", id: "UCYJLdSmyKoXCbnd-poJR8Yw", category: "accounting", videos: 12 },
  {
    name: "The Financial Diet",
    id: "UCSPYNpQ2fHv9HJ-q6MIMaPw",
    category: "personal-finance",
    videos: 10,
  },

  // ========== P1: HR & RECRUITING ==========
  { name: "AIHR", id: "UCnjzyfCGKvyRgTqPRlNz34Q", category: "hr-analytics", videos: 10 },

  // ========== VIETNAMESE EDUCATION ==========
  {
    name: "THUẬT TÀI VẬN",
    id: "UCAn8HBIgRP5xh6G6O7A7Fsw",
    category: "vietnamese-finance",
    videos: 15,
  },

  // ========== EDUCATION CHANNELS (ALREADY IMPORTED) ==========
  {
    name: "Think Media",
    id: "UCyrHKzPBk3hlTLPDvmDBHdQ",
    category: "youtube-education",
    videos: 10,
  },
  {
    name: "Roberto Blake",
    id: "UCovtFObhY9NypXcyHxAS7-Q",
    category: "creator-education",
    videos: 10,
  },
  {
    name: "Crash Course",
    id: "UCX6b17PVsYBQ0ip5gyeme-Q",
    category: "educational-content",
    videos: 10,
  },
  { name: "TED-Ed", id: "UCsooa4yRKGN_zEE8iknghZA", category: "education", videos: 10 },
  { name: "CGP Grey", id: "UC2C_jShtL725hvbm1arSV9w", category: "explainer", videos: 10 },
  { name: "Kurzgesagt", id: "UCsXVk37bltHxD1rDPwtNM8Q", category: "science-education", videos: 10 },
  { name: "Veritasium", id: "UCHnyfMqiRRG1u-2MsSQLbXA", category: "science", videos: 10 },
  { name: "3Blue1Brown", id: "UCYO_jab_esuFRV4b17AJtAw", category: "math-education", videos: 10 },
  { name: "Fireship", id: "UCsBjURrPoezykLs9EqgamOA", category: "tech-education", videos: 10 },
  {
    name: "Traversy Media",
    id: "UC29ju8bIPH5as8OGnQzwJyA",
    category: "web-dev-education",
    videos: 10,
  },
  {
    name: "freeCodeCamp",
    id: "UC8butISFwT-Wl7EV0hUK0BQ",
    category: "coding-education",
    videos: 10,
  },
  {
    name: "The Coding Train",
    id: "UCvjgXvBlsQDd_XZLX_UaUFg",
    category: "creative-coding",
    videos: 10,
  },
];

// ===================== HELPERS =====================
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getChannelVideos(channelId, maxResults = 10) {
  try {
    // Use YouTube RSS feed (no API key needed)
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl);
    const xml = await res.text();

    // Parse XML manually
    const videos = [];
    const entries = xml.split("<entry>").slice(1); // Skip first part (feed header)

    for (let i = 0; i < Math.min(entries.length, maxResults); i++) {
      const entry = entries[i];

      // Extract video ID
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      if (!videoIdMatch) continue;

      // Extract title
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);

      // Extract published date
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);

      videos.push({
        videoId: videoIdMatch[1],
        title: titleMatch ? titleMatch[1] : "Untitled",
        description: "",
        publishedAt: publishedMatch ? publishedMatch[1] : null,
      });
    }

    return videos;
  } catch (error) {
    console.error("Error fetching channel videos:", error.message);
    return [];
  }
}

async function getTranscript(videoId) {
  try {
    const res = await fetch("https://www.youtube-transcript.io/api/transcripts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${TRANSCRIPT_API_KEY}`,
      },
      body: JSON.stringify({ ids: [videoId] }),
    });

    if (!res.ok) {
      console.log(` [API ${res.status}]`);
      return null;
    }

    const data = await res.json();
    if (!data || !data[0] || !data[0].text) return null;

    return data[0].text;
  } catch (error) {
    return null;
  }
}

async function generateSummary(title, transcript) {
  const content = transcript.length > 15000 ? transcript.slice(0, 15000) : transcript;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert at summarizing educational YouTube videos. Create a comprehensive summary that captures key insights, actionable advice, and main concepts. Format with clear sections.",
      },
      {
        role: "user",
        content: `Summarize this video titled "${title}":\n\n${content}`,
      },
    ],
    max_tokens: 1500,
  });

  return response.choices[0].message.content;
}

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

async function checkExists(url) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", url)
    .single();
  return !!data;
}

async function saveDocument(doc) {
  const embedding = await generateEmbedding(doc.content);

  const { error } = await supabase.from("knowledge_base").insert({
    user_id: USER_ID,
    title: doc.title,
    content: doc.content,
    source_url: doc.url,
    source: "youtube",
    category: doc.category,
    tags: [doc.channel, "video"],
    embedding,
  });

  if (error) throw error;
}

// ===================== MAIN =====================
async function importChannel(channel) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📺 ${channel.name} (${channel.category})`);
  console.log(`${"=".repeat(60)}`);

  const videos = await getChannelVideos(channel.id, channel.videos);
  if (videos.length === 0) {
    console.log("❌ No videos found");
    return { imported: 0, skipped: 0, failed: 0 };
  }

  console.log(`Found ${videos.length} videos\n`);

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const url = `https://youtube.com/watch?v=${video.videoId}`;

    process.stdout.write(`  [${i + 1}/${videos.length}] ${video.title.slice(0, 45)}...`);

    // Check exists
    if (await checkExists(url)) {
      console.log(" SKIP (exists)");
      skipped++;
      continue;
    }

    // Get transcript
    const transcript = await getTranscript(video.videoId);
    if (!transcript) {
      console.log(" SKIP (no transcript)");
      failed++;
      continue;
    }

    try {
      // Generate summary
      const summary = await generateSummary(video.title, transcript);

      // Save
      await saveDocument({
        title: video.title,
        content: summary,
        url,
        category: channel.category,
        channel: channel.name,
      });

      console.log(" ✓ IMPORTED");
      imported++;
    } catch (error) {
      console.log(` ✗ ERROR: ${error.message}`);
      failed++;
    }

    // Rate limit
    await sleep(1500);
  }

  console.log(`\n📊 Results: ${imported} imported, ${skipped} skipped, ${failed} failed`);
  return { imported, skipped, failed };
}

async function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.log("Usage:");
    console.log("  node scripts/import-channel-v2.cjs 0       # Import first channel");
    console.log("  node scripts/import-channel-v2.cjs 1       # Import second channel");
    console.log("  node scripts/import-channel-v2.cjs all     # Import all channels");
    console.log("\nChannels:");
    CHANNELS.forEach((c, i) => console.log(`  ${i}: ${c.name} (${c.videos} videos)`));
    return;
  }

  // Count current docs
  const { count } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true })
    .eq("user_id", USER_ID);
  console.log(`\n📚 Current Brain: ${count} documents`);

  if (arg === "all") {
    let total = { imported: 0, skipped: 0, failed: 0 };
    for (const channel of CHANNELS) {
      const result = await importChannel(channel);
      total.imported += result.imported;
      total.skipped += result.skipped;
      total.failed += result.failed;
      await sleep(2000);
    }
    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `🎯 TOTAL: ${total.imported} imported, ${total.skipped} skipped, ${total.failed} failed`
    );
  } else {
    const idx = parseInt(arg);
    if (isNaN(idx) || idx < 0 || idx >= CHANNELS.length) {
      console.log(`Invalid index. Use 0-${CHANNELS.length - 1}`);
      return;
    }
    await importChannel(CHANNELS[idx]);
  }

  // Final count
  const { count: finalCount } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true })
    .eq("user_id", USER_ID);
  console.log(`\n📚 Final Brain: ${finalCount} documents`);
}

main().catch(console.error);
