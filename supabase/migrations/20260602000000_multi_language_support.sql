-- Add detected_language and original_body to tickets table for Multi-Language Support
ALTER TABLE tickets
ADD COLUMN detected_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN original_body TEXT;
