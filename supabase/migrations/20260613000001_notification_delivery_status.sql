-- Create notification_delivery_status table for tracking email delivery lifecycle
CREATE TABLE IF NOT EXISTS public.notification_delivery_status (
    notification_id UUID PRIMARY KEY REFERENCES public.notifications(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_code TEXT,
    error_message TEXT,
    user_error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.notification_delivery_status ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.notification_delivery_status
    FOR ALL
    USING (auth.role() = 'service_role');

-- Allow users to read their own notification delivery statuses
CREATE POLICY "Users can view own notification delivery status" ON public.notification_delivery_status
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.notifications n
            WHERE n.id = notification_delivery_status.notification_id
            AND n.user_id = auth.uid()
        )
    );

-- Grant privileges
GRANT SELECT ON public.notification_delivery_status TO authenticated;
GRANT ALL ON public.notification_delivery_status TO service_role;
