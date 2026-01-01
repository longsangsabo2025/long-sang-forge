import { supabase } from "@/integrations/supabase/client";

// =====================================================
// Discount Code API
// =====================================================

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  valid_from?: string;
  valid_until?: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  applicable_plans: string[];
  applicable_cycles: string[];
  min_amount: number;
  created_at: string;
}

export interface DiscountValidation {
  is_valid: boolean;
  discount_id: string | null;
  discount_type: string | null;
  discount_value: number;
  final_amount: number;
  error_message: string | null;
}

/**
 * Validate a discount code and calculate the discount
 */
export async function validateDiscountCode(
  code: string,
  planId: string,
  billingCycle: "monthly" | "yearly",
  amount: number
): Promise<DiscountValidation> {
  const { data, error } = await supabase.rpc("validate_discount_code", {
    p_code: code.toUpperCase(),
    p_plan_id: planId,
    p_billing_cycle: billingCycle,
    p_amount: amount,
  });

  if (error) {
    console.error("Error validating discount code:", error);
    return {
      is_valid: false,
      discount_id: null,
      discount_type: null,
      discount_value: 0,
      final_amount: amount,
      error_message: "Lỗi kiểm tra mã giảm giá",
    };
  }

  return (
    data?.[0] || {
      is_valid: false,
      discount_id: null,
      discount_type: null,
      discount_value: 0,
      final_amount: amount,
      error_message: "Mã giảm giá không hợp lệ",
    }
  );
}

/**
 * Get all active discount codes (admin)
 */
export async function getDiscountCodes(): Promise<DiscountCode[]> {
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discount codes:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new discount code (admin)
 */
export async function createDiscountCode(
  code: Omit<DiscountCode, "id" | "created_at" | "used_count">
): Promise<DiscountCode | null> {
  const { data, error } = await supabase
    .from("discount_codes")
    .insert({
      code: code.code.toUpperCase(),
      description: code.description,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      valid_from: code.valid_from,
      valid_until: code.valid_until,
      max_uses: code.max_uses,
      is_active: code.is_active,
      applicable_plans: code.applicable_plans,
      applicable_cycles: code.applicable_cycles,
      min_amount: code.min_amount,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating discount code:", error);
    return null;
  }

  return data;
}

/**
 * Update a discount code (admin)
 */
export async function updateDiscountCode(
  id: string,
  updates: Partial<DiscountCode>
): Promise<boolean> {
  const { error } = await supabase.from("discount_codes").update(updates).eq("id", id);

  if (error) {
    console.error("Error updating discount code:", error);
    return false;
  }

  return true;
}

/**
 * Delete a discount code (admin)
 */
export async function deleteDiscountCode(id: string): Promise<boolean> {
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting discount code:", error);
    return false;
  }

  return true;
}

// =====================================================
// Feature Usage API
// =====================================================

export interface FeatureUsage {
  feature_key: string;
  usage_count: number;
  usage_date: string;
}

/**
 * Track feature usage (increment counter)
 */
export async function trackFeatureUsage(
  featureKey: string,
  increment: number = 1
): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase.rpc("track_feature_usage", {
    p_user_id: user.id,
    p_feature_key: featureKey,
    p_increment: increment,
  });

  if (error) {
    console.error("Error tracking feature usage:", error);
    return 0;
  }

  return data || 0;
}

/**
 * Get current user's feature usage for a specific feature
 */
export async function getFeatureUsage(
  featureKey: string,
  period: "day" | "week" | "month" = "month"
): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase.rpc("get_user_feature_usage", {
    p_user_id: user.id,
    p_feature_key: featureKey,
    p_period: period,
  });

  if (error) {
    console.error("Error getting feature usage:", error);
    return 0;
  }

  return data || 0;
}

/**
 * Get all feature usage for current user (for dashboard)
 */
export async function getAllFeatureUsage(): Promise<Record<string, number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  // Get this month's start date
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("feature_usage")
    .select("feature_key, usage_count")
    .eq("user_id", user.id)
    .gte("usage_date", startOfMonth.toISOString().split("T")[0]);

  if (error) {
    console.error("Error getting all feature usage:", error);
    return {};
  }

  // Aggregate by feature key
  const usage: Record<string, number> = {};
  for (const row of data || []) {
    usage[row.feature_key] = (usage[row.feature_key] || 0) + row.usage_count;
  }

  return usage;
}

// =====================================================
// Webhook Logs API (Admin)
// =====================================================

export interface WebhookLog {
  id: string;
  webhook_type: string;
  payload: Record<string, unknown>;
  status: "received" | "processed" | "failed" | "retry_pending" | "retry_failed";
  error_message?: string;
  retry_count: number;
  amount?: number;
  transfer_content?: string;
  matched_user_id?: string;
  created_at: string;
  processed_at?: string;
}

/**
 * Get webhook logs (admin)
 */
export async function getWebhookLogs(filters?: {
  status?: string;
  webhookType?: string;
  limit?: number;
}): Promise<WebhookLog[]> {
  let query = supabase.from("webhook_logs").select("*").order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.webhookType) {
    query = query.eq("webhook_type", filters.webhookType);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  } else {
    query = query.limit(100);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching webhook logs:", error);
    return [];
  }

  return data || [];
}

/**
 * Retry a failed webhook (admin)
 */
export async function retryWebhook(logId: string): Promise<boolean> {
  // Update status to retry_pending
  const { data: log, error: fetchError } = await supabase
    .from("webhook_logs")
    .select("*")
    .eq("id", logId)
    .single();

  if (fetchError || !log) {
    console.error("Error fetching webhook log:", fetchError);
    return false;
  }

  // Call the webhook function again with the same payload
  const { error: invokeError } = await supabase.functions.invoke("casso-webhook", {
    body: log.payload,
  });

  if (invokeError) {
    // Mark as retry_failed
    await supabase
      .from("webhook_logs")
      .update({
        status: "retry_failed",
        retry_count: log.retry_count + 1,
        error_message: invokeError.message,
      })
      .eq("id", logId);

    return false;
  }

  // Mark original as processed
  await supabase
    .from("webhook_logs")
    .update({ status: "processed", processed_at: new Date().toISOString() })
    .eq("id", logId);

  return true;
}

// =====================================================
// Feature Keys Constants
// =====================================================

export const FEATURE_KEYS = {
  AI_CHAT: "ai_chat",
  AI_IMAGE: "ai_image",
  CONSULTATION_BOOK: "consultation_book",
  SHOWCASE_VIEW: "showcase_view",
  EXPORT_PDF: "export_pdf",
  PRIORITY_SUPPORT: "priority_support",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];
