#!/usr/bin/env node
/**
 * Test Discounted Payment Flow
 *
 * This script tests that the casso-webhook can match payments
 * where the user used a discount code (e.g., 90% off).
 *
 * Scenario:
 * - Consultation created with payment_amount: 299,000 (original price)
 * - User pays 29,900 (after 90% discount)
 * - Webhook should still match based on name + discount ratio
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const uniqueId = Math.floor(Math.random() * 1000000);
const clientName = `Discount User ${uniqueId}`;

async function testDiscountedPayment() {
  console.log("🧪 DISCOUNT PAYMENT TEST\n");

  // Step 1: Create consultation with ORIGINAL price
  console.log("📋 Step 1: Creating consultation with ORIGINAL price...");
  const { data: consultation, error } = await supabase
    .from("consultations")
    .insert({
      client_name: clientName,
      client_email: "discount@test.com",
      consultation_date: "2026-01-15",
      start_time: "14:00",
      end_time: "15:00",
      duration_minutes: 60,
      status: "pending",
      consultation_type: "Tư vấn 60 phút",
      payment_status: "pending",
      payment_amount: 299000, // Original price stored
    })
    .select()
    .single();

  if (error) {
    console.log("❌ Error creating consultation:", error.message);
    return;
  }

  console.log(`   Created: ${consultation.id}`);
  console.log(`   Client: ${clientName}`);
  console.log(`   Stored amount: 299,000 VND (original)\n`);

  // Step 2: Simulate webhook with DISCOUNTED amount
  console.log("💳 Step 2: Simulating Casso webhook with DISCOUNTED amount...");
  const discountedAmount = 29900; // 90% off = 10% of original

  const webhookPayload = {
    error: 0,
    data: {
      id: `disc-${uniqueId}`,
      reference: `DISC${uniqueId}`,
      transactionDateTime: new Date().toISOString(),
      amount: discountedAmount,
      description: `TUVAN ${clientName.replace(/\s+/g, "").toUpperCase().slice(0, 12)} 15012026`,
      accountNumber: "MB-123",
    },
  };

  console.log(`   Amount paid: ${discountedAmount.toLocaleString()} VND (after 90% discount)`);
  console.log(`   Description: ${webhookPayload.data.description}\n`);

  const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/casso-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(webhookPayload),
  });

  const result = await response.json();
  console.log("🔍 Step 3: Webhook response:");
  console.log(`   Status: ${response.status}`);
  console.log(`   Message: ${result.message}`);

  if (result.consultationId) {
    console.log(`   Matched consultation: ${result.consultationId}`);
  }

  // Step 4: Verify database
  console.log("\n📊 Step 4: Checking database...");
  const { data: updated } = await supabase
    .from("consultations")
    .select("payment_status, payment_transaction_id, calendar_event_id")
    .eq("id", consultation.id)
    .single();

  console.log(`   payment_status: ${updated?.payment_status}`);
  console.log(`   transaction_id: ${updated?.payment_transaction_id}`);
  console.log(`   calendar_event: ${updated?.calendar_event_id || "none"}`);

  // Step 5: Result
  if (updated?.payment_status === "confirmed") {
    console.log("\n✅ SUCCESS! Discounted payment matched and confirmed!");
    console.log("   The matching algorithm correctly identified:");
    console.log("   - Discount ratio: 29,900 / 299,000 = 10% (~90% discount)");
    console.log("   - Name match in transfer description");
  } else {
    console.log("\n❌ FAILED: Discounted payment was not matched");
    console.log("   Check the matching logic in casso-webhook");
  }

  // Cleanup (optional - comment out to keep test data)
  // await supabase.from('consultations').delete().eq('id', consultation.id);
}

testDiscountedPayment().catch(console.error);
