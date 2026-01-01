import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { Navigation } from "@/components/Navigation";
import { DiscountCodeInput } from "@/components/subscription/DiscountCodeInput";
import SubscriptionPayment from "@/components/subscription/SubscriptionPayment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSubscription, useSubscriptionPlans } from "@/hooks/useSubscription";
import type { SubscriptionPlan } from "@/lib/api/subscriptions";
import { CheckCircle, Crown, Gift, Rocket, Shield, Sparkles, Star, X, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Feature comparison data for each plan
const planFeatures = {
  free: [
    { key: "ai_chat", value: "5/tháng", value_en: "5/month" },
    { key: "ai_image", value: "2/tháng", value_en: "2/month" },
    { key: "consultation", value: "1/tháng", value_en: "1/month" },
    { key: "showcase", value: "10/tháng", value_en: "10/month" },
    { key: "export_pdf", value: false },
    { key: "priority_support", value: false },
    { key: "early_access", value: false },
    { key: "dedicated_support", value: false },
  ],
  pro: [
    { key: "ai_chat", value: "100/tháng", value_en: "100/month" },
    { key: "ai_image", value: "50/tháng", value_en: "50/month" },
    { key: "consultation", value: "5/tháng", value_en: "5/month" },
    { key: "showcase", value: "Không giới hạn", value_en: "Unlimited" },
    { key: "export_pdf", value: "10/tháng", value_en: "10/month" },
    { key: "priority_support", value: false },
    { key: "early_access", value: true },
    { key: "dedicated_support", value: false },
  ],
  vip: [
    { key: "ai_chat", value: "Không giới hạn", value_en: "Unlimited" },
    { key: "ai_image", value: "Không giới hạn", value_en: "Unlimited" },
    { key: "consultation", value: "Không giới hạn", value_en: "Unlimited" },
    { key: "showcase", value: "Không giới hạn", value_en: "Unlimited" },
    { key: "export_pdf", value: "Không giới hạn", value_en: "Unlimited" },
    { key: "priority_support", value: true },
    { key: "early_access", value: true },
    { key: "dedicated_support", value: "1/tháng", value_en: "1/month" },
  ],
};

const featureLabels: Record<string, { vi: string; en: string }> = {
  ai_chat: { vi: "Chat AI", en: "AI Chat" },
  ai_image: { vi: "Tạo ảnh AI", en: "AI Images" },
  consultation: { vi: "Đặt lịch tư vấn", en: "Consultations" },
  showcase: { vi: "Xem dự án", en: "Project Views" },
  export_pdf: { vi: "Xuất PDF", en: "Export PDF" },
  priority_support: { vi: "Hỗ trợ ưu tiên", en: "Priority Support" },
  early_access: { vi: "Tính năng mới", en: "Early Access" },
  dedicated_support: { vi: "Hỗ trợ 1:1", en: "1:1 Support" },
};

export default function SubscriptionPricing() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { planId, refetch } = useSubscription();
  const { plans, loading } = useSubscriptionPlans();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    discount_type: "percent" | "fixed";
    discount_value: number;
  } | null>(null);

  const isVietnamese = i18n.language === "vi";

  // Calculate prices - FIXED: correct yearly calculation
  const getDisplayPrice = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 0;
    if (billingCycle === "yearly") {
      // 10 months price for yearly (17% discount)
      return plan.price * 10;
    }
    return plan.price;
  };

  const getMonthlyEquivalent = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 0;
    if (billingCycle === "yearly") {
      return Math.round((plan.price * 10) / 12);
    }
    return plan.price;
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 0;
    const yearlyNormal = plan.price * 12;
    const yearlyDiscount = plan.price * 10;
    return yearlyNormal - yearlyDiscount;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return isVietnamese ? "Miễn phí" : "Free";
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (plan.id === "free") {
      toast.info(isVietnamese ? "Bạn đang dùng gói miễn phí" : "You are on the free plan");
      return;
    }

    if (plan.id === planId) {
      toast.info(isVietnamese ? "Bạn đang sử dụng gói này" : "You are already on this plan");
      return;
    }

    setSelectedPlan(plan);
    setDiscountCode("");
    setDiscountInfo(null);
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    refetch();
    toast.success(
      isVietnamese
        ? "🎉 Đã gửi yêu cầu! Vui lòng chuyển khoản để kích hoạt gói."
        : "🎉 Request sent! Please transfer to activate your plan."
    );
    // Redirect to profile to manage subscription
    navigate("/profile");
  };

  const getPlanIcon = (id: string) => {
    switch (id) {
      case "free":
        return <Shield className="h-8 w-8" />;
      case "pro":
        return <Rocket className="h-8 w-8" />;
      case "vip":
        return <Crown className="h-8 w-8" />;
      default:
        return <Sparkles className="h-8 w-8" />;
    }
  };

  const getPlanColor = (id: string) => {
    switch (id) {
      case "free":
        return "from-gray-500 to-gray-600";
      case "pro":
        return "from-blue-500 to-cyan-500";
      case "vip":
        return "from-amber-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getButtonLabel = (plan: SubscriptionPlan) => {
    if (plan.id === planId) {
      return isVietnamese ? "Gói hiện tại" : "Current Plan";
    }
    if (plan.id === "free") {
      return isVietnamese ? "Gói miễn phí" : "Free Plan";
    }
    const planOrder = { free: 0, pro: 1, vip: 2 };
    const currentOrder = planOrder[planId as keyof typeof planOrder] || 0;
    const targetOrder = planOrder[plan.id as keyof typeof planOrder] || 0;
    if (targetOrder > currentOrder) {
      return isVietnamese ? "Nâng cấp ngay" : "Upgrade Now";
    }
    return isVietnamese ? "Chọn gói này" : "Select Plan";
  };

  const renderFeatureValue = (value: string | boolean, isVietnamese: boolean) => {
    if (value === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (value === false) {
      return <X className="h-4 w-4 text-muted-foreground/40" />;
    }
    const isUnlimited = value === "Không giới hạn" || value === "Unlimited";
    return (
      <span className={`text-sm ${isUnlimited ? "text-green-600 font-medium" : ""}`}>{value}</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Navigation />
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 26, 0.95), rgba(10, 15, 26, 0.85)), url('/images/backgrounds/neural-network.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 pt-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            {isVietnamese ? "Gói đăng ký" : "Subscription Plans"}
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            {isVietnamese ? (
              <>
                Chọn gói <span className="text-primary">phù hợp</span> với bạn
              </>
            ) : (
              <>
                Choose the <span className="text-primary">right plan</span> for you
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            {isVietnamese
              ? "Trải nghiệm đầy đủ các tính năng AI và công cụ tự động hóa. Bắt đầu miễn phí, nâng cấp khi cần."
              : "Experience full AI features and automation tools. Start free, upgrade when needed."}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
            <span
              className={`text-sm font-medium transition-colors ${
                billingCycle === "monthly" ? "text-white" : "text-white/50"
              }`}
            >
              {isVietnamese ? "Theo tháng" : "Monthly"}
            </span>
            <Switch
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <span
              className={`text-sm font-medium transition-colors ${
                billingCycle === "yearly" ? "text-white" : "text-white/50"
              }`}
            >
              {isVietnamese ? "Theo năm" : "Yearly"}
            </span>
            {billingCycle === "yearly" && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Gift className="h-3 w-3 mr-1" />
                -17%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === planId;
            const isPopular = plan.id === "pro";
            const displayPrice = getDisplayPrice(plan);
            const monthlyEquivalent = getMonthlyEquivalent(plan);
            const yearlySavings = getYearlySavings(plan);
            const isSelectable = !isCurrentPlan && plan.id !== "free";
            const features = planFeatures[plan.id as keyof typeof planFeatures] || [];

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl backdrop-blur-sm ${
                  isPopular
                    ? "border-primary shadow-xl shadow-primary/20 scale-105 z-10 bg-white/10"
                    : "border-white/10 hover:border-primary/50 bg-white/5"
                } ${isCurrentPlan ? "ring-2 ring-green-500/50" : ""} ${
                  isSelectable ? "cursor-pointer hover:bg-white/10" : ""
                }`}
                onClick={() => {
                  if (isSelectable) {
                    handleSelectPlan(plan);
                  }
                }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-cyan-500 text-white text-center py-2 text-sm font-medium">
                    <Star className="h-4 w-4 inline mr-1" />
                    {isVietnamese ? "Phổ biến nhất" : "Most Popular"}
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {isVietnamese ? "Đang dùng" : "Current"}
                  </Badge>
                )}

                <CardHeader className={`text-center ${isPopular ? "pt-14" : "pt-6"}`}>
                  {/* Icon */}
                  <div
                    className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${getPlanColor(
                      plan.id
                    )} flex items-center justify-center text-white mb-4 shadow-lg`}
                  >
                    {getPlanIcon(plan.id)}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-white">
                    {isVietnamese ? plan.name_vi : plan.name}
                  </h3>

                  {/* Price - FIXED */}
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <div className="text-4xl md:text-5xl font-bold text-white">
                        {isVietnamese ? "Miễn phí" : "Free"}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl md:text-5xl font-bold text-white">
                            {new Intl.NumberFormat("vi-VN").format(
                              billingCycle === "yearly" ? monthlyEquivalent : displayPrice
                            )}
                          </span>
                          <span className="text-white/60">đ/{isVietnamese ? "tháng" : "mo"}</span>
                        </div>

                        {billingCycle === "yearly" && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-white/50">
                              {isVietnamese
                                ? `Thanh toán ${formatPrice(displayPrice)}/năm`
                                : `Billed ${formatPrice(displayPrice)}/year`}
                            </p>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              {isVietnamese
                                ? `Tiết kiệm ${formatPrice(yearlySavings)}`
                                : `Save ${formatPrice(yearlySavings)}`}
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/60 mt-4">
                    {isVietnamese ? plan.description_vi : plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 px-6">
                  <Separator className="bg-white/10" />

                  {/* Feature Comparison in Card */}
                  <div className="space-y-3">
                    {features.map((feature) => {
                      const label = featureLabels[feature.key];
                      const value = isVietnamese
                        ? feature.value
                        : feature.value_en || feature.value;

                      return (
                        <div
                          key={feature.key}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-white/70">
                            {isVietnamese ? label?.vi : label?.en}
                          </span>
                          <span className="font-medium text-white">
                            {renderFeatureValue(value, isVietnamese)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 px-6 pb-6">
                  <Button
                    className={`w-full h-12 text-base font-semibold ${
                      isPopular
                        ? "bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                    disabled={isCurrentPlan || plan.id === "free"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                  >
                    {isCurrentPlan && <CheckCircle className="h-4 w-4 mr-2" />}
                    {!isCurrentPlan && plan.id !== "free" && <Zap className="h-4 w-4 mr-2" />}
                    {getButtonLabel(plan)}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            {isVietnamese ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
          </h2>

          <div className="space-y-4">
            <FaqItem
              question={
                isVietnamese ? "Tôi có thể hủy bất cứ lúc nào không?" : "Can I cancel anytime?"
              }
              answer={
                isVietnamese
                  ? "Có, bạn có thể hủy gói đăng ký bất cứ lúc nào. Gói sẽ tiếp tục hoạt động đến hết thời hạn đã thanh toán."
                  : "Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the paid period."
              }
            />
            <FaqItem
              question={isVietnamese ? "Thanh toán như thế nào?" : "How do I pay?"}
              answer={
                isVietnamese
                  ? "Chúng tôi hỗ trợ thanh toán qua chuyển khoản ngân hàng với VietQR. Sau khi chuyển khoản, gói sẽ được kích hoạt tự động trong vài phút."
                  : "We support payment via bank transfer with VietQR. After transfer, your plan will be activated automatically within minutes."
              }
            />
            <FaqItem
              question={isVietnamese ? "Có thể đổi gói giữa chừng không?" : "Can I switch plans?"}
              answer={
                isVietnamese
                  ? "Có, bạn có thể nâng cấp lên gói cao hơn bất cứ lúc nào. Thời gian còn lại của gói cũ sẽ được quy đổi tương ứng."
                  : "Yes, you can upgrade to a higher plan at any time. The remaining time of your current plan will be converted accordingly."
              }
            />
            <FaqItem
              question={isVietnamese ? "Gói VIP có gì đặc biệt?" : "What's special about VIP?"}
              answer={
                isVietnamese
                  ? "Gói VIP không giới hạn tất cả tính năng, có hỗ trợ ưu tiên 24/7, và được hỗ trợ 1:1 trực tiếp mỗi tháng."
                  : "VIP plan has unlimited access to all features, priority 24/7 support, and 1:1 direct support session monthly."
              }
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/20 to-cyan-500/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {isVietnamese ? "Bắt đầu ngay hôm nay" : "Get started today"}
          </h2>
          <p className="text-white/60 mb-8">
            {isVietnamese
              ? "Đăng ký miễn phí để trải nghiệm. Nâng cấp khi bạn đã sẵn sàng."
              : "Sign up free to experience. Upgrade when you're ready."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-cyan-500"
              onClick={() => handleSelectPlan(plans.find((p) => p.id === "pro")!)}
            >
              <Rocket className="h-5 w-5 mr-2" />
              {isVietnamese ? "Đăng ký Pro" : "Get Pro"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => handleSelectPlan(plans.find((p) => p.id === "vip")!)}
            >
              <Crown className="h-5 w-5 mr-2" />
              {isVietnamese ? "Đăng ký VIP" : "Get VIP"}
            </Button>
          </div>
        </div>
      </section>

      {/* Payment Dialog - WIDER & SCROLLABLE */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isVietnamese ? "Thanh toán gói đăng ký" : "Subscription Payment"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <span className="flex items-center gap-2 flex-wrap">
                  {isVietnamese ? "Bạn đang đăng ký gói" : "You are subscribing to"}{" "}
                  <Badge
                    className={`${
                      selectedPlan.id === "pro"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {isVietnamese ? selectedPlan.name_vi : selectedPlan.name}
                  </Badge>
                  {billingCycle === "yearly" && (
                    <Badge className="bg-green-500/20 text-green-400">
                      {isVietnamese ? "Thanh toán năm" : "Yearly"}
                    </Badge>
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              {/* Discount Code Input - with correct props */}
              <DiscountCodeInput
                planId={selectedPlan.id}
                billingCycle={billingCycle}
                originalAmount={
                  billingCycle === "yearly" ? selectedPlan.price * 10 : selectedPlan.price
                }
                onValidDiscount={(discount) => {
                  setDiscountCode(discount.discount_id || "");
                  setDiscountInfo({
                    discount_type: discount.discount_type as "percent" | "fixed",
                    discount_value: discount.discount_value,
                  });
                }}
                onClear={() => {
                  setDiscountCode("");
                  setDiscountInfo(null);
                }}
              />

              <SubscriptionPayment
                plan={selectedPlan}
                billingCycle={billingCycle}
                actualPrice={
                  discountInfo
                    ? (billingCycle === "yearly" ? selectedPlan.price * 10 : selectedPlan.price) -
                      discountInfo.discount_value
                    : billingCycle === "yearly"
                    ? selectedPlan.price * 10
                    : selectedPlan.price
                }
                onComplete={handlePaymentComplete}
                onBack={() => setShowPayment(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

// Helper component for FAQ
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <span
          className={`text-white/60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && <div className="px-4 pb-4 text-white/60">{answer}</div>}
    </div>
  );
}
