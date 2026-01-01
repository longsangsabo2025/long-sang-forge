/**
 * E2E Test Script for User Workspace Features
 * Tests: Ideas Hub, My Projects, Saved Products, Dashboard
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for testing (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// Test user ID (will be fetched from auth.users)
let TEST_USER_ID: string;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

async function runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
  try {
    const data = await testFn();
    const result = { name, passed: true, data };
    results.push(result);
    log("✅", `${name}`);
    return result;
  } catch (error: any) {
    const result = { name, passed: false, error: error.message };
    results.push(result);
    log("❌", `${name}: ${error.message}`);
    return result;
  }
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 USER WORKSPACE E2E TEST");
  console.log("=".repeat(60) + "\n");

  // ============================================
  // 1. Get Test User from auth.users
  // ============================================
  log("🔐", "Getting test user...");

  const authResult = await runTest("Get test user from auth.users", async () => {
    const { data, error } = await supabase.from("profiles").select("id, email").limit(1).single();
    if (error) {
      // Fallback: try to get any user from auth schema
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      if (!authData.users.length) throw new Error("No users found");
      return { userId: authData.users[0].id, email: authData.users[0].email };
    }
    return { userId: data.id, email: data.email };
  });

  if (!authResult.passed) {
    log("💥", "Cannot get test user. Cannot continue tests.");
    printSummary();
    return;
  }

  TEST_USER_ID = authResult.data.userId;
  const userId = TEST_USER_ID;
  log("👤", `Logged in as: ${authResult.data.email} (${userId})`);

  // ============================================
  // 2. Database Tables Exist
  // ============================================
  console.log("\n📊 Testing Database Tables...");

  await runTest("user_projects table exists", async () => {
    const { error } = await supabase.from("user_projects").select("id").limit(1);
    if (error) throw error;
    return "Table accessible";
  });

  await runTest("user_ideas table exists", async () => {
    const { error } = await supabase.from("user_ideas").select("id").limit(1);
    if (error) throw error;
    return "Table accessible";
  });

  await runTest("project_tasks table exists", async () => {
    const { error } = await supabase.from("project_tasks").select("id").limit(1);
    if (error) throw error;
    return "Table accessible";
  });

  await runTest("saved_products table exists", async () => {
    const { error } = await supabase.from("saved_products").select("id").limit(1);
    if (error) throw error;
    return "Table accessible";
  });

  // ============================================
  // 3. Ideas Hub CRUD
  // ============================================
  console.log("\n💡 Testing Ideas Hub CRUD...");

  let testIdeaId: string | null = null;

  await runTest("CREATE idea", async () => {
    const { data, error } = await supabase
      .from("user_ideas")
      .insert({
        user_id: userId,
        title: "[E2E Test] AI Marketing Bot",
        description: "Automated marketing assistant using GPT-4",
        category: "tech",
        status: "draft",
        priority: "high",
        color: "#10B981",
        is_pinned: false,
        tags: ["ai", "marketing", "automation"],
      })
      .select()
      .single();
    if (error) throw error;
    testIdeaId = data.id;
    return { id: data.id, title: data.title };
  });

  await runTest("READ ideas list", async () => {
    const { data, error } = await supabase
      .from("user_ideas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw error;
    return { count: data.length };
  });

  await runTest("UPDATE idea (pin it)", async () => {
    if (!testIdeaId) throw new Error("No test idea to update");
    const { data, error } = await supabase
      .from("user_ideas")
      .update({
        is_pinned: true,
        status: "in_progress",
      })
      .eq("id", testIdeaId)
      .select()
      .single();
    if (error) throw error;
    return { pinned: data.is_pinned, status: data.status };
  });

  // ============================================
  // 4. My Projects CRUD
  // ============================================
  console.log("\n📁 Testing My Projects CRUD...");

  let testProjectId: string | null = null;

  await runTest("CREATE project", async () => {
    const { data, error } = await supabase
      .from("user_projects")
      .insert({
        user_id: userId,
        name: "[E2E Test] Website Redesign",
        description: "Modernize company website with new branding",
        status: "planning",
        category: "design",
        start_date: "2025-01-01",
        target_date: "2025-03-31",
        budget_estimate: 50000000,
        currency: "VND",
        progress: 0,
        tags: ["design", "web", "branding"],
        is_public: false,
      })
      .select()
      .single();
    if (error) throw error;
    testProjectId = data.id;
    return { id: data.id, name: data.name };
  });

  await runTest("READ projects list", async () => {
    const { data, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw error;
    return { count: data.length };
  });

  await runTest("UPDATE project progress", async () => {
    if (!testProjectId) throw new Error("No test project to update");
    const { data, error } = await supabase
      .from("user_projects")
      .update({
        progress: 25,
        status: "in_progress",
      })
      .eq("id", testProjectId)
      .select()
      .single();
    if (error) throw error;
    return { progress: data.progress, status: data.status };
  });

  // ============================================
  // 5. Project Tasks
  // ============================================
  console.log("\n✅ Testing Project Tasks...");

  let testTaskId: string | null = null;

  await runTest("CREATE task for project", async () => {
    if (!testProjectId) throw new Error("No project for task");
    const { data, error } = await supabase
      .from("project_tasks")
      .insert({
        project_id: testProjectId,
        user_id: userId,
        title: "[E2E Test] Design mockups",
        description: "Create initial design mockups in Figma",
        status: "todo",
        priority: "high",
        due_date: "2025-01-15",
      })
      .select()
      .single();
    if (error) throw error;
    testTaskId = data.id;
    return { id: data.id, title: data.title };
  });

  await runTest("UPDATE task status", async () => {
    if (!testTaskId) throw new Error("No task to update");
    const { data, error } = await supabase
      .from("project_tasks")
      .update({
        status: "in_progress",
      })
      .eq("id", testTaskId)
      .select()
      .single();
    if (error) throw error;
    return { status: data.status };
  });

  // ============================================
  // 6. Saved Products
  // ============================================
  console.log("\n❤️ Testing Saved Products...");

  await runTest("SAVE a product", async () => {
    // First delete if exists to avoid unique constraint
    await supabase
      .from("saved_products")
      .delete()
      .eq("user_id", userId)
      .eq("product_slug", "e2e-test-product");

    const { data, error } = await supabase
      .from("saved_products")
      .insert({
        user_id: userId,
        product_slug: "e2e-test-product",
        product_type: "showcase",
        notes: "Testing bookmark feature",
        tags: ["test", "bookmark"],
      })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, slug: data.product_slug };
  });

  await runTest("LIST saved products", async () => {
    const { data, error } = await supabase
      .from("saved_products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { count: data.length };
  });

  await runTest("UNSAVE product", async () => {
    const { error } = await supabase
      .from("saved_products")
      .delete()
      .eq("user_id", userId)
      .eq("product_slug", "e2e-test-product");
    if (error) throw error;
    return "Product unsaved";
  });

  // ============================================
  // 7. Link Idea to Project
  // ============================================
  console.log("\n🔗 Testing Idea-Project Linking...");

  await runTest("Link idea to project", async () => {
    if (!testIdeaId || !testProjectId) throw new Error("Missing test data");
    const { data, error } = await supabase
      .from("user_ideas")
      .update({ related_project_id: testProjectId })
      .eq("id", testIdeaId)
      .select()
      .single();
    if (error) throw error;
    return { linked: !!data.related_project_id };
  });

  // ============================================
  // 8. Dashboard Stats Query
  // ============================================
  console.log("\n📈 Testing Dashboard Queries...");

  await runTest("Get dashboard stats", async () => {
    const [ideasRes, projectsRes, savedRes] = await Promise.all([
      supabase.from("user_ideas").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("user_projects").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("saved_products").select("id", { count: "exact" }).eq("user_id", userId),
    ]);

    return {
      totalIdeas: ideasRes.count || 0,
      totalProjects: projectsRes.count || 0,
      savedProducts: savedRes.count || 0,
    };
  });

  // ============================================
  // 9. Cleanup Test Data
  // ============================================
  console.log("\n🧹 Cleaning up test data...");

  await runTest("DELETE test task", async () => {
    if (!testTaskId) return "No task to delete";
    const { error } = await supabase.from("project_tasks").delete().eq("id", testTaskId);
    if (error) throw error;
    return "Task deleted";
  });

  await runTest("DELETE test idea", async () => {
    if (!testIdeaId) return "No idea to delete";
    const { error } = await supabase.from("user_ideas").delete().eq("id", testIdeaId);
    if (error) throw error;
    return "Idea deleted";
  });

  await runTest("DELETE test project", async () => {
    if (!testProjectId) return "No project to delete";
    const { error } = await supabase.from("user_projects").delete().eq("id", testProjectId);
    if (error) throw error;
    return "Project deleted";
  });

  // ============================================
  // Summary
  // ============================================
  printSummary();
}

function printSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.log("\n🔴 Failed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  console.log("\n" + "=".repeat(60));

  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED! Workspace features are working correctly.");
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Please check the errors above.`);
  }

  console.log("=".repeat(60) + "\n");

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
