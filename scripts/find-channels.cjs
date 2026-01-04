/**
 * Find Channel IDs for AI Automation & Productivity channels
 */

const { Innertube } = require("youtubei.js");

async function getChannelInfo(handle) {
  try {
    const yt = await Innertube.create();
    const channel = await yt.resolveURL("https://www.youtube.com/" + handle);
    if (channel?.payload?.browseId) {
      return { handle, id: channel.payload.browseId };
    }
    return { handle, error: "No browseId found" };
  } catch (e) {
    return { handle, error: e.message };
  }
}

async function main() {
  const handles = [
    // P0 - AI AUTOMATION MASTERS
    "@LiamOttley", // AI Automation Agency
    "@AIJason_", // AI Jason - practical AI
    "@maboroshi", // Matt Wolfe / Future Tools
    "@SkillLeapAI", // Skill Leap AI

    // P0 - PRODUCTIVITY & OFFICE
    "@ThomasFrankExplains", // Notion, productivity
    "@aliabdaal", // Doctor productivity guru
    "@keepproductive", // Tool reviews
    "@TiagoForte", // Building a Second Brain

    // P0 - MARKETING & SALES
    "@AlexHormozi", // Sales psychology + AI
    "@PatFlynn", // Online business automation
  ];

  console.log("🔍 Finding Channel IDs for ELON STRATEGY...\n");

  const results = [];
  for (const h of handles) {
    const info = await getChannelInfo(h);
    if (info.id) {
      console.log(`✅ ${h} => ${info.id}`);
      results.push(info);
    } else {
      console.log(`❌ ${h} => ${info.error}`);
    }
  }

  console.log("\n📋 Copy-paste ready:\n");
  for (const r of results) {
    const name = r.handle.replace("@", "");
    console.log(`  { name: "${name}", id: "${r.id}", category: "ai-automation", videos: 10 },`);
  }
}

main().catch(console.error);
