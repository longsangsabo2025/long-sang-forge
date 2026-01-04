import dashboardHero from "@/assets/dashboard-hero.png";
import { EditableImage, EditableText } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Removed solid background - now uses parent's neural network background */}

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <EditableText
                textKey="hero-title-1"
                defaultText="Quản Lý Thông Minh,"
                as="span"
                className="gradient-text"
              />
              <br />
              <EditableText
                textKey="hero-title-2"
                defaultText="Kinh Doanh Hiệu Quả"
                as="span"
                className="text-foreground"
              />
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <EditableText
              textKey="hero-subtitle"
              defaultText="Nền tảng quản lý toàn diện cho doanh nghiệp dịch vụ - 8 hệ thống trong 1 ứng dụng"
              as="p"
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary/30 to-secondary/30 backdrop-blur-sm text-white hover:from-primary/50 hover:to-secondary/50 transition-all duration-300 text-lg px-8 py-6 h-auto group border border-primary/40 hover:border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
            >
              Dùng Thử Miễn Phí
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-card text-lg px-8 py-6 h-auto group border-2"
            >
              <Play className="mr-2 group-hover:scale-110 transition-transform" />
              Xem Demo
            </Button>
          </motion.div>

          {/* Hero Dashboard Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-card p-4 rounded-2xl glow-purple">
              <EditableImage
                imageKey="hero-dashboard"
                defaultSrc={dashboardHero}
                alt="SABOHUB Dashboard Interface"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
