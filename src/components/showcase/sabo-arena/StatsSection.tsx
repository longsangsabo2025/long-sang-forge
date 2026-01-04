/**
 * SABO Arena Stats Section
 * Ported from sabo-arena-landing
 */
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatItemProps {
  value: string;
  label: string;
  delay?: number;
}

const StatItem = ({ value, label, delay = 0 }: StatItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.]/g, "");
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        if (value.includes(".")) {
          setDisplayValue(current.toFixed(1) + suffix);
        } else {
          setDisplayValue(Math.floor(current) + suffix);
        }
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000 }}
      className="text-center"
    >
      <p className="text-4xl md:text-5xl lg:text-6xl font-black text-gradient-cyan mb-2">
        {displayValue}
      </p>
      <p className="text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
};

export const SaboArenaStatsSection = () => {
  const stats = [
    { value: "8", label: "Định dạng giải đấu" },
    { value: "12", label: "Hạng ELO" },
    { value: "99.9%", label: "Uptime" },
    { value: "<500ms", label: "Response time" },
  ];

  return (
    <section className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12 lg:p-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsla(180, 43%, 18%, 0.3) 0%, hsla(220, 30%, 12%, 0.5) 100%)",
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-accent/20 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-radial from-primary/15 to-transparent rounded-full translate-x-1/4 translate-y-1/4" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10">
            {stats.map((stat, index) => (
              <StatItem
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={index * 200}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SaboArenaStatsSection;
