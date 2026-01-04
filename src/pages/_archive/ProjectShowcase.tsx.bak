import { FeaturesGrid } from "@/components/FeaturesGrid";
import { OverviewSection } from "@/components/OverviewSection";
import { ProjectCTA } from "@/components/ProjectCTA";
import { ProjectHero } from "@/components/ProjectHero";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ProjectSEO } from "@/components/SEO";
import { StatsChart } from "@/components/StatsChart";
import { TechArchitecture } from "@/components/TechArchitecture";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useProjectData } from "@/hooks/useProjectData";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const ProjectShowcase = () => {
  const [activeProjectId, setActiveProjectId] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get projects with merged data (static + database)
  const { projects } = useProjectData();
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleProjectChange = (id: number) => {
    setActiveProjectId(id);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Neural Network Image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/images/neural-network.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg/90 via-dark-surface/80 to-dark-bg/90" />
        {/* Radial Glow - Top Right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        {/* Radial Glow - Bottom Left */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-[120px]" />
      </div>

      <ProjectSEO project={activeProject} section="overview" />
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary/20 hover:bg-primary/30 backdrop-blur-sm rounded-lg p-3 border border-primary/20 transition-colors"
        aria-label="Toggle project menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-primary" />
        )}
      </button>

      {/* Theme Toggle - Desktop */}
      <div className="fixed top-4 right-4 z-50 hidden md:block">
        <ThemeToggle />
      </div>

      {/* Theme Toggle - Mobile */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <ThemeToggle />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <ProjectSidebar
                activeProjectId={activeProjectId}
                onProjectChange={handleProjectChange}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - 30% */}
      <aside className="w-[30%] hidden md:block">
        <ProjectSidebar activeProjectId={activeProjectId} onProjectChange={setActiveProjectId} />
      </aside>

      {/* Main Content - 70% on desktop, full width on mobile */}
      <main className="w-full md:w-[70%] overflow-y-auto">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-8 pt-20 md:pt-8">
          <motion.div
            key={activeProjectId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProjectHero project={activeProject} />
            <OverviewSection project={activeProject} />
            <TechArchitecture project={activeProject} />
            <FeaturesGrid project={activeProject} />
            <StatsChart project={activeProject} />
            <ProjectCTA project={activeProject} />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProjectShowcase;
