import CVAboutSection from "@/components/cv/CVAboutSection";
import CVContactSection from "@/components/cv/CVContactSection";
import CVExperienceSection from "@/components/cv/CVExperienceSection";
import CVFooter from "@/components/cv/CVFooter";
import CVHeroSection from "@/components/cv/CVHeroSection";
import CVNavigation from "@/components/cv/CVNavigation";
import CVSkillsSection from "@/components/cv/CVSkillsSection";
import { TechBackground } from "@/components/TechBackground";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CVPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Nếu có history thì quay lại, không thì về trang chủ
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen relative">
        <TechBackground />
        {/* Back Button - z-[60] to be above CVNavigation (z-50) */}
        <button
          onClick={handleGoBack}
          className="fixed top-5 left-4 z-[60] bg-background/95 hover:bg-background backdrop-blur-sm rounded-lg px-4 py-2 border border-border transition-colors flex items-center gap-2 group shadow-lg cursor-pointer"
          aria-label="Quay lại trang trước"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
            Quay lại
          </span>
        </button>
        <CVNavigation />
        <main>
          <CVHeroSection />
          <CVAboutSection />
          <CVExperienceSection />
          <CVSkillsSection />
          {/* <CVEducationSection /> */}
          <CVContactSection />
        </main>
        <CVFooter />
      </div>
    </LanguageProvider>
  );
};

export default CVPage;
