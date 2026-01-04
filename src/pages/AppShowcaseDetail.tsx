import { useAuth } from "@/components/auth/AuthProvider";
import { AnimatedBackground } from "@/components/showcase/AnimatedBackground";
import { CTASection } from "@/components/showcase/CTASection";
import { FeaturesSection } from "@/components/showcase/FeaturesSectionDynamic";
import { FooterSection } from "@/components/showcase/FooterSection";
import { HeroSection } from "@/components/showcase/HeroSection";
import { SaboArenaLanding } from "@/components/showcase/sabo-arena";
import "@/components/showcase/sabo-arena/sabo-arena.css";
import { VungtaulandLanding } from "@/components/showcase/vungtauland";
import "@/components/showcase/vungtauland/vungtauland.css";
import { AppShowcaseService } from "@/services/app-showcase.service";
import { AppShowcaseData } from "@/types/app-showcase.types";
import { Eye, LogIn, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AINewbieShowcase from "./AINewbieShowcase";
import SaboHubShowcase from "./SaboHubShowcase";

const AppShowcaseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<AppShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleViewShowcase = () => {
    if (user) {
      navigate(`/projects/${slug}`);
    } else {
      // Redirect to login with return URL
      navigate(`/auth?redirect=/projects/${slug}`);
    }
  };

  useEffect(() => {
    // Skip loading data for custom showcases
    if (slug === "sabohub" || slug === "ainewbievn" || slug === "sabo-arena-billiards-platform" || slug === "vungtauland") {
      setLoading(false);
      return;
    }

    const loadDataAsync = async () => {
      if (!slug) {
        navigate("/app-showcase");
        return;
      }

      setLoading(true);
      const appData = await AppShowcaseService.loadData(slug);
      setData(appData);
      setLoading(false);
    };

    loadDataAsync();

    // Subscribe to realtime changes from Supabase
    const unsubscribe = slug
      ? AppShowcaseService.subscribeToChanges(slug, (newData) => {
          setData(newData);
          setLoading(false);
        })
      : () => {};

    // Also listen for custom event (admin save triggers this)
    const handleAppUpdate = () => {
      loadDataAsync();
    };

    globalThis.addEventListener("app-showcase-updated", handleAppUpdate);

    return () => {
      unsubscribe();
      globalThis.removeEventListener("app-showcase-updated", handleAppUpdate);
    };
  }, [slug, navigate]);

  // If slug is "sabohub", render SaboHub showcase directly
  if (slug === "sabohub") {
    return <SaboHubShowcase />;
  }

  // If slug is "ainewbievn", render AINewbie showcase directly
  if (slug === "ainewbievn") {
    return <AINewbieShowcase />;
  }

  // If slug is "sabo-arena-billiards-platform", render SABO Arena landing page
  if (slug === "sabo-arena-billiards-platform") {
    return <SaboArenaLanding />;
  }

  // If slug is "vungtauland", render Vungtauland landing page
  if (slug === "vungtauland") {
    return <VungtaulandLanding />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-destructive">Không tìm thấy dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <AnimatedBackground />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        {/* View Showcase Button */}
        <button
          onClick={handleViewShowcase}
          className="w-14 h-14 rounded-full bg-neon-purple text-white flex items-center justify-center shadow-lg shadow-neon-purple/50 hover:scale-110 transition-transform"
          title={user ? "Xem chi tiết Showcase" : "Đăng nhập để xem Showcase"}
        >
          {user ? <Eye size={24} /> : <LogIn size={24} />}
        </button>

        {/* Admin Button */}
        <Link
          to="/admin"
          className="w-14 h-14 rounded-full bg-neon-cyan text-dark-bg flex items-center justify-center shadow-lg shadow-neon-cyan/50 hover:scale-110 transition-transform"
          title="Vào trang Admin"
        >
          <Settings size={24} />
        </Link>
      </div>

      <HeroSection data={data} />
      <FeaturesSection data={data} />
      <CTASection data={data} />
      <FooterSection />
    </div>
  );
};

export default AppShowcaseDetail;
