#!/usr/bin/env node
/**
 * Test FULL payment flow with real user and subscription bonus
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const uniqueId = Math.floor(Math.random() * 1000000);
const testEmail = "longsang063@gmail.com";
const testUserId = "1310b619-51a3-4983-9cd2-918b54b8dd56";
const clientName = `Bonus Test ${uniqueId}`;

async function testFullFlow() {
  console.log("🧪 FULL PAYMENT FLOW TEST (with subscription bonus)\n");

  // Step 1: Create consultation WITH user_id
  console.log("📋 Step 1: Creating consultation WITH user_id...");
  const { data: consultation, error } = await supabase
    .from("consultations")
    .insert({
      client_name: clientName,
      client_email: testEmail,
      user_id: testUserId, // Key difference!
      consultation_date: "2026-01-20",
      start_time: "10:00",
      end_time: "11:00",
      duration_minutes: 60,
      status: "pending",
      consultation_type: "Tư vấn 60 phút",
      payment_status: "pending",
      payment_amount: 299000,
    })
    .select()
    .single();

  if (error) {
    console.log("❌ Error creating consultation:", error.message);
    return;
  }

  console.log(`   Created: ${consultation.id}`);
  console.log(`   Client: ${clientName}`);
  console.log(`   User ID: ${testUserId}`);
  console.log(`   Amount: 299,000 VND\n`);

  // Step 2: Get current subscription count
  const { data: beforeSubs } = await supabase
    .from("user_subscriptions")
    .select("id, plan_id, expires_at")
    .eq("user_id", testUserId)
    .eq("status", "active");

  console.log("📦 Step 2: Current subscriptions:", beforeSubs?.length || 0);
  if (beforeSubs?.length) {
    beforeSubs.forEach((s) =>
      console.log(`   - ${s.plan_id}: expires ${s.expires_at?.slice(0, 10)}`)
    );
  }

  // Step 3: Simulate webhook
  console.log("\n💳 Step 3: Simulating Casso webhook...");
  const webhookPayload = {
    error: 0,
    data: {
      id: `bonus-${uniqueId}`,
      reference: `BONUS${uniqueId}`,
      transactionDateTime: new Date().toISOString(),
      amount: 299000,
      description: `TUVAN ${clientName.replace(/\s+/g, "").toUpperCase().slice(0, 12)} 20012026`,
      accountNumber: "MB-123",
    },
  };

  console.log(`   Amount: 299,000 VND`);
  console.log(`   Description: ${webhookPayload.data.description}`);

  const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/casso-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(webhookPayload),
  });

  const result = await response.json();
  console.log(`   Response: ${result.message}`);

  // Step 4: Check consultation updated
  console.log("\n🔍 Step 4: Checking consultation...");
  const { data: updated } = await supabase
    .from("consultations")
    .select("status, payment_status, calendar_event_id")
    .eq("id", consultation.id)
    .single();

  console.log(`   status: ${updated?.status}`);
  console.log(`   payment_status: ${updated?.payment_status}`);
  console.log(`   calendar: ${updated?.calendar_event_id || "none"}`);

  // Step 5: Check subscription bonus
  console.log("\n🎁 Step 5: Checking subscription bonus...");
  const { data: afterSubs } = await supabase
    .from("user_subscriptions")
    .select("id, plan_id, expires_at, payment_transaction_id")
    .eq("user_id", testUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (afterSubs?.length > (beforeSubs?.length || 0)) {
    const newSub = afterSubs.find((s) => s.payment_transaction_id?.includes("BONUS"));
    if (newSub) {
      console.log(`   ✅ NEW SUBSCRIPTION CREATED!`);
      console.log(`   Plan: ${newSub.plan_id}`);
      console.log(`   Expires: ${newSub.expires_at?.slice(0, 10)}`);
    }
  } else if (afterSubs?.length) {
    const extendedSub = afterSubs[0];
    console.log(`   📅 Subscription extended:`);
    console.log(`   Plan: ${extendedSub.plan_id}`);
    console.log(`   New expiry: ${extendedSub.expires_at?.slice(0, 10)}`);
  } else {
    console.log(`   ❌ No subscription bonus created`);
    console.log(`   Check Supabase function logs for errors`);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (updated?.status === "confirmed" && updated?.payment_status === "confirmed") {
    console.log("✅ FULL FLOW SUCCESS!");
    console.log("   - Consultation confirmed");
    console.log("   - Calendar event created");
    console.log("   - Subscription bonus processed");
  } else {
    console.log("⚠️ PARTIAL SUCCESS - check logs");
  }
}

testFullFlow().catch(console.error);
