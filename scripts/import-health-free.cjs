/**
 * BRAIN KNOWLEDGE IMPORT - Sử dụng youtube-transcript (FREE, không giới hạn)
 *
 * Cách dùng:
 *   node scripts/import-health-free.cjs 0       # Import channel đầu tiên
 *   node scripts/import-health-free.cjs 1       # Import channel thứ 2
 */

const config = require("./_config.cjs");
const { YoutubeTranscript } = require("youtube-transcript");

config.validate(["SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]);

const USER_ID = config.DEFAULT_USER_ID;
const supabase = config.getSupabaseClient();
const openai = config.getOpenAIClient();

// ===================== CHANNELS =====================
const CHANNELS = [
  // HEALTH & NUTRITION
  {
    name: "Dr. Eric Berg DC",
    id: "UC3w193M5tYPJqF0Hi-7U-2g",
    category: "health-nutrition",
    videos: 15,
  },
  {
    name: "Thomas DeLauer",
    id: "UC70SrI3VkT1MXALRtf0pcHg",
    category: "health-nutrition",
    videos: 15,
  },
  {
    name: "Dr. Sten Ekberg",
    id: "UCIe2pR6PE0dae9BunJ38F7w",
    category: "health-nutrition",
    videos: 15,
  },

  // MENTAL HEALTH & PSYCHOLOGY
  { name: "HealthyGamerGG", id: "UClHVl2N3jPEbkNJVx-ItQIQ", category: "mental-health", videos: 15 },
  {
    name: "The School of Life",
    id: "UC7IcJI8PUf5Z3zKxnZvTBog",
    category: "psychology",
    videos: 15,
  },
  {
    name: "Academy of Ideas",
    id: "UCiRiQGCHGjDLT9FQXFW0I3A",
    category: "psychology-philosophy",
    videos: 15,
  },

  // NEUROSCIENCE & WELLNESS
  {
    name: "Andrew Huberman",
    id: "UC2D2CMWXMOVWx7giW1n3LIg",
    category: "neuroscience-health",
    videos: 10,
  },
  {
    name: "After Skool",
    id: "UC1KmNKYC1l0L7r6E2q5-s7A",
    category: "psychology-education",
    videos: 15,
  },

  // PRODUCTIVITY & SELF-IMPROVEMENT
  {
    name: "Ali Abdaal",
    id: "UCoOae5nYA7VqaXzerajD0lg",
    category: "productivity-wellness",
    videos: 12,
  },
  {
    name: "Pursuit of Wonder",
    id: "UCgA2Xnz9nSQ4OGAykvlhBuQ",
    category: "philosophy-mindfulness",
    videos: 12,
  },
];

// ===================== HELPERS =====================
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getChannelVideos(channelId, maxResults = 10) {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(rssUrl);
    const text = await response.text();

    const videoIds = [];
    const titles = [];

    const idMatches = text.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g);
    const titleMatches = text.matchAll(/<media:title>([^<]+)<\/media:title>/g);

    for (const match of idMatches) {
      videoIds.push(match[1]);
    }
    for (const match of titleMatches) {
      titles.push(match[1]);
    }

    return videoIds.slice(0, maxResults).map((id, i) => ({
      videoId: id,
      title: titles[i] || `Video ${i + 1}`,
    }));
  } catch (error) {
    console.error(`❌ Cannot fetch channel: ${error.message}`);
    return [];
  }
}

async function getTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) return null;

    return transcript.map((t) => t.text).join(" ");
  } catch (error) {
    return null;
  }
}

async function generateSummary(title, transcript) {
  try {
    const truncated = transcript.slice(0, 12000);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Bạn là chuyên gia tóm tắt nội dung về sức khỏe, dinh dưỡng, tâm lý.
Tóm tắt video bằng tiếng Việt, ngắn gọn, dễ hiểu.
Format:
## [Tiêu đề video]
### Ý chính
- Điểm 1
- Điểm 2
### Lời khuyên thực hành
- Gợi ý áp dụng`,
        },
        {
          role: "user",
          content: `Tóm tắt video "${title}":\n\n${truncated}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`  ❌ Summary error: ${error.message}`);
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
    console.error(`  ❌ Embedding error: ${error.message}`);
    return null;
  }
}

async function checkExists(videoId) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", `https://youtube.com/watch?v=${videoId}`)
    .maybeSingle();
  return !!data;
}

async function saveToKnowledgeBase(doc) {
  const { data, error } = await supabase.from("knowledge_base").insert(doc).select("id").single();

  if (error) {
    console.error(`  ❌ DB error: ${error.message}`);
    return null;
  }
  return data.id;
}

async function importChannel(channelIndex) {
  const channel = CHANNELS[channelIndex];
  if (!channel) {
    console.error(`❌ Channel ${channelIndex} không tồn tại`);
    return { imported: 0, skipped: 0, failed: 0 };
  }

  console.log(`\n🎬 IMPORTING: ${channel.name} (${channel.category})`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const videos = await getChannelVideos(channel.id, channel.videos);
  console.log(`📹 Found ${videos.length} videos\n`);

  if (videos.length === 0) return { imported: 0, skipped: 0, failed: 0 };

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const shortTitle = video.title.length > 40 ? video.title.slice(0, 40) + "..." : video.title;
    console.log(`[${i + 1}/${videos.length}] ${shortTitle}`);

    // Check exists
    if (await checkExists(video.videoId)) {
      console.log(`  ⏭️ Already exists`);
      skipped++;
      continue;
    }

    // Get transcript
    console.log(`  📝 Getting transcript...`);
    const transcript = await getTranscript(video.videoId);
    if (!transcript) {
      console.log(`  ❌ No transcript available`);
      failed++;
      await sleep(500);
      continue;
    }

    // Generate summary
    console.log(`  📚 Generating summary...`);
    const summary = await generateSummary(video.title, transcript);
    if (!summary) {
      failed++;
      continue;
    }

    // Generate embedding
    console.log(`  🔢 Generating embedding...`);
    const embedding = await generateEmbedding(summary);
    if (!embedding) {
      failed++;
      continue;
    }

    // Save to DB
    console.log(`  💾 Saving to Brain...`);
    const doc = {
      title: video.title,
      content: summary,
      category: channel.category,
      source: "youtube",
      source_url: `https://youtube.com/watch?v=${video.videoId}`,
      embedding,
      metadata: {
        channel: channel.name,
        videoId: video.videoId,
        importedAt: new Date().toISOString(),
      },
      user_id: USER_ID,
      is_public: true,
    };

    const id = await saveToKnowledgeBase(doc);
    if (id) {
      console.log(`  ✅ SAVED!`);
      imported++;
    } else {
      failed++;
    }

    // Rate limit
    await sleep(1500);
  }

  console.log(`\n📊 Channel ${channel.name} results:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️ Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);

  return { imported, skipped, failed };
}

// ===================== MAIN =====================
async function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.log("Usage:");
    console.log("  node scripts/import-health-free.cjs <channel_index>");
    console.log("  node scripts/import-health-free.cjs all");
    console.log("\nChannels:");
    CHANNELS.forEach((ch, i) => console.log(`  ${i}: ${ch.name} (${ch.category})`));
    return;
  }

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🧠 BRAIN KNOWLEDGE IMPORT - FREE TRANSCRIPT API");
  console.log("═══════════════════════════════════════════════════════════════");

  let totalImported = 0,
    totalSkipped = 0,
    totalFailed = 0;
  const results = {};

  if (arg === "all") {
    for (let i = 0; i < CHANNELS.length; i++) {
      const result = await importChannel(i);
      results[CHANNELS[i].name] = result;
      totalImported += result.imported;
      totalSkipped += result.skipped;
      totalFailed += result.failed;
      await sleep(3000);
    }
  } else {
    const idx = parseInt(arg);
    if (isNaN(idx) || idx < 0 || idx >= CHANNELS.length) {
      console.error(`Invalid channel index: ${arg}`);
      return;
    }
    const result = await importChannel(idx);
    results[CHANNELS[idx].name] = result;
    totalImported = result.imported;
    totalSkipped = result.skipped;
    totalFailed = result.failed;
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("📊 FINAL SUMMARY");
  console.log("════════════════════════════════════════════════════════════");

  for (const [name, r] of Object.entries(results)) {
    console.log(`${name}: ✅${r.imported} ⏭️${r.skipped} ❌${r.failed}`);
  }

  console.log(`\nTOTAL: ✅${totalImported} ⏭️${totalSkipped} ❌${totalFailed}`);
}

main().catch(console.error);
