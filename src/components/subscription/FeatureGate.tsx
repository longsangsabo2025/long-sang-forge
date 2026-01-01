/**
 * Feature Gate Components
 * Simple wrappers to gate content based on subscription
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type BooleanFeature, useFeature } from "@/hooks/useFeature";
import { Crown, Lock, Sparkles, Zap } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface FeatureGateProps {
  feature: BooleanFeature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Gate content behind a feature
 *
 * @example
 * <FeatureGate feature="investment_access">
 *   <InvestmentDashboard />
 * </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback, showUpgrade = true }: FeatureGateProps) {
  const { canAccess, loading } = useFeature(feature);

  if (loading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />;
  }

  if (canAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    return <UpgradePrompt feature={feature} />;
  }

  return null;
}

// Feature info for upgrade prompts
const FEATURE_INFO: Record<
  BooleanFeature,
  { title: string; titleVi: string; desc: string; descVi: string; minPlan: "pro" | "vip" }
> = {
  showcase_premium: {
    title: "Premium Showcase",
    titleVi: "Showcase Cao Cấp",
    desc: "Access all projects with source hints",
    descVi: "Xem tất cả dự án + gợi ý code",
    minPlan: "pro",
  },
  investment_access: {
    title: "Investment Access",
    titleVi: "Mở Khóa Đầu Tư",
    desc: "Priority investment opportunities with better terms",
    descVi: "Cơ hội đầu tư ưu tiên với điều khoản tốt hơn",
    minPlan: "vip",
  },
  priority_support: {
    title: "Priority Support",
    titleVi: "Hỗ Trợ Ưu Tiên",
    desc: "Get responses within 24 hours",
    descVi: "Phản hồi trong vòng 24 giờ",
    minPlan: "vip",
  },
  community_pro: {
    title: "Pro Community",
    titleVi: "Cộng Đồng Pro",
    desc: "Access exclusive Discord channels",
    descVi: "Truy cập kênh Discord độc quyền",
    minPlan: "pro",
  },
  beta_access: {
    title: "Beta Access",
    titleVi: "Truy Cập Beta",
    desc: "Test new features before everyone else",
    descVi: "Trải nghiệm tính năng mới trước",
    minPlan: "vip",
  },
  direct_chat: {
    title: "Direct Chat",
    titleVi: "Chat Trực Tiếp",
    desc: "Chat directly with the founder",
    descVi: "Nhắn tin trực tiếp với founder",
    minPlan: "vip",
  },
  roadmap_strategy: {
    title: "Strategy Roadmap",
    titleVi: "Lộ Trình Chiến Lược",
    desc: "See behind-the-scenes strategy and plans",
    descVi: "Xem chiến lược và kế hoạch hậu trường",
    minPlan: "vip",
  },
};

interface UpgradePromptProps {
  feature: BooleanFeature;
  inline?: boolean;
}

/**
 * Upgrade prompt for locked features
 */
export function UpgradePrompt({ feature, inline = false }: UpgradePromptProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  const isVi = i18n.language === "vi";
  const info = FEATURE_INFO[feature];
  const title = isVi ? info.titleVi : info.title;
  const desc = isVi ? info.descVi : info.desc;
  const minPlan = info.minPlan;

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Lock className="h-4 w-4" />
        <span>{minPlan === "vip" ? "VIP" : "Pro"}</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-dashed border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6">
        {/* Blur overlay effect */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 p-3">
            <Lock className="h-6 w-6 text-white" />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">{desc}</p>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {minPlan === "vip" ? (
                <Crown className="h-4 w-4 mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isVi ? `Nâng cấp ${minPlan.toUpperCase()}` : `Upgrade to ${minPlan.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </div>

      <UpgradeDialog open={showDialog} onOpenChange={setShowDialog} minPlan={minPlan} />
    </>
  );
}

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minPlan: "pro" | "vip";
}

function UpgradeDialog({ open, onOpenChange, minPlan }: UpgradeDialogProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isVi = i18n.language === "vi";

  const plans = {
    pro: {
      name: "Pro",
      price: "49,000đ",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
    },
    vip: {
      name: "VIP",
      price: "99,000đ",
      icon: Crown,
      color: "from-amber-500 to-orange-500",
    },
  };

  const plan = plans[minPlan];
  const Icon = plan.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {isVi ? `Nâng cấp lên ${plan.name}` : `Upgrade to ${plan.name}`}
          </DialogTitle>
          <DialogDescription>
            {isVi
              ? `Chỉ ${plan.price}/tháng để mở khóa tất cả tính năng ${plan.name}`
              : `Only ${plan.price}/month to unlock all ${plan.name} features`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits preview */}
          <div className="space-y-2">
            {minPlan === "pro" ? (
              <>
                <BenefitItem
                  icon="✓"
                  text={isVi ? "Showcase không giới hạn" : "Unlimited showcase"}
                />
                <BenefitItem
                  icon="✓"
                  text={isVi ? "Giảm 10% tư vấn" : "10% consultation discount"}
                />
                <BenefitItem icon="✓" text={isVi ? "Truy cập sớm 3 ngày" : "3 days early access"} />
                <BenefitItem icon="✓" text={isVi ? "Cộng đồng Pro" : "Pro community"} />
              </>
            ) : (
              <>
                <BenefitItem icon="👑" text={isVi ? "Tất cả quyền Pro +" : "All Pro benefits +"} />
                <BenefitItem icon="✓" text={isVi ? "Mở khóa đầu tư" : "Investment access"} />
                <BenefitItem
                  icon="✓"
                  text={isVi ? "Chat trực tiếp founder" : "Direct founder chat"}
                />
                <BenefitItem icon="✓" text={isVi ? "Hỗ trợ ưu tiên 24h" : "24h priority support"} />
                <BenefitItem
                  icon="✓"
                  text={isVi ? "Beta + Strategy access" : "Beta + Strategy access"}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {isVi ? "Để sau" : "Maybe later"}
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate("/subscription");
            }}
            className={`flex-1 bg-gradient-to-r ${plan.color} hover:opacity-90`}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isVi ? "Xem chi tiết" : "View plans"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

/**
 * Small badge to show feature is locked
 */
export function LockedBadge({ plan = "pro" }: { plan?: "pro" | "vip" }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
      <Lock className="h-3 w-3" />
      {plan.toUpperCase()}
    </span>
  );
}
