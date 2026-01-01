/**
 * ProjectFilters - Lọc và tìm kiếm projects
 */
import type { ProjectShowcase } from "@/hooks/useProjectShowcase";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

interface ProjectFiltersProps {
  projects: ProjectShowcase[];
  onFilteredProjectsChange: (filtered: ProjectShowcase[]) => void;
  className?: string;
}

type SortOption = "display_order" | "name" | "date" | "progress";

export const ProjectFilters = ({
  projects,
  onFilteredProjectsChange,
  className = "",
}: ProjectFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("display_order");
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique values for filters
  const { categories, statuses, techs } = useMemo(() => {
    const cats = new Set<string>();
    const stats = new Set<string>();
    const techSet = new Set<string>();

    projects.forEach((p) => {
      if (p.category) cats.add(p.category);
      if (p.status) stats.add(p.status);
      p.tech_stack?.forEach((t) => techSet.add(t.name));
    });

    return {
      categories: Array.from(cats).sort(),
      statuses: Array.from(stats).sort(),
      techs: Array.from(techSet).sort(),
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.tech_stack?.some((t) => t.name.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Tech filter
    if (selectedTech) {
      result = result.filter((p) => p.tech_stack?.some((t) => t.name === selectedTech));
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        result.sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "progress":
        result.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      default:
        result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }

    return result;
  }, [projects, searchQuery, selectedCategory, selectedStatus, selectedTech, sortBy]);

  // Update parent when filters change
  useMemo(() => {
    onFilteredProjectsChange(filteredProjects);
  }, [filteredProjects, onFilteredProjectsChange]);

  const activeFiltersCount = [selectedCategory, selectedStatus, selectedTech].filter(
    Boolean
  ).length;

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSelectedTech("");
    setSortBy("display_order");
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      live: "🟢 Live",
      development: "🟡 Development",
      planned: "🔵 Planned",
      maintenance: "🟠 Maintenance",
    };
    return labels[status] || status;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar + Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm project..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
            showFilters || activeFiltersCount > 0
              ? "bg-primary/10 border-primary/50 text-primary"
              : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/30"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-card/30 border border-border/30 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Danh mục
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 focus:border-primary/50 outline-none transition-colors"
                  >
                    <option value="">Tất cả</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Trạng thái
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 focus:border-primary/50 outline-none transition-colors"
                  >
                    <option value="">Tất cả</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tech Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Công nghệ
                  </label>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 focus:border-primary/50 outline-none transition-colors"
                  >
                    <option value="">Tất cả</option>
                    {techs.map((tech) => (
                      <option key={tech} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Sắp xếp
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 focus:border-primary/50 outline-none transition-colors"
                  >
                    <option value="display_order">Mặc định</option>
                    <option value="name">Tên A-Z</option>
                    <option value="date">Mới nhất</option>
                    <option value="progress">Tiến độ</option>
                  </select>
                </div>
              </div>

              {/* Active Filters & Clear */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                      <FilterTag
                        label={selectedCategory}
                        onRemove={() => setSelectedCategory("")}
                      />
                    )}
                    {selectedStatus && (
                      <FilterTag
                        label={getStatusLabel(selectedStatus)}
                        onRemove={() => setSelectedStatus("")}
                      />
                    )}
                    {selectedTech && (
                      <FilterTag label={selectedTech} onRemove={() => setSelectedTech("")} />
                    )}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{filteredProjects.length}</span> /{" "}
        {projects.length} dự án
        {searchQuery && <span> cho "{searchQuery}"</span>}
      </div>
    </div>
  );
};

// Helper component
const FilterTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-lg">
    {label}
    <button onClick={onRemove} className="p-0.5 hover:bg-primary/20 rounded">
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default ProjectFilters;
