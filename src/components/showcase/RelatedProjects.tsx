/**
 * RelatedProjects - Hiển thị các dự án liên quan
 * Dựa vào category hoặc tech stack tương tự
 */
import type { ProjectShowcase } from "@/hooks/useProjectShowcase";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { ProjectStatus } from "./StatusBadge";
import { StatusBadge } from "./StatusBadge";

interface RelatedProjectsProps {
  currentProject: ProjectShowcase;
  allProjects: ProjectShowcase[];
  onSelectProject?: (project: ProjectShowcase) => void;
  maxItems?: number;
}

export const RelatedProjects = ({
  currentProject,
  allProjects,
  onSelectProject,
  maxItems = 3,
}: RelatedProjectsProps) => {
  // Tìm projects liên quan: cùng category hoặc có chung tech
  const relatedProjects = allProjects
    .filter((p) => p.id !== currentProject.id)
    .map((p) => {
      let score = 0;
      // Same category = +3 points
      if (p.category === currentProject.category) score += 3;
      // Same tech stack = +1 point each
      const currentTechs = currentProject.tech_stack?.map((t) => t.name.toLowerCase()) || [];
      const projectTechs = p.tech_stack?.map((t) => t.name.toLowerCase()) || [];
      const commonTechs = currentTechs.filter((t) => projectTechs.includes(t));
      score += commonTechs.length;
      return { project: p, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map((item) => item.project);

  // If not enough related, add random projects
  if (relatedProjects.length < maxItems) {
    const remaining = allProjects
      .filter((p) => p.id !== currentProject.id && !relatedProjects.includes(p))
      .slice(0, maxItems - relatedProjects.length);
    relatedProjects.push(...remaining);
  }

  if (relatedProjects.length === 0) return null;

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">🔗 Dự Án Liên Quan</h2>
        <p className="text-muted-foreground">Khám phá thêm các dự án tương tự</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => onSelectProject?.(project)}
            className="group cursor-pointer bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-cyan-500/20">
              {project.screenshots?.[0]?.url ? (
                <img
                  src={
                    typeof project.screenshots[0] === "string"
                      ? project.screenshots[0]
                      : project.screenshots[0].url
                  }
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">{getCategoryEmoji(project.category)}</span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <StatusBadge status={project.status as ProjectStatus} size="sm" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {project.category}
                </span>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description || project.hero_description}
              </p>

              {/* Tech Tags */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tech_stack.slice(0, 3).map((tech) => (
                    <span
                      key={tech.name}
                      className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground rounded"
                    >
                      {tech.name}
                    </span>
                  ))}
                  {project.tech_stack.length > 3 && (
                    <span className="text-xs px-2 py-0.5 text-muted-foreground">
                      +{project.tech_stack.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4" />
                </span>
                {project.production_url && (
                  <a
                    href={project.production_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-muted/50 hover:bg-primary/20 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Helper function
const getCategoryEmoji = (category?: string): string => {
  if (!category) return "📦";
  const cat = category.toLowerCase();
  if (cat.includes("mobile")) return "📱";
  if (cat.includes("web")) return "🌐";
  if (cat.includes("ai") || cat.includes("ml")) return "🤖";
  if (cat.includes("commerce") || cat.includes("shop")) return "🛒";
  if (cat.includes("saas")) return "☁️";
  if (cat.includes("game")) return "🎮";
  return "💼";
};

export default RelatedProjects;
