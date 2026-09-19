import { unsplash, unsplashSrcSet, hideBrokenImage } from '../lib/images'

const PROCESS_IMAGE = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e'

const values = [
  {
    n: '01',
    t: 'Financial integrity',
    d: 'Bridging contractors, funding banks and central authorities through transparent guarantee structures and financial-closure mechanisms.',
  },
  {
    n: '02',
    t: 'National impact',
    d: 'Priority on projects with national reach — hydropower, transmission corridors and critical roadways.',
  },
  {
    n: '03',
    t: 'Global synergy',
    d: 'Facilitating foreign bidder entry, counter-guarantee integration and cross-border trade into Nepal.',
  },
  {
    n: '04',
    t: 'Dependable delivery',
    d: 'End-to-end accountability, from bulk raw-material sourcing to site-level execution support.',
  },
]

export default function Process() {
  return (
    <section id="values" className="py-20 lg:py-28 bg-canvas" aria-labelledby="values-heading">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 hidden lg:block">
            <img
              src={unsplash(PROCESS_IMAGE, { w: 960, q: 70 })}
              srcSet={unsplashSrcSet(PROCESS_IMAGE, [640, 960, 1200], 70)}
              onError={hideBrokenImage}
              sizes="40vw"
              width={960}
              height={1200}
              loading="lazy"
              decoding="async"
              alt="Engineers reviewing construction plans on site"
              className="w-full aspect-[4/5] object-cover rounded-sm shadow-card"
            />
          </div>

          <div className="lg:col-span-7">
            <p className="eyebrow">How we work</p>
            <h2 id="values-heading" className="mt-5 text-h2">Principles that shape every engagement.</h2>

            <ol className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-8">
              {values.map((v) => (
                <li key={v.n} className="relative pl-12">
                  <span className="absolute left-0 top-0 grid place-items-center w-8 h-8 rounded-sm bg-ink text-white text-xs font-bold font-mono" aria-hidden="true">
                    {v.n}
                  </span>
                  <h3 className="text-h3 text-ink">{v.t}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{v.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
