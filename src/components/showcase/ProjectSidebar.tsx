/**
 * ProjectSidebar - Sidebar navigation cho project showcase
 * Option B: Compact design với logo nhỏ + text
 * Split từ EnhancedProjectShowcase.tsx theo Elon Musk Audit
 *
 * ELON AUDIT: Added Lock Icon for subscription-gated projects
 */
import { useShowcaseAccess } from "@/hooks/useFeature";
import type { ProjectShowcase } from "@/hooks/useProjectShowcase";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Circle, Crown, Lock, Search, X } from "lucide-react";
import { useMemo } from "react";

// Status configuration for compact display
const getStatusConfig = (status: string) => {
  switch (status) {
    case "live":
      return { label: "Live", color: "bg-green-500", textColor: "text-green-500" };
    case "development":
      return { label: "Dev", color: "bg-yellow-500", textColor: "text-yellow-500" };
    case "planned":
      return { label: "Planned", color: "bg-blue-500", textColor: "text-blue-500" };
    case "maintenance":
      return { label: "Maintenance", color: "bg-orange-500", textColor: "text-orange-500" };
    default:
      return { label: status, color: "bg-gray-500", textColor: "text-gray-500" };
  }
};

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
  // Check showcase access based on subscription
  const { limit, isUnlimited, isFree, isPro, isVip } = useShowcaseAccess();

  // Sort projects by display_order and check access for each
  const projectsWithAccess = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
    );
    return sorted.map((project, index) => ({
      ...project,
      canAccess: isUnlimited || index < limit,
      projectIndex: index,
    }));
  }, [projects, limit, isUnlimited]);

  const filteredProjects = projectsWithAccess.filter(
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

        {/* Project List - Option B: Compact Cards */}
        <div className="space-y-2">
          {filteredProjects.map((project) => {
            const isActive = project.id === activeProject?.id;
            const statusConfig = getStatusConfig(project.status || "development");
            const isLocked = !project.canAccess;

            return (
              <motion.button
                key={project.id}
                onClick={() => !isLocked && onSelectProject(project)}
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                className={`w-full text-left rounded-xl transition-all duration-200 relative ${
                  isLocked
                    ? "bg-muted/20 opacity-60 cursor-not-allowed"
                    : isActive
                    ? "bg-primary/10 ring-2 ring-primary/50"
                    : "bg-muted/30 hover:bg-muted/50"
                } ${isCollapsed ? "p-2" : "p-3"}`}
                title={isLocked ? "Nâng cấp gói để xem dự án này" : project.name}
              >
                {/* Lock Overlay for collapsed */}
                {isLocked && isCollapsed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10">
                    <Lock className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
                {isCollapsed ? (
                  // Collapsed View - Icon only
                  <div className="flex flex-col items-center gap-1">
                    {project.logo_url ? (
                      <img
                        src={project.logo_url}
                        alt={project.name}
                        className={`w-10 h-10 object-contain rounded-lg ${
                          isLocked ? "grayscale" : ""
                        }`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-primary/20" : "bg-muted"
                      } ${project.logo_url ? "hidden" : ""}`}
                    >
                      <span className="text-lg font-bold">{project.name.charAt(0)}</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${statusConfig.color}`}
                      title={statusConfig.label}
                    />
                  </div>
                ) : (
                  // Expanded View - Option B: Compact with logo + text
                  <div className="flex items-center gap-3">
                    {/* Logo 40x40 */}
                    {project.logo_url ? (
                      <img
                        src={project.logo_url}
                        alt={project.name}
                        className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-primary/20" : "bg-muted"
                      } ${project.logo_url ? "hidden" : ""}`}
                    >
                      <span className="text-lg font-bold">{project.name.charAt(0)}</span>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold truncate text-sm ${
                          isActive ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {project.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {project.category}
                      </div>
                    </div>

                    {/* Lock icon for gated projects OR Status indicator */}
                    {isLocked ? (
                      <div
                        className="flex items-center gap-1.5 flex-shrink-0"
                        title="Nâng cấp để mở khóa"
                      >
                        <Lock className="w-4 h-4 text-yellow-500" />
                        <Crown className="w-3 h-3 text-yellow-500" />
                      </div>
                    ) : project.status === "live" ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">Live</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </motion.button>
            );
          })}

          {/* Upgrade prompt at bottom */}
          {!isUnlimited && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {isFree ? "Gói Miễn Phí" : isPro ? "Gói Pro" : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Bạn đang xem {limit}/{projects.length} dự án
              </p>
              <a
                href="/subscription"
                className="block w-full text-center text-xs py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 font-medium transition-colors"
              >
                Nâng cấp để xem tất cả →
              </a>
            </motion.div>
          )}

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
  // Check showcase access based on subscription
  const { limit, isUnlimited, isFree, isPro } = useShowcaseAccess();

  // Sort projects by display_order and check access for each
  const projectsWithAccess = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
    );
    return sorted.map((project, index) => ({
      ...project,
      canAccess: isUnlimited || index < limit,
      projectIndex: index,
    }));
  }, [projects, limit, isUnlimited]);

  const filteredProjects = projectsWithAccess.filter(
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
                const isLocked = !project.canAccess;

                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      if (!isLocked) {
                        onSelectProject(project);
                        onClose();
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      isLocked
                        ? "bg-muted/20 opacity-60 cursor-not-allowed"
                        : isActive
                        ? "bg-primary/10 ring-2 ring-primary/50"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Logo */}
                      {project.logo_url ? (
                        <img
                          src={project.logo_url}
                          alt={project.name}
                          className={`w-10 h-10 object-contain rounded-lg flex-shrink-0 ${
                            isLocked ? "grayscale" : ""
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isActive ? "bg-primary/20" : "bg-muted"
                          }`}
                        >
                          <span className="text-lg font-bold">{project.name.charAt(0)}</span>
                        </div>
                      )}

                      {/* Text Info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold truncate ${
                            isLocked
                              ? "text-muted-foreground"
                              : isActive
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {project.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {project.category}
                        </div>
                      </div>

                      {/* Lock icon or Status */}
                      {isLocked ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Lock className="w-4 h-4 text-yellow-500" />
                          <Crown className="w-3 h-3 text-yellow-500" />
                        </div>
                      ) : project.status === "live" ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          <span className="text-xs text-green-500 font-medium">Live</span>
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}

              {/* Upgrade prompt */}
              {!isUnlimited && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">
                      {isFree ? "Gói Miễn Phí" : isPro ? "Gói Pro" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Bạn đang xem {limit}/{projects.length} dự án
                  </p>
                  <a
                    href="/subscription"
                    className="block w-full text-center text-xs py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 font-medium transition-colors"
                  >
                    Nâng cấp để xem tất cả →
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
