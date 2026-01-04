/**
 * Coming Soon Page - For features under development
 * Shows a beautiful preview with signup for notifications
 */

import { Layout } from "@/components/LayoutWithChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Construction,
  Rocket,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Feature configurations
const featureConfigs: Record<
  string,
  {
    title: string;
    subtitle: string;
    description: string;
    icon: typeof Rocket;
    gradient: string;
    features: string[];
    eta: string;
  }
> = {
  academy: {
    title: "AI Academy",
    subtitle: "Học AI từ Zero đến Hero",
    description:
      "Nền tảng học tập AI toàn diện với các khóa học từ cơ bản đến nâng cao, được thiết kế bởi tôi.",
    icon: BookOpen,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    features: [
      "Khóa học AI/ML từ cơ bản đến nâng cao",
      "Dự án thực tế với mentorship",
      "Chứng chỉ hoàn thành khóa học",
      "Cộng đồng học viên hỗ trợ 24/7",
    ],
    eta: "Q2 2026",
  },
  marketplace: {
    title: "AI Marketplace",
    subtitle: "Mua bán AI Agents & Tools",
    description:
      "Chợ AI Agents và công cụ automation sẵn sàng sử dụng, giúp doanh nghiệp tự động hóa ngay lập tức.",
    icon: ShoppingBag,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    features: [
      "AI Agents sẵn sàng deploy",
      "Automation workflows templates",
      "Tích hợp 1-click với các nền tảng",
      "Hỗ trợ customize theo yêu cầu",
    ],
    eta: "Q3 2026",
  },
  brain: {
    title: "AI Second Brain",
    subtitle: "Trợ lý AI cá nhân",
    description:
      "Hệ thống quản lý kiến thức cá nhân với AI, giúp bạn tổ chức, tìm kiếm và tận dụng mọi thông tin.",
    icon: Brain,
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    features: [
      "Tổ chức kiến thức theo domains",
      "Semantic search với AI",
      "Tự động tạo insights từ data",
      "Tích hợp với Notion, Obsidian",
    ],
    eta: "Đã ra mắt! 🎉",
  },
};

export default function ComingSoon() {
  const navigate = useNavigate();
  const { feature } = useParams<{ feature: string }>();
  const location = useLocation();

  // Determine feature from URL path
  const getFeatureFromPath = (): string => {
    if (feature) return feature;
    if (location.pathname.includes("academy")) return "academy";
    if (location.pathname.includes("marketplace")) return "marketplace";
    if (location.pathname.includes("brain")) return "brain";
    return "academy";
  };

  const config = featureConfigs[getFeatureFromPath()] || featureConfigs.academy;
  const Icon = config.icon;

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
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

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </motion.button>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-2xl`}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Badge */}
            <Badge className="mb-6 px-4 py-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Construction className="w-4 h-4 mr-2" />
              Đang phát triển
            </Badge>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              {config.title}
            </h1>
            <p className="text-xl text-primary mb-4">{config.subtitle}</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {config.description}
            </p>

            {/* ETA */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-12">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">Dự kiến ra mắt: {config.eta}</span>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Tính năng sắp có
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {config.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/10"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-cyan-500/10 border border-primary/20"
          >
            <Bell className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Muốn biết khi ra mắt?</h3>
            <p className="text-muted-foreground mb-6">Đăng ký nhận thông báo để không bỏ lỡ!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary/30 to-cyan-500/30 backdrop-blur-sm hover:from-primary/50 hover:to-cyan-500/50 border border-primary/40 hover:border-primary/60 text-white"
                onClick={() => navigate("/consultation")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Đặt Lịch Tư Vấn Ngay
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
                onClick={() => navigate("/showcase")}
              >
                <Star className="w-4 h-4 mr-2" />
                Xem Dự Án Hiện Có
              </Button>
            </div>
          </motion.div>

          {/* Trust Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            💡 Trong khi chờ đợi, hãy khám phá các dự án và dịch vụ hiện có của tôi!
          </motion.p>
        </div>
      </div>
    </Layout>
  );
}
