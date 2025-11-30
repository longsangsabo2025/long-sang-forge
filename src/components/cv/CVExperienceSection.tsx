import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Code, Droplet, Factory, Trophy, Wind, Wrench } from "lucide-react";
import { GatedSection } from "./GatedContent";

// Updated with STAR metrics and quantifiable achievements
const experiencesVI = [
  {
    company: "AINewbieVN",
    position: "Lập trình viên Full-stack",
    period: "2023 - Hiện tại",
    description: [
      "Phát triển SABO Arena phục vụ 50+ giải đấu với 200+ players, giảm 80% thời gian quản lý thủ công",
      "Xây dựng 8+ ứng dụng production với React, TypeScript, Node.js và Flutter",
      "Tích hợp AI (GPT-4, Gemini) vào 3 sản phẩm, tự động hóa 60% quy trình thủ công",
      "Triển khai hệ thống real-time với Supabase xử lý 1000+ requests/ngày",
      "Phát triển SaboHub - nền tảng quản lý doanh nghiệp cho 500+ users",
    ],
    skills: ["React", "TypeScript", "Flutter", "Node.js", "PostgreSQL", "AWS", "Tích hợp AI"],
    icon: Code,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-400/20",
    side: "left",
  },
  {
    company: "SABO Billiards",
    position: "Chủ sở hữu & Quản lý",
    period: "04/2023 - Hiện tại",
    description: [
      "Tăng trưởng doanh thu 150% trong năm đầu tiên qua chiến lược marketing số",
      "Quản lý đội ngũ 5 nhân viên, duy trì tỷ lệ hài lòng khách hàng 95%",
      "Tổ chức 100+ giải đấu billiards với 500+ người tham gia",
      "Xây dựng cộng đồng 2000+ followers trên social media",
    ],
    skills: ["Chiến lược kinh doanh", "Quản lý vận hành", "Marketing", "Lãnh đạo nhóm"],
    icon: Trophy,
    iconColor: "text-primary",
    iconBg: "bg-primary/20",
    side: "right",
  },
  {
    company: "PVChem Drilling Mud",
    position: "Kỹ sư Dung dịch khoan",
    period: "07/2022 - 03/2023",
    description: [
      "Quản lý quy trình kiểm soát chất lượng cho 10+ giàn khoan offshore",
      "Tối ưu hóa công thức dung dịch giúp giảm 15% chi phí vật liệu",
      "Đảm bảo 100% tuân thủ tiêu chuẩn an toàn và môi trường",
      "Hỗ trợ kỹ thuật 24/7 cho các hoạt động khoan khẩn cấp",
    ],
    skills: ["Kiểm soát chất lượng", "Quản lý an toàn", "Phân tích kỹ thuật", "Dầu khí"],
    icon: Droplet,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/20",
    side: "left",
  },
  {
    company: "Posco Vietnam",
    position: "Kỹ sư - Bộ phận Tiện ích",
    period: "03/2020 - 04/2022",
    description: [
      "Triển khai thành công ISO 9001:2015 & ISO 14001:2015 cho bộ phận",
      "Thực hiện 20+ đánh giá nội bộ, phát hiện và khắc phục 50+ điểm không phù hợp",
      "Tối ưu hóa quy trình vận hành giúp giảm 10% chi phí năng lượng",
      "Đào tạo 15+ nhân viên về tiêu chuẩn chất lượng và an toàn",
    ],
    skills: ["Tiêu chuẩn ISO", "Tối ưu hóa quy trình", "Bảo trì", "Đảm bảo chất lượng"],
    icon: Factory,
    iconColor: "text-accent",
    iconBg: "bg-accent/20",
    side: "left",
  },
  {
    company: "Daikin Vietnam",
    position: "Kỹ sư Kinh doanh - B2B",
    period: "10/2019 - 02/2020",
    description: [
      "Đạt 100% target doanh số trong 3 tháng thử việc",
      "Phát triển portfolio 10+ khách hàng doanh nghiệp mới",
      "Tư vấn và thiết kế giải pháp HVAC cho dự án trị giá 500+ triệu VNĐ",
      "Thực hiện 30+ khảo sát hiện trường và thuyết trình kỹ thuật",
    ],
    skills: ["Kinh doanh B2B", "Tư vấn kỹ thuật", "Hệ thống HVAC", "Quan hệ khách hàng"],
    icon: Wind,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/20",
    side: "right",
  },
  {
    company: "PVD Training",
    position: "Công nhân - Bảo trì định kỳ",
    period: "09/2019 - 10/2019",
    description: [
      "Hoàn thành chương trình đào tạo an toàn dầu khí với điểm số cao",
      "Tham gia bảo trì thiết bị tại nhà máy lọc dầu Dung Quất",
      "Học hỏi quy trình vận hành thực tế từ các kỹ sư senior",
      "Đạt chứng nhận an toàn lao động ngành dầu khí",
    ],
    skills: ["Bảo trì", "Quy trình an toàn", "Vận hành nhà máy lọc dầu", "Đào tạo thực hành"],
    icon: Wrench,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/20",
    side: "left",
  },
];

// Updated English version with STAR metrics
const experiencesEN = [
  {
    company: "AINewbieVN",
    position: "Full-stack Developer",
    period: "2023 - Present",
    description: [
      "Built SABO Arena serving 50+ tournaments with 200+ players, reducing 80% manual management time",
      "Developed 8+ production applications using React, TypeScript, Node.js, and Flutter",
      "Integrated AI (GPT-4, Gemini) into 3 products, automating 60% of manual workflows",
      "Deployed real-time systems with Supabase handling 1000+ requests/day",
      "Created SaboHub - business management platform serving 500+ users",
    ],
    skills: ["React", "TypeScript", "Flutter", "Node.js", "PostgreSQL", "AWS", "AI Integration"],
    icon: Code,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-400/20",
    side: "left",
  },
  {
    company: "SABO Billiards",
    position: "Owner & Manager",
    period: "04/2023 - Present",
    description: [
      "Achieved 150% revenue growth in first year through digital marketing strategies",
      "Managed team of 5 employees, maintaining 95% customer satisfaction rate",
      "Organized 100+ billiard tournaments with 500+ participants",
      "Built community of 2000+ followers on social media platforms",
    ],
    skills: ["Business Strategy", "Operations Management", "Marketing", "Team Leadership"],
    icon: Trophy,
    iconColor: "text-primary",
    iconBg: "bg-primary/20",
    side: "right",
  },
  {
    company: "PVChem Drilling Mud",
    position: "Drilling Mud Engineer",
    period: "07/2022 - 03/2023",
    description: [
      "Managed quality control processes for 10+ offshore drilling rigs",
      "Optimized mud formulations reducing material costs by 15%",
      "Ensured 100% compliance with safety and environmental standards",
      "Provided 24/7 technical support for emergency drilling operations",
    ],
    skills: ["Quality Control", "Safety Management", "Technical Analysis", "Oil & Gas"],
    icon: Droplet,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/20",
    side: "left",
  },
  {
    company: "Posco Vietnam",
    position: "Engineer - Utilities Section",
    period: "03/2020 - 04/2022",
    description: [
      "Successfully implemented ISO 9001:2015 & ISO 14001:2015 for department",
      "Conducted 20+ internal audits, identified and resolved 50+ non-conformities",
      "Optimized operational processes reducing energy costs by 10%",
      "Trained 15+ employees on quality standards and safety procedures",
    ],
    skills: ["ISO Standards", "Process Optimization", "Maintenance", "Quality Assurance"],
    icon: Factory,
    iconColor: "text-accent",
    iconBg: "bg-accent/20",
    side: "left",
  },
  {
    company: "Daikin Vietnam",
    position: "Sales Engineer - B2B",
    period: "10/2019 - 02/2020",
    description: [
      "Achieved 100% sales target within 3-month probation period",
      "Developed portfolio of 10+ new enterprise clients",
      "Consulted and designed HVAC solutions for projects worth 500M+ VND",
      "Conducted 30+ site surveys and technical presentations",
    ],
    skills: ["B2B Sales", "Technical Consulting", "HVAC Systems", "Client Relations"],
    icon: Wind,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/20",
    side: "right",
  },
  {
    company: "PVD Training",
    position: "Worker - Periodic Maintenance",
    period: "09/2019 - 10/2019",
    description: [
      "Completed oil & gas safety training program with high scores",
      "Participated in equipment maintenance at Dung Quat refinery",
      "Learned hands-on operational procedures from senior engineers",
      "Earned occupational safety certification for oil & gas industry",
    ],
    skills: ["Maintenance", "Safety Procedures", "Refinery Operations", "Hands-on Training"],
    icon: Wrench,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/20",
    side: "left",
  },
];

const CVExperienceSection = () => {
  const { t, language } = useLanguage();
  const experiences = language === "vi" ? experiencesVI : experiencesEN;
  return (
    <section id="experience" className="section-padding bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <p className="text-sm text-primary font-medium">{t("experience.badge")}</p>
          </div>

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
            {t("experience.title")}
          </h2>

          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Hơn 5 năm kinh nghiệm đa dạng trong Dầu khí, Sản xuất và Quản lý Kinh doanh
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent hidden lg:block" />

          {/* Experience Items */}
          <div className="space-y-12">
            {experiences.map((exp) => (
              <div
                key={exp.company}
                className={`relative flex items-center ${
                  exp.side === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
                } flex-col gap-8`}
              >
                {/* Content Card */}
                <div
                  className={`lg:w-[calc(50%-3rem)] w-full ${
                    exp.side === "left" ? "lg:text-right" : "lg:text-left"
                  }`}
                >
                  <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card hover:shadow-elevated hover:border-primary/50 transition-all hover-lift group">
                    {/* Company & Logo */}
                    <div
                      className={`flex items-center gap-4 mb-4 ${
                        exp.side === "left"
                          ? "lg:flex-row-reverse lg:justify-end"
                          : "lg:justify-start"
                      } justify-start`}
                    >
                      <div
                        className={`w-16 h-16 rounded-xl ${
                          exp.iconBg
                        } border-2 border-${exp.iconColor.replace(
                          "text-",
                          ""
                        )}/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all`}
                      >
                        <exp.icon className={`w-8 h-8 ${exp.iconColor}`} />
                      </div>
                      <div className={exp.side === "left" ? "lg:text-right" : "lg:text-left"}>
                        <h3 className="text-2xl font-heading font-bold text-foreground mb-1">
                          {exp.company}
                        </h3>
                        <p className="text-lg text-primary font-semibold">{exp.position}</p>
                      </div>
                    </div>

                    {/* Period */}
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4 ${
                        exp.side === "left" ? "lg:float-right lg:ml-4" : ""
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{exp.period}</span>
                    </div>

                    {/* Description - Hidden when not logged in */}
                    <div
                      className={`mb-6 clear-both ${
                        exp.side === "left" ? "lg:text-right" : "lg:text-left"
                      } text-left`}
                    >
                      <GatedSection
                        itemCount={exp.description.length}
                        ctaText="thành tựu"
                        align={exp.side === "left" ? "right" : "left"}
                      >
                        <ul className="space-y-2">
                          {exp.description.map((item, i) => (
                            <li
                              key={`${exp.company}-desc-${i}`}
                              className="text-foreground-secondary flex items-start gap-2"
                            >
                              <span
                                className={`text-primary mt-1 ${
                                  exp.side === "left" ? "lg:order-2" : ""
                                }`}
                              >
                                •
                              </span>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </GatedSection>
                    </div>

                    {/* Skills Tags */}
                    <div
                      className={`flex flex-wrap gap-2 ${
                        exp.side === "left" ? "lg:justify-end" : "lg:justify-start"
                      } justify-start`}
                    >
                      {exp.skills.map((skill, i) => (
                        <span
                          key={`${exp.company}-skill-${i}`}
                          className="px-3 py-1 bg-muted border border-border rounded-full text-xs font-medium text-foreground hover:border-primary/50 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary border-4 border-background shadow-glow z-10" />

                {/* Empty Space for Zigzag */}
                <div className="hidden lg:block lg:w-[calc(50%-3rem)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CVExperienceSection;
