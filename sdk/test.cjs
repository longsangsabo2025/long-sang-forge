// Test Brain SDK
const LongSangBrain = require("./longsang-brain-sdk.cjs");

async function test() {
  console.log("=== TEST BRAIN SDK ===\n");

  const brain = new LongSangBrain();

  // Test 1: Ask
  console.log("1. Testing ask()...");
  const response = await brain.ask("Long Sang la ai?");
  console.log("   Answer:", response.answer.substring(0, 150) + "...");
  console.log("   Intent:", response.intent);

  // Test 2: Conversation memory
  console.log("\n2. Testing conversation memory...");
  const response2 = await brain.ask("Anh ay co the lam gi?");
  console.log("   Answer:", response2.answer.substring(0, 150) + "...");

  // Test 3: Categories
  console.log("\n3. Testing getCategories()...");
  const cats = await brain.getCategories();
  console.log("   Categories:", cats.slice(0, 5));

  console.log("\n=== ALL TESTS PASSED ===");
}

test().catch((e) => console.error("Error:", e.message));
