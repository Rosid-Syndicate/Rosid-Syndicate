import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function CorporateProfile() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Corporate Profile | Rosid Syndicates Group'
  }, [])

  return (
    <div className="bg-transparent min-h-screen">
      {/* HEADER FOR PRINT/PDF & WEB */}
      <div className="print:hidden">
        <PageHeader 
          title="Corporate Profile" 
          subtitle="Official Document" 
          image="https://images.unsplash.com/photo-1497366216548-37526070297c?q=100&w=3840&auto=format&fit=crop"
        />
      </div>
      <div className="hidden print:block print:bg-transparent print:text-ink print:py-12 border-b border-slate-200">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow text-slate-500 uppercase tracking-widest mb-4">Official Document</p>
            <h1 className="text-4xl font-bold tracking-tight leading-tight">Corporate Profile</h1>
            <p className="mt-4 text-xl text-slate-500 font-medium">Rosid Syndicates Group</p>
          </div>
        </div>
      </div>

      {/* DOCUMENT CONTENT (Print-optimized structure) */}
      <div className="container max-w-4xl py-16 print:py-8">
        
        {/* OFFICIAL CORPORATE STATEMENT */}
        <div className="mb-12 p-6 bg-white border-l-4 border-fire shadow-md print:hidden">
          <p className="text-sm font-bold text-ink uppercase tracking-widest">Official Corporate Record</p>
          <p className="text-sm text-slate-500 mt-2">
            This document outlines the verified organizational framework, division responsibilities, and operational credentials of Rosid Syndicates Group.
          </p>
        </div>

        <article className="prose prose-ink prose-lg max-w-none prose-headings:font-bold prose-a:text-fire">
          
          <h2 className="text-3xl border-b border-slate-200 pb-4 mt-12 mb-8">1. Group Overview</h2>
          <p>
            Rosid Syndicates Group is a multi-disciplinary conglomerate connecting global expertise with Nepalese execution. 
            We provide end-to-end solutions in heavy supply chain logistics, financial advisory, public tender execution, and international trade.
          </p>

          <h2 className="text-3xl border-b border-slate-200 pb-4 mt-16 mb-8">2. Mission & Leadership Vision</h2>
          <h3>Mission</h3>
          <p>
            To serve as the premier execution and advisory partner for national infrastructure and commercial development in Nepal, ensuring compliance, financial security, and operational excellence for our global and domestic partners.
          </p>
          <h3>Leadership Vision</h3>
          <p>
            "Our vision is to bridge the gap between global infrastructure capabilities and Nepal’s developmental potential. We act as the local anchor for international contractors and investors—navigating complex procurement, securing local bank syndication, and driving physical execution on the ground."
          </p>
          <p className="text-sm text-slate-500 font-bold">— Roshan Pandey, Chairman & Managing Director</p>

          <h2 className="text-3xl border-b border-slate-200 pb-4 mt-16 mb-8">3. Core Values</h2>
          <ul>
            <li><strong>Integrity:</strong> Uncompromising ethical standards in procurement and finance.</li>
            <li><strong>Execution:</strong> Reliable on-the-ground delivery and supply chain management.</li>
            <li><strong>Partnership:</strong> Fostering transparent and mutually beneficial Joint Ventures.</li>
            <li><strong>Compliance:</strong> Strict adherence to Nepal's public procurement laws and banking regulations.</li>
          </ul>

          <h2 className="text-3xl border-b border-slate-200 pb-4 mt-16 mb-8">4. Group Structure</h2>
          <p>
            Rosid Syndicates Group operates under a strategic board directing two primary operational divisions:
          </p>
          
          <div className="grid sm:grid-cols-2 gap-8 my-8 not-prose print:block print:space-y-8">
            <div className="bg-[#F4F4F2] p-6 border border-slate-200">
              <h4 className="font-bold text-ink mb-4 uppercase tracking-widest">Infrastructure & Advisory</h4>
              <ul className="space-y-2 text-slate-500">
                <li className="flex items-start gap-2"><span className="text-fire font-bold">•</span> Appi Saipal Financial Solutions Pvt. Ltd.</li>
              </ul>
            </div>
            <div className="bg-[#F4F4F2] p-6 border border-slate-200">
              <h4 className="font-bold text-ink mb-4 uppercase tracking-widest">Commerce & Logistics</h4>
              <ul className="space-y-2 text-slate-500">
                <li className="flex items-start gap-2"><span className="text-ocean font-bold">•</span> Roshan Enterprises Pvt. Ltd.</li>
                <li className="flex items-start gap-2"><span className="text-ocean font-bold">•</span> Kasthamandap Commerce and Company Pvt. Ltd.</li>
                <li className="flex items-start gap-2"><span className="text-ocean font-bold">•</span> B & C Exim Company Pvt. Ltd.</li>
                <li className="flex items-start gap-2"><span className="text-ocean font-bold">•</span> Deiyougo Enterprises Pvt. Ltd.</li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm">
            <Link to="/group-structure">View the full interactive organizational chart &rarr;</Link>
          </p>

          <h2 className="text-3xl border-b border-slate-200 pb-4 mt-16 mb-8">5. Capabilities & Ecosystem</h2>
          
          <h3>Foreign Contractor Support</h3>
          <p>
            We operate as an in-country execution engine for foreign firms bidding on Nepal’s infrastructure projects. Our three-pillar workflow integrates:
          </p>
          <ol>
            <li><strong>Financial & Guarantees:</strong> Counter Guarantee Setup, Local Bank Syndication, Financial Closure.</li>
            <li><strong>Regulatory & Advocacy:</strong> Local Agent Alignment, PPA / PPMP Compliance, Government Advocacy.</li>
            <li><strong>Civil & Supply Logistics:</strong> Bulk Material Sourcing, Equipment Logistics, JV Site Execution.</li>
          </ol>
          
          <h3>Appi Saipal Advisory</h3>
          <p>
            Specialized financial structuring for hydropower and transmission lines, including debt structuring, refinancing, and ensuring beneficiary protection.
          </p>
          
          <h3>Commerce & Logistics</h3>
          <p>
            End-to-end supply of certified construction materials, heavy equipment procurement, consumable distribution, and wholesale trade management spanning multiple domestic industries.
          </p>

          <h2 className="text-3xl border-b border-slate-200 pb-4 mt-16 mb-8">6. Contact & Corporate Information</h2>
          <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm not-prose text-ink space-y-2">
            <p><strong>Entity:</strong> Rosid Syndicates Group</p>
            <p><strong>Headquarters:</strong> New Baneshwor, Kathmandu, Nepal</p>
            <p><strong>Phone:</strong> +977-9705398939</p>
            <p><strong>Email:</strong> <a href="mailto:rosid2025@outlook.com" className="text-[#FD7B00] font-bold">rosid2025@outlook.com</a></p>
            <p><strong>Website:</strong> <a href="https://rosid.com.np" target="_blank" rel="noopener" className="text-[#011E52] font-bold">rosid.com.np</a></p>
          </div>

        </article>
      </div>
    </div>
  )
}
