-- Multi-Language Ticket Support with Auto-Detection and Translation Pipeline
-- Adds language detection and translation support for non-English tickets

-- Add enable_translation column to system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS enable_translation boolean NOT NULL DEFAULT true;

-- Add detected_language and original_text to tickets table for multilingual support
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS detected_language text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS original_text text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS translated_from text;

-- Create index for language-based queries
CREATE INDEX IF NOT EXISTS idx_tickets_detected_language
    ON tickets(detected_language)
    WHERE detected_language IS NOT NULL AND detected_language != 'en';

-- Add comments for documentation
COMMENT ON COLUMN system_settings.enable_translation IS 'Enable automatic language detection and translation for non-English tickets';
COMMENT ON COLUMN tickets.detected_language IS 'ISO 639-1 language code detected from ticket text (e.g., es, fr, hi)';
COMMENT ON COLUMN tickets.original_text IS 'Original text before translation (for non-English tickets)';
COMMENT ON COLUMN tickets.translated_from IS 'Original language name for display purposes (e.g., Spanish, Hindi)';

-- Supported languages (for reference)
-- English (en), Spanish (es), French (fr), German (de), Italian (it), Portuguese (pt), 
-- Russian (ru), Chinese (zh), Japanese (ja), Korean (ko), Arabic (ar), Hindi (hi),
-- Dutch (nl), Polish (pl), Turkish (tr)
