import { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { EnhancedStickyChat } from "./chat/EnhancedStickyChat";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import { QuickNavPanel } from "./QuickNavPanel";
import { ScrollToTop } from "./ScrollToTop";
import { MobileChatButton } from "./StickyChat";
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

  // Split layout with sticky chat
  return (
    <div className="min-h-screen text-foreground relative">
      <TechBackground />
      <Navigation />

      {/* Main container with split layout */}
      <div className="pt-16 relative z-10 flex">
        {/* Left side - Scrollable content */}
        <main className="flex-1 lg:pr-[400px] xl:pr-[420px]">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
          </div>
          {children}
          <Footer />
        </main>

        {/* Right side - Fixed chat panel (hidden on mobile) */}
        <aside className="hidden lg:block fixed top-16 right-0 bottom-0 w-[400px] xl:w-[420px] z-40">
          <EnhancedStickyChat />
        </aside>
      </div>

      {/* Mobile chat button - shows only on mobile */}
      <MobileChatButton />

      <ScrollToTop />
      <QuickNavPanel />
    </div>
  );
};
