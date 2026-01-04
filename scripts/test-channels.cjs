/**
 * Test YouTube channel IDs before importing
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET
);
oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN,
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({ version: "v3", auth: oauth2Client });

const channels = [
  // Already working from previous test
  { name: "Improvement Pill", id: "UCBIt1VN5j37PVM8LLSuTTlw", category: "self-improvement" },
  { name: "Better Ideas", id: "UCtUId5WFnN82GdDy7DgaQ7w", category: "productivity" },
  { name: "Freedom in Thought", id: "UCd6Za0CXVldhY8fK8eYoIuw", category: "philosophy" },
  { name: "Valuetainment", id: "UCIHdDJ0tjn_3j-FS7s_X1kQ", category: "business" },

  // New channels to test - Psychology & Philosophy
  { name: "After Skool", id: "UC1KmNKYC1l0AyVcKHiG04CA", category: "psychology" },
  { name: "Pursuit of Wonder", id: "UCp3Lx1qItLxD4oBfFP3uaKQ", category: "philosophy" },
  { name: "Aperture", id: "UCO5QSoES5yn2Dw7YixDYT5Q", category: "science" },

  // AI & Tech
  { name: "AI Explained", id: "UCNJ1Ymd5yFuUPtn21xtRbbw", category: "ai" },
  { name: "Bycloud", id: "UCgfe2ooZD3VJPB6aJAnuQng", category: "ai" },

  // Business & Marketing
  { name: "Simon Squibb", id: "UCYtazsGC6QBY1FNp8JBw1-A", category: "business" },
  { name: "Dan Koe", id: "UCOjrN1_-zw4RkU9BEwPKnLQ", category: "business" },

  // Finance
  { name: "Humphrey Yang", id: "UCFCEuCsyWP0YkP3CZ3Mr01Q", category: "finance" },
  { name: "Nate O'Brien", id: "UCaebpjYTk8ytgL4xXw_TOUA", category: "finance" },
];

async function testChannels() {
  console.log("=".repeat(60));
  console.log("TESTING YOUTUBE CHANNEL IDS");
  console.log("=".repeat(60));

  const results = [];

  for (const ch of channels) {
    process.stdout.write(`\n[${ch.category}] ${ch.name}... `);

    try {
      const res = await youtube.search.list({
        part: "snippet",
        channelId: ch.id,
        maxResults: 3,
        order: "viewCount",
        type: "video",
        videoDuration: "medium", // 4-20 min
      });

      const count = res.data.items?.length || 0;

      if (count > 0) {
        console.log(`OK (${count} videos)`);
        console.log(`  Top: "${res.data.items[0].snippet.title.substring(0, 50)}..."`);
        results.push({ ...ch, status: "OK", videos: count });
      } else {
        console.log("NO VIDEOS");
        results.push({ ...ch, status: "NO_VIDEOS", videos: 0 });
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      results.push({ ...ch, status: "ERROR", error: e.message });
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  const working = results.filter((r) => r.status === "OK");
  const failed = results.filter((r) => r.status !== "OK");

  console.log(`\nWorking channels (${working.length}):`);
  working.forEach((ch) => console.log(`  - ${ch.name} [${ch.category}]`));

  if (failed.length > 0) {
    console.log(`\nFailed channels (${failed.length}):`);
    failed.forEach((ch) => console.log(`  - ${ch.name}: ${ch.status}`));
  }

  // Output config for working channels
  console.log("\n" + "=".repeat(60));
  console.log("CONFIG FOR IMPORT SCRIPT:");
  console.log("=".repeat(60));

  working.forEach((ch) => {
    console.log(`{
  name: "${ch.name}",
  id: "${ch.id}",
  videosToImport: 10,
  minDuration: "PT6M",
  category: "${ch.category}",
},`);
  });
}

testChannels().catch(console.error);
