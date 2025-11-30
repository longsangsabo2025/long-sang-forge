import { ArrowRight, CheckCircle, ClipboardList, Code, Headphones, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ProcessSection = () => {
  const { t } = useTranslation();

  const processSteps = [
    {
      numberKey: "process.step1.number",
      titleKey: "process.step1.title",
      activitiesKey: "process.step1.activities",
      Icon: Headphones,
    },
    {
      numberKey: "process.step2.number",
      titleKey: "process.step2.title",
      activitiesKey: "process.step2.activities",
      Icon: ClipboardList,
    },
    {
      numberKey: "process.step3.number",
      titleKey: "process.step3.title",
      activitiesKey: "process.step3.activities",
      Icon: Code,
    },
    {
      numberKey: "process.step4.number",
      titleKey: "process.step4.title",
      activitiesKey: "process.step4.activities",
      Icon: Rocket,
    },
  ];

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-8 sm:py-12 md:py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="absolute top-40 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-[80px] sm:blur-[100px]" />
      <div className="absolute bottom-20 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[120px]" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-2 sm:mb-4">
            {t("process.header")}
          </p>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {t("process.subtitle")}
          </h2>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/50 via-cyan-500/50 to-primary/50 rounded-full" />

          {/* Arrow indicators on the line */}
          <div className="hidden lg:flex absolute top-[92px] left-[10%] right-[10%] justify-between px-[20%]">
            <div className="w-3 h-3 rotate-45 border-t-2 border-r-2 border-primary/50" />
            <div className="w-3 h-3 rotate-45 border-t-2 border-r-2 border-cyan-500/50" />
            <div className="w-3 h-3 rotate-45 border-t-2 border-r-2 border-primary/50" />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {processSteps.map((step, index) => (
              <div
                key={step.numberKey}
                className="group relative bg-card border border-border/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col hover:-translate-y-2 sm:hover:-translate-y-3 hover:border-primary/50 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] sm:hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] transition-all duration-500 cursor-pointer overflow-hidden touch-manipulation"
                style={{
                  animation: "fade-in 0.6s ease-out forwards",
                  animationDelay: `${index * 200}ms`,
                  opacity: 0,
                }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 pointer-events-none" />

                {/* Content wrapper */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon + Number Row */}
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-5">
                    {/* Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-500">
                      <step.Icon
                        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary group-hover:text-cyan-400 transition-colors duration-300"
                        strokeWidth={2}
                      />
                    </div>

                    {/* Step Number */}
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-none group-hover:text-cyan-400 transition-colors duration-300">
                      {t(step.numberKey)}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-wide sm:tracking-wider text-white mb-2 sm:mb-3 md:mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    {t(step.titleKey)}
                  </h3>

                  {/* Activities List */}
                  <ul className="space-y-1.5 sm:space-y-2 md:space-y-2.5 flex-grow">
                    {(t(step.activitiesKey, { returnObjects: true }) as string[]).map(
                      (activity: string, actIndex: number) => (
                        <li
                          key={actIndex}
                          className="text-xs sm:text-sm md:text-[15px] leading-relaxed flex items-start gap-1.5 sm:gap-2 md:gap-2.5 text-white/80"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <span>{activity}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Mobile Arrow (Between Steps) */}
                {index < processSteps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-6">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-primary rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-12 md:mt-16 text-center">
          <button
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 min-h-[48px] touch-manipulation"
          >
            Bắt đầu dự án của bạn
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
            {t("process.timeline")}
          </p>
        </div>
      </div>
    </section>
  );
};
