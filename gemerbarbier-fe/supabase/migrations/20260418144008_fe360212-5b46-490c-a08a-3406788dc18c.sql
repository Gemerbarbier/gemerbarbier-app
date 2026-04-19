
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'email_queue' AND policyname = 'Deny all client access to email_queue'
  ) THEN
    CREATE POLICY "Deny all client access to email_queue"
      ON public.email_queue
      AS RESTRICTIVE
      FOR ALL
      TO anon, authenticated
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;
