const pg = require("pg");

const client = new pg.Client({
  connectionString:
    "postgresql://postgres.diexsbzqwsbpilsymnfb:Acookingoil123@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
});

const migrationSQL = `
-- ============================================
-- SUBSCRIPTION SYSTEM FOR LONG SANG FORGE
-- ============================================

-- Drop and recreate for clean state
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Subscription Plans Table
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  description TEXT,
  description_vi TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  payment_status TEXT DEFAULT 'pending',
  payment_amount INTEGER,
  payment_transaction_id TEXT,
  payment_confirmed_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
CREATE INDEX idx_user_subscriptions_payment_status ON user_subscriptions(payment_status);
`;

const insertPlansSQL = `
-- Insert default plans (upsert)
INSERT INTO subscription_plans (id, name, name_vi, description, description_vi, price, duration_days, features, sort_order) VALUES
(
  'free',
  'Free',
  'Miễn Phí',
  'Basic access to AI updates and community',
  'Truy cập cơ bản vào cập nhật AI và cộng đồng',
  0,
  36500,
  '[
    {"key": "ai_updates", "value": "monthly", "label": "AI Updates", "label_vi": "Cập nhật AI", "desc": "Monthly digest", "desc_vi": "Bản tin hàng tháng"},
    {"key": "showcase_access", "value": 3, "label": "Showcase", "label_vi": "Showcase", "desc": "3 basic projects", "desc_vi": "3 dự án cơ bản"},
    {"key": "consultation_discount", "value": 0, "label": "Discount", "label_vi": "Giảm giá", "desc": "0%", "desc_vi": "0%"}
  ]'::jsonb,
  0
),
(
  'pro',
  'Pro',
  'Pro',
  'Weekly updates, early access, and Pro community',
  'Cập nhật hàng tuần, truy cập sớm và cộng đồng Pro',
  49000,
  30,
  '[
    {"key": "ai_updates", "value": "weekly", "label": "AI Updates", "label_vi": "Cập nhật AI", "desc": "Weekly insights", "desc_vi": "Thông tin hàng tuần"},
    {"key": "product_announcements", "value": "early_3days", "label": "Product News", "label_vi": "Tin sản phẩm", "desc": "3 days early", "desc_vi": "Sớm 3 ngày"},
    {"key": "showcase_access", "value": 10, "label": "Showcase", "label_vi": "Showcase", "desc": "10+ projects", "desc_vi": "10+ dự án"},
    {"key": "roadmap_access", "value": "full", "label": "Roadmap", "label_vi": "Lộ trình", "desc": "Full access", "desc_vi": "Toàn bộ"},
    {"key": "community", "value": "pro_channel", "label": "Community", "label_vi": "Cộng đồng", "desc": "Discord Pro", "desc_vi": "Kênh Discord Pro"},
    {"key": "support", "value": "email_48h", "label": "Support", "label_vi": "Hỗ trợ", "desc": "Email 48h", "desc_vi": "Email 48h"},
    {"key": "consultation_discount", "value": 10, "label": "Discount", "label_vi": "Giảm giá", "desc": "10%", "desc_vi": "10%"}
  ]'::jsonb,
  1
),
(
  'vip',
  'VIP',
  'VIP',
  'Real-time updates, priority access, and exclusive benefits',
  'Cập nhật real-time, truy cập ưu tiên và quyền lợi độc quyền',
  99000,
  30,
  '[
    {"key": "ai_updates", "value": "realtime", "label": "AI Updates", "label_vi": "Cập nhật AI", "desc": "Real-time + Early", "desc_vi": "Real-time + Sớm"},
    {"key": "product_announcements", "value": "early_7days", "label": "Product News", "label_vi": "Tin sản phẩm", "desc": "7 days + Beta", "desc_vi": "Sớm 7 ngày + Beta"},
    {"key": "showcase_access", "value": "unlimited", "label": "Showcase", "label_vi": "Showcase", "desc": "Unlimited + Source", "desc_vi": "Không giới hạn"},
    {"key": "roadmap_access", "value": "strategy", "label": "Roadmap", "label_vi": "Lộ trình", "desc": "Strategy + BTS", "desc_vi": "Chiến lược + Hậu trường"},
    {"key": "community", "value": "private_group", "label": "Community", "label_vi": "Cộng đồng", "desc": "Private + Direct", "desc_vi": "Nhóm riêng + Chat trực tiếp"},
    {"key": "investment_access", "value": "priority", "label": "Investment", "label_vi": "Đầu tư", "desc": "Priority access", "desc_vi": "Ưu tiên đầu tư"},
    {"key": "support", "value": "priority_24h", "label": "Support", "label_vi": "Hỗ trợ", "desc": "Priority 24h", "desc_vi": "Ưu tiên 24h"},
    {"key": "consultation_discount", "value": 20, "label": "Discount", "label_vi": "Giảm giá", "desc": "20%", "desc_vi": "20%"}
  ]'::jsonb,
  2
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_vi = EXCLUDED.name_vi,
  description = EXCLUDED.description,
  description_vi = EXCLUDED.description_vi,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();
`;

const rlsSQL = `
-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON user_subscriptions;

-- Everyone can read plans
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
`;

async function runMigration() {
  console.log("🚀 Starting Subscription System Migration...\n");

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    // Step 1: Create tables
    console.log("📦 Creating tables...");
    await client.query(migrationSQL);
    console.log("✅ Tables created\n");

    // Step 2: Insert plans
    console.log("📝 Inserting subscription plans...");
    await client.query(insertPlansSQL);
    console.log("✅ Plans inserted\n");

    // Step 3: RLS policies
    console.log("🔐 Setting up RLS policies...");
    await client.query(rlsSQL);
    console.log("✅ RLS policies configured\n");

    // Verify
    const plansResult = await client.query(
      "SELECT id, name, price FROM subscription_plans ORDER BY sort_order"
    );
    console.log("📋 Subscription Plans:");
    plansResult.rows.forEach((p) => {
      console.log(`   ${p.id}: ${p.name} - ${p.price.toLocaleString()}đ`);
    });

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.detail) console.error("   Detail:", error.detail);
  } finally {
    await client.end();
  }
}

runMigration();
