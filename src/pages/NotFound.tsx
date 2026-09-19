import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Seo from '../components/Seo'

interface NotFoundProps {
  title?: string
  message?: string
  backTo?: string
  backLabel?: string
}

/**
 * Shared "not found" view. Previously unknown URLs were silently redirected to
 * the home page (a soft 404 that search engines penalise and that hides broken
 * links from users). Unknown top-level paths now receive a real HTTP 404 from
 * Vercel (see vercel.json + public/404.html); this component handles dynamic
 * routes whose slug does not exist and is marked noindex.
 */
export default function NotFound({
  title = 'Page not found',
  message = 'The page you requested does not exist or has moved.',
  backTo = '/',
  backLabel = 'Back to home',
}: NotFoundProps) {
  return (
    <section className="min-h-[70vh] flex items-center bg-canvas pt-28 pb-20">
      <Seo title={title} path={typeof window !== 'undefined' ? window.location.pathname : '/404'} noindex />
      <div className="container max-w-2xl">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-h1">{title}</h1>
        <p className="mt-5 text-lead text-muted">{message}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to={backTo} className="btn-primary">
            <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" /> {backLabel}
          </Link>
          <Link to="/#contact" className="btn-secondary">Contact us</Link>
        </div>
        <nav aria-label="Popular pages" className="mt-14 pt-8 border-t border-line">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted mb-4">Popular pages</p>
          <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-8 text-sm">
            <li><Link className="link-arrow" to="/companies">Group companies →</Link></li>
            <li><Link className="link-arrow" to="/infrastructure-tender-services">Foreign contractor support →</Link></li>
            <li><Link className="link-arrow" to="/procurement">Procurement &amp; tenders →</Link></li>
            <li><Link className="link-arrow" to="/blog">Insights &amp; news →</Link></li>
          </ul>
        </nav>
      </div>
    </section>
  )
}
