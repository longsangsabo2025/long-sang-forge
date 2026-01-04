import { UserProfile } from "@/components/auth/UserProfile";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  BookOpen,
  Bot,
  Calendar,
  Database,
  FileText,
  GraduationCap,
  Home,
  Key,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  Menu,
  Settings,
  TrendingUp,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-open";

const adminNavGroups = [
  {
    label: "Tổng Quan",
    color: "text-blue-500",
    bgColor: "hover:bg-blue-500/10",
    items: [
      {
        title: "Bảng Điều Khiển",
        icon: LayoutDashboard,
        href: "/admin",
      },
      {
        title: "Phân Tích",
        icon: BarChart3,
        href: "/admin/analytics",
      },
      {
        title: "💡 Ideas & Planning",
        icon: Lightbulb,
        href: "/admin/ideas",
      },
      {
        title: "🎯 Project Showcase",
        icon: Zap,
        href: "/admin/projects",
      },
    ],
  },
  {
    label: "AI & Automation",
    color: "text-purple-500",
    bgColor: "hover:bg-purple-500/10",
    items: [
      {
        title: "🔧 Developer Testing",
        icon: Workflow,
        href: "/admin/workflows",
      },
      {
        title: "👤 User Dashboard",
        icon: Bot,
        href: "/dashboard",
      },
      {
        title: "⚙️ Agent Marketplace",
        icon: Zap,
        href: "/marketplace",
      },
    ],
  },
  {
    label: "SEO & Marketing",
    color: "text-green-500",
    bgColor: "hover:bg-green-500/10",
    items: [
      {
        title: "SEO Monitoring",
        icon: TrendingUp,
        href: "/admin/seo-monitoring",
      },
      {
        title: "SEO Center",
        icon: TrendingUp,
        href: "/admin/seo-center",
      },
      {
        title: "Hàng Đợi Nội Dung",
        icon: Workflow,
        href: "/admin/content-queue",
      },
      {
        title: "Google Services Hub",
        icon: BarChart3,
        href: "/admin/google-services",
      },
      {
        title: "Google Automation",
        icon: Zap,
        href: "/admin/google-automation",
      },
      {
        title: "Google Maps & Local SEO",
        icon: MapPin,
        href: "/admin/google-maps",
      },
    ],
  },
  {
    label: "Đào Tạo",
    color: "text-indigo-500",
    bgColor: "hover:bg-indigo-500/10",
    items: [
      {
        title: "🎓 AI Academy",
        icon: GraduationCap,
        href: "/academy",
      },
      {
        title: "Quản Lý Khóa Học",
        icon: BookOpen,
        href: "/admin/courses",
      },
    ],
  },
  {
    label: "Quản Lý",
    color: "text-orange-500",
    bgColor: "hover:bg-orange-500/10",
    items: [
      {
        title: "CRM / Leads",
        icon: Users,
        href: "/admin/contacts",
      },
      {
        title: "Tư Vấn",
        icon: Calendar,
        href: "/admin/consultations",
      },
      {
        title: "Quản Lý File",
        icon: FileText,
        href: "/admin/files",
      },
      {
        title: "Tài Liệu",
        icon: Database,
        href: "/admin/documents",
      },
      {
        title: "Quản Lý Users",
        icon: Users,
        href: "/admin/users",
      },
    ],
  },
  {
    label: "Hệ Thống",
    color: "text-slate-500",
    bgColor: "hover:bg-slate-500/10",
    items: [
      {
        title: "Tài Khoản & Key",
        icon: Key,
        href: "/admin/credentials",
      },
      {
        title: "Tích Hợp Platforms",
        icon: Zap,
        href: "/admin/integrations",
      },
      {
        title: "💳 Gói Đăng Ký",
        icon: Key,
        href: "/admin/subscriptions",
      },
      {
        title: "🤖 AI Config",
        icon: Settings,
        href: "/admin/ai-config",
      },
      {
        title: "Cơ Sở Dữ Liệu",
        icon: Settings,
        href: "/admin/database-schema",
      },
      {
        title: "Cài Đặt",
        icon: Settings,
        href: "/admin/settings",
      },
    ],
  },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar mặc định mở (true) cho user đã đăng nhập, đọc từ localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    // Mặc định true nếu chưa có giá trị lưu (lần đầu đăng nhập)
    return saved !== null ? saved === "true" : true;
  });

  // Lưu trạng thái sidebar vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-md">
        <div className="flex h-16 items-center px-4 gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/30 backdrop-blur-sm text-primary-foreground font-bold text-lg border border-primary/50">
              LS
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">Cổng Quản Trị</h1>
              <p className="text-xs text-muted-foreground">Trung Tâm Điều Khiển Tự Động Hóa AI</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationCenter />
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Trang Chủ</span>
            </Button>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <ScrollArea className="h-full py-6 px-3">
          <div className="space-y-4">
            {adminNavGroups.map((group) => (
              <div key={group.label}>
                {/* Group Label */}
                <div className="px-3 mb-2">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${group.color}`}>
                    {group.label}
                  </h3>
                </div>

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Button
                        key={item.href}
                        variant={active ? "secondary" : "ghost"}
                        className={`w-full justify-start gap-3 ${
                          active ? "bg-secondary" : group.bgColor
                        }`}
                        onClick={() => {
                          navigate(item.href);
                          setSidebarOpen(false);
                        }}
                      >
                        <Icon className={`h-4 w-4 ${active ? "" : group.color}`} />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Separator between groups (except last) */}
                {group.label !== adminNavGroups.at(-1)?.label && <Separator className="my-4" />}
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Quick Stats */}
          <div className="px-3 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Thống Kê Nhanh
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quy Trình Hoạt Động</span>
                <span className="font-semibold">15</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI Agents</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Thực Thi Hôm Nay</span>
                <span className="font-semibold text-green-600">127</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-30 bg-background/80 backdrop-blur-sm lg:hidden cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
