/**
 * SABO Arena Landing Page
 * Main landing page that combines all sections
 */
import { useNavigate } from "react-router-dom";
import { SaboArenaAdminProvider } from "./AdminEditContext";
import { SaboArenaDownloadSection } from "./DownloadSection";
import { SaboArenaFeaturesSection } from "./FeaturesSection";
import { SaboArenaFooter } from "./Footer";
import { SaboArenaFormatsSection } from "./FormatsSection";
import { SaboArenaHeader } from "./Header";
import { SaboArenaHeroSection } from "./HeroSection";
import { SaboArenaPartnersSection } from "./PartnersSection";
import { SaboArenaScreenshotsSection } from "./ScreenshotsSection";
import { SaboArenaStatsSection } from "./StatsSection";

export const SaboArenaLanding = () => {
  const navigate = useNavigate();

  const handleBackToMain = () => {
    navigate("/");
  };

  return (
    <SaboArenaAdminProvider>
      <div className="min-h-screen sabo-arena-landing">
        <SaboArenaHeader onBackToMain={handleBackToMain} />
        <main>
          <SaboArenaHeroSection />
          <SaboArenaPartnersSection />
          <SaboArenaFeaturesSection />
          <SaboArenaFormatsSection />
          <SaboArenaScreenshotsSection />
          <SaboArenaStatsSection />
          <SaboArenaDownloadSection />
        </main>
        <SaboArenaFooter />
      </div>
    </SaboArenaAdminProvider>
  );
};

export default SaboArenaLanding;
