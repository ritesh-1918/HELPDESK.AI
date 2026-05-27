-- Migration: Add language detection columns to tickets table
-- Issue #206: Multi-Language Ticket Support

-- Add detected_language column to store the ISO 639-1 language code
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS detected_language TEXT;

-- Add detected_language_name column for human-readable language name
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS detected_language_name TEXT;

-- Add language_confidence column for detection confidence score
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS language_confidence REAL;

-- Create index for filtering tickets by language
CREATE INDEX IF NOT EXISTS idx_tickets_detected_language ON tickets(detected_language);

-- Comment on columns for documentation
COMMENT ON COLUMN tickets.detected_language IS 'ISO 639-1 language code detected from ticket text (e.g., en, hi, te)';
COMMENT ON COLUMN tickets.detected_language_name IS 'Human-readable language name (e.g., English, Hindi, Telugu)';
COMMENT ON COLUMN tickets.language_confidence IS 'Confidence score (0-1) of the language detection';
