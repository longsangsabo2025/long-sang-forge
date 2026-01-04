/**
 * QuickNav - Quick navigation for project showcase sections
 * Helps users jump to different sections easily
 */
import { motion } from "framer-motion";
import { Code2, FileText, Layers, MessageSquare, PlayCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface QuickNavProps {
  hasVideo?: boolean;
  hasTestimonials?: boolean;
  hasCaseStudy?: boolean;
}

const navItems = [
  { id: "overview", label: "Tổng Quan", icon: FileText },
  { id: "tech", label: "Công Nghệ", icon: Code2 },
  { id: "features", label: "Tính Năng", icon: Layers },
  { id: "video", label: "Video", icon: PlayCircle, conditional: "hasVideo" },
  { id: "testimonials", label: "Đánh Giá", icon: MessageSquare, conditional: "hasTestimonials" },
  { id: "case-study", label: "Case Study", icon: Sparkles, conditional: "hasCaseStudy" },
];

export const QuickNav = ({ hasVideo, hasTestimonials, hasCaseStudy }: QuickNavProps) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSticky, setIsSticky] = useState(false);

  const conditions: Record<string, boolean | undefined> = {
    hasVideo,
    hasTestimonials,
    hasCaseStudy,
  };

  const visibleItems = navItems.filter((item) => !item.conditional || conditions[item.conditional]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);

      // Detect active section based on scroll position
      const sections = visibleItems.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(visibleItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        isSticky ? "fixed top-16 left-1/2 -translate-x-1/2 z-40 shadow-lg" : "relative"
      } flex items-center gap-1 p-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/50 transition-all duration-300`}
    >
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-primary/30 backdrop-blur-sm rounded-full border border-primary/50"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={`relative z-10 w-4 h-4 ${isActive ? "text-primary" : ""}`} />
            <span className="relative z-10 hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </motion.nav>
  );
};

export default QuickNav;
