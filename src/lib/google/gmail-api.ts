/**
 * Gmail API - Browser-Safe Version
 * All operations must be called through API server
 */

import { supabase } from '@/integrations/supabase/client';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    mimeType: string;
  }>;
}

export interface EmailResult {
  status: 'success' | 'error';
  messageId?: string;
  message: string;
  timestamp: string;
}

// ============================================================
// STUB FUNCTIONS - CALL THROUGH API SERVER
// ============================================================

export async function sendEmail(
  _fromEmail: string,
  _options: EmailOptions
): Promise<EmailResult> {
  throw new Error('sendEmail must be called through API server endpoint: POST /api/google/gmail/send');
}

export async function sendBulkEmails(
  _fromEmail: string,
  _recipients: string[],
  _template: Omit<EmailOptions, 'to'>
): Promise<EmailResult[]> {
  throw new Error('sendBulkEmails must be called through API server endpoint: POST /api/google/gmail/bulk-send');
}

export async function sendConsultationConfirmation(_consultationId: string) {
  throw new Error('sendConsultationConfirmation must be called through API server endpoint: POST /api/google/gmail/consultation-confirmation');
}

export async function sendWeeklyNewsletter() {
  throw new Error('sendWeeklyNewsletter must be called through API server endpoint: POST /api/google/gmail/weekly-newsletter');
}

export async function sendWelcomeEmail(_userEmail: string, _userName: string) {
  throw new Error('sendWelcomeEmail must be called through API server endpoint: POST /api/google/gmail/welcome-email');
}

// ============================================================
// WORKING FUNCTIONS - SUPABASE ONLY (SAFE IN BROWSER)
// ============================================================

/**
 * Get email statistics from database
 */
export async function getEmailStats(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('gmail_logs')
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
    console.error('Error getting email stats:', error);
    throw error;
  }
}

/**
 * Get recent email logs
 */
export async function getRecentEmailLogs(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('gmail_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent email logs:', error);
    throw error;
  }
}

/**
 * Get email templates
 */
export async function getEmailTemplates() {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting email templates:', error);
    throw error;
  }
}
