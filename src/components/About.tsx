import { Link } from 'react-router-dom'
import { CheckIcon } from '@heroicons/react/20/solid'
import { unsplash, unsplashSrcSet } from '../lib/images'

const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c'

const pillars = [
  'Construction material supply and civil infrastructure',
  'Public and private tender participation and fulfilment',
  'Bank syndication, guarantees and financial closure advisory',
  'Import/export, warehousing and last-mile logistics',
]

export const DEFAULT_MISSION =
  "To bridge critical gaps in Nepal's infrastructure, financial and commercial ecosystems through strategic partnerships, rigorous financial structuring and cross-border trade — with transparency, speed and quality."

export default function About({ mission = DEFAULT_MISSION }: { mission?: string }) {
  return (
    <section id="about" className="py-20 lg:py-28 bg-canvas" aria-labelledby="about-heading">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <p className="eyebrow">Group overview</p>
            <h2 id="about-heading" className="mt-5 text-h2">
              A multi-disciplinary infrastructure and trade group based in Kathmandu.
            </h2>
            <p className="mt-6 text-lead text-muted max-w-xl">
              Rosid Syndicates Group brings five operating companies under one board so that a single counterpart can cover supply, procurement, finance and logistics for a project in Nepal — for domestic developers and for foreign contractors entering the market.
            </p>

            <ul className="mt-8 space-y-3" aria-label="Areas of work">
              {pillars.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base text-ink">
                  <span className="mt-1 grid place-items-center w-5 h-5 rounded-full bg-accent-soft text-accent-text shrink-0" aria-hidden="true">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/companies" className="btn-primary">Meet the companies</Link>
              <Link to="/corporate-profile" className="btn-secondary">Corporate profile</Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <figure className="relative">
              <img
                src={unsplash(ABOUT_IMAGE, { w: 1200, q: 70 })}
                srcSet={unsplashSrcSet(ABOUT_IMAGE, [640, 960, 1200, 1600], 70)}
                sizes="(min-width: 1024px) 45vw, 100vw"
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
                alt="Modern office interior representing corporate advisory work"
                className="w-full aspect-[4/3] object-cover rounded-sm shadow-card"
              />
              <figcaption className="mt-4 card p-6 lg:absolute lg:-bottom-8 lg:-left-8 lg:max-w-md">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-accent-text">Mission</p>
                <blockquote className="mt-2 text-ink leading-relaxed">{mission}</blockquote>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
