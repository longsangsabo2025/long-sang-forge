/**
 * Script để xác nhận thanh toán thủ công
 * Usage: node scripts/confirm-payment.cjs <subscription_id hoặc email>
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function confirmPayment() {
  const identifier = process.argv[2];

  console.log("💳 Xác nhận thanh toán thủ công\n");

  // Tìm subscription pending gần nhất
  let query = supabase
    .from("user_subscriptions")
    .select("*")
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false });

  if (identifier) {
    if (identifier.includes("@")) {
      query = query.eq("user_email", identifier);
    } else {
      query = query.eq("id", identifier);
    }
  }

  const { data: subscriptions, error } = await query.limit(1);

  if (error || !subscriptions?.length) {
    console.error("❌ Không tìm thấy subscription pending");
    console.log("\nDanh sách pending:");

    const { data: allPending } = await supabase
      .from("user_subscriptions")
      .select("id, user_email, plan_id, payment_amount, created_at, payment_status")
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    console.table(allPending);
    return;
  }

  const sub = subscriptions[0];
  console.log("📋 Subscription tìm thấy:");
  console.log(`   ID: ${sub.id}`);
  console.log(`   Email: ${sub.user_email}`);
  console.log(`   Gói: ${sub.plan_id}`);
  console.log(`   Số tiền: ${sub.payment_amount?.toLocaleString()}đ`);
  console.log(`   Tạo lúc: ${new Date(sub.created_at).toLocaleString("vi-VN")}`);

  // Cập nhật status
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("user_subscriptions")
    .update({
      status: "active",
      payment_status: "confirmed",
      payment_confirmed_at: now,
      payment_transaction_id: `MANUAL_${Date.now()}`,
      updated_at: now,
    })
    .eq("id", sub.id);

  if (updateError) {
    console.error("❌ Lỗi cập nhật:", updateError.message);
    return;
  }

  console.log("\n✅ Đã xác nhận thanh toán thành công!");
  console.log("   Status: active");
  console.log("   Payment: confirmed");

  // Gửi email xác nhận
  try {
    const emailUrl = `${supabaseUrl}/functions/v1/send-email`;
    const response = await fetch(emailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        to: sub.user_email,
        template: "subscriptionConfirmed",
        data: {
          userName: sub.user_name || sub.user_email,
          planName: sub.plan_id.toUpperCase(),
          amount: sub.payment_amount?.toLocaleString() + "đ",
          expiresAt: new Date(sub.expires_at).toLocaleDateString("vi-VN"),
        },
      }),
    });

    if (response.ok) {
      console.log(`\n📧 Đã gửi email xác nhận tới ${sub.user_email}`);
    } else {
      console.log("\n⚠️  Email gửi thất bại:", await response.text());
    }
  } catch (e) {
    console.log("\n⚠️  Không gửi được email:", e.message);
  }
}

confirmPayment().catch(console.error);
