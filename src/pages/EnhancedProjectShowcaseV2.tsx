/**
 * EnhancedProjectShowcaseV2 - Refactored theo Elon Musk Audit
 *
 * Changes:
 * - 100% Database (Single Source of Truth)
 * - Split thành components nhỏ
 * - Giảm animation bloat
 * - ~150 lines thay vì 763 lines
 */
import { ProjectSEO } from "@/components/SEO";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { OverviewSection } from "@/components/OverviewSection";
import { TechArchitecture } from "@/components/TechArchitecture";
import { CaseStudyCard } from "@/components/showcase/CaseStudyCard";
import { ProjectCTA } from "@/components/showcase/ProjectCTA";
import { ProjectHero } from "@/components/showcase/ProjectHero";
import { MobileSidebar, ProjectSidebar } from "@/components/showcase/ProjectSidebar";
import { RelatedProjects } from "@/components/showcase/RelatedProjects";
import { SocialShare } from "@/components/showcase/SocialShare";
import { TestimonialsSection } from "@/components/showcase/TestimonialsSection";
import { VideoEmbed } from "@/components/showcase/VideoEmbed";

// Hooks - 100% Database
import { useAllProjectShowcases, type ProjectShowcase } from "@/hooks/useProjectShowcase";

// Adapter để convert database format → legacy component format
import { adaptProjectForLegacy } from "@/utils/projectAdapter";

const PROJECT_SIDEBAR_KEY = "project-sidebar-collapsed";

const EnhancedProjectShowcaseV2 = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  // Fetch ALL projects from database
  const { data: allProjects, isLoading } = useAllProjectShowcases();

  // Active project state
  const [activeProject, setActiveProject] = useState<ProjectShowcase | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(PROJECT_SIDEBAR_KEY);
    return saved !== null ? saved === "true" : false;
  });

  // Set active project based on slug or first project
  useEffect(() => {
    if (allProjects && allProjects.length > 0) {
      if (slug) {
        const found = allProjects.find((p) => p.slug === slug);
        setActiveProject(found || allProjects[0]);
      } else {
        setActiveProject(allProjects[0]);
      }
    }
  }, [allProjects, slug]);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem(PROJECT_SIDEBAR_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Scroll to top when project changes
  useEffect(() => {
    if (activeProject) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeProject?.id]);

  // Loading state - Enhanced with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0d1321] to-[#0a0f1a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">Đang tải dự án...</p>
            <p className="text-sm text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // No projects - Enhanced empty state
  if (!allProjects || allProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0d1321] to-[#0a0f1a]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Chưa có dự án nào</h2>
          <p className="text-muted-foreground mb-6">
            Các dự án sẽ sớm được cập nhật. Quay lại sau nhé!
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const handleSelectProject = (project: ProjectShowcase) => {
    setActiveProject(project);
    navigate(`/projects/${project.slug}`, { replace: true });
  };

  // Convert database format → legacy component format using adapter
  const projectForLegacy = activeProject ? adaptProjectForLegacy(activeProject) : null;

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Neural Network Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Dark base layer */}
        <div className="absolute inset-0 bg-[#0a0f1a]" />
        {/* Neural network image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/images/backgrounds/neural-network.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a]/60 via-transparent to-[#0a0f1a]/60" />
        {/* Glowing orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-[120px]" />
      </div>

      {projectForLegacy && <ProjectSEO project={projectForLegacy} section="overview" />}

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 bg-card/80 hover:bg-card rounded-lg p-3 border border-border/50 transition-colors flex items-center gap-2 group"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="hidden sm:inline text-sm text-muted-foreground group-hover:text-primary transition-colors">
          Trang chủ
        </span>
      </button>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-32 sm:left-36 z-50 md:hidden bg-primary/20 hover:bg-primary/30 rounded-lg p-3 border border-primary/20 transition-colors"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-primary" />
        )}
      </button>

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        projects={allProjects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Desktop Sidebar */}
      <ProjectSidebar
        projects={allProjects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 relative z-10">
        <AnimatePresence mode="wait">
          {activeProject && (
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto px-4 md:px-8 space-y-8 pb-8"
            >
              {/* Hero */}
              <ProjectHero project={activeProject} />

              {/* Social Share */}
              <SocialShare
                title={activeProject.name}
                description={activeProject.hero_description || activeProject.description}
                hashtags={[
                  "longsang",
                  "portfolio",
                  activeProject.category?.toLowerCase().replace(/\s+/g, "") || "project",
                ]}
              />

              {/* Overview */}
              {projectForLegacy && <OverviewSection project={projectForLegacy} />}

              {/* Tech Architecture */}
              {projectForLegacy && <TechArchitecture project={projectForLegacy} />}

              {/* Features */}
              {projectForLegacy && <FeaturesGrid project={projectForLegacy} />}

              {/* Video (if available) */}
              {activeProject.video_url && (
                <VideoEmbed
                  videoUrl={activeProject.video_url}
                  thumbnailUrl={activeProject.screenshots?.[0]?.url || "/images/placeholder.jpg"}
                  title={`Demo ${activeProject.name}`}
                />
              )}

              {/* Testimonials */}
              <TestimonialsSection title={`Khách Hàng Nói Gì Về ${activeProject.name}`} />

              {/* Case Study (if available in database) */}
              {activeProject.case_study && (
                <CaseStudyCard
                  problem={activeProject.case_study.problem}
                  solution={activeProject.case_study.solution}
                  result={activeProject.case_study.result}
                  metrics={activeProject.case_study.metrics}
                />
              )}

              {/* Related Projects */}
              {allProjects && allProjects.length > 1 && (
                <RelatedProjects
                  currentProject={activeProject}
                  allProjects={allProjects}
                  onSelectProject={handleSelectProject}
                  maxItems={3}
                />
              )}

              {/* CTA */}
              <ProjectCTA project={activeProject} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EnhancedProjectShowcaseV2;
