import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { FeaturedProject } from "@/components/sections/FeaturedProject";
import { ProjectsTimeline } from "@/components/sections/ProjectsTimeline";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { LearningSection } from "@/components/sections/LearningSection";
import { ContactSection } from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Bar */}
      <StatsBar />
      
      {/* Services Section */}
      <ServicesSection />
      
      {/* Featured Project */}
      <FeaturedProject />
      
      {/* Other Projects Timeline */}
      <ProjectsTimeline />
      
      {/* Tech Stack */}
      <TechStackSection />
      
      {/* Process */}
      <ProcessSection />
      
      {/* Learning Hub */}
      <LearningSection />
      
      {/* Contact Section */}
      <ContactSection />
    </Layout>
  );
};

export default Index;
