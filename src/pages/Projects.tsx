import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import { sectors } from '../data/sectors'
import { projects } from '../data/projects'
import { unsplash, unsplashSrcSet } from '../lib/images'

/**
 * Sectors & projects overview.
 *
 * The previous page presented four named "verified projects" that did not exist
 * in the project data (src/data/projects.ts is empty). This page describes the
 * sectors the group works in and renders real case studies from the data file
 * as soon as the business publishes them.
 */
export default function ProjectsPage() {
  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Sectors & Projects"
        description="Sectors served by Rosid Syndicates Group in Nepal — hydropower and energy, roads and civil works, transmission and grid, trade and industrial supply — and how the group's companies contribute to each."
        path="/projects"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Sectors & Projects', path: '/projects' }]}
      />
      <PageHeader
        title="Sectors & projects"
        subtitle="Where we work"
        lead="The infrastructure and trade sectors the group serves, and the role each operating company plays."
        image="https://images.unsplash.com/photo-1568671566370-49b36c5c7805"
      />

      <section className="container py-16 lg:py-24" aria-labelledby="sectors-list-heading">
        <h2 id="sectors-list-heading" className="sr-only">Sectors</h2>
        <ul className="grid md:grid-cols-2 gap-5">
          {sectors.map((s) => (
            <li key={s.slug}>
              <Link to={s.to} className="group card card-hover flex flex-col sm:flex-row overflow-hidden h-full focus-visible:ring-2 focus-visible:ring-accent">
                <img
                  src={unsplash(s.image, { w: 640, q: 65 })}
                  srcSet={unsplashSrcSet(s.image, [400, 640, 900], 65)}
                  sizes="(min-width: 640px) 240px, 100vw"
                  width={640}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  alt=""
                  className="sm:w-60 aspect-[4/3] sm:aspect-auto object-cover"
                />
                <div className="p-6 flex flex-col">
                  <h3 className="text-h3 text-ink group-hover:text-accent-text transition-colors duration-fast">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed flex-1">{s.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                    Related capability <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface border-y border-line" aria-labelledby="case-studies-heading">
        <div className="container py-16 lg:py-20">
          <h2 id="case-studies-heading" className="text-h2">Case studies</h2>
          {projects.length === 0 ? (
            <div className="mt-6 card p-6 sm:p-8 max-w-3xl">
              <p className="text-base text-muted leading-relaxed">
                Project case studies are published here once client clearance and supporting documents are in place. Until then, statutory registrations and licences are listed on the{' '}
                <Link to="/credentials" className="link-arrow">credentials page →</Link>
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link to={`/project/${p.slug}`} className="card card-hover block p-6 h-full">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-accent-text">{p.sector}</span>
                    <span className="block mt-2 font-bold text-ink">{p.title}</span>
                    <span className="block mt-2 text-sm text-muted">{p.shortDescription}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/tender-inquiry" className="btn-primary">Discuss a tender</Link>
            <Link to="/companies" className="btn-secondary">Explore the companies</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
