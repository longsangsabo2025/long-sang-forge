-- Add calendar_event_id column to consultations table
-- This stores the Google Calendar event ID for syncing

ALTER TABLE consultations
ADD COLUMN
IF NOT EXISTS calendar_event_id TEXT;

-- Add index for faster lookups
CREATE INDEX
IF NOT EXISTS idx_consultations_calendar_event_id
ON consultations
(calendar_event_id)
WHERE calendar_event_id IS NOT NULL;

COMMENT ON COLUMN consultations.calendar_event_id IS 'Google Calendar event ID for this consultation';
