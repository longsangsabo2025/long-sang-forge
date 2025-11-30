/**
 * API Configuration
 * Automatically switches between development and production
 */

// Get base API URL based on environment
export const getApiUrl = () => {
  // In production (deployed on Vercel), use the production domain
  if (import.meta.env.PROD) {
    return "https://longsang.org/api";
  }

  // In development, use localhost
  return "http://localhost:3001/api";
};

// Export as constant for convenience
export const API_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  // AI Agents
  AGENTS: {
    EXECUTE: (agentId: string) => `${API_URL}/agents/${agentId}`,
    STATUS: (agentId: string) => `${API_URL}/agents/${agentId}/status`,
    LIST: `${API_URL}/agents`,
  },

  // Google Drive
  DRIVE: {
    FOLDERS: `${API_URL}/drive/folders`,
    UPLOAD: `${API_URL}/drive/upload`,
  },

  // Analytics
  ANALYTICS: `${API_URL}/google/analytics`,

  // Calendar
  CALENDAR: `${API_URL}/google/calendar`,

  // Gmail
  GMAIL: `${API_URL}/google/gmail`,

  // Brain
  BRAIN: {
    DOMAINS: `${API_URL}/brain/domains`,
    DOMAIN: (id: string) => `${API_URL}/brain/domains/${id}`,
    KNOWLEDGE_INGEST: `${API_URL}/brain/knowledge/ingest`,
    KNOWLEDGE_SEARCH: `${API_URL}/brain/knowledge/search`,
    KNOWLEDGE: (id: string) => `${API_URL}/brain/knowledge/${id}`,
  },
};

export default {
  API_URL,
  API_ENDPOINTS,
  getApiUrl,
};
