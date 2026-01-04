import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowDown, Briefcase, Clock, Github, Linkedin, Mail, Phone, Users } from "lucide-react";

const CVHeroSection = () => {
  const { t, language } = useLanguage();

  const scrollToAbout = () => {
    const element = document.querySelector("#about");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
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
              <span className="block text-gradient-gold mt-2">{t("hero.position")}</span>
            </h1>

            <p className="text-lg text-foreground-secondary leading-relaxed max-w-xl text-justify">
              {t("hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary/30 backdrop-blur-sm hover:bg-primary/50 text-primary-foreground font-semibold shadow-glow border border-primary/50 hover:border-primary/70 transition-all duration-300"
                onClick={() =>
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("hero.contactMe")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/20 hover:text-primary-foreground backdrop-blur-sm transition-all duration-300"
                onClick={() =>
                  document.querySelector("#experience")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("hero.viewWork")}
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a
                href="https://www.linkedin.com/in/long-sang-75a781357/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary hover:shadow-glow transition-all"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/longsangsabo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary hover:shadow-glow transition-all"
                title="GitHub Profile"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/longsang791"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-blue-500 hover:border-blue-500 hover:shadow-glow transition-all"
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
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-blue-400 hover:border-blue-400 hover:shadow-glow transition-all overflow-hidden"
                title="Zalo"
              >
                <svg className="w-8 h-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="25" fill="#0068FF" />
                  <text
                    x="50"
                    y="68"
                    fontFamily="Arial, sans-serif"
                    fontWeight="bold"
                    fontSize="40"
                    fill="white"
                    textAnchor="middle"
                  >
                    Zalo
                  </text>
                </svg>
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
                className="absolute top-1/2 -right-6 bg-card border border-emerald-500/20 rounded-2xl px-6 py-3 shadow-card animate-float z-10 flex items-center gap-3"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-400">200+</p>
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
                <div className="w-full h-96 bg-gradient-to-br from-background-secondary to-background flex items-center justify-center p-8">
                  <img
                    src="/images/logo.png"
                    alt="Võ Long Sang Logo"
                    className="max-w-full max-h-full object-contain"
                  />
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
