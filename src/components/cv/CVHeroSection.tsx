import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowDown,
  Briefcase,
  Clock,
  Download,
  Github,
  Linkedin,
  Mail,
  Phone,
  Users,
} from "lucide-react";

const CVHeroSection = () => {
  const { t, language } = useLanguage();

  const scrollToAbout = () => {
    const element = document.querySelector("#about");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  // TODO: Replace with actual PDF download URL
  const handleDownloadCV = () => {
    // Tạm thời alert, sau này sẽ link đến PDF thực
    alert(
      language === "vi"
        ? "Tính năng tải CV đang được cập nhật. Vui lòng liên hệ qua email để nhận CV PDF."
        : "CV download feature is being updated. Please contact via email to receive PDF CV."
    );
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in-left">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <p className="text-sm text-primary font-medium">{t("hero.hello")}</p>
            </div>

            <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight">
              <span className="block text-foreground">{t("hero.name")}</span>
              <span className="block text-gradient-gold mt-2">Software Developer</span>
            </h1>

            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-primary">
                {t("hero.position")}
              </h2>
              <h3 className="text-lg md:text-xl text-secondary">{t("hero.subtitle")}</h3>
            </div>

            <p className="text-lg text-foreground-secondary leading-relaxed max-w-xl">
              {t("hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow"
                onClick={() =>
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("hero.contactMe")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() =>
                  document.querySelector("#experience")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("hero.viewWork")}
              </Button>
              {/* Download CV Button */}
              <Button
                size="lg"
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground gap-2"
                onClick={handleDownloadCV}
              >
                <Download className="w-4 h-4" />
                {language === "vi" ? "Tải CV PDF" : "Download CV"}
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a
                href="https://linkedin.com/in/longsang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary hover:shadow-glow transition-all"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/longsang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary hover:shadow-glow transition-all"
                title="GitHub Profile"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:longsangsabo@gmail.com"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary hover:shadow-glow transition-all"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="tel:+84961167717"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary hover:shadow-glow transition-all"
                title="Phone"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className="relative animate-fade-in-right">
            <div className="relative">
              {/* Floating Badges - Updated with real metrics */}
              <div className="absolute -top-6 -left-6 bg-card border border-primary/20 rounded-2xl px-6 py-3 shadow-card animate-float z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">5+</p>
                  <p className="text-sm text-foreground-secondary">
                    {language === "vi" ? "Năm Kỹ thuật" : "Years Engineering"}
                  </p>
                </div>
              </div>

              <div
                className="absolute top-1/2 -right-6 bg-card border border-secondary/20 rounded-2xl px-6 py-3 shadow-card animate-float z-10 flex items-center gap-3"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-secondary">500+</p>
                  <p className="text-sm text-foreground-secondary">
                    {language === "vi" ? "Người dùng" : "Users Served"}
                  </p>
                </div>
              </div>

              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-card border border-accent/20 rounded-2xl px-6 py-3 shadow-card animate-float z-10 flex items-center gap-3"
                style={{ animationDelay: "1s" }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold text-accent">8+</p>
                  <p className="text-sm text-foreground-secondary">
                    {language === "vi" ? "Apps Production" : "Live Apps"}
                  </p>
                </div>
              </div>

              {/* Profile Image */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-primary/20 shadow-elevated">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20" />
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">VLS</span>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10 animate-glow-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-secondary hover:text-primary transition-colors cursor-pointer group"
      >
        <span className="text-sm font-medium">{t("hero.scrollExplore")}</span>
        <ArrowDown className="w-6 h-6 animate-bounce" />
      </button>
    </section>
  );
};

export default CVHeroSection;
