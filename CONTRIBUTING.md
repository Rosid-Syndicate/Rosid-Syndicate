# Contributing

Thank you for helping maintain the Rosid Syndicates Group website. This is a
private corporate codebase; contributions come from the internal team and
approved partners.

## Before you start

1. Read `DESIGN.md` (design system and UI rules) and skim `SECURITY_HARDENING.md`
   (what the API and database enforce).
2. Install Node 20+ and run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the public Supabase values.

## Workflow

1. Branch from `main` (`feature/<topic>` or `fix/<topic>`). Never commit directly to `main`.
2. Make focused changes. Preserve API contracts, RLS semantics and data shapes unless the change is the point.
3. Run the gate before pushing:

   ```bash
   npm run check     # lint + typecheck + route/manifest drift check + API tests
   npm run build     # typecheck, build, prerender
   npm run serve     # optional: QA the built site with Vercel rules at http://localhost:4173
   ```

4. Open a pull request using the template. Describe the user-visible change,
   how you tested it (desktop and mobile), and any manual configuration needed.

## Rules that the tooling enforces

- Every React route must have a `vercel.json` rewrite and, if public, an entry in
  `api/_lib/routes.js`; company/service slugs must match `src/data`.
- No hash-router links (`/#/…`), no `w=3840` image URLs, no `dangerouslySetInnerHTML`.
- ESLint and TypeScript must pass with zero errors.

## Rules that reviewers enforce

- New UI uses the semantic tokens and component classes from `DESIGN.md`.
- Every page renders exactly one `<Seo>`; one `<h1>` per page.
- Forms submit through `/api/*` — the browser never writes to `inquiries` directly.
- Server secrets live only in `api/` and are never `VITE_`-prefixed.
- Content must be verifiable: no invented statistics, certifications, projects or testimonials.
- Database changes ship as a new file in `supabase/migrations/` with rollback notes; never edit applied migrations.

## Commit messages

Present tense, imperative, ≤ 72 characters on the first line, with a body that
explains *why*. Use a scope prefix where helpful: `feat(web):`, `fix(api):`,
`security(db):`, `docs:`, `infra:`.

## Reporting a security issue

Do not open a public issue. Email the group's IT contact (see README) with the
details and, if possible, steps to reproduce.
