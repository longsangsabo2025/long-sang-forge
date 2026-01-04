import { supabase } from "@/integrations/supabase/client";

// Use untyped supabase client for new tables
const untypedSupabase = supabase as any;

// ============= TYPES =============

export interface SubscriptionFeature {
  key: string;
  value: string | number | boolean;
  label: string;
  label_vi: string;
  desc: string;
  desc_vi: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  name_vi: string;
  description?: string;
  description_vi?: string;
  price: number;
  price_yearly?: number; // Yearly price (if null, yearly billing not available)
  duration_days: number;
  features: SubscriptionFeature[];
  is_active: boolean;
  sort_order: number;
}

export type BillingCycle = "monthly" | "yearly";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "expired" | "cancelled" | "pending";
  starts_at: string;
  expires_at: string;
  payment_status: "pending" | "confirmed" | "failed" | "refunded" | "free";
  payment_amount?: number;
  payment_transaction_id?: string;
  payment_confirmed_at?: string;
  auto_renew: boolean;
  billing_cycle?: "monthly" | "yearly";
  created_at: string;
  // Joined fields
  plan?: SubscriptionPlan;
  days_remaining?: number;
  user_email?: string;
  user_name?: string;
}

export type PlanId = "free" | "pro" | "vip";

// Feature labels for display - only features that ACTUALLY exist
const FEATURE_LABELS: Record<
  string,
  { label: string; label_vi: string; desc: string; desc_vi: string }
> = {
  showcase_premium: {
    label: "Premium Showcase",
    label_vi: "Showcase Premium",
    desc: "Access premium project views",
    desc_vi: "Xem dự án cao cấp",
  },
  investment_access: {
    label: "Investment Access",
    label_vi: "Cơ hội đầu tư",
    desc: "Priority access to investment opportunities",
    desc_vi: "Ưu tiên các cơ hội đầu tư",
  },
  priority_support: {
    label: "Priority Support",
    label_vi: "Hỗ trợ ưu tiên",
    desc: "24h response time",
    desc_vi: "Phản hồi trong 24 giờ",
  },
  community_pro: {
    label: "Pro Community",
    label_vi: "Cộng đồng Pro",
    desc: "Access exclusive Discord channels",
    desc_vi: "Truy cập Discord độc quyền",
  },
  beta_access: {
    label: "Beta Access",
    label_vi: "Truy cập Beta",
    desc: "Test new features first",
    desc_vi: "Thử nghiệm tính năng mới",
  },
  direct_chat: {
    label: "1:1 Support",
    label_vi: "Hỗ trợ 1:1",
    desc: "Direct chat with founder",
    desc_vi: "Chat trực tiếp với founder",
  },
  roadmap_strategy: {
    label: "Strategy Roadmap",
    label_vi: "Roadmap chiến lược",
    desc: "Access strategic roadmap",
    desc_vi: "Xem lộ trình phát triển",
  },
  showcase_limit: {
    label: "Project Views",
    label_vi: "Xem dự án",
    desc: "Number of projects viewable",
    desc_vi: "Số dự án có thể xem",
  },
  consultation_discount: {
    label: "Consultation Discount",
    label_vi: "Giảm giá tư vấn",
    desc: "Discount on consultations",
    desc_vi: "Giảm giá khi đặt tư vấn",
  },
  early_access_days: {
    label: "Early Access",
    label_vi: "Truy cập sớm",
    desc: "Days of early access",
    desc_vi: "Số ngày truy cập sớm",
  },
  support_response_hours: {
    label: "Support Response",
    label_vi: "Thời gian phản hồi",
    desc: "Support response time",
    desc_vi: "Thời gian phản hồi hỗ trợ",
  },
  brain_domains: {
    label: "Second Brain Domains",
    label_vi: "Second Brain",
    desc: "Number of brain domains",
    desc_vi: "Số domain Second Brain",
  },
  brain_docs_per_domain: {
    label: "Docs per Domain",
    label_vi: "Tài liệu/Domain",
    desc: "Documents per domain",
    desc_vi: "Số tài liệu mỗi domain",
  },
  brain_queries_per_month: {
    label: "Brain Queries",
    label_vi: "Queries Brain",
    desc: "Monthly brain queries",
    desc_vi: "Số câu hỏi Brain/tháng",
  },
};

// ============= API FUNCTIONS =============

/**
 * Parse features field - converts object to array with labels
 */
function parseFeatures(features: any): SubscriptionFeature[] {
  if (!features) return [];

  // If already array, return as-is
  if (Array.isArray(features)) return features;

  // If string, try to parse
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) return parsed;
      features = parsed;
    } catch {
      return [];
    }
  }

  // If object, convert to array with labels
  if (typeof features === "object") {
    return Object.entries(features)
      .filter(([key, value]) => {
        // Filter out false/0/null values for cleaner display
        if (value === false || value === 0 || value === null) return false;
        return true;
      })
      .map(([key, value]) => {
        const labels = FEATURE_LABELS[key] || {
          label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          label_vi: key.replace(/_/g, " "),
          desc: "",
          desc_vi: "",
        };

        // Format value for display
        let displayValue = value;
        if (value === true) displayValue = "Có";
        else if (value === -1) displayValue = "Không giới hạn";
        else if (typeof value === "number" && key.includes("discount")) displayValue = `${value}%`;
        else if (typeof value === "number" && key.includes("hours")) displayValue = `${value}h`;
        else if (typeof value === "number" && key.includes("days")) displayValue = `${value} ngày`;

        return {
          key,
          value,
          label: labels.label,
          label_vi: labels.label_vi,
          desc: typeof displayValue === "string" ? displayValue : String(displayValue),
          desc_vi: typeof displayValue === "string" ? displayValue : String(displayValue),
        };
      });
  }

  return [];
}

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await untypedSupabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching subscription plans:", error);
    return getDefaultPlans();
  }

  // Parse features for each plan to ensure it's an array
  const plans = (data || []).map((plan: any) => ({
    ...plan,
    features: parseFeatures(plan.features),
  }));

  return plans.length > 0 ? plans : getDefaultPlans();
}

/**
 * Get a specific plan by ID
 */
export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await untypedSupabase
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) {
    console.error("Error fetching plan:", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    features: parseFeatures(data.features),
  };
}

/**
 * Get current user's active subscription
 */
export async function getCurrentSubscription(): Promise<UserSubscription | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await untypedSupabase
    .from("user_subscriptions")
    .select(
      `
      *,
      plan:subscription_plans(*)
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error);
  }

  if (data) {
    // Calculate days remaining
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { ...data, days_remaining: daysRemaining };
  }

  return null;
}

/**
 * Get user's subscription history
 */
export async function getSubscriptionHistory(): Promise<UserSubscription[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await untypedSupabase
    .from("user_subscriptions")
    .select(
      `
      *,
      plan:subscription_plans(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subscription history:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new subscription (pending payment)
 * @param billingCycle - 'monthly' (30 days) or 'yearly' (365 days)
 */
export async function createSubscription(
  planId: string,
  paymentAmount: number,
  billingCycle: BillingCycle = "monthly"
): Promise<UserSubscription> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Get plan details
  const plan = await getSubscriptionPlan(planId);
  if (!plan) throw new Error("Plan not found");

  // Calculate duration based on billing cycle
  const durationDays = billingCycle === "yearly" ? 365 : 30;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Get user info for webhook (stored directly to avoid JOIN issues)
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userEmail = user.email || "";

  const subscriptionData = {
    user_id: user.id,
    user_email: userEmail,
    user_name: userName,
    plan_id: planId,
    status: plan.price === 0 ? "active" : "pending",
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    payment_status: plan.price === 0 ? "free" : "pending",
    payment_amount: paymentAmount,
    billing_cycle: billingCycle,
  };

  const { data, error } = await untypedSupabase
    .from("user_subscriptions")
    .insert(subscriptionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Activate free plan for user
 */
export async function activateFreePlan(): Promise<UserSubscription> {
  return createSubscription("free", 0);
}

/**
 * Check if user has minimum plan level
 */
export async function userHasPlan(minPlan: PlanId): Promise<boolean> {
  const subscription = await getCurrentSubscription();

  if (!subscription) {
    return minPlan === "free";
  }

  const planOrder: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    vip: 2,
  };

  const userPlanOrder = planOrder[subscription.plan_id as PlanId] ?? 0;
  const requiredOrder = planOrder[minPlan] ?? 0;

  return userPlanOrder >= requiredOrder;
}

/**
 * Get feature value from current subscription
 */
export async function getFeatureValue(featureKey: string): Promise<any> {
  const subscription = await getCurrentSubscription();

  if (!subscription?.plan?.features) {
    // Return default free plan feature
    const freePlan = getDefaultPlans().find((p) => p.id === "free");
    const feature = freePlan?.features.find((f) => f.key === featureKey);
    return feature?.value;
  }

  const feature = subscription.plan.features.find((f: SubscriptionFeature) => f.key === featureKey);
  return feature?.value;
}

// ============= DEFAULT PLANS (Fallback) =============
// Features that ACTUALLY exist in the system

function getDefaultPlans(): SubscriptionPlan[] {
  return [
    {
      id: "free",
      name: "Free",
      name_vi: "Miễn Phí",
      description: "Basic access to AI chat and community",
      description_vi: "Truy cập cơ bản vào Chat AI và cộng đồng",
      price: 0,
      duration_days: 36500,
      features: [
        {
          key: "ai_chat",
          value: 10,
          label: "AI Chat",
          label_vi: "Chat AI",
          desc: "10 credits/day",
          desc_vi: "10 credits/ngày",
        },
        {
          key: "showcase_limit",
          value: 1,
          label: "Project Views",
          label_vi: "Xem dự án",
          desc: "1 project",
          desc_vi: "1 dự án",
        },
        {
          key: "brain_domains",
          value: 0,
          label: "Second Brain AI",
          label_vi: "Second Brain AI",
          desc: "Not included",
          desc_vi: "Không có",
        },
        {
          key: "brain_docs",
          value: 0,
          label: "Brain Docs",
          label_vi: "Docs nạp vào Brain",
          desc: "Not included",
          desc_vi: "Không có",
        },
        {
          key: "early_access_days",
          value: 0,
          label: "Early Access",
          label_vi: "Truy cập sớm",
          desc: "Not included",
          desc_vi: "Không có",
        },
        {
          key: "email_updates",
          value: true,
          label: "Email Updates",
          label_vi: "Email cập nhật",
          desc: "Included",
          desc_vi: "Có",
        },
        {
          key: "investment_access",
          value: false,
          label: "Investment Access",
          label_vi: "Đầu tư dự án",
          desc: "Not included",
          desc_vi: "Không có",
        },
        {
          key: "community_pro",
          value: false,
          label: "Pro Community",
          label_vi: "Cộng đồng Pro",
          desc: "Not included",
          desc_vi: "Không có",
        },
      ],
      is_active: true,
      sort_order: 0,
    },
    {
      id: "pro",
      name: "Pro",
      name_vi: "Pro",
      description: "Weekly updates, early access and Pro community",
      description_vi: "Cập nhật hàng tuần, truy cập sớm và cộng đồng Pro",
      price: 49000,
      duration_days: 30,
      features: [
        {
          key: "ai_chat",
          value: 500,
          label: "AI Chat",
          label_vi: "Chat AI",
          desc: "500 credits/month",
          desc_vi: "500 credits/tháng",
        },
        {
          key: "showcase_limit",
          value: 3,
          label: "Project Views",
          label_vi: "Xem dự án",
          desc: "3 projects",
          desc_vi: "3 dự án",
        },
        {
          key: "brain_domains",
          value: 2,
          label: "Second Brain",
          label_vi: "Second Brain",
          desc: "2 brains",
          desc_vi: "2 brain",
        },
        {
          key: "brain_docs",
          value: 100,
          label: "Brain Docs",
          label_vi: "Docs nạp vào Brain",
          desc: "100 docs/brain",
          desc_vi: "100 docs/brain",
        },
        {
          key: "early_access_days",
          value: 3,
          label: "Early Access",
          label_vi: "Truy cập sớm",
          desc: "3 days early",
          desc_vi: "3 ngày",
        },
        {
          key: "email_updates",
          value: true,
          label: "Email Updates",
          label_vi: "Email cập nhật",
          desc: "Included",
          desc_vi: "Có",
        },
        {
          key: "investment_access",
          value: false,
          label: "Investment Access",
          label_vi: "Đầu tư dự án",
          desc: "Not included",
          desc_vi: "Không có",
        },
        {
          key: "community_pro",
          value: true,
          label: "Pro Community",
          label_vi: "Cộng đồng Pro",
          desc: "Exclusive Discord",
          desc_vi: "Discord độc quyền",
        },
      ],
      is_active: true,
      sort_order: 1,
    },
    {
      id: "vip",
      name: "VIP",
      name_vi: "VIP",
      description: "Real-time updates, priority access and exclusive benefits",
      description_vi: "Cập nhật real-time, truy cập ưu tiên và quyền lợi độc quyền",
      price: 99000,
      duration_days: 30,
      features: [
        {
          key: "ai_chat",
          value: 1200,
          label: "AI Chat",
          label_vi: "Chat AI",
          desc: "1200 credits/month",
          desc_vi: "1200 credits/tháng",
        },
        {
          key: "showcase_limit",
          value: -1,
          label: "Project Views",
          label_vi: "Xem dự án",
          desc: "Unlimited",
          desc_vi: "Không giới hạn",
        },
        {
          key: "brain_domains",
          value: 5,
          label: "Second Brain",
          label_vi: "Second Brain",
          desc: "5 brains",
          desc_vi: "5 brain",
        },
        {
          key: "brain_docs",
          value: 500,
          label: "Brain Docs",
          label_vi: "Docs nạp vào Brain",
          desc: "500 docs/brain",
          desc_vi: "500 docs/brain",
        },
        {
          key: "early_access_days",
          value: 7,
          label: "Early Access",
          label_vi: "Truy cập sớm",
          desc: "7 days early",
          desc_vi: "7 ngày",
        },
        {
          key: "email_updates",
          value: true,
          label: "Email Updates",
          label_vi: "Email cập nhật",
          desc: "Included",
          desc_vi: "Có",
        },
        {
          key: "investment_access",
          value: true,
          label: "Investment Access",
          label_vi: "Đầu tư dự án",
          desc: "Invest in projects",
          desc_vi: "Đầu tư vào dự án",
        },
        {
          key: "community_pro",
          value: true,
          label: "Pro Community",
          label_vi: "Cộng đồng Pro",
          desc: "Exclusive Discord",
          desc_vi: "Discord độc quyền",
        },
      ],
      is_active: true,
      sort_order: 2,
    },
  ];
}

// ============= UTILITY =============

/**
 * Generate transfer content for subscription payment
 */
export function generateTransferContent(planId: string, userName: string): string {
  const nameClean = userName.replace(/\s+/g, "").toUpperCase().slice(0, 10);
  const dateStr = new Date().toLocaleDateString("vi-VN").replace(/\//g, "");
  return `SUB${planId.toUpperCase()} ${nameClean} ${dateStr}`;
}
