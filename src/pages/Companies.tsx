import { Link } from 'react-router-dom'
import { companies } from '../data/companies'
import CompanyCard from '../components/CompanyCard'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'

export default function Companies() {
  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Group Companies"
        description="The five operating companies of Rosid Syndicates Group: Roshan Enterprises, Appi Saipal Financial Solutions, Kasthamandap Commerce, B & C Exim and Deiyougo Enterprises — construction supply, financial advisory, trading, import/export and procurement in Nepal."
        path="/companies"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Group Companies', path: '/companies' }]}
      />
      <PageHeader
        title="Five companies, one execution engine."
        subtitle="Group companies"
        lead="Complementary capabilities across construction supply, procurement, financial advisory, trading, import/export and logistics."
        image="https://images.unsplash.com/photo-1554469384-e58fac16e23a"
      />

      <div className="container py-16 lg:py-24">
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Operating companies">
          {companies.map((company, i) => (
            <li key={company.slug}>
              <CompanyCard company={company} index={i} />
            </li>
          ))}
        </ul>

        <div className="mt-20 card p-8 lg:p-12 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <h2 className="text-h2">Ready to work with the group?</h2>
            <p className="mt-4 text-lead text-muted">
              Bulk material supply, bank-guarantee syndication or in-country support for an EPC bid — one conversation reaches the right company.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link to="/#contact" className="btn-primary">Discuss a project</Link>
            <Link to="/group-structure" className="btn-secondary">See the group structure</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
