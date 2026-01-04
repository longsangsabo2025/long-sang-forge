import { EditableText } from "@/components/admin";
import { motion } from "framer-motion";
import { Crown, User, Users } from "lucide-react";

const users = [
  {
    icon: Crown,
    titleKey: "target-1-title",
    title: "CEO/Chủ Doanh Nghiệp",
    features: ["Theo dõi real-time", "Quản lý nhân viên", "Giám sát doanh thu"],
    gradient: "from-primary to-purple",
  },
  {
    icon: Users,
    titleKey: "target-2-title",
    title: "Manager/Quản Lý",
    features: ["Quản lý đội ngũ", "Phân công công việc", "Xử lý đơn hàng"],
    gradient: "from-purple to-secondary",
  },
  {
    icon: User,
    titleKey: "target-3-title",
    title: "Staff/Nhân Viên",
    features: ["Chấm công GPS", "Nhận nhiệm vụ", "Theo dõi lịch"],
    gradient: "from-secondary to-cyan",
  },
];

export const TargetUsers = () => {
  return (
    <section id="target" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <EditableText textKey="target-heading-1" defaultText="Dành Cho " as="span" />
            <EditableText
              textKey="target-heading-2"
              defaultText="Mọi Vai Trò"
              as="span"
              className="gradient-text"
            />
          </h2>
          <EditableText
            textKey="target-subtitle"
            defaultText="Giải pháp phù hợp cho từng vị trí trong tổ chức"
            as="p"
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {users.map((user, index) => (
            <motion.div
              key={user.titleKey}
              className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${user.gradient} flex items-center justify-center mb-6 mx-auto`}
              >
                <user.icon className="w-10 h-10 text-white" />
              </div>
              <EditableText
                textKey={user.titleKey}
                defaultText={user.title}
                as="h3"
                className="text-2xl font-bold mb-6 text-center text-foreground"
              />
              <ul className="space-y-3">
                {user.features.map((feature) => (
                  <li key={feature} className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary/50 border border-primary/80 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
