import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ShareIcon, TagIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { formatDate } from '../lib/format'
import { supabase } from '../lib/supabase'
import { renderMarkdown } from '../lib/markdown'
import { unsplash, unsplashSrcSet } from '../lib/images'
import { companies } from '../data/companies'
import { BlogPost as BlogPostType, INITIAL_BLOG_POSTS } from '../data/blog'
import { SITE_NAME, SITE_URL, absoluteUrl } from '../config/site'

type LoadState = 'loading' | 'ready' | 'missing'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [related, setRelated] = useState<BlogPostType[]>([])
  const [state, setState] = useState<LoadState>('loading')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!slug) return
      setState('loading')
      let current: BlogPostType | null = null
      let others: BlogPostType[] = []
      try {
        const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
        if (data) {
          current = data as BlogPostType
          // Anonymous readers cannot UPDATE blog_posts; the RPC increments safely.
          supabase.rpc('increment_post_views', { post_slug: slug }).then(() => {}, () => {})
          const { data: rel } = await supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, featured_image, category, category_slug, author, published_at, reading_time, is_published, views')
            .eq('is_published', true)
            .neq('slug', slug)
            .order('published_at', { ascending: false })
            .limit(3)
          others = (rel ?? []) as BlogPostType[]
        }
      } catch (err) {
        console.warn('Supabase unavailable, using bundled posts:', err)
      }
      if (!current) current = INITIAL_BLOG_POSTS.find((p) => p.slug === slug) || null
      if (others.length === 0) others = INITIAL_BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3)
      if (cancelled) return
      setPost(current)
      setRelated(others)
      setState(current ? 'ready' : 'missing')
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  const share = async (platform: 'linkedin' | 'x' | 'whatsapp' | 'copy') => {
    const url = window.location.href
    const title = post?.title || SITE_NAME
    const targets = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
    }
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      } catch {
        toast.error('Could not copy the link')
      }
      return
    }
    window.open(targets[platform], '_blank', 'noopener,noreferrer')
  }

  if (state === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Loading article…</span>
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    )
  }
  if (state === 'missing' || !post) {
    return <NotFound title="Article not found" message="This article is not published or the link is out of date." backTo="/blog" backLabel="All articles" />
  }

  const path = `/blog/${post.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(unsplash(post.featured_image, { w: 1200, q: 70 }))],
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Person', name: post.author, jobTitle: post.author_role || undefined },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}${path}`,
    articleSection: post.category,
    keywords: (post.tags ?? []).join(', ') || undefined,
    inLanguage: 'en',
  }

  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title={post.title}
        description={post.excerpt}
        path={path}
        image={unsplash(post.featured_image, { w: 1200, q: 70 })}
        type="article"
        article={{ publishedTime: post.published_at, modifiedTime: post.updated_at, author: post.author, section: post.category, tags: post.tags }}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insights & News', path: '/blog' },
          { name: post.category, path: `/blog/category/${post.category_slug}` },
          { name: post.title, path },
        ]}
        jsonLd={articleJsonLd}
      />
      <PageHeader title={post.title} titleAs="p" subtitle={post.category} image={post.featured_image} compact />

      <div className="container py-12 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/blog" className="hover:text-accent-text inline-flex items-center gap-1"><ArrowLeftIcon className="w-3.5 h-3.5" aria-hidden="true" /> All articles</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to={`/blog/category/${post.category_slug}`} className="text-ink hover:text-accent-text">{post.category}</Link></li>
          </ol>
        </nav>

        <div className="mt-8 grid lg:grid-cols-12 gap-10">
          <article className="lg:col-span-8 card p-6 sm:p-10">
            <header className="pb-8 mb-8 border-b border-line">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                <span className="font-bold uppercase tracking-[0.08em] text-accent-text">{post.category}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" aria-hidden="true" /><time dateTime={post.published_at}>{formatDate(post.published_at, 'long')}</time></span>
                <span className="inline-flex items-center gap-1.5"><ClockIcon className="w-4 h-4" aria-hidden="true" />{post.reading_time}</span>
              </div>
              <h1 className="mt-4 text-h1">{post.title}</h1>
              <p className="mt-5 text-lead text-ink bg-canvas p-5 border-l-4 border-accent">{post.excerpt}</p>
              <p className="mt-5 text-sm text-muted">
                By <span className="font-bold text-ink">{post.author}</span>
                {post.author_role && <span> · {post.author_role}</span>}
              </p>
            </header>

            <figure className="mb-10">
              <img
                src={unsplash(post.featured_image, { w: 1200, q: 70 })}
                srcSet={unsplashSrcSet(post.featured_image, [640, 960, 1200, 1600], 70)}
                sizes="(min-width: 1024px) 60vw, 100vw"
                width={1200}
                height={675}
                decoding="async"
                alt=""
                className="w-full aspect-[16/9] object-cover rounded-sm"
              />
            </figure>

            <div className="prose-body">{renderMarkdown(post.content)}</div>

            {post.tags && post.tags.length > 0 && (
              <ul className="mt-12 pt-6 border-t border-line flex flex-wrap items-center gap-2" aria-label="Tags">
                <li className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-muted mr-1"><TagIcon className="w-4 h-4" aria-hidden="true" /> Tags</li>
                {post.tags.map((tag) => (
                  <li key={tag} className="px-3 py-1 bg-canvas text-ink text-xs font-semibold rounded-sm border border-line">{tag}</li>
                ))}
              </ul>
            )}

            <div className="mt-8 pt-8 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-ink"><ShareIcon className="w-4 h-4 text-accent-text" aria-hidden="true" /> Share</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => share('linkedin')} className="btn-secondary btn-sm">LinkedIn</button>
                <button type="button" onClick={() => share('x')} className="btn-secondary btn-sm">X</button>
                <button type="button" onClick={() => share('whatsapp')} className="btn-secondary btn-sm">WhatsApp</button>
                <button type="button" onClick={() => share('copy')} className="btn-secondary btn-sm">Copy link</button>
              </div>
            </div>
          </article>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-ink text-white p-7 rounded-sm">
              <h2 className="text-h3 text-white">Work with the group</h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">International EPC contractor or financial institution exploring Nepal? Talk to the advisory and execution teams.</p>
              <div className="mt-5 space-y-2">
                <Link to="/tender-inquiry" className="btn-accent w-full">Submit a tender inquiry</Link>
                <Link to="/infrastructure-tender-services" className="btn-outline-light w-full">Foreign contractor guide</Link>
              </div>
            </div>

            {related.length > 0 && (
              <section className="card p-6" aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-muted pb-3 border-b border-line">Related articles</h2>
                <ul className="mt-4 space-y-5">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link to={`/blog/category/${r.category_slug}`} className="text-xs font-bold uppercase tracking-[0.08em] text-accent-text">{r.category}</Link>
                      <h3 className="mt-1 text-sm font-bold leading-snug"><Link to={`/blog/${r.slug}`} className="text-ink hover:text-accent-text">{r.title}</Link></h3>
                      <p className="mt-1 text-xs text-muted"><time dateTime={r.published_at}>{formatDate(r.published_at)}</time> · {r.reading_time}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="card p-6" aria-labelledby="subs-heading">
              <h2 id="subs-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-muted pb-3 border-b border-line inline-flex items-center gap-2">
                <BuildingOffice2Icon className="w-4 h-4 text-accent-text" aria-hidden="true" /> Group companies
              </h2>
              <ul className="mt-4 divide-y divide-line">
                {companies.map((c) => (
                  <li key={c.slug} className="py-2.5">
                    <Link to={`/companies/${c.slug}`} className="block text-sm font-bold text-ink hover:text-accent-text">{c.name}</Link>
                    <span className="block text-xs text-muted">{c.shortDescription}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
