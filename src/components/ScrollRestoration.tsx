/**
 * ScrollRestoration Component
 * Automatically scrolls to top when route changes
 * Fixes the issue where navigating to a new page keeps scroll position
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use instant for page navigation, smooth can feel laggy
    });
  }, [pathname]);

  return null;
}
