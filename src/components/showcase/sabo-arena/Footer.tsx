/**
 * SABO Arena Footer
 * Ported from sabo-arena-landing
 */
import { Facebook, Mail, MessageCircle } from "lucide-react";

const footerLinks = [
  { label: "Tính năng", href: "#features" },
  { label: "Giải đấu", href: "#formats" },
  { label: "Hỗ trợ", href: "#" },
  { label: "Liên hệ", href: "#" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: MessageCircle, href: "#", label: "Zalo" },
];

export const SaboArenaFooter = () => {
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="section-container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <img
                src="/images/logoxoaphong.png"
                alt="SABO Arena Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-foreground">
                SABO <span className="text-gradient-cyan">ARENA</span>
              </span>
            </a>
            <p className="text-muted-foreground max-w-sm">
              Nền tảng thi đấu bi-a chuyên nghiệp hàng đầu Việt Nam. Kết nối cộng đồng, nâng cao kỹ
              năng.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Liên kết</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Kết nối</h4>
            <div className="flex gap-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-card/50 hover:bg-primary/20 flex items-center justify-center transition-colors duration-300"
                >
                  <social.icon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </a>
              ))}
            </div>
            <a
              href="mailto:support@saboarena.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">support@saboarena.com</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 SABO ARENA. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors duration-300">
              Điều khoản sử dụng
            </a>
            <a href="#" className="hover:text-foreground transition-colors duration-300">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SaboArenaFooter;
