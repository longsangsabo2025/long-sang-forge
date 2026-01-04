/**
 * BRAIN KNOWLEDGE IMPORT - Health, Nutrition, Mental Health, Psychology
 *
 * Cách dùng:
 *   node scripts/import-health-channels.cjs 0       # Import channel đầu tiên
 *   node scripts/import-health-channels.cjs 1       # Import channel thứ 2
 *   node scripts/import-health-channels.cjs all     # Import tất cả
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
  // HEALTH & NUTRITION
  {
    name: "Dr. Eric Berg DC",
    id: "UC3w193M5tYPJqF0Hi-7U-2g",
    category: "health-nutrition",
    videos: 10,
  },
  {
    name: "Thomas DeLauer",
    id: "UC70SrI3VkT1MXALRtf0pcHg",
    category: "health-nutrition",
    videos: 10,
  },
  {
    name: "What I've Learned",
    id: "UCqYPhGiB9tkShZsq1r2Ztog",
    category: "health-science",
    videos: 10,
  },

  // MENTAL HEALTH & PSYCHOLOGY
  {
    name: "Therapy in a Nutshell",
    id: "UCpuqYJJCmPYKsYpDuJTjH8Q",
    category: "mental-health",
    videos: 10,
  },
  {
    name: "HealthyGamerGG",
    id: "UClHVl2N3jPEbkNJVx-ItQIQ",
    category: "mental-health",
    videos: 10,
  },
  {
    name: "The School of Life",
    id: "UC7IcJI8PUf5Z3zKxnZvTBog",
    category: "psychology",
    videos: 10,
  },

  // MINDFULNESS & MEDITATION
  {
    name: "Einzelgänger",
    id: "UCqJ1NIdSbiSABy7LTBogHlw",
    category: "philosophy-mindfulness",
    videos: 10,
  },
  {
    name: "Andrew Huberman",
    id: "UC2D2CMWXMOVWx7giW1n3LIg",
    category: "neuroscience-health",
    videos: 8,
  },

  // === THÊM KÊNH MỚI ĐỂ BỔ SUNG ===

  // NUTRITION & FITNESS
  {
    name: "Dr. Sten Ekberg",
    id: "UCIe2pR6PE0dae9BunJ38F7w",
    category: "health-nutrition",
    videos: 12,
  },
  {
    name: "Jeff Nippard",
    id: "UC68TLK0mAEzUyHx5x5k-S1Q",
    category: "fitness-science",
    videos: 10,
  },
  {
    name: "Nutrition Made Simple",
    id: "UCxJKOJgqX6HEyg25DWt3yYQ",
    category: "nutrition-science",
    videos: 10,
  },

  // PSYCHOLOGY & SELF-IMPROVEMENT
  {
    name: "Academy of Ideas",
    id: "UCiRiQGCHGjDLT9FQXFW0I3A",
    category: "psychology-philosophy",
    videos: 12,
  },
  {
    name: "Pursuit of Wonder",
    id: "UCgA2Xnz9nSQ4OGAykvlhBuQ",
    category: "philosophy-mindfulness",
    videos: 10,
  },
  {
    name: "After Skool",
    id: "UC1KmNKYC1l0L7r6E2q5-s7A",
    category: "psychology-education",
    videos: 10,
  },

  // MENTAL HEALTH & WELLNESS
  {
    name: "Med School Insiders",
    id: "UC8LxKPUE7qQ-jGdlM9FEbtw",
    category: "health-education",
    videos: 10,
  },
  {
    name: "Ali Abdaal",
    id: "UCoOae5nYA7VqaXzerajD0lg",
    category: "productivity-wellness",
    videos: 10,
  },
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

    for (let i = 0; i < Math.min(entries.length, maxResults); i++) {
      const entry = entries[i];
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      if (!videoIdMatch) continue;
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);

      videos.push({
        videoId: videoIdMatch[1],
        title: titleMatch ? titleMatch[1] : "Untitled",
        description: "",
        publishedAt: publishedMatch ? publishedMatch[1] : null,
      });
    }

    return videos;
  } catch (err) {
    console.error(`  ❌ Error fetching videos: ${err.message}`);
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
      const text = await res.text();
      throw new Error(`API error: ${res.status} - ${text}`);
    }

    const data = await res.json();

    // API returns array, get first item
    if (data && data.length > 0 && data[0].text) {
      return data[0].text;
    }

    return null;
  } catch (err) {
    console.error(`  ❌ Transcript error: ${err.message}`);
    return null;
  }
}

async function generateSummary(title, content) {
  try {
    const truncated = content.slice(0, 15000);
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Bạn là chuyên gia tóm tắt nội dung về sức khỏe, dinh dưỡng và tâm lý.
Tóm tắt bằng tiếng Việt, đầy đủ các điểm chính về:
- Kiến thức khoa học/y khoa quan trọng
- Lời khuyên thực hành cụ thể
- Cảnh báo hoặc lưu ý (nếu có)
Giữ nguyên thuật ngữ chuyên môn khi cần thiết.`,
        },
        {
          role: "user",
          content: `Tóm tắt video "${title}":\n\n${truncated}`,
        },
      ],
      max_tokens: 1000,
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error(`  ❌ Summary error: ${err.message}`);
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
  } catch (err) {
    console.error(`  ❌ Embedding error: ${err.message}`);
    return null;
  }
}

async function checkVideoExists(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", url)
    .single();
  return !!data;
}

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
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
    tags: [doc.channel, "video", "health"],
    embedding,
  });

  if (error) throw error;
}

// Alias for saveToKnowledgeBase
async function saveToKnowledgeBase(doc) {
  const { error } = await supabase.from("knowledge_base").insert({
    user_id: USER_ID,
    title: doc.title,
    content: doc.summary || doc.content,
    source_url: doc.source_url,
    source: "youtube",
    category: "health",
    tags: doc.tags || [],
    embedding: doc.embedding,
  });

  if (error) throw error;
}

async function processChannel(channel, channelIndex) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📺 CHANNEL ${channelIndex}: ${channel.name}`);
  console.log(`   Category: ${channel.category}`);
  console.log(`${"=".repeat(60)}`);

  const videos = await getChannelVideos(channel.id, channel.videos);
  console.log(`📋 Found ${videos.length} videos`);

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    console.log(`\n[${i + 1}/${videos.length}] ${video.title.slice(0, 50)}...`);

    // Check if exists
    const exists = await checkVideoExists(video.videoId);
    if (exists) {
      console.log(`  ⏭️ Already exists, skipping`);
      skipped++;
      continue;
    }

    // Get transcript
    console.log(`  📝 Getting transcript...`);
    const transcript = await getTranscript(video.videoId);
    if (!transcript || transcript.length < 100) {
      console.log(`  ❌ No transcript available`);
      failed++;
      await sleep(1000);
      continue;
    }
    console.log(`  ✅ Transcript: ${transcript.length} chars`);

    // Generate summary
    console.log(`  🤖 Generating summary...`);
    const summary = await generateSummary(video.title, transcript);
    if (!summary) {
      failed++;
      continue;
    }

    // Generate embedding
    console.log(`  🔢 Generating embedding...`);
    const textForEmbed = `${video.title}\n\n${summary}\n\n${transcript.slice(0, 5000)}`;
    const embedding = await generateEmbedding(textForEmbed);
    if (!embedding) {
      failed++;
      continue;
    }

    // Save
    console.log(`  💾 Saving to Brain...`);
    try {
      await saveToKnowledgeBase({
        title: `[${channel.name}] ${video.title}`,
        content: transcript,
        summary: summary,
        source_url: `https://www.youtube.com/watch?v=${video.videoId}`,
        tags: [
          channel.category,
          "health",
          "youtube",
          channel.name.toLowerCase().replace(/\s+/g, "-"),
        ],
        embedding: embedding,
      });
      console.log(`  ✅ SAVED!`);
      imported++;
    } catch (err) {
      console.log(`  ❌ Save error: ${err.message}`);
      failed++;
    }

    // Rate limit
    await sleep(2000);
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
    console.log("Cách dùng:");
    console.log("  node scripts/import-health-channels.cjs 0    # Channel đầu tiên");
    console.log("  node scripts/import-health-channels.cjs all  # Tất cả channels");
    console.log("\nDanh sách channels:");
    CHANNELS.forEach((c, i) => console.log(`  ${i}: ${c.name} (${c.category})`));
    return;
  }

  console.log("🧠 BRAIN HEALTH KNOWLEDGE IMPORT");
  console.log("================================");

  let results = [];

  if (arg === "all") {
    for (let i = 0; i < CHANNELS.length; i++) {
      const result = await processChannel(CHANNELS[i], i);
      results.push({ channel: CHANNELS[i].name, ...result });
      if (i < CHANNELS.length - 1) {
        console.log("\n⏳ Waiting 5s before next channel...");
        await sleep(5000);
      }
    }
  } else {
    const index = parseInt(arg);
    if (isNaN(index) || index < 0 || index >= CHANNELS.length) {
      console.error(`❌ Invalid index. Use 0-${CHANNELS.length - 1} or 'all'`);
      return;
    }
    const result = await processChannel(CHANNELS[index], index);
    results.push({ channel: CHANNELS[index].name, ...result });
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));
  results.forEach((r) => {
    console.log(`${r.channel}: ✅${r.imported} ⏭️${r.skipped} ❌${r.failed}`);
  });

  const total = results.reduce(
    (acc, r) => ({
      imported: acc.imported + r.imported,
      skipped: acc.skipped + r.skipped,
      failed: acc.failed + r.failed,
    }),
    { imported: 0, skipped: 0, failed: 0 }
  );
  console.log(`\nTOTAL: ✅${total.imported} ⏭️${total.skipped} ❌${total.failed}`);
}

main().catch(console.error);
