import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// Tech stack with colors for visual distinction
const techColors: Record<string, string> = {
  // Mobile & Desktop
  Flutter: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
  Dart: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  iOS: "bg-gray-500/20 border-gray-500/40 text-gray-300",
  Android: "bg-green-500/20 border-green-500/40 text-green-400",
  Windows: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  macOS: "bg-gray-400/20 border-gray-400/40 text-gray-300",
  // Web
  React: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
  "Next.js": "bg-white/10 border-white/30 text-white",
  TypeScript: "bg-blue-600/20 border-blue-600/40 text-blue-400",
  Tailwind: "bg-teal-500/20 border-teal-500/40 text-teal-400",
  // Automation
  Zapier: "bg-orange-500/20 border-orange-500/40 text-orange-400",
  Make: "bg-purple-500/20 border-purple-500/40 text-purple-400",
  n8n: "bg-red-500/20 border-red-500/40 text-red-400",
  APIs: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
  // AI
  OpenAI: "bg-green-500/20 border-green-500/40 text-green-400",
  Claude: "bg-orange-500/20 border-orange-500/40 text-orange-400",
  Gemini: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  LangChain: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
};

export const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    {
      titleKey: "services.mobile.title",
      descriptionKey: "services.mobile.description",
      techStack: ["Flutter", "iOS", "Android", "Windows", "macOS"],
      stats: "5+ dự án",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop&q=80",
      // App Store icon - đại diện cho apps nói chung
      logo: "https://cdn.simpleicons.org/appstore/0D96F6",
    },
    {
      titleKey: "services.web.title",
      descriptionKey: "services.web.description",
      techStack: ["React", "Next.js", "TypeScript", "Tailwind"],
      stats: "10+ dự án",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&q=80",
      // Google Chrome icon - đại diện cho web browser/web apps
      logo: "https://cdn.simpleicons.org/googlechrome/4285F4",
    },
    {
      titleKey: "services.automation.title",
      descriptionKey: "services.automation.description",
      techStack: ["Zapier", "Make", "n8n", "APIs"],
      stats: "20+ workflows",
      image:
        "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=200&fit=crop&q=80",
      // Workflow/Automation icon
      logo: "https://cdn.simpleicons.org/githubactions/2088FF",
    },
    {
      titleKey: "services.ai.title",
      descriptionKey: "services.ai.description",
      techStack: ["OpenAI", "Claude", "Gemini", "LangChain"],
      stats: "15+ tích hợp",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop&q=80",
      // Brain/AI generic icon
      logo: "https://cdn.simpleicons.org/probot/00B0D8",
    },
  ];

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="services" className="py-6 sm:py-8 md:py-16 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-20 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-[100px]" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-3 sm:mb-4">
            {t("services.header")}
          </p>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {t("services.subtitle")}
          </h2>
        </div>

        {/* Services Grid - 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-6">
          {services.map((service, index) => (
            <div
              key={service.titleKey}
              className="group relative bg-card/60 backdrop-blur-sm border border-border/20 rounded-xl sm:rounded-2xl overflow-hidden min-h-[380px] xs:min-h-[420px] sm:min-h-[480px] flex flex-col hover:-translate-y-2 sm:hover:-translate-y-3 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] sm:hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-500 cursor-pointer touch-manipulation"
              style={{
                animation: "fade-in 0.6s ease-out forwards",
                animationDelay: `${index * 150}ms`,
                opacity: 0,
              }}
            >
              {/* Hero Image at top */}
              <div className="relative h-28 xs:h-32 sm:h-40 overflow-hidden">
                <img
                  src={service.image}
                  alt={t(service.titleKey)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Hover glow border effect */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />

              {/* Content wrapper */}
              <div className="relative z-10 flex flex-col flex-grow p-4 sm:p-6 pt-3 sm:pt-4">
                {/* Title with Icon */}
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:border-cyan-400/50 group-hover:scale-110 transition-all duration-300 shrink-0 mt-0.5">
                    <img
                      src={service.logo}
                      alt=""
                      className="w-4 h-4 sm:w-5 sm:h-5 group-hover:brightness-125 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300">
                    {t(service.titleKey)}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-5 flex-grow line-clamp-3 sm:line-clamp-none">
                  {t(service.descriptionKey)}
                </p>

                {/* Tech Stack Badges with colors */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
                  {service.techStack.map((tech) => (
                    <span
                      key={tech}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium font-mono rounded-full border transition-all duration-200 hover:scale-105 ${
                        techColors[tech] || "bg-primary/10 border-primary/30 text-primary"
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Mini stats - Social proof */}
                <div className="mb-3 sm:mb-4 py-1.5 sm:py-2 px-2 sm:px-3 bg-white/5 rounded-md sm:rounded-lg border border-white/10">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">✓ </span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/80">
                    {service.stats} đã triển khai
                  </span>
                </div>

                {/* CTA Link - Touch-friendly */}
                <button
                  onClick={scrollToContact}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-cyan-400 transition-colors duration-200 group/link py-2 touch-manipulation"
                >
                  Liên hệ tư vấn
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
