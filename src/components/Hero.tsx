import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { unsplash, unsplashSrcSet } from '../lib/images'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'

const scope = [
  { label: 'Construction supply & civil works', to: '/service/construction-civil-infrastructure' },
  { label: 'Public tenders & procurement', to: '/procurement' },
  { label: 'Bank guarantees & financial closure', to: '/companies/appi-saipal-financial-solutions' },
  { label: 'Import, export & logistics', to: '/service/international-trade' },
]

/**
 * Home hero.
 *
 * The previous version animated the LCP element from opacity 0 + blur (LCP
 * measured at 3.1 s on a throttled mobile profile with render delay accounting
 * for 3.06 s), ran a requestAnimationFrame particle network on every device and
 * ended with three identical "glass" cards that had a pointer cursor but no
 * destination. This version renders the headline immediately, uses a single
 * responsive <img>, and replaces decoration with the group's real operating
 * scope as links.
 */
export default function Hero() {
  return (
    <section className="relative bg-deep text-white overflow-hidden" aria-labelledby="hero-heading">
      <img
        src={unsplash(HERO_IMAGE, { w: 1600, q: 60 })}
        srcSet={unsplashSrcSet(HERO_IMAGE, [768, 1200, 1600, 2000], 60)}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-deep" aria-hidden="true" />
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="container relative pt-36 pb-16 lg:pt-44 lg:pb-24">
        <div className="max-w-4xl">
          <p className="eyebrow eyebrow-on-dark">Kathmandu, Nepal · Five companies</p>

          <h1 id="hero-heading" className="mt-6 text-display text-white motion-safe:animate-fade-up">
            Infrastructure, finance and trade — executed in Nepal.
          </h1>

          <p className="mt-7 max-w-2xl text-lead text-slate-200 motion-safe:animate-fade-up motion-safe:[animation-delay:80ms]">
            Rosid Syndicates Group supports domestic developers and foreign contractors with construction supply, public tender execution, bank-guarantee and financial-closure advisory, and cross-border logistics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:160ms]">
            <Link to="/#contact" className="btn-accent">
              Discuss a project <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/infrastructure-tender-services" className="btn-outline-light">
              How we support foreign bidders
            </Link>
          </div>
        </div>

        <nav aria-label="Operating scope" className="mt-20 lg:mt-28 border-t border-white/15 pt-8">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            {scope.map((item, i) => (
              <li key={item.to}>
                <Link to={item.to} className="group flex items-start gap-4 py-2 rounded-sm">
                  <span className="font-mono text-xs text-accent pt-1 tabular-nums" aria-hidden="true">0{i + 1}</span>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white leading-snug">
                    {item.label}
                    <ArrowRightIcon className="inline-block w-3.5 h-3.5 ml-1.5 -mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-fast" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
