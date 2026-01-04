/**
 * Advertising API Client
 * Type-safe API client for advertising platform
 * NOTE: Advertising features require backend implementation
 */

import { EDGE_FUNCTIONS } from "@/config/api";

const API_BASE_URL = EDGE_FUNCTIONS.BASE;

export interface ProductInfo {
  name: string;
  description: string;
  category: string;
  url?: string;
}

export interface CampaignStrategy {
  source: string;
  recommendations: {
    ad_styles: string[];
    messaging: string[];
    formats: string[];
    budget?: number;
  };
}

export interface CreativeVariant {
  variant_id: number;
  ad_style: string;
  image_path: string;
  prompt: string;
}

export interface DeploymentResult {
  success: boolean;
  deployments: Array<{
    platform: string;
    campaign_id: string;
    success: boolean;
  }>;
  errors?: Array<{
    platform: string;
    error: string;
  }>;
}

export interface CampaignMetrics {
  campaign_id: string;
  timestamp: string;
  platforms: {
    facebook?: PlatformMetrics;
    google?: PlatformMetrics;
    tiktok?: PlatformMetrics;
  };
  aggregated: {
    total_impressions: number;
    total_clicks: number;
    total_spend: number;
    total_conversions: number;
    overall_ctr: number;
    overall_cpc: number;
    overall_cpa: number;
  };
}

export type Metrics = CampaignMetrics;

export interface PlatformMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa?: number;
}

export interface BudgetOptimizationResult {
  success: boolean;
  total_budget: number;
  allocations: Array<{
    variant: string;
    allocated_budget: number;
    proportion: number;
    confidence?: number;
  }>;
  actions?: Array<{
    type: string;
    variant: string;
    current_budget: number;
    new_budget: number;
    change_percent: number;
    reason: string;
  }>;
  algorithm: string;
}

class AdvertisingAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generate campaign strategy
   */
  async generateStrategy(
    productInfo: ProductInfo,
    targetAudience?: any
  ): Promise<CampaignStrategy> {
    const response = await fetch(`${this.baseURL}/api/ad-campaigns/generate-strategy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_info: productInfo,
        target_audience: targetAudience || {
          age: "25-45",
          interests: ["lifestyle", "shopping"],
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Strategy generation failed");
    }

    const data = await response.json();
    return data.strategy;
  }

  /**
   * Generate creative variants
   */
  async generateCreatives(
    productInfo: ProductInfo,
    numVariants: number = 3
  ): Promise<CreativeVariant[]> {
    const response = await fetch(`${this.baseURL}/api/ad-campaigns/generate-creatives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_info: productInfo,
        num_variants: numVariants,
      }),
    });

    if (!response.ok) {
      throw new Error("Creative generation failed");
    }

    const data = await response.json();
    return data.variants || [];
  }

  /**
   * Deploy campaign to multiple platforms
   */
  async deployCampaign(config: {
    campaign_name: string;
    product_info: ProductInfo;
    platforms: string[];
    budget?: number;
    creatives: CreativeVariant[];
  }): Promise<DeploymentResult> {
    const response = await fetch(`${this.baseURL}/api/multi-platform/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...config,
        creatives: config.creatives.map((c) => ({
          image_url: c.image_path,
          message: config.product_info.description,
          link: config.product_info.url,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error("Deployment failed");
    }

    return response.json();
  }

  /**
   * Get supported platforms
   */
  async getSupportedPlatforms(): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/api/multi-platform/platforms`);

    if (!response.ok) {
      throw new Error("Failed to get platforms");
    }

    const data = await response.json();
    return data.platforms || [];
  }

  /**
   * Start campaign monitoring
   */
  async startMonitoring(campaignId: string, platforms: string[] = ["facebook"]): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/campaign-monitoring/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign_id: campaignId,
        platforms,
        update_interval: 30000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to start monitoring");
    }

    return response.json();
  }

  /**
   * Stop campaign monitoring
   */
  async stopMonitoring(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/campaign-monitoring/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id: campaignId }),
    });

    if (!response.ok) {
      throw new Error("Failed to stop monitoring");
    }

    return response.json();
  }

  /**
   * Get campaign metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics | null> {
    const response = await fetch(`${this.baseURL}/api/campaign-monitoring/metrics/${campaignId}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  }

  /**
   * Optimize budget allocation
   */
  async optimizeBudget(config: {
    campaign_data: any;
    total_budget: number;
    method?: string;
    auto_apply?: boolean;
  }): Promise<BudgetOptimizationResult> {
    const response = await fetch(`${this.baseURL}/api/budget-reallocation/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...config,
        method: config.method || "thompson_sampling",
      }),
    });

    if (!response.ok) {
      throw new Error("Budget optimization failed");
    }

    return response.json();
  }

  /**
   * Get campaigns list
   */
  async getCampaigns(filters?: {
    status?: string;
    platform?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.platform) params.append("platform", filters.platform);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`${this.baseURL}/api/campaigns?${params}`);

    if (!response.ok) {
      throw new Error("Failed to get campaigns");
    }

    return response.json();
  }

  /**
   * Get campaign statistics summary
   */
  async getCampaignStats(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/campaigns/stats/summary`);

    if (!response.ok) {
      throw new Error("Failed to get campaign stats");
    }

    return response.json();
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update campaign status");
    }

    return response.json();
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete campaign");
    }

    return response.json();
  }

  /**
   * Get unified metrics across platforms
   */
  async getUnifiedMetrics(
    campaignIds: {
      facebook?: string;
      google?: string;
      tiktok?: string;
    },
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      campaign_ids: JSON.stringify(campaignIds),
    });

    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const response = await fetch(`${this.baseURL}/api/multi-platform/metrics?${params}`);

    if (!response.ok) {
      throw new Error("Failed to get unified metrics");
    }

    return response.json();
  }
}

export const advertisingAPI = new AdvertisingAPI();
