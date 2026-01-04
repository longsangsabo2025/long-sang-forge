/**
 * Feature Gate Hook & Component
 * Simple: Boolean check + Number limits
 *
 * ELON AUDIT: Now supports User Override System
 * Admin can grant extra features to individual users
 */

import { useSubscription } from "./useSubscription";
import { useOverridesMap } from "./useUserOverrides";

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
  showcase_limit: 1, // Free = 1 project, Pro = 3, VIP = unlimited (-1)
  consultation_discount: 0,
  early_access_days: 0,
  support_response_hours: 0,
};

/**
 * Hook to check feature access
 * Now merges subscription features with user overrides
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
  const { overrides, isLoading: overridesLoading } = useOverridesMap();

  // Get features from subscription plan - features is an array of {key, value, ...}
  const featuresArray = subscription?.plan?.features as
    | Array<{ key: string; value: boolean | number }>
    | undefined;

  // Find the feature by key in the array
  const foundFeature = featuresArray?.find((f) => f.key === featureKey);

  // Get base value from subscription plan or fallback
  const baseValue = foundFeature?.value ?? FREE_DEFAULTS[featureKey];

  // Check for user override (admin-granted special access)
  const overrideValue = overrides[featureKey];
  const hasOverride = overrideValue !== undefined;

  // Final value: override takes precedence
  // For number features, use MAX of base and override (more permissive)
  // For boolean features, use OR logic (if either is true, grant access)
  let value: boolean | number;
  if (hasOverride) {
    if (typeof baseValue === "number" && typeof overrideValue === "number") {
      // For limits: take the higher value (more access)
      // Special case: -1 means unlimited, always wins
      if (baseValue === -1 || overrideValue === -1) {
        value = -1;
      } else {
        value = Math.max(baseValue, overrideValue as number);
      }
    } else if (typeof baseValue === "boolean") {
      // For booleans: grant access if either is true
      value = baseValue || Boolean(overrideValue);
    } else {
      value = overrideValue as boolean | number;
    }
  } else {
    value = baseValue;
  }

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
    hasOverride,
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
  const featuresArray = subscription?.plan?.features as
    | Array<{ key: string; value: boolean | number }>
    | undefined;

  const result = featureKeys.reduce((acc, key) => {
    const foundFeature = featuresArray?.find((f) => f.key === key);
    const value = foundFeature?.value ?? FREE_DEFAULTS[key];
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
 * Includes user overrides for extra access
 */
export function useShowcaseAccess() {
  const { canAccess, limit, isUnlimited, hasOverride, planId } = useFeature("showcase_limit");
  const { canAccess: isPremium } = useFeature("showcase_premium");

  return {
    canView: canAccess,
    limit: isUnlimited ? Infinity : limit ?? 1, // Free = 1 project
    isPremium,
    isUnlimited,
    hasOverride,
    isFree: planId === "free",
    isPro: planId === "pro",
    isVip: planId === "vip",
  };
}
