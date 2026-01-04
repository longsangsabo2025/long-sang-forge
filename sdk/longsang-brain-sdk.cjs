/**
 * LONG SANG BRAIN SDK
 *
 * Sử dụng AI Brain từ bất kỳ ứng dụng nào
 *
 * Installation (trong app khác):
 *   npm install @anthropic-ai/sdk  # hoặc openai
 *   Copy file này vào project
 *
 * Usage:
 *   const brain = require('./longsang-brain-sdk');
 *   const response = await brain.ask('Tôi muốn làm website');
 */

const BRAIN_API_URL = "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant";
const EMBEDDING_API_URL =
  "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/generate-embedding";
const SUPABASE_URL = "https://diexsbzqwsbpilsymnfb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I";

class LongSangBrain {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || BRAIN_API_URL;
    this.conversationHistory = [];
    this.customerInfo = options.customerInfo || null;
  }

  /**
   * Hỏi AI với knowledge từ Brain
   * @param {string} question - Câu hỏi
   * @param {object} options - Tuỳ chọn
   * @returns {Promise<object>} Response từ AI
   */
  async ask(question, options = {}) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: question,
        messages: this.conversationHistory,
        customerInfo: this.customerInfo,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brain API error: ${response.status}`);
    }

    const data = await response.json();

    // Lưu vào history
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
   * Tìm kiếm trong knowledge base (semantic search)
   * @param {string} query - Từ khoá tìm kiếm
   * @param {number} limit - Số kết quả (default 5)
   * @param {string} category - Filter by category (optional)
   * @returns {Promise<array>} Danh sách documents
   */
  async search(query, limit = 5, category = null) {
    // Bước 1: Generate embedding cho query
    const embResponse = await fetch(EMBEDDING_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query }),
    });

    if (!embResponse.ok) {
      throw new Error("Failed to generate embedding");
    }

    const { embedding } = await embResponse.json();

    // Bước 2: Hybrid search (Semantic + Keyword) - Anthropic-style
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
        filter_category: category,
      }),
    });

    if (!searchResponse.ok) {
      // Fallback to old match_knowledge
      console.warn("Hybrid search failed, falling back to semantic-only");
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
      if (!fallbackResponse.ok) throw new Error("Search failed");
      return fallbackResponse.json();
    }

    // Transform results with context_prefix
    const results = await searchResponse.json();
    return results.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.context_prefix ? `${item.context_prefix}\n\n${item.content}` : item.content,
      category: item.category,
      score: item.combined_score,
    }));
  }

  /**
   * Lấy danh sách categories trong brain
   */
  async getCategories() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/knowledge_base?select=category&order=category`,
      {
        headers: { apikey: SUPABASE_ANON_KEY },
      }
    );

    const data = await response.json();
    return [...new Set(data.map((d) => d.category).filter(Boolean))];
  }

  /**
   * Lấy documents theo category
   */
  async getByCategory(category, limit = 10) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/knowledge_base?category=eq.${encodeURIComponent(
        category
      )}&select=id,title,content,source&limit=${limit}`,
      {
        headers: { apikey: SUPABASE_ANON_KEY },
      }
    );
    return response.json();
  }

  /**
   * Reset conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Set customer info
   */
  setCustomer(info) {
    this.customerInfo = info;
  }
}

// Export
module.exports = LongSangBrain;

// ============ USAGE EXAMPLES ============
/*

// 1. Basic usage
const brain = new LongSangBrain();
const response = await brain.ask('Long Sang làm được gì?');
console.log(response.answer);

// 2. With customer info
const brain = new LongSangBrain({
  customerInfo: {
    name: 'Nguyễn Văn A',
    company: 'ABC Corp',
    phone: '0901234567'
  }
});

// 3. Conversation (tự động lưu history)
await brain.ask('Tôi muốn làm website');
await brain.ask('Giá bao nhiêu?'); // AI nhớ context trước đó

// 4. Semantic search
const results = await brain.search('thiết kế website');
console.log(results);

// 5. Get knowledge by category
const categories = await brain.getCategories();
const aiDocs = await brain.getByCategory('ai');

*/
