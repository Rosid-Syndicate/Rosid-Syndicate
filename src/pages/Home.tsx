import { useEffect, useMemo, useState } from 'react'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import About, { DEFAULT_MISSION } from '../components/About'
import Process from '../components/Process'
import Services from '../components/Services'
import ForeignContractor from '../components/ForeignContractor'
import Projects from '../components/Projects'
import Testimonials from '../components/Testimonials'
import FAQ, { type FaqItem } from '../components/FAQ'
import { faqs as bundledFaqs } from '../data/faqs'
import Contact from '../components/Contact'
import Seo from '../components/Seo'
import { fetchHomeContent, type PublicTestimonial } from '../lib/publicData'

/**
 * Home. The page is pre-rendered with bundled content (FAQs, mission) so the
 * first paint never waits on the network; after hydration, admin-managed
 * content (FAQs, mission statement, published testimonials) replaces it via a
 * single edge-cached request. Testimonials have no bundled fallback by design.
 */
export default function Home() {
  const [faqs, setFaqs] = useState<FaqItem[]>(bundledFaqs)
  const [mission, setMission] = useState(DEFAULT_MISSION)
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([])

  useEffect(() => {
    const ctrl = new AbortController()
    fetchHomeContent(ctrl.signal).then((content) => {
      if (!content) return
      if (content.faqs.length) setFaqs(content.faqs.map((r) => ({ q: r.question, a: r.answer })))
      if (content.mission && content.mission.trim().length > 20) setMission(content.mission.trim())
      setTestimonials(content.testimonials)
    })
    return () => ctrl.abort()
  }, [])

  // FAQPage markup describes exactly the FAQ rendered on this page.
  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }),
    [faqs]
  )

  return (
    <>
      <Seo path="/" jsonLd={faqJsonLd} />
      <Hero />
      <Stats />
      <About mission={mission} />
      <Services />
      <Process />
      <ForeignContractor />
      <Projects />
      <Testimonials items={testimonials} />
      <FAQ items={faqs} />
      <Contact />
    </>
  )
}
