import { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import { QuickNavPanel } from "./QuickNavPanel";
import { ScrollToTop } from "./ScrollToTop";
import { TechBackground } from "./TechBackground";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground relative">
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
};
