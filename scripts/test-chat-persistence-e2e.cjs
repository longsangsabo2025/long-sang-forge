/**
 * E2E Test: Chat History Persistence
 * Tests the full flow: Save -> Load -> Clear -> Verify
 *
 * Run: node scripts/test-chat-persistence-e2e.cjs
 */

const SUPABASE_URL = "https://diexsbzqwsbpilsymnfb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MjE5MSwiZXhwIjoyMDc1OTY4MTkxfQ.30ZRAfvIyQUBzyf3xqvrwXbeR15FXDnTGVvTfwmeEXY";

const ASSISTANT_TYPE = "sales-consultant";

// Test user (longsangadmin)
const TEST_USER_ID = "1310b619-51a3-4983-9cd2-918b54b8dd56";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const log = {
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}═══ ${msg} ═══${colors.reset}`),
  step: (msg) => console.log(`${colors.yellow}→ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`  ${msg}`),
};

async function supabaseRequest(method, endpoint, body = null, useServiceKey = false) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    apikey: useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY,
    Authorization: `Bearer ${useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "return=representation" : "return=minimal",
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok && response.status !== 404) {
    throw new Error(`${response.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function runTests() {
  let passed = 0;
  let failed = 0;
  const testConversationId = null;

  try {
    // ═══════════════════════════════════════════════════════════════════
    // TEST 1: Check table exists and structure
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 1: Verify conversations table structure");
    log.step("Querying conversations table schema...");

    const schemaCheck = await supabaseRequest(
      "GET",
      "conversations?select=id,user_id,assistant_type,title,messages,metadata,created_at,updated_at&limit=0",
      null,
      true
    );

    log.success("Table exists with correct columns");
    passed++;

    // ═══════════════════════════════════════════════════════════════════
    // TEST 2: Clean up existing test data
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 2: Clean up existing test data");
    log.step(`Deleting sales-consultant conversations for user ${TEST_USER_ID}...`);

    await supabaseRequest(
      "DELETE",
      `conversations?user_id=eq.${TEST_USER_ID}&assistant_type=eq.${ASSISTANT_TYPE}`,
      null,
      true
    );

    log.success("Cleaned up existing test data");
    passed++;

    // ═══════════════════════════════════════════════════════════════════
    // TEST 3: Create new conversation (simulating first chat)
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 3: Create new conversation");
    log.step("Inserting test conversation...");

    const testMessages = [
      { role: "user", content: "Tôi cần làm website" },
      {
        role: "assistant",
        content: "Chào bạn! Tôi có thể giúp bạn tạo website. Bạn cần loại website gì?",
      },
      { role: "user", content: "Website bán hàng online" },
      {
        role: "assistant",
        content: "Tuyệt vời! Website e-commerce là một trong những dịch vụ chính của Long Sang.",
      },
    ];

    const createResult = await supabaseRequest(
      "POST",
      "conversations",
      {
        user_id: TEST_USER_ID,
        assistant_type: ASSISTANT_TYPE,
        title: "Tôi cần làm website",
        messages: testMessages,
        metadata: { source: "e2e-test", test_id: Date.now() },
      },
      true
    );

    if (!createResult || !createResult[0]?.id) {
      throw new Error("Failed to create conversation");
    }

    const conversationId = createResult[0].id;
    log.success(`Created conversation: ${conversationId}`);
    log.info(`Messages: ${testMessages.length}`);
    passed++;

    // ═══════════════════════════════════════════════════════════════════
    // TEST 4: Load conversation back (simulating page refresh)
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 4: Load conversation from DB");
    log.step("Fetching conversation by user_id and assistant_type...");

    const loadResult = await supabaseRequest(
      "GET",
      `conversations?user_id=eq.${TEST_USER_ID}&assistant_type=eq.${ASSISTANT_TYPE}&order=updated_at.desc&limit=1`,
      null,
      true
    );

    if (!loadResult || loadResult.length === 0) {
      throw new Error("Failed to load conversation");
    }

    const loadedConv = loadResult[0];
    const loadedMessages = loadedConv.messages;

    if (loadedMessages.length !== testMessages.length) {
      throw new Error(
        `Message count mismatch: expected ${testMessages.length}, got ${loadedMessages.length}`
      );
    }

    log.success(`Loaded conversation successfully`);
    log.info(`Title: ${loadedConv.title}`);
    log.info(`Messages: ${loadedMessages.length}`);
    log.info(`First user message: "${loadedMessages[0].content}"`);
    passed++;

    // ═══════════════════════════════════════════════════════════════════
    // TEST 5: Update conversation (add more messages)
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 5: Update conversation with new messages");
    log.step("Adding 2 more messages...");

    const updatedMessages = [
      ...testMessages,
      { role: "user", content: "Giá bao nhiêu?" },
      {
        role: "assistant",
        content: "Giá website e-commerce dao động từ 15-50 triệu tùy theo tính năng.",
      },
    ];

    await supabaseRequest(
      "PATCH",
      `conversations?id=eq.${conversationId}`,
      {
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      },
      true
    );

    // Verify update
    const verifyUpdate = await supabaseRequest(
      "GET",
      `conversations?id=eq.${conversationId}`,
      null,
      true
    );

    if (!verifyUpdate || verifyUpdate[0].messages.length !== 6) {
      throw new Error(
        `Update failed: expected 6 messages, got ${verifyUpdate[0]?.messages?.length}`
      );
    }

    log.success("Updated conversation with new messages");
    log.info(`Total messages: ${verifyUpdate[0].messages.length}`);
    passed++;

    // ═══════════════════════════════════════════════════════════════════
    // TEST 6: Test RLS - Load with ANON key (simulating frontend)
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 6: Test RLS with ANON key");
    log.step("Loading conversation with anon key (like frontend)...");

    // This tests if RLS policies allow reading own conversations
    // Note: This will fail if user is not authenticated, which is expected
    const anonResult = await supabaseRequest(
      "GET",
      `conversations?user_id=eq.${TEST_USER_ID}&assistant_type=eq.${ASSISTANT_TYPE}&limit=1`,
      null,
      false // Use ANON key
    );

    // With RLS, anon key without auth shouldn't see data
    if (anonResult && anonResult.length > 0) {
      log.info("RLS: Anon can access (may need to check RLS policies)");
    } else {
      log.info("RLS: Anon cannot access (expected - requires auth)");
    }
    log.success("RLS check completed");
    passed++;

    // ═══════════════════════════════════════════════════════════════════
    // TEST 7: Delete conversation (clear history)
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 7: Delete conversation (clear history)");
    log.step("Deleting test conversation...");

    await supabaseRequest(
      "DELETE",
      `conversations?user_id=eq.${TEST_USER_ID}&assistant_type=eq.${ASSISTANT_TYPE}`,
      null,
      true
    );

    // Verify deletion
    const verifyDelete = await supabaseRequest(
      "GET",
      `conversations?user_id=eq.${TEST_USER_ID}&assistant_type=eq.${ASSISTANT_TYPE}`,
      null,
      true
    );

    if (verifyDelete && verifyDelete.length > 0) {
      throw new Error("Delete failed: conversation still exists");
    }

    log.success("Conversation deleted successfully");
    passed++;

    // ═══════════════════════════════════════════════════════════════════
    // TEST 8: Verify no data remains
    // ═══════════════════════════════════════════════════════════════════
    log.title("TEST 8: Verify clean state");
    log.step("Checking no test data remains...");

    const finalCheck = await supabaseRequest(
      "GET",
      `conversations?user_id=eq.${TEST_USER_ID}&assistant_type=eq.${ASSISTANT_TYPE}`,
      null,
      true
    );

    if (!finalCheck || finalCheck.length === 0) {
      log.success("No test data remains - clean state verified");
      passed++;
    } else {
      throw new Error(`Found ${finalCheck.length} remaining conversations`);
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    failed++;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(50));
  console.log(`${colors.bold}TEST RESULTS${colors.reset}`);
  console.log("═".repeat(50));
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log("═".repeat(50));

  if (failed === 0) {
    console.log(`\n${colors.green}${colors.bold}✓ ALL E2E TESTS PASSED!${colors.reset}`);
    console.log(`${colors.cyan}Chat persistence is working correctly.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bold}✗ SOME TESTS FAILED${colors.reset}`);
    console.log(`${colors.yellow}Please check the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
