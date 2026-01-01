/**
 * Quick Replies - Suggested response buttons (Learned from Rasa Webchat)
 *
 * Features:
 * - Predefined quick replies
 * - Dynamic suggestions from AI
 * - Animated appearance
 * - Multiple styles
 */

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreditCard, HelpCircle, MessageSquare, Phone } from "lucide-react";
import { DEFAULT_QUICK_REPLIES, PRODUCT_QUICK_REPLIES, type QuickReply } from "./quickRepliesData";

// Re-export data from separate file for Fast Refresh compatibility
export { DEFAULT_QUICK_REPLIES, PRODUCT_QUICK_REPLIES, type QuickReply } from "./quickRepliesData";

interface QuickRepliesProps {
  replies?: QuickReply[];
  onSelect: (message: string) => void;
  variant?: "chips" | "buttons" | "cards";
  showOnStart?: boolean;
  className?: string;
}

export const QuickReplies = ({
  replies = DEFAULT_QUICK_REPLIES,
  onSelect,
  variant = "chips",
  showOnStart = true,
  className = "",
}: QuickRepliesProps) => {
  if (!showOnStart) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`space-y-2 ${className}`}
    >
      <p className="text-xs text-muted-foreground mb-2">💡 Gợi ý câu hỏi:</p>

      {variant === "chips" && (
        <div className="flex flex-wrap gap-2">
          {replies.slice(0, 4).map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-border/50"
                onClick={() => onSelect(reply.message)}
              >
                {reply.icon}
                {reply.label}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {variant === "buttons" && (
        <div className="grid grid-cols-2 gap-2">
          {replies.slice(0, 6).map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-auto py-2 px-3 text-xs justify-start gap-2 bg-muted/50 hover:bg-muted"
                onClick={() => onSelect(reply.message)}
              >
                <span className="text-primary">{reply.icon}</span>
                <span className="truncate">{reply.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {variant === "cards" && (
        <div className="space-y-2">
          {replies.slice(0, 3).map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <button
                className="w-full p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-primary/5 border border-border/30 transition-all duration-200 text-left group"
                onClick={() => onSelect(reply.message)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {reply.icon}
                  </div>
                  <span className="text-sm font-medium">{reply.label}</span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Dynamic quick replies based on context
interface DynamicQuickRepliesProps {
  context?: "initial" | "product" | "pricing" | "support";
  onSelect: (message: string) => void;
}

export const DynamicQuickReplies = ({
  context = "initial",
  onSelect,
}: DynamicQuickRepliesProps) => {
  const getReplies = () => {
    switch (context) {
      case "product":
        return PRODUCT_QUICK_REPLIES;
      case "pricing":
        return [
          {
            id: "quote",
            label: "Nhận báo giá chi tiết",
            message: "Gửi báo giá chi tiết cho tôi qua email",
            icon: <CreditCard className="w-3.5 h-3.5" />,
          },
          {
            id: "call",
            label: "Gọi tư vấn",
            message: "Tôi muốn được gọi điện tư vấn",
            icon: <Phone className="w-3.5 h-3.5" />,
          },
        ];
      case "support":
        return [
          {
            id: "warranty",
            label: "Bảo hành",
            message: "Tôi cần hỗ trợ bảo hành",
            icon: <HelpCircle className="w-3.5 h-3.5" />,
          },
          {
            id: "complaint",
            label: "Khiếu nại",
            message: "Tôi muốn phản ánh vấn đề",
            icon: <MessageSquare className="w-3.5 h-3.5" />,
          },
        ];
      default:
        return DEFAULT_QUICK_REPLIES;
    }
  };

  return <QuickReplies replies={getReplies()} onSelect={onSelect} />;
};
