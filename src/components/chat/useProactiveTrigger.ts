/**
 * Proactive Popup Hook
 * Extracted for Fast Refresh compatibility
 */

import { useCallback, useEffect, useState } from "react";

export interface UseProactiveOptions {
  /** Delay in seconds before triggering */
  delay?: number;
  /** Storage key for "don't show again" */
  storageKey?: string;
  /** Whether feature is enabled */
  enabled?: boolean;
}

export const useProactiveTrigger = (options: UseProactiveOptions = {}) => {
  const { delay = 30, storageKey = "longsang_proactive_dismissed", enabled = true } = options;

  const [shouldShow, setShouldShow] = useState(false);
  const [isDismissedForever, setIsDismissedForever] = useState(false);

  useEffect(() => {
    // Check if user has dismissed forever
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === "true") {
      setIsDismissedForever(true);
      return;
    }

    if (!enabled) return;

    // Timer to show
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay, enabled, storageKey]);

  const dismiss = useCallback(() => {
    setShouldShow(false);
  }, []);

  const dismissForever = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsDismissedForever(true);
    setShouldShow(false);
  }, [storageKey]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsDismissedForever(false);
  }, [storageKey]);

  return {
    shouldShow: shouldShow && !isDismissedForever && enabled,
    isDismissedForever,
    dismiss,
    dismissForever,
    reset,
  };
};
