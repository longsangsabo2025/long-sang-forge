import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  label?: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
  size?: "small" | "large";
  onClick?: () => void;
}

export const ActionButton = ({
  label,
  icon: Icon,
  variant = "primary",
  size = "large",
  onClick,
}: ActionButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "rounded-full flex items-center justify-center gap-2 font-medium transition-all font-display",
        variant === "primary"
          ? "bg-gradient-to-r from-primary/30 to-neon-blue/30 backdrop-blur-sm text-primary-foreground shadow-glow border border-primary/40 hover:from-primary/50 hover:to-neon-blue/50"
          : "bg-foreground/80 backdrop-blur-sm text-background shadow-lg border border-foreground/20",
        size === "small" ? "h-12 w-12" : label ? "h-14 px-6" : "h-14 w-14"
      )}
    >
      <Icon size={size === "small" ? 20 : 24} />
      {label && <span>{label}</span>}
    </motion.button>
  );
};
