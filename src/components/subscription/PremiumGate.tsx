import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import type { PlanId } from "@/lib/api/subscriptions";
import { ArrowRight, Crown, Lock, Zap } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface PremiumGateProps {
  /** Minimum plan required to view content */
  minPlan: PlanId;
  /** Content to show if user has access */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Feature name for display */
  featureName?: string;
  /** Feature description */
  featureDescription?: string;
  /** Show blurred preview of children */
  showBlurredPreview?: boolean;
}

const planDetails: Record<PlanId, { name: string; icon: ReactNode; color: string }> = {
  free: { name: "Free", icon: null, color: "" },
  pro: { name: "Pro", icon: <Zap className="h-5 w-5" />, color: "text-blue-500" },
  vip: { name: "VIP", icon: <Crown className="h-5 w-5" />, color: "text-amber-500" },
};

export default function PremiumGate({
  minPlan,
  children,
  fallback,
  featureName,
  featureDescription,
  showBlurredPreview = false,
}: PremiumGateProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { planId, loading } = useSubscription();

  const isVietnamese = i18n.language === "vi";

  // Plan hierarchy
  const planOrder: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    vip: 2,
  };

  const userPlanLevel = planOrder[planId] ?? 0;
  const requiredLevel = planOrder[minPlan] ?? 0;
  const hasAccess = userPlanLevel >= requiredLevel;

  // Show loading skeleton while checking subscription
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  // User has access - show content
  if (hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state UI
  const plan = planDetails[minPlan];

  return (
    <div className="relative">
      {/* Blurred Preview */}
      {showBlurredPreview && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="filter blur-sm opacity-50 pointer-events-none">{children}</div>
        </div>
      )}

      {/* Lock Overlay */}
      <Card className={`relative ${showBlurredPreview ? "bg-background/80 backdrop-blur-sm" : ""}`}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className={`p-4 rounded-full bg-muted mb-4 ${plan.color}`}>
            <Lock className="h-8 w-8" />
          </div>

          <CardTitle className="mb-2 flex items-center gap-2">
            {plan.icon}
            <span>
              {isVietnamese ? "Yêu cầu gói" : "Requires"} {plan.name}
            </span>
          </CardTitle>

          <CardDescription className="max-w-md mb-6">
            {featureDescription ||
              (isVietnamese
                ? `Tính năng này chỉ dành cho thành viên ${plan.name}. Nâng cấp để mở khóa.`
                : `This feature is only available for ${plan.name} members. Upgrade to unlock.`)}
          </CardDescription>

          {featureName && (
            <div className="text-sm text-muted-foreground mb-4">🔒 {featureName}</div>
          )}

          <div className="flex gap-3">
            {!user ? (
              <Button
                onClick={() => navigate("/login", { state: { from: window.location.pathname } })}
              >
                {isVietnamese ? "Đăng nhập" : "Login"}
              </Button>
            ) : (
              <Button onClick={() => navigate("/subscription")}>
                {isVietnamese ? "Nâng cấp ngay" : "Upgrade Now"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook version for conditional rendering
 */
export function usePremiumAccess(minPlan: PlanId): { hasAccess: boolean; loading: boolean } {
  const { planId, loading } = useSubscription();

  const planOrder: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    vip: 2,
  };

  const userPlanLevel = planOrder[planId] ?? 0;
  const requiredLevel = planOrder[minPlan] ?? 0;

  return {
    hasAccess: userPlanLevel >= requiredLevel,
    loading,
  };
}
