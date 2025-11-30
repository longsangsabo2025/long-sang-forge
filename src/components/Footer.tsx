import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { nameKey: "footer.links.home", href: "#home" },
    { nameKey: "footer.links.about", href: "#about" },
    { nameKey: "footer.links.projects", href: "#projects" },
    { nameKey: "footer.links.contact", href: "#contact" },
  ];

  const services = [
    { nameKey: "footer.servicesList.mobile", href: "#services" },
    { nameKey: "footer.servicesList.web", href: "#services" },
    { nameKey: "footer.servicesList.automation", href: "#services" },
    { nameKey: "footer.servicesList.ai", href: "#services" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#0a0f1a] border-t border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-10 sm:py-12 md:py-16 lg:py-20">
        {/* Top Section - 3 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-6 sm:gap-8 md:gap-12 lg:gap-16 mb-8 sm:mb-10 md:mb-12">
          {/* Brand Column - Full width on mobile */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              {t("footer.brand")}
            </h3>
            <p className="text-sm sm:text-base font-medium text-muted-foreground mb-3 sm:mb-4">
              {t("footer.tagline")}
            </p>
            <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-muted-foreground/80 max-w-sm">
              {t("footer.description")}
            </p>

            {/* Social Icons - Touch-friendly 44px targets */}
            <div className="flex gap-3 sm:gap-4 md:gap-5 mt-6 sm:mt-8">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-250 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-250 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-250 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="mailto:contact@longsang.org"
                className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-250 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary mb-3 sm:mb-4 md:mb-5">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.nameKey}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-xs sm:text-sm md:text-[15px] text-muted-foreground hover:text-primary hover:translate-x-0.5 transition-all duration-200 inline-block min-h-[36px] sm:min-h-[40px] flex items-center touch-manipulation"
                  >
                    {t(link.nameKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary mb-3 sm:mb-4 md:mb-5">
              {t("footer.services")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <li key={service.nameKey}>
                  <button
                    onClick={() => scrollToSection(service.href)}
                    className="text-xs sm:text-sm md:text-[15px] text-muted-foreground hover:text-primary hover:translate-x-0.5 transition-all duration-200 inline-block min-h-[36px] sm:min-h-[40px] flex items-center touch-manipulation"
                  >
                    {t(service.nameKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-border/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground/60">
            <p className="text-center md:text-left">{t("footer.copyright")}</p>
            <div className="flex gap-4 sm:gap-6">
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-200 py-2 min-h-[44px] flex items-center touch-manipulation"
              >
                {t("footer.privacy")}
              </a>
              <span className="flex items-center">•</span>
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-200 py-2 min-h-[44px] flex items-center touch-manipulation"
              >
                {t("footer.terms")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
