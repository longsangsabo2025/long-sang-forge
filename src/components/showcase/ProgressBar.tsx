/**
 * ProgressBar - Thanh tiến độ với màu động theo phần trăm
 * Split từ EnhancedProjectShowcase.tsx theo Elon Musk Audit
 */
import { motion } from "framer-motion";

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return "bg-green-500";
  if (progress >= 70) return "bg-yellow-500";
  if (progress >= 50) return "bg-orange-500";
  return "bg-red-500";
};

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar = ({ progress, showLabel = false, className = "" }: ProgressBarProps) => {
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Tiến độ</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${getProgressColor(progress)}`}
        />
      </div>
    </div>
  );
};
