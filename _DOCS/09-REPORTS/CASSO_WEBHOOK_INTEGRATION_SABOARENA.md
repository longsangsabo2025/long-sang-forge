# 🚀 Hướng dẫn Tích hợp Casso Webhook cho SaboArena

**Dự án**: SaboArena (Flutter App + Next.js Website)
**Ngày**: 13/01/2026
**Mục tiêu**: Tự động xác nhận thanh toán subscription qua Casso webhook

---

## 📋 Tổng quan

### Luồng thanh toán:

```
1. User chọn gói subscription (Pro/VIP)
2. Hiển thị QR VietQR với nội dung CK duy nhất
3. User chuyển khoản qua app ngân hàng
4. Casso webhook nhận thông báo từ NH → Supabase Edge Function
5. Edge Function match giao dịch → cập nhật subscription_status = active
6. User nhận thông báo và được kích hoạt tính năng
```

---

## 🗄️ BƯỚC 1: Tạo Database Schema

### 1.1. Bảng Subscription Plans

```sql
-- File: supabase/migrations/20260113_add_subscription_plans.sql

-- ================================================
-- SUBSCRIPTION PLANS
-- ================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'vip'
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL DEFAULT 0, -- VND

    -- Features
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    max_tournaments INTEGER DEFAULT 3,
    max_clubs INTEGER DEFAULT 1,
    max_matches_per_month INTEGER DEFAULT 50,
    has_advanced_stats BOOLEAN DEFAULT false,
    has_video_analysis BOOLEAN DEFAULT false,
    has_priority_support BOOLEAN DEFAULT false,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, max_tournaments, max_clubs, max_matches_per_month, has_advanced_stats, has_video_analysis, has_priority_support, sort_order, features) VALUES
('free', 'Free', 'Miễn phí cho người mới bắt đầu', 0, 3, 1, 50, false, false, false, 1,
 '{"tournaments": "3 giải đấu", "clubs": "1 câu lạc bộ", "matches": "50 trận/tháng", "support": "Community"}'::jsonb),
('pro', 'Pro', 'Dành cho người chơi chuyên nghiệp', 49000, 20, 5, 500, true, false, true, 2,
 '{"tournaments": "20 giải đấu", "clubs": "5 câu lạc bộ", "matches": "500 trận/tháng", "stats": "Thống kê nâng cao", "support": "Priority"}'::jsonb),
('vip', 'VIP', 'Không giới hạn cho chủ CLB', 99000, -1, -1, -1, true, true, true, 3,
 '{"tournaments": "Unlimited", "clubs": "Unlimited", "matches": "Unlimited", "stats": "Advanced AI", "video": "Video analysis", "support": "VIP 24/7"}'::jsonb)
ON CONFLICT (name) DO NOTHING;
```

### 1.2. Bảng User Subscriptions

```sql
-- ================================================
-- USER SUBSCRIPTIONS
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'expired', 'cancelled'
    billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'

    -- Dates
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Payment info
    payment_method TEXT DEFAULT 'bank_transfer',
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
```

### 1.3. Bảng Payment History

```sql
-- ================================================
-- PAYMENT HISTORY
-- ================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,

    -- Payment Info
    amount INTEGER NOT NULL, -- VND
    currency TEXT DEFAULT 'VND',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    payment_method TEXT DEFAULT 'bank_transfer',

    -- Bank Transfer Info
    transaction_id TEXT UNIQUE, -- Mã tham chiếu từ Casso
    transfer_content TEXT, -- Nội dung CK: SUBPRO NGUYENVANA 13012026
    bank_account TEXT, -- Số TK ngân hàng người chuyển (nếu có)

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_transaction_id ON public.payment_history(transaction_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);
```

### 1.4. Bảng Webhook Logs

```sql
-- ================================================
-- WEBHOOK LOGS (Debug & Audit)
-- ================================================
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type TEXT NOT NULL DEFAULT 'casso',
    payload JSONB NOT NULL,
    signature TEXT,
    status TEXT DEFAULT 'received', -- 'received', 'processed', 'failed', 'ignored'

    -- Parsed data
    amount INTEGER,
    transfer_content TEXT,
    transaction_id TEXT,

    -- Processing
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at);
```

### 1.5. Row Level Security (RLS)

```sql
-- ================================================
-- RLS POLICIES
-- ================================================

-- User subscriptions: Users can read their own
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Payment history: Users can read their own
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payment_history FOR SELECT
USING (auth.uid() = user_id);

-- Subscription plans: Public read
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription plans are viewable by everyone"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Webhook logs: Admin only (no policy = service role only)
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
```

---

## 🔧 BƯỚC 2: Supabase Edge Function (Casso Webhook Handler)

### 2.1. Tạo Function

```bash
# Tại thư mục website-next/supabase/functions/
mkdir casso-subscription-webhook
cd casso-subscription-webhook
```

### 2.2. Code Edge Function

```typescript
// File: supabase/functions/casso-subscription-webhook/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-casso-signature",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bank info
const BANK_INFO = {
  bank: "ACB",
  account: "10141347",
  name: "VO LONG SANG",
};

/**
 * Remove Vietnamese diacritics
 */
function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Verify Casso Webhook V2 signature
 */
async function verifyCassoSignature(
  signature: string | null,
  body: string,
  secretKey: string
): Promise<boolean> {
  if (!signature) return false;

  try {
    const parts: Record<string, string> = {};
    signature.split(",").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) parts[key] = value;
    });

    const timestamp = parts["t"];
    const v1Signature = parts["v1"];

    if (!timestamp || !v1Signature) return false;

    const signedPayload = `${timestamp}.${body}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const message = encoder.encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return calculatedSignature === v1Signature;
  } catch (error) {
    console.error("[Casso] Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Test endpoint
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        success: true,
        message: "SaboArena Casso Webhook is ready!",
        timestamp: new Date().toISOString(),
        bank: BANK_INFO,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Main webhook handler
  if (req.method === "POST") {
    let webhookLogId: string | null = null;

    try {
      const rawBody = await req.text();
      console.log("[Casso] Received webhook, body length:", rawBody.length);

      let parsedBody: Record<string, unknown> = {};
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = { rawBody };
      }

      // Log webhook
      const transactionData = (parsedBody.data as Record<string, unknown>) || {};
      const { data: logData } = await supabase
        .from("webhook_logs")
        .insert({
          webhook_type: "casso",
          payload: parsedBody,
          signature: req.headers.get("x-casso-signature"),
          status: "received",
          amount: (transactionData.amount as number) || 0,
          transfer_content: (transactionData.description as string) || "",
        })
        .select("id")
        .single();

      webhookLogId = logData?.id || null;
      console.log("[Casso] Webhook logged with ID:", webhookLogId);

      // Verify signature
      const cassoSecret = Deno.env.get("CASSO_WEBHOOK_SECRET");
      const cassoSignature = req.headers.get("x-casso-signature");

      if (cassoSecret && cassoSignature) {
        const isValid = await verifyCassoSignature(cassoSignature, rawBody, cassoSecret);
        if (!isValid) {
          console.warn("[Casso] Invalid signature");
        } else {
          console.log("[Casso] Signature verified");
        }
      }

      // Parse body
      const body = JSON.parse(rawBody);
      console.log("[Casso] Parsed body:", JSON.stringify(body));

      if (body.error !== 0 || !body.data) {
        console.log("[Casso] Invalid payload");
        return new Response(JSON.stringify({ success: false, error: "Invalid payload" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Support both V1 (array) and V2 (object)
      const transaction = Array.isArray(body.data) ? body.data[0] : body.data;

      if (!transaction) {
        console.log("[Casso] No transaction data");
        return new Response(JSON.stringify({ success: false, error: "No transaction" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Extract transaction fields
      const id = transaction.id;
      const reference = transaction.reference || transaction.tid || `TX_${id}`;
      const description = transaction.description;
      const amount = transaction.amount;
      const transactionDateTime = transaction.transactionDateTime || transaction.when;

      console.log(`[Casso] Transaction: ref=${reference}, amount=${amount}, desc=${description}`);

      // Parse description: SUBPRO/SUBVIP [USERNAME] [DATE]
      const descUpper = (description || "").toUpperCase();
      const isSubscription = descUpper.includes("SUBPRO") || descUpper.includes("SUBVIP");

      if (!isSubscription) {
        console.log("[Casso] Not a subscription payment, skipping");
        await supabase.from("webhook_logs").update({ status: "ignored" }).eq("id", webhookLogId);

        return new Response(
          JSON.stringify({ success: true, message: "Not a subscription payment" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Determine plan type
      const planName = descUpper.includes("SUBVIP") ? "vip" : "pro";

      // Get plan
      const { data: plan } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("name", planName)
        .single();

      if (!plan) {
        console.error("[Casso] Plan not found:", planName);
        return new Response(JSON.stringify({ success: false, error: "Plan not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      // Find pending payment within last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: pendingPayments, error: queryError } = await supabase
        .from("payment_history")
        .select("*, user_subscriptions(*)")
        .eq("status", "pending")
        .eq("plan_id", plan.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("[Casso] Query error:", queryError);
        return new Response(JSON.stringify({ success: false, error: "Database error" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (!pendingPayments || pendingPayments.length === 0) {
        console.log("[Casso] No pending payments found");
        await supabase.from("webhook_logs").update({ status: "ignored" }).eq("id", webhookLogId);

        return new Response(
          JSON.stringify({ success: true, message: "No pending payments to match" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find best match by amount
      let bestMatch = null;
      let bestScore = 0;

      for (const payment of pendingPayments) {
        let score = 0;

        // Check amount (with 5% tolerance)
        if (Math.abs(payment.amount - amount) <= payment.amount * 0.05) {
          score += 100;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = payment;
        }
      }

      if (!bestMatch || bestScore < 50) {
        console.log("[Casso] No matching payment found");
        await supabase.from("webhook_logs").update({ status: "ignored" }).eq("id", webhookLogId);

        return new Response(JSON.stringify({ success: true, message: "No matching payment" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[Casso] Found match: payment_id=${bestMatch.id}, score=${bestScore}`);

      // Update payment history
      await supabase
        .from("payment_history")
        .update({
          status: "completed",
          transaction_id: reference,
          paid_at: transactionDateTime || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: { casso_transaction: transaction },
        })
        .eq("id", bestMatch.id);

      // Update user subscription
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1); // +1 month

      await supabase
        .from("user_subscriptions")
        .update({
          status: "active",
          last_payment_date: new Date().toISOString(),
          next_payment_date: periodEnd.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", bestMatch.subscription_id);

      // Update webhook log
      await supabase
        .from("webhook_logs")
        .update({
          status: "processed",
          transaction_id: reference,
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookLogId);

      console.log(`[Casso] ✅ Payment confirmed for user ${bestMatch.user_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment confirmed",
          payment_id: bestMatch.id,
          user_id: bestMatch.user_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[Casso] Error:", error);

      if (webhookLogId) {
        await supabase
          .from("webhook_logs")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", webhookLogId);
      }

      return new Response(JSON.stringify({ error: "Internal error", message: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

### 2.3. Deploy Edge Function

```bash
# Deploy to Supabase
cd website-next
supabase functions deploy casso-subscription-webhook --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set CASSO_WEBHOOK_SECRET=your_secret_from_casso --project-ref YOUR_PROJECT_REF
```

---

## 🌐 BƯỚC 3: Next.js Website Integration

### 3.1. API Routes cho Subscription

```typescript
// File: website-next/src/app/api/subscriptions/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  // Get all plans
  const { data: plans, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plans });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { plan_id } = await request.json();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get plan details
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", plan_id)
    .single();

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Create subscription
  const { data: subscription, error: subError } = await supabase
    .from("user_subscriptions")
    .upsert({
      user_id: user.id,
      plan_id: plan.id,
      status: "pending",
      current_period_start: new Date().toISOString(),
    })
    .select()
    .single();

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  // Create payment record
  const { data: payment, error: payError } = await supabase
    .from("payment_history")
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      subscription_id: subscription.id,
      amount: plan.price_monthly,
      status: "pending",
      payment_method: "bank_transfer",
      transfer_content: generateTransferContent(plan.name, user),
    })
    .select()
    .single();

  if (payError) {
    return NextResponse.json({ error: payError.message }, { status: 500 });
  }

  // Generate QR code URL
  const qrUrl = generateVietQR(plan.price_monthly, payment.transfer_content);

  return NextResponse.json({
    subscription,
    payment,
    qrUrl,
    transferInfo: {
      bank: "ACB",
      account: "10141347",
      name: "VO LONG SANG",
      amount: plan.price_monthly,
      content: payment.transfer_content,
    },
  });
}

function generateTransferContent(planName: string, user: any): string {
  const userName = (user.user_metadata?.full_name || user.email?.split("@")[0] || "USER")
    .toUpperCase()
    .replace(/\s+/g, "");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const planPrefix = planName === "vip" ? "SUBVIP" : "SUBPRO";
  return `${planPrefix} ${userName} ${date}`;
}

function generateVietQR(amount: number, content: string): string {
  return `https://img.vietqr.io/image/ACB-10141347-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    content
  )}&accountName=${encodeURIComponent("VO LONG SANG")}`;
}
```

### 3.2. Pricing Page Component

```typescript
// File: website-next/src/app/pricing/page.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await fetch("/api/subscriptions");
    const data = await res.json();
    setPlans(data.plans || []);
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = await res.json();
      setPaymentData(data);
      setShowPayment(true);
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showPayment && paymentData) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6">Thanh toán</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6 text-center">
            <Image
              src={paymentData.qrUrl}
              alt="QR Code"
              width={300}
              height={300}
              className="mx-auto"
            />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ngân hàng:</span>
              <span className="font-semibold">{paymentData.transferInfo.bank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số tài khoản:</span>
              <span className="font-semibold">{paymentData.transferInfo.account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chủ TK:</span>
              <span className="font-semibold">{paymentData.transferInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số tiền:</span>
              <span className="font-semibold text-lg text-red-600">
                {paymentData.transferInfo.amount.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Nội dung CK:</span>
              <span className="font-mono font-bold text-blue-600">
                {paymentData.transferInfo.content}
              </span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Quan trọng:</strong> Vui lòng chuyển khoản đúng nội dung để hệ thống tự
              động xác nhận thanh toán trong vòng 30 giây.
            </p>
          </div>
          <button
            onClick={() => setShowPayment(false)}
            className="mt-6 w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Chọn gói của bạn</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan: any) => (
          <div key={plan.id} className="border rounded-lg p-6 hover:shadow-xl transition">
            <h3 className="text-2xl font-bold mb-2">{plan.display_name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="text-3xl font-bold mb-6">
              {plan.price_monthly === 0 ? (
                "Miễn phí"
              ) : (
                <>{plan.price_monthly.toLocaleString("vi-VN")}đ</>
              )}
            </div>
            <ul className="space-y-2 mb-6">
              {Object.entries(plan.features).map(([key, value]: [string, any]) => (
                <li key={key} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">{value}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || plan.price_monthly === 0}
              className={`w-full py-3 rounded-lg font-semibold ${
                plan.price_monthly === 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {plan.price_monthly === 0 ? "Gói hiện tại" : "Nâng cấp"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📱 BƯỚC 4: Flutter App Integration

### 4.1. Model Classes

```dart
// File: app/lib/models/subscription_plan.dart

class SubscriptionPlan {
  final String id;
  final String name;
  final String displayName;
  final String description;
  final int priceMonthly;
  final Map<String, dynamic> features;
  final int maxTournaments;
  final int maxClubs;
  final int maxMatchesPerMonth;
  final bool hasAdvancedStats;
  final bool hasVideoAnalysis;
  final bool hasPrioritySupport;

  SubscriptionPlan({
    required this.id,
    required this.name,
    required this.displayName,
    required this.description,
    required this.priceMonthly,
    required this.features,
    required this.maxTournaments,
    required this.maxClubs,
    required this.maxMatchesPerMonth,
    required this.hasAdvancedStats,
    required this.hasVideoAnalysis,
    required this.hasPrioritySupport,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['id'],
      name: json['name'],
      displayName: json['display_name'],
      description: json['description'],
      priceMonthly: json['price_monthly'],
      features: json['features'] as Map<String, dynamic>,
      maxTournaments: json['max_tournaments'],
      maxClubs: json['max_clubs'],
      maxMatchesPerMonth: json['max_matches_per_month'],
      hasAdvancedStats: json['has_advanced_stats'],
      hasVideoAnalysis: json['has_video_analysis'],
      hasPrioritySupport: json['has_priority_support'],
    );
  }
}
```

### 4.2. Subscription Service

```dart
// File: app/lib/services/subscription_service.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/subscription_plan.dart';

class SubscriptionService {
  final _supabase = Supabase.instance.client;

  Future<List<SubscriptionPlan>> getPlans() async {
    final response = await _supabase
        .from('subscription_plans')
        .select()
        .eq('is_active', true)
        .order('sort_order');

    return (response as List)
        .map((json) => SubscriptionPlan.fromJson(json))
        .toList();
  }

  Future<Map<String, dynamic>> createSubscription(String planId) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    // Get plan
    final plan = await _supabase
        .from('subscription_plans')
        .select()
        .eq('id', planId)
        .single();

    // Create subscription
    final subscription = await _supabase
        .from('user_subscriptions')
        .upsert({
          'user_id': user.id,
          'plan_id': planId,
          'status': 'pending',
          'current_period_start': DateTime.now().toIso8601String(),
        })
        .select()
        .single();

    // Create payment
    final transferContent = _generateTransferContent(plan['name'], user);
    final payment = await _supabase
        .from('payment_history')
        .insert({
          'user_id': user.id,
          'plan_id': planId,
          'subscription_id': subscription['id'],
          'amount': plan['price_monthly'],
          'status': 'pending',
          'payment_method': 'bank_transfer',
          'transfer_content': transferContent,
        })
        .select()
        .single();

    return {
      'subscription': subscription,
      'payment': payment,
      'qrUrl': _generateVietQR(plan['price_monthly'], transferContent),
      'transferInfo': {
        'bank': 'ACB',
        'account': '10141347',
        'name': 'VO LONG SANG',
        'amount': plan['price_monthly'],
        'content': transferContent,
      },
    };
  }

  String _generateTransferContent(String planName, User user) {
    final userName = (user.userMetadata?['full_name'] ?? user.email?.split('@')[0] ?? 'USER')
        .toUpperCase()
        .replaceAll(' ', '');
    final date = DateTime.now().toIso8601String().substring(0, 10).replaceAll('-', '');
    final prefix = planName == 'vip' ? 'SUBVIP' : 'SUBPRO';
    return '$prefix $userName $date';
  }

  String _generateVietQR(int amount, String content) {
    final encodedContent = Uri.encodeComponent(content);
    final encodedName = Uri.encodeComponent('VO LONG SANG');
    return 'https://img.vietqr.io/image/ACB-10141347-compact2.png?amount=$amount&addInfo=$encodedContent&accountName=$encodedName';
  }

  Future<Map<String, dynamic>?> getCurrentSubscription() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return null;

    final response = await _supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

    return response;
  }
}
```

### 4.3. Pricing Screen

```dart
// File: app/lib/screens/pricing_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/subscription_service.dart';
import '../models/subscription_plan.dart';

class PricingScreen extends StatefulWidget {
  @override
  _PricingScreenState createState() => _PricingScreenState();
}

class _PricingScreenState extends State<PricingScreen> {
  final _subscriptionService = SubscriptionService();
  List<SubscriptionPlan> _plans = [];
  bool _loading = true;
  Map<String, dynamic>? _paymentData;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    try {
      final plans = await _subscriptionService.getPlans();
      setState(() {
        _plans = plans;
        _loading = false;
      });
    } catch (e) {
      print('Error loading plans: $e');
      setState(() => _loading = false);
    }
  }

  Future<void> _subscribe(String planId) async {
    try {
      setState(() => _loading = true);
      final data = await _subscriptionService.createSubscription(planId);
      setState(() {
        _paymentData = data;
        _loading = false;
      });
    } catch (e) {
      print('Subscription error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e')),
      );
      setState(() => _loading = false);
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Đã sao chép $label')),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_paymentData != null) {
      return _buildPaymentScreen();
    }

    return Scaffold(
      appBar: AppBar(title: Text('Chọn gói của bạn')),
      body: _loading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: _plans.length,
              itemBuilder: (context, index) {
                final plan = _plans[index];
                return Card(
                  margin: EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan.displayName,
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        SizedBox(height: 8),
                        Text(plan.description),
                        SizedBox(height: 16),
                        Text(
                          plan.priceMonthly == 0
                              ? 'Miễn phí'
                              : '${plan.priceMonthly.toString().replaceAllMapped(
                                    RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                                    (Match m) => '${m[1]},',
                                  )}đ/tháng',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                color: Colors.blue,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        SizedBox(height: 16),
                        ...plan.features.entries.map((entry) => Padding(
                              padding: EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  Icon(Icons.check, color: Colors.green, size: 20),
                                  SizedBox(width: 8),
                                  Expanded(child: Text(entry.value.toString())),
                                ],
                              ),
                            )),
                        SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: plan.priceMonthly == 0
                                ? null
                                : () => _subscribe(plan.id),
                            child: Text(
                              plan.priceMonthly == 0 ? 'Gói hiện tại' : 'Nâng cấp',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildPaymentScreen() {
    final info = _paymentData!['transferInfo'];
    return Scaffold(
      appBar: AppBar(
        title: Text('Thanh toán'),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () => setState(() => _paymentData = null),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Image.network(
              _paymentData!['qrUrl'],
              width: 300,
              height: 300,
            ),
            SizedBox(height: 24),
            Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildInfoRow('Ngân hàng', info['bank'], false),
                    _buildInfoRow('Số TK', info['account'], true),
                    _buildInfoRow('Chủ TK', info['name'], true),
                    _buildInfoRow(
                      'Số tiền',
                      '${info['amount'].toString().replaceAllMapped(
                            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                            (Match m) => '${m[1]},',
                          )}đ',
                      false,
                    ),
                    _buildInfoRow('Nội dung CK', info['content'], true),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.yellow[50],
                border: Border.all(color: Colors.yellow[700]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning_amber, color: Colors.orange),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận trong 30 giây',
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, bool canCopy) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Row(
            children: [
              Text(
                value,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              if (canCopy)
                IconButton(
                  icon: Icon(Icons.copy, size: 18),
                  onPressed: () => _copyToClipboard(value, label),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
```

---

## ⚙️ BƯỚC 5: Cấu hình Casso

### 5.1. Đăng ký Casso

1. Truy cập: https://casso.vn/
2. Đăng ký tài khoản và kết nối tài khoản ngân hàng ACB
3. Lấy thông tin:
   - API Key
   - Webhook Secret

### 5.2. Cấu hình Webhook

Trong dashboard Casso:

1. Vào **Cài đặt** → **Webhook**
2. Thêm Webhook URL: `https://YOUR_PROJECT.supabase.co/functions/v1/casso-subscription-webhook`
3. Chọn sự kiện: **Giao dịch mới**
4. Lưu lại **Webhook Secret**

### 5.3. Set Environment Variables

```bash
# Supabase
supabase secrets set CASSO_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 🧪 BƯỚC 6: Testing

### 6.1. Test Webhook

```bash
# Test GET endpoint
curl https://YOUR_PROJECT.supabase.co/functions/v1/casso-subscription-webhook

# Test with mock data
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/casso-subscription-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "error": 0,
    "data": {
      "id": 123,
      "reference": "FT123456",
      "description": "SUBPRO NGUYENVANA 13012026",
      "amount": 49000,
      "transactionDateTime": "2026-01-13 10:30:00"
    }
  }'
```

### 6.2. Test Full Flow

1. Đăng nhập vào app/website
2. Chọn gói Pro hoặc VIP
3. Quét QR code hoặc chuyển khoản thủ công
4. Đợi 10-30s
5. Kiểm tra subscription status trong database
6. Xác nhận tính năng được kích hoạt

---

## 📊 BƯỚC 7: Monitoring & Analytics

### 7.1. Dashboard Query

```sql
-- Check webhook logs
SELECT
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;

-- Check payment conversion
SELECT
  p.status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (p.paid_at - p.created_at))/60) as avg_minutes_to_pay
FROM payment_history p
WHERE p.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.status;

-- Active subscriptions by plan
SELECT
  sp.display_name,
  COUNT(*) as active_users,
  SUM(sp.price_monthly) as monthly_revenue
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
GROUP BY sp.id, sp.display_name;
```

---

## 🎯 Checklist Triển khai

- [ ] Tạo database tables (migrations)
- [ ] Deploy Supabase Edge Function
- [ ] Set environment variables
- [ ] Cấu hình Casso webhook
- [ ] Implement Next.js API routes
- [ ] Tạo Pricing page (Next.js)
- [ ] Implement Flutter subscription service
- [ ] Tạo Pricing screen (Flutter)
- [ ] Test webhook với mock data
- [ ] Test end-to-end flow
- [ ] Setup monitoring queries
- [ ] Document cho team

---

## 🚀 Lợi ích

✅ **0đ phí giao dịch** - tiết kiệm 1.5-2% so với MoMo/VNPay
✅ **Tự động xác nhận** - trong 10-30 giây
✅ **Tiền về ngay** - không chờ T+1~T+3
✅ **Đơn giản** - không cần GPKD, đăng ký 5 phút
✅ **VietQR** - 100 triệu tài khoản NH có thể thanh toán

---

Hãy cho tôi biết nếu bạn muốn tôi giúp triển khai bất kỳ phần nào!
