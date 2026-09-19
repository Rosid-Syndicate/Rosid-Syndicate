-- ============================================================================
-- ROSID SYNDICATES GROUP — OPTIONAL: INQUIRIES WRITABLE ONLY THROUGH THE API
-- ============================================================================
--
-- APPLY THIS ONLY AFTER `SUPABASE_SERVICE_ROLE_KEY` IS CONFIGURED IN VERCEL
-- (Project → Settings → Environment Variables, server-side only — never with
-- a VITE_ prefix). Once the API functions insert with the service role, the
-- public `anon` INSERT policy is no longer needed and removing it guarantees
-- that every lead passes through the API's honeypot, Turnstile, rate limits,
-- validation and duplicate detection.
--
-- If you apply this BEFORE the service-role key exists, the contact and tender
-- forms will fail with "permission denied". Rollback is the CREATE POLICY at
-- the bottom of this file.
-- ============================================================================

BEGIN;

DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
REVOKE INSERT ON public.inquiries FROM anon;

COMMIT;

-- ROLLBACK (re-open direct inserts):
-- GRANT INSERT ON public.inquiries TO anon;
-- CREATE POLICY "Public can insert inquiries" ON public.inquiries
--   FOR INSERT TO anon, authenticated WITH CHECK (status = 'New');
