/**
 * TechIcon Component
 * Hiển thị icon cho tech stack với auto-lookup từ registry
 */

import { getTechColor, getTechIconName } from "@/constants/techIcons";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

interface TechIconProps {
  /** Tên công nghệ (vd: "React", "Flutter", "PostgreSQL") */
  name: string;
  /** Override icon nếu muốn (vd: "logos:react") */
  iconifyIcon?: string;
  /** Kích thước icon */
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom className */
  className?: string;
  /** Có hiển thị glow effect không */
  glow?: boolean;
  /** Có dùng brand color không */
  useBrandColor?: boolean;
}

const sizeMap = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

export function TechIcon({
  name,
  iconifyIcon,
  size = "md",
  className,
  glow = false,
  useBrandColor = false,
}: TechIconProps) {
  const iconName = iconifyIcon || getTechIconName(name);
  const brandColor = useBrandColor ? getTechColor(name) : undefined;

  return (
    <Icon
      icon={iconName}
      className={cn(sizeMap[size], glow && "drop-shadow-[0_0_15px_rgba(0,217,255,0.5)]", className)}
      style={brandColor ? { color: brandColor } : undefined}
    />
  );
}

/**
 * TechBadge Component
 * Badge nhỏ hiển thị tech với icon + name
 */
interface TechBadgeProps {
  name: string;
  category?: string;
  iconifyIcon?: string;
  className?: string;
}

export function TechBadge({ name, category, iconifyIcon, className }: TechBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-muted/50 border border-border/50",
        "hover:bg-muted hover:border-primary/30 transition-colors",
        className
      )}
    >
      <TechIcon name={name} iconifyIcon={iconifyIcon} size="sm" />
      <span className="text-sm font-medium">{name}</span>
      {category && <span className="text-xs text-muted-foreground">({category})</span>}
    </div>
  );
}

/**
 * TechGrid Component
 * Grid hiển thị nhiều tech cùng lúc
 */
interface TechGridProps {
  techs: Array<{
    name: string;
    category?: string;
    iconifyIcon?: string;
  }>;
  columns?: 2 | 3 | 4 | 5;
  size?: "sm" | "md" | "lg";
  showCategory?: boolean;
  className?: string;
}

export function TechGrid({
  techs,
  columns = 4,
  size = "md",
  showCategory = true,
  className,
}: TechGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {techs.map((tech) => (
        <div
          key={tech.name}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-lg",
            "bg-card border border-border/50",
            "hover:border-primary/50 hover:shadow-lg transition-all"
          )}
        >
          <TechIcon name={tech.name} iconifyIcon={tech.iconifyIcon} size={size} glow />
          <div className="text-center">
            <p className="font-medium text-sm">{tech.name}</p>
            {showCategory && tech.category && (
              <p className="text-xs text-muted-foreground">{tech.category}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
