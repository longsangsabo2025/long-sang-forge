import { useAuth } from "@/components/auth/AuthProvider";
import { Layout } from "@/components/LayoutWithChat";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Crown,
  Lightbulb,
  Mail,
  Rocket,
  Settings,
  Star,
  User,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const quickActions = [
    {
      icon: Crown,
      title: "Nâng cấp",
      description: "Gói Pro & VIP",
      href: "/subscription",
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
    },
    {
      icon: BookOpen,
      title: "Xem Dự Án",
      description: "Portfolio & Sản phẩm",
      href: "/showcase",
      gradient: "from-emerald-500 via-green-500 to-teal-500",
    },
    {
      icon: Lightbulb,
      title: "Workspace",
      description: "Ý tưởng & Dự án cá nhân",
      href: "/workspace",
      gradient: "from-yellow-500 via-orange-500 to-amber-500",
    },
    {
      icon: Mail,
      title: "Liên Hệ",
      description: "Tư vấn dự án",
      href: "/consultation",
      gradient: "from-blue-500 via-cyan-500 to-sky-500",
    },
    {
      icon: Settings,
      title: "Cài đặt",
      description: "Quản lý tài khoản",
      href: "/settings",
      gradient: "from-gray-500 via-slate-500 to-zinc-500",
    },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
        {/* === ANIMATED BACKGROUND === */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute top-20 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-20 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />

        {/* === MAIN CONTENT === */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-primary/30"
              >
                {userInitial}
              </motion.div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                  {getTimeGreeting()}, {userName}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">{userEmail}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Truy cập nhanh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.href}
                  onClick={() => navigate(action.href)}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-6 text-left hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
                >
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Floating Particle */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                    {action.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>

                  {/* Bottom Glow */}
                  <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Subscription Card - NEW */}
            <SubscriptionCard />

            {/* Account Info */}
            <div className="relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Thông tin tài khoản</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-muted-foreground">Tên hiển thị</span>
                    <span className="text-foreground font-medium">{userName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-foreground font-medium text-sm">{userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-muted-foreground">Vai trò</span>
                    <span className="text-foreground font-medium">
                      {user?.user_metadata?.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-cyan-500/10 border border-primary/20 rounded-2xl p-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px]" />
              <div className="relative z-10">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4"
                >
                  <Rocket className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Khám phá dự án mới nhất
                </h3>
                <p className="text-muted-foreground mb-6">
                  Xem các giải pháp AI đã triển khai thành công và tìm cảm hứng cho dự án của bạn.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate("/showcase")}
                    className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Xem Dự Án
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/consultation")}
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Đặt Tư Vấn
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
