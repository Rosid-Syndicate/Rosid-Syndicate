import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { companies } from '../data/companies'
import CompanyCard from '../components/CompanyCard'
import PageHeader from '../components/PageHeader'

export default function Companies() {
  return (
    <div className="bg-[#F4F4F2] min-h-screen">
      <PageHeader 
        title="A unified ecosystem of infrastructure & trade." 
        subtitle="Our Companies"
        image="https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=100&w=3840&auto=format&fit=crop"
      />
      <div className="container pb-32">
        <div className="max-w-3xl mt-16">
          <motion.p 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }} 
            className="text-lead text-slate-500 leading-relaxed border-l-4 border-[#FD7B00] pl-6"
          >
            Rosid Syndicates Group brings together complementary capabilities across infrastructure, construction, procurement, financial advisory, trading, import/export, and logistics. Together, our five subsidiaries provide an end-to-end execution engine for mega-projects in Nepal.
          </motion.p>
        </div>

        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, i) => (
            <CompanyCard key={company.slug} company={company} index={i} />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          className="mt-24 p-12 bg-white text-center"
        >
          <h2 className="text-3xl font-bold text-ink">Ready to partner with Rosid Syndicates Group?</h2>
          <p className="mt-4 text-ink/70 max-w-2xl mx-auto">
            Whether you need bulk material supply, bank guarantee syndication, or complete EPC execution support, our group ecosystem is built to deliver.
          </p>
          <Link 
            to="/#contact" 
            className="inline-flex mt-8 px-8 py-4 bg-fire text-ink font-bold text-sm uppercase tracking-widest hover:bg-fire-600 transition-colors"
          >
            Discuss a Project
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
