/**
 * Brain API Client - Supabase Direct Version
 * ==========================================
 * ELON MUSK EDITION: Call Supabase directly, no server needed
 */

import type {
  CreateDomainInput,
  Domain,
  IngestKnowledgeInput,
  Knowledge,
  KnowledgeSearchOptions,
  KnowledgeSearchResult,
  UpdateDomainInput,
} from "@/brain/types/brain.types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Default User ID for Longsang Admin
 */
const DEFAULT_USER_ID = "89917901-cf15-45c4-a7ad-8c4c9513347e";

/**
 * Get the current user ID
 */
function getUserId(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("userId");
    if (stored) return stored;
    window.localStorage.setItem("userId", DEFAULT_USER_ID);
  }
  return DEFAULT_USER_ID;
}

/**
 * Brain API Client Class - Direct Supabase calls
 */
export class BrainAPI {
  // ============================================
  // DOMAINS
  // ============================================

  async getDomains(): Promise<Domain[]> {
    const userId = getUserId();
    const { data, error } = await supabase
      .from("brain_domains")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapDomain);
  }

  async getDomain(id: string): Promise<Domain> {
    const { data, error } = await supabase.from("brain_domains").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);
    return this.mapDomain(data);
  }

  async createDomain(input: CreateDomainInput): Promise<Domain> {
    const userId = getUserId();
    const { data, error } = await supabase
      .from("brain_domains")
      .insert({
        name: input.name,
        description: input.description || null,
        icon: input.icon || "📂",
        color: input.color || "#6366f1",
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapDomain(data);
  }

  async updateDomain(id: string, input: UpdateDomainInput): Promise<Domain> {
    const { data, error } = await supabase
      .from("brain_domains")
      .update({
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapDomain(data);
  }

  async deleteDomain(id: string): Promise<void> {
    // Delete all knowledge in domain first
    await supabase.from("brain_knowledge").delete().eq("domain_id", id);

    const { error } = await supabase.from("brain_domains").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ============================================
  // KNOWLEDGE
  // ============================================

  async getKnowledge(domainId: string): Promise<Knowledge[]> {
    const { data, error } = await supabase
      .from("brain_knowledge")
      .select("*")
      .eq("domain_id", domainId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapKnowledge);
  }

  async ingestKnowledge(input: IngestKnowledgeInput): Promise<Knowledge> {
    const userId = getUserId();

    // Generate embedding using Edge Function
    let embedding = null;
    try {
      const { data: embeddingData } = await supabase.functions.invoke("generate-embedding", {
        body: { text: `${input.title}\n\n${input.content}` },
      });
      embedding = embeddingData?.embedding;
    } catch (e) {
      console.warn("Embedding generation failed:", e);
    }

    const { data, error } = await supabase
      .from("brain_knowledge")
      .insert({
        domain_id: input.domainId,
        title: input.title,
        content: input.content,
        source_type: input.sourceType || "manual",
        source_url: input.sourceUrl || null,
        metadata: input.metadata || {},
        embedding: embedding,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapKnowledge(data);
  }

  async updateKnowledge(id: string, input: Partial<IngestKnowledgeInput>): Promise<Knowledge> {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title) updates.title = input.title;
    if (input.content) updates.content = input.content;
    if (input.metadata) updates.metadata = input.metadata;

    // Regenerate embedding if content changed
    if (input.title || input.content) {
      try {
        const { data: embeddingData } = await supabase.functions.invoke("generate-embedding", {
          body: { text: `${input.title || ""}\n\n${input.content || ""}` },
        });
        if (embeddingData?.embedding) {
          updates.embedding = embeddingData.embedding;
        }
      } catch (e) {
        console.warn("Embedding regeneration failed:", e);
      }
    }

    const { data, error } = await supabase
      .from("brain_knowledge")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapKnowledge(data);
  }

  async deleteKnowledge(id: string): Promise<void> {
    const { error } = await supabase.from("brain_knowledge").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ============================================
  // SEARCH (Hybrid: Semantic + Keyword)
  // ============================================

  async searchKnowledge(
    query: string,
    options?: KnowledgeSearchOptions
  ): Promise<KnowledgeSearchResult[]> {
    // Generate embedding for query
    const { data: embeddingData, error: embError } = await supabase.functions.invoke(
      "generate-embedding",
      { body: { text: query } }
    );

    if (embError || !embeddingData?.embedding) {
      console.error("Failed to generate embedding for search");
      return [];
    }

    // Use hybrid_search_knowledge for better results (semantic + keyword)
    const { data, error } = await supabase.rpc("hybrid_search_knowledge", {
      query_text: query,
      query_embedding: embeddingData.embedding,
      match_count: options?.limit || 10,
      semantic_weight: 0.7,
      keyword_weight: 0.3,
      filter_user_id: null,
      filter_category: options?.domainId || null, // domainId maps to category
    });

    if (error) {
      console.error("Hybrid search error:", error);
      // Fallback to old match_knowledge if hybrid fails
      const { data: fallbackData, error: fallbackError } = await supabase.rpc("match_knowledge", {
        query_embedding: embeddingData.embedding,
        match_threshold: options?.threshold || 0.7,
        match_count: options?.limit || 10,
        p_domain_id: options?.domainId || null,
      });

      if (fallbackError) {
        console.error("Fallback search error:", fallbackError);
        return [];
      }

      return (fallbackData || []).map(
        (item: {
          id: string;
          domain_id: string;
          title: string;
          content: string;
          similarity: number;
        }) => ({
          id: item.id,
          domainId: item.domain_id,
          title: item.title,
          content: item.content,
          score: item.similarity,
          highlights: [],
        })
      );
    }

    return (data || []).map(
      (item: {
        id: string;
        title: string;
        content: string;
        context_prefix: string;
        category: string;
        combined_score: number;
        similarity: number;
        keyword_rank: number;
      }) => ({
        id: item.id,
        domainId: item.category || "",
        title: item.title,
        content: item.context_prefix ? `${item.context_prefix}\n\n${item.content}` : item.content,
        score: item.combined_score,
        highlights: [],
        // Extra metadata from hybrid search
        metadata: {
          semanticScore: item.similarity,
          keywordScore: item.keyword_rank,
        },
      })
    );
  }

  // ============================================
  // STATS
  // ============================================

  async getDomainStats(
    domainId: string
  ): Promise<{ knowledgeCount: number; lastUpdated: string | null }> {
    const { count, error } = await supabase
      .from("brain_knowledge")
      .select("*", { count: "exact", head: true })
      .eq("domain_id", domainId);

    if (error) throw new Error(error.message);

    const { data: latest } = await supabase
      .from("brain_knowledge")
      .select("updated_at")
      .eq("domain_id", domainId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    return {
      knowledgeCount: count || 0,
      lastUpdated: latest?.updated_at || null,
    };
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapDomain(row: Record<string, unknown>): Domain {
    return {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string) || "",
      icon: (row.icon as string) || "📂",
      color: (row.color as string) || "#6366f1",
      userId: row.user_id as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapKnowledge(row: Record<string, unknown>): Knowledge {
    return {
      id: row.id as string,
      domainId: row.domain_id as string,
      title: row.title as string,
      content: row.content as string,
      sourceType: (row.source_type as string) || "manual",
      sourceUrl: row.source_url as string | undefined,
      metadata: (row.metadata as Record<string, unknown>) || {},
      embedding: row.embedding ? true : false,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

// Export singleton instance
export const brainAPI = new BrainAPI();
