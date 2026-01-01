import { Layout } from "@/components/LayoutWithChat";
import { BookingForm } from "@/components/consultation/BookingForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Định nghĩa packages với duration để map với consultation types
const PACKAGES = {
  basic: { duration: 30, nameKey: "consultation.packages.basic.name" },
  standard: { duration: 60, nameKey: "consultation.packages.standard.name" },
  premium: { duration: 120, nameKey: "consultation.packages.premium.name" },
} as const;

type PackageKey = keyof typeof PACKAGES;

export default function ConsultationBooking() {
  const { t } = useTranslation();
  const [selectedPackage, setSelectedPackage] = useState<PackageKey | null>(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  const handleSelectPackage = (pkg: PackageKey) => {
    setSelectedPackage(pkg);
    // Scroll to booking form
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[30vh] flex items-center pt-8">
        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Animated Gradient Orbs */}
        <div
          className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              {t("consultation.title")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary">
                {t("consultation.titleHighlight")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 mb-4 leading-relaxed">
              {t("consultation.subtitle")}
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-white/60">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm">{t("consultation.socialProof")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-10 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t("consultation.packages.title")}{" "}
              <span className="text-cyan-400">{t("consultation.packages.titleHighlight")}</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">{t("consultation.packages.subtitle")}</p>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* Gói Cơ Bản - 30 phút */}
            <Card className="relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-600" />
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-white/60 text-sm">
                    {t("consultation.packages.basic.duration")}
                  </span>
                </div>
                <CardTitle className="text-2xl text-white">
                  {t("consultation.packages.basic.name")}
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-cyan-400">
                    {t("consultation.packages.basic.price")}
                  </span>
                  <span className="text-white/40 line-through text-lg">
                    {t("consultation.packages.basic.originalPrice")}
                  </span>
                </div>
                <p className="text-cyan-400/80 text-sm font-medium mt-1">
                  {t("consultation.packages.basic.savings")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                  {t("consultation.packages.includes")}
                </p>
                {(
                  t("consultation.packages.basic.features", { returnObjects: true }) as string[]
                ).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
                {/* Subscription Bonus */}
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg mt-3">
                  <span className="text-blue-300 font-medium text-sm">
                    {t("consultation.packages.basic.subscriptionBonus")}
                  </span>
                </div>
                <Button
                  className={`w-full mt-4 text-white transition-all ${
                    selectedPackage === "basic"
                      ? "bg-cyan-600 ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900"
                      : "bg-cyan-500 hover:bg-cyan-600"
                  }`}
                  onClick={() => handleSelectPackage("basic")}
                >
                  {selectedPackage === "basic"
                    ? t("consultation.packages.selected")
                    : t("consultation.packages.register")}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Gói Tiêu Chuẩn - 60 phút - POPULAR */}
            <Card className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-cyan-500/5 backdrop-blur-sm border-primary/50 shadow-[0_0_40px_rgba(6,182,212,0.2)] scale-105 hover:scale-[1.07] transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
              <Badge className="absolute top-4 right-4 bg-primary text-white border-0 shadow-lg">
                {t("consultation.packages.standard.badge")}
              </Badge>
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-white/60 text-sm">
                    {t("consultation.packages.standard.duration")}
                  </span>
                </div>
                <CardTitle className="text-2xl text-white">
                  {t("consultation.packages.standard.name")}
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-primary">
                    {t("consultation.packages.standard.price")}
                  </span>
                  <span className="text-white/40 line-through text-lg">
                    {t("consultation.packages.standard.originalPrice")}
                  </span>
                </div>
                <p className="text-primary/80 text-sm font-medium mt-1">
                  {t("consultation.packages.standard.savings")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                  {t("consultation.packages.includes")}
                </p>
                {(
                  t("consultation.packages.standard.features", { returnObjects: true }) as string[]
                ).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span
                      className={
                        feature.includes("📄") ? "text-white font-medium" : "text-white/80"
                      }
                    >
                      {feature}
                    </span>
                  </div>
                ))}
                {/* Subscription Bonus */}
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg mt-3">
                  <span className="text-blue-300 font-medium text-sm">
                    {t("consultation.packages.standard.subscriptionBonus")}
                  </span>
                </div>
                <Button
                  className={`w-full mt-4 text-white transition-all ${
                    selectedPackage === "standard"
                      ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-gray-900"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                  onClick={() => handleSelectPackage("standard")}
                >
                  {selectedPackage === "standard"
                    ? t("consultation.packages.selected")
                    : t("consultation.packages.register")}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Gói Premium - 120 phút (90p + 30p bonus) */}
            <Card className="relative overflow-hidden bg-white/5 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400" />
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                {t("consultation.packages.premium.badge")}
              </Badge>
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-white/60 text-sm">
                    {t("consultation.packages.premium.duration")}
                  </span>
                  <span className="text-purple-400 text-xs">
                    {t("consultation.packages.premium.durationNote")}
                  </span>
                </div>
                <CardTitle className="text-2xl text-white">
                  {t("consultation.packages.premium.name")}
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-purple-400">
                    {t("consultation.packages.premium.price")}
                  </span>
                  <span className="text-white/40 line-through text-lg">
                    {t("consultation.packages.premium.originalPrice")}
                  </span>
                </div>
                <p className="text-purple-400/80 text-sm font-medium mt-1">
                  {t("consultation.packages.premium.savings")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                  {t("consultation.packages.includes")}
                </p>
                {(
                  t("consultation.packages.premium.features", { returnObjects: true }) as string[]
                ).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                    <span
                      className={
                        feature.includes("📊") ? "text-white font-medium" : "text-white/80"
                      }
                    >
                      {feature}
                    </span>
                  </div>
                ))}
                {/* BONUS Follow-up */}
                <div className="flex items-start gap-3 bg-purple-500/20 border border-purple-500/30 p-3 rounded-lg -mx-1 mt-2">
                  <span className="font-bold text-purple-300">
                    {t("consultation.packages.premium.bonus")}
                  </span>
                </div>
                {/* VIP Subscription Bonus */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 p-3 rounded-lg">
                  <span className="text-amber-300 font-medium text-sm">
                    {t("consultation.packages.premium.subscriptionBonus")}
                  </span>
                </div>
                <Button
                  className={`w-full mt-4 text-white transition-all ${
                    selectedPackage === "premium"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  }`}
                  onClick={() => handleSelectPackage("premium")}
                >
                  {selectedPackage === "premium"
                    ? t("consultation.packages.selected")
                    : t("consultation.packages.register")}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-10 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            {t("consultation.whyChoose.title")}{" "}
            <span className="text-cyan-400">{t("consultation.whyChoose.titleHighlight")}</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center hover:border-cyan-500/30 transition-all">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.whyChoose.experience.title")}
                </h3>
                <p className="text-sm text-white/60">
                  {t("consultation.whyChoose.experience.desc")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center hover:border-cyan-500/30 transition-all">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Video className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.whyChoose.flexible.title")}
                </h3>
                <p className="text-sm text-white/60">{t("consultation.whyChoose.flexible.desc")}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center hover:border-cyan-500/30 transition-all">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.whyChoose.docs.title")}
                </h3>
                <p className="text-sm text-white/60">{t("consultation.whyChoose.docs.desc")}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center hover:border-cyan-500/30 transition-all">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.whyChoose.practical.title")}
                </h3>
                <p className="text-sm text-white/60">
                  {t("consultation.whyChoose.practical.desc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-10 relative" id="booking-form" ref={bookingFormRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t("consultation.booking.title")}{" "}
                <span className="text-cyan-400">{t("consultation.booking.titleHighlight")}</span>
              </h2>
              <p className="text-white/60">
                {selectedPackage
                  ? t("consultation.booking.selectedPackage", {
                      name: t(PACKAGES[selectedPackage].nameKey),
                      duration: PACKAGES[selectedPackage].duration,
                    })
                  : t("consultation.booking.defaultText")}
              </p>
            </div>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <BookingForm
                  defaultDuration={selectedPackage ? PACKAGES[selectedPackage].duration : undefined}
                  onSuccess={() => {
                    setSelectedPackage(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 relative">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-center">
                {t("consultation.faq.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.faq.q1.question")}
                </h3>
                <p className="text-white/60 text-sm">{t("consultation.faq.q1.answer")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.faq.q2.question")}
                </h3>
                <p className="text-white/60 text-sm">{t("consultation.faq.q2.answer")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.faq.q3.question")}
                </h3>
                <p className="text-white/60 text-sm">{t("consultation.faq.q3.answer")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  {t("consultation.faq.q4.question")}
                </h3>
                <p className="text-white/60 text-sm">{t("consultation.faq.q4.answer")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
