import { projectsData } from "@/data/projects-data";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const ProjectsTimeline = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get top 4 projects to display in timeline
  const displayProjects = projectsData.slice(0, 4).map((project) => ({
    id: project.id,
    slug: project.slug,
    name: project.name,
    description: project.description,
    heroDescription: project.heroDescription,
    category: project.category,
    techStack: project.techStack?.slice(0, 4).map((tech) => tech.name) || [],
    productionUrl: project.productionUrl,
    image: `/images/projects/${project.slug}.jpg`,
  }));

  const handleViewProject = (slug?: string) => {
    if (slug) {
      navigate(`/project-showcase/${slug}`);
    } else {
      navigate("/project-showcase");
    }
  };

  return (
    <section id="projects" className="py-6 sm:py-8 md:py-16 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-2 sm:mb-4">
            {t("projects.header")}
          </p>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {t("projects.subtitle")}
          </h2>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Timeline Line (Desktop Only) */}
          <div className="hidden md:block absolute left-0 top-8 bottom-8 w-0.5 bg-border/30" />

          {/* Projects */}
          <div className="space-y-6 sm:space-y-8 md:space-y-12">
            {displayProjects.map((project, index) => (
              <div
                key={project.id}
                className="relative md:ml-12"
                style={{
                  animation: "fade-in 0.6s ease-out forwards",
                  animationDelay: `${index * 200}ms`,
                  opacity: 0,
                }}
              >
                {/* Timeline Dot (Desktop Only) */}
                <div className="hidden md:block absolute -left-14 top-8 w-4 h-4 rounded-full bg-primary border-[3px] border-background shadow-[0_0_0_4px_rgba(14,165,233,0.2)]" />

                {/* Project Card - Touch-friendly */}
                <button
                  type="button"
                  onClick={() => handleViewProject(project.slug)}
                  className="bg-card border border-border/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-all duration-250 group cursor-pointer text-left w-full touch-manipulation"
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-[200px] md:w-[300px] flex-shrink-0">
                    <div className="relative aspect-video sm:aspect-[3/2] rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 group-hover:from-primary/30 group-hover:via-secondary/30 group-hover:to-accent/30 transition-all duration-300">
                      {/* Category Badge */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                        <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-primary/90 text-primary-foreground rounded-md">
                          {project.category}
                        </span>
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col gap-2 sm:gap-4">
                    {/* Title */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2">
                      {project.heroDescription || project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium font-mono bg-primary/10 border border-primary/30 text-primary rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    <div className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-primary hover:text-accent transition-colors duration-200 mt-auto pt-2">
                      {t("projects.viewDetails")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* View All Projects Button - Touch-friendly */}
          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <button
              onClick={() => navigate("/project-showcase")}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 text-primary font-medium rounded-xl transition-all duration-200 min-h-[48px] text-sm sm:text-base touch-manipulation"
            >
              Xem tất cả dự án
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
