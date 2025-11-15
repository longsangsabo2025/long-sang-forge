import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30" />
      
      {/* Subtle Blur Circle Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Greeting */}
            <p className="text-2xl font-medium text-muted-foreground tracking-wide animate-slide-up animate-delay-100">
              Xin chào, tôi là Long Sang
            </p>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground animate-slide-up animate-delay-200">
              Tôi Xây Dựng
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Giải Pháp AI
              </span>
              <br />
              Mở Rộng Quy Mô
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground animate-slide-up animate-delay-300">
              Full-stack developer chuyên về tự động hóa AI, web3 và ứng dụng doanh nghiệp
            </p>

            {/* Tagline */}
            <p className="text-lg font-medium text-muted-foreground/80 animate-slide-up animate-delay-300">
              Tại Vũng Tàu, Việt Nam 🇻🇳
            </p>

            {/* Latest Work Badge */}
            <button
              onClick={() => scrollToSection("#projects")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary hover:scale-105 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-200 animate-slide-up animate-delay-400"
            >
              ✨ Dự Án Mới Nhất: SABO ARENA
            </button>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up animate-delay-500">
              <Button
                onClick={() => navigate("/consultation")}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground px-8 py-6 rounded-xl text-lg font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📅 Đặt lịch tư vấn miễn phí
              </Button>
              <Button
                onClick={() => scrollToSection("#contact")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl text-lg font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Xem Dự Án
              </Button>
              <Button
                onClick={() => scrollToSection("#projects")}
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                Liên Hệ
              </Button>
              {/* Admin Portal Button - Hidden for production */}
              {/*<Button
                onClick={() => navigate("/admin/login")}
                size="lg"
                variant="secondary"
                className="border border-border/50 px-8 py-6 rounded-xl text-lg font-semibold hover:scale-105 transition-all duration-200"
              >
                Admin Portal
              </Button>*/}
            </div>
          </div>

          {/* Right Side - Profile Image */}
          <div className="flex justify-center lg:justify-end animate-slide-up animate-delay-300">
            <div className="relative w-full max-w-md lg:w-[500px] h-[400px] lg:h-[600px] rounded-2xl overflow-hidden bg-card border border-border/10 animate-float group hover:scale-105 transition-all duration-500 shadow-2xl">
              <img 
                src="/images/avatarpro.png" 
                alt="Long Sang - Software Developer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // Fallback to icon if image not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => scrollToSection("#services")}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group animate-slide-up animate-delay-500"
        >
          <ChevronDown className="w-8 h-8 animate-pulse-soft group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Cuộn để khám phá</span>
        </button>
      </div>
    </section>
  );
};
