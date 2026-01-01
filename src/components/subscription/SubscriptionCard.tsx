import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Crown, RefreshCw, Rocket, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const planIcons: Record<string, React.ReactNode> = {
  free: <Rocket className="h-6 w-6" />,
  pro: <Zap className="h-6 w-6" />,
  vip: <Crown className="h-6 w-6" />,
};

const planColors: Record<string, string> = {
  free: "bg-slate-100 text-slate-700 border-slate-200",
  pro: "bg-blue-100 text-blue-700 border-blue-200",
  vip: "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200",
};

export default function SubscriptionCard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    subscription,
    planId,
    isPro,
    isVip,
    isFree,
    daysRemaining,
    isExpiringSoon,
    loading,
    refetch,
  } = useSubscription();

  const isVietnamese = i18n.language === "vi";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const planName =
    subscription?.plan?.name_vi || subscription?.plan?.name || (isVietnamese ? "Miễn Phí" : "Free");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={`overflow-hidden ${
          isVip ? "border-amber-300 shadow-amber-100 shadow-lg" : isPro ? "border-blue-200" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${planColors[planId]}`}>{planIcons[planId]}</div>
              <div>
                <CardTitle className="text-lg">
                  {isVietnamese ? "Gói đăng ký" : "Subscription"}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline" className={planColors[planId]}>
                    {planName}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Subscription Status */}
          {!isFree && subscription ? (
            <>
              {/* Days Remaining */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {isVietnamese ? "Còn lại" : "Remaining"}
                  </span>
                  <span className={isExpiringSoon ? "text-orange-500 font-medium" : ""}>
                    {daysRemaining} {isVietnamese ? "ngày" : "days"}
                  </span>
                </div>
                <Progress
                  value={(daysRemaining / 30) * 100}
                  className={isExpiringSoon ? "bg-orange-100" : ""}
                />
              </div>

              {/* Expiring Soon Warning */}
              {isExpiringSoon && (
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm">
                  <p className="text-orange-700 dark:text-orange-300">
                    ⚠️{" "}
                    {isVietnamese
                      ? "Gói của bạn sắp hết hạn. Gia hạn ngay để không bị gián đoạn."
                      : "Your plan is expiring soon. Renew now to avoid interruption."}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {isExpiringSoon && (
                  <Button onClick={() => navigate("/subscription")} className="flex-1">
                    {isVietnamese ? "Gia hạn" : "Renew"}
                  </Button>
                )}
                {!isVip && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/subscription")}
                    className="flex-1"
                  >
                    {isVietnamese ? "Nâng cấp" : "Upgrade"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Free Plan Message */}
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  {isVietnamese
                    ? "Nâng cấp để truy cập đầy đủ các tính năng premium"
                    : "Upgrade to access all premium features"}
                </p>
                <Button onClick={() => navigate("/subscription")}>
                  {isVietnamese ? "Xem các gói" : "View Plans"}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
