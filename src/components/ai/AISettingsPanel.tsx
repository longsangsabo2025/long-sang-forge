/**
 * AI Personalization Settings Component
 * =====================================
 * Cho phép Pro+ users tùy chỉnh trợ lý AI theo phong cách Elon:
 * - Đơn giản, hiệu quả
 * - Pro: 5 fields cơ bản
 * - VIP: Full customization
 */

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Brain,
  Building2,
  Crown,
  Loader2,
  Lock,
  MessageSquare,
  Palette,
  Save,
  Sparkles,
  Target,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// Use Supabase Edge Function for preferences
const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/sales-consultant";

// Types
interface AIPreferences {
  // Pro fields
  industry: string;
  business_goal: string;
  budget_range: string;
  preferred_tone: string;
  main_pain_point: string;
  // VIP fields
  ai_name: string;
  custom_greeting: string;
  language_style: string;
  communication_level: string;
  enable_memory: boolean;
  // VIP Advanced
  company_name: string;
  company_description: string;
  products_services: string;
  target_customers: string;
  competitors: string;
  unique_selling_points: string;
}

const defaultPreferences: AIPreferences = {
  industry: "",
  business_goal: "",
  budget_range: "",
  preferred_tone: "friendly",
  main_pain_point: "",
  ai_name: "Sang",
  custom_greeting: "",
  language_style: "vietnamese",
  communication_level: "expert",
  enable_memory: true,
  company_name: "",
  company_description: "",
  products_services: "",
  target_customers: "",
  competitors: "",
  unique_selling_points: "",
};

const toneOptions = [
  { value: "casual", label: "🎉 Casual - Thoải mái, vui vẻ" },
  { value: "friendly", label: "😊 Friendly - Thân thiện, gần gũi" },
  { value: "professional", label: "💼 Professional - Chuyên nghiệp" },
  { value: "formal", label: "🎩 Formal - Trang trọng, lịch sự" },
];

const budgetOptions = [
  { value: "under_10m", label: "Dưới 10 triệu" },
  { value: "10m_50m", label: "10 - 50 triệu" },
  { value: "50m_200m", label: "50 - 200 triệu" },
  { value: "over_200m", label: "Trên 200 triệu" },
  { value: "flexible", label: "Linh hoạt" },
];

const levelOptions = [
  { value: "beginner", label: "🌱 Beginner - Giải thích đơn giản" },
  { value: "intermediate", label: "📚 Intermediate - Cân bằng" },
  { value: "expert", label: "🚀 Expert - Chuyên sâu, kỹ thuật" },
];

export default function AISettingsPanel() {
  const { user } = useAuth();
  const { isPro, isVip, isFree, planId } = useSubscription();
  const { toast } = useToast();

  const [preferences, setPreferences] = useState<AIPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing preferences
  useEffect(() => {
    if (!user?.id || isFree) {
      setLoading(false);
      return;
    }

    async function fetchPreferences() {
      try {
        const res = await fetch(`${EDGE_FUNCTION_URL}?path=preferences&userId=${user!.id}`);
        const data = await res.json();

        if (data.success && data.preferences) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [user?.id, isFree]);

  // Handle field change
  const handleChange = (field: keyof AIPreferences, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Save preferences
  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}?path=preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          preferences,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "✅ Đã lưu cài đặt AI",
          description: "Trợ lý AI sẽ tư vấn theo thông tin bạn đã cung cấp!",
        });
        setHasChanges(false);
      } else if (data.requiredTier) {
        toast({
          title: "🔒 Tính năng Pro+",
          description: "Nâng cấp lên Pro để sử dụng tính năng này",
          variant: "destructive",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể lưu cài đặt. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset preferences
  const handleReset = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}?path=preferences&userId=${user.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setPreferences(defaultPreferences);
        setHasChanges(false);
        toast({
          title: "🔄 Đã đặt lại",
          description: "Cài đặt AI đã được đặt về mặc định",
        });
      }
    } catch (err) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể đặt lại. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Free user - show upgrade prompt
  if (isFree) {
    return (
      <Card className="border-dashed border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Personalization
          </CardTitle>
          <CardDescription className="text-base">
            Tùy chỉnh trợ lý AI để được tư vấn phù hợp với doanh nghiệp của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <Bot className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="font-medium">AI hiểu ngành nghề</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <Target className="w-5 h-5 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Tư vấn đúng mục tiêu</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <Wallet className="w-5 h-5 mx-auto mb-2 text-amber-500" />
              <p className="font-medium">Phù hợp ngân sách</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-blue-500" />
              <p className="font-medium">Giọng văn tùy chỉnh</p>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={() => (window.location.href = "/pricing")}>
            <Crown className="w-4 h-4 mr-2" />
            Nâng cấp Pro để mở khóa
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Đang tải cài đặt...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            AI Personalization
          </h2>
          <p className="text-muted-foreground">Cài đặt để AI tư vấn phù hợp với bạn hơn</p>
        </div>
        <div className="flex items-center gap-2">
          {isVip && (
            <span className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium">
              👑 VIP
            </span>
          )}
          {isPro && !isVip && (
            <span className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-primary to-purple-500 text-white font-medium">
              ⭐ Pro
            </span>
          )}
        </div>
      </div>

      {/* Pro Section: Quick Profile (5 fields) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Quick Profile
          </CardTitle>
          <CardDescription>5 thông tin cơ bản để AI hiểu bạn tốt hơn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Ngành nghề kinh doanh
              </Label>
              <Input
                id="industry"
                placeholder="VD: E-commerce, Bất động sản, F&B..."
                value={preferences.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Ngân sách dự kiến
              </Label>
              <Select
                value={preferences.budget_range}
                onValueChange={(v) => handleChange("budget_range", v)}
              >
                <SelectTrigger id="budget">
                  <SelectValue placeholder="Chọn ngân sách" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Business Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Mục tiêu chính
            </Label>
            <Textarea
              id="goal"
              placeholder="VD: Tăng doanh số online 50%, Tự động hóa quy trình CSKH..."
              value={preferences.business_goal}
              onChange={(e) => handleChange("business_goal", e.target.value)}
              rows={2}
            />
          </div>

          {/* Pain Point */}
          <div className="space-y-2">
            <Label htmlFor="pain" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Vấn đề cần giải quyết
            </Label>
            <Textarea
              id="pain"
              placeholder="VD: Website cũ chậm, không có chatbot trả lời khách..."
              value={preferences.main_pain_point}
              onChange={(e) => handleChange("main_pain_point", e.target.value)}
              rows={2}
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Phong cách giao tiếp
            </Label>
            <Select
              value={preferences.preferred_tone}
              onValueChange={(v) => handleChange("preferred_tone", v)}
            >
              <SelectTrigger id="tone">
                <SelectValue placeholder="Chọn phong cách" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* VIP Section: Full Persona */}
      <AnimatePresence>
        {isVip ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="w-5 h-5 text-amber-500" />
                  VIP: Full Persona
                </CardTitle>
                <CardDescription>Tùy chỉnh hoàn toàn trợ lý AI của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* AI Name */}
                  <div className="space-y-2">
                    <Label htmlFor="aiName">Tên trợ lý AI</Label>
                    <Input
                      id="aiName"
                      placeholder="VD: Luna, Alex, Assistant..."
                      value={preferences.ai_name}
                      onChange={(e) => handleChange("ai_name", e.target.value)}
                    />
                  </div>

                  {/* Communication Level */}
                  <div className="space-y-2">
                    <Label htmlFor="level">Mức độ chuyên sâu</Label>
                    <Select
                      value={preferences.communication_level}
                      onValueChange={(v) => handleChange("communication_level", v)}
                    >
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Chọn mức độ" />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Greeting */}
                <div className="space-y-2">
                  <Label htmlFor="greeting">Lời chào tùy chỉnh</Label>
                  <Textarea
                    id="greeting"
                    placeholder="VD: Xin chào! Mình là Luna - trợ lý AI của bạn. Hôm nay mình có thể giúp gì cho bạn?"
                    value={preferences.custom_greeting}
                    onChange={(e) => handleChange("custom_greeting", e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Memory Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Bật Memory</Label>
                    <p className="text-sm text-muted-foreground">
                      AI sẽ nhớ thông tin từ các cuộc hội thoại trước
                    </p>
                  </div>
                  <Switch
                    checked={preferences.enable_memory}
                    onCheckedChange={(v) => handleChange("enable_memory", v)}
                  />
                </div>

                {/* Company Info Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Thông tin doanh nghiệp (tùy chọn)
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Tên công ty</Label>
                      <Input
                        id="companyName"
                        placeholder="Công ty của bạn"
                        value={preferences.company_name}
                        onChange={(e) => handleChange("company_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="products">Sản phẩm/Dịch vụ</Label>
                      <Input
                        id="products"
                        placeholder="VD: SaaS, Agency, E-commerce..."
                        value={preferences.products_services}
                        onChange={(e) => handleChange("products_services", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="companyDesc">Mô tả công ty</Label>
                    <Textarea
                      id="companyDesc"
                      placeholder="Mô tả ngắn về công ty, lĩnh vực hoạt động..."
                      value={preferences.company_description}
                      onChange={(e) => handleChange("company_description", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="target">Khách hàng mục tiêu</Label>
                      <Textarea
                        id="target"
                        placeholder="VD: SMEs, Startups, Doanh nghiệp lớn..."
                        value={preferences.target_customers}
                        onChange={(e) => handleChange("target_customers", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="competitors">Đối thủ cạnh tranh</Label>
                      <Textarea
                        id="competitors"
                        placeholder="VD: Công ty A, Công ty B..."
                        value={preferences.competitors}
                        onChange={(e) => handleChange("competitors", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="usp">Điểm khác biệt (USP)</Label>
                    <Textarea
                      id="usp"
                      placeholder="VD: Giá tốt nhất, Chất lượng cao, Hỗ trợ 24/7..."
                      value={preferences.unique_selling_points}
                      onChange={(e) => handleChange("unique_selling_points", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
            <CardContent className="py-8 text-center">
              <Crown className="w-10 h-10 mx-auto text-amber-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">VIP: Full Persona</h3>
              <p className="text-muted-foreground mb-4">
                Đặt tên AI, lời chào tùy chỉnh, thông tin doanh nghiệp chi tiết
              </p>
              <Button variant="outline" onClick={() => (window.location.href = "/pricing")}>
                <Crown className="w-4 h-4 mr-2" />
                Nâng cấp VIP
              </Button>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="ghost"
          onClick={handleReset}
          disabled={saving}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Đặt lại mặc định
        </Button>

        <Button onClick={handleSave} disabled={saving || !hasChanges} className="min-w-[140px]">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
