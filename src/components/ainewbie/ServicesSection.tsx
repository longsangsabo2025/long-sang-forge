import { EditableText } from "@/components/admin";
import { GlowCard } from "@/components/ui/glow-card";
import { Briefcase, Cpu, Network, Users } from "lucide-react";

const services = [
  {
    icon: Cpu,
    titleKey: "service-1-title",
    title: "Sản Phẩm Số AI",
    descKey: "service-1-desc",
    description:
      "Các giải pháp AI tùy chỉnh, automation tools, và sản phẩm số tiên tiến phục vụ doanh nghiệp",
    features: ["Custom AI Models", "Automation Tools", "API Integration"],
  },
  {
    icon: Network,
    titleKey: "service-2-title",
    title: "Workflow Automation",
    descKey: "service-2-desc",
    description: "Chia sẻ và khám phá các workflow tự động hóa từ cộng đồng AI Việt Nam",
    features: ["Community Sharing", "Ready-to-use Templates", "Custom Workflows"],
  },
  {
    icon: Briefcase,
    titleKey: "service-3-title",
    title: "Dịch Vụ Tư Vấn",
    descKey: "service-3-desc",
    description: "Tư vấn chuyên sâu về tích hợp AI, chuyển đổi số và tối ưu quy trình doanh nghiệp",
    features: ["AI Strategy", "Digital Transformation", "Process Optimization"],
  },
  {
    icon: Users,
    titleKey: "service-4-title",
    title: "Tuyển Dụng & Job Board",
    descKey: "service-4-desc",
    description: "Kết nối nhân tài AI với các cơ hội việc làm trong lĩnh vực công nghệ",
    features: ["Job Posting", "Talent Matching", "Career Development"],
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <EditableText
              textKey="services-title-1"
              defaultText="Dịch Vụ"
              as="span"
              className="glow-text"
            />
            <EditableText textKey="services-title-2" defaultText=" Của Tôi" as="span" />
          </h2>
          <EditableText
            textKey="services-subtitle"
            defaultText="Giải pháp toàn diện cho doanh nghiệp và cộng đồng AI"
            as="p"
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <GlowCard
              key={index}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors glow-box">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>

                <EditableText
                  textKey={service.titleKey}
                  defaultText={service.title}
                  as="h3"
                  className="text-xl font-bold mb-3 text-foreground"
                />
                <EditableText
                  textKey={service.descKey}
                  defaultText={service.description}
                  as="p"
                  className="text-muted-foreground mb-4 flex-grow"
                />

                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-primary/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary glow-box" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
};
