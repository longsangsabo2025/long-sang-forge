/**
 * ProjectCTA - Call to Action section
 * Split từ EnhancedProjectShowcase.tsx theo Elon Musk Audit
 */
import type { ProjectShowcase } from "@/hooks/useProjectShowcase";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCTAProps {
  project: ProjectShowcase;
}

export const ProjectCTA = ({ project }: ProjectCTAProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden py-16 mb-12">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-6"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Quan Tâm Đến Dự Án Này?
        </h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Liên hệ với tôi để tìm hiểu thêm về {project.name}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary: View Production */}
          {project.production_url && (
            <motion.a
              href={project.production_url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-primary-foreground font-bold rounded-xl transition-all duration-300 border border-primary/40 hover:border-primary/60 hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
            >
              <ExternalLink className="w-5 h-5" />
              XEM TRANG WEB
            </motion.a>
          )}

          {/* Secondary: Contact */}
          <motion.button
            onClick={() => navigate("/#contact")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-primary/50 hover:border-primary text-primary font-bold rounded-xl transition-colors"
          >
            LIÊN HỆ TƯ VẤN
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
