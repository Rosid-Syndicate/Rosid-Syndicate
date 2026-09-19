import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { companies } from '../data/companies'
import PageHeader from '../components/PageHeader'

export default function GroupStructure() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Group Structure | Rosid Syndicates Group'
  }, [])

  // Organize companies by division
  const infrastructureCompanies = companies.filter(c => 
    ['appi-saipal-financial-solutions'].includes(c.slug)
  )
  
  const commerceCompanies = companies.filter(c => 
    ['roshan-enterprises', 'kasthamandap-commerce', 'b-c-exim', 'deiyougo-enterprises'].includes(c.slug)
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div className="bg-[#030914] min-h-screen text-slate-300">
      <PageHeader 
        title="Group Structure" 
        subtitle="Organization" 
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=100&w=3840&auto=format&fit=crop"
      />

      {/* Network Diagram and Tree Section */}
      <section className="py-24 relative overflow-hidden bg-[#030914]">
        {/* Subtle dot grid and radial lights */}
        <div className="absolute inset-0 pointer-events-none opacity-40 cinematic-grid" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fire/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Top Node: ROSID BOARD */}
            <div className="flex flex-col items-center mb-12">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-1 bg-gradient-to-r from-[#FD7B00] via-orange-500 to-blue-600 rounded-sm shadow-[0_0_30px_rgba(253,123,0,0.15)] w-full max-w-md text-center"
              >
                <div className="bg-[#040c1e] p-6 rounded-[2px]">
                  <span className="text-[10px] font-bold text-[#FD7B00] tracking-[0.25em] uppercase">Executive Board</span>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider mt-2">ROSID SYNDICATES GROUP BOARD</h2>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Strategic Governance & Multi-Sector Policy Oversight</p>
                </div>
              </motion.div>
              {/* Vertical connector line */}
              <div className="w-[2px] h-12 bg-gradient-to-b from-[#FD7B00] to-slate-700"></div>
            </div>

            {/* Horizontal Split Line for Desktop */}
            <div className="hidden md:block relative w-full h-[2px] bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-12">
              <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FD7B00] border-4 border-[#030914]"></div>
              <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-600 border-4 border-[#030914]"></div>
            </div>

            {/* Division Columns */}
            <div className="grid md:grid-cols-2 gap-16 md:gap-12 lg:gap-16">
              
              {/* DIVISION A: INFRASTRUCTURE & ADVISORY */}
              <div className="flex flex-col items-center">
                {/* Vertical link line for mobile/desktop */}
                <div className="w-[2px] h-8 bg-slate-700 md:hidden mb-4"></div>
                
                {/* Division Title Header */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="w-full bg-gradient-to-r from-[#FD7B00]/20 via-[#FD7B00]/5 to-transparent border-l-4 border-[#FD7B00] p-4 mb-10"
                >
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">Infrastructure & Advisory</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Energy developments, counter guarantees, EPC financial structures.</p>
                </motion.div>

                {/* Subsidiaries list under Division A */}
                <div className="w-full space-y-6">
                  {infrastructureCompanies.map((company, i) => (
                    <motion.div
                      key={company.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      onMouseMove={handleMouseMove}
                      className="glow-border-card group p-6 relative flex flex-col justify-between hover:border-[#FD7B00]/50 transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono text-[#FD7B00] font-bold uppercase tracking-widest">Division: Energy / Civil</span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">0{i + 1}</span>
                        </div>
                        <h4 className="text-xl font-bold text-white uppercase tracking-wide group-hover:text-[#FD7B00] transition-colors">{company.name}</h4>
                        <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{company.shortDescription}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-block px-2.5 py-0.5 bg-[#FD7B00]/10 border border-[#FD7B00]/20 text-[#FD7B00] text-[9px] font-bold uppercase tracking-[0.1em] rounded-sm">
                            {company.coreScope.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <Link 
                          to={`/companies/${company.slug}`}
                          className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-[0.15em] flex items-center gap-1.5 transition-colors z-20"
                        >
                          Explore Subsidiary <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* DIVISION B: COMMERCE, TRADE & LOGISTICS */}
              <div className="flex flex-col items-center">
                {/* Vertical link line for mobile */}
                <div className="w-[2px] h-8 bg-slate-700 md:hidden mb-4"></div>

                {/* Division Title Header */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="w-full bg-gradient-to-r from-blue-600/20 via-blue-600/5 to-transparent border-l-4 border-blue-600 p-4 mb-10"
                >
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">Commerce & Logistics</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Cross-border import/export, commercial supply tenders, warehouses.</p>
                </motion.div>

                {/* Subsidiaries list under Division B */}
                <div className="w-full space-y-6">
                  {commerceCompanies.map((company, i) => (
                    <motion.div
                      key={company.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      onMouseMove={handleMouseMove}
                      className="glow-border-card group p-6 relative flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">Division: Trade / Logistics</span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">0{i + 2}</span>
                        </div>
                        <h4 className="text-xl font-bold text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">{company.name}</h4>
                        <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{company.shortDescription}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-block px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-[0.1em] rounded-sm">
                            {company.coreScope.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <Link 
                          to={`/companies/${company.slug}`}
                          className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-[0.15em] flex items-center gap-1.5 transition-colors z-20"
                        >
                          Explore Subsidiary <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Synergistic Operations Panel */}
      <section className="py-24 border-t border-white/5 bg-[#020710] text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 cinematic-grid" />
        <div className="container max-w-3xl relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white uppercase tracking-wider mb-6"
          >
            Comprehensive Execution Engine
          </motion.h2>
          <p className="text-base text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto font-light">
            Our dual-division architecture functions as a unified execution system. We structure financial safeguards, syndicate funding options, coordinate border logistics, and manage site execution, closing delivery gaps automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/corporate-profile" className="inline-flex justify-center items-center px-10 py-4 bg-white text-ink font-bold text-xs uppercase tracking-widest hover:bg-[#FD7B00] hover:text-white transition-all duration-300 rounded-sm shadow-md">
              View Corporate Profile
            </Link>
            <Link to="/companies" className="inline-flex justify-center items-center px-10 py-4 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 hover:border-white/35 transition-colors rounded-sm">
              Explore Companies
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
