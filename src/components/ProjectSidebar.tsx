import { Input } from "@/components/ui/input";
import { useProjectData } from "@/hooks/useProjectData";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { GlowCard } from "./GlowCard";
import { NeonBadge } from "./NeonBadge";

interface ProjectSidebarProps {
  activeProjectId: number;
  onProjectChange: (id: number) => void;
}

const categories = [
  "All",
  "Mobile App",
  "Business Management Platform",
  "AI Platform",
  "Analytics",
];

export const ProjectSidebar = ({ activeProjectId, onProjectChange }: ProjectSidebarProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Get merged projects data (static + database)
  const { projects } = useProjectData();

  const filteredProjects = projects.filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen sticky top-0 bg-gradient-to-b from-dark-bg to-dark-surface border-r border-border/30 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo/Title */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold gradient-text mb-2">DỰ ÁN</h2>
          <p className="text-sm text-muted-foreground">Danh Sách Các Dự Án</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-surface border-neon-cyan/30 focus:border-neon-cyan focus:glow-border transition-all"
          />
        </div>

        {/* Filter Tags */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <NeonBadge
                key={cat}
                variant={activeCategory === cat ? "cyan" : "blue"}
                className={activeCategory === cat ? "bg-neon-cyan/20" : ""}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </NeonBadge>
            ))}
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Projects</p>
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlowCard
                className={`cursor-pointer p-3 ${
                  activeProjectId === project.id
                    ? "border-neon-cyan bg-neon-cyan/5"
                    : "border-border/30"
                }`}
                glowColor={activeProjectId === project.id ? "cyan" : "blue"}
                onClick={() => onProjectChange(project.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div
                    className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ${
                      activeProjectId === project.id
                        ? "ring-2 ring-neon-cyan"
                        : "ring-1 ring-border/50"
                    }`}
                  >
                    {project.logoUrl ? (
                      <img
                        src={project.logoUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-dark-surface">
                        <project.icon className="h-5 w-5 text-neon-cyan" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-semibold text-foreground truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{project.category}</p>
                  </div>
                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs text-neon-green">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                      Live
                    </span>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
