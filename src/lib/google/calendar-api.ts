/**
 * Google Calendar API - Browser-Safe Version
 * All operations must be called through API server
 */

import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface EventResult {
  status: 'success' | 'error';
  eventId?: string;
  eventLink?: string;
  message: string;
  timestamp: string;
}

// ============================================================
// STUB FUNCTIONS - CALL THROUGH API SERVER
// ============================================================

export async function createCalendarEvent(
  _calendarEmail: string,
  _event: CalendarEvent
): Promise<EventResult> {
  throw new Error('createCalendarEvent must be called through API server endpoint: POST /api/google/calendar/create-event');
}

export async function updateCalendarEvent(
  _calendarEmail: string,
  _eventId: string,
  _updates: Partial<CalendarEvent>
): Promise<EventResult> {
  throw new Error('updateCalendarEvent must be called through API server endpoint: PUT /api/google/calendar/update-event');
}

export async function cancelCalendarEvent(
  _calendarEmail: string,
  _eventId: string
): Promise<EventResult> {
  throw new Error('cancelCalendarEvent must be called through API server endpoint: DELETE /api/google/calendar/cancel-event');
}

export async function listUpcomingEvents(
  _calendarEmail: string,
  _maxResults: number = 10
) {
  throw new Error('listUpcomingEvents must be called through API server endpoint: GET /api/google/calendar/upcoming-events');
}

export async function autoCreateConsultationEvent(_consultationId: string) {
  throw new Error('autoCreateConsultationEvent must be called through API server endpoint: POST /api/google/calendar/consultation-event');
}

export async function syncConsultationsToCalendar() {
  throw new Error('syncConsultationsToCalendar must be called through API server endpoint: POST /api/google/calendar/sync-consultations');
}

// ============================================================
// WORKING FUNCTIONS - SUPABASE ONLY (SAFE IN BROWSER)
// ============================================================

/**
 * Get calendar event statistics from database
 */
export async function getCalendarStats(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const total = data?.length || 0;
    const upcoming = data?.filter(event => 
      new Date(event.start_time) > new Date()
    ).length || 0;
    const past = total - upcoming;

    return {
      total,
      upcoming,
      past,
      recentEvents: data?.slice(0, 10) || [],
    };
  } catch (error) {
    console.error('Error getting calendar stats:', error);
    throw error;
  }
}

/**
 * Get upcoming events from database
 */
export async function getUpcomingEventsFromDB(limit: number = 20) {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    throw error;
  }
}

/**
 * Get event by ID from database
 */
export async function getEventFromDB(eventId: string) {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('google_event_id', eventId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
}
