import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSubscription, useSubscriptionPlans } from "@/hooks/useSubscription";
import type { SubscriptionPlan } from "@/lib/api/subscriptions";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Crown,
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FeatureUsageDashboard } from "./FeatureUsageCard";
import SubscriptionPayment from "./SubscriptionPayment";

export function MySubscription() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, planId, daysRemaining, loading, refetch } = useSubscription();
  const { plans } = useSubscriptionPlans();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const isVietnamese = i18n.language === "vi";

  // Current plan info
  const currentPlan = plans.find((p) => p.id === planId);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  // Calculate progress for subscription
  const totalDays = subscription?.billing_cycle === "yearly" ? 365 : 30;
  const usedDays = totalDays - (daysRemaining || 0);
  const progressPercent = Math.min(100, (usedDays / totalDays) * 100);

  // Get upgrade options
  const upgradeOptions = plans.filter((p) => {
    const planOrder = { free: 0, pro: 1, vip: 2 };
    return planOrder[p.id as keyof typeof planOrder] > planOrder[planId as keyof typeof planOrder];
  });

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(false);
    setShowPayment(true);
  };

  const handleRenew = () => {
    const plan = plans.find((p) => p.id === planId);
    if (plan && plan.price > 0) {
      setSelectedPlan(plan);
      setShowRenewDialog(false);
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    refetch();
    toast.success(
      isVietnamese
        ? "Đã gửi yêu cầu! Vui lòng chuyển khoản để kích hoạt."
        : "Request sent! Please transfer to activate."
    );
  };

  // Calculate yearly price (10 months = 17% off)
  const getYearlyPrice = (monthlyPrice: number) => monthlyPrice * 10;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showPayment && selectedPlan) {
    const actualPrice =
      billingCycle === "yearly" ? getYearlyPrice(selectedPlan.price) : selectedPlan.price;

    return (
      <SubscriptionPayment
        plan={selectedPlan}
        billingCycle={billingCycle}
        actualPrice={actualPrice}
        onComplete={handlePaymentComplete}
        onBack={() => {
          setShowPayment(false);
          setSelectedPlan(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isVietnamese ? "Gói Đăng Ký Của Tôi" : "My Subscription"}
          </h1>
          <p className="text-muted-foreground">
            {isVietnamese
              ? "Quản lý gói đăng ký và xem lịch sử"
              : "Manage your subscription and view history"}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {isVietnamese ? "Làm mới" : "Refresh"}
        </Button>
      </div>

      {/* Expiring Soon Alert */}
      {isExpiringSoon && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-700">
                  {isVietnamese ? "Gói sắp hết hạn!" : "Subscription expiring soon!"}
                </h3>
                <p className="text-sm text-orange-600">
                  {isVietnamese
                    ? `Còn ${daysRemaining} ngày. Gia hạn ngay để tiếp tục sử dụng.`
                    : `${daysRemaining} days remaining. Renew now to continue.`}
                </p>
              </div>
              <Button onClick={() => setShowRenewDialog(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {isVietnamese ? "Gia hạn" : "Renew"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Card */}
      <Card
        className={
          planId === "vip"
            ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
            : planId === "pro"
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : ""
        }
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {planId === "vip" ? (
                <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              ) : planId === "pro" ? (
                <div className="p-3 rounded-full bg-blue-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="p-3 rounded-full bg-slate-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">
                  {isVietnamese ? currentPlan?.name_vi : currentPlan?.name}
                </CardTitle>
                <CardDescription>
                  {isVietnamese ? currentPlan?.description_vi : currentPlan?.description}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={isExpired ? "destructive" : "default"}
              className={
                isExpired
                  ? ""
                  : planId === "vip"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : planId === "pro"
                  ? "bg-blue-500"
                  : ""
              }
            >
              {isExpired
                ? isVietnamese
                  ? "Hết hạn"
                  : "Expired"
                : subscription?.billing_cycle === "yearly"
                ? isVietnamese
                  ? "Gói năm"
                  : "Yearly"
                : isVietnamese
                ? "Gói tháng"
                : "Monthly"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress */}
          {planId !== "free" && subscription && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isVietnamese ? "Thời gian sử dụng" : "Usage period"}
                </span>
                <span className="font-medium">
                  {daysRemaining} {isVietnamese ? "ngày còn lại" : "days left"}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {isVietnamese ? "Bắt đầu" : "Started"}:{" "}
                  {new Date(subscription.starts_at).toLocaleDateString("vi-VN")}
                </span>
                <span>
                  {isVietnamese ? "Hết hạn" : "Expires"}:{" "}
                  {new Date(subscription.expires_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          )}

          {/* Features */}
          <div>
            <h4 className="font-medium mb-3">
              {isVietnamese ? "Quyền lợi của bạn" : "Your benefits"}
            </h4>
            <div className="grid gap-2">
              {(Array.isArray(currentPlan?.features) ? currentPlan.features : [])
                .slice(0, 5)
                .map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{isVietnamese ? feature.label_vi : feature.label}</span>
                    <span className="text-muted-foreground">
                      - {isVietnamese ? feature.desc_vi : feature.desc}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          {planId === "free" ? (
            <Button onClick={() => setShowUpgradeDialog(true)} className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              {isVietnamese ? "Nâng cấp ngay" : "Upgrade Now"}
            </Button>
          ) : (
            <>
              {upgradeOptions.length > 0 && (
                <Button variant="outline" onClick={() => setShowUpgradeDialog(true)}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {isVietnamese ? "Nâng cấp" : "Upgrade"}
                </Button>
              )}
              <Button onClick={() => setShowRenewDialog(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {isVietnamese ? "Gia hạn" : "Renew"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Feature Usage */}
      <FeatureUsageDashboard />

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isVietnamese ? "Chọn gói nâng cấp" : "Choose upgrade plan"}</DialogTitle>
            <DialogDescription>
              {isVietnamese
                ? "Nâng cấp để mở khóa thêm nhiều tính năng"
                : "Upgrade to unlock more features"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {upgradeOptions.length === 0 && planId !== "free"
              ? plans
                  .filter((p) => p.price > 0)
                  .map((plan) => (
                    <Card key={plan.id} className="cursor-pointer hover:border-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {plan.id === "vip" ? (
                              <Crown className="h-6 w-6 text-amber-500" />
                            ) : (
                              <Zap className="h-6 w-6 text-blue-500" />
                            )}
                            <div>
                              <h3 className="font-semibold">
                                {isVietnamese ? plan.name_vi : plan.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {plan.price.toLocaleString("vi-VN")}đ/
                                {isVietnamese ? "tháng" : "month"}
                              </p>
                            </div>
                          </div>
                          <Button onClick={() => handleUpgrade(plan)}>
                            {isVietnamese ? "Chọn" : "Select"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              : upgradeOptions.map((plan) => (
                  <Card key={plan.id} className="cursor-pointer hover:border-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {plan.id === "vip" ? (
                            <Crown className="h-6 w-6 text-amber-500" />
                          ) : (
                            <Zap className="h-6 w-6 text-blue-500" />
                          )}
                          <div>
                            <h3 className="font-semibold">
                              {isVietnamese ? plan.name_vi : plan.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {plan.price.toLocaleString("vi-VN")}đ/
                              {isVietnamese ? "tháng" : "month"}
                            </p>
                          </div>
                        </div>
                        <Button onClick={() => handleUpgrade(plan)}>
                          {isVietnamese ? "Nâng cấp" : "Upgrade"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isVietnamese ? "Gia hạn gói đăng ký" : "Renew subscription"}</DialogTitle>
            <DialogDescription>
              {isVietnamese ? "Chọn kỳ thanh toán để gia hạn" : "Choose billing cycle to renew"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Monthly option */}
            <Card
              className={`cursor-pointer ${billingCycle === "monthly" ? "border-primary" : ""}`}
              onClick={() => setBillingCycle("monthly")}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{isVietnamese ? "Hàng tháng" : "Monthly"}</h3>
                    <p className="text-2xl font-bold">
                      {currentPlan?.price.toLocaleString("vi-VN")}đ
                      <span className="text-sm text-muted-foreground font-normal">
                        /{isVietnamese ? "tháng" : "month"}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      billingCycle === "monthly" ? "border-primary bg-primary" : "border-muted"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Yearly option */}
            <Card
              className={`cursor-pointer ${billingCycle === "yearly" ? "border-primary" : ""}`}
              onClick={() => setBillingCycle("yearly")}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{isVietnamese ? "Hàng năm" : "Yearly"}</h3>
                      <Badge className="bg-green-500">
                        {isVietnamese ? "Tiết kiệm 17%" : "Save 17%"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {getYearlyPrice(currentPlan?.price || 0).toLocaleString("vi-VN")}đ
                      <span className="text-sm text-muted-foreground font-normal">
                        /{isVietnamese ? "năm" : "year"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      {((currentPlan?.price || 0) * 12).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      billingCycle === "yearly" ? "border-primary bg-primary" : "border-muted"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewDialog(false)}>
              {isVietnamese ? "Hủy" : "Cancel"}
            </Button>
            <Button onClick={handleRenew}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {isVietnamese ? "Tiếp tục" : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
