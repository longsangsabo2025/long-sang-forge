/**
 * IPhoneFrame - iPhone mockup với animation floating
 * Ported from sabo-arena-landing
 */
import { cn } from "@/lib/utils";
import { motion, type Easing } from "framer-motion";
import { ReactNode } from "react";

interface IPhoneFrameProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export const IPhoneFrame = ({ children, className = "", animate = true }: IPhoneFrameProps) => {
  const frameContent = (
    <div className={cn("iphone-frame", className)}>
      <div className="iphone-screen">{children}</div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as Easing }}
        className={className}
      >
        {frameContent}
      </motion.div>
    );
  }

  return frameContent;
};

export default IPhoneFrame;
