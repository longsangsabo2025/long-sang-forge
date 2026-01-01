/**
 * TestimonialsSection - Hiển thị testimonials từ khách hàng
 * Split từ PremiumShowcaseComponents.tsx theo Elon Musk Audit
 */
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  avatar?: string;
  content: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  title?: string;
  testimonials?: Testimonial[];
}

// Default testimonials
const defaultTestimonials: Testimonial[] = [
  {
    name: "Anh Minh",
    role: "Chủ CLB Bi-a Vũng Tàu",
    content:
      "SABO Arena giúp tôi quản lý giải đấu dễ dàng hơn rất nhiều. Trước đây phải ghi chép bằng tay, giờ mọi thứ đều tự động.",
    rating: 5,
  },
  {
    name: "Chị Lan",
    role: "Người chơi bi-a",
    content:
      "Giao diện đẹp, dễ sử dụng. Tôi có thể theo dõi ranking và lịch thi đấu mọi lúc mọi nơi.",
    rating: 5,
  },
  {
    name: "Anh Tùng",
    role: "Quản lý giải đấu",
    content:
      "Tính năng livestream kết quả realtime rất tuyệt vời. Người chơi và khán giả đều có thể theo dõi trực tiếp.",
    rating: 5,
  },
];

export const TestimonialsSection = ({
  title = "Khách Hàng Nói Gì",
  testimonials = defaultTestimonials,
}: TestimonialsSectionProps) => {
  return (
    <div className="py-8">
      <h3 className="font-display text-2xl font-bold text-foreground mb-8 text-center">{title}</h3>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, idx) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card/50 border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors"
          >
            {/* Quote Icon */}
            <Quote className="w-8 h-8 text-primary/30 mb-4" />

            {/* Content */}
            <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>

            {/* Rating */}
            {testimonial.rating && (
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{testimonial.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
