import Hero from '../components/Hero'
import Stats from '../components/Stats'
import About from '../components/About'
import Process from '../components/Process'
import Services from '../components/Services'
import ForeignContractor from '../components/ForeignContractor'
import Projects from '../components/Projects'
import FAQ from '../components/FAQ'
import { faqs } from '../data/faqs'
import Contact from '../components/Contact'
import Seo from '../components/Seo'

// FAQPage markup describes the FAQ rendered on this page (same source array).
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function Home() {
  return (
    <>
      <Seo path="/" jsonLd={faqJsonLd} />
      <Hero />
      <Stats />
      <About />
      <Services />
      <Process />
      <ForeignContractor />
      <Projects />
      <FAQ />
      <Contact />
    </>
  )
}
