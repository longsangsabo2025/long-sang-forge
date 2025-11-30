import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, ExternalLink, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const CVContactSection = () => {
  const { language } = useLanguage();

  // Simple contact section - no form needed for CV
  const handleDownloadCV = () => {
    // TODO: Replace with actual PDF URL
    alert(
      language === "vi"
        ? "Tính năng tải CV đang được cập nhật. Vui lòng liên hệ qua email để nhận CV PDF."
        : "CV download feature is being updated. Please contact via email to receive PDF CV."
    );
  };

  return (
    <section
      id="contact"
      className="section-padding bg-background-secondary relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-heading font-black text-gradient-gold">
            {language === "vi" ? "Liên Hệ" : "Get In Touch"}
          </h2>

          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
            {language === "vi"
              ? "Sẵn sàng hợp tác cho các dự án thú vị. Hãy liên hệ qua các kênh bên dưới!"
              : "Ready to collaborate on exciting projects. Reach out through the channels below!"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Email */}
            <a
              href="mailto:longsangsabo@gmail.com"
              className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all hover-lift group text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">Email</h3>
              <p className="text-foreground-secondary hover:text-primary transition-colors break-all text-sm">
                longsangsabo@gmail.com
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "vi" ? "Phản hồi trong 24h" : "Reply within 24h"}
              </p>
            </a>

            {/* Phone */}
            <a
              href="tel:+84961167717"
              className="bg-card border border-border rounded-2xl p-8 hover:border-secondary/50 transition-all hover-lift group text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                {language === "vi" ? "Điện thoại" : "Phone"}
              </h3>
              <p className="text-foreground-secondary hover:text-secondary transition-colors text-lg font-semibold">
                +84 961 167 717
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "vi" ? "Zalo / WhatsApp" : "Zalo / WhatsApp"}
              </p>
            </a>

            {/* Location */}
            <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent/50 transition-all hover-lift group text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                {language === "vi" ? "Địa điểm" : "Location"}
              </h3>
              <p className="text-foreground-secondary text-lg">Vũng Tàu</p>
              <p className="text-xs text-muted-foreground mt-2">Vietnam (UTC+7)</p>
            </div>
          </div>

          {/* Social Links & CTA */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-elevated">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                {language === "vi" ? "Kết nối với tôi" : "Connect With Me"}
              </h3>
              <p className="text-foreground-secondary">
                {language === "vi"
                  ? "Xem thêm về công việc và dự án của tôi"
                  : "Learn more about my work and projects"}
              </p>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <a
                href="https://linkedin.com/in/longsang"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 transition-all group"
              >
                <Linkedin className="w-6 h-6 text-blue-500" />
                <span className="font-semibold text-foreground">LinkedIn</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
              </a>

              <a
                href="https://github.com/longsang"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-600/10 border border-gray-600/30 rounded-xl hover:bg-gray-600/20 transition-all group"
              >
                <Github className="w-6 h-6 text-foreground" />
                <span className="font-semibold text-foreground">GitHub</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </a>

              <a
                href="mailto:longsangsabo@gmail.com"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/20 transition-all group"
              >
                <Mail className="w-6 h-6 text-primary" />
                <span className="font-semibold text-foreground">Email</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </a>

              <Button
                onClick={handleDownloadCV}
                variant="outline"
                className="flex items-center justify-center gap-3 px-6 py-4 h-auto bg-secondary/10 border border-secondary/30 hover:bg-secondary/20"
              >
                <Download className="w-6 h-6 text-secondary" />
                <span className="font-semibold">CV PDF</span>
              </Button>
            </div>

            {/* Availability Status */}
            <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold text-green-400">
                  {language === "vi"
                    ? "Hiện đang nhận dự án mới"
                    : "Currently available for new projects"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "vi"
                  ? "Freelance, Part-time hoặc Collaboration"
                  : "Freelance, Part-time or Collaboration"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CVContactSection;
