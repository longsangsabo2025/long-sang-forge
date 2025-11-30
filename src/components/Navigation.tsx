import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { useSearchShortcut } from "@/hooks/useSearchShortcut"; // Hidden - admin only
import { FileText, GraduationCap, LogOut, Mail, Menu, Sparkles, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
// import { SearchDialog, SearchTrigger } from "./SearchDialog"; // Hidden - admin only
import { useAuth } from "./auth/AuthProvider";
import { LoginModal } from "./auth/LoginModal";

// Navigation links - Same for both guest and logged in users
const navLinks = [
  { name: "Dịch Vụ", href: "#services" },
  { name: "Dự Án", href: "#projects" },
  { name: "Công Nghệ", href: "#tech-stack" },
  { name: "Liên Hệ", href: "#contact" },
];

// User menu links (when logged in)
const userMenuLinks = [
  { name: "Dashboard", href: "/dashboard", icon: User },
  { name: "AI Marketplace", href: "/marketplace", icon: Sparkles },
  { name: "Academy", href: "/academy", icon: GraduationCap },
];

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [, setSearchOpen] = useState(false); // Keep state but unused
  const [loginOpen, setLoginOpen] = useState(false);

  // Global search shortcut - Hidden for user-facing
  // useSearchShortcut(() => setSearchOpen(true));

  // Real auth state from AuthProvider
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;

  // Get user info from metadata
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  // Scroll effect for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = document.querySelectorAll("section[id]");
    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      for (const section of sections) {
        observer.unobserve(section);
      }
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // Check if it's a route (starts with /)
    if (href?.startsWith("/")) {
      navigate(href);
      setIsMenuOpen(false);
      return;
    }

    // If it's an anchor link and we're not on home page, navigate to home first
    if (href?.startsWith("#")) {
      if (location.pathname !== "/") {
        // Navigate to home with the hash
        navigate("/" + href);
        setIsMenuOpen(false);
        return;
      }

      // We're on home page, scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    setLoginOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isLinkActive = (href: string) => {
    if (href.startsWith("#")) {
      return activeSection === href.substring(1);
    }
    return false;
  };

  return (
    <>
      {/* Modern Header with background image */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-lg border-b border-border/50" : "border-b border-border/10"
        }`}
        style={{
          backgroundImage: `linear-gradient(to right, rgba(10, 15, 26, 0.95), rgba(10, 15, 26, 0.85)), url('/images/backgrounds/header_background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20">
          <div className="h-14 sm:h-16 md:h-18 lg:h-20 flex items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-all"></div>
                <div className="relative text-2xl md:text-3xl font-bold text-primary">LS</div>
              </div>
            </a>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-1 xl:gap-2 2xl:gap-4">
              {/* Navigation Links - Same for all users */}
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`
                    px-3 xl:px-4 2xl:px-5 py-2 xl:py-2.5 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center touch-manipulation
                    ${
                      isLinkActive(link.href) || location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
              {/* Search - Hidden for user-facing, only for admin */}
              {/* <SearchTrigger onClick={() => setSearchOpen(true)} /> */}

              {/* Language Switcher */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              {/* Contact CTA */}
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/#contact")}
                className="hidden md:flex items-center gap-2 min-h-[44px] touch-manipulation"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden lg:inline">Liên hệ</span>
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 min-h-[44px] touch-manipulation"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline max-w-[100px] truncate">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />

                    {userMenuLinks.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <DropdownMenuItem
                          key={link.href}
                          onClick={() => navigate(link.href)}
                          className="min-h-[44px]"
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {link.name}
                        </DropdownMenuItem>
                      );
                    })}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 min-h-[44px]">
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleLogin}
                  size="sm"
                  variant="outline"
                  className="min-h-[44px] touch-manipulation"
                >
                  Đăng nhập
                </Button>
              )}

              {/* My CV Button */}
              <Button
                onClick={() => navigate("/cv")}
                size="sm"
                variant="outline"
                className="hidden md:flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary min-h-[44px] touch-manipulation"
              >
                <FileText className="w-4 h-4" />
                <span>My CV</span>
              </Button>

              {/* Mobile Menu Toggle - Ensure min 44x44px touch target */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden min-h-[44px] min-w-[44px] p-2 sm:p-3 touch-manipulation"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile/Tablet Menu with smooth animations */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
          {/* Backdrop with fade-in */}
          <button
            type="button"
            className="absolute inset-0 bg-background/98 backdrop-blur-xl cursor-default transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />

          {/* Menu Content - Scrollable with slide-in animation */}
          <div className="relative h-full overflow-y-auto animate-slide-in-right">
            <div className="min-h-full flex flex-col px-4 sm:px-6 py-16 sm:py-20 will-change-transform">
              {/* Logo Section */}
              <div className="mb-8 animate-slide-up opacity-0 animate-delay-[0.1s]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl font-bold text-primary">LS</div>
                  <div className="text-lg font-semibold text-foreground">Long Sang</div>
                </div>
                <p className="text-sm text-muted-foreground">AI Automation & Development</p>
              </div>

              {/* Navigation Links with staggered animation */}
              <div className="space-y-2 mb-8">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 animate-slide-up opacity-0 animate-delay-[0.15s]">
                  Menu chính
                </div>
                {navLinks.map((link, index) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`
                      block px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200
                      hover:scale-[1.02] hover:shadow-md min-h-[48px] flex items-center touch-manipulation
                      animate-slide-up opacity-0 will-change-transform
                      ${
                        isLinkActive(link.href) || location.pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-accent"
                      }
                    `}
                    style={{
                      animationDelay: `${0.2 + index * 0.05}s`,
                      animationFillMode: "forwards",
                    }}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3 mt-auto pt-8 border-t border-border">
                {/* Language Switcher */}
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-muted-foreground">Ngôn ngữ</span>
                  <LanguageSwitcher />
                </div>

                {/* CTA Buttons */}
                <Button
                  onClick={() => {
                    navigate("/#contact");
                    setIsMenuOpen(false);
                  }}
                  className="w-full"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Liên hệ
                </Button>

                <Button
                  onClick={() => {
                    navigate("/cv");
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-primary/50 text-primary"
                  size="lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My CV
                </Button>

                {/* Auth Section */}
                {isAuthenticated ? (
                  <div className="space-y-2 pt-4">
                    <div className="px-4 py-2 bg-accent/50 rounded-lg">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>

                    {userMenuLinks.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <Button
                          key={link.href}
                          variant="ghost"
                          onClick={() => {
                            navigate(link.href);
                            setIsMenuOpen(false);
                          }}
                          className="w-full justify-start"
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {link.name}
                        </Button>
                      );
                    })}

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleLogin} variant="outline" className="w-full" size="lg">
                    Đăng nhập
                  </Button>
                )}

                {/* Contact */}
                <a
                  href="mailto:contact@longsang.org"
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-accent"
                >
                  <Mail className="w-4 h-4" />
                  contact@longsang.org
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Dialog - Hidden for user-facing, only for admin */}
      {/* <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} /> */}

      {/* Login Modal */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={() => {
          // Redirect to user dashboard after successful login
          navigate("/dashboard");
        }}
      />
    </>
  );
};
