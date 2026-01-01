/**
 * Feature Gate Hook & Component
 * Simple: Boolean check + Number limits
 */

import { useSubscription } from "./useSubscription";

// Feature keys matching database
export type BooleanFeature =
  | "showcase_premium"
  | "investment_access"
  | "priority_support"
  | "community_pro"
  | "beta_access"
  | "direct_chat"
  | "roadmap_strategy";

export type NumberFeature =
  | "showcase_limit"
  | "consultation_discount"
  | "early_access_days"
  | "support_response_hours";

export type FeatureKey = BooleanFeature | NumberFeature;

// Default values for free users (fallback)
const FREE_DEFAULTS: Record<FeatureKey, boolean | number> = {
  showcase_premium: false,
  investment_access: false,
  priority_support: false,
  community_pro: false,
  beta_access: false,
  direct_chat: false,
  roadmap_strategy: false,
  showcase_limit: 3,
  consultation_discount: 0,
  early_access_days: 0,
  support_response_hours: 0,
};

/**
 * Hook to check feature access
 *
 * @example
 * // Boolean check
 * const { canAccess } = useFeature('showcase_premium');
 * if (!canAccess) return <UpgradePrompt />;
 *
 * @example
 * // Number limit
 * const { value } = useFeature('consultation_discount');
 * const finalPrice = price * (1 - value / 100);
 */
export function useFeature(featureKey: FeatureKey) {
  const { subscription, loading, planId } = useSubscription();

  // Get features from subscription plan
  const features = subscription?.plan?.features as Record<string, boolean | number> | undefined;

  // Get value with fallback
  const value = features?.[featureKey] ?? FREE_DEFAULTS[featureKey];

  // Boolean features: direct check
  // Number features: -1 means unlimited, 0 means disabled, >0 means limit
  const canAccess = typeof value === "boolean" ? value : value === -1 || value > 0;

  // For number features
  const limit = typeof value === "number" ? value : undefined;
  const isUnlimited = limit === -1;

  return {
    canAccess,
    value,
    limit,
    isUnlimited,
    loading,
    planId,
    // Helpers
    isFree: planId === "free",
    isPro: planId === "pro",
    isVip: planId === "vip",
  };
}

/**
 * Hook to check multiple features at once
 *
 * @example
 * const { features } = useFeatures(['showcase_premium', 'investment_access']);
 * if (features.showcase_premium.canAccess) { ... }
 */
export function useFeatures(featureKeys: FeatureKey[]) {
  const { subscription, loading, planId } = useSubscription();
  const features = subscription?.plan?.features as Record<string, boolean | number> | undefined;

  const result = featureKeys.reduce((acc, key) => {
    const value = features?.[key] ?? FREE_DEFAULTS[key];
    acc[key] = {
      canAccess: typeof value === "boolean" ? value : value === -1 || value > 0,
      value,
    };
    return acc;
  }, {} as Record<FeatureKey, { canAccess: boolean; value: boolean | number }>);

  return {
    features: result,
    loading,
    planId,
  };
}

/**
 * Get consultation discount percentage
 */
export function useConsultationDiscount() {
  const { value } = useFeature("consultation_discount");
  return typeof value === "number" ? value : 0;
}

/**
 * Check if user can view showcase (with limit)
 */
export function useShowcaseAccess() {
  const { canAccess, limit, isUnlimited } = useFeature("showcase_limit");
  const { canAccess: isPremium } = useFeature("showcase_premium");

  return {
    canView: canAccess,
    limit: isUnlimited ? Infinity : limit ?? 3,
    isPremium,
    isUnlimited,
  };
}
