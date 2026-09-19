import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'

const servicesData: Record<string, any> = {
  'construction-civil-infrastructure': {
    title: 'Construction & Civil Infrastructure',
    desc: 'Earthworks, structural building, roads, and integrated supply & build contracts.',
    content: 'Through our specialized execution network and operating subsidiaries, Rosid Syndicates Group facilitates major civil works including earthworks, structural building, roads, and critical civil infrastructure. We provide integrated supply and build contracts for government-funded public works and large-scale private developments.'
  },
  'procurement-tender-execution': {
    title: 'Procurement & Tender Execution',
    desc: 'Active participation and execution in public sector and private supply tenders.',
    content: 'Deiyougo Enterprises Pvt. Ltd. leads our government and commercial procurement programs. We specialize in fulfilling complex public-sector tenders, sourcing specialized equipment, industrial goods, and executing supply-only civil components across Nepal.'
  },
  'financial-advisory': {
    title: 'Financial Advisory',
    desc: 'Infrastructure advisory, bank guarantee structuring & public sector advocacy.',
    content: 'Appi Saipal Financial Solutions bridges the gap between developers, Class "A" commercial banks, international EPC contractors, and state energy authorities. We specialize in structuring bank syndications, securing counter-guarantees, and enforcing debt-servicing assurances.'
  },
  'international-trade': {
    title: 'International Trade',
    desc: 'Comprehensive import and export operations for raw materials, manufactured goods, and equipment.',
    content: 'B & C Exim Company Pvt. Ltd. and Kasthamandap Commerce drive our cross-border trade operations. We handle the import, sourcing, and wholesale distribution of general commercial commodities, raw materials, and high-value equipment.'
  },
  'supply-chain-logistics': {
    title: 'Supply Chain & Logistics',
    desc: 'Warehousing and last-mile distribution logistics for imported consumer and industrial items.',
    content: 'We provide a robust local trading and supply chain backbone. Our operations encompass vast warehousing facilities and last-mile distribution networks, ensuring that materials and consumable goods reach their destinations efficiently across Nepal.'
  },
  'foreign-contractor-support': {
    title: 'Foreign Contractor Support',
    desc: 'Facilitating counter-guarantee structures and regulatory navigation for foreign contractors.',
    content: 'Rosid Syndicates Group acts as a complete in-country operational, financial, and strategic partner for foreign firms entering Nepal. We facilitate local bank syndications, fulfill Public Procurement Act (PPA) requirements, and provide bulk domestic raw material supply and site management.'
  }
}

// Map the old slugs to the new slugs to keep links working temporarily if needed
const slugMap: Record<string, string> = {
  'construction & civil infrastructure': 'construction-civil-infrastructure',
  'procurement & tender execution': 'procurement-tender-execution',
  'financial advisory': 'financial-advisory',
  'international trade': 'international-trade',
  'supply chain & logistics': 'supply-chain-logistics',
  'foreign contractor support': 'foreign-contractor-support'
}

export default function ServiceDetail() {
  const { slug } = useParams()
  
  // Try to find the exact slug, or map it if it's a spaced name
  const decodedSlug = decodeURIComponent(slug || '').toLowerCase()
  const mappedSlug = slugMap[decodedSlug] || decodedSlug
  
  const service = servicesData[mappedSlug]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!service) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#F4F4F2] text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-ink mb-4">Service Not Found</h1>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-fire hover:text-fire-600 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Return Home
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-transparent min-h-screen">
      <PageHeader 
        title={service.title} 
        subtitle="Capabilities"
        image="https://images.unsplash.com/photo-1541888056262-563b7852f826?q=100&w=3840&auto=format&fit=crop"
        backLink="/"
        backLabel="Back to Home"
      />
      
      <div className="container max-w-4xl py-20">
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="text-2xl md:text-3xl text-ink font-light leading-relaxed mb-16 border-l-4 border-[#FD7B00] pl-6"
        >
          {service.desc}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="prose prose-lg prose-ink max-w-none"
        >
          <p className="text-lg text-ink/80 leading-loose">{service.content}</p>
          
          <div className="mt-16 p-8 bg-[#F4F4F2] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-ink mb-2">Ready to start your project?</h3>
              <p className="text-sm text-slate-500">Discuss your project or schedule a consultation with our advisory team.</p>
            </div>
            <Link to="/" onClick={() => setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100)} className="whitespace-nowrap px-6 py-3 bg-fire text-ink text-sm font-bold uppercase tracking-widest hover:bg-fire-600 transition-colors">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
