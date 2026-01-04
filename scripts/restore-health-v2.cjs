/**
 * RESTORE HEALTH KNOWLEDGE - Using FREE youtube-transcript package
 * Khôi phục kiến thức health/nutrition/psychology đã bị xóa
 */

const config = require("./_config.cjs");
const { YoutubeTranscript } = require("youtube-transcript");

config.validate(["SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]);

const USER_ID = config.DEFAULT_USER_ID;
const supabase = config.getSupabaseClient();
const openai = config.getOpenAIClient();

// HEALTH CHANNELS cần khôi phục
const CHANNELS = [
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
  { name: "HealthyGamerGG", id: "UClHVl2N3jPEbkNJVx-ItQIQ", category: "mental-health", videos: 10 },
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getChannelVideos(channelId, max = 10) {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const xml = await res.text();
    const videos = [];
    const entries = xml.split("<entry>").slice(1);
    for (let i = 0; i < Math.min(entries.length, max); i++) {
      const entry = entries[i];
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
      if (videoId) videos.push({ videoId, title: title || "Untitled" });
    }
    return videos;
  } catch (e) {
    console.error(`Error: ${e.message}`);
    return [];
  }
}

async function getTranscript(videoId) {
  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    if (items?.length) return items.map((i) => i.text).join(" ");
    const vi = await YoutubeTranscript.fetchTranscript(videoId, { lang: "vi" });
    if (vi?.length) return vi.map((i) => i.text).join(" ");
    return null;
  } catch {
    return null;
  }
}

async function generateSummary(title, content) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Tóm tắt tiếng Việt, giữ thuật ngữ chuyên môn. Nêu rõ điểm chính, lời khuyên, cảnh báo.",
      },
      { role: "user", content: `Tóm tắt video "${title}":\n\n${content.slice(0, 12000)}` },
    ],
    max_tokens: 800,
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

async function videoExists(videoId) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("source_url", `https://www.youtube.com/watch?v=${videoId}`)
    .single();
  return !!data;
}

async function processChannel(channel, idx) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📺 [${idx + 1}/${CHANNELS.length}] ${channel.name} (${channel.category})`);
  console.log("=".repeat(50));

  const videos = await getChannelVideos(channel.id, channel.videos);
  console.log(`Found ${videos.length} videos`);

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    process.stdout.write(`[${i + 1}/${videos.length}] ${v.title.slice(0, 35)}... `);

    if (await videoExists(v.videoId)) {
      console.log("SKIP");
      skipped++;
      continue;
    }

    const transcript = await getTranscript(v.videoId);
    if (!transcript || transcript.length < 100) {
      console.log("NO TRANSCRIPT");
      failed++;
      continue;
    }

    const summary = await generateSummary(v.title, transcript);
    const textForEmbed = `${v.title}\n\n${summary}`;
    const embedding = await generateEmbedding(textForEmbed);

    const { error } = await supabase.from("knowledge_base").insert({
      user_id: USER_ID,
      title: `[${channel.name}] ${v.title}`,
      content: summary,
      source_url: `https://www.youtube.com/watch?v=${v.videoId}`,
      source: "youtube",
      category: channel.category,
      tags: [channel.category, "health", channel.name.toLowerCase().replace(/\s+/g, "-")],
      embedding,
    });

    if (error) {
      console.log(`ERROR: ${error.message}`);
      failed++;
    } else {
      console.log("✅ IMPORTED");
      imported++;
    }

    await sleep(1500);
  }

  console.log(`\n📊 ${channel.name}: ✅${imported} ⏭️${skipped} ❌${failed}`);
  return { imported, skipped, failed };
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.log("Usage: node scripts/restore-health-v2.cjs [0-7|all]");
    CHANNELS.forEach((c, i) => console.log(`  ${i}: ${c.name} (${c.category})`));
    return;
  }

  const { count: before } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true });
  console.log(`📚 Brain: ${before} documents\n`);

  let total = { imported: 0, skipped: 0, failed: 0 };

  if (arg === "all") {
    for (let i = 0; i < CHANNELS.length; i++) {
      const r = await processChannel(CHANNELS[i], i);
      total.imported += r.imported;
      total.skipped += r.skipped;
      total.failed += r.failed;
      if (i < CHANNELS.length - 1) await sleep(3000);
    }
  } else {
    const idx = parseInt(arg);
    if (idx >= 0 && idx < CHANNELS.length) {
      const r = await processChannel(CHANNELS[idx], idx);
      total = r;
    }
  }

  const { count: after } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true });
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🏁 DONE: ✅${total.imported} ⏭️${total.skipped} ❌${total.failed}`);
  console.log(`📚 Brain: ${before} → ${after} (+${after - before})`);
}

main().catch(console.error);
