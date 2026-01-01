import { useLanguage } from "@/contexts/LanguageContext";
import {
  Brain,
  Briefcase,
  Code,
  Cpu,
  Factory,
  Lightbulb,
  MessageSquare,
  Rocket,
  Target,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CVSkillsSection = () => {
  const { t, language } = useLanguage();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // HARD SKILLS - Technical capabilities
  const hardSkills =
    language === "vi"
      ? {
          title: "Kỹ năng Kỹ thuật",
          subtitle: "Các công nghệ đang sử dụng",
          categories: [
            {
              name: "Frontend Development",
              icon: Code,
              skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "Flutter / Dart"],
            },
            {
              name: "Backend & Database",
              icon: Cpu,
              skills: ["Node.js / Express", "PostgreSQL / Supabase", "REST APIs", "Firebase"],
            },
            {
              name: "AI & Automation",
              icon: Brain,
              skills: [
                "OpenAI / Gemini API",
                "Chatbot Development",
                "AI Agents",
                "Process Automation",
              ],
            },
            {
              name: "DevOps & Tools",
              icon: Wrench,
              skills: ["Git / GitHub", "Vercel / Netlify", "CI/CD Pipelines", "Docker Basics"],
            },
          ],
        }
      : {
          title: "Technical Skills",
          subtitle: "Technologies I work with",
          categories: [
            {
              name: "Frontend Development",
              icon: Code,
              skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "Flutter / Dart"],
            },
            {
              name: "Backend & Database",
              icon: Cpu,
              skills: ["Node.js / Express", "PostgreSQL / Supabase", "REST APIs", "Firebase"],
            },
            {
              name: "AI & Automation",
              icon: Brain,
              skills: [
                "OpenAI / Gemini API",
                "Chatbot Development",
                "AI Agents",
                "Process Automation",
              ],
            },
            {
              name: "DevOps & Tools",
              icon: Wrench,
              skills: ["Git / GitHub", "Vercel / Netlify", "CI/CD Pipelines", "Docker Basics"],
            },
          ],
        };

  // SOFT SKILLS - Interpersonal and thinking skills
  const softSkills =
    language === "vi"
      ? {
          title: "Kỹ năng Mềm",
          subtitle: "Những kỹ năng tôi đang rèn luyện",
          items: [
            {
              name: "Giao tiếp",
              icon: MessageSquare,
              description: "Giải thích vấn đề kỹ thuật dễ hiểu",
            },
            {
              name: "Tư duy Logic",
              icon: Target,
              description: "Phân tích và giải quyết từ nguyên nhân gốc",
            },
            {
              name: "Giải quyết vấn đề",
              icon: Lightbulb,
              description: "Tìm giải pháp thực tế, không chỉ lý thuyết",
            },
            {
              name: "Học hỏi liên tục",
              icon: Rocket,
              description: "Luôn cập nhật công nghệ mới",
            },
            {
              name: "Làm việc nhóm",
              icon: Users,
              description: "Hợp tác hiệu quả trong mọi vai trò",
            },
            {
              name: "Quản lý thời gian",
              icon: Zap,
              description: "Hoàn thành công việc đúng deadline",
            },
          ],
        }
      : {
          title: "Soft Skills",
          subtitle: "Skills I continuously develop",
          items: [
            {
              name: "Communication",
              icon: MessageSquare,
              description: "Explain technical concepts clearly",
            },
            {
              name: "Logical Thinking",
              icon: Target,
              description: "Analyze and solve from root cause",
            },
            {
              name: "Problem Solving",
              icon: Lightbulb,
              description: "Find practical solutions, not just theory",
            },
            {
              name: "Continuous Learning",
              icon: Rocket,
              description: "Always updating with new technologies",
            },
            {
              name: "Teamwork",
              icon: Users,
              description: "Collaborate effectively in any role",
            },
            {
              name: "Time Management",
              icon: Zap,
              description: "Deliver work on schedule",
            },
          ],
        };

  // DOMAIN EXPERTISE - Industry experience
  const domainExpertise =
    language === "vi"
      ? {
          title: "Kinh nghiệm Ngành",
          subtitle: "Các lĩnh vực đã làm việc",
          domains: [
            {
              name: "Oil & Gas Industry",
              icon: Factory,
              years: "5+",
              details: ["Kỹ thuật hóa học dầu khí", "Quy trình HSE", "Quản lý chất lượng"],
            },
            {
              name: "Business & Startup",
              icon: Briefcase,
              years: "3+",
              details: ["Quản lý doanh nghiệp", "Digital Marketing", "Sales & BD"],
            },
            {
              name: "Tech & Software",
              icon: Code,
              years: "2+",
              details: ["Full-stack Development", "AI Integration", "SaaS Products"],
            },
          ],
        }
      : {
          title: "Industry Experience",
          subtitle: "Fields I have worked in",
          domains: [
            {
              name: "Oil & Gas Industry",
              icon: Factory,
              years: "5+",
              details: ["Refinery operations", "HSE processes", "Quality management"],
            },
            {
              name: "Business & Startup",
              icon: Briefcase,
              years: "3+",
              details: ["Business management", "Digital Marketing", "Sales & BD"],
            },
            {
              name: "Tech & Software",
              icon: Code,
              years: "2+",
              details: ["Full-stack Development", "AI Integration", "SaaS Products"],
            },
          ],
        };

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

  return (
    <section ref={sectionRef} id="skills" className="section-padding relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1.2s" }}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

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

        {/* SECTION 1: HARD SKILLS */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {hardSkills.title}
              </h3>
              <p className="text-sm text-foreground-secondary">{hardSkills.subtitle}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hardSkills.categories.map((category, catIndex) => {
              const CategoryIcon = category.icon;
              return (
                <div
                  key={category.name}
                  className="bg-card border border-border rounded-xl p-5 hover:border-blue-500/50 transition-all group"
                  style={{
                    animation: inView ? `fade-in 0.5s ease-out ${catIndex * 100}ms both` : "none",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CategoryIcon className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-foreground text-sm">{category.name}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: SOFT SKILLS */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {softSkills.title}
              </h3>
              <p className="text-sm text-foreground-secondary">{softSkills.subtitle}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {softSkills.items.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.name}
                  className="bg-card border border-border rounded-xl p-5 hover:border-green-500/50 transition-all group"
                  style={{
                    animation: inView ? `fade-in 0.5s ease-out ${index * 80}ms both` : "none",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <ItemIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                      <p className="text-sm text-foreground-secondary">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: DOMAIN EXPERTISE */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {domainExpertise.title}
              </h3>
              <p className="text-sm text-foreground-secondary">{domainExpertise.subtitle}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {domainExpertise.domains.map((domain, index) => {
              const DomainIcon = domain.icon;
              return (
                <div
                  key={domain.name}
                  className="bg-card border border-border rounded-xl p-6 hover:border-amber-500/50 transition-all group relative overflow-hidden"
                  style={{
                    animation: inView ? `scale-in 0.5s ease-out ${index * 150}ms both` : "none",
                  }}
                >
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                    <span className="text-sm font-bold text-amber-400">{domain.years} years</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DomainIcon className="w-6 h-6 text-amber-400" />
                    </div>
                    <h4 className="font-bold text-foreground text-lg">{domain.name}</h4>
                  </div>

                  <ul className="space-y-2">
                    {domain.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center gap-2 text-foreground-secondary"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
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
