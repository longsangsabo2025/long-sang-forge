import { AdminEditProvider } from "@/components/admin";
import { CTASection } from "@/components/ainewbie/CTASection";
import { Footer } from "@/components/ainewbie/Footer";
import { HeroSection } from "@/components/ainewbie/HeroSection";
import { JobSection } from "@/components/ainewbie/JobSection";
import { ServicesSection } from "@/components/ainewbie/ServicesSection";
import { WorkflowSection } from "@/components/ainewbie/WorkflowSection";
import { ShowcaseHeader } from "@/components/showcase/ShowcaseHeader";
import { Bot } from "lucide-react";

const navItems = [
  { label: "Trang chủ", href: "#hero" },
  { label: "Dịch vụ", href: "#services" },
  { label: "Quy trình", href: "#workflow" },
  { label: "Công việc", href: "#jobs" },
];

const AINewbieShowcase = () => {
  return (
    <AdminEditProvider pageId="ainewbievn">
      <div className="min-h-screen relative">
        {/* Header */}
        <ShowcaseHeader
          projectName="AI"
          projectNameHighlight="NEWBIE"
          navItems={navItems}
          ctaLabel="Bắt đầu"
          ctaHref="#cta"
          icon={Bot}
          iconBgClass="bg-gradient-to-br from-purple-500 to-pink-600"
          iconColorClass="text-white"
          showcaseSlug="ainewbievn"
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
          <main>
            <HeroSection />
            <ServicesSection />
            <WorkflowSection />
            <JobSection />
            <CTASection />
          </main>
          <Footer />
        </div>
      </div>
    </AdminEditProvider>
  );
};

export default AINewbieShowcase;
