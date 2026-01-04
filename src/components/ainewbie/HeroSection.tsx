import heroHologram from "@/assets/ainewbie/hero-hologram.jpg";
import { EditableImage, EditableText } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid"
    >
      {/* Removed solid background - now uses parent's neural network background */}

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-cyan/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-blue/20 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm glow-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">AI Technology Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <EditableText
                textKey="hero-title-1"
                defaultText="AINewbieVN"
                as="span"
                className="glow-text"
              />
              <br />
              <EditableText
                textKey="hero-title-2"
                defaultText="Cộng Đồng AI"
                as="span"
                className="text-foreground/80"
              />
              <br />
              <EditableText
                textKey="hero-title-3"
                defaultText="Việt Nam"
                as="span"
                className="text-primary"
              />
            </h1>

            <EditableText
              textKey="hero-subtitle"
              defaultText="Nền tảng sản phẩm số AI, workflow tự động hóa, và kết nối nhân tài công nghệ cho người Việt"
              as="p"
              className="text-xl text-muted-foreground max-w-xl"
            />

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-primary/30 backdrop-blur-sm hover:bg-primary/50 text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] group border border-primary/50 hover:border-primary/70 transition-all duration-300"
              >
                Khám Phá Ngay
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-foreground hover:bg-primary/10 hover:border-primary"
              >
                Tìm Hiểu Thêm
              </Button>
            </div>

            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary glow-text">5000+</div>
                <div className="text-sm text-muted-foreground">Thành viên</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary glow-text">1200+</div>
                <div className="text-sm text-muted-foreground">Workflows</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary glow-text">300+</div>
                <div className="text-sm text-muted-foreground">Dự án</div>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden glow-box">
              <EditableImage
                imageKey="hero-image"
                defaultSrc={heroHologram}
                alt="AI Technology Hologram"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 border-2 border-primary/30 rounded-full animate-spin-slow" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 border-2 border-primary/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};
