import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const CVContactSection = () => {
  const { language } = useLanguage();

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Animated Background - Same style as Hero */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
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
              className="bg-card border border-border rounded-2xl p-8 hover:border-emerald-500/50 transition-all hover-lift group text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                {language === "vi" ? "Điện thoại" : "Phone"}
              </h3>
              <p className="text-foreground-secondary hover:text-emerald-400 transition-colors text-lg font-semibold">
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
              <p className="text-foreground-secondary text-lg">HCM</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
              <a
                href="https://www.linkedin.com/in/long-sang-75a781357/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 transition-all group"
              >
                <Linkedin className="w-6 h-6 text-blue-500" />
                <span className="font-semibold text-foreground">LinkedIn</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
              </a>

              <a
                href="https://github.com/longsangsabo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-600/10 border border-gray-600/30 rounded-xl hover:bg-gray-600/20 transition-all group"
              >
                <Github className="w-6 h-6 text-foreground" />
                <span className="font-semibold text-foreground">GitHub</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </a>

              <a
                href="https://www.facebook.com/longsang791"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all group"
              >
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-semibold text-foreground">Facebook</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-400" />
              </a>

              <a
                href="mailto:longsangsabo@gmail.com"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/20 transition-all group"
              >
                <Mail className="w-6 h-6 text-primary" />
                <span className="font-semibold text-foreground">Email</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </a>
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
