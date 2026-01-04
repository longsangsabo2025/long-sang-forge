/**
 * API Configuration
 * 100% SERVERLESS - All APIs via Supabase Edge Functions
 * NO MORE LOCALHOST SERVER!
 */

// ============================================
// SUPABASE EDGE FUNCTIONS (Serverless APIs)
// ============================================
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://diexsbzqwsbpilsymnfb.supabase.co";

const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

// Legacy API_URL for backward compatibility (redirects to Edge)
export const API_URL = EDGE_BASE;
export const getApiUrl = () => EDGE_BASE;

// API endpoints - ALL via Supabase Edge Functions
export const API_ENDPOINTS = {
  // AI Chat (Sales Consultant)
  CHAT: {
    SEND: `${EDGE_BASE}/sales-consultant`,
    CREDITS: (userId: string) => `${EDGE_BASE}/sales-consultant?path=credits&userId=${userId}`,
    HEALTH: `${EDGE_BASE}/sales-consultant?path=health`,
  },

  // AI Services (Academy)
  AI_SERVICES: {
    ASSISTANT: `${EDGE_BASE}/ai-services?service=assistant`,
    REVIEW: `${EDGE_BASE}/ai-services?service=review`,
  },

  // SEO Tools
  SEO: {
    ANALYZE: `${EDGE_BASE}/seo-tools?tool=analyze`,
    KEYWORDS: `${EDGE_BASE}/seo-tools?tool=keywords`,
    AUDIT: `${EDGE_BASE}/seo-tools?tool=audit`,
  },

  // Brain Knowledge (via sales-consultant)
  BRAIN: {
    KNOWLEDGE_SEARCH: `${EDGE_BASE}/sales-consultant?path=knowledge`,
  },
};

export const EDGE_FUNCTIONS = {
  // Base URL for Edge Functions
  BASE: EDGE_BASE,

  // Payment
  VNPAY: {
    CREATE_PAYMENT: `${EDGE_BASE}/vnpay/create-payment-url`,
    RETURN: `${EDGE_BASE}/vnpay/return`,
    IPN: `${EDGE_BASE}/vnpay/ipn`,
  },

  // Casso Webhook (Auto payment confirmation)
  CASSO: {
    WEBHOOK: `${EDGE_BASE}/casso-webhook`,
    TEST: `${EDGE_BASE}/casso-webhook/test`,
  },

  // Investment
  INVESTMENT: {
    APPLY: `${EDGE_BASE}/investment/apply`,
    LIST: `${EDGE_BASE}/investment/applications`,
  },

  // Project Interest
  PROJECT_INTEREST: {
    SUBMIT: `${EDGE_BASE}/project-interest/interest`,
    LIST: `${EDGE_BASE}/project-interest/interests`,
  },

  // Credentials
  CREDENTIALS: {
    ENCRYPT: `${EDGE_BASE}/credentials/encrypt`,
    DECRYPT: `${EDGE_BASE}/credentials/decrypt`,
  },

  // Email
  EMAIL: `${EDGE_BASE}/send-email`,

  // Automation
  AUTOMATION: {
    TRIGGER: `${EDGE_BASE}/automation-trigger`,
  },
};

export default {
  API_URL,
  API_ENDPOINTS,
  EDGE_FUNCTIONS,
  getApiUrl,
};
