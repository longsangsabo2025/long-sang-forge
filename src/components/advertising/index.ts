/**
 * Advertising Components Export
 * Central export for all advertising components
 */

export { advertisingAPI } from "@/lib/api/advertising-api";
export type {
  BudgetOptimizationResult,
  CampaignMetrics,
  CampaignStrategy,
  CreativeVariant,
  DeploymentResult,
  PlatformMetrics,
  ProductInfo,
} from "@/lib/api/advertising-api";
export { ABTestingDashboard } from "./ABTestingDashboard";
export { AdCampaignGenerator } from "./AdCampaignGenerator";
export { AdvertisingDashboard } from "./AdvertisingDashboard";
export { BudgetOptimizer } from "./BudgetOptimizer";
export { CampaignMonitor } from "./CampaignMonitor";
export { MultiPlatformDeploy } from "./MultiPlatformDeploy";
export { VideoAdGenerator } from "./VideoAdGenerator";
