/**
 * Import 1 channel at a time - ELON STYLE: Simple, Fast, Reliable
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const { google } = require("googleapis");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

// Get channel from command line
const CHANNEL_INDEX = parseInt(process.argv[2] || "0");

const CHANNELS = [
  {
    name: "Improvement Pill",
    id: "UCBIt1VN5j37PVM8LLSuTTlw",
    category: "self-improvement",
    videos: 12,
  },
  { name: "Better Ideas", id: "UCtUId5WFnN82GdDy7DgaQ7w", category: "productivity", videos: 12 },
  {
    name: "Freedom in Thought",
    id: "UCd6Za0CXVldhY8fK8eYoIuw",
    category: "philosophy",
    videos: 12,
  },
  { name: "Aperture", id: "UCO5QSoES5yn2Dw7YixDYT5Q", category: "philosophy", videos: 12 },
  { name: "Valuetainment", id: "UCIHdDJ0tjn_3j-FS7s_X1kQ", category: "business", videos: 12 },
  { name: "AI Explained", id: "UCNJ1Ymd5yFuUPtn21xtRbbw", category: "ai", videos: 12 },
  { name: "Bycloud", id: "UCgfe2ooZD3VJPB6aJAnuQng", category: "ai", videos: 10 },
  { name: "Humphrey Yang", id: "UCFCEuCsyWP0YkP3CZ3Mr01Q", category: "finance", videos: 12 },
];

const channel = CHANNELS[CHANNEL_INDEX];
if (!channel) {
  console.log("Usage: node import-single-channel.cjs [0-7]");
  console.log("\nChannels:");
  CHANNELS.forEach((c, i) => console.log(`  ${i}: ${c.name}`));
  process.exit(1);
}

const TRANSCRIPT_API_KEY = "6958bebf4ffea701a5bd35d6";
const USER_ID = "default-longsang-user";

// Init clients
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET
);
oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN,
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});
const youtube = google.youtube({ version: "v3", auth: oauth2Client });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTopVideos() {
  const res = await youtube.search.list({
    part: "snippet",
    channelId: channel.id,
    maxResults: channel.videos,
    order: "viewCount",
    type: "video",
    videoDuration: "medium",
  });

  if (!res.data.items?.length) return [];

  const videoIds = res.data.items.map((v) => v.id.videoId).join(",");
  const details = await youtube.videos.list({ part: "statistics,contentDetails", id: videoIds });

  return res.data.items
    .map((v, i) => ({
      id: v.id.videoId,
      title: v.snippet.title,
      views: parseInt(details.data.items[i]?.statistics?.viewCount || 0),
      duration: details.data.items[i]?.contentDetails?.duration,
    }))
    .filter((v) => v.views > 50000);
}

async function fetchTranscript(videoId) {
  // Method 1: Try YouTube official captions API
  try {
    const captionsRes = await youtube.captions.list({
      part: "snippet",
      videoId: videoId,
    });

    if (captionsRes.data.items?.length > 0) {
      // Find English caption
      const enCaption =
        captionsRes.data.items.find(
          (c) => c.snippet.language === "en" || c.snippet.language === "en-US"
        ) || captionsRes.data.items[0];

      if (enCaption) {
        try {
          const downloadRes = await youtube.captions.download({
            id: enCaption.id,
            tfmt: "srt",
          });
          if (downloadRes.data) {
            // Parse SRT format
            const text = downloadRes.data
              .replace(/\d+\n[\d:,]+ --> [\d:,]+\n/g, "")
              .replace(/\n+/g, " ");
            return text.substring(0, 15000);
          }
        } catch (e) {
          // Caption download often requires video owner permission
        }
      }
    }
  } catch (e) {
    // Captions API might not be available
  }

  // Method 2: Try youtubetranscript.com
  try {
    const res = await axios.get(`https://youtubetranscript.com/?server_vid2=${videoId}`, {
      headers: { Authorization: `Basic ${TRANSCRIPT_API_KEY}` },
      timeout: 25000,
    });
    if (res.data && Array.isArray(res.data)) {
      return res.data
        .map((s) => s.text)
        .join(" ")
        .substring(0, 15000);
    }
  } catch (e) {
    // API might be blocked
  }

  // Method 3: Try alternative transcript service
  try {
    const res = await axios.get(
      `https://yt.lemnoslife.com/noKey/captions?videoId=${videoId}&lang=en`,
      {
        timeout: 20000,
      }
    );
    if (res.data?.captions) {
      return res.data.captions
        .map((c) => c.text)
        .join(" ")
        .substring(0, 15000);
    }
  } catch (e) {
    // Alternative also failed
  }

  return null;
}

async function generateSummary(title, content) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Summarize this video in 2-3 sentences. Focus on key insights.",
          },
          { role: "user", content: `Title: ${title}\n\nContent: ${content.substring(0, 8000)}` },
        ],
        max_tokens: 200,
        temperature: 0.3,
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        timeout: 30000,
      }
    );
    return res.data.choices[0].message.content;
  } catch (e) {
    console.log(`    Summary error: ${e.message}`);
    return title;
  }
}

async function generateEmbedding(text) {
  const res = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      model: "text-embedding-3-small",
      input: text.substring(0, 8000),
    },
    {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      timeout: 20000,
    }
  );
  return res.data.data[0].embedding;
}

async function main() {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`IMPORTING: ${channel.name} [${channel.category}]`);
  console.log(`${"=".repeat(50)}\n`);

  const videos = await getTopVideos();
  console.log(`Found ${videos.length} videos\n`);

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    console.log(`[${i + 1}/${videos.length}] ${v.title.substring(0, 40)}...`);
    console.log(`    ${v.views.toLocaleString()} views`);

    // Check if exists
    const { data: existing } = await supabase
      .from("knowledge_base")
      .select("id")
      .eq("source_url", `https://youtube.com/watch?v=${v.id}`)
      .single();

    if (existing) {
      console.log(`    SKIP (exists)`);
      skipped++;
      continue;
    }

    // Fetch transcript
    const transcript = await fetchTranscript(v.id);
    if (!transcript) {
      console.log(`    SKIP (no transcript)`);
      failed++;
      continue;
    }
    console.log(`    Transcript: ${transcript.length} chars`);

    // Generate summary
    const summary = await generateSummary(v.title, transcript);
    console.log(`    Summary OK`);

    // Generate embedding
    const embedding = await generateEmbedding(`${v.title} ${summary}`);
    console.log(`    Embedding OK`);

    // Save
    const { error } = await supabase.from("knowledge_base").insert({
      title: v.title,
      content: transcript,
      summary,
      source: `YouTube - ${channel.name}`,
      source_url: `https://youtube.com/watch?v=${v.id}`,
      tags: [channel.category, "youtube", channel.name.toLowerCase().replace(/\s+/g, "-")],
      embedding,
      user_id: USER_ID,
      category: channel.category,
      importance: v.views > 1000000 ? "high" : "medium",
      is_public: true,
      is_active: true,
    });

    if (error) {
      console.log(`    SAVE ERROR: ${error.message}`);
      failed++;
    } else {
      console.log(`    SAVED!`);
      imported++;
    }

    await sleep(2000);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`DONE: ${channel.name}`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch(console.error);
