import { useLanguage } from "@/contexts/LanguageContext";
import {
  Award,
  Bot,
  Briefcase,
  Calendar,
  Globe,
  GraduationCap,
  Lightbulb,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CVAboutSection = () => {
  const { t, language } = useLanguage();
  const [inView, setInView] = useState(false);
  const [counts, setCounts] = useState({ years: 0, apps: 0, users: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      // Updated with realistic metrics
      const targets = { years: 5, apps: 5, users: 200 };
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setCounts({
          years: Math.floor(targets.years * progress),
          apps: Math.floor(targets.apps * progress),
          users: Math.floor(targets.users * progress),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setCounts(targets);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [inView]);

  return (
    <section ref={sectionRef} id="about" className="section-padding relative overflow-hidden">
      {/* Animated Background - Same style as Hero */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left Content - 60% */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <p className="text-sm text-primary font-medium">{t("about.badge")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-heading font-black text-gradient-gold">
                {t("about.role")}
              </h3>
              <p className="text-lg text-foreground-secondary leading-relaxed pt-2 text-justify">
                {t("about.paragraph")}
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5" />
                  <p className="text-lg text-foreground-secondary leading-relaxed">
                    {t("about.line1")}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5" />
                  <p className="text-lg text-foreground-secondary leading-relaxed">
                    {t("about.line2")}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <Calendar className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">{t("about.dateOfBirth")}</p>
                <p className="text-lg font-semibold text-foreground">02/1996</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <GraduationCap className="w-8 h-8 text-emerald-400 mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">{t("about.education")}</p>
                <p className="text-lg font-semibold text-foreground">
                  {language === "vi" ? "Kỹ sư Lọc - Hóa dầu" : "B.Eng Refining & Petrochemical"}
                </p>
                <p className="text-xs text-foreground-secondary mt-1">2014 - 2019 • GPA: 7.3/10</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <Globe className="w-8 h-8 text-accent mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">
                  {language === "vi" ? "Ngôn ngữ" : "Languages"}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {language === "vi"
                    ? "Tiếng Việt (Native), English (IELTS 5.5)"
                    : "Vietnamese (Native), English (IELTS 5.5)"}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <MapPin className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">{t("about.location")}</p>
                <p className="text-lg font-semibold text-foreground">HCM, Việt Nam</p>
              </div>
            </div>
          </div>

          {/* Right Content - 40% Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              <div className="space-y-8">
                {/* Years Counter - Updated label */}
                <div className="text-center group hover-lift">
                  <div className="text-6xl font-heading font-black text-gradient-gold mb-2">
                    {counts.years}+
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {language === "vi" ? "Năm Kinh Nghiệm" : "Years Experience"}
                  </p>
                  <p className="text-sm text-foreground-secondary mt-1">
                    {language === "vi" ? "Kỹ thuật & Công nghệ" : "Engineering & Tech"}
                  </p>
                </div>

                <div className="h-px bg-border" />

                {/* Apps Counter - Changed from projects */}
                <div className="text-center group hover-lift">
                  <div className="text-5xl font-heading font-black text-emerald-400 mb-2">
                    {counts.apps}+
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {language === "vi" ? "Ứng dụng Production" : "Live Applications"}
                  </p>
                  <p className="text-sm text-foreground-secondary mt-1">
                    {language === "vi"
                      ? "Web & Mobile đang hoạt động"
                      : "Web & Mobile in production"}
                  </p>
                </div>

                <div className="h-px bg-border" />

                {/* Users Counter - Changed from clients */}
                <div className="text-center group hover-lift">
                  <div className="text-5xl font-heading font-black text-accent mb-2">
                    {counts.users}+
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {language === "vi" ? "Người Dùng" : "Users Served"}
                  </p>
                  <p className="text-sm text-foreground-secondary mt-1">
                    {language === "vi"
                      ? "SABO Arena, SaboHub & hơn nữa"
                      : "SABO Arena, SaboHub & more"}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4 text-center group hover-lift">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground">{t("about.fullStackDev")}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-4 text-center group hover-lift">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs font-semibold text-foreground">{t("about.aiIntegration")}</p>
              </div>
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-xl p-4 text-center group hover-lift">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <p className="text-xs font-semibold text-foreground">{t("about.businessOwner")}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-4 text-center group hover-lift">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-xs font-semibold text-foreground">{t("about.mobileDev")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CVAboutSection;
