/**
 * 🏢 COMPANY SETTINGS - FULL SETUP
 *
 * Tạo bảng và seed dữ liệu qua SQL trực tiếp
 */

const https = require("https");
const config = require("./_config.cjs");

// Supabase credentials
const SUPABASE_URL = config.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = config.SUPABASE_SERVICE_KEY;

async function executeSql(sql) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ sql_query: sql });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, error: body, status: res.statusCode });
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function executeQuery(endpoint, method = "GET", body = null) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: JSON.parse(data || "[]"),
            status: res.statusCode,
          });
        } catch (e) {
          resolve({ success: false, data: data, status: res.statusCode });
        }
      });
    });

    req.on("error", (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const CREATE_TABLE_SQL = `
-- Drop and recreate for clean state
DROP TABLE IF EXISTS company_settings CASCADE;

-- Create company_settings table
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

-- Index for quick lookup
CREATE INDEX idx_company_settings_key ON company_settings(key);
CREATE INDEX idx_company_settings_category ON company_settings(category);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read public settings
CREATE POLICY "Public settings readable by all" ON company_settings
  FOR SELECT USING (is_public = true);

-- Service role can do everything
CREATE POLICY "Service role full access" ON company_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_company_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  {
    key: "pricing_second_brain",
    value: {
      name: "Second Brain",
      price_from: 99000,
      price_to: 499000,
      price_display: "99k - 499k/tháng",
      timeline: "Sử dụng ngay",
      includes: [
        "Lưu trữ tri thức",
        "AI Chat với dữ liệu",
        "Import từ nhiều nguồn",
        "Chia sẻ brain",
      ],
      note: "Subscription hàng tháng",
    },
    category: "pricing",
    description: "Giá Second Brain subscription",
    is_public: true,
  },

  // ========== PROMOTIONS ==========
  {
    key: "current_promotion",
    value: {
      active: true,
      title: "Ưu đãi đầu năm 2026",
      discount_percent: 10,
      description: "Giảm 10% cho tất cả dịch vụ thiết kế website",
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

  // ========== CHATBOT CONFIG ==========
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

  // ========== QUICK FACTS FOR CHATBOT ==========
  {
    key: "quick_facts",
    value: {
      response_time: "24 giờ",
      project_min_budget: 3000000,
      consultation_free: true,
      remote_work: true,
      languages_supported: ["Tiếng Việt", "English"],
      technologies: ["React", "Vue", "Node.js", "Python", "React Native", "Flutter"],
      ai_models: ["GPT-4", "Claude", "Gemini"],
    },
    category: "chatbot",
    description: "Facts nhanh cho chatbot trả lời",
    is_public: true,
  },
];

async function main() {
  console.log("\n🏢 COMPANY SETTINGS - FULL SETUP");
  console.log("=".repeat(50));

  // Step 1: Create table via Supabase SQL Editor workaround
  console.log("\n📋 Step 1: Creating company_settings table...");
  console.log("   ⚠️ Need to run SQL directly in Supabase Dashboard");
  console.log("   📝 SQL saved to: scripts/sql/create-company-settings.sql");

  // Try using the supabase client to insert (table might already exist)
  const supabase = config.getSupabaseClient();

  // Check if table exists by trying to query
  const { data: existing, error: checkError } = await supabase
    .from("company_settings")
    .select("key")
    .limit(1);

  if (checkError && checkError.message.includes("does not exist")) {
    console.log("\n❌ Table does not exist. Please run the following SQL in Supabase Dashboard:");
    console.log("\n" + "=".repeat(50));
    console.log("Go to: https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/sql/new");
    console.log("=".repeat(50));
    console.log(CREATE_TABLE_SQL);
    console.log("=".repeat(50));

    // Save SQL to file
    const fs = require("fs");
    const path = require("path");
    const sqlDir = path.join(__dirname, "sql");
    if (!fs.existsSync(sqlDir)) fs.mkdirSync(sqlDir);
    fs.writeFileSync(path.join(sqlDir, "create-company-settings.sql"), CREATE_TABLE_SQL);
    console.log("\n✅ SQL saved to: scripts/sql/create-company-settings.sql");
    console.log("   Run this SQL in Supabase Dashboard, then run this script again.");
    return;
  }

  console.log("   ✅ Table exists, proceeding with data insert...");

  // Step 2: Insert settings
  console.log("\n📋 Step 2: Inserting/updating settings...");

  let inserted = 0,
    failed = 0;

  for (const setting of INITIAL_SETTINGS) {
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

    if (error) {
      console.log(`   ❌ ${setting.key}: ${error.message}`);
      failed++;
    } else {
      console.log(`   ✅ ${setting.key}`);
      inserted++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log(`   ✅ Success: ${inserted}`);
  console.log(`   ❌ Failed: ${failed}`);

  // Step 3: Verify
  console.log("\n📋 Step 3: Verification...");
  const { data: allSettings, error: verifyError } = await supabase
    .from("company_settings")
    .select("key, category, value")
    .order("category");

  if (allSettings) {
    const byCategory = {};
    allSettings.forEach((s) => {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.key);
    });

    console.log("\n=== SETTINGS BY CATEGORY ===");
    Object.entries(byCategory).forEach(([cat, keys]) => {
      console.log(`\n${cat.toUpperCase()} (${keys.length}):`);
      keys.forEach((k) => console.log(`   • ${k}`));
    });

    console.log(`\n✅ Total: ${allSettings.length} settings ready!`);
  }

  console.log("\n" + "=".repeat(50));
}

main().catch(console.error);
