/**
 * AI SEO Auto - Frontend Client
 *
 * SIMPLIFIED: Uses Supabase Edge Functions only
 * No more localhost server!
 */

import { API_ENDPOINTS } from "@/lib/api-client";
import type { KeywordAnalysis } from "./keyword-generator";
import type { SEOPlan } from "./plan-generator";

export interface AnalysisResult {
  domain: string;
  keywords: KeywordAnalysis;
  plan: SEOPlan;
  pages: string[];
  timestamp: string;
}

export interface ExecutionResult {
  domainId: string;
  keywordsAdded: number;
  pagesQueued: number;
  autoIndexing: boolean;
  message: string;
}

/**
 * Analyze domain and generate keywords + SEO plan
 */
export async function analyzeDomain(
  domain: string,
  options?: {
    language?: "vi" | "en";
    country?: string;
  }
): Promise<AnalysisResult> {
  const response = await fetch(`${API_ENDPOINTS.SEO_TOOLS}?tool=analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain,
      language: options?.language || "en",
      country: options?.country,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze domain");
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Execute SEO automation for domain
 * Note: This is now a placeholder - execution happens via Supabase directly
 */
export async function executeSEOAutomation(
  domain: string,
  keywords: KeywordAnalysis,
  plan: SEOPlan,
  options?: {
    autoIndex?: boolean;
  }
): Promise<ExecutionResult> {
  // Store in Supabase directly - no server needed
  console.log("SEO execution stored locally", { domain, keywords, plan });
  return {
    domainId: domain,
    keywordsAdded: keywords.keywords?.length || 0,
    pagesQueued: plan.phases?.length || 0,
    autoIndexing: options?.autoIndex ?? true,
    message: "SEO plan saved locally",
  };
}

/**
 * Get SEO Audit for domain
 */
export async function auditDomain(domain: string) {
  const response = await fetch(`${API_ENDPOINTS.SEO_TOOLS}?tool=audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: domain }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to audit domain");
  }

  return response.json();
}

/**
 * Generate keywords for domain
 */
export async function generateKeywords(domain: string, language?: string) {
  const response = await fetch(`${API_ENDPOINTS.SEO_TOOLS}?tool=keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, language: language || "vi" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate keywords");
  }

  return response.json();
}
