/**
 * Script để thêm mã giảm giá test SANGDEPTRAI (90% off)
 * Usage: node scripts/add-test-discount.cjs
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function addTestDiscountCode() {
  console.log("🎁 Thêm mã giảm giá test SANGDEPTRAI...\n");

  // Discount code cho testing
  const discountCode = {
    code: "SANGDEPTRAI",
    description: "Mã test giảm 90% - Dùng để test thanh toán",
    discount_type: "percent",
    discount_value: 90,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 năm
    max_uses: 9999,
    used_count: 0,
    is_active: true,
    applicable_plans: ["pro", "vip"],
    applicable_cycles: ["monthly", "yearly"],
    min_amount: 0,
  };

  // Kiểm tra xem code đã tồn tại chưa
  const { data: existing } = await supabase
    .from("discount_codes")
    .select("id, code")
    .eq("code", "SANGDEPTRAI")
    .single();

  if (existing) {
    console.log("⚠️  Mã SANGDEPTRAI đã tồn tại, đang cập nhật...");

    const { data, error } = await supabase
      .from("discount_codes")
      .update({
        ...discountCode,
        updated_at: new Date().toISOString(),
      })
      .eq("code", "SANGDEPTRAI")
      .select();

    if (error) {
      console.error("❌ Lỗi cập nhật:", error.message);
      return;
    }
    console.log("✅ Đã cập nhật mã giảm giá!");
    console.log(data);
  } else {
    // Insert mới
    const { data, error } = await supabase.from("discount_codes").insert(discountCode).select();

    if (error) {
      console.error("❌ Lỗi tạo mã:", error.message);
      return;
    }
    console.log("✅ Đã tạo mã giảm giá mới!");
    console.log(data);
  }

  console.log("\n📋 Thông tin mã giảm giá:");
  console.log("   Code: SANGDEPTRAI");
  console.log("   Giảm: 90%");
  console.log("   Áp dụng: Tất cả gói (Pro, VIP)");
  console.log("   Chu kỳ: Monthly & Yearly");
  console.log("   Hết hạn: 1 năm từ bây giờ");
  console.log("\n🧪 Sử dụng mã này để test thanh toán!");
}

addTestDiscountCode().catch(console.error);
