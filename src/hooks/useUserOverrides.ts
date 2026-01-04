/**
 * Hook to fetch user feature overrides from database
 * ELON AUDIT: User Override System
 *
 * Cho phép admin cấp quyền đặc biệt cho từng user,
 * ví dụ: grant thêm showcase_limit mà không cần upgrade plan
 */

import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface UserFeatureOverride {
  id: string;
  user_id: string;
  feature_key: string;
  feature_value: number | boolean | string;
  reason: string | null;
  granted_by: string | null;
  expires_at: string | null;
  created_at: string;
}

/**
 * Fetch all active overrides for current user
 */
export function useUserOverrides() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-feature-overrides", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_feature_overrides")
        .select("*")
        .eq("user_id", user.id)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (error) {
        console.error("Error fetching user overrides:", error);
        return [];
      }

      return (data || []) as UserFeatureOverride[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get override value for a specific feature
 */
export function useFeatureOverride(featureKey: string) {
  const { data: overrides, isLoading } = useUserOverrides();

  const override = overrides?.find((o) => o.feature_key === featureKey);

  return {
    hasOverride: !!override,
    value: override?.feature_value ?? null,
    reason: override?.reason ?? null,
    expiresAt: override?.expires_at ?? null,
    isLoading,
  };
}

/**
 * Get a map of all overrides keyed by feature_key
 */
export function useOverridesMap() {
  const { data: overrides, isLoading } = useUserOverrides();

  const map = (overrides || []).reduce((acc, override) => {
    acc[override.feature_key] = override.feature_value;
    return acc;
  }, {} as Record<string, number | boolean | string>);

  return { overrides: map, isLoading };
}
