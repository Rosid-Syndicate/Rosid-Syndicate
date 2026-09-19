import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { sectors } from '../data/sectors'
import { unsplash, unsplashSrcSet } from '../lib/images'

/**
 * Sector grid (home). Cards link to the relevant capability or company page.
 */
export default function Projects() {
  return (
    <section id="projects" className="py-20 lg:py-28 bg-surface border-y border-line" aria-labelledby="sectors-heading">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="eyebrow">Sectors</p>
            <h2 id="sectors-heading" className="mt-5 text-h2">Where the group operates.</h2>
          </div>
          <Link to="/projects" className="link-arrow shrink-0">
            Sector overview <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sectors.map((s) => (
            <li key={s.slug} className={s.span === 'wide' ? 'md:col-span-2' : ''}>
              <Link to={s.to} className="group relative block h-72 lg:h-80 overflow-hidden rounded-sm bg-ink focus-visible:ring-2 focus-visible:ring-accent">
                <img
                  src={unsplash(s.image, { w: 1000, q: 65 })}
                  srcSet={unsplashSrcSet(s.image, [640, 1000, 1400], 65)}
                  sizes={s.span === 'wide' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
                  loading="lazy"
                  decoding="async"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-slow motion-safe:group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-white">{s.name}</h3>
                  <p className="mt-2 text-sm text-slate-200 leading-relaxed max-w-xl">{s.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                    Explore <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
