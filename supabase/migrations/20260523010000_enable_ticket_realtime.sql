-- Enable Supabase realtime replication for ticket dashboard updates.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = 'tickets'
    ) THEN
        ALTER TABLE public.tickets REPLICA IDENTITY FULL;

        IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
           AND NOT EXISTS (
                SELECT 1
                FROM pg_publication_tables
                WHERE pubname = 'supabase_realtime'
                  AND schemaname = 'public'
                  AND tablename = 'tickets'
           ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
        END IF;
    END IF;
END $$;
