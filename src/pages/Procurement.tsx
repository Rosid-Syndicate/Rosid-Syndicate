import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'

export default function Procurement() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Procurement & Tender Center | Rosid Syndicates Group'
  }, [])

  return (
    <div className="bg-transparent min-h-screen flex flex-col">
      <PageHeader 
        title="Procurement & Tender Center" 
        subtitle="Operations" 
        image="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=100&w=3840&auto=format&fit=crop"
      />

      {/* 2. PROCUREMENT CAPABILITIES */}
      <section className="py-24 bg-transparent">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-ink mb-12 text-center">Core Procurement Capabilities</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Public-Sector Procurement', company: 'Roshan Enterprises', highlight: 'bg-ocean/10 text-ocean' },
                { title: 'Government Tender Fulfillment', company: 'Roshan Enterprises', highlight: 'bg-ocean/10 text-ocean' },
                { title: 'Construction Material Supply', company: 'Roshan Enterprises', highlight: 'bg-ocean/10 text-ocean' },
                { title: 'Civil Supply Tenders', company: 'Roshan Enterprises', highlight: 'bg-ocean/10 text-ocean' },
                { title: 'Commercial Procurement Sourcing', company: 'Kasthamandap Commerce', highlight: 'bg-ocean/10 text-ocean' },
                { title: 'Import/Export Execution', company: 'B & C Exim Company', highlight: 'bg-ocean/10 text-ocean' },
                { title: 'Equipment & Tender Sourcing', company: 'Deiyougo Enterprises', highlight: 'bg-ocean/10 text-ocean' },
                { title: 'Foreign Bidder Support', company: 'Appi Saipal Financial Solutions', highlight: 'bg-fire/10 text-fire' },
              ].map((cap, i) => (
                <div key={i} className="p-8 bg-white shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#011E52] to-[#FD7B00] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <h3 className="font-bold text-[#011E52] text-lg mb-6 leading-snug">{cap.title}</h3>
                  <p className="inline-block px-3 py-1.5 text-[10px] uppercase font-bold tracking-[0.15em] bg-slate-50 text-slate-500 border border-slate-100">
                    {cap.company}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FOREIGN BIDDER SUPPORT */}
      <section className="py-24 bg-white text-ink border-y border-slate-100">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-12 text-center">Foreign Bidder Support Ecosystem</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><span className="text-fire">01</span> Financial Guarantees</h3>
                  <p className="text-ink/70 text-sm leading-relaxed mb-4">Secured through Appi Saipal Financial Solutions and Class "A" commercial banks.</p>
                  <ul className="space-y-2 text-sm text-ink/80">
                    <li className="flex gap-2"><span>•</span> Counter-Guarantees</li>
                    <li className="flex gap-2"><span>•</span> Bid Bonds</li>
                    <li className="flex gap-2"><span>•</span> Performance Bonds</li>
                    <li className="flex gap-2"><span>•</span> Advance Payment Guarantees</li>
                    <li className="flex gap-2"><span>•</span> Financial Closure</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><span className="text-ocean">02</span> Operational Execution</h3>
                  <p className="text-ink/70 text-sm leading-relaxed mb-4">Executed through our local civil and commerce subsidiaries.</p>
                  <ul className="space-y-2 text-sm text-ink/80">
                    <li className="flex gap-2"><span>•</span> Local Representation</li>
                    <li className="flex gap-2"><span>•</span> Local JV Structuring</li>
                    <li className="flex gap-2"><span>•</span> Material Supply</li>
                    <li className="flex gap-2"><span>•</span> Local Logistics</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. TENDER PROCESS */}
      <section className="py-32 bg-[#F4F4F2]">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold font-sans text-[#011E52] leading-[1.05] tracking-tight">Rosid Service<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FD7B00] to-[#FFB067]">Workflow.</span></h2>
              <p className="mt-6 text-slate-500 text-sm uppercase tracking-widest font-bold">Standard procurement support methodology</p>
            </div>
            
            <div className="relative">
              {/* Premium Desktop Connecting Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#011E52] via-[#FD7B00] to-transparent -translate-x-1/2 rounded-full opacity-20"></div>
              
              <div className="space-y-12">
                {[
                  { step: 'Opportunity', desc: 'Identification of viable public or private tenders.' },
                  { step: 'Tender Review', desc: 'Technical and financial capability assessment.' },
                  { step: 'Local Partner / JV Alignment', desc: 'Structuring compliance and legal representation.' },
                  { step: 'Financial & Guarantee Structure', desc: 'Syndicating required bank guarantees and bonds.' },
                  { step: 'Supply / Execution Planning', desc: 'Logistics and material sourcing strategy.' },
                  { step: 'Bid / Tender Support', desc: 'Final documentation and submission assistance.' },
                  { step: 'Execution Support', desc: 'On-the-ground management and supply delivery.' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className={`relative flex items-center gap-6 md:gap-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Premium Node Circle for Desktop */}
                    <div className="hidden md:flex absolute left-1/2 w-8 h-8 bg-white border-4 border-[#011E52] rounded-full -translate-x-1/2 shadow-lg items-center justify-center z-10">
                      <div className="w-2 h-2 bg-[#FD7B00] rounded-full"></div>
                    </div>
                    
                    <div className="w-full md:w-1/2 flex justify-center">
                      <div className={`w-full bg-white p-8 sm:p-10 border border-slate-100 shadow-xl relative overflow-hidden group ${index % 2 === 0 ? 'md:mr-16' : 'md:ml-16'}`}>
                        {/* Huge background number */}
                        <div className="absolute -right-4 -bottom-4 text-[8rem] font-black text-slate-200 group-hover:text-slate-300 transition-colors pointer-events-none select-none leading-none">
                          0{index + 1}
                        </div>
                        
                        <div className="relative z-10">
                          <span className="inline-block px-3 py-1 bg-[#011E52]/5 text-[#011E52] font-bold text-[10px] uppercase tracking-[0.2em] mb-4">Phase 0{index + 1}</span>
                          <h4 className="font-bold text-[#011E52] text-2xl mb-3">{item.step}</h4>
                          <p className="text-base text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-24 bg-transparent border-t border-slate-200 text-center">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-ink mb-6">Ready to execute?</h2>
          <p className="text-lg text-slate-500 leading-relaxed mb-10">
            Partner with Rosid Syndicates Group for seamless tender fulfillment and reliable on-the-ground execution.
          </p>
          <Link to="/tender-inquiry" className="inline-flex justify-center items-center gap-2 px-10 py-5 bg-white text-ink font-bold text-sm hover:bg-fire transition-colors uppercase tracking-widest">
            Discuss a Tender Opportunity <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
