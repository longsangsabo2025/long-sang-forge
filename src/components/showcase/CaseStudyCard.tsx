/**
 * CaseStudyCard - Hiển thị case study với Problem/Solution/Result
 * Split từ PremiumShowcaseComponents.tsx theo Elon Musk Audit
 */
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";

interface CaseStudyMetric {
  label: string;
  value: string;
}

interface CaseStudyCardProps {
  problem: string;
  solution: string;
  result: string;
  metrics?: CaseStudyMetric[];
}

export const CaseStudyCard = ({ problem, solution, result, metrics }: CaseStudyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          Case Study
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Problem */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-lg bg-red-500/10">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Vấn Đề</h4>
            <p className="text-muted-foreground">{problem}</p>
          </div>
        </div>

        {/* Solution */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Giải Pháp</h4>
            <p className="text-muted-foreground">{solution}</p>
          </div>
        </div>

        {/* Result */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Kết Quả</h4>
            <p className="text-muted-foreground">{result}</p>
          </div>
        </div>

        {/* Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="font-semibold text-foreground mb-4">Số Liệu Nổi Bật</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="text-center p-4 rounded-lg bg-muted/30 border border-border/30"
                >
                  <p className="text-2xl font-bold text-primary">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
