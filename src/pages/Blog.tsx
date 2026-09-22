import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import BlogCard from '../components/BlogCard'
import { formatDate } from '../lib/format'
import { supabase } from '../lib/supabase'
import { unsplash, unsplashSrcSet, hideBrokenImage } from '../lib/images'
import { BlogPost, BlogCategory, INITIAL_BLOG_POSTS, INITIAL_CATEGORIES } from '../data/blog'

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS)
  const [categories, setCategories] = useState<BlogCategory[]>(INITIAL_CATEGORIES)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const searchId = useId()

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const [{ data: catData }, { data: postData }] = await Promise.all([
          supabase.from('blog_categories').select('id, name, slug, description').order('name').limit(100),
          supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, featured_image, category, category_slug, author, author_role, is_published, published_at, views, reading_time, tags')
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .limit(200),
        ])
        if (cancelled) return
        if (catData && catData.length) setCategories(catData as BlogCategory[])
        if (postData && postData.length) setPosts(postData.map((p) => ({ ...p, content: '' })) as BlogPost[])
      } catch (err) {
        console.warn('Blog data unavailable, showing bundled posts:', err)
      }
    }
    loadData()
    return () => {
      cancelled = true
    }
  }, [])

  const q = searchQuery.trim().toLowerCase()
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category_slug === selectedCategory
    const matchesSearch =
      !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q) || (post.tags ?? []).some((t) => t.toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  })

  const isDefaultView = selectedCategory === 'all' && !q
  const featuredPost = isDefaultView ? filteredPosts[0] : undefined
  const gridPosts = isDefaultView ? filteredPosts.slice(1) : filteredPosts

  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Insights & News"
        description="Articles from Rosid Syndicates Group on infrastructure and construction in Nepal, bank guarantees and financial closure, public procurement for foreign contractors, and international trade."
        path="/blog"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Insights & News', path: '/blog' }]}
      />
      <PageHeader
        title="Insights & news"
        subtitle="Editorial"
        lead="Guides, analysis and group announcements on infrastructure, finance and trade in Nepal."
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
        compact
      />

      <div className="container py-12 lg:py-16">
        {/* Filters */}
        <div className="card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div role="group" aria-label="Filter by category" className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`btn btn-sm whitespace-nowrap ${selectedCategory === 'all' ? 'bg-ink text-white' : 'bg-canvas text-ink hover:bg-line'}`}
            >
              All ({posts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                aria-pressed={selectedCategory === cat.slug}
                className={`btn btn-sm whitespace-nowrap ${selectedCategory === cat.slug ? 'bg-ink text-white' : 'bg-canvas text-ink hover:bg-line'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <label htmlFor={searchId} className="sr-only">Search articles</label>
            <MagnifyingGlassIcon className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input id={searchId} type="search" placeholder="Search articles…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="field pl-11 py-2.5" />
          </div>
        </div>

        {/* Featured */}
        {featuredPost && (
          <article className="mt-10 card overflow-hidden grid lg:grid-cols-12">
            <Link to={`/blog/${featuredPost.slug}`} tabIndex={-1} aria-hidden="true" className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto lg:min-h-[420px] overflow-hidden bg-ink">
              <img
                src={unsplash(featuredPost.featured_image, { w: 1200, q: 65 })}
                srcSet={unsplashSrcSet(featuredPost.featured_image, [640, 960, 1200, 1600], 65)}
                onError={hideBrokenImage}
                sizes="(min-width: 1024px) 58vw, 100vw"
                loading="eager"
                decoding="async"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </Link>
            <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold uppercase tracking-[0.08em] text-accent-text">Latest</span>
                <Link to={`/blog/category/${featuredPost.category_slug}`} className="text-muted hover:text-ink">{featuredPost.category}</Link>
                <span className="text-muted">· {featuredPost.reading_time}</span>
              </div>
              <h2 className="mt-4 text-h2 leading-tight">
                <Link to={`/blog/${featuredPost.slug}`} className="hover:text-accent-text transition-colors duration-fast">{featuredPost.title}</Link>
              </h2>
              <p className="mt-4 text-muted leading-relaxed line-clamp-4 flex-1">{featuredPost.excerpt}</p>
              <div className="mt-6 pt-6 border-t border-line flex items-center justify-between gap-4">
                <p className="text-sm">
                  <span className="font-bold text-ink">{featuredPost.author}</span>
                  <span className="block text-xs text-muted"><time dateTime={featuredPost.published_at}>{formatDate(featuredPost.published_at)}</time></span>
                </p>
                <Link to={`/blog/${featuredPost.slug}`} className="link-arrow">
                  Read article <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Grid */}
        <section className="mt-12" aria-labelledby="articles-heading">
          <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-line">
            <h2 id="articles-heading" className="text-h3">{isDefaultView ? 'All articles' : `${filteredPosts.length} result${filteredPosts.length === 1 ? '' : 's'}`}</h2>
            <p className="text-xs text-muted" role="status" aria-live="polite">{filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'}</p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="mt-8 card p-10 text-center">
              <p className="text-lead text-muted">No articles match your search.</p>
              <button type="button" onClick={() => { setSelectedCategory('all'); setSearchQuery('') }} className="btn-primary mt-6">
                Reset filters
              </button>
            </div>
          ) : (
            <ul className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <li key={post.id || post.slug}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* CTA */}
        <aside className="mt-16 bg-ink text-white p-8 lg:p-12 rounded-sm grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <p className="eyebrow eyebrow-on-dark">Work with the group</p>
            <h2 className="mt-4 text-h2 text-white">Need project advisory or a local EPC partner in Nepal?</h2>
            <p className="mt-3 text-slate-300 max-w-2xl">Bank syndication, public procurement support, material supply or joint-venture tender execution — the relevant division responds by email.</p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link to="/tender-inquiry" className="btn-accent">Submit a tender inquiry</Link>
            <Link to="/#contact" className="btn-outline-light">Contact us</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
