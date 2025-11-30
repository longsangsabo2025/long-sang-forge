import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Coffee, Download, Heart, Linkedin, Mail, Phone } from "lucide-react";

const CVFooter = () => {
  const { t, language } = useLanguage();

  const quickLinksVI = [
    ["Trang chủ", "home"],
    ["Về tôi", "about"],
    ["Kinh nghiệm", "experience"],
    ["Liên hệ", "contact"],
  ];

  const quickLinksEN = [
    ["Home", "home"],
    ["About", "about"],
    ["Experience", "experience"],
    ["Contact", "contact"],
  ];

  const servicesVI = [
    "Phát triển Web & Mobile",
    "Tích hợp AI",
    "Tư vấn Kinh doanh",
    "Tự động hóa quy trình",
  ];

  const servicesEN = [
    "Web & Mobile Development",
    "AI Integration",
    "Business Consulting",
    "Process Automation",
  ];

  const quickLinks = language === "vi" ? quickLinksVI : quickLinksEN;
  const services = language === "vi" ? servicesVI : servicesEN;

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold text-gradient-gold">VÕ LONG SANG</h3>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(([label, id]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="text-foreground-secondary hover:text-primary transition-colors text-sm"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">
              {t("footer.services")}
            </h4>
            <ul className="space-y-2 text-sm text-foreground-secondary">
              {services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">
              {t("footer.connect")}
            </h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:longsangsabo@gmail.com"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="tel:+84961167717"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary transition-all"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
              <Download className="w-4 h-4 mr-2" />
              {t("footer.downloadCV")}
            </Button>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground-secondary text-center md:text-left">
              {t("footer.copyright")}
            </p>
            <p className="text-sm text-foreground-secondary flex items-center gap-1">
              {t("footer.madeWith")} <Heart className="w-4 h-4 text-destructive fill-current" />{" "}
              {t("footer.and")} <Coffee className="w-4 h-4" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CVFooter;
