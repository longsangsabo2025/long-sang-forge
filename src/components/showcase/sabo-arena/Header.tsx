/**
 * SABO Arena Header
 * Ported from sabo-arena-landing
 */
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Trang chủ", href: "#hero" },
  { label: "Tính năng", href: "#features" },
  { label: "Giải đấu", href: "#formats" },
  { label: "Tải App", href: "#download" },
];

interface SaboArenaHeaderProps {
  onBackToMain?: () => void;
}

export const SaboArenaHeader = ({ onBackToMain }: SaboArenaHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const showcaseSlug = "sabo-arena-billiards-platform";

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
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-card py-3" : "py-5"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img
              src="/images/logoxoaphong.png"
              alt="SABO Arena Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-foreground">
              SABO <span className="text-gradient-cyan">ARENA</span>
            </span>
          </a>

          {/* Desktop Navigation */}
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

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Quay lại
              </button>
            )}
            <button
              onClick={handleShowcaseDetailClick}
              className="px-5 py-2.5 rounded-full font-medium border border-amber-400/50 text-amber-300 backdrop-blur-sm bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400 transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-amber-400">✦</span>
              Chi tiết Showcase
            </button>
            <a href="#download" className="btn-primary-gradient">
              Tải App Ngay
            </a>
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
            className="md:hidden glass-card mt-2 mx-4 rounded-xl overflow-hidden"
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
              {onBackToMain && (
                <button
                  onClick={onBackToMain}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium py-2 text-left"
                >
                  ← Quay lại longsang.org
                </button>
              )}
              <button
                onClick={handleShowcaseDetailClick}
                className="w-full py-3 rounded-xl font-medium border border-amber-400/50 text-amber-300 backdrop-blur-sm bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                <span className="text-amber-400">✦</span>
                Chi tiết Showcase
              </button>
              <a href="#download" className="btn-primary-gradient text-center mt-2">
                Tải App Ngay
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal for unauthenticated users */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        redirectTo={`/projects/${showcaseSlug}`}
      />
    </motion.header>
  );
};

export default SaboArenaHeader;
