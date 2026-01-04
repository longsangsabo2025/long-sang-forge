/**
 * BRAIN KNOWLEDGE IMPORT - V3 (Using FREE youtube-transcript package)
 *
 * ĐÂY LÀ CÁCH MIỄN PHÍ - KHÔNG CẦN API KEY!
 *
 * Cách dùng:
 *   node scripts/import-channel-v3.cjs 0       # Import channel đầu tiên
 *   node scripts/import-channel-v3.cjs 1       # Import channel thứ 2
 *   node scripts/import-channel-v3.cjs all     # Import tất cả
 */

const config = require("./_config.cjs");
const { YoutubeTranscript } = require("youtube-transcript");

// Validate required keys
config.validate(["SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]);

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

  // ========== P1: BUSINESS & ENTREPRENEURSHIP (có captions tốt) ==========
  { name: "Y Combinator", id: "UCcefcZRL2oaA_uBNeo5UOWg", category: "startup-advice", videos: 15 },
  { name: "GaryVee", id: "UCctXZhXmG-kf3tlIXgVZUlw", category: "entrepreneurship", videos: 12 },
  {
    name: "CNBC Make It",
    id: "UCyg3Eh9N7k_niCgK1fvZ76A",
    category: "business-finance",
    videos: 10,
  },

  // ========== P1: HR & BUSINESS OPERATIONS (có captions) ==========
  {
    name: "Harvard Business Review",
    id: "UCPl6CrdUXp7EPNKC2wI_lKg",
    category: "business-management",
    videos: 12,
  },
  { name: "TEDx Talks", id: "UCsT0YIqwnpJCM-mx7-gSA4Q", category: "ted-talks", videos: 15 },

  // ========== VIETNAMESE ==========
  {
    name: "THUẬT TÀI VẬN",
    id: "UCAn8HBIgRP5xh6G6O7A7Fsw",
    category: "vietnamese-finance",
    videos: 15,
  },

  // ========== EDUCATION ==========
  {
    name: "Crash Course",
    id: "UCX6b17PVsYBQ0ip5gyeme-Q",
    category: "educational-content",
    videos: 10,
  },
  { name: "TED-Ed", id: "UCsooa4yRKGN_zEE8iknghZA", category: "education", videos: 10 },
  { name: "Kurzgesagt", id: "UCsXVk37bltHxD1rDPwtNM8Q", category: "science-education", videos: 10 },
  { name: "Veritasium", id: "UCHnyfMqiRRG1u-2MsSQLbXA", category: "science", videos: 10 },
  { name: "3Blue1Brown", id: "UCYO_jab_esuFRV4b17AJtAw", category: "math-education", videos: 10 },
  { name: "Fireship", id: "UCsBjURrPoezykLs9EqgamOA", category: "tech-education", videos: 10 },
];

// ===================== HELPERS =====================
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getChannelVideos(channelId, maxResults = 10) {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl);
    const xml = await res.text();

    const videos = [];
    const entries = xml.split("<entry>").slice(1);

    for (const entry of entries.slice(0, maxResults)) {
      const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);

      if (idMatch && titleMatch) {
        videos.push({
          id: idMatch[1],
          title: titleMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"'),
        });
      }
    }

    return videos;
  } catch (error) {
    console.error(`Error fetching videos: ${error.message}`);
    return [];
  }
}

async function getTranscript(videoId) {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });

    if (!transcriptItems || transcriptItems.length === 0) {
      // Try Vietnamese
      const viTranscript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: "vi",
      });
      if (viTranscript && viTranscript.length > 0) {
        return viTranscript.map((item) => item.text).join(" ");
      }
      return null;
    }

    return transcriptItems.map((item) => item.text).join(" ");
  } catch (error) {
    // Try without language preference
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcriptItems && transcriptItems.length > 0) {
        return transcriptItems.map((item) => item.text).join(" ");
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

async function generateSummary(title, transcript) {
  try {
    const truncatedTranscript = transcript.slice(0, 12000);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a knowledge extraction expert. Create a comprehensive summary that captures ALL key insights, strategies, and actionable advice from this content. Write in the same language as the transcript.`,
        },
        {
          role: "user",
          content: `Title: ${title}\n\nTranscript:\n${truncatedTranscript}\n\nProvide a detailed summary (500-800 words) covering main concepts, strategies, and actionable insights.`,
        },
      ],
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Summary error: ${error.message}`);
    return null;
  }
}

async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error(`Embedding error: ${error.message}`);
    return null;
  }
}

async function checkExists(videoId) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", `https://youtube.com/watch?v=${videoId}`)
    .limit(1);

  return data && data.length > 0;
}

async function saveToKnowledgeBase(videoId, title, summary, category, channelName) {
  const embedding = await generateEmbedding(summary);
  if (!embedding) return false;

  const { error } = await supabase.from("knowledge_base").insert({
    user_id: USER_ID,
    title: title,
    content: summary,
    source_type: "youtube",
    source_url: `https://youtube.com/watch?v=${videoId}`,
    category: category,
    tags: [category, channelName.toLowerCase().replace(/\s+/g, "-"), "youtube"],
    embedding: embedding,
    metadata: {
      channel: channelName,
      videoId: videoId,
      importedAt: new Date().toISOString(),
    },
  });

  return !error;
}

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
    const shortTitle = video.title.slice(0, 40) + (video.title.length > 40 ? "..." : "");

    process.stdout.write(`  [${i + 1}/${videos.length}] ${shortTitle}`);

    // Check if exists
    if (await checkExists(video.id)) {
      console.log(" SKIP (exists)");
      skipped++;
      continue;
    }

    // Get transcript (FREE!)
    const transcript = await getTranscript(video.id);
    if (!transcript) {
      console.log(" SKIP (no transcript)");
      failed++;
      await sleep(1000);
      continue;
    }

    // Generate summary
    const summary = await generateSummary(video.title, transcript);
    if (!summary) {
      console.log(" FAIL (summary)");
      failed++;
      continue;
    }

    // Save to knowledge base
    const saved = await saveToKnowledgeBase(
      video.id,
      video.title,
      summary,
      channel.category,
      channel.name
    );

    if (saved) {
      console.log(" ✓ IMPORTED");
      imported++;
    } else {
      console.log(" FAIL (save)");
      failed++;
    }

    // Rate limit protection
    await sleep(2000);
  }

  console.log(`\n📊 Results: ${imported} imported, ${skipped} skipped, ${failed} failed`);
  return { imported, skipped, failed };
}

async function getCurrentBrainCount() {
  const { count } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

// ===================== MAIN =====================
async function main() {
  const arg = process.argv[2];

  const currentCount = await getCurrentBrainCount();
  console.log(`📚 Current Brain: ${currentCount} documents`);

  if (!arg) {
    console.log("\nUsage:");
    console.log("  node scripts/import-channel-v3.cjs 0     # Import first channel");
    console.log("  node scripts/import-channel-v3.cjs all   # Import all channels");
    console.log("\nAvailable channels:");
    CHANNELS.forEach((ch, i) => console.log(`  ${i}: ${ch.name} (${ch.category})`));
    return;
  }

  if (arg === "all") {
    let totalImported = 0;
    for (const channel of CHANNELS) {
      const result = await importChannel(channel);
      totalImported += result.imported;
      await sleep(3000);
    }
    console.log(`\n🎉 Total imported: ${totalImported} documents`);
  } else {
    const index = parseInt(arg);
    if (isNaN(index) || index < 0 || index >= CHANNELS.length) {
      console.log(`Invalid index. Use 0-${CHANNELS.length - 1}`);
      return;
    }

    await importChannel(CHANNELS[index]);
  }

  const finalCount = await getCurrentBrainCount();
  console.log(`📚 Final Brain: ${finalCount} documents`);
}

main().catch(console.error);
