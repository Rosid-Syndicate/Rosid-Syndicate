import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { services } from '../data/services'
import { unsplash, unsplashSrcSet, hideBrokenImage } from '../lib/images'

/**
 * Capability grid. Each card is a real link to its /service/:slug page (the
 * previous cards had a pointer cursor and hover-only text but no destination).
 * Descriptions are always visible — content must not depend on hover.
 */
export default function Services() {
  const featured = services.slice(0, 6)
  return (
    <section id="companies" className="py-20 lg:py-28 bg-surface border-y border-line" aria-labelledby="services-heading">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="eyebrow">Capabilities</p>
            <h2 id="services-heading" className="mt-5 text-h2">What the group does.</h2>
            <p className="mt-4 text-lead text-muted">Six areas of work, each delivered by one or more of the operating companies.</p>
          </div>
          <Link to="/companies" className="link-arrow shrink-0">
            See the companies behind each capability <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((s, i) => (
            <li key={s.slug}>
              <Link
                to={`/service/${s.slug}`}
                className="group card card-hover flex flex-col h-full overflow-hidden focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ink">
                  <img
                    src={unsplash(s.image, { w: 640, q: 65 })}
                    srcSet={unsplashSrcSet(s.image, [480, 640, 960], 65)}
                    onError={hideBrokenImage}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    width={640}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className="w-full h-full object-cover opacity-90 transition-transform duration-slow motion-safe:group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-4 left-4 font-mono text-xs font-bold text-white bg-ink/80 px-2 py-1 rounded-sm tabular-nums" aria-hidden="true">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-h3 text-ink group-hover:text-accent-text transition-colors duration-fast">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed flex-1">{s.short}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                    Learn more <ArrowRightIcon className="w-4 h-4 transition-transform duration-fast motion-safe:group-hover:translate-x-1" aria-hidden="true" />
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
