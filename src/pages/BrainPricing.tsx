/**
 * Brain Pricing Page
 * ==================
 * Shows brain features from existing subscription plans
 * Brain is integrated into the main subscription system
 */

import { SubscriptionPlan, userBrainAPI } from "@/brain/lib/services/user-brain-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Check, Crown, MessageCircle, Rocket, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function BrainPricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const data = await userBrainAPI.getPlans();
    setPlans(data);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const planIcons: Record<string, typeof Sparkles> = {
    free: Sparkles,
    pro: Rocket,
    vip: Crown,
  };

  const planColors: Record<string, { text: string; bg: string }> = {
    free: { text: "text-gray-500", bg: "bg-gray-100" },
    pro: { text: "text-blue-500", bg: "bg-blue-100" },
    vip: { text: "text-purple-500", bg: "bg-purple-100" },
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Second Brain</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Second Brain được tích hợp vào các gói đăng ký của chúng tôi. Nâng cấp để mở khóa toàn bộ
          sức mạnh của AI Second Brain.
        </p>

        <Button asChild size="lg" className="gap-2">
          <Link to="/subscription">
            Xem tất cả gói đăng ký <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Brain Features by Plan */}
      <h2 className="text-2xl font-bold text-center mb-8">Second Brain theo từng gói</h2>

      {loading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name] || Sparkles;
            const colors = planColors[plan.name] || planColors.free;
            const brainFeatures = plan.features;
            const isPopular = plan.name === "pro";

            return (
              <Card
                key={plan.id}
                className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Phổ biến nhất</Badge>
                )}

                <CardHeader className="text-center">
                  <div
                    className={`mx-auto w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`h-8 w-8 ${colors.text}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.nameVi || plan.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {formatPrice(plan.price)}
                    {plan.price > 0 && <span className="text-sm">/tháng</span>}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {brainFeatures.brain_domains > 0 ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="h-5 w-5 text-gray-300">✗</span>
                      )}
                      <span>
                        {brainFeatures.brain_domains > 0
                          ? `${brainFeatures.brain_domains} Brain domains`
                          : "Không có Brain"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {brainFeatures.brain_docs_per_domain > 0 ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="h-5 w-5 text-gray-300">✗</span>
                      )}
                      <span>
                        {brainFeatures.brain_docs_per_domain > 0
                          ? `${brainFeatures.brain_docs_per_domain} tài liệu/domain`
                          : "Không có tài liệu"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {brainFeatures.brain_queries_per_month > 0 ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="h-5 w-5 text-gray-300">✗</span>
                      )}
                      <span>
                        {brainFeatures.brain_queries_per_month > 0
                          ? `${brainFeatures.brain_queries_per_month} câu hỏi/tháng`
                          : "Không có câu hỏi"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => navigate("/subscription")}
                  >
                    {plan.price === 0 ? "Bắt đầu miễn phí" : "Nâng cấp ngay"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Câu hỏi thường gặp</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <FAQItem
            question="Document là gì?"
            answer="Mỗi document là một đơn vị kiến thức được lưu trong brain. Khi import từ YouTube hoặc URL, nội dung sẽ được chia nhỏ thành nhiều documents để AI có thể tìm kiếm chính xác hơn."
          />
          <FAQItem
            question="Query là gì?"
            answer="Mỗi lần bạn chat với brain, hệ thống sẽ sử dụng AI để tìm kiếm và trả lời. Đây được tính là 1 query. Quota reset vào đầu mỗi tháng."
          />
          <FAQItem
            question="Có thể upgrade/downgrade không?"
            answer="Bạn có thể upgrade lên gói cao hơn bất cứ lúc nào. Downgrade chỉ có thể thực hiện khi hết kỳ thanh toán hiện tại."
          />
          <FAQItem
            question="Dữ liệu có được bảo mật không?"
            answer="Hoàn toàn! Dữ liệu của bạn được mã hóa và chỉ bạn mới có quyền truy cập. Chúng tôi không sử dụng dữ liệu của bạn để train AI."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">
          Cần tư vấn thêm? Liên hệ chúng tôi qua chat hoặc email.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/my-brain">
            <Button variant="outline">
              <Brain className="mr-2 h-4 w-4" />
              Quay lại Brain
            </Button>
          </Link>
          <Link to="/consultation">
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Đặt lịch tư vấn
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-4 rounded-lg border">
      <h3 className="font-medium mb-2">{question}</h3>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
