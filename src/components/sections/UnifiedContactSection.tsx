/**
 * Unified Contact Section
 * Tích hợp 2 phương thức liên hệ:
 * 1. Gửi tin nhắn (Form liên hệ nhanh)
 * 2. Tư vấn trực tiếp (Link đến trang đặt lịch)
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useChatHistory } from "@/hooks/useChatHistory";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  User,
  Video,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

// Serverless Edge Function URL
const EDGE_FUNCTION_URL = "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant";

// Social icons
const LinkedInIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// Turnstile types - imported from ContactSection or global
interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
}

interface TurnstileInstance {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare const turnstile: TurnstileInstance | undefined;

// AI Chat Message interface
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Consultation packages
const consultationPackages = [
  {
    id: "quick",
    name: "Tư vấn nhanh",
    duration: "30 phút",
    price: "500.000đ",
    priceValue: 500000,
    description: "Giải đáp thắc mắc, định hướng ban đầu",
    features: ["1-on-1 video call", "Ghi chép & tóm tắt", "Email follow-up"],
    popular: false,
  },
  {
    id: "standard",
    name: "Tư vấn chuyên sâu",
    duration: "60 phút",
    price: "900.000đ",
    priceValue: 900000,
    description: "Phân tích chi tiết, đề xuất giải pháp",
    features: [
      "1-on-1 video call",
      "Phân tích requirements",
      "Roadmap đề xuất",
      "Tài liệu tổng hợp",
      "1 tuần hỗ trợ email",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Tư vấn chiến lược",
    duration: "120 phút",
    price: "1.500.000đ",
    priceValue: 1500000,
    description: "Tư vấn toàn diện cho dự án lớn",
    features: [
      "1-on-1 video call",
      "Technical deep-dive",
      "Architecture review",
      "Cost estimation",
      "Roadmap chi tiết",
      "2 tuần hỗ trợ email",
      "Follow-up call 30p",
    ],
    popular: false,
  },
];

export const UnifiedContactSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("message");

  return (
    <section id="contact" className="py-8 sm:py-12 md:py-20 relative overflow-hidden">
      {/* Background - Removed for transparency */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" /> */}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">
            Liên hệ với tôi
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Chọn cách liên hệ phù hợp nhất với bạn
          </p>
        </div>

        {/* Two Options Cards - Touch-friendly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto">
          {/* Option 1: Quick Message */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] touch-manipulation bg-card/60 backdrop-blur-sm ${
              activeTab === "message"
                ? "border-primary shadow-lg shadow-primary/20"
                : "hover:border-primary/50"
            }`}
            onClick={() => setActiveTab("message")}
          >
            <CardHeader className="text-center pb-2 px-3 sm:px-6">
              <div className="mx-auto w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 sm:mb-3">
                <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
              </div>
              <CardTitle className="text-sm sm:text-lg">Gửi tin nhắn</CardTitle>
              <Badge variant="secondary" className="mx-auto text-[10px] sm:text-xs">
                Phản hồi trong 24h
              </Badge>
            </CardHeader>
            <CardContent className="text-center text-xs sm:text-sm text-muted-foreground px-3 sm:px-6">
              Form liên hệ nhanh cho câu hỏi đơn giản
            </CardContent>
          </Card>

          {/* Option 2: Direct Consultation - Link to /consultation */}
          <Link to="/consultation" className="block">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-[1.02] touch-manipulation hover:border-amber-500/50 h-full bg-card/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-2 px-3 sm:px-6">
                <div className="mx-auto w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-2 sm:mb-3">
                  <Video className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500" />
                </div>
                <CardTitle className="text-sm sm:text-lg">Tư vấn trực tiếp</CardTitle>
                <Badge
                  variant="outline"
                  className="mx-auto border-amber-500 text-amber-600 text-[10px] sm:text-xs"
                >
                  Từ 300K/30 phút
                </Badge>
              </CardHeader>
              <CardContent className="text-center text-xs sm:text-sm text-muted-foreground px-3 sm:px-6">
                Video call 1-1 với tôi
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="message">Message</TabsTrigger>
          </TabsList>

          {/* Tab: Message Form */}
          <TabsContent value="message" className="mt-0">
            <MessageFormTab />
          </TabsContent>
        </Tabs>

        {/* Contact Info Footer */}
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-border/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center md:text-left">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-primary mb-1 sm:mb-2">Email</p>
              <a
                href="mailto:contact@longsang.org"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
              >
                contact@longsang.org
              </a>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-primary mb-1 sm:mb-2">Địa chỉ</p>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Vũng Tàu, Việt Nam</span>
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-primary mb-1 sm:mb-2">Múi giờ</p>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>GMT+7 (Việt Nam)</span>
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-primary mb-1 sm:mb-2">Kết nối</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <a
                  href="https://www.facebook.com/longsang791"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://zalo.me/0961167717"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  title="Zalo"
                >
                  <span className="text-xs font-bold">Zalo</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/long-sang-75a781357/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  title="LinkedIn"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href="https://github.com/user-longsang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  title="GitHub"
                >
                  <GitHubIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// TAB 1: Message Form Component
// ==========================================
const MessageFormTab = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    source: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  const contactSchema = z.object({
    name: z.string().trim().min(1, "Vui lòng nhập tên").max(100),
    email: z.string().trim().email("Email không hợp lệ"),
    phone: z.string().trim().min(9, "SĐT không hợp lệ").max(15).optional().or(z.literal("")),
    service: z.string().min(1, "Vui lòng chọn dịch vụ"),
    budget: z.string().optional(),
    source: z.string().optional(),
    message: z.string().trim().min(10, "Tin nhắn tối thiểu 10 ký tự").max(1000),
  });

  // Initialize Turnstile
  useEffect(() => {
    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current && !turnstileWidgetId.current) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
          callback: (token: string) => setTurnstileToken(token),
          "error-callback": () => setTurnstileToken(null),
          "expired-callback": () => setTurnstileToken(null),
          theme: "dark",
        });
      }
    };

    if (window.turnstile) {
      initTurnstile();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          initTurnstile();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const error of result.error.errors) {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    // Turnstile temporarily disabled
    // if (!turnstileToken) {
    //   setSubmitStatus("error");
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contacts").insert([
        {
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || null,
          service: result.data.service,
          budget: result.data.budget || null,
          source: result.data.source || null,
          message: result.data.message,
          status: "new",
        },
      ]);

      if (error) throw error;

      // Send email notifications via Supabase Edge Function (no server needed!)
      const sendEmail = async (to: string, template: string, data: Record<string, string>) => {
        try {
          await supabase.functions.invoke("send-email", {
            body: { to, template, data },
          });
        } catch (err) {
          console.error(`Email ${template} failed:`, err);
        }
      };

      // 1. Notify admin about new contact
      sendEmail("longsangsabo@gmail.com", "newContact", {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || "Không cung cấp",
        service: result.data.service,
        budget: result.data.budget || "Chưa xác định",
        source: result.data.source || "Không rõ",
        message: result.data.message,
      });

      // 2. Auto-reply to customer
      sendEmail(result.data.email, "contactAutoReply", {
        name: result.data.name,
      });

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        budget: "",
        source: "",
        message: "",
      });

      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
        setTurnstileToken(null);
      }

      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error("Form error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
      {/* Form */}
      <Card className="p-4 sm:p-6 bg-card/60 backdrop-blur-sm">
        <CardHeader className="px-0 pt-0 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Gửi tin nhắn
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Điền form bên dưới, tôi sẽ phản hồi trong vòng 24 giờ
          </CardDescription>
        </CardHeader>

        {submitStatus === "success" && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-500">Tin nhắn đã được gửi thành công!</p>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">Có lỗi xảy ra, vui lòng thử lại.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="name" className="text-xs sm:text-sm">
                Họ tên *
              </Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`text-sm min-h-[44px] ${errors.name ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs sm:text-sm">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0901 234 567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`text-sm min-h-[44px] ${errors.phone ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="email" className="text-xs sm:text-sm">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`text-sm min-h-[44px] ${errors.email ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="budget" className="text-xs sm:text-sm">
                Ngân sách dự kiến
              </Label>
              <Select
                value={formData.budget}
                onValueChange={(value) => setFormData({ ...formData, budget: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngân sách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<10m">Dưới 10 triệu</SelectItem>
                  <SelectItem value="10-30m">10 - 30 triệu</SelectItem>
                  <SelectItem value="30-50m">30 - 50 triệu</SelectItem>
                  <SelectItem value="50-100m">50 - 100 triệu</SelectItem>
                  <SelectItem value=">100m">Trên 100 triệu</SelectItem>
                  <SelectItem value="flexible">Linh hoạt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="service">Dịch vụ quan tâm *</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => setFormData({ ...formData, service: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.service ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Phát triển Web/App</SelectItem>
                  <SelectItem value="automation">Tự động hóa quy trình</SelectItem>
                  <SelectItem value="ai">AI & Machine Learning</SelectItem>
                  <SelectItem value="seo">SEO & Marketing</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
            </div>
            <div>
              <Label htmlFor="source" className="text-xs sm:text-sm">
                Biết đến qua
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bạn biết đến tôi từ đâu?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Search</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="referral">Người quen giới thiệu</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-xs sm:text-sm">
              Tin nhắn *
            </Label>
            <Textarea
              id="message"
              placeholder="Mô tả ngắn gọn về nhu cầu của bạn..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`min-h-[80px] sm:min-h-[100px] text-sm ${
                errors.message ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              {errors.message && (
                <p className="text-red-500 text-[10px] sm:text-xs">{errors.message}</p>
              )}
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto">
                {formData.message.length}/1000
              </span>
            </div>
          </div>

          {/* Turnstile temporarily disabled
          <div className="flex justify-center">
            <div ref={turnstileRef} />
          </div>
          */}

          <Button
            type="submit"
            className="w-full min-h-[48px] text-sm sm:text-base touch-manipulation"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
          </Button>
        </form>
      </Card>

      {/* Info Side */}
      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 backdrop-blur-sm">
          <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Phản hồi nhanh chóng
          </h3>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Phản hồi trong vòng 24 giờ (ngày làm việc)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Long Sang AI miễn phí 24/7</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Báo giá chi tiết trong 48 giờ</span>
            </li>
          </ul>
        </Card>

        <Card className="p-4 sm:p-6 bg-card/60 backdrop-blur-sm">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Cần phản hồi ngay?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Sử dụng AI Trợ lý để được tư vấn 24/7 hoặc đặt lịch gọi trực tiếp.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-h-[44px] text-xs sm:text-sm touch-manipulation"
              asChild
            >
              <a href="#contact" onClick={() => document.querySelector('[data-value="ai"]')?.click}>
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Chat AI
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-h-[44px] text-xs sm:text-sm touch-manipulation"
              asChild
            >
              <Link to="/consultation">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Đặt lịch
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// TAB 2: AI Chat Component
// ==========================================
const AIChatTab = () => {
  const { messages, setMessages, clearHistory } = useChatHistory("longsang_chat_unified");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 🚀 Sales Consultant AI - Contact Section
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: input,
          source: "contact-page",
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "❌ Không thể kết nối AI. Vui lòng thử lại sau hoặc gửi tin nhắn qua form.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Các dịch vụ bạn cung cấp?",
    "Chi phí làm website?",
    "AI có thể giúp gì?",
    "Thời gian hoàn thành dự án?",
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Chat Area */}
      <Card className="lg:col-span-2 flex flex-col h-[400px] sm:h-[500px] md:h-[600px] bg-card/60 backdrop-blur-sm">
        <CardHeader className="border-b p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              AI Trợ lý
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px] sm:text-xs">
                Online
              </Badge>
            </CardTitle>
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={clearHistory}
                title="Xóa lịch sử chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
          <div className="space-y-3 sm:space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-primary/30 backdrop-blur-sm border border-primary/50"
                      : "bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-purple-500/50"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-sm ${
                    msg.role === "user"
                      ? "bg-primary/20 text-primary-foreground border border-primary/40"
                      : "bg-muted/50 border border-muted-foreground/20"
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[8px] sm:text-[10px] opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t">
          {/* Quick Questions - Scrollable on mobile */}
          <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto scrollbar-hide pb-1">
            {quickQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="text-[10px] sm:text-xs h-7 sm:h-8 whitespace-nowrap flex-shrink-0 touch-manipulation"
                onClick={() => {
                  setInput(q);
                }}
              >
                {q}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
              className="flex-1 text-sm min-h-[44px]"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="min-w-[44px] min-h-[44px] touch-manipulation"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Side Info */}
      <div className="space-y-3 sm:space-y-4">
        <Card className="p-4 sm:p-5 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 backdrop-blur-sm">
          <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            AI hỗ trợ 24/7
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              Phản hồi tức thì
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              Hoàn toàn miễn phí
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              Không giới hạn câu hỏi
            </li>
          </ul>
        </Card>

        <Card className="p-4 sm:p-5 bg-card/60 backdrop-blur-sm">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            Cần tư vấn chuyên sâu?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Đặt lịch tư vấn 1-1 với Long Sang để được hỗ trợ chi tiết hơn.
          </p>
          <Button
            className="w-full min-h-[44px] text-xs sm:text-sm touch-manipulation"
            variant="outline"
          >
            <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Đặt lịch tư vấn
          </Button>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// TAB 3: Paid Consultation Component
// ==========================================
const ConsultationTab = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<"select" | "form">("select");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    topic: "",
    preferredDate: "",
    preferredTime: "",
  });

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setBookingStep("form");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with payment gateway (VNPay/Stripe)
    alert("Chức năng đặt lịch sẽ được kích hoạt sau khi tích hợp thanh toán!");
  };

  return (
    <div>
      {bookingStep === "select" ? (
        <>
          {/* Package Selection */}
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Chọn gói tư vấn</h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-2">
              Video call 1-1 với Long Sang, nhận tư vấn chuyên sâu cho dự án của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {consultationPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-card/60 backdrop-blur-sm ${
                  pkg.popular
                    ? "border-2 border-primary shadow-lg shadow-primary/20"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-primary/30 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg border-l border-b border-primary/50">
                    PHỔ BIẾN NHẤT
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.duration}</span>
                  </div>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>

                  <ul className="text-sm space-y-2 text-left mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${pkg.popular ? "" : "variant-outline"}`}
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    Chọn gói này
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Why Paid Consultation */}
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card className="p-3 sm:p-4 md:p-5 text-center">
              <Video className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mx-auto mb-2 sm:mb-3" />
              <h4 className="font-semibold mb-1 text-xs sm:text-sm md:text-base">Video Call 1-1</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Zoom hoặc Google Meet</p>
            </Card>
            <Card className="p-3 sm:p-4 md:p-5 text-center">
              <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mx-auto mb-2 sm:mb-3" />
              <h4 className="font-semibold mb-1 text-xs sm:text-sm md:text-base">Tư vấn 1-1</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">5+ năm kinh nghiệm</p>
            </Card>
            <Card className="p-3 sm:p-4 md:p-5 text-center">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mx-auto mb-2 sm:mb-3" />
              <h4 className="font-semibold mb-1 text-xs sm:text-sm md:text-base">Tài liệu</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Ghi chép & tóm tắt</p>
            </Card>
            <Card className="p-3 sm:p-4 md:p-5 text-center">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mx-auto mb-2 sm:mb-3" />
              <h4 className="font-semibold mb-1 text-xs sm:text-sm md:text-base">Hỗ trợ sau</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Email follow-up</p>
            </Card>
          </div>
        </>
      ) : (
        /* Booking Form */
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setBookingStep("select")}>
            ← Quay lại chọn gói
          </Button>

          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Đặt lịch tư vấn</CardTitle>
              <CardDescription>
                Gói:{" "}
                <span className="font-semibold text-primary">
                  {consultationPackages.find((p) => p.id === selectedPackage)?.name}
                </span>{" "}
                - {consultationPackages.find((p) => p.id === selectedPackage)?.price}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="booking-name">Họ tên *</Label>
                  <Input
                    id="booking-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="booking-email">Email *</Label>
                  <Input
                    id="booking-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="booking-phone">Số điện thoại *</Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="booking-company">Công ty (nếu có)</Label>
                  <Input
                    id="booking-company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="booking-topic">Chủ đề muốn tư vấn *</Label>
                <Textarea
                  id="booking-topic"
                  placeholder="Mô tả ngắn gọn về dự án hoặc vấn đề bạn muốn tư vấn..."
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="booking-date">Ngày mong muốn *</Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="booking-time">Khung giờ *</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khung giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 - 10:00</SelectItem>
                      <SelectItem value="10:00">10:00 - 11:00</SelectItem>
                      <SelectItem value="14:00">14:00 - 15:00</SelectItem>
                      <SelectItem value="15:00">15:00 - 16:00</SelectItem>
                      <SelectItem value="16:00">16:00 - 17:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Tổng thanh toán:</span>
                  <span className="text-2xl font-bold text-primary">
                    {consultationPackages.find((p) => p.id === selectedPackage)?.price}
                  </span>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Tiến hành thanh toán
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Thanh toán qua VNPay hoặc chuyển khoản ngân hàng
                </p>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnifiedContactSection;
