import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, useState } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  size?: "small" | "medium" | "large" | "hero";
  orientation?: "portrait" | "landscape";
  className?: string;
  delay?: number;
  enable3D?: boolean;
}

const sizeClasses = {
  small: "h-[200px] w-[100px] xs:h-[240px] xs:w-[120px] sm:h-[280px] sm:w-[140px]",
  medium: "h-[260px] w-[130px] xs:h-[300px] xs:w-[150px] sm:h-[360px] sm:w-[180px]",
  large: "h-[300px] w-[150px] xs:h-[360px] xs:w-[180px] sm:h-[420px] sm:w-[210px]",
  hero: "h-[350px] w-[175px] xs:h-[420px] xs:w-[210px] sm:h-[500px] sm:w-[250px]",
};

const landscapeSizeClasses = {
  small: "h-[100px] w-[200px] xs:h-[120px] xs:w-[240px] sm:h-[140px] sm:w-[280px]",
  medium: "h-[130px] w-[260px] xs:h-[150px] xs:w-[300px] sm:h-[180px] sm:w-[360px]",
  large: "h-[150px] w-[300px] xs:h-[180px] xs:w-[360px] sm:h-[210px] sm:w-[420px]",
  hero: "h-[175px] w-[350px] xs:h-[210px] xs:w-[420px] sm:h-[250px] sm:w-[500px]",
};

export const PhoneMockup = ({
  children,
  size = "medium",
  orientation = "portrait",
  className,
  delay = 0,
  enable3D = true,
}: PhoneMockupProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-7, 7]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3D || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={
        enable3D
          ? {
              rotateX: isHovered ? rotateX : 0,
              rotateY: isHovered ? rotateY : 0,
              transformStyle: "preserve-3d",
            }
          : {}
      }
      className={cn(
        "relative rounded-[20px] xs:rounded-[26px] sm:rounded-[32px] bg-gradient-to-b from-dark-surface to-dark-bg p-1.5 xs:p-2 transition-all duration-300",
        isHovered ? "shadow-phone-3d" : "shadow-phone-lg",
        orientation === "portrait" ? sizeClasses[size] : landscapeSizeClasses[size],
        className
      )}
    >
      {/* Notch (only for portrait) */}
      {orientation === "portrait" && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 xs:w-18 sm:w-24 h-4 xs:h-5 sm:h-6 bg-dark-bg rounded-b-2xl xs:rounded-b-2xl sm:rounded-b-3xl z-10" />
      )}

      {/* Screen */}
      <div className="relative h-full w-full rounded-[14px] xs:rounded-[18px] sm:rounded-[24px] bg-gradient-to-br from-dark-surface to-primary/20 overflow-hidden">
        <motion.div
          className="h-full w-full"
          animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

        {/* Home Indicator */}
        <div
          className={cn(
            "absolute bg-foreground/30 rounded-full",
            orientation === "portrait"
              ? "bottom-1 xs:bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-12 xs:w-16 sm:w-20 h-0.5 xs:h-0.5 sm:h-1"
              : "right-1 xs:right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-12 xs:h-16 sm:h-20 w-0.5 xs:w-0.5 sm:w-1"
          )}
        />
      </div>

      {/* Reflection overlay */}
      <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};
