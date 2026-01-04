import { EditableText } from "@/components/admin";
import { motion } from "framer-motion";
import { LayoutDashboard, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    titleKey: "feature-1-title",
    title: "Quản Lý Toàn Diện",
    descKey: "feature-1-desc",
    description: "8 hệ thống quản lý tích hợp - từ nhân sự đến thanh toán, đơn hàng đến chấm công",
  },
  {
    icon: Zap,
    titleKey: "feature-2-title",
    title: "Đồng Bộ Thời Gian Thực",
    descKey: "feature-2-desc",
    description: "Mọi thay đổi được cập nhật ngay lập tức trên tất cả thiết bị",
  },
  {
    icon: ShieldCheck,
    titleKey: "feature-3-title",
    title: "Bảo Mật Cao Cấp",
    descKey: "feature-3-desc",
    description: "Phân quyền theo vai trò, bảo vệ dữ liệu với tiêu chuẩn cao nhất",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <EditableText
              textKey="features-title"
              defaultText="Tính Năng Nổi Bật"
              as="span"
              className="gradient-text"
            />
          </h2>
          <EditableText
            textKey="features-subtitle"
            defaultText="Mọi thứ bạn cần để quản lý doanh nghiệp hiệu quả"
            as="p"
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              className="glass-card p-8 rounded-2xl hover:glow-purple transition-shadow cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <EditableText
                textKey={feature.titleKey}
                defaultText={feature.title}
                as="h3"
                className="text-2xl font-bold mb-4 text-foreground"
              />
              <EditableText
                textKey={feature.descKey}
                defaultText={feature.description}
                as="p"
                className="text-muted-foreground leading-relaxed"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
