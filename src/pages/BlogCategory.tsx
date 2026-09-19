import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import BlogCard from '../components/BlogCard'
import NotFound from './NotFound'
import { supabase } from '../lib/supabase'
import { BlogPost, BlogCategory as BlogCategoryType, INITIAL_BLOG_POSTS, INITIAL_CATEGORIES } from '../data/blog'

export default function BlogCategory() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<BlogCategoryType | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [allCategories, setAllCategories] = useState<BlogCategoryType[]>(INITIAL_CATEGORIES)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!slug) return
      setState('loading')
      let current: BlogCategoryType | null = null
      let list: BlogPost[] = []
      try {
        const [{ data: cats }, { data: postData }] = await Promise.all([
          supabase.from('blog_categories').select('id, name, slug, description').order('name').limit(100),
          supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, featured_image, category, category_slug, author, published_at, reading_time, is_published, views, tags')
            .eq('category_slug', slug)
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .limit(200),
        ])
        if (cats && cats.length) {
          setAllCategories(cats as BlogCategoryType[])
          current = (cats as BlogCategoryType[]).find((c) => c.slug === slug) || null
        }
        if (postData && postData.length) list = postData.map((p) => ({ ...p, content: '' })) as BlogPost[]
      } catch (err) {
        console.warn('Supabase unavailable, using bundled data:', err)
      }
      if (!current) current = INITIAL_CATEGORIES.find((c) => c.slug === slug) || null
      if (list.length === 0) list = INITIAL_BLOG_POSTS.filter((p) => p.category_slug === slug)
      if (cancelled) return
      setCategory(current)
      setPosts(list)
      setState(current ? 'ready' : 'missing')
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (state === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Loading…</span>
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    )
  }
  if (state === 'missing' || !category) {
    return <NotFound title="Category not found" message="That article category does not exist." backTo="/blog" backLabel="All articles" />
  }

  const path = `/blog/category/${category.slug}`
  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title={`${category.name} — Insights`}
        description={category.description || `Articles on ${category.name.toLowerCase()} from Rosid Syndicates Group.`}
        path={path}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insights & News', path: '/blog' },
          { name: category.name, path },
        ]}
      />
      <PageHeader title={category.name} subtitle="Category" lead={category.description} image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" compact />

      <div className="container py-12 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/blog" className="hover:text-accent-text inline-flex items-center gap-1"><ArrowLeftIcon className="w-3.5 h-3.5" aria-hidden="true" /> All articles</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{category.name}</li>
          </ol>
        </nav>

        <section className="mt-8" aria-labelledby="cat-articles">
          <h2 id="cat-articles" className="sr-only">Articles in {category.name}</h2>
          {posts.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-lead text-muted">No published articles in this category yet.</p>
              <Link to="/blog" className="btn-primary mt-6">Browse all articles</Link>
            </div>
          ) : (
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <li key={post.id || post.slug}>
                  <BlogCard post={post} headingLevel="h3" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <nav className="mt-14 card p-6" aria-labelledby="other-cats">
          <h2 id="other-cats" className="text-xs font-bold uppercase tracking-[0.1em] text-muted mb-4">Other categories</h2>
          <ul className="flex flex-wrap gap-2">
            {allCategories.map((c) => (
              <li key={c.slug}>
                <Link to={`/blog/category/${c.slug}`} aria-current={c.slug === slug ? 'page' : undefined} className={`btn btn-sm ${c.slug === slug ? 'bg-ink text-white' : 'bg-canvas text-ink hover:bg-line'}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
