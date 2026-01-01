/**
 * Proactive Popup - Auto-show chat invitation (Learned from Intercom/Drift)
 *
 * Features:
 * - Auto popup after X seconds of inactivity
 * - Smart triggers based on user behavior
 * - Dismissible with "don't show again" option
 * - Multiple popup styles
 */

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Re-export hook from separate file for Fast Refresh compatibility
export { useProactiveTrigger } from "./useProactiveTrigger";
export type { UseProactiveOptions } from "./useProactiveTrigger";

interface ProactivePopupProps {
  /** Delay in seconds before showing popup */
  delay?: number;
  /** Custom message to show */
  message?: string;
  /** Callback when user clicks to chat */
  onStartChat: () => void;
  /** Whether popup is enabled */
  enabled?: boolean;
  /** Storage key for "don't show again" */
  storageKey?: string;
}

export const ProactivePopup = ({
  delay = 30,
  message = "👋 Xin chào! Bạn cần tư vấn gì không?",
  onStartChat,
  enabled = true,
  storageKey = "longsang_proactive_dismissed",
}: ProactivePopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissedForever, setIsDismissedForever] = useState(false);

  useEffect(() => {
    // Check if user has dismissed forever
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === "true") {
      setIsDismissedForever(true);
      return;
    }

    // Check if already chatted this session
    const hasChattedThisSession = sessionStorage.getItem("longsang_has_chatted");
    if (hasChattedThisSession) return;

    if (!enabled) return;

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay, enabled, storageKey]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleDismissForever = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsDismissedForever(true);
    setIsVisible(false);
  }, [storageKey]);

  const handleStartChat = useCallback(() => {
    sessionStorage.setItem("longsang_has_chatted", "true");
    setIsVisible(false);
    onStartChat();
  }, [onStartChat]);

  if (isDismissedForever || !enabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-6 z-40 max-w-xs"
        >
          <div className="bg-background border border-border shadow-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI Trợ lý</span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-foreground mb-4">{message}</p>

              <div className="flex gap-2">
                <Button
                  onClick={handleStartChat}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat ngay
                </Button>
              </div>

              <button
                onClick={handleDismissForever}
                className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Không hiển thị lại
              </button>
            </div>

            {/* Decorative tail pointing to chat button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-background border-b border-r border-border transform rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
