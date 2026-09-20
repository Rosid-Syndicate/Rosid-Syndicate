-- ============================================================================
-- ROSID SYNDICATES GROUP — STAFF ROLES, TESTIMONIALS, FAQS, MEDIA UPLOADS
-- ============================================================================
-- Builds on 20260919_admin_authorization.sql (apply that first).
--
-- 1. admin_users becomes an email-based staff list with roles:
--      admin  → everything (inquiries, credentials, companies, users, content)
--      editor → content only (blog, categories, testimonials, FAQs, site content)
--    Staff can be added by email BEFORE they have an auth account; the row is
--    linked to auth.users on their first sign-in (link_admin_user RPC).
-- 2. Tables: testimonials, faqs (public read of published rows; staff write).
-- 3. Storage bucket `site-media` for admin uploads (public read, staff write).
-- 4. Safety trigger: the last active admin cannot be removed or demoted.
--
-- No rows are deleted. Idempotent: safe to re-run.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. admin_users → staff list with roles
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

UPDATE public.admin_users SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE public.admin_users ALTER COLUMN id SET NOT NULL;

-- primary key moves from user_id to id so that invited (not yet registered) staff can exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_users_pkey'
             AND conrelid = 'public.admin_users'::regclass
             AND pg_get_constraintdef(oid) LIKE '%(user_id)%') THEN
    ALTER TABLE public.admin_users DROP CONSTRAINT admin_users_pkey;
    ALTER TABLE public.admin_users ADD PRIMARY KEY (id);
  END IF;
END $$;

ALTER TABLE public.admin_users ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('admin', 'editor'));
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_key ON public.admin_users (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_key ON public.admin_users (lower(email)) WHERE email IS NOT NULL;

-- backfill emails for grandfathered accounts
UPDATE public.admin_users a
SET email = u.email
FROM auth.users u
WHERE u.id = a.user_id AND a.email IS NULL;

DROP TRIGGER IF EXISTS set_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Role helpers (SECURITY DEFINER: read admin_users under RLS)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.staff_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT a.role
  FROM public.admin_users a
  WHERE a.is_active
    AND (
      a.user_id = auth.uid()
      OR (a.email IS NOT NULL AND lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  ORDER BY (a.user_id = auth.uid()) DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.staff_role() = 'admin'; $$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.staff_role() IN ('admin', 'editor'); $$;

-- Called by the admin app after sign-in: links an email-invited row to the
-- signed-in auth user. Only touches rows whose email matches the caller.
CREATE OR REPLACE FUNCTION public.link_admin_user()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r TEXT;
BEGIN
  UPDATE public.admin_users
  SET user_id = auth.uid()
  WHERE user_id IS NULL
    AND is_active
    AND email IS NOT NULL
    AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));
  SELECT public.staff_role() INTO r;
  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.staff_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.link_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.staff_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.link_admin_user() TO authenticated;

-- Guard: never remove/deactivate/demote the last active admin.
CREATE OR REPLACE FUNCTION public.protect_last_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  remaining INTEGER;
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin' AND OLD.is_active)
     OR (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND OLD.is_active AND (NEW.role <> 'admin' OR NOT NEW.is_active)) THEN
    SELECT count(*) INTO remaining FROM public.admin_users
    WHERE role = 'admin' AND is_active AND id <> OLD.id;
    IF remaining = 0 THEN
      RAISE EXCEPTION 'At least one active admin must remain.';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_last_admin ON public.admin_users;
CREATE TRIGGER protect_last_admin
BEFORE UPDATE OR DELETE ON public.admin_users
FOR EACH ROW EXECUTE PROCEDURE public.protect_last_admin();

-- admin_users policies: only admins see and manage the staff list
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
DROP POLICY IF EXISTS "Admins manage staff" ON public.admin_users;
CREATE POLICY "Admins manage staff"
ON public.admin_users FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin() AND role IN ('admin', 'editor'));

-- ----------------------------------------------------------------------------
-- 3. Re-scope existing content policies: editors + admins on content tables
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to blog posts" ON public.blog_posts;
CREATE POLICY "Staff manage blog posts" ON public.blog_posts FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins have full access to blog categories" ON public.blog_categories;
CREATE POLICY "Staff manage blog categories" ON public.blog_categories FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins have full access to site content" ON public.site_content;
CREATE POLICY "Staff manage site content" ON public.site_content FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());
-- inquiries, credentials, companies keep their admin-only policies.

-- ----------------------------------------------------------------------------
-- 4. Testimonials
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(160) NOT NULL,
    author_role VARCHAR(160),
    company VARCHAR(200),
    quote TEXT NOT NULL CHECK (char_length(quote) BETWEEN 10 AND 1200),
    photo_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS set_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER set_testimonials_updated_at BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT
TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Staff manage testimonials" ON public.testimonials;
CREATE POLICY "Staff manage testimonials" ON public.testimonials FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE INDEX IF NOT EXISTS testimonials_public_idx ON public.testimonials (is_published, sort_order);

-- ----------------------------------------------------------------------------
-- 5. FAQs (seeded with the questions currently bundled in the site)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question VARCHAR(300) NOT NULL,
    answer TEXT NOT NULL CHECK (char_length(answer) BETWEEN 10 AND 2000),
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS set_faqs_updated_at ON public.faqs;
CREATE TRIGGER set_faqs_updated_at BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP POLICY IF EXISTS "Public can view published faqs" ON public.faqs;
CREATE POLICY "Public can view published faqs" ON public.faqs FOR SELECT
TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Staff manage faqs" ON public.faqs;
CREATE POLICY "Staff manage faqs" ON public.faqs FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE INDEX IF NOT EXISTS faqs_public_idx ON public.faqs (is_published, sort_order);

INSERT INTO public.faqs (question, answer, sort_order)
SELECT q, a, o FROM (VALUES
  ('What services does Rosid Syndicates Group provide?',
   'Construction material supply and civil infrastructure support, public and private tender execution, financial advisory (bank syndication, guarantees, financial closure) and international trade with logistics — all in Nepal, through five operating companies.', 10),
  ('How do you support foreign contractors?',
   'We act as the in-country operational, financial and strategic partner: counter-guarantees and local bank syndication, Public Procurement Act compliance and local representation, and bulk material supply with site logistics.', 20),
  ('Which company handles financial advisory?',
   'Appi Saipal Financial Solutions Pvt. Ltd. provides bank syndication, debt structuring and tripartite assurance for energy and infrastructure projects such as hydropower and transmission lines.', 30),
  ('Do you deliver civil construction directly?',
   'Through Roshan Enterprises and our operating network we coordinate certified material supply, integrated supply-and-build contracts and site execution support for roads, structures and civil works.', 40),
  ('How do I start a conversation about a tender?',
   'Use the tender inquiry form to share the tender reference, scope and deadline (you can attach a PDF, DOCX or XLSX up to 2 MB), or send a message through the contact form. The relevant division replies by email.', 50)
) AS seed(q, a, o)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs);

-- ----------------------------------------------------------------------------
-- 6. Grants for the new tables (anon read-only; authenticated governed by RLS)
-- ----------------------------------------------------------------------------
GRANT SELECT ON public.testimonials, public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials, public.faqs, public.admin_users TO authenticated;

-- ----------------------------------------------------------------------------
-- 7. Media bucket for admin uploads (blog images, testimonial photos)
--    Public read (images are embedded in public pages); staff write only.
--    Size/type limits are also enforced by the bucket configuration.
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-media', 'site-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read site media" ON storage.objects;
CREATE POLICY "Public can read site media" ON storage.objects FOR SELECT
TO anon, authenticated USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Staff manage site media" ON storage.objects;
CREATE POLICY "Staff manage site media" ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'site-media' AND public.is_staff())
WITH CHECK (bucket_id = 'site-media' AND public.is_staff());

COMMIT;

-- ============================================================================
-- POST-APPLY
-- ============================================================================
-- 1. SELECT email, role, is_active, user_id IS NOT NULL AS linked FROM public.admin_users;
--    Confirm your own account is an active admin.
-- 2. Add colleagues from Admin → Users (by email, role). Then create their login
--    in Supabase Authentication → Users → "Add user" (or "Invite"); the row links
--    automatically on their first sign-in.
-- ============================================================================
