import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { Company } from '../data/companies'
import { unsplash, unsplashSrcSet, hideBrokenImage } from '../lib/images'

export default function CompanyCard({ company, index }: { company: Company; index: number }) {
  const isLocal = company.image.startsWith('/')
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group relative flex flex-col justify-end h-[380px] sm:h-[420px] overflow-hidden rounded-sm bg-ink focus-visible:ring-2 focus-visible:ring-accent"
    >
      <img
        src={isLocal ? '/img/hydropower-plant-1024.webp' : unsplash(company.image, { w: 800, q: 65 })}
        srcSet={isLocal ? '/img/hydropower-plant-640.webp 640w, /img/hydropower-plant-1024.webp 1024w' : unsplashSrcSet(company.image, [480, 800, 1200], 65)}
        onError={hideBrokenImage}
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
        loading="lazy"
        decoding="async"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-slow motion-safe:group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" aria-hidden="true" />

      <div className="relative p-6 sm:p-8">
        <span className="font-mono text-xs font-bold text-accent tabular-nums" aria-hidden="true">0{index + 1}</span>
        <h3 className="mt-3 text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-accent transition-colors duration-fast">{company.name}</h3>
        <p className="mt-3 text-sm text-slate-200 leading-relaxed">{company.coreScope}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-white">
          View company <ArrowRightIcon className="w-4 h-4 transition-transform duration-fast motion-safe:group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
