/**
 * Sound Notification System (Learned from Papercups & Chatwoot)
 *
 * Features:
 * - Play sound on new message
 * - Mute/unmute toggle
 * - Multiple sound options
 * - Respects user preferences
 */

import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

// Re-export hook from separate file for Fast Refresh compatibility
export { useSoundNotification } from "./useSoundNotification";
export type { UseSoundNotificationOptions } from "./useSoundNotification";

// Mute/Unmute Button Component
interface SoundToggleButtonProps {
  isMuted: boolean;
  onToggle: () => void;
  className?: string;
}

export const SoundToggleButton = ({
  isMuted,
  onToggle,
  className = "",
}: SoundToggleButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    className={`h-8 w-8 ${className}`}
    onClick={onToggle}
    title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
  >
    {isMuted ? (
      <VolumeX className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Volume2 className="h-4 w-4 text-muted-foreground" />
    )}
  </Button>
);
