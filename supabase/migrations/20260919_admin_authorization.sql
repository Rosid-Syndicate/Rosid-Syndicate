-- ============================================================================
-- ROSID SYNDICATES GROUP — ADMIN AUTHORIZATION HARDENING
-- ============================================================================
--
-- WHY THIS MIGRATION EXISTS
-- -------------------------
-- The previous policies granted FULL access (SELECT/INSERT/UPDATE/DELETE) on
-- every table to the `authenticated` role with `USING (true)`. Supabase Auth
-- on this project has public email sign-ups ENABLED (verified via
-- /auth/v1/settings → disable_signup=false). That combination means any
-- visitor can register an account and immediately read all inquiries (PII),
-- edit/delete blog posts, companies and credentials, and upload files.
--
-- WHAT THIS MIGRATION DOES
-- ------------------------
-- 1. Introduces an explicit admin allow-list (`public.admin_users`).
-- 2. Adds `public.is_admin()` and rewrites every "authenticated" policy to
--    require admin membership.
-- 3. Grandfathers EVERY EXISTING auth user into `admin_users`, so the current
--    admin account(s) keep working. Review the table afterwards and remove
--    anyone who should not be an admin.
-- 4. Narrows table privileges for `anon` to exactly what the public site
--    needs (SELECT on public content, INSERT on inquiries).
-- 5. Adds defensive CHECK constraints on `inquiries` (length limits) so the
--    database enforces the same limits as the API, even if a client bypasses
--    the API.
-- 6. Restricts storage listing so anonymous users can only see files that
--    belong to a credential marked `is_public = true` (prevents enumeration of
--    internal documents through the storage list API).
-- 7. Adds an `increment_post_views` RPC so anonymous readers can bump the
--    view counter without needing an UPDATE policy on `blog_posts`.
-- 8. Adds indexes for the public queries.
--
-- SAFETY
-- ------
-- * No rows are deleted. No columns are dropped. Fully reversible.
-- * Apply in the Supabase SQL editor as the `postgres` role (service role).
-- * ALSO DO THIS IN THE DASHBOARD: Authentication → Providers → Email →
--   turn OFF "Allow new users to sign up". The allow-list below is defence in
--   depth; closing sign-ups removes the attack path entirely.
--
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Admin allow-list
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Grandfather every existing account so nobody is locked out by this change.
-- REVIEW THIS TABLE after applying and remove any account that is not staff.
INSERT INTO public.admin_users (user_id, note)
SELECT id, 'grandfathered by 20260919_admin_authorization'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. is_admin() helper (SECURITY DEFINER so it can read admin_users under RLS)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- Admins may see the allow-list; nobody edits it through the API.
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
CREATE POLICY "Admins can view admin list"
ON public.admin_users FOR SELECT
TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Replace "any authenticated user" policies with admin-only policies
-- ----------------------------------------------------------------------------

-- inquiries: public may INSERT (until the API moves to the service role — see
-- 20260919_inquiries_api_only.sql); only admins may read/update/delete.
DROP POLICY IF EXISTS "Authenticated users have full access to inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins have full access to inquiries" ON public.inquiries;
CREATE POLICY "Admins have full access to inquiries"
ON public.inquiries FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- companies
DROP POLICY IF EXISTS "Authenticated users have full access to companies" ON public.companies;
DROP POLICY IF EXISTS "Admins have full access to companies" ON public.companies;
CREATE POLICY "Admins have full access to companies"
ON public.companies FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- site_content
DROP POLICY IF EXISTS "Authenticated users have full access to site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins have full access to site content" ON public.site_content;
CREATE POLICY "Admins have full access to site content"
ON public.site_content FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- credentials
DROP POLICY IF EXISTS "Authenticated users have full access to credentials" ON public.credentials;
DROP POLICY IF EXISTS "Admins have full access to credentials" ON public.credentials;
CREATE POLICY "Admins have full access to credentials"
ON public.credentials FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- blog_categories
DROP POLICY IF EXISTS "Authenticated users have full access to blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Admins have full access to blog categories" ON public.blog_categories;
CREATE POLICY "Admins have full access to blog categories"
ON public.blog_categories FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- blog_posts
DROP POLICY IF EXISTS "Authenticated users have full access to blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins have full access to blog posts" ON public.blog_posts;
CREATE POLICY "Admins have full access to blog posts"
ON public.blog_posts FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Narrow privileges for the anonymous role.
--    RLS is the primary control, but table privileges are the safety net: a
--    future table created without RLS should NOT be readable by anon.
-- ----------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.blog_categories, public.blog_posts, public.companies,
                public.site_content, public.credentials TO anon;
GRANT INSERT ON public.inquiries TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- `authenticated` keeps broad table privileges; RLS (is_admin) governs access.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ----------------------------------------------------------------------------
-- 5. Database-level input limits for inquiries (defence in depth).
--    NOT VALID: existing rows are not re-checked, so this cannot fail on
--    legacy data; new/updated rows are enforced.
-- ----------------------------------------------------------------------------
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_message_len;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_message_len
    CHECK (char_length(message) BETWEEN 1 AND 6000) NOT VALID;

ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_name_len;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_name_len
    CHECK (char_length(name) BETWEEN 1 AND 160) NOT VALID;

ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_email_format;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_email_format
    CHECK (char_length(email) <= 254 AND position('@' in email) > 1) NOT VALID;

ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_values;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_status_values
    CHECK (status IN ('New', 'Read', 'Contacted', 'Closed')) NOT VALID;

-- Public inserts must always start as 'New'; only admins change status.
DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
CREATE POLICY "Public can insert inquiries"
ON public.inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'New');

-- ----------------------------------------------------------------------------
-- 6. Storage: prevent anonymous enumeration of internal credential files.
--    The bucket stays public (existing public links keep working), but the
--    storage *API* (list / download / signed URL) only exposes objects that
--    belong to a credential flagged is_public = true.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can read credentials files" ON storage.objects;
CREATE POLICY "Public can read credentials files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
    bucket_id = 'credentials_files'
    AND (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.credentials c
            WHERE c.is_public = true AND c.file_url = storage.objects.name
        )
    )
);

DROP POLICY IF EXISTS "Authenticated users can upload credentials files" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage credentials files" ON storage.objects;
CREATE POLICY "Admins manage credentials files"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'credentials_files' AND public.is_admin())
WITH CHECK (bucket_id = 'credentials_files' AND public.is_admin());

-- Recommended follow-up (NOT executed here because it changes how existing
-- public links behave): make the bucket private and rely on signed URLs.
--   UPDATE storage.buckets SET public = false WHERE id = 'credentials_files';

-- ----------------------------------------------------------------------------
-- 7. View counter RPC (anonymous readers cannot UPDATE blog_posts).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_post_views(post_slug TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.blog_posts
    SET views = views + 1
    WHERE slug = post_slug AND is_published = true;
$$;

REVOKE ALL ON FUNCTION public.increment_post_views(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_post_views(TEXT) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 8. Indexes for the public read paths
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS blog_posts_published_idx
    ON public.blog_posts (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx
    ON public.blog_posts (category_slug, is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_created_idx
    ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_status_idx
    ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS credentials_public_idx
    ON public.credentials (is_public, created_at DESC);

COMMIT;

-- ============================================================================
-- POST-APPLY CHECKLIST
-- ============================================================================
-- 1. SELECT u.email, a.created_at FROM public.admin_users a
--      JOIN auth.users u ON u.id = a.user_id;
--    → remove anyone who is not staff:  DELETE FROM public.admin_users WHERE user_id = '...';
-- 2. Dashboard → Authentication → Providers → Email → disable "Allow new users to sign up".
-- 3. Log in to /admin/login and confirm the dashboard still loads data.
-- 4. Submit the public contact form and confirm ONE row appears in inquiries.
-- ============================================================================
