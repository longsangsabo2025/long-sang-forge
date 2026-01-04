import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Calendar, CheckCircle, Globe, Mail, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
// Social icons using SVG for consistency
const LinkedInIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const GitHubIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);
const XIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Turnstile type declaration
declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// Schema will be created with translations inside component

export const ContactSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const contactSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, t("contact.validation.nameRequired"))
      .max(100, t("contact.validation.nameMax")),
    email: z
      .string()
      .trim()
      .email(t("contact.validation.emailInvalid"))
      .max(255, t("contact.validation.emailMax")),
    service: z.string().min(1, t("contact.validation.serviceRequired")),
    budget: z.string().optional(),
    message: z
      .string()
      .trim()
      .min(20, t("contact.validation.messageMin"))
      .max(1000, t("contact.validation.messageMax")),
    subscribeNewsletter: z.boolean().optional(),
  });

  type ContactFormData = z.infer<typeof contactSchema>;
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    service: "",
    budget: "",
    message: "",
    subscribeNewsletter: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Anti-spam
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  // Autosave
  const STORAGE_KEY = "contact_form_draft";

  // Helper for character count color
  const getCharCountColor = (length: number): string => {
    if (length < 20) return "text-yellow-500";
    if (length > 900) return "text-orange-500";
    return "text-muted-foreground";
  };

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load saved form:", e);
      }
    }
  }, []);

  // Autosave form data
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formData.name || formData.email || formData.message) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            name: formData.name,
            email: formData.email,
            service: formData.service,
            budget: formData.budget,
            message: formData.message,
          })
        );
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [formData]);

  // Initialize Turnstile
  useEffect(() => {
    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current && !turnstileWidgetId.current) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA", // Test key
          callback: (token: string) => setTurnstileToken(token),
          "error-callback": () => setTurnstileToken(null),
          "expired-callback": () => setTurnstileToken(null),
          theme: "dark",
        });
      }
    };

    // Wait for Turnstile to load
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
    setSubmitStatus("idle");
    setErrorMessage("");

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Fake success to confuse bots
      setSubmitStatus("success");
      return;
    }

    // Turnstile validation
    if (!turnstileToken) {
      setSubmitStatus("error");
      setErrorMessage(t("contact.error.captchaRequired", "Vui lòng xác nhận bạn không phải robot"));
      return;
    }

    // Validate form
    const result = contactSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      for (const error of result.error.errors) {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof ContactFormData] = error.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert data into Supabase
      // Note: turnstile_token is verified client-side, not stored in DB
      const { data, error } = await supabase
        .from("contacts")
        .insert([
          {
            name: result.data.name,
            email: result.data.email,
            service: result.data.service,
            budget: result.data.budget || null,
            message: result.data.message,
            subscribe_newsletter: result.data.subscribeNewsletter || false,
            status: "new",
          },
        ])
        .select();

      if (error) {
        console.error("Supabase error:", error);

        // Better error messages
        if (error.code === "23505") {
          setErrorMessage(t("contact.error.duplicate", "Email này đã gửi yêu cầu trước đó"));
        } else if (error.code === "PGRST301") {
          setErrorMessage(t("contact.error.rateLimit", "Quá nhiều yêu cầu, vui lòng thử lại sau"));
        } else {
          setErrorMessage(t("contact.error.serverError", "Lỗi máy chủ, vui lòng thử lại"));
        }
        throw error;
      }

      // Send email via Supabase Edge Function (fire and forget)
      const emailData = {
        name: result.data.name,
        email: result.data.email,
        service: result.data.service,
        message: result.data.message,
      };

      const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

      // Notify admin
      fetch(edgeFnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "longsangsabo@gmail.com",
          template: "newContact",
          data: emailData,
        }),
      }).catch((err) => console.warn("Admin email failed:", err));

      // Auto-reply to user
      fetch(edgeFnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: result.data.email,
          template: "contactAutoReply",
          data: { name: result.data.name },
        }),
      }).catch((err) => console.warn("Auto-reply email failed:", err));

      setSubmitStatus("success");

      // Clear form and localStorage
      setFormData({
        name: "",
        email: "",
        service: "",
        budget: "",
        message: "",
        subscribeNewsletter: false,
      });
      localStorage.removeItem(STORAGE_KEY);

      // Reset Turnstile
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
        setTurnstileToken(null);
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");

      // Network error handling
      if (!navigator.onLine) {
        setErrorMessage(t("contact.error.offline", "Không có kết nối mạng"));
      } else if (!errorMessage) {
        setErrorMessage(t("contact.error.unknown", "Có lỗi xảy ra, vui lòng thử lại"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-8 md:py-16 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 xl:px-28 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t("contact.header")}
          </h2>
          <p className="text-xl font-medium text-muted-foreground">{t("contact.subtitle")}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-16">
          {/* Left Column - Contact Form */}
          <div className="bg-card border border-border/10 rounded-2xl p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            {/* Success Message */}
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-500 font-medium">{t("contact.success.title")}</p>
                  <p className="text-green-500/80 text-sm mt-1">{t("contact.success.message")}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-500 font-medium">
                    {errorMessage || t("contact.error.message")}
                  </p>
                </div>
              </div>
            )}

            {/* Honeypot - Hidden from users, visible to bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_url">Website</label>
              <input
                type="text"
                id="website_url"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-muted-foreground mb-2 block"
                >
                  {t("contact.form.name")}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("contact.form.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`bg-background border-border/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground mb-2 block"
                >
                  {t("contact.form.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("contact.form.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`bg-background border-border/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Service Dropdown */}
              <div>
                <Label
                  htmlFor="service"
                  className="text-sm font-medium text-muted-foreground mb-2 block"
                >
                  {t("contact.form.service")}
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={`bg-background border-border/10 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      errors.service ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder={t("contact.form.servicePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/10 z-50">
                    <SelectItem value="mobile">
                      {t("contact.form.serviceOptions.mobile")}
                    </SelectItem>
                    <SelectItem value="web">{t("contact.form.serviceOptions.web")}</SelectItem>
                    <SelectItem value="automation">
                      {t("contact.form.serviceOptions.automation")}
                    </SelectItem>
                    <SelectItem value="ai">{t("contact.form.serviceOptions.ai")}</SelectItem>
                    <SelectItem value="not-sure">
                      {t("contact.form.serviceOptions.notSure")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
              </div>

              {/* Budget Dropdown */}
              <div>
                <Label
                  htmlFor="budget"
                  className="text-sm font-medium text-muted-foreground mb-2 block"
                >
                  {t("contact.form.budget")}
                </Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-background border-border/10 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder={t("contact.form.budgetPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/10 z-50">
                    <SelectItem value="under-5k">
                      {t("contact.form.budgetOptions.under5k")}
                    </SelectItem>
                    <SelectItem value="5k-15k">{t("contact.form.budgetOptions.5k15k")}</SelectItem>
                    <SelectItem value="15k-50k">
                      {t("contact.form.budgetOptions.15k50k")}
                    </SelectItem>
                    <SelectItem value="50k-plus">
                      {t("contact.form.budgetOptions.50kPlus")}
                    </SelectItem>
                    <SelectItem value="not-sure">
                      {t("contact.form.budgetOptions.notSure")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Textarea */}
              <div>
                <Label
                  htmlFor="message"
                  className="text-sm font-medium text-muted-foreground mb-2 block"
                >
                  {t("contact.form.message")}
                </Label>
                <Textarea
                  id="message"
                  placeholder={t("contact.form.messagePlaceholder")}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  maxLength={1000}
                  className={`bg-background border-border/10 text-foreground placeholder:text-muted-foreground/50 min-h-[120px] resize-y focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.message ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                <span className="flex justify-between items-center mt-1">
                  {errors.message ? (
                    <p className="text-red-500 text-xs">{errors.message}</p>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("contact.form.messageHint", "Tối thiểu 20 ký tự")}
                    </span>
                  )}
                  <span className={`text-xs ${getCharCountColor(formData.message.length)}`}>
                    {formData.message.length}/1000
                  </span>
                </span>
              </div>

              {/* Newsletter Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.subscribeNewsletter}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, subscribeNewsletter: checked as boolean })
                  }
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="newsletter"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {t("contact.form.newsletter")}
                </Label>
              </div>

              {/* Turnstile CAPTCHA */}
              <div className="flex justify-center">
                <div ref={turnstileRef} />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className="w-full bg-primary/30 backdrop-blur-sm hover:bg-primary/50 text-primary-foreground px-8 py-6 rounded-xl text-base font-semibold hover:scale-[1.02] transition-all duration-300 border border-primary/40 hover:border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}
              </Button>
            </form>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-8">
            {/* Quick Consultation CTA */}
            <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-2 border-primary/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Đặt lịch tư vấn 1:1</h3>
                  <p className="text-sm text-muted-foreground">
                    SEO, AI Agent, Automation - Chọn thời gian phù hợp với bạn
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/consultation")}
                className="w-full bg-gradient-to-r from-primary/30 to-secondary/30 backdrop-blur-sm hover:from-primary/50 hover:to-secondary/50 text-primary-foreground font-semibold py-6 text-lg transition-all duration-300 border border-primary/40 hover:border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
              >
                Xem lịch & Đặt ngay →
              </Button>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Email */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                  {t("contact.info.email")}
                </p>
                <a
                  href="mailto:contact@longsang.org"
                  className="text-base text-muted-foreground hover:text-accent transition-colors duration-200"
                >
                  contact@longsang.org
                </a>
              </div>

              {/* Book a Call */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                  {t("contact.info.bookCall")}
                </p>
                <Link
                  to="/consultation"
                  className="text-base text-muted-foreground hover:text-accent transition-colors duration-200 block mb-1"
                >
                  {t("contact.info.bookCallText")}
                </Link>
              </div>

              {/* Social Links */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary mb-3">
                  {t("contact.info.connect")}
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/longsang791"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:scale-110 hover:rotate-6 transition-all duration-250"
                    aria-label="Facebook"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://zalo.me/0961167717"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:scale-110 hover:rotate-6 transition-all duration-250"
                    aria-label="Zalo"
                  >
                    <span className="text-sm font-bold">Zalo</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/long-sang-75a781357/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:scale-110 hover:rotate-6 transition-all duration-250"
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon />
                  </a>
                  <a
                    href="https://github.com/user-longsang"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary hover:scale-110 hover:rotate-6 transition-all duration-250"
                    aria-label="GitHub"
                  >
                    <GitHubIcon />
                  </a>
                  <a
                    href="mailto:contact@longsang.org"
                    className="text-muted-foreground hover:text-primary hover:scale-110 hover:rotate-6 transition-all duration-250"
                    aria-label="Email"
                  >
                    <Mail className="w-7 h-7" />
                  </a>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                  {t("contact.info.location")}
                </p>
                <p className="text-base text-muted-foreground flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" />
                  {t("contact.info.locationText")}
                </p>
                <p className="text-base text-muted-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t("contact.info.timezone")}
                </p>
              </div>
            </div>

            {/* Consultation Cards */}
            <div className="space-y-4 mt-8">
              {/* Free Consultation Card */}
              <div className="bg-card border border-border/10 rounded-xl p-6 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
                <p className="text-sm font-bold text-foreground mb-2">
                  {t("contact.consultations.free.badge")}
                </p>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("contact.consultations.free.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("contact.consultations.free.duration")}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("contact.consultations.free.description")}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <Link to="/consultation">{t("contact.consultations.free.cta")}</Link>
                </Button>
              </div>

              {/* Paid Consultation Card */}
              <div className="bg-card border border-border/10 rounded-xl p-6 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-all duration-300">
                <p className="text-sm font-bold text-foreground mb-2">
                  {t("contact.consultations.paid.badge")}
                </p>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("contact.consultations.paid.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("contact.consultations.paid.duration")}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("contact.consultations.paid.description")}
                </p>
                <p className="text-sm font-semibold text-primary mb-4">
                  {t("contact.consultations.paid.price")}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <a href="#contact">{t("contact.consultations.paid.cta")}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
