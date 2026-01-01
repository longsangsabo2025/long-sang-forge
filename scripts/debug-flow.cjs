/**
 * Debug test - call casso webhook and check database directly
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const CASSO_WEBHOOK_URL = "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/casso-webhook";
const SECURE_TOKEN = "longsang2024";

async function debugTest() {
  console.log("🔍 DEBUG TEST\n");

  // Step 1: Create a fresh pending consultation
  console.log("📋 Step 1: Creating NEW pending consultation...");

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const dateStr = futureDate.toISOString().split("T")[0];
  const testId = Date.now().toString().slice(-6);

  const { data: consultation, error } = await supabase
    .from("consultations")
    .insert({
      client_name: `Debug Test ${testId}`,
      client_email: "debug@longsang.org",
      client_phone: "0987654321",
      consultation_date: dateStr,
      start_time: "14:00:00",
      end_time: "14:30:00",
      duration_minutes: 30,
      consultation_type: "video_call",
      notes: "Debug test",
      payment_status: "pending",
      payment_amount: 299000,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }

  console.log("   Created:", consultation.id);
  console.log("   Client:", consultation.client_name);
  console.log("   Date:", consultation.consultation_date);
  console.log("");

  // Step 2: Call webhook
  console.log("💳 Step 2: Calling Casso webhook...");

  const clientNameNoSpace = consultation.client_name.replace(/\s+/g, "").toUpperCase();

  const payload = {
    error: 0,
    data: {
      id: "debug-" + testId,
      reference: "DEBUG" + testId,
      transactionDateTime: new Date().toISOString(),
      amount: 299000,
      description: `TUVAN ${clientNameNoSpace}`,
      accountNumber: "MB-123",
    },
  };

  console.log("   Payload:", JSON.stringify(payload));

  const response = await fetch(CASSO_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "secure-token": SECURE_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log("   Status:", response.status);
  console.log("   Result:", JSON.stringify(result, null, 2));
  console.log("");

  // Step 3: Wait and check database
  console.log("🔍 Step 3: Checking database...");
  await new Promise((r) => setTimeout(r, 5000)); // Wait 5 seconds for async operations

  const { data: updated } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", consultation.id)
    .single();

  console.log("\n📊 Database Result:");
  console.log("   payment_status:", updated.payment_status);
  console.log("   calendar_event_id:", updated.calendar_event_id);
  console.log("   meeting_link:", updated.meeting_link);
  console.log("   payment_confirmed_at:", updated.payment_confirmed_at);

  if (updated.calendar_event_id) {
    console.log("\n🎉 SUCCESS! Payment flow working!");
    console.log("   📅 Calendar:", updated.calendar_event_id);
    if (updated.meeting_link) {
      console.log("   🎥 Meet:", updated.meeting_link);
    } else {
      console.log("   ℹ️ Meet link not available (Service Account needs Google Workspace license)");
    }
  } else if (updated.payment_status === "confirmed") {
    console.log("\n⚠️ Payment confirmed but Calendar not created");
    console.log("   Check GOOGLE_SERVICE_ACCOUNT_JSON env in Supabase Dashboard");
  } else {
    console.log("\n❌ Payment not confirmed");
  }
}

debugTest().catch(console.error);
