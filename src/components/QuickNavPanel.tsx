import {
  ChevronRight,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Mail,
  Menu,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Quick navigation items
const quickNavItems = [
  {
    name: "Trang chủ",
    href: "/",
    icon: Home,
    color: "text-blue-500",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-purple-500",
  },
  {
    name: "Dự án",
    href: "/project-showcase",
    icon: FileText,
    color: "text-green-500",
  },
  {
    name: "Academy",
    href: "/academy",
    icon: GraduationCap,
    color: "text-orange-500",
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    color: "text-pink-500",
  },
  {
    name: "My CV",
    href: "/cv",
    icon: User,
    color: "text-indigo-500",
  },
  {
    name: "Tư vấn",
    href: "/consultation",
    icon: Mail,
    color: "text-teal-500",
  },
];

export const QuickNavPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Fixed Left Side Menu Button - Top Left */}
      <div className="fixed left-0 top-24 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-1
            bg-primary text-white
            pl-3 pr-2 py-3
            rounded-r-xl
            shadow-lg hover:shadow-xl
            hover:pl-4
            transition-all duration-300
            ${isOpen ? "bg-primary/90" : ""}
          `}
          aria-label="Quick Navigation Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/10 cursor-default"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />

          {/* Menu Panel - Left Side Top */}
          <div className="fixed left-0 top-24 z-50 ml-14 animate-fade-in">
            <div className="bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
              {/* Header */}
              <div className="bg-primary/5 px-4 py-3 border-b border-border/50">
                <h3 className="font-semibold text-sm text-foreground">📍 Di chuyển nhanh</h3>
              </div>

              {/* Navigation Items */}
              <div className="py-2">
                {quickNavItems.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.href);

                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        navigate(item.href);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5
                        text-left transition-all duration-150
                        ${
                          active
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "hover:bg-accent text-foreground border-l-2 border-transparent"
                        }
                      `}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${active ? "text-primary" : item.color}`}
                      />
                      <span className="font-medium text-sm">{item.name}</span>
                      {active && (
                        <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Đang xem
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="bg-muted/30 px-4 py-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  Nhấn <kbd className="px-1 py-0.5 bg-background rounded text-xs border">Esc</kbd>{" "}
                  để đóng
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
