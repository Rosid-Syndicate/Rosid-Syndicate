import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import type { BlogPost } from '../../data/blog'
import { unsplash } from '../../lib/images'

type Filter = 'all' | 'published' | 'draft'

/**
 * Blog post management. Reads only from Supabase (the bundled fallback posts
 * are for the public site when the database is unreachable; showing them here
 * made it look like deletes "worked" when nothing was stored).
 */
export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const searchId = useId()

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, category, category_slug, author, is_published, published_at, views, reading_time, content')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) {
      setState('error')
      toast.error(`Could not load posts: ${error.message}`)
      return
    }
    setPosts((data ?? []) as BlogPost[])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const togglePublish = async (post: BlogPost) => {
    const next = !post.is_published
    const { error } = await supabase.from('blog_posts').update({ is_published: next }).eq('id', post.id)
    if (error) {
      toast.error(`Could not update: ${error.message}`)
      return
    }
    setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, is_published: next } : p)))
    toast.success(next ? 'Post published' : 'Post moved to drafts')
  }

  const remove = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id)
    if (error) {
      toast.error(`Delete failed: ${error.message}`)
      return
    }
    setPosts((list) => list.filter((p) => p.id !== post.id))
    toast.success('Post deleted')
  }

  const q = search.trim().toLowerCase()
  const filtered = posts.filter((p) => {
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    const matchesFilter = filter === 'all' || (filter === 'published' ? p.is_published : !p.is_published)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-[1400px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Blog posts</h1>
          <p className="mt-1 text-sm text-muted">Create, edit and publish articles.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/categories" className="btn-secondary btn-sm">Categories</Link>
          <Link to="/admin/blog/create" className="btn-primary btn-sm">
            <PlusIcon className="w-4 h-4" aria-hidden="true" /> New post
          </Link>
        </div>
      </header>

      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div role="group" aria-label="Filter posts" className="flex gap-2">
          {(
            [
              ['all', `All (${posts.length})`],
              ['published', `Published (${posts.filter((p) => p.is_published).length})`],
              ['draft', `Drafts (${posts.filter((p) => !p.is_published).length})`],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key} className={`btn btn-sm ${filter === key ? 'bg-ink text-white' : 'bg-canvas text-ink hover:bg-line'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">Search posts</label>
          <MagnifyingGlassIcon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input id={searchId} type="search" placeholder="Search title or category…" value={search} onChange={(e) => setSearch(e.target.value)} className="field pl-9 py-2 text-sm" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Blog posts</caption>
          <thead className="bg-canvas text-xs font-bold uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="px-5 py-3">Article</th>
              <th scope="col" className="px-5 py-3">Category</th>
              <th scope="col" className="px-5 py-3">Author</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3">Views</th>
              <th scope="col" className="px-5 py-3">Published</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {state === 'loading' ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">Loading articles…</td></tr>
            ) : state === 'error' ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-danger">Posts could not be loaded.</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No articles found.</td></tr>
            ) : (
              filtered.map((post) => (
                <tr key={post.id} className="hover:bg-canvas/60">
                  <td className="px-5 py-3 max-w-sm">
                    <div className="flex items-center gap-3">
                      <img src={unsplash(post.featured_image, { w: 96, q: 60 })} alt="" width={48} height={40} loading="lazy" className="w-12 h-10 object-cover rounded-sm border border-line shrink-0" />
                      <div className="min-w-0">
                        <Link to={`/blog/${post.slug}`} target="_blank" rel="noopener" className="font-semibold text-ink hover:text-accent-text truncate inline-flex items-center gap-1 max-w-full">
                          <span className="truncate">{post.title}</span>
                          <ArrowTopRightOnSquareIcon className="w-3 h-3 text-muted shrink-0" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </Link>
                        <span className="block text-xs text-muted">/{post.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs text-ink">{post.category}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs text-muted">{post.author}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => togglePublish(post)}
                      aria-pressed={post.is_published}
                      className={`btn btn-sm border ${post.is_published ? 'bg-success-soft text-success border-success/30' : 'bg-warning-soft text-warning border-warning/30'}`}
                      title={post.is_published ? 'Click to unpublish' : 'Click to publish'}
                    >
                      {post.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" aria-hidden="true" /> {post.views || 0}</span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs text-muted">
                    <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-right">
                    <Link to={`/admin/blog/edit/${post.id}`} className="btn-ghost btn-sm" aria-label={`Edit ${post.title}`}>
                      <PencilSquareIcon className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <button type="button" onClick={() => remove(post)} className="btn-ghost btn-sm text-danger hover:bg-danger-soft" aria-label={`Delete ${post.title}`}>
                      <TrashIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
