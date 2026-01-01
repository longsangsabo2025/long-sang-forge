/**
 * Showcase Components Index
 * Refactored theo Elon Musk Audit - Mỗi component 1 file riêng
 */

// Core Components
export { PhoneMockupCarousel } from "./PhoneMockupCarousel";
export { ProgressBar } from "./ProgressBar";
export { SmartMockupCarousel } from "./SmartMockupCarousel"; // Auto-detect mockup type
export { StatusBadge, getStatusConfig, type ProjectStatus, type StatusConfig } from "./StatusBadge";

// Project Page Components
export { ProjectCTA } from "./ProjectCTA";
export { ProjectHero } from "./ProjectHero";
export { MobileSidebar, ProjectSidebar } from "./ProjectSidebar";

// Premium Components (Split from PremiumShowcaseComponents.tsx)
export { AnimatedCounter } from "./AnimatedCounter";
export { CaseStudyCard } from "./CaseStudyCard";
export { TestimonialsSection } from "./TestimonialsSection";
export { VideoEmbed } from "./VideoEmbed";

// NEW: Interactive Components
export { ProjectFilters } from "./ProjectFilters";
export { RelatedProjects } from "./RelatedProjects";
export { SocialShare } from "./SocialShare";
