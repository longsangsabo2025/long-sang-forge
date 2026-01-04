/**
 * SABO Arena Hero Section
 * Ported from sabo-arena-landing
 */
import { motion } from "framer-motion";
import { Code2, Download, Layers, Play, Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditableImage, useSaboArenaAdmin } from "./AdminEditContext";
import { IPhoneFrame } from "./IPhoneFrame";

export const SaboArenaHeroSection = () => {
  const { getImage } = useSaboArenaAdmin();
  const navigate = useNavigate();
  const stats = [
    { icon: Users, value: "123+", label: "Người dùng" },
    { icon: Layers, value: "8", label: "Định dạng" },
    { icon: Trophy, value: "12", label: "Hạng ELO" },
  ];

  const scrollToDownload = () => {
    document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background Decorations */}
      <div className="blob-gradient blob-green w-[600px] h-[600px] -top-48 -left-48 animate-pulse-glow" />
      <div className="blob-gradient blob-cyan w-[500px] h-[500px] top-1/4 right-0 translate-x-1/2 animate-pulse-glow delay-2000" />
      <div className="blob-gradient blob-gold w-[400px] h-[400px] bottom-20 left-1/4 animate-pulse-glow delay-4000" />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
            >
              <span className="text-xl">🎱</span>
              <span className="text-sm font-medium text-accent">Nền Tảng Bi-a #1 Việt Nam</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 font-display"
            >
              NỀN TẢNG THI ĐẤU <span className="text-gradient-primary">BI-A</span>{" "}
              <span className="text-gradient-gold">CHUYÊN NGHIỆP</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-xl mb-8 mx-auto lg:mx-0"
            >
              Kết nối cộng đồng bi-a Việt Nam với 8 định dạng giải đấu đa dạng và hệ thống xếp hạng
              ELO minh bạch
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10"
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={scrollToDownload}
                className="btn-primary-gradient flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Tải App Miễn Phí
              </button>
              <button className="btn-outline-glow flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                <Play className="w-4 h-4" />
                Xem Demo
              </button>
              <button
                onClick={() => navigate("/landing-page/sabo-arena-billiards-platform")}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-foreground font-medium hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-sm whitespace-nowrap"
              >
                <Code2 className="w-4 h-4" />
                Chi Tiết Kỹ Thuật
              </button>
            </motion.div>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Glow Circle Behind Phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-radial from-accent/20 via-primary/15 to-transparent animate-pulse-glow" />

            {/* Floating Phone with iPhone Frame */}
            <div className="relative z-10">
              <IPhoneFrame className="w-[280px] md:w-[320px]">
                <EditableImage
                  imageKey="hero-phone"
                  defaultSrc="/images/screenshot/1.png"
                  alt="SABO ARENA App - Giao diện giải đấu"
                  className="w-full h-full object-cover"
                />
              </IPhoneFrame>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute -top-4 -left-12 glass-card px-4 py-3 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hạng hiện tại</p>
                    <p className="text-sm font-bold text-secondary">Gold III</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-4 -right-8 glass-card px-4 py-3 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">+15</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ELO Points</p>
                    <p className="text-sm font-bold text-accent">Win Streak!</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SaboArenaHeroSection;
