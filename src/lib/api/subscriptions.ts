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

// ============= API FUNCTIONS =============

/**
 * Parse features field - ensures it's always an array
 */
function parseFeatures(features: any): SubscriptionFeature[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
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

function getDefaultPlans(): SubscriptionPlan[] {
  return [
    {
      id: "free",
      name: "Free",
      name_vi: "Miễn Phí",
      description: "Basic access to AI updates and community",
      description_vi: "Truy cập cơ bản vào cập nhật AI và cộng đồng",
      price: 0,
      duration_days: 36500,
      features: [
        {
          key: "ai_updates",
          value: "monthly",
          label: "AI Updates",
          label_vi: "Cập nhật AI",
          desc: "Monthly digest",
          desc_vi: "Bản tin hàng tháng",
        },
        {
          key: "showcase_access",
          value: 3,
          label: "Showcase",
          label_vi: "Showcase",
          desc: "3 basic projects",
          desc_vi: "3 dự án cơ bản",
        },
        {
          key: "consultation_discount",
          value: 0,
          label: "Discount",
          label_vi: "Giảm giá",
          desc: "0%",
          desc_vi: "0%",
        },
      ],
      is_active: true,
      sort_order: 0,
    },
    {
      id: "pro",
      name: "Pro",
      name_vi: "Pro",
      description: "Weekly updates, early access, and Pro community",
      description_vi: "Cập nhật hàng tuần, truy cập sớm và cộng đồng Pro",
      price: 49000,
      duration_days: 30,
      features: [
        {
          key: "ai_updates",
          value: "weekly",
          label: "AI Updates",
          label_vi: "Cập nhật AI",
          desc: "Weekly insights",
          desc_vi: "Thông tin hàng tuần",
        },
        {
          key: "showcase_access",
          value: 10,
          label: "Showcase",
          label_vi: "Showcase",
          desc: "10+ projects",
          desc_vi: "10+ dự án",
        },
        {
          key: "consultation_discount",
          value: 10,
          label: "Discount",
          label_vi: "Giảm giá",
          desc: "10%",
          desc_vi: "10%",
        },
      ],
      is_active: true,
      sort_order: 1,
    },
    {
      id: "vip",
      name: "VIP",
      name_vi: "VIP",
      description: "Real-time updates, priority access, and exclusive benefits",
      description_vi: "Cập nhật real-time, truy cập ưu tiên và quyền lợi độc quyền",
      price: 99000,
      duration_days: 30,
      features: [
        {
          key: "ai_updates",
          value: "realtime",
          label: "AI Updates",
          label_vi: "Cập nhật AI",
          desc: "Real-time + Early",
          desc_vi: "Real-time + Sớm",
        },
        {
          key: "showcase_access",
          value: "unlimited",
          label: "Showcase",
          label_vi: "Showcase",
          desc: "Unlimited",
          desc_vi: "Không giới hạn",
        },
        {
          key: "consultation_discount",
          value: 20,
          label: "Discount",
          label_vi: "Giảm giá",
          desc: "20%",
          desc_vi: "20%",
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
