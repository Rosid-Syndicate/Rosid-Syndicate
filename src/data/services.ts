// Capability / service pages. One data source for the home grid, the
// /service/:slug pages, the sitemap manifest (api/_lib/routes.js) and internal
// links. Copy is taken from the existing pages; company attributions match
// src/data/companies.ts.

export interface Service {
  slug: string
  title: string
  short: string
  description: string
  body: string[]
  image: string
  /** slugs from src/data/companies.ts that deliver this service */
  companies: string[]
  related: { label: string; to: string }[]
}

export const services: Service[] = [
  {
    slug: 'construction-civil-infrastructure',
    title: 'Construction & Civil Infrastructure',
    short: 'Earthworks, structural building, roads, and integrated supply & build contracts.',
    description:
      'Civil works execution and integrated supply-and-build contracts in Nepal through the Rosid Syndicates Group operating companies.',
    body: [
      'Through its execution network and operating subsidiaries, Rosid Syndicates Group facilitates major civil works including earthworks, structural building, roads and critical civil infrastructure.',
      'We provide integrated supply-and-build contracts for government-funded public works and large-scale private developments, combining certified material supply with on-site execution support.',
    ],
    image: 'https://images.unsplash.com/photo-1541888056262-563b7852f826',
    companies: ['roshan-enterprises'],
    related: [
      { label: 'Procurement & tender centre', to: '/procurement' },
      { label: 'Foreign contractor support', to: '/infrastructure-tender-services' },
    ],
  },
  {
    slug: 'procurement-tender-execution',
    title: 'Procurement & Tender Execution',
    short: 'Participation and execution in public-sector and private infrastructure supply tenders.',
    description:
      'Public-sector procurement, government tender fulfilment and commercial sourcing of specialised equipment in Nepal.',
    body: [
      'Deiyougo Enterprises Pvt. Ltd. leads our government and commercial procurement programmes, with Roshan Enterprises and Kasthamandap Commerce supplying the material components.',
      'We specialise in fulfilling complex public-sector tenders, sourcing specialised equipment and industrial goods, and executing supply-only civil components across Nepal.',
    ],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    companies: ['deiyougo-enterprises', 'roshan-enterprises', 'kasthamandap-commerce'],
    related: [
      { label: 'Procurement & tender centre', to: '/procurement' },
      { label: 'Submit a tender inquiry', to: '/tender-inquiry' },
    ],
  },
  {
    slug: 'financial-advisory',
    title: 'Financial Advisory',
    short: 'Infrastructure advisory, bank guarantee structuring and public-sector advocacy.',
    description:
      'Bank syndication, counter-guarantees and financial-closure advisory for hydropower, transmission and civil infrastructure projects in Nepal.',
    body: [
      'Appi Saipal Financial Solutions Pvt. Ltd. bridges developers, Class "A" commercial banks, international EPC contractors and state energy authorities.',
      'The team structures bank syndications, secures counter-guarantees for foreign bidders and supports debt-servicing assurance through financial closure and construction.',
    ],
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
    companies: ['appi-saipal-financial-solutions'],
    related: [
      { label: 'Appi Saipal Financial Solutions', to: '/companies/appi-saipal-financial-solutions' },
      { label: 'Foreign contractor support', to: '/infrastructure-tender-services' },
    ],
  },
  {
    slug: 'international-trade',
    title: 'International Trade',
    short: 'Import and export operations for raw materials, industrial machinery and commodities.',
    description:
      'Cross-border import/export execution, customs navigation and wholesale distribution in Nepal through B & C Exim and Kasthamandap Commerce.',
    body: [
      'B & C Exim Company Pvt. Ltd. and Kasthamandap Commerce and Company Pvt. Ltd. run our cross-border trade operations.',
      'We handle import, sourcing and wholesale distribution of commercial commodities, raw materials and high-value equipment, including the documentation and customs steps involved.',
    ],
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec',
    companies: ['b-c-exim', 'kasthamandap-commerce'],
    related: [
      { label: 'B & C Exim Company', to: '/companies/b-c-exim' },
      { label: 'Supply chain & logistics', to: '/service/supply-chain-logistics' },
    ],
  },
  {
    slug: 'supply-chain-logistics',
    title: 'Supply Chain & Logistics',
    short: 'Warehousing, heavy fleet transportation and last-mile distribution across Nepal.',
    description: 'Warehousing and last-mile distribution for imported consumer and industrial goods across Nepal.',
    body: [
      'Our companies provide a local trading and supply-chain backbone: warehousing, distribution networks and transport coordination so that materials and goods reach project sites and markets on time.',
      'Logistics is planned alongside procurement and import so that a single group counterpart is accountable for delivery.',
    ],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c',
    companies: ['b-c-exim', 'roshan-enterprises'],
    related: [
      { label: 'International trade', to: '/service/international-trade' },
      { label: 'Group companies', to: '/companies' },
    ],
  },
  {
    slug: 'foreign-contractor-support',
    title: 'Foreign Contractor Support',
    short: 'Counter-guarantee structures, local representation and regulatory navigation for foreign bidders.',
    description:
      'In-country operational, financial and strategic support for foreign contractors bidding on infrastructure projects in Nepal.',
    body: [
      'Rosid Syndicates Group acts as a complete in-country partner for foreign firms entering Nepal: local bank syndication and counter-guarantees, Public Procurement Act compliance and local representation, and bulk material supply with site management.',
      'The three-pillar workflow is described in detail on the foreign contractor page.',
    ],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    companies: ['appi-saipal-financial-solutions', 'roshan-enterprises'],
    related: [
      { label: 'Foreign contractor workflow', to: '/infrastructure-tender-services' },
      { label: 'Submit a tender inquiry', to: '/tender-inquiry' },
    ],
  },
  {
    slug: 'public-private-partnerships',
    title: 'Public-Private Partnerships',
    short: 'Joint-venture execution, concession agreements and government liaison for major projects.',
    description: 'Joint-venture structuring, concession support and government liaison for public-private infrastructure projects in Nepal.',
    body: [
      'We facilitate joint-venture execution between foreign and domestic parties, support concession-agreement processes and provide government liaison for large infrastructure programmes.',
      'Financial structuring is delivered through Appi Saipal Financial Solutions; supply and execution through the commerce and logistics division.',
    ],
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216',
    companies: ['appi-saipal-financial-solutions', 'deiyougo-enterprises'],
    related: [
      { label: 'Group structure', to: '/group-structure' },
      { label: 'Foreign contractor support', to: '/infrastructure-tender-services' },
    ],
  },
]

export const findService = (slug?: string) => services.find((s) => s.slug === slug)
