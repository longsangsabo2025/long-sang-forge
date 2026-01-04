/**
 * SABO Arena Formats Section
 * Ported from sabo-arena-landing
 */
import { motion } from "framer-motion";
import { Award, Crown, Grid3X3, Layers, Shuffle, Swords, Trophy, Users } from "lucide-react";

const formats = [
  {
    icon: Trophy,
    name: "Single Elimination",
    description: "Loại trực tiếp đơn giản",
  },
  {
    icon: Swords,
    name: "Double Elimination",
    description: "Hai lần thất bại mới bị loại",
  },
  {
    icon: Crown,
    name: "SABO DE16",
    description: "Định dạng độc quyền 16 người",
  },
  {
    icon: Award,
    name: "SABO DE32",
    description: "Định dạng độc quyền 32 người",
  },
  {
    icon: Grid3X3,
    name: "Round Robin",
    description: "Vòng tròn tính điểm",
  },
  {
    icon: Shuffle,
    name: "Swiss System",
    description: "Hệ thống Thụy Sĩ",
  },
  {
    icon: Layers,
    name: "Parallel Groups",
    description: "Chia bảng song song",
  },
  {
    icon: Users,
    name: "Winner Takes All",
    description: "Thắng là vua",
  },
];

export const SaboArenaFormatsSection = () => {
  return (
    <section id="formats" className="py-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="blob-gradient blob-gold w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            8 Định Dạng <span className="text-gradient-gold">Giải Đấu</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Đa dạng định dạng phù hợp mọi quy mô và phong cách thi đấu
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {formats.map((format, index) => (
            <motion.div
              key={format.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card-hover p-6 text-center group cursor-pointer"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_hsla(45,65%,52%,0.4)]">
                <format.icon className="w-7 h-7 text-cyan-400 transition-colors duration-300 group-hover:text-yellow-300" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-sm md:text-base">{format.name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{format.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SaboArenaFormatsSection;
