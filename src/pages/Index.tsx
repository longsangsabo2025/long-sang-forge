import { Layout } from "@/components/LayoutWithChat";
import { FeaturedProject } from "@/components/sections/FeaturedProject";
import { HeroSection } from "@/components/sections/HeroSection";
// import { LearningSection } from "@/components/sections/LearningSection"; // Hidden - Academy coming soon
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ProjectsTimeline } from "@/components/sections/ProjectsTimeline";
import { ServicesSection } from "@/components/sections/ServicesSection";
// import { TechStackSection } from "@/components/sections/TechStackSection"; // Hidden - not needed
import { UnifiedContactSection } from "@/components/sections/UnifiedContactSection";

const Index = () => {
  return (
    <Layout withStickyChat>
      {/* Hero Section */}
      <HeroSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Featured Project */}
      <FeaturedProject />

      {/* Other Projects Timeline */}
      <ProjectsTimeline />

      {/* Tech Stack - Hidden */}
      {/* <TechStackSection /> */}

      {/* Process */}
      <ProcessSection />

      {/* Learning Hub - Hidden (Academy Coming Soon) */}
      {/* <LearningSection /> */}

      {/* Contact Section - Unified with AI Chat & Consultation */}
      <UnifiedContactSection />
    </Layout>
  );
};

export default Index;
