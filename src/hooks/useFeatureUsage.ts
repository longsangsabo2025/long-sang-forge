import { useAuth } from "@/components/auth/AuthProvider";
import {
  trackFeatureUsage as apiTrackFeatureUsage,
  FEATURE_KEYS,
  getAllFeatureUsage,
  type FeatureKey,
} from "@/lib/api/subscription-features";
import { useCallback, useEffect, useState } from "react";
import { useSubscription } from "./useSubscription";

interface FeatureLimit {
  allowed: boolean;
  limit: number | null;
  used: number;
  remaining: number | null;
}

// Feature limits by plan
const FEATURE_LIMITS: Record<string, Record<FeatureKey, number | true>> = {
  free: {
    [FEATURE_KEYS.AI_CHAT]: 5,
    [FEATURE_KEYS.AI_IMAGE]: 2,
    [FEATURE_KEYS.CONSULTATION_BOOK]: 1,
    [FEATURE_KEYS.SHOWCASE_VIEW]: 10,
    [FEATURE_KEYS.EXPORT_PDF]: 0,
    [FEATURE_KEYS.PRIORITY_SUPPORT]: 0,
  },
  pro: {
    [FEATURE_KEYS.AI_CHAT]: 100,
    [FEATURE_KEYS.AI_IMAGE]: 50,
    [FEATURE_KEYS.CONSULTATION_BOOK]: 5,
    [FEATURE_KEYS.SHOWCASE_VIEW]: true, // unlimited
    [FEATURE_KEYS.EXPORT_PDF]: 10,
    [FEATURE_KEYS.PRIORITY_SUPPORT]: 0,
  },
  vip: {
    [FEATURE_KEYS.AI_CHAT]: true, // unlimited
    [FEATURE_KEYS.AI_IMAGE]: true, // unlimited
    [FEATURE_KEYS.CONSULTATION_BOOK]: true, // unlimited
    [FEATURE_KEYS.SHOWCASE_VIEW]: true, // unlimited
    [FEATURE_KEYS.EXPORT_PDF]: true, // unlimited
    [FEATURE_KEYS.PRIORITY_SUPPORT]: true, // unlimited
  },
};

/**
 * Hook to track and check feature usage limits
 */
export function useFeatureUsage() {
  const { user } = useAuth();
  const { planId } = useSubscription();
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Load usage on mount
  useEffect(() => {
    if (user) {
      loadUsage();
    } else {
      setUsage({});
      setLoading(false);
    }
  }, [user]);

  const loadUsage = async () => {
    setLoading(true);
    const data = await getAllFeatureUsage();
    setUsage(data);
    setLoading(false);
  };

  /**
   * Track feature usage and return new count
   */
  const trackUsage = useCallback(
    async (featureKey: FeatureKey, increment: number = 1) => {
      if (!user) return 0;

      const newCount = await apiTrackFeatureUsage(featureKey, increment);
      setUsage((prev) => ({
        ...prev,
        [featureKey]: newCount,
      }));
      return newCount;
    },
    [user]
  );

  /**
   * Check if user can use a feature (within limits)
   */
  const checkFeatureLimit = useCallback(
    (featureKey: FeatureKey): FeatureLimit => {
      const used = usage[featureKey] || 0;
      const limits = FEATURE_LIMITS[planId] || FEATURE_LIMITS.free;
      const limitValue = limits[featureKey];

      // Unlimited
      if (limitValue === true) {
        return { allowed: true, limit: null, used, remaining: null };
      }

      // No access
      if (limitValue === 0) {
        return { allowed: false, limit: 0, used, remaining: 0 };
      }

      const remaining = Math.max(0, limitValue - used);
      return {
        allowed: remaining > 0,
        limit: limitValue,
        used,
        remaining,
      };
    },
    [planId, usage]
  );

  /**
   * Get usage percentage for a feature
   */
  const getUsagePercentage = useCallback(
    (featureKey: FeatureKey): number => {
      const { limit, used } = checkFeatureLimit(featureKey);
      if (limit === null || limit === 0) return 0;
      return Math.min(100, (used / limit) * 100);
    },
    [checkFeatureLimit]
  );

  /**
   * Check if user is near limit (>80%)
   */
  const isNearLimit = useCallback(
    (featureKey: FeatureKey): boolean => {
      return getUsagePercentage(featureKey) >= 80;
    },
    [getUsagePercentage]
  );

  return {
    usage,
    loading,
    trackUsage,
    checkFeatureLimit,
    getUsagePercentage,
    isNearLimit,
    refreshUsage: loadUsage,
    FEATURE_KEYS,
  };
}
