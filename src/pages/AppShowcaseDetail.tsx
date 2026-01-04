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
import { useProjectShowcase } from "@/hooks/useProjectShowcase";
import { Eye, LogIn } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AINewbieShowcase from "./AINewbieShowcase";
import SaboHubShowcase from "./SaboHubShowcase";

// Custom showcases có landing page riêng
const CUSTOM_SHOWCASES = ["sabohub", "ainewbievn", "sabo-arena-billiards-platform", "vungtauland"];

const AppShowcaseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Load từ project_showcase table (Single Source of Truth)
  const isCustomShowcase = slug ? CUSTOM_SHOWCASES.includes(slug) : false;
  const { data: project, isLoading } = useProjectShowcase(isCustomShowcase ? "" : (slug || ""));

  // Navigate đến full showcase (yêu cầu đăng nhập)
  const handleViewFullShowcase = () => {
    if (user) {
      navigate(`/projects/${slug}`);
    } else {
      navigate(`/auth?redirect=/projects/${slug}`);
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!project) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-xl mb-4">Không tìm thấy dự án</p>
          <button 
            onClick={() => navigate("/projects")}
            className="px-6 py-3 bg-neon-cyan text-dark-bg rounded-lg hover:opacity-90 transition"
          >
            Xem tất cả dự án
          </button>
        </div>
      </div>
    );
  }

  // Convert project_showcase data to landing page format
  const landingData = {
    id: project.slug,
    slug: project.slug,
    appName: project.name,
    tagline: project.hero_title || project.name,
    description: project.hero_description || project.description,
    icon: project.logo_url || "",
    productionUrl: project.production_url || "",
    hero: {
      badge: project.category || "Dự án",
      title: project.hero_title || project.name,
      subtitle: project.hero_description || project.description,
      stats: {
        users: project.hero_stats?.[0]?.value || "100+",
        rating: project.hero_stats?.[1]?.value || "4.9",
        tournaments: project.hero_stats?.[2]?.value || "50+",
      },
      backgroundImage: project.screenshots?.[0]?.url || "",
    },
    branding: {
      primaryColor: "#00d9ff",
      secondaryColor: "#9b87f5",
      accentColor: "#22c55e",
    },
    downloads: {},
    social: {},
    features: project.features?.map((f, i) => ({
      id: String(i),
      title: f.title,
      description: f.description,
      icon: f.icon || "Zap",
    })) || [],
    cta: {
      heading: `Quan tâm đến ${project.name}?`,
      description: "Liên hệ để tìm hiểu thêm về dự án này",
      rating: {
        score: "4.9",
        totalUsers: "100+",
      },
    },
    metadata: {
      createdAt: project.created_at || new Date().toISOString(),
      updatedAt: project.updated_at || new Date().toISOString(),
      status: project.status === "published" ? "published" as const : "draft" as const,
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <AnimatedBackground />

      {/* Floating Action Button - Xem chi tiết */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleViewFullShowcase}
          className="w-14 h-14 rounded-full bg-neon-cyan text-dark-bg flex items-center justify-center shadow-lg shadow-neon-cyan/50 hover:scale-110 transition-transform"
          title={user ? "Xem chi tiết Showcase" : "Đăng nhập để xem Showcase"}
        >
          {user ? <Eye size={24} /> : <LogIn size={24} />}
        </button>
      </div>

      <HeroSection data={landingData} />
      <FeaturesSection data={landingData} showcaseSlug={project.slug} />
      <CTASection data={landingData} />
      <FooterSection />
    </div>
  );
};

export default AppShowcaseDetail;
