/**
 * StatusBadge - Hiển thị trạng thái dự án (Live, Development, Planned, Maintenance)
 * Split từ EnhancedProjectShowcase.tsx theo Elon Musk Audit
 */
import { Clock, Rocket, Settings, Wrench } from "lucide-react";

export type ProjectStatus = "live" | "development" | "planned" | "maintenance";

export interface StatusConfig {
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: typeof Rocket;
  pulse: boolean;
}

export const getStatusConfig = (status: ProjectStatus): StatusConfig => {
  switch (status) {
    case "live":
      return {
        color: "bg-green-500",
        textColor: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        label: "Live",
        icon: Rocket,
        pulse: true,
      };
    case "development":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        label: "Development",
        icon: Wrench,
        pulse: false,
      };
    case "planned":
      return {
        color: "bg-gray-500",
        textColor: "text-gray-400",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        label: "Planned",
        icon: Clock,
        pulse: false,
      };
    case "maintenance":
      return {
        color: "bg-orange-500",
        textColor: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        label: "Maintenance",
        icon: Settings,
        pulse: false,
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-400",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        label: "Unknown",
        icon: Clock,
        pulse: false,
      };
  }
};

interface StatusBadgeProps {
  status: ProjectStatus;
  customLabel?: string;
}

export const StatusBadge = ({ status, customLabel }: StatusBadgeProps) => {
  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.textColor}`}>
      <span className={`relative w-2 h-2 ${config.color} rounded-full`}>
        {config.pulse && (
          <span
            className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`}
          />
        )}
      </span>
      {customLabel || config.label}
    </span>
  );
};
