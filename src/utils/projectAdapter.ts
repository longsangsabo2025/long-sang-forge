/**
 * Database to Component Adapter
 * Convert database format → legacy component format
 *
 * Vấn đề: Legacy components (OverviewSection, FeaturesGrid, TechArchitecture)
 * expect ProjectData type với LucideIcon components.
 * Database lưu icon dưới dạng string.
 *
 * Giải pháp: Adapter layer để map string → LucideIcon
 */
import type { ProjectData, ProjectFeature, TechStackItem } from "@/data/projects-data";
import type { ProjectShowcase } from "@/hooks/useProjectShowcase";
import {
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Cloud,
  Code,
  Coins,
  Cpu,
  CreditCard,
  Database,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Home,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Rocket,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  Utensils,
  Video,
  Zap,
} from "lucide-react";

// Icon mapping: string → LucideIcon
const ICON_MAP: Record<string, LucideIcon> = {
  // Common
  Users,
  User,
  Trophy,
  Cloud,
  Database,
  Smartphone,
  Zap,
  Shield,
  Target,
  CheckCircle2,
  CheckSquare,
  Clock,
  Calendar,
  Settings,
  Search,
  Home,
  Heart,
  Star,
  Mail,
  Globe,
  Video,
  Code,
  Cpu,

  // Business
  BarChart3,
  Coins,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  LayoutDashboard,

  // Categories
  MapPin,
  MessageSquare,
  MessageCircle,
  Utensils,
  FileText,
  Rocket,

  // AI & Education
  Bot,
  Sparkles,
  GraduationCap,
  Lightbulb,
};

// Default icon if not found
const DEFAULT_ICON: LucideIcon = Zap;

/**
 * Get LucideIcon from string name
 */
export const getIconFromString = (iconName?: string): LucideIcon => {
  if (!iconName) return DEFAULT_ICON;
  return ICON_MAP[iconName] || DEFAULT_ICON;
};

/**
 * Convert ProjectShowcase (database) → ProjectData (legacy components)
 */
export const adaptProjectForLegacy = (project: ProjectShowcase): ProjectData => {
  // Convert hero_stats
  const heroStats = (project.hero_stats || []).map((stat) => ({
    icon: getIconFromString(stat.icon),
    label: stat.label,
    value: stat.value,
    color: stat.color || "neon-cyan",
  }));

  // Convert features with icon mapping
  const features: ProjectFeature[] = (project.features || []).map((feature) => ({
    icon: getIconFromString(feature.icon),
    title: feature.title,
    points: feature.points || [],
    color: (feature.color as "cyan" | "blue" | "green") || "cyan",
  }));

  // Convert tech_stack - use registry for automatic icon lookup
  const techStack: TechStackItem[] = (project.tech_stack || []).map((tech) => ({
    name: tech.name,
    category: tech.category,
    icon: getIconFromString(tech.icon),
    // iconifyIcon sẽ được auto-lookup từ registry trong TechArchitecture component
    iconifyIcon: tech.iconifyIcon,
  }));

  // Tech nodes (simplified - không có trong database, tạo từ tech_stack)
  const techNodes = techStack.slice(0, 6).map((tech, idx) => ({
    id: idx + 1,
    icon: tech.icon,
    label: tech.name,
    x: 20 + (idx % 3) * 30,
    y: 20 + Math.floor(idx / 3) * 40,
    color: ["neon-cyan", "neon-blue", "neon-green"][idx % 3] as
      | "neon-cyan"
      | "neon-blue"
      | "neon-green",
  }));

  return {
    id: typeof project.id === "string" ? parseInt(project.id) || 0 : project.id,
    name: project.name,
    slug: project.slug,
    description: project.description || "",
    progress: project.progress || 0,
    category: project.category || "",
    icon: getIconFromString(project.category), // Use category to guess icon
    productionUrl: project.production_url || undefined,
    screenshots: project.screenshots?.map((s) => (typeof s === "string" ? s : s.url)) || [],
    logoUrl: project.logo_url || undefined,
    status: project.status as "live" | "development" | "planned" | "maintenance",
    statusLabel: undefined,

    // Hero
    heroTitle: project.hero_title || project.name,
    heroDescription: project.hero_description || project.description || "",
    heroStats,

    // Overview
    overviewTitle: project.overview_title || "TỔNG QUAN DỰ ÁN",
    overviewDescription: project.overview_description || project.description || "",
    objectives: project.objectives || [],
    impacts: project.impacts || [],

    // Tech
    techNodes,
    techConnections: [], // Will be generated if needed
    techStack,
    technicalDetails: {
      performance: project.performance || [],
      infrastructure: project.infrastructure || [],
      tools: [], // Optional
    },

    // Features
    features,

    // Metrics
    metrics: project.metrics || [],
    barData: [],
    lineData: [],
  };
};

/**
 * Hook-like helper để convert array
 */
export const adaptProjectsForLegacy = (projects: ProjectShowcase[]): ProjectData[] => {
  return projects.map(adaptProjectForLegacy);
};
