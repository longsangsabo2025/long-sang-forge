/**
 * API Client - Supabase Edge Functions
 * =====================================
 * ELON EDITION: Single source of truth for all API calls
 *
 * All APIs now go through Supabase Edge Functions
 * NO MORE localhost, NO MORE multiple servers!
 */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://diexsbzqwsbpilsymnfb.supabase.co";

// ============================================
// ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Sales & Chat
  salesConsultant: `${SUPABASE_URL}/functions/v1/sales-consultant`,

  // AI Services
  aiAssistant: `${SUPABASE_URL}/functions/v1/ai-services?service=assistant`,
  aiReview: `${SUPABASE_URL}/functions/v1/ai-services?service=review`,

  // SEO Tools
  seoAnalyze: `${SUPABASE_URL}/functions/v1/seo-tools?tool=analyze`,
  seoKeywords: `${SUPABASE_URL}/functions/v1/seo-tools?tool=keywords`,
  seoAudit: `${SUPABASE_URL}/functions/v1/seo-tools?tool=audit`,

  // Existing Supabase Functions
  investment: `${SUPABASE_URL}/functions/v1/investment`,
  projectInterest: `${SUPABASE_URL}/functions/v1/project-interest`,
  sendEmail: `${SUPABASE_URL}/functions/v1/send-email`,
  vnpay: `${SUPABASE_URL}/functions/v1/vnpay`,
  cassoWebhook: `${SUPABASE_URL}/functions/v1/casso-webhook`,
};

// ============================================
// GENERIC FETCH WRAPPER
// ============================================
interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
  [key: string]: unknown;
}

export async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
        ...data,
      };
    }

    return { success: true, ...data };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

// ============================================
// SALES CONSULTANT API
// ============================================
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  userMessage: string;
  messages?: ChatMessage[];
  customerInfo?: {
    userId?: string;
    name?: string;
  };
  source?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  intent?: string;
  suggestedActions?: Array<{
    label: string;
    action: string;
    type: string;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUSD: number;
    model: string;
  };
  credits?: {
    remaining: number;
    limit: number;
  };
  error?: string;
  demo?: boolean;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const result = await apiCall<ChatResponse>(API_ENDPOINTS.salesConsultant, {
    method: "POST",
    body: JSON.stringify(request),
  });
  return result as ChatResponse;
}

export async function getChatCredits(userId: string) {
  return apiCall(`${API_ENDPOINTS.salesConsultant}?path=credits&userId=${userId}`);
}

// ============================================
// AI SERVICES API
// ============================================
export interface AIAssistantRequest {
  lessonId?: string;
  lessonTitle?: string;
  lessonContext?: string;
  messages?: ChatMessage[];
  userMessage: string;
}

export async function sendAIAssistantMessage(request: AIAssistantRequest) {
  return apiCall(API_ENDPOINTS.aiAssistant, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export interface AIReviewRequest {
  submissionId?: string;
  title: string;
  description: string;
  github_url?: string;
  demo_url?: string;
}

export async function requestAIReview(request: AIReviewRequest) {
  return apiCall(API_ENDPOINTS.aiReview, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================
// SEO TOOLS API
// ============================================
export async function analyzeSEO(url: string) {
  return apiCall(API_ENDPOINTS.seoAnalyze, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function extractKeywords(options: { url?: string; text?: string; topic?: string }) {
  return apiCall(API_ENDPOINTS.seoKeywords, {
    method: "POST",
    body: JSON.stringify(options),
  });
}

export async function auditSEO(url: string) {
  return apiCall(API_ENDPOINTS.seoAudit, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

// ============================================
// HEALTH CHECK
// ============================================
export async function checkAPIHealth() {
  const results = await Promise.allSettled([
    fetch(`${API_ENDPOINTS.salesConsultant}?path=health`).then((r) => r.json()),
    fetch(`${SUPABASE_URL}/functions/v1/ai-services?service=health`).then((r) => r.json()),
    fetch(`${SUPABASE_URL}/functions/v1/seo-tools?tool=health`).then((r) => r.json()),
  ]);

  return {
    salesConsultant: results[0].status === "fulfilled" ? results[0].value : { error: "Failed" },
    aiServices: results[1].status === "fulfilled" ? results[1].value : { error: "Failed" },
    seoTools: results[2].status === "fulfilled" ? results[2].value : { error: "Failed" },
  };
}
