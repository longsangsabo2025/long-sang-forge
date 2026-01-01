/**
 * ProjectHero - Hero section với Smart Mockup Gallery
 * Split từ EnhancedProjectShowcase.tsx theo Elon Musk Audit
 *
 * Tự động chọn mockup phù hợp:
 * - Mobile App → Phone Mockup
 * - Web App / Platform → Browser Mockup
 * - Responsive → Toggle giữa Desktop/Mobile
 */
import type { ProjectShowcase } from "@/hooks/useProjectShowcase";
import { getIconFromString } from "@/utils/projectAdapter";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { SmartMockupCarousel } from "./SmartMockupCarousel";

interface ProjectHeroProps {
  project: ProjectShowcase;
}

export const ProjectHero = ({ project }: ProjectHeroProps) => {
  const screenshots = project.screenshots?.map((s) => (typeof s === "string" ? s : s.url)) || [];

  return (
    <div className="relative overflow-hidden">
      {/* Simplified Background - Giảm animation bloat */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 py-12 px-6"
      >
        <div className="text-center mb-8">
          {/* Category Badge */}
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 rounded-full">
            {project.category}
          </span>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-primary bg-clip-text text-transparent">
            {project.hero_title || project.name}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {project.hero_description || project.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {project.production_url && (
              <motion.a
                href={project.production_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-xl transition-colors shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                XEM TRANG WEB THỰC TẾ
              </motion.a>
            )}
            {project.github_url && (
              <motion.a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-card hover:bg-card/80 text-foreground font-bold text-lg rounded-xl transition-colors border border-border/50 hover:border-primary/50"
              >
                <Github className="w-5 h-5" />
                GITHUB
              </motion.a>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {project.hero_stats && project.hero_stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {project.hero_stats.map((stat, index) => {
              const StatIcon = getIconFromString(stat.icon);
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <StatIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {stat.label}
                      </p>
                      <p className="font-display text-2xl font-bold text-foreground">
                        {typeof stat.value === "string" && /^\d+/.test(stat.value) ? (
                          <AnimatedCounter
                            end={Number.parseInt(stat.value.replaceAll(/\D/g, ""), 10)}
                            suffix={stat.value.replaceAll(/\d/g, "")}
                            duration={2}
                          />
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Smart Mockup Gallery - Auto-detect based on category */}
        {screenshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12"
          >
            <h3 className="text-center text-xl font-semibold text-foreground mb-8">
              {project.category?.toLowerCase().includes("mobile") ? "📱" : "🖥️"} Giao Diện Thực Tế
            </h3>
            <SmartMockupCarousel
              screenshots={screenshots}
              category={project.category}
              displayType={project.display_type}
              autoPlay={true}
              autoPlayInterval={5000}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
