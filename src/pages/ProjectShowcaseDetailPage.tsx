/**
 * Project Showcase Detail Page
 * Load từ bảng project_showcase và hiển thị chi tiết project
 * Yêu cầu đăng nhập để xem
 * Giới hạn theo gói subscription: Free=1, Pro=3, VIP=unlimited
 */
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { GlowCard } from "@/components/GlowCard";
import { NeonBadge } from "@/components/NeonBadge";
import { OverviewSection } from "@/components/OverviewSection";
import { AnimatedBackground } from "@/components/showcase/AnimatedBackground";
import { ProjectCTA } from "@/components/showcase/ProjectCTA";
import { ProjectHero } from "@/components/showcase/ProjectHero";
import { RelatedProjects } from "@/components/showcase/RelatedProjects";
import { TechArchitecture } from "@/components/TechArchitecture";
import { Button } from "@/components/ui/button";
import { useShowcaseAccess } from "@/hooks/useFeature";
import { useAllProjectShowcases, useProjectShowcase } from "@/hooks/useProjectShowcase";
import { adaptProjectForLegacy } from "@/utils/projectAdapter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  ExternalLink,
  Github,
  Globe,
  Lock,
  LogIn,
  Settings,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function ProjectShowcaseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: project, isLoading, error } = useProjectShowcase(slug || "");
  const { data: allProjects } = useAllProjectShowcases();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check showcase access based on subscription
  const { limit, isUnlimited } = useShowcaseAccess();

  // Check if user can access this specific project
  const canAccessProject = useMemo(() => {
    if (!project || !allProjects) return true; // Loading state
    if (isUnlimited) return true; // VIP gets unlimited

    // Get projects sorted by display_order (same as listing)
    const sortedProjects = [...allProjects].sort(
      (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
    );

    // Find index of current project in the sorted list
    const projectIndex = sortedProjects.findIndex((p) => p.slug === slug);

    // User can access if project is within their limit
    // e.g., Free (limit=1) can access index 0 (first project)
    // Pro (limit=3) can access index 0, 1, 2
    return projectIndex !== -1 && projectIndex < limit;
  }, [project, allProjects, slug, limit, isUnlimited]);

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-6">
        <AnimatedBackground />
        <div className="glass-card p-8 rounded-2xl text-center max-w-md z-10">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-neon-cyan" />
          <h1 className="text-2xl font-bold mb-2">Yêu cầu đăng nhập</h1>
          <p className="text-muted-foreground mb-6">
            Bạn cần đăng nhập để xem chi tiết Showcase này
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-neon-cyan text-dark-bg hover:bg-neon-cyan/90"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Đăng nhập
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/showcase/${slug}`)}
              className="w-full"
            >
              <Globe className="mr-2 h-4 w-4" />
              Xem Landing Page
            </Button>
          </div>
        </div>

        {/* Login Modal */}
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          redirectTo={`/project-showcase/${slug}`}
          onSuccess={() => {
            setShowLoginModal(false);
            // Page will automatically re-render with user
          }}
        />
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-xl">Không tìm thấy project</p>
        <p className="text-muted-foreground">Slug: {slug}</p>
        <Button onClick={() => navigate("/projects")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Show upgrade prompt if user cannot access this project (exceeded limit)
  if (!canAccessProject) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-6">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl text-center max-w-md z-10 border border-amber-500/30"
        >
          <Lock className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h1 className="text-2xl font-bold mb-2">Nâng cấp để xem thêm</h1>
          <p className="text-muted-foreground mb-4">
            Gói của bạn chỉ cho phép xem{" "}
            <span className="text-amber-400 font-semibold">{limit} dự án</span>.
            <br />
            Nâng cấp để mở khóa tất cả showcase!
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-left bg-blue-500/10 p-3 rounded-lg">
              <Zap className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span>
                <strong className="text-blue-400">Pro</strong>: Xem 3 dự án showcase
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-left bg-amber-500/10 p-3 rounded-lg">
              <Crown className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <span>
                <strong className="text-amber-400">VIP</strong>: Xem không giới hạn + đầu tư
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/pricing")}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            >
              <Crown className="mr-2 h-4 w-4" />
              Nâng cấp ngay
            </Button>
            <Button variant="outline" onClick={() => navigate("/projects")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Convert to legacy format for existing components
  const legacyProject = adaptProjectForLegacy(project);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#0a0f1a] via-[#0d1321] to-[#0a0f1a]">
      <AnimatedBackground />

      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="glass-card text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        {/* View Landing Page Button */}
        <Link
          to={`/showcase/${slug}`}
          className="w-14 h-14 rounded-full bg-neon-purple text-white flex items-center justify-center shadow-lg shadow-neon-purple/50 hover:scale-110 transition-transform"
          title="Xem Landing Page"
        >
          <Globe size={24} />
        </Link>

        {/* Admin Button */}
        <Link
          to={`/admin/projects/edit/${project.id}`}
          className="w-14 h-14 rounded-full bg-neon-cyan text-dark-bg flex items-center justify-center shadow-lg shadow-neon-cyan/50 hover:scale-110 transition-transform"
          title="Chỉnh sửa project"
        >
          <Settings size={24} />
        </Link>
      </div>

      {/* Hero Section */}
      <ProjectHero project={project} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Quick Stats */}
        {project.hero_stats && project.hero_stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {project.hero_stats.map((stat, idx) => (
              <GlowCard key={idx} glowColor="cyan" className="p-6 text-center">
                <p className="text-3xl font-bold text-neon-cyan">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </GlowCard>
            ))}
          </motion.div>
        )}

        {/* Overview */}
        {(project.overview_description ||
          project.objectives?.length ||
          project.impacts?.length) && <OverviewSection project={legacyProject} />}

        {/* Features */}
        {project.features && project.features.length > 0 && (
          <FeaturesGrid
            project={legacyProject}
            showcaseSlug={slug}
            showcaseName={project.name}
          />
        )}

        {/* Tech Architecture */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <TechArchitecture project={legacyProject} />
        )}

        {/* Metrics & Performance */}
        {(project.metrics?.length || project.performance?.length) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {project.metrics && project.metrics.length > 0 && (
              <GlowCard glowColor="green" className="p-8">
                <h3 className="font-display text-xl font-bold text-neon-green mb-6">
                  📊 Key Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {project.metrics.map((metric, idx) => (
                    <div key={idx} className="text-center p-4 rounded-lg bg-background/30">
                      <p className="text-2xl font-bold text-neon-green">
                        {metric.value}
                        {metric.unit}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </GlowCard>
            )}

            {project.performance && project.performance.length > 0 && (
              <GlowCard glowColor="blue" className="p-8">
                <h3 className="font-display text-xl font-bold text-neon-blue mb-6">
                  ⚡ Performance
                </h3>
                <div className="space-y-4">
                  {project.performance.map((perf, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{perf.label}</span>
                      <NeonBadge variant="blue">{perf.value}</NeonBadge>
                    </div>
                  ))}
                </div>
              </GlowCard>
            )}
          </motion.div>
        )}

        {/* Infrastructure */}
        {project.infrastructure && project.infrastructure.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <GlowCard glowColor="purple" className="p-8">
              <h3 className="font-display text-xl font-bold text-neon-purple mb-6">
                🏗️ Infrastructure
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {project.infrastructure.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-background/30">
                    <p className="font-semibold text-neon-purple">{item.label}</p>
                    {item.value && (
                      <p className="text-sm text-muted-foreground mt-1">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        )}

        {/* Screenshots Gallery */}
        {project.screenshots && project.screenshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl font-bold glow-text">📸 Screenshots</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.screenshots.map((screenshot, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="overflow-hidden rounded-xl border border-border/50"
                >
                  <img
                    src={screenshot.url}
                    alt={screenshot.caption || `Screenshot ${idx + 1}`}
                    className="w-full h-auto"
                  />
                  {screenshot.caption && (
                    <p className="p-3 bg-background/50 text-sm text-center text-muted-foreground">
                      {screenshot.caption}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <ProjectCTA project={project} />

        {/* Related Projects */}
        {allProjects && allProjects.length > 1 && (
          <RelatedProjects
            currentProject={project}
            allProjects={allProjects}
            onSelectProject={(p) => navigate(`/projects/${p.slug}`)}
          />
        )}
      </div>

      {/* Footer Links */}
      <div className="border-t border-border/30 py-8">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-4">
          {project.production_url && (
            <Button asChild variant="outline">
              <a href={project.production_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Live Site
              </a>
            </Button>
          )}
          {project.github_url && (
            <Button asChild variant="outline">
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View Source
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
