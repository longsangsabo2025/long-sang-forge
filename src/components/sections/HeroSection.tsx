import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HeroSection = () => {
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Transparent - let TechBackground show through */}

      {/* Grid Pattern Overlay - very subtle */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Animated Gradient Orbs - reduced opacity */}
      <div
        className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: "10s", animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: "12s", animationDelay: "4s" }}
      />

      {/* Content Container - Wider to extend right */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 md:py-12">
        <div className="grid lg:grid-cols-[60%_40%] gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-4 sm:space-y-6 animate-slide-up order-2 lg:order-1">
            {/* Greeting */}
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-white/90 tracking-wide animate-slide-up animate-delay-100">
              {t("hero.greeting")}
            </p>

            {/* Main Headline - Fluid typography */}
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white animate-slide-up animate-delay-200">
              {t("hero.headline1")}
              <br />
              <span className="text-cyan-400">{t("hero.headline2")}</span>
            </h1>

            {/* Detailed Benefits - 2 paragraphs, white text, justified */}
            <div className="space-y-3 sm:space-y-4 animate-slide-up animate-delay-300">
              <p className="text-base sm:text-lg text-white leading-relaxed text-justify">
                {t("hero.subheadline1")}
              </p>
              <p className="text-base sm:text-lg text-white leading-relaxed text-justify">
                {t("hero.subheadline2")}
              </p>
            </div>

            {/* Tagline */}
            <p className="text-sm sm:text-base font-semibold text-primary animate-slide-up animate-delay-350">
              {t("hero.tagline")}
            </p>

            {/* Latest Work Badge - Now clickable */}
            <button
              onClick={() => scrollToSection("#projects")}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-xs sm:text-sm font-medium text-primary hover:scale-105 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-200 animate-slide-up animate-delay-400 touch-manipulation"
            >
              {t("hero.latestBadge")}
            </button>

            {/* CTA Buttons - Touch-friendly min 44px height */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4 animate-slide-up animate-delay-500">
              <Button
                onClick={() => scrollToSection("#contact")}
                size="lg"
                className="bg-gradient-to-r from-primary/30 to-secondary/30 backdrop-blur-sm hover:from-primary/50 hover:to-secondary/50 text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 rounded-xl text-base sm:text-lg font-semibold hover:scale-105 transition-all duration-300 border border-primary/40 hover:border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] min-h-[48px] touch-manipulation w-full xs:w-auto"
              >
                {t("hero.cta2")}
              </Button>
            </div>
          </div>

          {/* Right Side - Profile Image */}
          <div className="flex justify-center lg:justify-end animate-slide-up animate-delay-300 order-1 lg:order-2">
            <div className="relative w-full max-w-[280px] xs:max-w-xs sm:max-w-sm md:max-w-md lg:w-[500px] h-[280px] xs:h-[320px] sm:h-[400px] lg:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border/10 animate-float group hover:scale-105 transition-all duration-500 shadow-2xl">
              <img
                src="/images/avatarpro.png"
                alt="Long Sang - Software Developer"
                className="w-full h-full object-cover object-top lg:object-center"
                loading="eager"
                onError={(e) => {
                  // Fallback to icon if image not found
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.classList.add(
                    "flex",
                    "items-center",
                    "justify-center"
                  );
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on very small mobile */}
        <button
          onClick={() => scrollToSection("#services")}
          className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors group animate-slide-up animate-delay-500 hidden xs:flex touch-manipulation"
        >
          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse-soft group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm font-medium">{t("hero.scrollText")}</span>
        </button>
      </div>
    </section>
  );
};
