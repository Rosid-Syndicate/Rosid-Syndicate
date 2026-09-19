export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  category: string
  category_slug: string
  author: string
  author_role?: string
  is_published: boolean
  published_at: string
  views: number
  reading_time: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export const INITIAL_CATEGORIES: BlogCategory[] = [
  {
    id: 'cat-1',
    name: 'Company News',
    slug: 'company-news',
    description: 'Corporate updates, executive announcements, and strategic group milestones.',
    icon: 'NewspaperIcon'
  },
  {
    id: 'cat-2',
    name: 'Infrastructure & Construction',
    slug: 'infrastructure-construction',
    description: 'Engineering feats, civil works, equipment logistics, and nationwide project analysis in Nepal.',
    icon: 'BuildingOffice2Icon'
  },
  {
    id: 'cat-3',
    name: 'Financial Advisory',
    slug: 'financial-advisory',
    description: 'Bank syndication, debt structuring, counter-guarantees, and capital closure for mega energy projects.',
    icon: 'BanknotesIcon'
  },
  {
    id: 'cat-4',
    name: 'International Trade',
    slug: 'international-trade',
    description: 'Cross-border import/export operations, custom clearances, supply chain synergies, and heavy sourcing.',
    icon: 'GlobeAltIcon'
  },
  {
    id: 'cat-5',
    name: 'Foreign Contractors',
    slug: 'foreign-contractors',
    description: 'Comprehensive guides for international EPC firms, joint ventures, and PPA regulatory navigation in Nepal.',
    icon: 'BriefcaseIcon'
  }
]

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: "Welcome to Rosid Syndicates Group - Building Nepal's Future",
    slug: 'welcome-to-rosid-syndicates-group-building-nepals-future',
    excerpt: "An introduction to Rosid Syndicates Group, our five specialized subsidiaries, unified execution engine, and vision for nation-building infrastructure.",
    content: `## Engineering Nationwide Economic & Industrial Progress

**Rosid Syndicates Group** represents a premier multi-disciplinary conglomerate operating across the core pillars of Nepal's economic growth: heavy infrastructure development, strategic procurement, sovereign financial advisory, and cross-border commercial trade.

Headquartered in New Baneshwor, Kathmandu, our group operates as an integrated execution engine connecting global EPC contractors, international investors, and government bodies with reliable on-the-ground execution in Nepal.

---

### Our Operating Ecosystem: Five Specialized Subsidiaries

Our strength lies in the synergistic alignment of five dedicated corporate subsidiaries:

1. **Roshan Enterprises Pvt. Ltd.** — Bulk supply of certified construction materials, public-private procurement, and national material distribution.
2. **Appi Saipal Financial Solutions Pvt. Ltd.** — Financial closure, Class "A" bank consortium syndication, counter-guarantees, and risk mitigation for energy mega-projects.
3. **Kasthamandap Commerce and Company Pvt. Ltd.** — Nationwide trading networks, domestic raw material sourcing, and supply-only civil tenders.
4. **B & C Exim Company Pvt. Ltd.** — International import/export execution, customs navigation, warehousing, and last-mile logistics.
5. **Deiyougo Enterprises Pvt. Ltd.** — Government procurement bidding, specialized industrial machinery sourcing, and tender fulfillment.

---

### Bridging Global Capability with Local Execution

Entering Nepal's infrastructure market presents remarkable opportunities, from the 10,000 MW hydropower master plan to trans-Himalayan transmission corridors. However, foreign contractors frequently face regulatory friction under the Public Procurement Act (PPA), local bank guarantee compliance, and complex regional logistics.

Rosid Syndicates Group acts as the definitive in-country operational anchor. By uniting financial guarantees, bulk material supply lines, and civil engineering machinery under one unified group structure, we eliminate project bottlenecks and guarantee timeline integrity.`,
    featured_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    category: 'Company News',
    category_slug: 'company-news',
    author: 'Roshan Pandey',
    author_role: 'Chairman & Managing Director',
    is_published: true,
    published_at: '2026-08-20T10:00:00Z',
    views: 1240,
    reading_time: '4 min read',
    tags: ['Corporate', 'Infrastructure', 'Subsidiaries', 'Nepal Trade']
  },
  {
    id: 'post-2',
    title: 'A Guide to Bank Guarantees for Foreign Contractors in Nepal',
    slug: 'guide-to-bank-guarantees-for-foreign-contractors-nepal',
    excerpt: 'Comprehensive guide on structuring Bid Bonds, Performance Bonds, Advance Payment Guarantees, and counter-guarantees under Nepal Rastra Bank guidelines.',
    content: `## Demystifying Financial Instruments in Nepal's Public Procurement

For international engineering and construction firms bidding on sovereign infrastructure contracts in Nepal, navigating the banking and guarantee framework is one of the most critical pre-bid requirements.

Under the **Public Procurement Act (PPA)** and directives issued by **Nepal Rastra Bank (NRB)**, international bidders must issue tenders and contract guarantees through licensed Class "A" commercial banks in Nepal.

---

### Core Guarantee Instruments Required

- **Bid Security (Bid Bond):** Typically 2% to 5% of estimated project value.
- **Performance Guarantee:** 5% (standard) to 10% (specialized) of contract value upon contract award.
- **Advance Payment Guarantee (APG):** 100% of mobilization disbursement (typically 10%–20% of contract value).
- **Retention Money Guarantee / Defect Liability Bond:** 5% retained during the Defect Notification Period.

---

### The Counter-Guarantee Challenge

Foreign banks without direct SWIFT credit arrangements with Nepalese Class "A" banks often encounter substantial delays or steep collateral demands when issuing counter-guarantees.

### How Appi Saipal Financial Solutions Accelerates Closure

Through **Appi Saipal Financial Solutions Pvt. Ltd.**, Rosid Syndicates Group resolves these frictions through:

- **Pre-Arranged Credit Lines:** Institutional standing with premier Class "A" Nepalese commercial banks.
- **Rapid SWIFT Confirmation:** Expedited MT760/MT799 verification for overseas banks.
- **Tripartite Guarantee Structuring:** Direct coordination between the foreign EPC sponsor, the Nepalese issuing bank, and the procuring government agency.
- **Cost Minimization:** Negotiating competitive issuance fees and minimal margin collateral holding requirements.`,
    featured_image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a',
    category: 'Foreign Contractors',
    category_slug: 'foreign-contractors',
    author: 'Appi Saipal Advisory Team',
    author_role: 'Financial Engineering Division',
    is_published: true,
    published_at: '2026-08-22T08:30:00Z',
    views: 980,
    reading_time: '6 min read',
    tags: ['Bank Guarantees', 'Foreign Contractors', 'NRB Compliance', 'Bid Bonds']
  },
  {
    id: 'post-3',
    title: 'Hydropower Project Reaches Financial Closure',
    slug: 'hydropower-project-reaches-financial-closure',
    excerpt: 'A landmark case study showcasing how Appi Saipal structured a multi-bank consortium syndication for an 86 MW run-of-river hydropower project in eastern Nepal.',
    content: `## Case Study: Structured Debt Syndication & Risk Mitigation

Rosid Syndicates Group is pleased to announce the successful financial closure of an **86 MW Run-of-River (RoR) Hydropower Project** in Koshi Province, Nepal. The project represents a total capital investment exceeding USD $140 Million.

The financial structuring and consortium debt arrangement were led by **Appi Saipal Financial Solutions Pvt. Ltd.** in partnership with a syndicate of tier-one Nepalese commercial banks and private infrastructure funds.

---

### Project Key Facts & Metrics

- **Installed Capacity:** 86 MW Run-of-River Hydroelectric Station
- **Total Project Outlay:** NPR 18.2 Billion (~USD $138M)
- **Debt-to-Equity Ratio:** 75:25 Structured Project Finance
- **Lead Syndicate Bank:** Class "A" Commercial Consortium (4 Banks)
- **Power Purchase Agreement (PPA):** Long-term take-or-pay with Nepal Electricity Authority (NEA)

---

### Strategic Financial Engineering Interventions

Appi Saipal provided end-to-end capital advisory throughout the 14-month development cycle:

1. **Multi-Tier Debt Syndication:** Structured Senior Debt tranches with staggered maturity profiles matching the river basin hydrological yield forecasts.
2. **Construction Risk Ring-Fencing:** Formulated escrow waterfall mechanisms protecting debt servicing while ensuring uninterrupted liquidity for civil works executed by group partners.
3. **Forex Risk Hedging:** Formulated NRB-compliant counter-hedging structures for turbine and electro-mechanical imports sourced from European manufacturers.

This milestone reinforces Rosid Syndicates Group's reputation as an indispensable catalyst for Nepal's sovereign clean energy independence.`,
    featured_image: '/hydropower-plant.jpg',
    category: 'Financial Advisory',
    category_slug: 'financial-advisory',
    author: 'Energy Capital Desk',
    author_role: 'Infrastructure Finance',
    is_published: true,
    published_at: '2026-08-24T12:00:00Z',
    views: 1560,
    reading_time: '5 min read',
    tags: ['Hydropower', 'Financial Closure', 'Debt Syndication', 'Clean Energy']
  },
  {
    id: 'post-4',
    title: "How Foreign Contractors Can Enter Nepal's Infrastructure Market",
    slug: 'how-foreign-contractors-can-enter-nepals-infrastructure-market',
    excerpt: "A strategic blueprint detailing PPA compliance, local agency alignment, Joint Venture (JV) agreements, and site execution logistics in Nepal.",
    content: `## Strategic Blueprint for International Bidders

Nepal's infrastructure landscape is experiencing unprecedented growth. Multilateral funding from the Asian Development Bank (ADB), World Bank, and bilateral development assistance has opened billions in road networks, airport expansions, tunneling, and high-voltage transmission projects.

However, international contractors often struggle with local joint-venture mandates, regulatory clearances, and procurement dispute mechanisms.

---

### 1. Understanding the Legal Framework (PPA / PPMO)

International tenders in Nepal are regulated under the **Public Procurement Act, 2063 (2007)** and Public Procurement Regulations, 2064. Key stipulations include:

- **Mandatory Domestic Preference:** Bids offering domestic participation or local joint ventures are often granted statutory evaluation preferences.
- **e-GP Portal Submissions:** All public bids must be submitted through the electronic government procurement portal managed by the PPMO.
- **Taxation & Repatriation:** Navigating Foreign Investment and Technology Transfer Act (FITTA) rules for profit repatriation.

---

### 2. The Power of Local Joint Venture (JV) Structuring

Partnering with a proven local conglomerate like **Rosid Syndicates Group** transforms overseas engineering power into successful in-country completion:

- **Equipment & Heavy Machinery:** Access to crushing plants, dump trucks, and excavators through our group logistics and machinery networks.
- **Certified Bulk Materials:** Immediate bulk procurement of OPC 53 Grade cement, TMT rebar, and aggregate through *Roshan Enterprises*.
- **Local Workforce & Community Liaisons:** Smooth social license to operate, land acquisition mediation, and site security.`,
    featured_image: 'https://images.unsplash.com/photo-1541888056262-563b7852f826',
    category: 'Foreign Contractors',
    category_slug: 'foreign-contractors',
    author: 'Roshan Pandey & Advisory Board',
    author_role: 'Executive Leadership',
    is_published: true,
    published_at: '2026-08-25T09:00:00Z',
    views: 890,
    reading_time: '7 min read',
    tags: ['Foreign Contractors', 'Public Procurement', 'Joint Ventures', 'Nepal Bidding']
  }
]
