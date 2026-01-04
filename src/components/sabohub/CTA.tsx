import { EditableText } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Smartphone } from "lucide-react";

export const CTA = () => {
  return (
    <section id="cta" className="py-32 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <EditableText textKey="cta-title-1" defaultText="Sẵn Sàng Cho " as="span" />
            <EditableText
              textKey="cta-title-2"
              defaultText="Doanh Nghiệp Của Bạn"
              as="span"
              className="gradient-text"
            />
          </h2>
          <EditableText
            textKey="cta-subtitle"
            defaultText="SABOHUB - Đối tác đáng tin cậy cho sự phát triển"
            as="p"
            className="text-xl md:text-2xl text-muted-foreground mb-12"
          />

          <Button
            size="lg"
            className="bg-gradient-to-r from-primary/30 to-secondary/30 backdrop-blur-sm text-white hover:from-primary/50 hover:to-secondary/50 transition-all duration-300 text-xl px-12 py-8 h-auto group mb-8 border border-primary/40 hover:border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
          >
            Bắt Đầu Dùng Thử Miễn Phí
            <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
          </Button>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-muted-foreground">
            <a
              href="#"
              className="flex items-center gap-2 hover:text-foreground transition-colors group"
            >
              <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>📱 App Store</span>
            </a>
            <span className="hidden sm:block">|</span>
            <a
              href="#"
              className="flex items-center gap-2 hover:text-foreground transition-colors group"
            >
              <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>🤖 Google Play</span>
            </a>
            <span className="hidden sm:block">|</span>
            <a
              href="#"
              className="flex items-center gap-2 hover:text-foreground transition-colors group"
            >
              <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>🌐 Web App</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
