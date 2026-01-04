/**
 * LONG SANG BRAIN SDK - TypeScript Version
 */

export interface CustomerInfo {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  userId?: string;
}

export interface BrainOptions {
  apiUrl?: string;
  customerInfo?: CustomerInfo;
}

export interface BrainResponse {
  answer: string;
  intent: string;
  suggestedActions: Array<{
    label: string;
    action: string;
    type: "message" | "link";
  }>;
  knowledge?: {
    sources: string[];
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUSD: number;
  };
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source?: string;
  category?: string;
  similarity?: number;
}

const BRAIN_API_URL = "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant";
const EMBEDDING_API_URL =
  "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/generate-embedding";
const SUPABASE_URL = "https://diexsbzqwsbpilsymnfb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export class LongSangBrain {
  private apiUrl: string;
  private conversationHistory: Message[] = [];
  private customerInfo: CustomerInfo | null;

  constructor(options: BrainOptions = {}) {
    this.apiUrl = options.apiUrl || BRAIN_API_URL;
    this.customerInfo = options.customerInfo || null;
  }

  /**
   * Hỏi AI với knowledge từ Brain
   */
  async ask(question: string): Promise<BrainResponse> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: question,
        messages: this.conversationHistory,
        customerInfo: this.customerInfo,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brain API error: ${response.status}`);
    }

    const data = await response.json();

    this.conversationHistory.push(
      { role: "user", content: question },
      { role: "assistant", content: data.response }
    );

    return {
      answer: data.response,
      intent: data.intent,
      suggestedActions: data.suggestedActions,
      knowledge: data.knowledge,
      usage: data.usage,
    };
  }

  /**
   * Hybrid search trong knowledge base (Semantic + Keyword)
   * Uses Anthropic-style Contextual Retrieval for better results
   */
  async search(query: string, limit = 5, category?: string): Promise<KnowledgeDocument[]> {
    const embResponse = await fetch(EMBEDDING_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query }),
    });

    if (!embResponse.ok) {
      throw new Error("Failed to generate embedding");
    }

    const { embedding } = await embResponse.json();

    // Use hybrid_search_knowledge for better results
    const searchResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/hybrid_search_knowledge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        query_text: query,
        query_embedding: embedding,
        match_count: limit,
        semantic_weight: 0.7,
        keyword_weight: 0.3,
        filter_user_id: null,
        filter_category: category || null,
      }),
    });

    if (!searchResponse.ok) {
      // Fallback to old match_knowledge if hybrid fails
      console.warn("Hybrid search failed, falling back to semantic-only search");
      const fallbackResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_knowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          query_embedding: embedding,
          match_threshold: 0.3,
          match_count: limit,
        }),
      });

      if (!fallbackResponse.ok) {
        throw new Error("Search failed");
      }
      return fallbackResponse.json();
    }

    // Transform hybrid results to match expected format
    const results = await searchResponse.json();
    return results.map(
      (item: {
        id: string;
        title: string;
        content: string;
        context_prefix?: string;
        category?: string;
        combined_score: number;
      }) => ({
        id: item.id,
        title: item.title,
        // Prepend context_prefix for better context (Anthropic-style)
        content: item.context_prefix ? `${item.context_prefix}\n\n${item.content}` : item.content,
        category: item.category,
        score: item.combined_score,
      })
    );
  }

  /**
   * Lấy categories
   */
  async getCategories(): Promise<string[]> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/knowledge_base?select=category&order=category`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    );

    const data = await response.json();
    return [
      ...new Set(data.map((d: { category: string }) => d.category).filter(Boolean)),
    ] as string[];
  }

  /**
   * Lấy documents theo category
   */
  async getByCategory(category: string, limit = 10): Promise<KnowledgeDocument[]> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/knowledge_base?category=eq.${encodeURIComponent(
        category
      )}&select=id,title,content,source&limit=${limit}`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    );
    return response.json();
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  setCustomer(info: CustomerInfo): void {
    this.customerInfo = info;
  }

  getHistory(): Message[] {
    return [...this.conversationHistory];
  }
}

export default LongSangBrain;
