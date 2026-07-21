-- Migration for Issue 205: AI-Powered SLA Breach Predictor
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS sla_deadline timestamptz,
ADD COLUMN IF NOT EXISTS predicted_breach boolean DEFAULT false;
