import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  getCurrentSubscription,
  getSubscriptionPlans,
  type PlanId,
  type SubscriptionPlan,
  type UserSubscription,
} from "@/lib/api/subscriptions";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook to get current user's subscription with real-time updates
 */
export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sub = await getCurrentSubscription();
      setSubscription(sub);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Real-time subscription updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "user_subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch to get full data with plan details when subscription changes
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  // Computed values
  const planId = (subscription?.plan_id || "free") as PlanId;
  const isPro = planId === "pro" || planId === "vip";
  const isVip = planId === "vip";
  const isFree = planId === "free" || !subscription;
  const daysRemaining = subscription?.days_remaining ?? 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

  return {
    subscription,
    planId,
    isPro,
    isVip,
    isFree,
    daysRemaining,
    isExpiringSoon,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get all subscription plans
 */
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await getSubscriptionPlans();
        setPlans(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return { plans, loading, error };
}

/**
 * Hook to check if user has minimum plan
 */
export function useHasPlan(minPlan: PlanId) {
  const { subscription, loading } = useSubscription();

  if (loading) return { hasPlan: false, loading: true };

  const planOrder: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    vip: 2,
  };

  const userPlanOrder = planOrder[(subscription?.plan_id as PlanId) || "free"] ?? 0;
  const requiredOrder = planOrder[minPlan] ?? 0;

  return { hasPlan: userPlanOrder >= requiredOrder, loading: false };
}

/**
 * Hook to get a specific feature value
 */
export function useFeature<T = any>(featureKey: string, defaultValue: T): T {
  const { subscription, loading } = useSubscription();
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (loading) return;

    const features = subscription?.plan?.features || [];
    const feature = features.find((f: any) => f.key === featureKey);
    setValue(feature?.value ?? defaultValue);
  }, [subscription, loading, featureKey, defaultValue]);

  return value;
}
