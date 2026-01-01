import { PhoneMockupCarousel } from "@/components/showcase/PhoneMockupCarousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectShowcase } from "@/hooks/useProjectShowcase";
import { ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

// Fallback images nếu database không có
const fallbackImages = [
  "/images/sabo-arena-1.jpg",
  "/images/sabo-arena-2.jpg",
  "/images/sabo-arena-3.jpg",
  "/images/sabo-arena-4.jpg",
];

export const FeaturedProject = () => {
  const { t } = useTranslation();

  // Fetch SABO Arena data từ database
  const { data: project, isLoading } = useProjectShowcase("sabo-arena");

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Lấy data từ database hoặc fallback về i18n
  const title = project?.hero_title || t("featured.title");
  const tagline = project?.description || t("featured.tagline");
  const description = project?.hero_description || t("featured.challengeText");
  const screenshots = project?.screenshots?.length ? project.screenshots : fallbackImages;

  // Tech stack từ database
  const techStack = project?.tech_stack?.map((tech: { name: string }) => tech.name) || [
    "Flutter",
    "Dart",
    "Supabase",
    "PostgreSQL",
    "Real-time",
  ];

  // Features từ database (lấy points từ features array)
  const features =
    project?.features?.flatMap((f: { points?: string[] }) => f.points || []) ||
    (t("featured.features", { returnObjects: true }) as string[]);

  // Results từ database (impacts)
  const results = project?.impacts || (t("featured.results", { returnObjects: true }) as string[]);

  // Loading skeleton
  if (isLoading) {
    return (
      <section id="projects" className="py-6 sm:py-8 md:py-16 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid lg:grid-cols-2 gap-16">
            <Skeleton className="h-[600px] rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-6 sm:py-8 md:py-16 relative overflow-hidden">
      {/* Background Gradient - Removed for transparency */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5" /> */}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 relative z-10">
        {/* Featured Badge */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <span className="inline-block px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold uppercase bg-secondary/10 border border-secondary/30 text-secondary rounded-full">
            {t("featured.badge")}
          </span>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Left Side - Phone Mockup Gallery */}
          <div className="relative animate-fade-in flex justify-center">
            <PhoneMockupCarousel
              screenshots={screenshots}
              autoPlay={true}
              autoPlayInterval={5000}
            />
          </div>

          {/* Right Side - Content */}
          <div
            className="space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            {/* Project Name */}
            <div>
              <h3 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3">
                {title}
              </h3>
              <p className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground">
                {tagline}
              </p>
            </div>

            {/* The Challenge / Description */}
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-2 sm:mb-4">
                {t("featured.challengeTitle")}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {/* Features / Solution */}
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-2 sm:mb-4">
                {t("featured.solutionTitle")}
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {features.slice(0, 6).map((feature: string, index: number) => (
                  <li
                    key={`feature-${index}`}
                    className="flex items-start gap-2 sm:gap-3 text-muted-foreground"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm sm:text-base leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-2 sm:mb-4">
                {t("featured.techStackTitle")}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {techStack.map((tech: string) => (
                  <span
                    key={tech}
                    className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium font-mono bg-primary/10 border border-primary/30 text-accent rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Results & Impact */}
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-2 sm:mb-4">
                {t("featured.resultsTitle")}
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {results.map((result: string, index: number) => (
                  <li
                    key={`result-${index}`}
                    className="flex items-start gap-2 sm:gap-3 text-muted-foreground"
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base leading-relaxed">{result}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 sm:px-7 py-5 sm:py-6 rounded-xl font-semibold hover:scale-105 transition-all duration-200 inline-flex items-center gap-2 min-h-[48px] text-sm sm:text-base touch-manipulation w-full xs:w-auto"
            >
              {t("featured.cta")}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
