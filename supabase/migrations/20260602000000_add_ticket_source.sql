-- Add source column to tickets table to track submission method
ALTER TABLE public.tickets ADD COLUMN source text DEFAULT 'text';
