// Public, indexable routes. This is the single source of truth for the
// generated sitemap (api/sitemap.js). `npm run check:seo` verifies that these
// entries still match the React routes in src/App.tsx and the company/service
// slugs in src/data and src/pages/ServiceDetail.tsx, so the two cannot drift.

export const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/companies', changefreq: 'monthly', priority: 0.9 },
  { path: '/infrastructure-tender-services', changefreq: 'monthly', priority: 0.9 },
  { path: '/procurement', changefreq: 'monthly', priority: 0.8 },
  { path: '/corporate-profile', changefreq: 'monthly', priority: 0.8 },
  { path: '/group-structure', changefreq: 'monthly', priority: 0.7 },
  { path: '/projects', changefreq: 'monthly', priority: 0.6 },
  { path: '/credentials', changefreq: 'monthly', priority: 0.6 },
  { path: '/tender-inquiry', changefreq: 'monthly', priority: 0.7 },
  { path: '/blog', changefreq: 'weekly', priority: 0.8 },
  { path: '/privacy-policy', changefreq: 'yearly', priority: 0.2 },
  { path: '/terms-conditions', changefreq: 'yearly', priority: 0.2 },
  { path: '/cookie-policy', changefreq: 'yearly', priority: 0.2 },
]

export const COMPANY_SLUGS = [
  'roshan-enterprises',
  'appi-saipal-financial-solutions',
  'kasthamandap-commerce',
  'b-c-exim',
  'deiyougo-enterprises',
]

export const SERVICE_SLUGS = [
  'construction-civil-infrastructure',
  'procurement-tender-execution',
  'financial-advisory',
  'international-trade',
  'supply-chain-logistics',
  'foreign-contractor-support',
  'public-private-partnerships',
]

export const BLOG_CATEGORY_SLUGS = [
  'company-news',
  'infrastructure-construction',
  'financial-advisory',
  'international-trade',
  'foreign-contractors',
]

export function siteUrl() {
  return (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://rosid-sydnicate-company.vercel.app').replace(/\/$/, '')
}
