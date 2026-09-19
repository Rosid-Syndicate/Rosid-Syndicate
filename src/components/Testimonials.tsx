import type { PublicTestimonial } from '../lib/publicData'

/**
 * "What partners say" — renders only when at least one testimonial has been
 * published from the admin. No placeholders, no invented quotes; the section
 * is simply absent until real ones exist.
 */
export default function Testimonials({ items }: { items: PublicTestimonial[] }) {
  if (!items.length) return null
  return (
    <section className="py-20 lg:py-28 bg-surface border-y border-line" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow">What partners say</p>
          <h2 id="testimonials-heading" className="mt-5 text-h2">In their words.</h2>
        </div>
        <ul className={`grid gap-5 ${items.length === 1 ? 'max-w-3xl' : items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {items.map((t) => (
            <li key={t.id} className="card p-7 flex flex-col">
              <blockquote className="flex-1">
                <p className="text-ink text-base leading-relaxed">“{t.quote}”</p>
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-line flex items-center gap-3">
                {t.photo_url ? (
                  <img src={t.photo_url} alt="" width={44} height={44} loading="lazy" decoding="async" className="w-11 h-11 rounded-full object-cover bg-canvas" />
                ) : (
                  <span className="grid place-items-center w-11 h-11 rounded-full bg-ink text-white text-sm font-bold" aria-hidden="true">
                    {t.author_name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{t.author_name}</p>
                  <p className="text-xs text-muted truncate">{[t.author_role, t.company].filter(Boolean).join(' · ')}</p>
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
