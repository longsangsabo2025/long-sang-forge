/**
 * Welcome Page - Premium Design like Landing Page
 */

import { useAuth } from "@/components/auth/AuthProvider";
import { Layout } from "@/components/LayoutWithChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Gift,
  Lightbulb,
  MessageSquare,
  Phone,
  Rocket,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const isNewUser = (user: any): boolean => {
  const createdAt = new Date(user?.created_at || 0);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation < 24;
};

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Bạn";
  const isNew = isNewUser(user);

  useEffect(() => {
    if (isNew) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isNew]);

  // 🎯 PRIMARY CTAs
  const primaryActions = [
    {
      icon: Rocket,
      title: "Xem Dự Án & Sản Phẩm",
      description: "Portfolio thực tế - Giải pháp đã triển khai thành công",
      href: "/showcase",
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      badge: "HOT",
      badgeGradient: "from-orange-500 to-red-500",
    },
    {
      icon: Calendar,
      title: "Đặt Lịch Tư Vấn",
      description: "30 phút với tôi - Nhận báo giá trong 24h",
      href: "/consultation",
      gradient: "from-blue-500 via-cyan-500 to-sky-500",
      badge: "1:1",
      badgeGradient: "from-blue-500 to-cyan-500",
    },
  ];

  // 💡 SECONDARY CTAs
  const secondaryActions = [
    {
      icon: Lightbulb,
      title: "Workspace",
      description: "Ghi chú ý tưởng & Quản lý dự án",
      href: "/workspace",
      color: "text-yellow-400",
    },
    {
      icon: MessageSquare,
      title: "Chat Hỗ Trợ",
      description: "Hỏi đáp nhanh với AI",
      href: "/#contact",
      color: "text-cyan-400",
    },
    {
      icon: Phone,
      title: "Hotline",
      description: "0123 456 789",
      href: "tel:0123456789",
      color: "text-green-400",
    },
  ];

  // 🏆 Stats
  const stats = [
    { value: "50+", label: "Dự án hoàn thành", icon: Rocket },
    { value: "98%", label: "Khách hàng hài lòng", icon: Star },
    { value: "24/7", label: "Hỗ trợ kỹ thuật", icon: Zap },
  ];

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
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "4s" }}
        />

        {/* Confetti Effect for New Users */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: -20,
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}

        {/* === MAIN CONTENT === */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
          {/* 👋 Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {isNew ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-sm">
                    <Gift className="w-4 h-4 mr-2" /> Chào mừng thành viên mới!
                  </Badge>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                  Xin chào, {userName}! 🎉
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Chúc mừng bạn đã gia nhập{" "}
                  <span className="text-primary font-semibold">Long Sang</span>! Hãy bắt đầu hành
                  trình AI của bạn ngay.
                </p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-primary/30"
                >
                  {userName.charAt(0).toUpperCase()}
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                  Chào mừng trở lại! 👋
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Bạn muốn làm gì hôm nay,{" "}
                  <span className="text-primary font-semibold">{userName}</span>?
                </p>
              </>
            )}
          </motion.div>

          {/* 🎯 PRIMARY ACTIONS - Big Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-16"
          >
            {primaryActions.map((action) => (
              <motion.button
                key={action.href}
                onClick={() => navigate(action.href)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl p-8 text-left bg-card/50 backdrop-blur-sm border border-border/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <Badge
                  className={`absolute top-4 right-4 bg-gradient-to-r ${action.badgeGradient} text-white border-0 px-3 py-1`}
                >
                  {action.badge}
                </Badge>
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                >
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-3">
                  {action.title}
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-muted-foreground text-lg">{action.description}</p>
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`}
                />
              </motion.button>
            ))}
          </motion.div>

          {/* 📊 Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mb-16"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -3 }}
                className="relative overflow-hidden text-center p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/10 hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* 💡 Secondary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Khám phá thêm
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {secondaryActions.map((action) => (
                <motion.button
                  key={action.href}
                  onClick={() => navigate(action.href)}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-4 p-5 rounded-xl bg-card/30 backdrop-blur-sm border border-border/10 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 🚀 Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 relative overflow-hidden p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-cyan-500/10 border border-primary/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Sẵn sàng bắt đầu dự án?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
                Đội ngũ Long Sang sẵn sàng giúp bạn tự động hóa và tối ưu hóa công việc với AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  onClick={() => navigate("/consultation")}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Đặt Lịch Tư Vấn
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10 px-8 py-6 text-lg"
                  onClick={() => navigate("/subscription")}
                >
                  Xem Bảng Giá
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ✅ Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          >
            {["Tư vấn AI miễn phí", "Không cam kết", "Báo giá trong 24h"].map((text) => (
              <span key={text} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
