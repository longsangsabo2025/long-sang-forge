/**
 * ProjectSidebar - Sidebar navigation cho project showcase
 * Split từ EnhancedProjectShowcase.tsx theo Elon Musk Audit
 */
import type { ProjectShowcase } from "@/hooks/useProjectShowcase";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Search, X } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge, getStatusConfig, type ProjectStatus } from "./StatusBadge";

interface ProjectSidebarProps {
  projects: ProjectShowcase[];
  activeProject: ProjectShowcase | null;
  onSelectProject: (project: ProjectShowcase) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProjectSidebar = ({
  projects,
  activeProject,
  onSelectProject,
  isCollapsed,
  onToggleCollapse,
  searchQuery,
  onSearchChange,
}: ProjectSidebarProps) => {
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      className="hidden md:block flex-shrink-0"
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full bg-card/30 border-r border-border/50 p-4 pt-20 relative">
        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-24 z-10 p-1.5 rounded-full bg-card border border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Header */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-foreground mb-4"
            >
              Dự Án Của Tôi
            </motion.h2>
          )}
        </AnimatePresence>

        {/* Search */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm dự án..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project List */}
        <div className="space-y-2">
          {filteredProjects.map((project) => {
            const isActive = project.id === activeProject?.id;
            const statusConfig = getStatusConfig(project.status as ProjectStatus);

            return (
              <motion.button
                key={project.id}
                onClick={() => onSelectProject(project)}
                whileHover={{ scale: isCollapsed ? 1.1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 border border-primary/30 shadow-lg"
                    : "hover:bg-muted/50 border border-transparent"
                } ${isCollapsed ? "p-3" : "p-4"}`}
              >
                {isCollapsed ? (
                  // Collapsed View
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                      <span className="text-lg">{project.name.charAt(0)}</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${statusConfig.color} ${
                        statusConfig.pulse ? "animate-pulse" : ""
                      }`}
                    />
                  </div>
                ) : (
                  // Expanded View
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                        {project.logo_url ? (
                          <img
                            src={project.logo_url}
                            alt={project.name}
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <span className="text-sm font-bold">{project.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium truncate ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {project.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {project.description}
                    </div>

                    {/* Progress Bar for non-live projects */}
                    {project.status !== "live" && project.progress && (
                      <ProgressBar progress={project.progress} showLabel className="mb-2" />
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground truncate">
                        {project.category}
                      </span>
                      <StatusBadge status={project.status as ProjectStatus} />
                    </div>
                  </>
                )}
              </motion.button>
            );
          })}

          {filteredProjects.length === 0 && !isCollapsed && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không tìm thấy dự án nào
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Mobile Sidebar
interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectShowcase[];
  activeProject: ProjectShowcase | null;
  onSelectProject: (project: ProjectShowcase) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MobileSidebar = ({
  isOpen,
  onClose,
  projects,
  activeProject,
  onSelectProject,
  searchQuery,
  onSearchChange,
}: MobileSidebarProps) => {
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 md:hidden overflow-y-auto"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Dự Án</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm dự án..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div className="p-4 space-y-2">
              {filteredProjects.map((project) => {
                const isActive = project.id === activeProject?.id;

                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      onSelectProject(project);
                      onClose();
                    }}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium text-foreground">{project.name}</div>
                    <div className="text-xs text-muted-foreground">{project.category}</div>
                    {project.status !== "live" && project.progress && (
                      <ProgressBar progress={project.progress} className="mt-2" />
                    )}
                    <div className="mt-2 flex justify-between items-center">
                      <StatusBadge status={project.status as ProjectStatus} />
                      {project.production_url && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
