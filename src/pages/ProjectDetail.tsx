import { Link, useParams } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { projects } from '../data/projects'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { hideBrokenImage } from '../lib/images'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    return <NotFound title="Project not found" message="This case study is not published. See the sectors we work in instead." backTo="/projects" backLabel="Sectors & projects" />
  }

  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title={project.title}
        description={project.shortDescription}
        path={`/project/${project.slug}`}
        image={project.images?.[0]}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Sectors & Projects', path: '/projects' },
          { name: project.title, path: `/project/${project.slug}` },
        ]}
      />
      <PageHeader title={project.title} subtitle={project.sector} lead={project.shortDescription} image={project.images?.[0]} backLink="/projects" backLabel="All projects" />

      <div className="container max-w-4xl py-16 lg:py-24">
        <dl className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          {[
            ['Client', project.client],
            ['Location', project.location],
            ['Year', project.year],
            ['Status', project.status],
            ['Type', project.projectType],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{k}</dt>
              <dd className="mt-1 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <article className="prose-body mt-12">
          <h2>Project overview</h2>
          <p>{project.description}</p>
          <h3>Rosid scope</h3>
          <p>{project.scope}</p>
          <h3>Results</h3>
          <p>{project.results}</p>
        </article>

        {project.images && project.images.length > 1 && (
          <section className="mt-16" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="text-h2">Gallery</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.images.slice(1).map((img, i) => (
                <li key={img} className="aspect-[4/3] overflow-hidden rounded-sm">
                  <img src={img} alt={`${project.title} — image ${i + 2}`} loading="lazy" decoding="async" onError={hideBrokenImage} className="h-full w-full object-cover" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-16 pt-10 border-t border-line flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-h3">Discuss your project</h2>
            <p className="mt-1 text-muted">Tell us about your infrastructure or supply requirements.</p>
          </div>
          <Link to="/#contact" className="btn-primary">
            Contact us <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
