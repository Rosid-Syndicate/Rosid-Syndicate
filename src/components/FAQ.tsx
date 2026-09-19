import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  { q: 'What services does Rosid Syndicates Group provide?', a: 'We provide end-to-end solutions in heavy supply chain, financial advisory, public tender execution, and international trade across Nepal.' },
  { q: 'How do you support foreign contractors?', a: 'We act as your in-country operational, financial, and strategic partner, navigating Public Procurement Act compliance, local bank guarantees, and regulatory hurdles.' },
  { q: 'What financial advisory services do you offer?', a: 'Through Appi Saipal Financial Solutions, we offer bank syndication, debt structuring, and tripartite assurance for mega energy projects like hydropower and transmission lines.' },
  { q: 'Do you handle civil construction?', a: 'Yes, through our operating network and subsidiaries like Roshan Enterprises, we coordinate earthworks, structural building, roads, and integrated supply & build contracts.' },
  { q: 'How do you ensure financial integrity?', a: 'By bridging contractors, funding banks, and central authorities through transparent guarantee structures and continuous covenant monitoring.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-32 bg-[#F4F4F2]">
      <div className="container max-w-2xl">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="eyebrow uppercase">FAQ</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 text-section text-ink">Quick answers.</motion.h2>

        <div className="mt-14 divide-y divide-ink/5">
          {faqs.map((f, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full py-5 flex items-center justify-between text-left group">
                <span className={`text-base font-medium transition-colors ${open === i ? 'text-fire' : 'text-slate-500 group-hover:text-ink'}`}>{f.q}</span>
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-ink/20 text-xl">+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <p className="pb-5 text-sm text-slate-500 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
