import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'

export default function ForeignContractorWorkflow() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Infrastructure Tender Services | Rosid Syndicates Group'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'In-country operational, financial, and strategic partner for foreign contractors entering Nepal\'s infrastructure market.')
    }
  }, [])

  return (
    <div className="bg-transparent">
      <PageHeader 
        title="Unlocking High-Value Bidding & Local Execution" 
        subtitle="Foreign Contractor Workflow" 
        image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=100&w=3840&auto=format&fit=crop"
      />

      {/* 2. THE CHALLENGE */}
      <section className="py-24 bg-[#F4F4F2] border-b border-slate-200">
        <div className="container max-w-4xl text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-sm font-bold text-ink/40 uppercase tracking-[0.15em] mb-4">
            The Challenge
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-ink leading-tight">
            Navigating Complexities in a Growing Market
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-8 text-lg text-slate-500 leading-relaxed">
            <p>
              Foreign firms entering Nepal's infrastructure sector face unique complexities involving the Public Procurement Act (PPA), local bank guarantee compliance, stringent regulatory navigation, local representation requirements, and intricate on-the-ground execution logistics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. ROSID'S ROLE VISUAL */}
      <section className="py-32 bg-transparent">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-ink text-center mb-16">Rosid's Role as Your In-Country Execution Engine</h2>
            
            <div className="flex flex-col items-center">
              <div className="bg-white text-ink px-8 py-4 font-bold tracking-widest text-lg w-full max-w-sm text-center shadow-lg">
                FOREIGN CONTRACTOR / BIDDER
              </div>
              <div className="w-px h-12 bg-fire my-2"></div>
              <div className="w-4 h-4 border-b-2 border-r-2 border-fire transform rotate-45 mb-4"></div>
              
              <div className="bg-fire text-ink px-8 py-4 font-bold tracking-widest text-lg w-full max-w-md text-center shadow-lg">
                ROSID SYNDICATES GROUP
                <div className="text-xs text-ink/80 mt-1 uppercase">In-Country Execution Engine</div>
              </div>
              <div className="w-px h-12 bg-fire my-2"></div>
              <div className="w-4 h-4 border-b-2 border-r-2 border-fire transform rotate-45 mb-4"></div>
              
              <div className="w-full max-w-5xl border-t-2 border-slate-200 relative mt-4">
                <div className="absolute top-0 left-1/6 w-px h-8 bg-white/10"></div>
                <div className="absolute top-0 left-1/2 w-px h-8 bg-white/10"></div>
                <div className="absolute top-0 right-1/6 w-px h-8 bg-white/10"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                  <div className="bg-[#F4F4F2] p-6 border border-slate-200 text-center">
                    <h3 className="font-bold text-ink uppercase tracking-widest">Financial<br/>& Guarantees</h3>
                  </div>
                  <div className="bg-[#F4F4F2] p-6 border border-slate-200 text-center">
                    <h3 className="font-bold text-ink uppercase tracking-widest">Regulatory<br/>& Advocacy</h3>
                  </div>
                  <div className="bg-[#F4F4F2] p-6 border border-slate-200 text-center">
                    <h3 className="font-bold text-ink uppercase tracking-widest">Civil & Supply<br/>Logistics</h3>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. FINANCIAL & GUARANTEES | 5. REGULATORY & ADVOCACY | 6. CIVIL & SUPPLY */}
      <section className="py-24 bg-white text-ink border-t border-slate-100">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* FINANCIAL & GUARANTEES */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white border border-slate-200 shadow-sm border border-slate-200 p-10 hover:bg-[#F4F4F2] border border-slate-200 transition-colors">
              <span className="text-fire font-bold text-sm uppercase tracking-widest mb-4 block">01 / Financial</span>
              <h3 className="text-2xl font-bold text-ink mb-6 pb-6 border-b border-slate-200">Counter Guarantee & Bank Alignment</h3>
              <p className="text-ink/70 leading-relaxed mb-6">
                Through Appi Saipal Financial Solutions, we interface with Class "A" commercial banks and the Central Bank (NRB) for critical guarantee structures:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-fire font-bold mt-0.5">&#10003;</span> Bid Bonds
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-fire font-bold mt-0.5">&#10003;</span> Performance Bonds
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-fire font-bold mt-0.5">&#10003;</span> Advance Payment Counter-Guarantees
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-fire font-bold mt-0.5">&#10003;</span> Bank Alignment & Financial Closure
                </li>
              </ul>
            </motion.div>

            {/* REGULATORY & ADVOCACY */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 shadow-sm border border-slate-200 p-10 hover:bg-[#F4F4F2] border border-slate-200 transition-colors">
              <span className="text-ocean font-bold text-sm uppercase tracking-widest mb-4 block">02 / Regulatory</span>
              <h3 className="text-2xl font-bold text-ink mb-6 pb-6 border-b border-slate-200">Compliant Local Agent Representation</h3>
              <p className="text-ink/70 leading-relaxed mb-6">
                We navigate the stringent compliance required to secure and execute public tenders:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-ocean font-bold mt-0.5">&#10003;</span> Local Representation & JV Structuring
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-ocean font-bold mt-0.5">&#10003;</span> Public Procurement Regulations Alignment
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-ocean font-bold mt-0.5">&#10003;</span> Government Advocacy & Policy Support
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-ocean font-bold mt-0.5">&#10003;</span> Local Partner Preferences Management
                </li>
              </ul>
            </motion.div>

            {/* CIVIL & SUPPLY LOGISTICS */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 shadow-sm border border-slate-200 p-10 hover:bg-[#F4F4F2] border border-slate-200 transition-colors">
              <span className="text-electric font-bold text-sm uppercase tracking-widest mb-4 block">03 / Logistics</span>
              <h3 className="text-2xl font-bold text-ink mb-6 pb-6 border-b border-slate-200">On-the-Ground Logistics & Material Supply</h3>
              <p className="text-ink/70 leading-relaxed mb-6">
                Leveraging Roshan Enterprises for physical execution:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-electric font-bold mt-0.5">&#10003;</span> Bulk Domestic Raw Materials Sourcing
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-electric font-bold mt-0.5">&#10003;</span> Local Labor Network Management
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-electric font-bold mt-0.5">&#10003;</span> Site Management Support
                </li>
                <li className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="text-electric font-bold mt-0.5">&#10003;</span> Integrated Construction Execution
                </li>
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 7. THREE-PILLAR WORKFLOW SUMMARY */}
      <section className="py-24 bg-[#F4F4F2]">
        <div className="container max-w-5xl">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-ink text-center mb-16">The Three-Pillar Workflow</motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-transparent p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-fire-50 text-fire rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">01</div>
              <h3 className="font-bold text-ink text-lg mb-4">Financial & Guarantees</h3>
              <ul className="text-sm text-slate-500 space-y-2">
                <li>Counter Guarantee Setup</li>
                <li>Local Bank Syndication</li>
                <li>Financial Closure</li>
              </ul>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-transparent p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-ocean-50 text-ocean rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">02</div>
              <h3 className="font-bold text-ink text-lg mb-4">Regulatory & Advocacy</h3>
              <ul className="text-sm text-slate-500 space-y-2">
                <li>Local Agent Alignment</li>
                <li>PPA / PPMP Compliance</li>
                <li>Government Advocacy</li>
              </ul>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-transparent p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-electric-50 text-electric rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">03</div>
              <h3 className="font-bold text-ink text-lg mb-4">Civil & Supply Logistics</h3>
              <ul className="text-sm text-slate-500 space-y-2">
                <li>Bulk Material Sourcing</li>
                <li>Equipment Logistics</li>
                <li>JV Site Execution</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. WHY ROSID */}
      <section className="py-24 bg-transparent border-t border-slate-200">
        <div className="container max-w-4xl text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-sm font-bold text-ink/40 uppercase tracking-[0.15em] mb-4">
            Why Partner With Us
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-ink leading-tight">
            Bridging Global Expertise and Nepalese Execution
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-8 text-lg text-slate-500 leading-relaxed max-w-3xl mx-auto">
            The advantage of partnering with Rosid Syndicates Group lies in our unified ecosystem. By combining financial advisory, construction execution, material supply, logistics, and strict regulatory navigation into a single entity, we remove the friction of operating in a new jurisdiction, allowing you to focus on high-value engineering and bidding.
          </motion.p>
        </div>
      </section>

      {/* 9. CALL TO ACTION */}
      <section className="py-32 bg-white text-ink text-center border-t-4 border-fire">
        <div className="container max-w-4xl">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold leading-tight">
            Ready to Bid on Mega Projects in Nepal?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-8 text-xl text-ink/70">
            Bridge the gap between opportunity and execution.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/#contact" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-fire text-ink font-bold text-sm hover:bg-fire-600 transition-colors uppercase tracking-widest">
              Discuss JV Partnership <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link to="/#contact" className="inline-flex justify-center items-center gap-2 px-8 py-4 border border-white/20 text-ink font-bold text-sm hover:bg-[#F4F4F2] border border-slate-200 transition-colors uppercase tracking-widest">
              Discuss Financial Closure
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
