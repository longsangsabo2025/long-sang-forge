import { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import { QuickNavPanel } from "./QuickNavPanel";
import { ScrollToTop } from "./ScrollToTop";
import { TechBackground } from "./TechBackground";

interface LayoutProps {
  children: ReactNode;
  /** Enable split layout with sticky chat on the right */
  withStickyChat?: boolean;
}

export const Layout = ({ children, withStickyChat = false }: LayoutProps) => {
  // Standard layout without sticky chat
  if (!withStickyChat) {
    return (
      <div className="min-h-screen text-foreground relative">
        <TechBackground />
        <Navigation />
        <main className="pt-16 relative z-10">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
          </div>
          {children}
        </main>
        <Footer />
        <ScrollToTop />
        <QuickNavPanel />
      </div>
    );
  }

  // Split layout - now uses GlobalChat from App.tsx instead of EnhancedStickyChat
  return (
    <div className="min-h-screen text-foreground relative">
      <TechBackground />
      <Navigation />

      {/* Main container */}
      <main className="pt-16 relative z-10">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
        </div>
        {children}
        <Footer />
      </main>

      <ScrollToTop />
      <QuickNavPanel />
    </div>
  );
};
