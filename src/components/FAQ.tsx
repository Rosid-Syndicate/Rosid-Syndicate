import { useId, useState } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { faqs as bundledFaqs } from '../data/faqs'

export type FaqItem = { q: string; a: string }


/**
 * Accordion built on the disclosure pattern: each question is a <button>
 * inside a heading with aria-expanded / aria-controls; the answer region is
 * labelled by its question. The same content feeds the FAQPage JSON-LD emitted
 * by the home page.
 */
export default function FAQ({ items = bundledFaqs }: { items?: FaqItem[] }) {
  const faqs = items
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section id="faq" className="py-20 lg:py-28 bg-canvas" aria-labelledby="faq-heading">
      <div className="container max-w-3xl">
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-heading" className="mt-5 text-h2">Common questions.</h2>

        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f, i) => {
            const isOpen = open === i
            const btnId = `${baseId}-q-${i}`
            const panelId = `${baseId}-a-${i}`
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={btnId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full py-5 flex items-center justify-between gap-6 text-left group rounded-sm"
                  >
                    <span className={`text-base font-semibold transition-colors duration-fast ${isOpen ? 'text-accent-text' : 'text-ink group-hover:text-accent-text'}`}>{f.q}</span>
                    <PlusIcon className={`w-5 h-5 shrink-0 text-ink transition-transform duration-base ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen} className="pb-6">
                  <p className="text-base text-muted leading-relaxed">{f.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
