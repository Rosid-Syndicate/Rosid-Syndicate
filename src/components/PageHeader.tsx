import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { unsplash, unsplashSrcSet } from '../lib/images'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Optional supporting sentence rendered under the title. */
  lead?: string
  image?: string
  backLink?: string
  backLabel?: string
  /** Shorter header for utility pages (forms, policies). */
  compact?: boolean
  /** Use "p" when the page renders its own <h1> (blog post, category). */
  titleAs?: 'h1' | 'p'
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1527335988388-b40ee248d80c'

/**
 * Page hero for inner pages. The photograph is a real <img> with srcset (was a
 * 4K CSS background with `background-attachment: fixed`, which is unsupported on
 * iOS and forces repaints on scroll). Text sits on a solid navy panel so
 * contrast never depends on the photo.
 */
export default function PageHeader({
  title,
  subtitle = 'Rosid Syndicates Group',
  lead,
  image = DEFAULT_IMAGE,
  backLink,
  backLabel = 'Back to home',
  compact = false,
  titleAs = 'h1',
}: PageHeaderProps) {
  const TitleTag = titleAs
  return (
    <section className={`relative bg-ink text-white overflow-hidden ${compact ? 'pt-32 pb-14 lg:pt-36 lg:pb-16' : 'pt-36 pb-20 lg:pt-44 lg:pb-28'}`}>
      <img
        src={unsplash(image, { w: 1600, q: 60 })}
        srcSet={unsplashSrcSet(image, [768, 1200, 1600, 2000], 60)}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden="true" />

      <div className="container relative">
        {backLink && (
          <Link to={backLink} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white mb-8 rounded-sm">
            <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" /> {backLabel}
          </Link>
        )}
        <p className="eyebrow eyebrow-on-dark">{subtitle}</p>
        <TitleTag className={`mt-4 text-white max-w-4xl ${compact ? 'text-h1' : 'text-display'}`}>{title}</TitleTag>
        {lead && <p className="mt-6 max-w-2xl text-lead text-slate-300">{lead}</p>}
      </div>
    </section>
  )
}
