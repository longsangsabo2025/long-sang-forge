/**
 * Test full consultation payment flow with Calendar + Google Meet
 * 1. Create a pending consultation
 * 2. Simulate Casso webhook
 * 3. Verify calendar_event_id and meeting_link
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const CASSO_WEBHOOK_URL = "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/casso-webhook";
const SECURE_TOKEN = "longsang2024";

async function testFullFlow() {
  console.log("🚀 Starting full flow test...\n");

  // Step 1: Find or create a pending consultation
  console.log("📋 Step 1: Finding pending consultation...");

  let { data: consultations } = await supabase
    .from("consultations")
    .select("*")
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false })
    .limit(1);

  let consultation;

  if (!consultations || consultations.length === 0) {
    console.log("   Creating new test consultation...");

    // Create a new consultation for testing - using correct schema
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const dateStr = futureDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: newConsultation, error } = await supabase
      .from("consultations")
      .insert({
        client_name: "Test Full Flow",
        client_email: "test@longsang.org",
        client_phone: "0987654321",
        consultation_date: dateStr,
        start_time: "10:00:00",
        end_time: "10:30:00",
        duration_minutes: 30,
        consultation_type: "video_call",
        notes: "Full flow test - " + new Date().toISOString(),
        payment_status: "pending",
        payment_amount: 299000,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to create consultation:", error.message);
      process.exit(1);
    }
    consultation = newConsultation;
    console.log("   ✅ Created consultation:", consultation.id);
  } else {
    consultation = consultations[0];
    console.log("   ✅ Found existing consultation:", consultation.id);
  }

  console.log("   Client:", consultation.client_name);
  console.log("   Amount:", consultation.payment_amount);
  console.log("   Date:", consultation.consultation_date);
  console.log("");

  // Step 2: Simulate Casso webhook
  console.log("💳 Step 2: Simulating Casso webhook...");

  // Build description with client name (matching webhook logic)
  const clientNameNoSpace = consultation.client_name.replace(/\s+/g, "").toUpperCase();
  const paymentAmount = consultation.payment_amount || 299000;

  // Casso Webhook V2 format: data is object, not array
  const cassoPayload = {
    error: 0,
    data: {
      id: "test-" + Date.now(),
      reference: "BANK" + Date.now(),
      when: new Date().toISOString(),
      transactionDateTime: new Date().toISOString(),
      amount: paymentAmount,
      description: `TUVAN ${clientNameNoSpace} ${consultation.consultation_date.replace(/-/g, "")}`,
      cusum_balance: 10000000,
      accountNumber: "MB-0123456789",
    },
  };

  console.log("   Sending to:", CASSO_WEBHOOK_URL);
  console.log("   Payload:", JSON.stringify(cassoPayload, null, 2));

  try {
    const response = await fetch(CASSO_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "secure-token": SECURE_TOKEN,
      },
      body: JSON.stringify(cassoPayload),
    });

    const result = await response.json();
    console.log("   Response status:", response.status);
    console.log("   Response body:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("❌ Webhook failed!");
      process.exit(1);
    }
    console.log("   ✅ Webhook processed successfully!\n");
  } catch (error) {
    console.error("❌ Webhook request failed:", error.message);
    process.exit(1);
  }

  // Step 3: Verify results
  console.log("🔍 Step 3: Verifying results...");

  // Wait a moment for async processing
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const { data: updated, error: fetchError } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", consultation.id)
    .single();

  if (fetchError) {
    console.error("❌ Failed to fetch updated consultation:", fetchError.message);
    process.exit(1);
  }

  console.log("\n📊 Results:");
  console.log(
    "   ├─ Payment Status:",
    updated.payment_status,
    updated.payment_status === "confirmed" ? "✅" : "❌"
  );
  console.log(
    "   ├─ Calendar Event ID:",
    updated.calendar_event_id || "null",
    updated.calendar_event_id ? "✅" : "❌"
  );
  console.log(
    "   ├─ Meeting Link:",
    updated.meeting_link || "null",
    updated.meeting_link ? "✅" : "❌"
  );
  console.log("   ├─ Reminder Metadata:", JSON.stringify(updated.reminder_metadata || {}));
  console.log("   └─ Paid At:", updated.paid_at || "null");

  // Summary
  console.log("\n" + "=".repeat(50));
  const allPassed =
    updated.payment_status === "confirmed" && updated.calendar_event_id && updated.meeting_link;

  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED!");
    console.log("\n📅 Google Calendar Event ID:", updated.calendar_event_id);
    console.log("🎥 Google Meet Link:", updated.meeting_link);
  } else {
    console.log("⚠️ Some tests failed. Check logs above.");
  }
  console.log("=".repeat(50));
}

testFullFlow().catch(console.error);
