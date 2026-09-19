export interface Company {
  name: string
  slug: string
  shortDescription: string
  coreScope: string
  services: string[]
  image: string
}

export const companies: Company[] = [
  {
    name: 'Roshan Enterprises Pvt. Ltd.',
    slug: 'roshan-enterprises',
    shortDescription: 'Bulk supply of certified construction materials and public-private procurement.',
    coreScope: 'Construction Supply, Public-Private Procurement, Retail & Hospitality',
    image: 'https://images.unsplash.com/photo-1541888056262-563b7852f826',
    services: [
      'Construction Material Supply',
      'Bulk supply of certified construction materials',
      'Private, commercial and national infrastructure projects',
      'Tender & Supply Contracts',
      'Public-sector and private supply tenders',
      'Consumable Distribution & Mart Operations',
      'Wholesale distribution',
      'Retail mart operations',
      'Hospitality Services',
      'Development and management of hospitality assets'
    ]
  },
  {
    name: 'Appi Saipal Financial Solutions Pvt. Ltd.',
    slug: 'appi-saipal-financial-solutions',
    shortDescription: 'Financial closure, bank syndication, and infrastructure advisory for mega projects.',
    coreScope: 'Infrastructure Advisory, Bank Guarantee Structuring & Public Sector Advocacy',
    image: '/hydropower-plant.jpg',
    services: [
      'Financial Closure & Advisory',
      'Bank syndication support',
      'Hydropower projects',
      'Transmission lines',
      'Civil infrastructure',
      'Multi-Party Risk Mitigation',
      'Counter Guarantees',
      'Foreign Bidder Support',
      'Regulatory navigation',
      'Industry Advocacy & Policy Consulting'
    ]
  },
  {
    name: 'Kasthamandap Commerce and Company Pvt. Ltd.',
    slug: 'kasthamandap-commerce',
    shortDescription: 'Nationwide trading, sourcing, and supply-only civil tenders.',
    coreScope: 'Nationwide Trading & Supply-Only Civil Tenders',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
    services: [
      'Domestic Trading Networks',
      'Import',
      'Sourcing',
      'Wholesale distribution',
      'Civil Supply Tenders',
      'Supply-only components of government and private civil construction contracts'
    ]
  },
  {
    name: 'B & C Exim Company Pvt. Ltd.',
    slug: 'b-c-exim',
    shortDescription: 'Import and export operations, warehousing, and last-mile distribution logistics.',
    coreScope: 'Import/Export Execution & Local Distribution Logistics',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    services: [
      'Cross-Border Trade',
      'Import operations',
      'Export operations',
      'Raw materials',
      'Manufactured goods',
      'Equipment',
      'Local Trade & Supply Synergy',
      'Warehousing',
      'Last-mile distribution',
      'Consumer and industrial items'
    ]
  },
  {
    name: 'Deiyougo Enterprises Pvt. Ltd.',
    slug: 'deiyougo-enterprises',
    shortDescription: 'Government contract bidding and commercial sourcing of specialized equipment.',
    coreScope: 'Government Contract Bidding & Commercial Sourcing',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c',
    services: [
      'Government Procurement',
      'Public-sector procurement programs',
      'Government tender fulfillment',
      'Commercial Procurement Sourcing',
      'Specialized equipment',
      'Industrial goods',
      'Trade items'
    ]
  }
  /*
  {
    name: 'Vharmal Singh Multipurpose and Construction Company Pvt. Ltd.',
    slug: 'vharmal-singh-construction',
    shortDescription: 'Civil works execution, earthworks, and integrated supply & build contracts.',
    coreScope: 'Civil Construction Execution & Public Infrastructure Delivery',
    image: 'https://images.unsplash.com/photo-1544971587-c1555541c5d4',
    services: [
      'Civil Works Execution',
      'Earthworks',
      'Structural Building',
      'Roads',
      'Civil infrastructure projects',
      'Integrated Supply & Build Contracts',
      'Material supply',
      'Construction execution',
      'Government-funded public works'
    ]
  }
  */
]
