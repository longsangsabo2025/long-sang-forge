import { useLanguage } from "@/contexts/LanguageContext";
import {
  Award,
  Briefcase,
  Calendar,
  Globe,
  GraduationCap,
  MapPin,
  Settings,
  Smartphone,
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
      const targets = { years: 5, apps: 8, users: 500 };
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
    <section
      ref={sectionRef}
      id="about"
      className="section-padding bg-background-secondary relative"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left Content - 60% */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <p className="text-sm text-primary font-medium">{t("about.badge")}</p>
              </div>

              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                {t("about.title")}
              </h2>
            </div>

            <div className="space-y-6 text-lg text-foreground-secondary leading-relaxed">
              <p>{t("about.description1")}</p>
              <p>{t("about.description2")}</p>
              <p>{t("about.description3")}</p>
            </div>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <Calendar className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">{t("about.dateOfBirth")}</p>
                <p className="text-lg font-semibold text-foreground">04/1996</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <GraduationCap className="w-8 h-8 text-secondary mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">{t("about.education")}</p>
                <p className="text-lg font-semibold text-foreground">B.Eng Petroleum</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <Globe className="w-8 h-8 text-accent mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">
                  {language === "vi" ? "Ngôn ngữ" : "Languages"}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {language === "vi"
                    ? "Tiếng Việt (Native), English (IELTS 6.0)"
                    : "Vietnamese (Native), English (IELTS 6.0)"}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <MapPin className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm text-foreground-secondary mb-1">{t("about.location")}</p>
                <p className="text-lg font-semibold text-foreground">Vung Tau, Vietnam</p>
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
                  <p className="text-lg font-medium text-foreground-secondary">
                    {language === "vi" ? "Năm Kinh Nghiệm" : "Years Experience"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "vi" ? "Kỹ thuật & Công nghệ" : "Engineering & Tech"}
                  </p>
                </div>

                <div className="h-px bg-border" />

                {/* Apps Counter - Changed from projects */}
                <div className="text-center group hover-lift">
                  <div className="text-5xl font-heading font-black text-secondary mb-2">
                    {counts.apps}+
                  </div>
                  <p className="text-lg font-medium text-foreground-secondary">
                    {language === "vi" ? "Ứng dụng Production" : "Live Applications"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
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
                  <p className="text-lg font-medium text-foreground-secondary">
                    {language === "vi" ? "Người Dùng" : "Users Served"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
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
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-xl p-4 text-center group hover-lift">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5 text-secondary" />
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
                  <Smartphone className="w-5 h-5 text-cyan-400" />
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
