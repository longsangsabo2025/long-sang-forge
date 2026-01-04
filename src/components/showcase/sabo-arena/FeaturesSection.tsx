/**
 * SABO Arena Features Section
 * Ported from sabo-arena-landing
 */
import { motion } from "framer-motion";
import {
  Bell,
  Bot,
  Radio,
  RefreshCw,
  Scale,
  Smartphone,
  Target,
  TrendingUp,
  Trophy,
  Tv,
  Zap,
} from "lucide-react";
import { EditableImage } from "./AdminEditContext";
import { IPhoneFrame } from "./IPhoneFrame";

interface FeatureBlockProps {
  reverse?: boolean;
  imageKey: string;
  defaultImage: string;
  imageAlt: string;
  title: string;
  description: string;
  features: { icon: React.ElementType; text: string }[];
}

const FeatureBlock = ({
  reverse,
  imageKey,
  defaultImage,
  imageAlt,
  title,
  description,
  features,
}: FeatureBlockProps) => {
  return (
    <div
      className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Phone Mockup */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`relative flex justify-center ${reverse ? "lg:order-2" : ""}`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-radial from-primary/25 to-transparent" />
        <IPhoneFrame className="w-[260px] md:w-[280px]" animate={false}>
          <EditableImage
            imageKey={imageKey}
            defaultSrc={defaultImage}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </IPhoneFrame>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={reverse ? "lg:order-1" : ""}
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-4 font-display">{title}</h3>
        <p className="text-muted-foreground mb-8">{description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 glass-card-hover p-3 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export const SaboArenaFeaturesSection = () => {
  const featureBlocks: FeatureBlockProps[] = [
    {
      imageKey: "feature-bracket",
      defaultImage: "/images/sabo-arena-1.jpg",
      imageAlt: "SABO ARENA - 8 định dạng giải đấu",
      title: "8 Định Dạng Giải Đấu Chuyên Nghiệp",
      description: "Từ Single Elimination đến định dạng độc quyền SABO DE16/DE32",
      features: [
        { icon: Target, text: "Single & Double Elimination" },
        { icon: RefreshCw, text: "Round Robin & Swiss System" },
        { icon: Zap, text: "SABO DE16/DE32 độc quyền" },
        { icon: Bot, text: "Tự động tạo bracket" },
      ],
    },
    {
      reverse: true,
      imageKey: "feature-elo",
      defaultImage: "/images/sabo-arena-2.jpg",
      imageAlt: "SABO ARENA - Hệ thống ELO",
      title: "Hệ Thống Xếp Hạng ELO Minh Bạch",
      description: "12 hạng từ Bronze đến Grandmaster với thuật toán ELO chuẩn quốc tế",
      features: [
        { icon: Scale, text: "Tính điểm công bằng ELO" },
        { icon: TrendingUp, text: "Theo dõi tiến trình" },
        { icon: Trophy, text: "12 hạng đấu" },
        { icon: Target, text: "Matchmaking thông minh" },
      ],
    },
    {
      imageKey: "feature-scoring",
      defaultImage: "/images/sabo-arena-3.jpg",
      imageAlt: "SABO ARENA - Ghi điểm",
      title: "Ghi Điểm Thời Gian Thực",
      description: "Hệ thống scoring nhanh, chính xác với đồng bộ multi-device",
      features: [
        { icon: Smartphone, text: "Mobile-first scoring" },
        { icon: Radio, text: "Đồng bộ tức thì mọi thiết bị" },
        { icon: Tv, text: "Tích hợp live streaming" },
        { icon: Bell, text: "Push notifications thông minh" },
      ],
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="blob-gradient blob-cyan w-[400px] h-[400px] top-1/4 -right-48 animate-pulse-glow" />
      <div className="blob-gradient blob-green w-[500px] h-[500px] bottom-1/4 -left-64 animate-pulse-glow delay-2000" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="section-title mb-4 font-display">
            Tính Năng <span className="text-gradient-cyan">Nổi Bật</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Mọi thứ bạn cần để tổ chức và tham gia các giải đấu bi-a chuyên nghiệp
          </p>
        </motion.div>

        <div className="space-y-32">
          {featureBlocks.map((block, index) => (
            <FeatureBlock key={index} {...block} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Missing icon import

export default SaboArenaFeaturesSection;
