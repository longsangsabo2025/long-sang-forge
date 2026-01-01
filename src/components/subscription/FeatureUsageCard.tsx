import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface FeatureUsageCardProps {
  featureKey: string;
  featureName: string;
  description?: string;
  icon?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureUsageCard({
  featureKey,
  featureName,
  description,
  icon,
  showUpgradePrompt = true,
}: FeatureUsageCardProps) {
  const { t } = useTranslation();
  const { checkFeatureLimit, getUsagePercentage, isNearLimit } = useFeatureUsage();

  const limit = checkFeatureLimit(featureKey as any);
  const percentage = getUsagePercentage(featureKey as any);
  const nearLimit = isNearLimit(featureKey as any);

  if (limit.limit === null) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon || <Zap className="h-4 w-4" />}
            {featureName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t("subscription.usage.unlimited", "Không giới hạn")}
            </span>
          </div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(nearLimit && "border-amber-300")}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon || <Zap className="h-4 w-4" />}
          {featureName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("subscription.usage.used", "Đã dùng")}</span>
            <span className={cn("font-medium", nearLimit && "text-amber-600")}>
              {limit.used} / {limit.limit}
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn(
              "h-2",
              nearLimit && "[&>div]:bg-amber-500",
              percentage >= 100 && "[&>div]:bg-red-500"
            )}
          />
        </div>

        {nearLimit && limit.remaining !== null && limit.remaining > 0 && (
          <Alert className="border-amber-200 bg-amber-50 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-xs">
              {t("subscription.usage.nearLimit", "Còn {{remaining}} lượt", {
                remaining: limit.remaining,
              })}
            </AlertDescription>
          </Alert>
        )}

        {!limit.allowed && showUpgradePrompt && (
          <Alert className="border-red-200 bg-red-50 py-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-xs flex items-center justify-between">
              <span>{t("subscription.usage.limitReached", "Đã hết lượt!")}</span>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                <Link to="/subscription">{t("subscription.upgrade", "Nâng cấp")}</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard showing all feature usage
 */
export function FeatureUsageDashboard() {
  const { t } = useTranslation();
  const { usage, loading, FEATURE_KEYS } = useFeatureUsage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const features = [
    {
      key: FEATURE_KEYS.AI_CHAT,
      name: t("features.aiChat", "AI Chat"),
      description: t("features.aiChatDesc", "Trò chuyện với AI"),
      icon: "💬",
    },
    {
      key: FEATURE_KEYS.AI_IMAGE,
      name: t("features.aiImage", "AI Image"),
      description: t("features.aiImageDesc", "Tạo hình ảnh AI"),
      icon: "🎨",
    },
    {
      key: FEATURE_KEYS.CONSULTATION_BOOK,
      name: t("features.consultation", "Đặt lịch tư vấn"),
      description: t("features.consultationDesc", "Tư vấn 1-1"),
      icon: "📅",
    },
    {
      key: FEATURE_KEYS.SHOWCASE_VIEW,
      name: t("features.showcase", "Showcase"),
      description: t("features.showcaseDesc", "Xem dự án showcase"),
      icon: "✨",
    },
    {
      key: FEATURE_KEYS.EXPORT_PDF,
      name: t("features.exportPdf", "Export PDF"),
      description: t("features.exportPdfDesc", "Xuất báo cáo PDF"),
      icon: "📄",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {t("subscription.usage.title", "Sử dụng tính năng tháng này")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <FeatureUsageCard
            key={feature.key}
            featureKey={feature.key}
            featureName={feature.name}
            description={feature.description}
            icon={<span className="text-lg">{feature.icon}</span>}
          />
        ))}
      </div>
    </div>
  );
}
