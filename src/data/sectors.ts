// Sectors the group works in. These replace four named "projects" that had no
// data behind them (src/data/projects.ts is empty and robots.txt disallowed
// /project/ for that reason). Sector descriptions are drawn from the existing
// company and service copy; verified case studies can be added to
// src/data/projects.ts when the business clears them for publication.

export interface Sector {
  slug: string
  name: string
  summary: string
  image: string
  to: string
  span?: 'wide' | 'narrow'
}

export const sectors: Sector[] = [
  {
    slug: 'hydropower-energy',
    name: 'Hydropower & energy',
    summary: 'Financial structuring, bank syndication and counter-guarantees for run-of-river and storage projects; equipment import coordination.',
    image: 'https://images.unsplash.com/photo-1541888056262-563b7852f826',
    to: '/companies/appi-saipal-financial-solutions',
    span: 'wide',
  },
  {
    slug: 'roads-bridges-civil',
    name: 'Roads, bridges & civil works',
    summary: 'Certified material supply, supply-and-build contracts and site logistics for public civil infrastructure.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356f12',
    to: '/service/construction-civil-infrastructure',
    span: 'narrow',
  },
  {
    slug: 'transmission-grid',
    name: 'Transmission & grid',
    summary: 'Advisory for high-voltage transmission corridors, including regulatory liaison and cross-border equipment procurement.',
    image: 'https://images.unsplash.com/photo-1574320297042-63bc58baf00c',
    to: '/service/financial-advisory',
    span: 'narrow',
  },
  {
    slug: 'trade-industrial-supply',
    name: 'Trade & industrial supply',
    summary: 'Import, export, warehousing and distribution of raw materials, machinery and commodities for industry and construction.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
    to: '/service/international-trade',
    span: 'wide',
  },
]
