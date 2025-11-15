import { useState, useEffect } from "react";
import { Mail, Menu, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserProfile } from "./auth/UserProfile";
import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  { name: "nav.home", href: "#home" },
  { name: "nav.services", href: "#services" },
  { name: "nav.projects", href: "#projects" },
  { name: "nav.techStack", href: "#tech-stack" },
  { name: "nav.learning", href: "#learning" },
  { name: "nav.contact", href: "#contact" },
  { name: "📄 My CV", href: "/cv", isRoute: true },
  { name: "🤖 AI Marketplace", href: "/marketplace", isRoute: true },
  { name: "📊 My Agents", href: "/dashboard", isRoute: true },
  { name: "Đặt lịch tư vấn", href: "/consultation", isRoute: true },
];

export const Navigation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    
    // Check if it's a route (starts with /)
    if (href?.startsWith("/")) {
      navigate(href);
      return;
    }
    
    // Otherwise it's an anchor link
    if (href) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" onClick={handleNavClick} className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            LS
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleNavClick}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                link.isRoute 
                  ? "bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20"
                  : activeSection === link.href.substring(1)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.isRoute ? link.name : t(link.name)}
            </a>
          ))}
          </div>

        {/* Right Side - Language Switcher, Contact & CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          <a
            href="mailto:contact@longsang.org"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
          <Button
            asChild
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 font-semibold"
          >
            <a href="https://calendly.com/longsang" target="_blank" rel="noopener noreferrer">
              {t('nav.bookCall')}
            </a>
          </Button>
          <UserProfile />
        </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-background/98 backdrop-blur-lg animate-fade-in">
          {/* Menu Content */}
          <div className="flex flex-col items-center gap-8 pt-28 px-6">
            {/* Language Switcher - Mobile */}
            <div className="mb-4">
              <LanguageSwitcher />
            </div>
            
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e);
                  setIsMenuOpen(false);
                }}
                className={`text-2xl font-semibold transition-colors hover:text-primary ${
                  activeSection === link.href.substring(1)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {t(link.name)}
              </a>
            ))}

            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl font-semibold"
            >
              <a href="https://calendly.com/longsang" target="_blank" rel="noopener noreferrer">
                {t('nav.bookCall')}
              </a>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
