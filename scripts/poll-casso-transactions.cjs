/**
 * Poll Casso API for new transactions
 * This is a backup mechanism when webhook doesn't work
 *
 * Run: node scripts/poll-casso-transactions.cjs
 */

require("dotenv").config(); // Load .env first
require("dotenv").config({ path: ".env.local", override: true }); // Then override with .env.local
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cassoApiKey = process.env.CASSO_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!cassoApiKey) {
  console.error("❌ Missing CASSO_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchCassoTransactions() {
  const https = require("https");

  // Get transactions from last 7 days
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const toDate = new Date().toISOString().split("T")[0];

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "oauth.casso.vn",
      path: `/v2/transactions?fromDate=${fromDate}&toDate=${toDate}&pageSize=50&sort=DESC`,
      method: "GET",
      headers: {
        Authorization: `Apikey ${cassoApiKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          resolve(data.data?.records || []);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function processTransaction(tx) {
  const description = (tx.description || "").toUpperCase();
  const amount = tx.amount;
  const reference = tx.tid || tx.id.toString();

  console.log(`\n📥 Processing: ${description} | ${amount}đ`);

  // Check if already processed
  const { data: existing } = await supabase
    .from("webhook_logs")
    .select("id")
    .eq("transfer_content", tx.description)
    .single();

  if (existing) {
    console.log("   ⏭️ Already processed, skipping");
    return { skipped: true };
  }

  // Log the transaction
  await supabase.from("webhook_logs").insert({
    webhook_type: "casso_poll",
    payload: tx,
    status: "received",
    amount: amount,
    transfer_content: tx.description,
  });

  // Check if it's a subscription payment
  const isSubPro = description.includes("SUBPRO");
  const isSubVip = description.includes("SUBVIP");
  const isTuvan = description.includes("TUVAN");

  if (isSubPro || isSubVip) {
    return await processSubscription(description, amount, reference, isSubVip ? "vip" : "pro");
  }

  if (isTuvan) {
    return await processConsultation(description, amount, reference);
  }

  console.log("   ℹ️ Not a recognized payment type");
  return { ignored: true };
}

async function processSubscription(description, amount, reference, planId) {
  console.log(`   🔍 Looking for pending ${planId} subscription...`);

  // Find pending subscription
  const { data: subs } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("plan_id", planId)
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false });

  if (!subs || subs.length === 0) {
    console.log("   ❌ No pending subscription found");
    return { noMatch: true };
  }

  // Find best match by amount
  const sub = subs.find((s) => Math.abs((s.payment_amount || 0) - amount) <= 1000) || subs[0];

  console.log(`   ✅ Found: ${sub.user_email}`);

  // Calculate expiry
  const isYearly = description.includes(" Y ") || description.endsWith("Y");
  const durationDays = isYearly ? 365 : 30;
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  // Update subscription
  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "active",
      payment_status: "confirmed",
      payment_transaction_id: reference,
      payment_confirmed_at: new Date().toISOString(),
      billing_cycle: isYearly ? "yearly" : "monthly",
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", sub.id);

  if (error) {
    console.log("   ❌ Update failed:", error.message);
    return { error: true };
  }

  console.log(`   🎉 Subscription confirmed! Expires: ${expiresAt.toLocaleDateString("vi-VN")}`);

  // Send confirmation email
  await supabase.functions.invoke("send-email", {
    body: {
      to: sub.user_email,
      template: "subscriptionConfirmed",
      data: {
        customerName: sub.user_name || "Khách hàng",
        planName: sub.plan_name || planId.toUpperCase(),
        expiryDate: expiresAt.toLocaleDateString("vi-VN"),
        amount: amount.toLocaleString("vi-VN"),
        paymentMethod: "Chuyển khoản ngân hàng",
      },
    },
  });

  console.log("   📧 Email sent!");
  return { confirmed: true };
}

async function processConsultation(description, amount, reference) {
  console.log("   🔍 Looking for pending consultation...");

  const { data: consultations } = await supabase
    .from("consultations")
    .select("*")
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!consultations || consultations.length === 0) {
    console.log("   ❌ No pending consultation found");
    return { noMatch: true };
  }

  // Find best match
  const con =
    consultations.find((c) => Math.abs((c.payment_amount || 0) - amount) <= 1000) ||
    consultations[0];

  console.log(`   ✅ Found: ${con.client_name} (${con.client_email})`);

  // Update consultation
  const { error } = await supabase
    .from("consultations")
    .update({
      payment_status: "confirmed",
      payment_transaction_id: reference,
      payment_confirmed_at: new Date().toISOString(),
      payment_amount: amount,
    })
    .eq("id", con.id);

  if (error) {
    console.log("   ❌ Update failed:", error.message);
    return { error: true };
  }

  console.log("   🎉 Consultation confirmed!");
  return { confirmed: true };
}

async function main() {
  console.log("🔄 Polling Casso for new transactions...\n");

  try {
    const transactions = await fetchCassoTransactions();
    console.log(`📋 Found ${transactions.length} transactions in last 7 days`);

    let processed = 0;
    let confirmed = 0;

    for (const tx of transactions) {
      const result = await processTransaction(tx);
      if (!result.skipped) processed++;
      if (result.confirmed) confirmed++;
    }

    // RETRY: Check for unmatched webhook logs and try to match with pending subscriptions
    console.log("\n🔄 Checking for unmatched transactions...");
    await retryUnmatchedTransactions();

    console.log(`\n✅ Done! Processed: ${processed}, Confirmed: ${confirmed}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * Retry matching unmatched webhook logs with pending subscriptions
 * This handles the case where webhook arrives before subscription is created
 */
async function retryUnmatchedTransactions() {
  // Get pending subscriptions
  const { data: pendingSubs } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false });

  if (!pendingSubs || pendingSubs.length === 0) {
    console.log("   No pending subscriptions to match");
    return;
  }

  console.log(`   Found ${pendingSubs.length} pending subscriptions`);

  // Get recent webhook logs that might not have matched
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const { data: logs } = await supabase
    .from("webhook_logs")
    .select("*")
    .gte("created_at", oneHourAgo.toISOString())
    .order("created_at", { ascending: false });

  for (const sub of pendingSubs) {
    const planPrefix = sub.plan_id === "vip" ? "SUBVIP" : "SUBPRO";
    const expectedAmount = sub.payment_amount;

    // Find matching log
    const matchingLog = logs?.find((log) => {
      const content = (log.transfer_content || "").toUpperCase();
      const amount = log.amount;
      return content.includes(planPrefix) && Math.abs(amount - expectedAmount) <= 1000;
    });

    if (matchingLog) {
      console.log(`   ✅ Found match for ${sub.user_email}: ${matchingLog.transfer_content}`);

      // Confirm subscription
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          status: "active",
          payment_status: "confirmed",
          payment_transaction_id: `RETRY_${matchingLog.id}`,
          payment_confirmed_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", sub.id);

      if (!error) {
        console.log(
          `   🎉 Subscription confirmed! Expires: ${expiresAt.toLocaleDateString("vi-VN")}`
        );

        // Send email
        await supabase.functions.invoke("send-email", {
          body: {
            to: sub.user_email,
            template: "subscriptionConfirmed",
            data: {
              customerName: sub.user_name || "Khách hàng",
              planName: sub.plan_id === "vip" ? "VIP" : "Pro",
              expiryDate: expiresAt.toLocaleDateString("vi-VN"),
              amount: expectedAmount.toLocaleString("vi-VN"),
              paymentMethod: "Chuyển khoản ngân hàng",
            },
          },
        });
        console.log("   📧 Email sent!");
      }
    }
  }
}

main();
