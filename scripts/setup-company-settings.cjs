/**
 * 🏢 COMPANY SETTINGS TABLE MIGRATION
 *
 * Tạo bảng company_settings để lưu trữ thông tin động:
 * - Thông tin liên hệ (hotline, email, địa chỉ)
 * - Giờ làm việc
 * - Thông tin thanh toán
 * - Social links
 * - Thông tin khuyến mãi
 */

const config = require("./_config.cjs");

const MIGRATION_SQL = `
-- =============================================
-- TABLE: company_settings
-- Lưu trữ thông tin công ty dạng key-value
-- =============================================

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index cho quick lookup
CREATE INDEX IF NOT EXISTS idx_company_settings_key ON company_settings(key);
CREATE INDEX IF NOT EXISTS idx_company_settings_category ON company_settings(category);

-- RLS Policies
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read public settings
DROP POLICY IF EXISTS "Public settings readable by all" ON company_settings;
CREATE POLICY "Public settings readable by all" ON company_settings
  FOR SELECT USING (is_public = true);

-- Only admins can modify
DROP POLICY IF EXISTS "Admins can manage settings" ON company_settings;
CREATE POLICY "Admins can manage settings" ON company_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_company_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS company_settings_updated_at ON company_settings;
CREATE TRIGGER company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_company_settings_timestamp();
`;

const INITIAL_SETTINGS = [
  // ========== CONTACT INFO ==========
  {
    key: "contact_email",
    value: { email: "contact@longsang.net", display: "contact@longsang.net" },
    category: "contact",
    description: "Email liên hệ chính",
    is_public: true,
  },
  {
    key: "contact_phone",
    value: { phone: "0909123456", display: "0909 123 456", note: "Zalo/Viber" },
    category: "contact",
    description: "Số điện thoại liên hệ",
    is_public: true,
  },
  {
    key: "contact_address",
    value: {
      full: "Việt Nam",
      city: "TP. Hồ Chí Minh",
      note: "Làm việc remote, có thể gặp mặt tại các quán café",
    },
    category: "contact",
    description: "Địa chỉ công ty",
    is_public: true,
  },

  // ========== WORKING HOURS ==========
  {
    key: "working_hours",
    value: {
      weekdays: "09:00 - 18:00",
      saturday: "09:00 - 12:00",
      sunday: "Nghỉ",
      timezone: "Asia/Ho_Chi_Minh",
      note: "Có thể linh hoạt theo yêu cầu dự án",
    },
    category: "operations",
    description: "Giờ làm việc",
    is_public: true,
  },

  // ========== SOCIAL LINKS ==========
  {
    key: "social_links",
    value: {
      facebook: "https://facebook.com/longsangtech",
      youtube: "https://youtube.com/@longsangtech",
      github: "https://github.com/longsang",
      linkedin: "https://linkedin.com/company/longsang",
      zalo: "https://zalo.me/0909123456",
    },
    category: "social",
    description: "Các kênh mạng xã hội",
    is_public: true,
  },

  // ========== PAYMENT INFO ==========
  {
    key: "payment_bank",
    value: {
      bank_name: "Vietcombank",
      account_number: "1234567890",
      account_name: "LONG SANG TECH",
      branch: "Chi nhánh HCM",
      qr_url: null,
    },
    category: "payment",
    description: "Thông tin ngân hàng",
    is_public: true,
  },
  {
    key: "payment_policy",
    value: {
      deposit_percent: 30,
      deposit_note: "30-50% tùy quy mô dự án",
      payment_methods: ["bank_transfer", "momo", "zalopay", "qr"],
      installment_available: true,
      installment_note: "Có thể trả góp với dự án > 20 triệu",
    },
    category: "payment",
    description: "Chính sách thanh toán",
    is_public: true,
  },

  // ========== PRICING (DYNAMIC) ==========
  {
    key: "pricing_landing_page",
    value: {
      name: "Landing Page",
      price_from: 3000000,
      price_to: 5000000,
      price_display: "3 - 5 triệu",
      timeline: "1-2 tuần",
      includes: ["1 trang", "Responsive", "SEO cơ bản", "Form liên hệ"],
      note: "Giá có thể thay đổi tùy yêu cầu",
    },
    category: "pricing",
    description: "Giá Landing Page",
    is_public: true,
  },
  {
    key: "pricing_business_website",
    value: {
      name: "Website Doanh nghiệp",
      price_from: 8000000,
      price_to: 15000000,
      price_display: "8 - 15 triệu",
      timeline: "2-4 tuần",
      includes: ["5-10 trang", "CMS quản lý", "SEO chuẩn", "Blog", "Multi-language"],
      note: "Tùy số trang và tính năng",
    },
    category: "pricing",
    description: "Giá Website Doanh nghiệp",
    is_public: true,
  },
  {
    key: "pricing_ecommerce",
    value: {
      name: "Website E-commerce",
      price_from: 15000000,
      price_to: 30000000,
      price_display: "15 - 30 triệu",
      timeline: "4-8 tuần",
      includes: [
        "Catalog sản phẩm",
        "Giỏ hàng",
        "Thanh toán online",
        "Quản lý đơn hàng",
        "Báo cáo",
      ],
      note: "Phụ thuộc số sản phẩm và tính năng",
    },
    category: "pricing",
    description: "Giá Website E-commerce",
    is_public: true,
  },
  {
    key: "pricing_mobile_app",
    value: {
      name: "Mobile App",
      price_from: 30000000,
      price_to: 100000000,
      price_display: "30 - 100 triệu",
      timeline: "6-12 tuần",
      includes: ["iOS + Android", "API Backend", "Admin panel", "Push notifications"],
      note: "Cross-platform hoặc Native tùy yêu cầu",
    },
    category: "pricing",
    description: "Giá Mobile App",
    is_public: true,
  },
  {
    key: "pricing_ai_chatbot",
    value: {
      name: "AI Chatbot",
      price_from: 5000000,
      price_to: 20000000,
      price_display: "5 - 20 triệu",
      timeline: "2-4 tuần",
      includes: ["Tích hợp website", "Train knowledge base", "Tư vấn tự động 24/7"],
      note: "Có phí API hàng tháng tùy lượng chat",
    },
    category: "pricing",
    description: "Giá AI Chatbot",
    is_public: true,
  },

  // ========== PROMOTIONS ==========
  {
    key: "current_promotion",
    value: {
      active: true,
      title: "Ưu đãi đầu năm 2026",
      discount_percent: 10,
      description: "Giảm 10% cho tất cả dịch vụ",
      valid_until: "2026-01-31",
      code: "NEWYEAR2026",
      conditions: ["Áp dụng cho khách hàng mới", "Dự án > 5 triệu"],
    },
    category: "promotion",
    description: "Khuyến mãi hiện tại",
    is_public: true,
  },

  // ========== COMPANY INFO ==========
  {
    key: "company_info",
    value: {
      name: "Long Sang Tech",
      tagline: "Công nghệ & Giải pháp AI cho doanh nghiệp",
      founded: 2020,
      team_size: "5-10",
      clients_served: "50+",
      projects_completed: "100+",
      specialties: ["Web Development", "Mobile App", "AI Integration", "Automation"],
    },
    category: "company",
    description: "Thông tin công ty",
    is_public: true,
  },

  // ========== WARRANTY & SUPPORT ==========
  {
    key: "warranty_policy",
    value: {
      free_support_days: 30,
      bug_fix: "Miễn phí trong thời gian bảo hành",
      feature_change: "Báo giá bổ sung",
      maintenance_monthly: {
        basic: 500000,
        standard: 1000000,
        premium: 2000000,
      },
      sla_response_time: "24 giờ",
    },
    category: "policy",
    description: "Chính sách bảo hành",
    is_public: true,
  },

  // ========== RESPONSE TEMPLATES ==========
  {
    key: "chatbot_greeting",
    value: {
      default:
        "Xin chào! Tôi là trợ lý AI của Long Sang Tech. Tôi có thể giúp bạn tư vấn về dịch vụ thiết kế website, mobile app, AI chatbot và các giải pháp công nghệ khác. Bạn cần hỗ trợ gì ạ?",
      returning_user: "Chào mừng bạn quay lại! Tôi có thể giúp gì cho bạn hôm nay?",
      after_hours:
        "Xin chào! Hiện tại ngoài giờ làm việc, nhưng bạn cứ để lại thông tin, team sẽ liên hệ lại trong giờ hành chính.",
    },
    category: "chatbot",
    description: "Lời chào chatbot",
    is_public: true,
  },
];

async function main() {
  console.log("\n🏢 COMPANY SETTINGS MIGRATION");
  console.log("=".repeat(50));

  const supabase = config.getSupabaseClient();

  // Step 1: Run migration
  console.log("\n📋 Step 1: Creating company_settings table...");
  try {
    const { error: migrationError } = await supabase.rpc("exec_sql", {
      sql: MIGRATION_SQL,
    });

    if (migrationError) {
      // Table might already exist, try direct insert
      console.log("   ⚠️ Migration via RPC failed, table might exist");
    } else {
      console.log("   ✅ Table created successfully");
    }
  } catch (err) {
    console.log("   ⚠️ RPC not available, checking if table exists...");
  }

  // Step 2: Insert initial settings
  console.log("\n📋 Step 2: Inserting initial settings...");

  let inserted = 0,
    updated = 0,
    failed = 0;

  for (const setting of INITIAL_SETTINGS) {
    try {
      // Upsert setting
      const { error } = await supabase.from("company_settings").upsert(
        {
          key: setting.key,
          value: setting.value,
          category: setting.category,
          description: setting.description,
          is_public: setting.is_public,
        },
        { onConflict: "key" }
      );

      if (error) throw error;

      console.log(`   ✅ ${setting.key}`);
      inserted++;
    } catch (err) {
      console.log(`   ❌ ${setting.key}: ${err.message}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log(`   ✅ Inserted/Updated: ${inserted}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log("=".repeat(50));

  // Step 3: Verify
  console.log("\n📋 Step 3: Verifying settings...");
  const { data: settings, error: verifyError } = await supabase
    .from("company_settings")
    .select("key, category")
    .order("category");

  if (settings && settings.length > 0) {
    console.log("\n=== SETTINGS BY CATEGORY ===");
    const byCategory = {};
    settings.forEach((s) => {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.key);
    });

    Object.entries(byCategory).forEach(([cat, keys]) => {
      console.log(`\n${cat.toUpperCase()} (${keys.length}):`);
      keys.forEach((k) => console.log(`   - ${k}`));
    });

    console.log(`\n✅ Total: ${settings.length} settings`);
  } else {
    console.log("   ⚠️ No settings found or error:", verifyError?.message);
  }
}

main().catch(console.error);
