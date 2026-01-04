/**
 * ShowcaseHeader - Generic Header for All Showcase Pages
 * Reusable glassmorphism header with scroll effect
 */
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface NavItem {
  label: string;
  href: string;
}

export interface ShowcaseHeaderProps {
  /** Project name displayed in header */
  projectName: string;
  /** Highlighted part of the name (gradient text) */
  projectNameHighlight?: string;
  /** Navigation items */
  navItems?: NavItem[];
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button href */
  ctaHref?: string;
  /** Icon component to display */
  icon?: LucideIcon;
  /** Icon background color class */
  iconBgClass?: string;
  /** Icon color class */
  iconColorClass?: string;
  /** Show back to main button */
  showBackButton?: boolean;
  /** Custom back button handler */
  onBackToMain?: () => void;
  /** Showcase slug for detail link */
  showcaseSlug?: string;
}

export const ShowcaseHeader = ({
  projectName,
  projectNameHighlight,
  navItems = [],
  ctaLabel,
  ctaHref,
  icon: Icon,
  iconBgClass = "bg-primary",
  iconColorClass = "text-accent",
  showBackButton = true,
  onBackToMain,
  showcaseSlug,
}: ShowcaseHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handler for "Chi tiết Showcase" button - requires login
  const handleShowcaseDetailClick = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      navigate(`/projects/${showcaseSlug}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    } else if (href.startsWith("/")) {
      navigate(href);
    } else {
      window.open(href, "_blank");
    }
    setIsMobileMenuOpen(false);
  };

  const handleBackClick = () => {
    if (onBackToMain) {
      onBackToMain();
    } else {
      navigate("/");
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/10 py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            {Icon && (
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className={`absolute inset-0 ${iconBgClass} rounded-xl opacity-80`} />
                <Icon className={`relative w-6 h-6 ${iconColorClass}`} />
              </div>
            )}
            <span className="text-xl font-bold text-foreground">
              {projectName}{" "}
              {projectNameHighlight && (
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {projectNameHighlight}
                </span>
              )}
            </span>
          </a>

          {/* Desktop Navigation */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>
            )}
            {showcaseSlug && (
              <button
                onClick={handleShowcaseDetailClick}
                className="px-5 py-2.5 rounded-full font-medium border border-amber-400/50 text-amber-300 backdrop-blur-sm bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400 transition-all duration-300 flex items-center gap-2"
              >
                <span className="text-amber-400">✦</span>
                Chi tiết Showcase
              </button>
            )}
            {ctaLabel && ctaHref && (
              <button
                onClick={() => handleNavClick(ctaHref)}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-medium text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
              >
                {ctaLabel}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl mt-2 mx-4 rounded-xl overflow-hidden border border-white/10"
          >
            <nav className="flex flex-col p-4 gap-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium py-2 text-left"
                >
                  {item.label}
                </button>
              ))}
              {showBackButton && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium py-2 text-left"
                >
                  <ArrowLeft size={16} />
                  Quay lại longsang.org
                </button>
              )}
              {showcaseSlug && (
                <button
                  onClick={handleShowcaseDetailClick}
                  className="w-full py-3 rounded-xl font-medium border border-amber-400/50 text-amber-300 backdrop-blur-sm bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-300 text-center flex items-center justify-center gap-2"
                >
                  <span className="text-amber-400">✦</span>
                  Chi tiết Showcase
                </button>
              )}
              {ctaLabel && ctaHref && (
                <button
                  onClick={() => handleNavClick(ctaHref)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-medium text-white text-center mt-2"
                >
                  {ctaLabel}
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal for unauthenticated users */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={`/projects/${showcaseSlug}`}
      />
    </motion.header>
  );
};

export default ShowcaseHeader;
