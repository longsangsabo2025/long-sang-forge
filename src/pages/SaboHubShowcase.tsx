import { AdminEditProvider } from "@/components/admin";
import { Benefits } from "@/components/sabohub/Benefits";
import { CTA as CallToAction } from "@/components/sabohub/CTA";
import { Features } from "@/components/sabohub/Features";
import { Footer } from "@/components/sabohub/Footer";
import { Hero } from "@/components/sabohub/Hero";
import { StatsBar } from "@/components/sabohub/StatsBar";
import { TargetUsers } from "@/components/sabohub/TargetUsers";
import { TechStack } from "@/components/sabohub/TechStack";
import { ShowcaseHeader } from "@/components/showcase/ShowcaseHeader";
import { Layers } from "lucide-react";

const navItems = [
  { label: "Trang chủ", href: "#hero" },
  { label: "Tính năng", href: "#features" },
  { label: "Đối tượng", href: "#target" },
  { label: "Công nghệ", href: "#tech" },
];

const SaboHubShowcase = () => {
  return (
    <AdminEditProvider pageId="sabohub">
      <div className="min-h-screen relative">
        {/* Header */}
        <ShowcaseHeader
          projectName="SABO"
          projectNameHighlight="HUB"
          navItems={navItems}
          ctaLabel="Liên hệ"
          ctaHref="#cta"
          icon={Layers}
          iconBgClass="bg-gradient-to-br from-cyan-500 to-blue-600"
          iconColorClass="text-white"
          showcaseSlug="sabohub"
        />

        {/* Neural Network Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#0a0f1a]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('/images/backgrounds/neural-network.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a]/60 via-transparent to-[#0a0f1a]/60" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 pt-20">
          <Hero />
          <StatsBar />
          <Features />
          <TargetUsers />
          <Benefits />
          <TechStack />
          <CallToAction />
          <Footer />
        </div>
      </div>
    </AdminEditProvider>
  );
};

export default SaboHubShowcase;
