/**
 * Brain API Client
 * Handles all API calls to the brain endpoints
 */

import type {
  ApiResponse,
  CreateDomainInput,
  Domain,
  DomainListResponse,
  IngestKnowledgeInput,
  Knowledge,
  KnowledgeSearchOptions,
  KnowledgeSearchResponse,
  KnowledgeSearchResult,
  UpdateDomainInput,
} from "@/brain/types/brain.types";
import type {
  BulkOperationResult,
  DomainAnalytics,
  DomainExportData,
  DomainQueryResponse,
  DomainStats,
  DomainSuggestion,
  DomainSummary,
  DomainTrends,
} from "@/brain/types/domain-agent.types";
import type {
  CoreLogic,
  CoreLogicVersion,
  CoreLogicComparison,
  DistillationOptions,
  KnowledgeAnalysisResult,
  KnowledgePattern,
  KeyConcept,
  KnowledgeRelationship,
  KnowledgeTopic,
} from "@/brain/types/core-logic.types";
import { API_URL } from "@/config/api";

/**
 * Default User ID for Longsang Admin
 * This is the primary admin user for the Brain system
 */
const DEFAULT_USER_ID = "89917901-cf15-45c4-a7ad-8c4c9513347e";

/**
 * Get the current user ID
 * Note: This should be replaced with actual auth system integration
 */
function getUserId(): string {
  // Try to get from localStorage first
  if (globalThis.window !== undefined) {
    const stored = globalThis.window.localStorage.getItem("userId");
    if (stored) return stored;
    
    // Store default user ID in localStorage for consistency
    globalThis.window.localStorage.setItem("userId", DEFAULT_USER_ID);
  }
  
  // Return default user ID for Longsang Admin
  return DEFAULT_USER_ID;
}

/**
 * Brain API Client Class
 */
export class BrainAPI {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all domains for the current user
   */
  async getDomains(): Promise<Domain[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch domains" }));
      throw new Error(error.error || "Failed to fetch domains");
    }

    const data: DomainListResponse = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch domains");
    }

    return data.data || [];
  }

  /**
   * Get a domain by ID
   */
  async getDomain(id: string): Promise<Domain> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${id}?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch domain" }));
      throw new Error(error.error || "Failed to fetch domain");
    }

    const data: ApiResponse<Domain> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Domain not found");
    }

    return data.data;
  }

  /**
   * Create a new domain
   */
  async createDomain(input: CreateDomainInput): Promise<Domain> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to create domain" }));
      throw new Error(error.error || "Failed to create domain");
    }

    const data: ApiResponse<Domain> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to create domain");
    }

    return data.data;
  }

  /**
   * Update a domain
   */
  async updateDomain(id: string, input: UpdateDomainInput): Promise<Domain> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to update domain" }));
      throw new Error(error.error || "Failed to update domain");
    }

    const data: ApiResponse<Domain> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to update domain");
    }

    return data.data;
  }

  /**
   * Delete a domain
   */
  async deleteDomain(id: string): Promise<void> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${id}?userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to delete domain" }));
      throw new Error(error.error || "Failed to delete domain");
    }

    const data: ApiResponse<void> = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to delete domain");
    }
  }

  /**
   * Ingest knowledge into the brain
   */
  async ingestKnowledge(input: IngestKnowledgeInput): Promise<Knowledge> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/knowledge/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to ingest knowledge" }));
      throw new Error(error.error || "Failed to ingest knowledge");
    }

    const data: ApiResponse<Knowledge> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to ingest knowledge");
    }

    return data.data;
  }

  /**
   * Search knowledge by text query
   */
  async searchKnowledge(
    query: string,
    options: KnowledgeSearchOptions = {}
  ): Promise<KnowledgeSearchResult[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const params = new URLSearchParams({
      q: query,
      userId,
      ...(options.domainId && { domainId: options.domainId }),
      ...(options.domainIds && { domainIds: options.domainIds.join(",") }),
      ...(options.matchThreshold !== undefined && {
        matchThreshold: options.matchThreshold.toString(),
      }),
      ...(options.matchCount !== undefined && { matchCount: options.matchCount.toString() }),
    });

    const response = await fetch(`${this.baseUrl}/brain/knowledge/search?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to search knowledge" }));
      throw new Error(error.error || "Failed to search knowledge");
    }

    const data: KnowledgeSearchResponse = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to search knowledge");
    }

    return data.data || [];
  }

  /**
   * Get knowledge by ID
   */
  async getKnowledge(id: string): Promise<Knowledge> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/knowledge/${id}?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch knowledge" }));
      throw new Error(error.error || "Failed to fetch knowledge");
    }

    const data: ApiResponse<Knowledge> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Knowledge not found");
    }

    return data.data;
  }

  // ============================================
  // Domain Agent Methods
  // ============================================

  /**
   * Query domain agent
   */
  async queryDomainAgent(question: string, domainId: string): Promise<DomainQueryResponse> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to query domain agent" }));
      throw new Error(error.error || "Failed to query domain agent");
    }

    const data: ApiResponse<DomainQueryResponse> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to query domain agent");
    }

    return data.data;
  }

  /**
   * Auto-tag knowledge
   */
  async autoTagKnowledge(
    knowledge: { title: string; content: string; tags?: string[] },
    domainId: string
  ): Promise<string[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/auto-tag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ knowledge }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to auto-tag" }));
      throw new Error(error.error || "Failed to auto-tag");
    }

    const data: ApiResponse<{ tags: string[] }> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to auto-tag");
    }

    return data.data.tags;
  }

  /**
   * Get domain suggestions
   */
  async getDomainSuggestions(domainId: string, limit = 5): Promise<DomainSuggestion[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(
      `${this.baseUrl}/brain/domains/${domainId}/suggestions?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get suggestions" }));
      throw new Error(error.error || "Failed to get suggestions");
    }

    const data: ApiResponse<DomainSuggestion[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get suggestions");
    }

    return data.data;
  }

  /**
   * Generate domain summary
   */
  async generateDomainSummary(domainId: string): Promise<DomainSummary> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to generate summary" }));
      throw new Error(error.error || "Failed to generate summary");
    }

    const data: ApiResponse<DomainSummary> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to generate summary");
    }

    return data.data;
  }

  // ============================================
  // Domain Statistics Methods
  // ============================================

  /**
   * Get domain statistics
   */
  async getDomainStats(domainId: string, refresh = false): Promise<DomainStats> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(
      `${this.baseUrl}/brain/domains/${domainId}/stats?refresh=${refresh}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get statistics" }));
      throw new Error(error.error || "Failed to get statistics");
    }

    const data: ApiResponse<DomainStats> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get statistics");
    }

    return data.data;
  }

  /**
   * Get domain analytics
   */
  async getDomainAnalytics(domainId: string, days = 30): Promise<DomainAnalytics> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(
      `${this.baseUrl}/brain/domains/${domainId}/analytics?days=${days}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get analytics" }));
      throw new Error(error.error || "Failed to get analytics");
    }

    const data: ApiResponse<DomainAnalytics> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get analytics");
    }

    return data.data;
  }

  /**
   * Get domain trends
   */
  async getDomainTrends(domainId: string): Promise<DomainTrends> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/trends`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get trends" }));
      throw new Error(error.error || "Failed to get trends");
    }

    const data: ApiResponse<DomainTrends> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get trends");
    }

    return data.data;
  }

  // ============================================
  // Bulk Operations Methods
  // ============================================

  /**
   * Bulk ingest knowledge
   */
  async bulkIngestKnowledge(
    knowledge: Array<{
      domainId: string;
      title: string;
      content: string;
      contentType?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }>
  ): Promise<BulkOperationResult> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/knowledge/bulk-ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ knowledge }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to bulk ingest" }));
      throw new Error(error.error || "Failed to bulk ingest");
    }

    const data: ApiResponse<BulkOperationResult> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to bulk ingest");
    }

    return data.data;
  }

  /**
   * Export domain
   */
  async exportDomain(domainId: string, format: "json" | "csv" = "json"): Promise<DomainExportData | string> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/knowledge/domains/${domainId}/export?format=${format}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to export domain" }));
      throw new Error(error.error || "Failed to export domain");
    }

    if (format === "csv") {
      return await response.text();
    }

    const data: ApiResponse<DomainExportData> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to export domain");
    }

    return data.data;
  }

  /**
   * Bulk delete knowledge
   */
  async bulkDeleteKnowledge(ids: string[]): Promise<BulkOperationResult> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/knowledge/bulk`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to bulk delete" }));
      throw new Error(error.error || "Failed to bulk delete");
    }

    const data: ApiResponse<BulkOperationResult> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to bulk delete");
    }

    return data.data;
  }

  /**
   * Bulk update knowledge
   */
  async bulkUpdateKnowledge(
    updates: Array<{
      id: string;
      title?: string;
      content?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }>
  ): Promise<BulkOperationResult> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/knowledge/bulk`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to bulk update" }));
      throw new Error(error.error || "Failed to bulk update");
    }

    const data: ApiResponse<BulkOperationResult> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to bulk update");
    }

    return data.data;
  }

  // ============================================
  // Core Logic Methods
  // ============================================

  /**
   * Distill core logic from domain knowledge
   */
  async distillCoreLogic(domainId: string, options?: DistillationOptions): Promise<CoreLogic> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/core-logic/distill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ options }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to distill core logic" }));
      throw new Error(error.error || "Failed to distill core logic");
    }

    const data: ApiResponse<CoreLogic> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to distill core logic");
    }

    return data.data;
  }

  /**
   * Get core logic for domain
   */
  async getCoreLogic(domainId: string, version?: number): Promise<CoreLogic> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const params = new URLSearchParams({});
    if (version) {
      params.append("version", version.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/brain/domains/${domainId}/core-logic?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get core logic" }));
      throw new Error(error.error || "Failed to get core logic");
    }

    const data: ApiResponse<CoreLogic> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Core logic not found");
    }

    return data.data;
  }

  /**
   * Get all versions for domain
   */
  async getCoreLogicVersions(domainId: string): Promise<CoreLogicVersion[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/core-logic/versions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get versions" }));
      throw new Error(error.error || "Failed to get versions");
    }

    const data: ApiResponse<CoreLogicVersion[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get versions");
    }

    return data.data;
  }

  /**
   * Compare two versions
   */
  async compareCoreLogicVersions(version1Id: string, version2Id: string): Promise<CoreLogicComparison> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/dummy/core-logic/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ version1Id, version2Id }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to compare versions" }));
      throw new Error(error.error || "Failed to compare versions");
    }

    const data: ApiResponse<CoreLogicComparison> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to compare versions");
    }

    return data.data;
  }

  /**
   * Rollback to previous version
   */
  async rollbackCoreLogicVersion(
    domainId: string,
    targetVersion: number,
    reason?: string
  ): Promise<CoreLogic> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/core-logic/rollback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ targetVersion, reason }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to rollback" }));
      throw new Error(error.error || "Failed to rollback");
    }

    const data: ApiResponse<CoreLogic> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to rollback");
    }

    return data.data;
  }

  // ============================================
  // Knowledge Analysis Methods
  // ============================================

  /**
   * Analyze domain knowledge
   */
  async analyzeDomainKnowledge(domainId: string): Promise<KnowledgeAnalysisResult> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to analyze" }));
      throw new Error(error.error || "Failed to analyze");
    }

    const data: ApiResponse<KnowledgeAnalysisResult> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to analyze");
    }

    return data.data;
  }

  /**
   * Get knowledge patterns
   */
  async getKnowledgePatterns(domainId: string): Promise<KnowledgePattern[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/patterns`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get patterns" }));
      throw new Error(error.error || "Failed to get patterns");
    }

    const data: ApiResponse<KnowledgePattern[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get patterns");
    }

    return data.data;
  }

  /**
   * Get key concepts
   */
  async getKeyConcepts(domainId: string): Promise<KeyConcept[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/concepts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get concepts" }));
      throw new Error(error.error || "Failed to get concepts");
    }

    const data: ApiResponse<KeyConcept[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get concepts");
    }

    return data.data;
  }

  /**
   * Get relationships
   */
  async getRelationships(domainId: string): Promise<KnowledgeRelationship[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/relationships`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get relationships" }));
      throw new Error(error.error || "Failed to get relationships");
    }

    const data: ApiResponse<KnowledgeRelationship[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get relationships");
    }

    return data.data;
  }

  /**
   * Get topics
   */
  async getTopics(domainId: string): Promise<KnowledgeTopic[]> {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User ID is required. Please authenticate.");
    }

    const response = await fetch(`${this.baseUrl}/brain/domains/${domainId}/topics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to get topics" }));
      throw new Error(error.error || "Failed to get topics");
    }

    const data: ApiResponse<KnowledgeTopic[]> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to get topics");
    }

    return data.data;
  }
}

// Export singleton instance
export const brainAPI = new BrainAPI();
