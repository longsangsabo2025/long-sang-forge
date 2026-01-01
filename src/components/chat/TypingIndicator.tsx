/**
 * TypingIndicator - Beautiful typing animation (Learned from Chatwoot)
 *
 * Features:
 * - Smooth bouncing dots animation
 * - Multiple style variants
 * - Customizable colors
 */

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  variant?: "dots" | "pulse" | "wave";
  showAvatar?: boolean;
  className?: string;
}

export const TypingIndicator = ({
  variant = "dots",
  showAvatar = true,
  className = "",
}: TypingIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-2.5 ${className}`}
    >
      {showAvatar && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-3">
        {variant === "dots" && <DotsAnimation />}
        {variant === "pulse" && <PulseAnimation />}
        {variant === "wave" && <WaveAnimation />}
      </div>
    </motion.div>
  );
};

// Classic 3 dots bouncing (like iMessage)
const DotsAnimation = () => (
  <div className="flex gap-1.5 items-center h-5">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-foreground/40 rounded-full"
        animate={{
          y: [0, -6, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Pulsing dot animation
const PulseAnimation = () => (
  <div className="flex gap-1 items-center h-5">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

// Wave animation (like Slack)
const WaveAnimation = () => (
  <div className="flex gap-0.5 items-end h-5">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.span
        key={i}
        className="w-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full"
        animate={{
          height: ["8px", "16px", "8px"],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.1,
        }}
      />
    ))}
  </div>
);

// Text typing indicator with "AI đang suy nghĩ..."
export const TypingText = ({ text = "AI đang suy nghĩ" }: { text?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2 text-sm text-muted-foreground"
  >
    <span>{text}</span>
    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
      ...
    </motion.span>
  </motion.div>
);
