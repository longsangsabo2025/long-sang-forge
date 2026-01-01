/**
 * Sound Notification Hook
 * Extracted for Fast Refresh compatibility
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Sound URLs - using base64 for small notification sounds
export const NOTIFICATION_SOUNDS = {
  // Simple "ting" sound - base64 encoded
  ting: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYFbHC0AAAAAAD/+9DEAAAHAAGn9AAAIN4Ls/4xgAgAADSAAAA0NEh0EBAQEByDn/E5+oICD4Ph/ygIfB8Hw+H4fB8PwfD4fh8Hw/+D5//y4P///B//+oIAgICAgICP4Pn/8uD////wfP/61E5AAALgBkAAAB0AaAGQBkICAhkIZCGQhkDU11dU11dXVMh0yHV1f/wAAAwADAAAGv/6cOQNgAZ8TZ/wYQAQ1Qiz/jGACAAAdI2v3z7l9qetbhMKrA7I7x5s7/Xr09JR0lJXdMh0yHTIf+pyBIBASf6n//yAABgAyHU5znOc5zmoICD4Ph+D4fD8Hw+H4fB8P/wfD/4P/h//9QQEHwfB8Hw//5cH/E5/5cHz/xOf/y4Pn//u7u7u7u7u7u4FQKgXh4eHg8PDweHh4dHR0BAQEBEREQkJCNFRUJCQoKCQoKB////8uD5/+oICD4P/+7DEFIALyEuf8wwAQX4Os/5hgAg+D4fjqAgIPlwfP+ICD4Pn/+uD/h+D/EBB//qAgIPg+H/lwfB8Pw/+tROf/UEBB8Pqdf/U5//lw/9akNT+nTIdTkP/wfD8H/rUh/y4Pn//Lg+D4f/6ggIA=",

  // Pop sound
  pop: "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYCv2O4AAAAAAD/+9DEAAAGsAGX9AAAINcJs/4xgAgICAAAP/BwcHBwcf+5//+D/4P/qAgICAgI/g+f/y4Pn/iAg+D5/4gIPg+f+ID///g//1AQfD/0BJ//1OQ//6nIf/U5D/6nIdTkOn/+pz/U5//1Of6nP/U5/qc//1Of//qch1OQ//qcgAAAYABgAADb//pw5A6ABixFn/BZAADKCbP+MYAICAh/B8Hw/B/8Hw/9QEB8H/wfP/EBB8H/wfP/5cHwfD8H/w/D/8H/1AQEH/w/D/4Pn/+XB8Hw/B8P/g+H/+oCD/4fn/8uD4fg/+H4P/g+f/6gIPh/6Ag//VJf/qc//6nIf/U5/qch/9TkOv/qcj//1OQ6nIf/U5Dqcj/yHU5H/lOQ6nP//U5D/6nIdTkP/qch0yH/8h//u7u7u7u7u7gVAqBUCoFXFxdHR0dDweDweDw8HBwcHBAQEB0dHR",
};

export interface UseSoundNotificationOptions {
  enabled?: boolean;
  sound?: keyof typeof NOTIFICATION_SOUNDS;
  volume?: number;
}

export const useSoundNotification = (options: UseSoundNotificationOptions = {}) => {
  const { enabled = true, sound = "ting", volume = 0.5 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    // Check localStorage for user preference
    const saved = localStorage.getItem("longsang_chat_muted");
    return saved === "true";
  });

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(NOTIFICATION_SOUNDS[sound]);
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sound, volume]);

  useEffect(() => {
    // Save mute preference
    localStorage.setItem("longsang_chat_muted", String(isMuted));
  }, [isMuted]);

  const playSound = useCallback(() => {
    if (!enabled || isMuted || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    } catch (e) {
      // Ignore audio errors
    }
  }, [enabled, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
    setMuted: setIsMuted,
  };
};
