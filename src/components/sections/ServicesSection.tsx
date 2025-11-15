import { ArrowRight, Smartphone, Globe, Workflow, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ServicesSection = () => {
  const { t } = useTranslation();
  
  const services = [
    {
      Icon: Smartphone,
      titleKey: "services.mobile.title",
      descriptionKey: "services.mobile.description",
      techStack: ["Flutter", "Dart", "iOS", "Android"],
    },
    {
      Icon: Globe,
      titleKey: "services.web.title",
      descriptionKey: "services.web.description",
      techStack: ["React", "Next.js", "TypeScript", "Tailwind"],
    },
    {
      Icon: Workflow,
      titleKey: "services.automation.title",
      descriptionKey: "services.automation.description",
      techStack: ["Zapier", "Make", "n8n", "APIs"],
    },
    {
      Icon: Sparkles,
      titleKey: "services.ai.title",
      descriptionKey: "services.ai.description",
      techStack: ["OpenAI", "Claude", "Gemini", "LangChain"],
    },
  ];

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="services" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
            {t('services.header')}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {t('services.subtitle')}
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6">
          {services.map((service, index) => (
            <div
              key={service.titleKey}
              className="group bg-card border border-border/10 rounded-2xl p-8 min-h-[400px] flex flex-col hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-300"
              style={{
                animation: "fade-in 0.6s ease-out forwards",
                animationDelay: `${index * 150}ms`,
                opacity: 0,
              }}
            >
              {/* Icon */}
              <div className="mb-6 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <service.Icon className="w-7 h-7 text-primary" strokeWidth={2.5} />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                {t(service.titleKey)}
              </h3>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed mb-6 flex-grow">
                {t(service.descriptionKey)}
              </p>

              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {service.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs font-medium font-mono bg-primary/10 border border-primary/30 text-accent rounded-full hover:bg-primary/20 hover:scale-105 transition-all duration-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Learn More Link */}
              <button
                onClick={scrollToContact}
                className="inline-flex items-center gap-2 text-base font-medium text-primary hover:text-accent transition-colors duration-200 group/link"
              >
                {t('services.learnMore')}
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
