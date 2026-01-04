/**
 * RESTORE HEALTH/NUTRITION/PSYCHOLOGY KNOWLEDGE
 * Script này khôi phục lại các kiến thức đã bị xóa
 */

const config = require("./_config.cjs");
const { YoutubeTranscript } = require("youtube-transcript");

config.validate(["SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]);

const USER_ID = config.DEFAULT_USER_ID;
const supabase = config.getSupabaseClient();
const openai = config.getOpenAIClient();

// Các channels HEALTH cần khôi phục
const HEALTH_CHANNELS = [
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
];

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

      videos.push({
        videoId: videoIdMatch[1],
        title: titleMatch ? titleMatch[1] : "Untitled",
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
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    if (!transcriptItems || transcriptItems.length === 0) {
      // Try Vietnamese
      const viTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "vi" });
      if (viTranscript && viTranscript.length > 0) {
        return viTranscript.map((item) => item.text).join(" ");
      }
      return null;
    }
    return transcriptItems.map((item) => item.text).join(" ");
  } catch (err) {
    return null;
  }
}

async function generateSummary(title, content, category) {
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

async function saveDocument(doc) {
  const embedding = await generateEmbedding(doc.content);
  if (!embedding) return false;

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

  if (error) {
    console.error(`  ❌ Save error: ${error.message}`);
    return false;
  }
  return true;
}

async function processChannel(channel, index) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📺 [${index + 1}/${HEALTH_CHANNELS.length}] ${channel.name}`);
  console.log(`   Category: ${channel.category}`);
  console.log(`${"=".repeat(60)}`);

  const videos = await getChannelVideos(channel.id, channel.videos);
  console.log(`📋 Found ${videos.length} videos`);

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const shortTitle = video.title.slice(0, 40);
    process.stdout.write(`  [${i + 1}/${videos.length}] ${shortTitle}...`);

    // Check exists
    const exists = await checkVideoExists(video.videoId);
    if (exists) {
      console.log(` SKIP (exists)`);
      skipped++;
      continue;
    }

    // Get transcript
    const transcript = await getTranscript(video.videoId);
    if (!transcript || transcript.length < 100) {
      console.log(` SKIP (no transcript)`);
      failed++;
      continue;
    }

    // Generate summary
    const summary = await generateSummary(video.title, transcript, channel.category);
    if (!summary) {
      console.log(` FAIL (summary)`);
      failed++;
      continue;
    }

    // Save
    const saved = await saveDocument({
      title: video.title,
      content: summary,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      category: channel.category,
      channel: channel.name,
    });

    if (saved) {
      console.log(` ✅ IMPORTED`);
      imported++;
    } else {
      console.log(` FAIL (save)`);
      failed++;
    }

    await sleep(1000); // Rate limit
  }

  console.log(`\n📊 Results: ${imported} imported, ${skipped} skipped, ${failed} failed`);
  return { imported, skipped, failed };
}

async function main() {
  console.log("🏥 RESTORE HEALTH KNOWLEDGE");
  console.log("============================");

  // Get current count
  const { count: before } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true });
  console.log(`📚 Current Brain: ${before} documents\n`);

  let totalImported = 0,
    totalSkipped = 0,
    totalFailed = 0;

  // Process specific channel or all
  const arg = process.argv[2];

  if (arg === "all") {
    for (let i = 0; i < HEALTH_CHANNELS.length; i++) {
      const result = await processChannel(HEALTH_CHANNELS[i], i);
      totalImported += result.imported;
      totalSkipped += result.skipped;
      totalFailed += result.failed;
    }
  } else {
    const idx = parseInt(arg) || 0;
    if (idx >= 0 && idx < HEALTH_CHANNELS.length) {
      const result = await processChannel(HEALTH_CHANNELS[idx], idx);
      totalImported += result.imported;
      totalSkipped += result.skipped;
      totalFailed += result.failed;
    } else {
      console.log("Usage: node scripts/restore-health-knowledge.cjs [0-7|all]");
      console.log("\nChannels:");
      HEALTH_CHANNELS.forEach((ch, i) => console.log(`  ${i}: ${ch.name} (${ch.category})`));
      return;
    }
  }

  // Final count
  const { count: after } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true });

  console.log("\n" + "=".repeat(60));
  console.log("🏁 FINAL RESULTS");
  console.log("=".repeat(60));
  console.log(
    `📊 Total: ${totalImported} imported, ${totalSkipped} skipped, ${totalFailed} failed`
  );
  console.log(`📚 Brain: ${before} → ${after} documents (+${after - before})`);
}

main().catch(console.error);
