import { useAuth } from "@/components/auth/AuthProvider";
import { TechBackground } from "@/components/TechBackground";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bookmark,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Home,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const WORKSPACE_SIDEBAR_KEY = "workspace-sidebar-open";

const workspaceNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/workspace",
    color: "text-blue-500",
  },
  {
    title: "Workspace",
    icon: Lightbulb,
    href: "/workspace/hub",
    color: "text-yellow-500",
    badge: "⚡",
  },
  {
    title: "Saved Products",
    icon: Bookmark,
    href: "/workspace/saved",
    color: "text-purple-500",
  },
  {
    title: "Lịch Hẹn",
    icon: CalendarCheck,
    href: "/workspace/consultations",
    color: "text-cyan-500",
    badge: "🗓️",
  },
];

const exploreNavItems = [
  {
    title: "Product Showcase",
    icon: Home,
    href: "/showcase",
    color: "text-cyan-500",
  },
  {
    title: "AI Academy",
    icon: GraduationCap,
    href: "/academy",
    color: "text-indigo-500",
  },
  {
    title: "AI Marketplace",
    icon: ShoppingBag,
    href: "/marketplace",
    color: "text-pink-500",
  },
];

export const UserWorkspaceLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar state - mặc định mở
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(WORKSPACE_SIDEBAR_KEY);
    return saved !== null ? saved === "true" : true;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem(WORKSPACE_SIDEBAR_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const isActive = (path: string) => {
    if (path === "/workspace") {
      return location.pathname === "/workspace";
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      {/* Tech Background - Same as Landing Page */}
      <TechBackground />

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center px-4 gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img
              src="/images/logo.png"
              alt="Long Sang"
              className="h-8 w-8 rounded-lg object-contain"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 hidden sm:flex"
            >
              <Home className="h-4 w-4" />
              Trang Chủ
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-2 border-l">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
                {userInitial}
              </div>
              <span className="text-sm font-medium hidden md:inline">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] border-r border-white/10 bg-background/80 backdrop-blur-md transition-all duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${sidebarCollapsed ? "w-16" : "w-72"}
          lg:translate-x-0
        `}
      >
        <ScrollArea className="h-full py-4">
          <div className="px-3 space-y-6">
            {/* Collapse Toggle (Desktop) */}
            <div className="hidden lg:flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* User Info Card */}
            {!sidebarCollapsed && (
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace Navigation */}
            <div>
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspace
                </p>
              )}
              <div className="space-y-1">
                {workspaceNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Button
                      key={item.href}
                      variant={active ? "secondary" : "ghost"}
                      className={`w-full ${
                        sidebarCollapsed ? "justify-center px-2" : "justify-start"
                      } gap-3`}
                      onClick={() => {
                        navigate(item.href);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <Icon className={`h-4 w-4 ${active ? "" : item.color}`} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          {item.badge && <span className="text-xs">{item.badge}</span>}
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Explore Navigation */}
            <div>
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Khám Phá
                </p>
              )}
              <div className="space-y-1">
                {exploreNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={`w-full ${
                        sidebarCollapsed ? "justify-center px-2" : "justify-start"
                      } gap-3`}
                      onClick={() => navigate(item.href)}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Bottom Actions */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full ${
                  sidebarCollapsed ? "justify-center px-2" : "justify-start"
                } gap-3`}
                onClick={() => navigate("/profile")}
                title={sidebarCollapsed ? "Cài Đặt" : undefined}
              >
                <Settings className="h-4 w-4 text-slate-500" />
                {!sidebarCollapsed && <span>Cài Đặt</span>}
              </Button>
              <Button
                variant="ghost"
                className={`w-full ${
                  sidebarCollapsed ? "justify-center px-2" : "justify-start"
                } gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10`}
                onClick={handleSignOut}
                title={sidebarCollapsed ? "Đăng Xuất" : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!sidebarCollapsed && <span>Đăng Xuất</span>}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 top-14 z-30 bg-background/80 backdrop-blur-sm lg:hidden cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content */}
      <main
        className={`pt-14 transition-all duration-200 ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-72"
        }`}
      >
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
