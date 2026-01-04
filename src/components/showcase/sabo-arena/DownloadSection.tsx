/**
 * SABO Arena Download Section
 * Ported from sabo-arena-landing
 */
import { motion } from "framer-motion";
import { Apple, Smartphone } from "lucide-react";
import { EditableImage } from "./AdminEditContext";
import { IPhoneFrame } from "./IPhoneFrame";

export const SaboArenaDownloadSection = () => {
  return (
    <section id="download" className="py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="blob-gradient blob-green w-[600px] h-[600px] -bottom-48 -left-48 animate-pulse-glow" />
      <div className="blob-gradient blob-cyan w-[500px] h-[500px] -top-32 -right-48 animate-pulse-glow delay-2000" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12 lg:p-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsla(150, 43%, 18%, 0.3) 0%, hsla(220, 30%, 12%, 0.5) 100%)",
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/10" />

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Content */}
            <div className="text-center lg:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display"
              >
                Sẵn Sàng <span className="text-gradient-gold">Thi Đấu?</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0"
              >
                Tải app miễn phí và tham gia cộng đồng bi-a lớn nhất Việt Nam
              </motion.p>

              {/* App Store Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
                >
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider opacity-70">
                      Download on the
                    </p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
                >
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider opacity-70">GET IT ON</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </a>
              </motion.div>

              {/* QR Code */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 justify-center lg:justify-start"
              >
                <div className="w-20 h-20 bg-foreground rounded-xl flex items-center justify-center p-2">
                  <div className="w-full h-full bg-background rounded-lg grid grid-cols-4 gap-[2px] p-1">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[1px] ${
                          Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quét mã QR</p>
                  <p className="text-sm font-medium text-foreground">để tải app nhanh</p>
                </div>
              </motion.div>
            </div>

            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-radial from-secondary/25 to-transparent animate-pulse-glow" />

              <IPhoneFrame className="w-[240px] md:w-[280px]">
                <EditableImage
                  imageKey="download-phone"
                  defaultSrc="/images/sabo-arena-4.jpg"
                  alt="SABO ARENA App"
                  className="w-full h-full object-cover"
                />
              </IPhoneFrame>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SaboArenaDownloadSection;
