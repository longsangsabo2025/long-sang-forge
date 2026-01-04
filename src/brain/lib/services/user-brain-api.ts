/**
 * User Brain API Client
 * =====================
 * API for user's personal Second Brain (integrated with subscription plans)
 */

import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://diexsbzqwsbpilsymnfb.supabase.co";

// Helper for raw queries (tables not in generated types)
const rawFrom = (table: string) => supabase.from(table as never);

/**
 * Types for User Brain
 */
export interface UserBrainQuota {
  documentsCount: number;
  queriesCount: number;
  domainsCount: number;
  maxDocuments: number;
  maxQueriesPerMonth: number;
  maxDomains: number;
  planId: string;
  planName: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameVi: string;
  price: number;
  features: {
    brain_domains: number;
    brain_docs_per_domain: number;
    brain_queries_per_month: number;
    [key: string]: unknown;
  };
}

export interface ImportJob {
  id: string;
  userId: string;
  domainId?: string;
  sourceType: "youtube" | "url" | "pdf" | "text";
  sourceUrl?: string;
  sourceTitle?: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  errorMessage?: string;
  documentsCreated: number;
  chunksGenerated: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface BrainChat {
  id: string;
  sessionId: string;
  domainId?: string;
  title: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface ChatResponse {
  response: string;
  knowledge: Array<{ id: string; title: string; similarity: number }>;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  quota: { queriesUsed: number; queriesLimit: number; documentsCount: number } | null;
}

/**
 * User Brain API
 */
export const userBrainAPI = {
  /**
   * Get user's subscription plan with brain limits
   */
  async getUserPlan(userId: string): Promise<SubscriptionPlan | null> {
    // Get user's active subscription from user_subscriptions table
    const { data: subscriptionData } = await rawFrom("user_subscriptions")
      .select("plan_id, plan:subscription_plans(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const subscription = subscriptionData as Record<string, unknown> | null;

    if (subscription?.plan) {
      const plan = subscription.plan as Record<string, unknown>;
      return {
        id: plan.id as string,
        name: plan.name as string,
        nameVi: (plan.name_vi || plan.display_name) as string,
        price: (plan.price || plan.monthly_price || 0) as number,
        features: (plan.features as SubscriptionPlan["features"]) || {
          brain_domains: 0,
          brain_docs_per_domain: 0,
          brain_queries_per_month: 0,
        },
      };
    }

    // Return free plan limits if no subscription
    const { data: freePlan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("name", "free")
      .single();

    if (freePlan) {
      const fp = freePlan as Record<string, unknown>;
      return {
        id: fp.id as string,
        name: fp.name as string,
        nameVi: (fp.name_vi || fp.display_name || "Miễn phí") as string,
        price: (fp.price || fp.monthly_price || 0) as number,
        features: (fp.features as SubscriptionPlan["features"]) || {
          brain_domains: 0,
          brain_docs_per_domain: 0,
          brain_queries_per_month: 0,
        },
      };
    }

    return null;
  },

  /**
   * Initialize quota for user if not exists
   */
  async initializeQuota(userId: string): Promise<void> {
    const monthYear = new Date().toISOString().slice(0, 7);

    // Check if quota exists
    const { data: existing } = await rawFrom("user_brain_quotas")
      .select("id")
      .eq("user_id", userId)
      .eq("month_year", monthYear)
      .single();

    if (!existing) {
      // Get plan limits
      const plan = await this.getUserPlan(userId);
      const limits = plan?.features || {
        brain_domains: 0,
        brain_docs_per_domain: 0,
        brain_queries_per_month: 0,
      };

      // Create quota record
      await rawFrom("user_brain_quotas").insert({
        user_id: userId,
        month_year: monthYear,
        documents_count: 0,
        queries_count: 0,
        domains_count: 0,
        max_documents: limits.brain_docs_per_domain * limits.brain_domains,
        max_queries_per_month: limits.brain_queries_per_month,
        max_domains: limits.brain_domains,
      });
    }
  },

  /**
   * Get current user's quota (combines usage with plan limits)
   */
  async getQuota(userId: string): Promise<UserBrainQuota | null> {
    const monthYear = new Date().toISOString().slice(0, 7);

    // Get plan limits
    const plan = await this.getUserPlan(userId);
    if (!plan) return null;

    const limits = plan.features;

    // Get current usage (auto-initialize if needed)
    let { data: usageData } = await rawFrom("user_brain_quotas")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", monthYear)
      .single();

    // Auto-initialize if not exists
    if (!usageData) {
      await this.initializeQuota(userId);
      const { data } = await rawFrom("user_brain_quotas")
        .select("*")
        .eq("user_id", userId)
        .eq("month_year", monthYear)
        .single();
      usageData = data;
    }

    const usage = usageData as Record<string, unknown> | null;

    return {
      documentsCount: (usage?.documents_count as number) || 0,
      queriesCount: (usage?.queries_count as number) || 0,
      domainsCount: (usage?.domains_count as number) || 0,
      maxDocuments: limits.brain_docs_per_domain * limits.brain_domains,
      maxQueriesPerMonth: limits.brain_queries_per_month,
      maxDomains: limits.brain_domains,
      planId: plan.id,
      planName: plan.nameVi || plan.name,
    };
  },

  /**
   * Get all subscription plans with brain features
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("monthly_price", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return [];
    }

    return (data || []).map((p) => {
      const plan = p as Record<string, unknown>;
      return {
        id: plan.id as string,
        name: plan.name as string,
        nameVi: (plan.name_vi || plan.display_name) as string,
        price: (plan.price || plan.monthly_price || 0) as number,
        features: (plan.features as SubscriptionPlan["features"]) || {
          brain_domains: 0,
          brain_docs_per_domain: 0,
          brain_queries_per_month: 0,
        },
      };
    });
  },

  /**
   * Get user's import jobs
   */
  async getImportJobs(userId: string): Promise<ImportJob[]> {
    const { data, error } = await rawFrom("user_brain_imports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching imports:", error);
      return [];
    }

    return (data || []).map((row) => {
      const j = row as Record<string, unknown>;
      return {
        id: j.id as string,
        userId: j.user_id as string,
        domainId: j.domain_id as string | undefined,
        sourceType: j.source_type as ImportJob["sourceType"],
        sourceUrl: j.source_url as string | undefined,
        sourceTitle: j.source_title as string | undefined,
        status: j.status as ImportJob["status"],
        progress: (j.progress as number) || 0,
        errorMessage: j.error_message as string | undefined,
        documentsCreated: (j.documents_created as number) || 0,
        chunksGenerated: (j.chunks_generated as number) || 0,
        createdAt: j.created_at as string,
        startedAt: j.started_at as string | undefined,
        completedAt: j.completed_at as string | undefined,
      };
    });
  },

  /**
   * Import content from source
   */
  async importContent(params: {
    userId: string;
    domainId?: string;
    sourceType: "youtube" | "url" | "text";
    sourceUrl?: string;
    content?: string;
    title?: string;
  }): Promise<{
    success: boolean;
    importJobId?: string;
    documentsCreated?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/brain-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Import failed" };
      }

      return {
        success: true,
        importJobId: result.importJobId,
        documentsCreated: result.documentsCreated,
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * Chat with brain
   */
  async chat(params: {
    userId: string;
    message: string;
    sessionId?: string;
    domainId?: string;
    messages?: Array<{ role: string; content: string }>;
  }): Promise<ChatResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/brain-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Chat failed");
    }

    return response.json();
  },

  /**
   * Get chat history
   */
  async getChatHistory(userId: string): Promise<BrainChat[]> {
    const { data, error } = await rawFrom("user_brain_chats")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }

    return (data || []).map((row) => {
      const c = row as Record<string, unknown>;
      return {
        id: c.id as string,
        sessionId: c.session_id as string,
        domainId: c.domain_id as string | undefined,
        title: c.title as string,
        messages: (c.messages as BrainChat["messages"]) || [],
        createdAt: c.created_at as string,
        updatedAt: c.updated_at as string,
        lastMessageAt: c.last_message_at as string | undefined,
      };
    });
  },

  /**
   * Delete chat
   */
  async deleteChat(chatId: string): Promise<boolean> {
    const { error } = await rawFrom("user_brain_chats").delete().eq("id", chatId);

    if (error) {
      console.error("Error deleting chat:", error);
      return false;
    }

    return true;
  },

  /**
   * Get user's domains with knowledge count
   */
  async getUserDomains(userId: string): Promise<
    Array<{
      id: string;
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      knowledgeCount: number;
    }>
  > {
    const { data, error } = await rawFrom("brain_domains")
      .select(
        `
        id,
        name,
        description,
        color,
        icon,
        brain_knowledge(count)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching domains:", error);
      return [];
    }

    return (data || []).map((row) => {
      const d = row as Record<string, unknown>;
      const bk = d.brain_knowledge as Array<{ count: number }> | undefined;
      return {
        id: d.id as string,
        name: d.name as string,
        description: d.description as string | undefined,
        color: d.color as string | undefined,
        icon: d.icon as string | undefined,
        knowledgeCount: bk?.[0]?.count || 0,
      };
    });
  },
};
