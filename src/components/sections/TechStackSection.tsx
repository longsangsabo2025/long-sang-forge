import { useTranslation } from "react-i18next";
import { 
  Smartphone, 
  Globe, 
  Database, 
  Sparkles, 
  Wrench,
  Code2,
  Server,
  Brain,
  Container
} from "lucide-react";

export const TechStackSection = () => {
  const { t } = useTranslation();

  const techCategories = [
    {
      Icon: Smartphone,
      labelKey: "techStack.mobile",
      technologies: ["Flutter", "Dart", "iOS SDK", "Android SDK", "React Native"],
      color: "text-blue-500"
    },
    {
      Icon: Globe,
      labelKey: "techStack.web",
      technologies: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML/CSS"],
      color: "text-purple-500"
    },
    {
      Icon: Database,
      labelKey: "techStack.backend",
      technologies: ["Node.js", "Python", "Supabase", "Firebase", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL"],
      color: "text-green-500"
    },
    {
      Icon: Brain,
      labelKey: "techStack.ai",
      technologies: ["OpenAI API", "Claude API", "Google Gemini", "LangChain", "Zapier", "Make", "n8n"],
      color: "text-pink-500"
    },
    {
      Icon: Container,
      labelKey: "techStack.devops",
      technologies: ["Git", "GitHub", "Docker", "Vercel", "Railway", "VS Code", "Postman", "Figma"],
      color: "text-orange-500"
    },
  ];

  return (
    <section id="tech-stack" className="py-20 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
            {t('techStack.header')}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            {t('techStack.subtitle')}
          </h2>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {techCategories.map((category, categoryIndex) => (
            <div
              key={category.labelKey}
              className="animate-fade-in"
              style={{
                animationDelay: `${categoryIndex * 200}ms`,
                opacity: 0,
              }}
            >
              {/* Category Label with Icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${category.color}`}>
                  <category.Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-semibold uppercase tracking-wider text-foreground">
                  {t(category.labelKey)}
                </h3>
              </div>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2">
                {category.technologies.map((tech, techIndex) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-5 py-2.5 bg-primary/10 border border-primary/30 rounded-full font-mono text-sm font-medium text-accent hover:bg-primary/20 hover:border-primary/60 hover:scale-105 hover:shadow-[0_0_12px_rgba(14,165,233,0.3)] transition-all duration-200 cursor-default"
                    style={{
                      animationDelay: `${categoryIndex * 200 + techIndex * 50}ms`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
