import { useLanguage } from "@/contexts/LanguageContext";
import { Coffee, Heart, Linkedin, Mail, Phone } from "lucide-react";

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
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border">
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
                href="https://www.linkedin.com/in/long-sang-75a781357/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-primary hover:border-primary transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/longsang791"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-blue-500 hover:border-blue-500 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://zalo.me/0961167717"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground-secondary hover:text-blue-400 hover:border-blue-400 transition-all overflow-hidden"
              >
                <svg className="w-7 h-7" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
