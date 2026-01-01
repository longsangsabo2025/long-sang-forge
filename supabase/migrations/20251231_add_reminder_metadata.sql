-- Add reminder_metadata column to consultations table
-- This column tracks reminder email status

ALTER TABLE consultations
ADD COLUMN
IF NOT EXISTS reminder_metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN consultations.reminder_metadata IS 'Tracks reminder emails sent: { sent_24h_reminder: boolean, sent_24h_at: timestamp, sent_1h_reminder: boolean, sent_1h_at: timestamp }';
