import costSavings from "@/assets/cost-savings.png";
import customerSatisfaction from "@/assets/customer-satisfaction.png";
import performanceChart from "@/assets/performance-chart.png";
import scalabilityMap from "@/assets/scalability-map.png";
import { EditableImage, EditableText } from "@/components/admin";
import { motion } from "framer-motion";

const benefits = [
  {
    titleKey: "benefit-1-title",
    title: "Tăng 70% Hiệu Quả Vận Hành",
    descKey: "benefit-1-desc",
    description: "Tự động hóa quy trình, giảm thời gian quản lý, tăng năng suất làm việc",
    imageKey: "benefit-1-image",
    image: performanceChart,
    reverse: false,
  },
  {
    titleKey: "benefit-2-title",
    title: "Tiết Kiệm Chi Phí Đáng Kể",
    descKey: "benefit-2-desc",
    description: "Giảm chi phí vận hành, tối ưu nguồn lực, ROI cao trong 6 tháng đầu",
    imageKey: "benefit-2-image",
    image: costSavings,
    reverse: true,
  },
  {
    titleKey: "benefit-3-title",
    title: "Trải Nghiệm Khách Hàng Vượt Trội",
    descKey: "benefit-3-desc",
    description: "Phục vụ nhanh chóng, theo dõi đơn hàng real-time, tăng sự hài lòng",
    imageKey: "benefit-3-image",
    image: customerSatisfaction,
    reverse: false,
  },
  {
    titleKey: "benefit-4-title",
    title: "Sẵn Sàng Mở Rộng",
    descKey: "benefit-4-desc",
    description: "Dễ dàng mở thêm chi nhánh, quản lý đa địa điểm, mở rộng quy mô không giới hạn",
    imageKey: "benefit-4-image",
    image: scalabilityMap,
    reverse: true,
  },
];

export const Benefits = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <EditableText
              textKey="benefits-title"
              defaultText="Lợi Ích Vượt Trội"
              as="span"
              className="gradient-text"
            />
          </h2>
          <EditableText
            textKey="benefits-subtitle"
            defaultText="Kết quả thực tế từ khách hàng sử dụng SABOHUB"
            as="p"
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-24">
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.titleKey}
              className={`flex flex-col ${
                benefit.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              } gap-12 items-center`}
              initial={{ opacity: 0, x: benefit.reverse ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex-1">
                <EditableText
                  textKey={benefit.titleKey}
                  defaultText={benefit.title}
                  as="h3"
                  className="text-3xl md:text-4xl font-bold mb-6 text-foreground"
                />
                <EditableText
                  textKey={benefit.descKey}
                  defaultText={benefit.description}
                  as="p"
                  className="text-xl text-muted-foreground leading-relaxed"
                />
              </div>
              <div className="flex-1">
                <div className="glass-card p-6 rounded-2xl glow-cyan">
                  <EditableImage
                    imageKey={benefit.imageKey}
                    defaultSrc={benefit.image}
                    alt={benefit.title}
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
