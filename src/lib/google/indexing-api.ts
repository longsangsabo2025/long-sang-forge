/**
 * Google Indexing API - Browser-Safe Version
 * All operations must be called through API server
 */

import { supabase } from '@/integrations/supabase/client';

export type IndexingAction = 'URL_UPDATED' | 'URL_DELETED';

export interface IndexingResult {
  url: string;
  action: IndexingAction;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

// ============================================================
// STUB FUNCTIONS - CALL THROUGH API SERVER
// ============================================================

export async function submitUrlToGoogle(
  _url: string,
  _action: IndexingAction = 'URL_UPDATED'
): Promise<IndexingResult> {
  throw new Error('submitUrlToGoogle must be called through API server endpoint: POST /api/google/indexing/submit');
}

export async function batchSubmitUrls(
  _urls: string[],
  _action: IndexingAction = 'URL_UPDATED'
): Promise<IndexingResult[]> {
  throw new Error('batchSubmitUrls must be called through API server endpoint: POST /api/google/indexing/batch-submit');
}

export async function removeUrlFromGoogle(_url: string): Promise<IndexingResult> {
  throw new Error('removeUrlFromGoogle must be called through API server endpoint: POST /api/google/indexing/remove');
}

export async function getIndexingStatus(_url: string) {
  throw new Error('getIndexingStatus must be called through API server endpoint: GET /api/google/indexing/status');
}

export async function autoSubmitNewContent(_contentId: string, _contentType: string) {
  throw new Error('autoSubmitNewContent must be called through API server endpoint: POST /api/google/indexing/auto-submit');
}

export async function getSearchConsoleData(_siteUrl: string) {
  throw new Error('getSearchConsoleData must be called through API server endpoint: GET /api/google/search-console/data');
}

// ============================================================
// WORKING FUNCTIONS - SUPABASE ONLY (SAFE IN BROWSER)
// ============================================================

/**
 * Get indexing statistics from database
 */
export async function getIndexingStats(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('google_indexing_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const total = data?.length || 0;
    const successful = data?.filter(log => log.status === 'success').length || 0;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      recentLogs: data?.slice(0, 10) || [],
    };
  } catch (error) {
    console.error('Error getting indexing stats:', error);
    throw error;
  }
}

/**
 * Get recent indexing logs
 */
export async function getRecentIndexingLogs(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('google_indexing_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent logs:', error);
    throw error;
  }
}

/**
 * Log indexing action to database (internal use)
 */
async function _logIndexingAction(result: IndexingResult) {
  try {
    await supabase.from('google_indexing_logs').insert({
      url: result.url,
      action: result.action,
      status: result.status,
      message: result.message,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('Error logging indexing action:', error);
  }
}
