import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, Code, MessageSquare, Target, Users, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CVSkillsSection = () => {
  const { t, language } = useLanguage();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Updated skills with progress percentages instead of vague labels
  const technicalSkills =
    language === "vi"
      ? [
          {
            name: "React / Next.js",
            progress: 75,
            description: "Xây dựng web apps, landing pages",
          },
          { name: "TypeScript", progress: 70, description: "Phát triển type-safe" },
          { name: "Flutter / Dart", progress: 55, description: "Ứng dụng mobile đa nền tảng" },
          {
            name: "Node.js / Express",
            progress: 70,
            description: "REST APIs, backend services",
          },
          {
            name: "PostgreSQL / Supabase",
            progress: 75,
            description: "Thiết kế database, queries",
          },
          {
            name: "Tích hợp AI (OpenAI, Gemini)",
            progress: 60,
            description: "Chatbot, automation, agents",
          },
          { name: "Git / GitHub", progress: 80, description: "Quản lý phiên bản, cộng tác" },
          { name: "Firebase", progress: 65, description: "Auth, Firestore, hosting" },
        ]
      : [
          {
            name: "React / Next.js",
            progress: 75,
            description: "Building web apps, landing pages",
          },
          { name: "TypeScript", progress: 70, description: "Type-safe development" },
          { name: "Flutter / Dart", progress: 55, description: "Cross-platform mobile apps" },
          {
            name: "Node.js / Express",
            progress: 70,
            description: "REST APIs, backend services",
          },
          {
            name: "PostgreSQL / Supabase",
            progress: 75,
            description: "Database design, queries",
          },
          {
            name: "AI Integration (OpenAI, Gemini)",
            progress: 60,
            description: "Chatbot, automation, agents",
          },
          {
            name: "Git / GitHub",
            progress: 80,
            description: "Version control, collaboration",
          },
          { name: "Firebase", progress: 65, description: "Auth, Firestore, hosting" },
        ];

  const softwareTools = [
    { name: "React", icon: Code, status: "daily" },
    { name: "TypeScript", icon: Code, status: "daily" },
    { name: "Flutter", icon: Target, status: "production" },
    { name: "Node.js", icon: Wrench, status: "daily" },
    { name: "Supabase", icon: Brain, status: "daily" },
    { name: "Vercel", icon: Users, status: "daily" },
    { name: "Firebase", icon: MessageSquare, status: "production" },
    { name: "Git/GitHub", icon: Code, status: "daily" },
    { name: "Figma", icon: Target, status: "familiar" },
  ];

  const competencyKeys = [
    "skills.communication",
    "skills.teamwork",
    "skills.problemSolving",
    "skills.selfLearning",
  ];
  const competencyIcons = [MessageSquare, Users, Target, Brain];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Helper function to get progress bar color
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 60) return "bg-primary";
    return "bg-secondary";
  };

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="section-padding bg-background-secondary relative"
    >
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <p className="text-sm text-primary font-medium">{t("skills.badge")}</p>
          </div>

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
            {t("skills.title")}
          </h2>

          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            {t("skills.description")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Technical Skills with Progress Bars */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            <div className="flex items-center gap-3 mb-8">
              <Code className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {t("skills.technical")}
              </h3>
            </div>

            <div className="space-y-5">
              {technicalSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="group"
                  style={{
                    animation: inView ? `fade-in 0.5s ease-out ${index * 80}ms both` : "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <p className="text-xs text-foreground-secondary">{skill.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{skill.progress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(
                        skill.progress
                      )} rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: inView ? `${skill.progress}%` : "0%",
                        transitionDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Software & Tools */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            <div className="flex items-center gap-3 mb-8">
              <Wrench className="w-8 h-8 text-secondary" />
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {t("skills.software")}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {softwareTools.map((tool, index) => {
                const IconComponent = tool.icon;
                const statusColors = {
                  daily: "bg-green-500/20 text-green-400 border-green-500/30",
                  production: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                  familiar: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                };
                const statusLabels =
                  language === "vi"
                    ? {
                        daily: "Hàng ngày",
                        production: "Production",
                        familiar: "Quen thuộc",
                      }
                    : {
                        daily: "Daily Use",
                        production: "Production",
                        familiar: "Familiar",
                      };
                return (
                  <div
                    key={tool.name}
                    className="bg-muted border border-border rounded-xl p-4 text-center hover:border-secondary/50 hover-lift transition-all group"
                    style={{
                      animation: inView ? `fade-in 0.5s ease-out ${index * 100}ms both` : "none",
                    }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <IconComponent className="w-6 h-6 text-secondary" />
                    </div>
                    <p className="font-semibold text-foreground text-sm mb-2">{tool.name}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        statusColors[tool.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[tool.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Professional Competencies */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
              {t("skills.competencies")}
            </h3>
            <p className="text-foreground-secondary">{t("skills.competenciesDesc")}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {competencyKeys.map((key, index) => {
              const Icon = competencyIcons[index];
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-3 p-6 bg-muted rounded-xl hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all hover-lift group"
                  style={{
                    animation: inView ? `scale-in 0.5s ease-out ${index * 150}ms both` : "none",
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-center">{t(key)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CVSkillsSection;
