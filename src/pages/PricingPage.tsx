import { useAuth } from "@/components/auth/AuthProvider";
import SubscriptionPayment from "@/components/subscription/SubscriptionPayment";
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
import { Switch } from "@/components/ui/switch";
import { useSubscription, useSubscriptionPlans } from "@/hooks/useSubscription";
import type { BillingCycle, SubscriptionPlan } from "@/lib/api/subscriptions";
import { motion } from "framer-motion";
import { ArrowRight, Check, Crown, Percent, Rocket, Star, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Plan icons mapping
const planIcons: Record<string, React.ReactNode> = {
  free: <Rocket className="h-6 w-6" />,
  pro: <Zap className="h-6 w-6" />,
  vip: <Crown className="h-6 w-6" />,
};

// Plan colors
const planColors: Record<string, { bg: string; border: string; badge: string }> = {
  free: {
    bg: "bg-slate-50 dark:bg-slate-900",
    border: "border-slate-200 dark:border-slate-700",
    badge: "bg-slate-100 text-slate-700",
  },
  pro: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-300 dark:border-blue-700",
    badge: "bg-blue-500 text-white",
  },
  vip: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950",
    border: "border-amber-400 dark:border-amber-600",
    badge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  },
};

// Feature display mapping
const featureDisplay: Record<string, { icon: string; included: (value: any) => boolean }> = {
  ai_updates: { icon: "📡", included: (v) => v !== "none" },
  product_announcements: { icon: "🚀", included: (v) => v !== "none" },
  showcase_access: { icon: "🎨", included: (v) => v && v !== 0 },
  roadmap_access: { icon: "🗺️", included: (v) => v !== "none" },
  community: { icon: "💬", included: (v) => v !== "none" },
  investment_access: { icon: "💎", included: (v) => v && v !== false },
  support: { icon: "🛟", included: (v) => v && v !== "none" },
  consultation_discount: { icon: "🎁", included: (v) => v && v > 0 },
};

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { planId: currentPlanId, subscription } = useSubscription();
  const { plans, loading } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const isVietnamese = i18n.language === "vi";

  // Calculate yearly prices (2 months free = 10/12 = ~17% discount)
  const getYearlyPrice = (monthlyPrice: number) => Math.round(monthlyPrice * 10);
  const getYearlySavings = (monthlyPrice: number) =>
    monthlyPrice * 12 - getYearlyPrice(monthlyPrice);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      toast.info(isVietnamese ? "Vui lòng đăng nhập để đăng ký gói" : "Please login to subscribe");
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    if (plan.id === currentPlanId) {
      toast.info(isVietnamese ? "Bạn đang sử dụng gói này" : "You're already on this plan");
      return;
    }

    if (plan.price === 0) {
      // Free plan - no payment needed
      toast.success(isVietnamese ? "Gói miễn phí đã được kích hoạt!" : "Free plan activated!");
      return;
    }

    setSelectedPlan(plan);
    setShowPayment(true);
  };

  // Calculate price based on billing cycle
  const getDisplayPrice = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 0;
    return billingCycle === "yearly" ? getYearlyPrice(plan.price) : plan.price;
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    toast.success(
      isVietnamese
        ? "Đã gửi yêu cầu đăng ký! Vui lòng chuyển khoản để kích hoạt."
        : "Subscription request sent! Please transfer to activate."
    );
  };

  if (showPayment && selectedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <SubscriptionPayment
            plan={selectedPlan}
            billingCycle={billingCycle}
            actualPrice={getDisplayPrice(selectedPlan)}
            onComplete={handlePaymentComplete}
            onBack={() => {
              setShowPayment(false);
              setSelectedPlan(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4" variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              {isVietnamese ? "Đặc quyền thành viên" : "Member Benefits"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isVietnamese ? "Chọn Gói Phù Hợp Với Bạn" : "Choose Your Plan"}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {isVietnamese
                ? "Truy cập sớm vào AI updates, roadmap chiến lược, và cơ hội đầu tư độc quyền"
                : "Early access to AI updates, strategic roadmap, and exclusive investment opportunities"}
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span
                className={`font-medium ${
                  billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {isVietnamese ? "Hàng tháng" : "Monthly"}
              </span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <span
                className={`font-medium ${
                  billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {isVietnamese ? "Hàng năm" : "Yearly"}
              </span>
              {billingCycle === "yearly" && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  <Percent className="h-3 w-3 mr-1" />
                  {isVietnamese ? "Tiết kiệm 17%" : "Save 17%"}
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                const isCurrentPlan = plan.id === currentPlanId;
                const isPopular = plan.id === "pro";
                const colors = planColors[plan.id] || planColors.free;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1">
                          {isVietnamese ? "🔥 Phổ biến nhất" : "🔥 Most Popular"}
                        </Badge>
                      </div>
                    )}

                    <Card
                      className={`h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                        colors.bg
                      } ${
                        isPopular
                          ? "border-2 " + colors.border + " scale-105"
                          : "border " + colors.border
                      } ${isCurrentPlan ? "ring-2 ring-green-500 ring-offset-2" : ""}`}
                    >
                      {isCurrentPlan && (
                        <div className="absolute top-4 right-4">
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-300"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {isVietnamese ? "Đang dùng" : "Current"}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4">
                        <div
                          className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${colors.badge} mx-auto mb-4`}
                        >
                          {planIcons[plan.id]}
                        </div>
                        <CardTitle className="text-2xl">
                          {isVietnamese ? plan.name_vi : plan.name}
                        </CardTitle>
                        <CardDescription className="min-h-[48px]">
                          {isVietnamese ? plan.description_vi : plan.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="text-center pb-6">
                        <div className="mb-6">
                          {plan.price === 0 ? (
                            <div className="text-4xl font-bold text-green-600">
                              {isVietnamese ? "Miễn phí" : "Free"}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold">
                                  {getDisplayPrice(plan).toLocaleString("vi-VN")}đ
                                </span>
                                <span className="text-muted-foreground">
                                  /
                                  {billingCycle === "yearly"
                                    ? isVietnamese
                                      ? "năm"
                                      : "year"
                                    : isVietnamese
                                    ? "tháng"
                                    : "month"}
                                </span>
                              </div>
                              {billingCycle === "yearly" && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-muted-foreground line-through">
                                    {(plan.price * 12).toLocaleString("vi-VN")}đ/
                                    {isVietnamese ? "năm" : "year"}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-700"
                                  >
                                    {isVietnamese ? "Tiết kiệm" : "Save"}{" "}
                                    {getYearlySavings(plan.price).toLocaleString("vi-VN")}đ
                                  </Badge>
                                </div>
                              )}
                              {billingCycle === "monthly" && plan.price > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {isVietnamese
                                    ? `Hoặc ${getYearlyPrice(plan.price).toLocaleString(
                                        "vi-VN"
                                      )}đ/năm (tiết kiệm 2 tháng)`
                                    : `Or ${getYearlyPrice(plan.price).toLocaleString(
                                        "vi-VN"
                                      )}đ/year (save 2 months)`}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Features List */}
                        <ul className="space-y-3 text-left">
                          {plan.features.map((feature) => {
                            const display = featureDisplay[feature.key];
                            const isIncluded = display?.included(feature.value) ?? true;

                            return (
                              <li
                                key={feature.key}
                                className={`flex items-start gap-3 ${
                                  !isIncluded ? "opacity-50" : ""
                                }`}
                              >
                                <span className="text-lg">{display?.icon || "✓"}</span>
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {isVietnamese ? feature.label_vi : feature.label}
                                  </span>
                                  <p className="text-sm text-muted-foreground">
                                    {isVietnamese ? feature.desc_vi : feature.desc}
                                  </p>
                                </div>
                                {isIncluded && (
                                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        <Button
                          className={`w-full ${
                            plan.id === "vip"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                              : plan.id === "pro"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : ""
                          }`}
                          variant={plan.id === "free" ? "outline" : "default"}
                          size="lg"
                          disabled={isCurrentPlan}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {isCurrentPlan ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              {isVietnamese ? "Đang sử dụng" : "Current Plan"}
                            </>
                          ) : (
                            <>
                              {isVietnamese ? "Chọn gói này" : "Select Plan"}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ or Trust Signals */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">
            {isVietnamese ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isVietnamese ? "Thanh toán như thế nào?" : "How do I pay?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {isVietnamese
                  ? "Chuyển khoản ngân hàng qua QR code. Hệ thống tự động xác nhận trong vài phút."
                  : "Bank transfer via QR code. System auto-confirms within minutes."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isVietnamese ? "Có thể hủy bất cứ lúc nào?" : "Can I cancel anytime?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {isVietnamese
                  ? "Có, không ràng buộc. Gói của bạn sẽ hết hạn sau kỳ thanh toán hiện tại."
                  : "Yes, no commitment. Your plan expires after current billing period."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isVietnamese ? "Nâng cấp/hạ cấp thế nào?" : "How to upgrade/downgrade?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {isVietnamese
                  ? "Chọn gói mới và thanh toán. Thời hạn mới sẽ được cộng thêm."
                  : "Select new plan and pay. New duration will be added."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isVietnamese ? "Đầu tư là gì?" : "What is investment access?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {isVietnamese
                  ? "Thành viên VIP được ưu tiên tham gia các vòng gọi vốn với điều khoản tốt hơn."
                  : "VIP members get priority access to funding rounds with better terms."}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
