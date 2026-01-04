/**
 * SABO Arena Partners Section
 * Ported from sabo-arena-landing
 */
import { motion } from "framer-motion";

const partners = [
  { name: "CLB Bi-a Sài Gòn", initials: "SG" },
  { name: "Hà Nội Pool Club", initials: "HN" },
  { name: "Đà Nẵng Billiards", initials: "ĐN" },
  { name: "Cần Thơ Pool", initials: "CT" },
  { name: "Hải Phòng Pro", initials: "HP" },
];

export const SaboArenaPartnersSection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="section-container">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground mb-10"
        >
          Được tin tưởng bởi các CLB hàng đầu
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 glass-card px-6 py-3 rounded-xl hover:bg-card/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">{partner.initials}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{partner.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SaboArenaPartnersSection;
