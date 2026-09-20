import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, EyeIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { renderMarkdown } from '../../lib/markdown'
import { unsplash } from '../../lib/images'
import RichTextEditor from '../../components/RichTextEditor'
import ImageField from '../../components/ImageField'
import type { BlogCategory, BlogPost } from '../../data/blog'
import { INITIAL_CATEGORIES } from '../../data/blog'

const PRESET_IMAGES = [
  { label: 'Corporate & architecture', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab' },
  { label: 'Infrastructure & construction', url: 'https://images.unsplash.com/photo-1527335988388-b40ee248d80c' },
  { label: 'Finance & banking', url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a' },
  { label: 'Energy & hydropower', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c' },
]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const slugify = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 120)

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

/**
 * Create / edit a blog post.
 *
 * Fixes vs. the previous editor: a failed save is reported as a failure (it used
 * to toast "created (local session)" and navigate away, losing the article);
 * editing no longer resets published_at; the post is looked up by id OR slug
 * with a proper query instead of string-building a PostgREST filter from the URL.
 */
export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [categories, setCategories] = useState<BlogCategory[]>(INITIAL_CATEGORIES)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [postId, setPostId] = useState<string | null>(null)
  const [originalPublishedAt, setOriginalPublishedAt] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [categorySlug, setCategorySlug] = useState('company-news')
  const [author, setAuthor] = useState('Rosid Editorial Team')
  const [authorRole, setAuthorRole] = useState('Executive Advisory')
  const [readingTime, setReadingTime] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    supabase
      .from('blog_categories')
      .select('id, name, slug, description')
      .order('name')
      .then(({ data }) => {
        if (data && data.length) setCategories(data as BlogCategory[])
      })
  }, [])

  useEffect(() => {
    if (!isEditing || !id) return
    let cancelled = false
    const query = supabase.from('blog_posts').select('*')
    const lookup = UUID_RE.test(id) ? query.eq('id', id) : query.eq('slug', id)
    lookup.maybeSingle().then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) {
        toast.error('Post not found')
        navigate('/admin/blog', { replace: true })
        return
      }
      const p = data as BlogPost
      setPostId(p.id)
      setTitle(p.title)
      setSlug(p.slug)
      setSlugTouched(true)
      setExcerpt(p.excerpt)
      setContent(p.content)
      setFeaturedImage(p.featured_image)
      setCategorySlug(p.category_slug)
      setAuthor(p.author)
      setAuthorRole(p.author_role || '')
      setReadingTime(p.reading_time || '')
      setIsPublished(p.is_published)
      setTagsInput((p.tags ?? []).join(', '))
      setOriginalPublishedAt(p.published_at)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [id, isEditing, navigate])

  const onTitleChange = (v: string) => {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      toast.error('Title, excerpt and content are required.')
      return
    }
    const finalSlug = slugify(slug || title)
    if (!finalSlug) {
      toast.error('Please provide a URL slug.')
      return
    }
    if (!featuredImage) {
      toast.error('Please add a cover image (upload one or pick a preset).')
      return
    }
    let imageUrl: string
    try {
      const u = new URL(featuredImage)
      if (!/^https?:$/.test(u.protocol)) throw new Error('bad protocol')
      imageUrl = u.toString()
    } catch {
      toast.error('Featured image must be an http(s) URL.')
      return
    }

    setSaving(true)
    const category = categories.find((c) => c.slug === categorySlug)
    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content,
      featured_image: imageUrl,
      category: category?.name ?? 'Company News',
      category_slug: categorySlug,
      author: author.trim() || 'Rosid Editorial Team',
      author_role: authorRole.trim() || null,
      is_published: isPublished,
      reading_time: readingTime.trim() || estimateReadingTime(content),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      // Keep the original publication date when editing.
      published_at: originalPublishedAt ?? new Date().toISOString(),
    }

    const result = isEditing && postId
      ? await supabase.from('blog_posts').update(payload).eq('id', postId)
      : await supabase.from('blog_posts').insert([payload])

    setSaving(false)
    if (result.error) {
      const msg = /duplicate key/i.test(result.error.message) ? 'That URL slug is already in use.' : result.error.message
      toast.error(`Save failed: ${msg}`)
      return
    }
    toast.success(isEditing ? 'Article updated' : 'Article created')
    navigate('/admin/blog')
  }

  if (loading) {
    return <p className="p-10 text-sm text-muted" role="status">Loading post…</p>
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <Link to="/admin/blog" className="btn-ghost btn-sm" aria-label="Back to blog posts">
            <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-h3 text-ink">{isEditing ? 'Edit article' : 'New article'}</h1>
            <p className="text-xs text-muted">{isEditing ? `Editing: ${title || slug}` : 'Draft and publish editorial content.'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setTab(tab === 'write' ? 'preview' : 'write')} className="btn-secondary btn-sm" aria-pressed={tab === 'preview'}>
            {tab === 'write' ? (<><EyeIcon className="w-4 h-4" aria-hidden="true" /> Preview</>) : (<><DocumentTextIcon className="w-4 h-4" aria-hidden="true" /> Editor</>)}
          </button>
          <button type="submit" form="blog-editor-form" disabled={saving} className="btn-primary btn-sm" aria-busy={saving}>
            <CheckIcon className="w-4 h-4" aria-hidden="true" /> {saving ? 'Saving…' : isPublished ? 'Save & publish' : 'Save draft'}
          </button>
        </div>
      </header>

      {tab === 'preview' ? (
        <article className="card p-8 sm:p-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-accent-text">{categories.find((c) => c.slug === categorySlug)?.name || 'Category'}</p>
            <h2 className="mt-3 text-h1">{title || 'Article title'}</h2>
            <p className="mt-5 text-lead text-ink bg-canvas p-5 border-l-4 border-accent">{excerpt || 'Article excerpt…'}</p>
            {featuredImage && <img src={unsplash(featuredImage, { w: 1200, q: 70 })} alt="" className="mt-8 w-full aspect-[16/9] object-cover rounded-sm border border-line" />}
            <div className="prose-body mt-8">{content ? renderMarkdown(content) : <p className="text-muted">No content yet.</p>}</div>
          </div>
        </article>
      ) : (
        <form id="blog-editor-form" onSubmit={handleSave} className="space-y-6" noValidate>
          <fieldset className="card p-6 sm:p-8 space-y-5">
            <legend className="text-xs font-bold uppercase tracking-[0.1em] text-muted px-1">Article information</legend>

            <div>
              <label htmlFor="post-title" className="field-label">Title <span aria-hidden="true" className="text-accent-text">*</span></label>
              <input id="post-title" type="text" required maxLength={500} value={title} onChange={(e) => onTitleChange(e.target.value)} className="field" placeholder="e.g. A guide to bank guarantees for foreign contractors in Nepal" />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="post-slug" className="field-label">URL slug <span aria-hidden="true" className="text-accent-text">*</span></label>
                <input id="post-slug" type="text" required maxLength={120} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }} onBlur={() => setSlug(slugify(slug))} className="field font-mono text-xs" placeholder="guide-to-bank-guarantees" aria-describedby="slug-help" />
                <p id="slug-help" className="mt-1 text-xs text-muted">Public URL: /blog/{slugify(slug || title) || '…'}</p>
              </div>
              <div>
                <label htmlFor="post-category" className="field-label">Category <span aria-hidden="true" className="text-accent-text">*</span></label>
                <select id="post-category" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="field">
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="post-excerpt" className="field-label">Excerpt (meta description) <span aria-hidden="true" className="text-accent-text">*</span></label>
              <textarea id="post-excerpt" rows={2} required maxLength={300} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="field" placeholder="One or two sentences shown on cards and in search results." aria-describedby="excerpt-help" />
              <p id="excerpt-help" className="mt-1 text-xs text-muted">{excerpt.length}/300 · aim for 120–160 characters.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label htmlFor="post-author" className="field-label">Author</label>
                <input id="post-author" type="text" maxLength={255} value={author} onChange={(e) => setAuthor(e.target.value)} className="field" />
              </div>
              <div>
                <label htmlFor="post-author-role" className="field-label">Author role</label>
                <input id="post-author-role" type="text" maxLength={255} value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} className="field" placeholder="e.g. Executive Advisory Desk" />
              </div>
              <div>
                <label htmlFor="post-reading" className="field-label">Reading time</label>
                <input id="post-reading" type="text" maxLength={50} value={readingTime} onChange={(e) => setReadingTime(e.target.value)} className="field" placeholder={estimateReadingTime(content)} aria-describedby="reading-help" />
                <p id="reading-help" className="mt-1 text-xs text-muted">Leave blank to estimate from the content.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 items-end">
              <div>
                <label htmlFor="post-tags" className="field-label">Tags (comma separated)</label>
                <input id="post-tags" type="text" maxLength={300} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="field" placeholder="Foreign contractors, Procurement, Guarantees" />
              </div>
              <label className="inline-flex items-center gap-3 min-h-[44px] cursor-pointer">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 rounded-sm border-line text-ink focus:ring-ink" />
                <span className="text-sm font-semibold text-ink">Published on the live website</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="card p-6 sm:p-8 space-y-4">
            <legend className="text-xs font-bold uppercase tracking-[0.1em] text-muted px-1">Featured image</legend>
            <ImageField label="Cover image" value={featuredImage} onChange={setFeaturedImage} folder="blog" hint="Landscape, at least 1200 px wide · JPG, PNG or WebP · up to 5 MB" />
            {!featuredImage && (
              <div role="group" aria-label="Preset images">
                <p className="text-xs font-semibold text-muted mb-2">Or pick a stock preset:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_IMAGES.map((preset) => (
                    <button key={preset.url} type="button" onClick={() => setFeaturedImage(preset.url)} className="p-2 text-left rounded-sm border border-line hover:border-ink/40 text-muted text-xs transition-colors">
                      <img src={unsplash(preset.url, { w: 320, q: 55 })} alt="" loading="lazy" className="w-full h-16 object-cover rounded-sm mb-1.5" />
                      <span className="block truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>

          <section aria-labelledby="body-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="body-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Article body <span aria-hidden="true" className="text-accent-text">*</span></h2>
              <p className="text-xs text-muted">Headings, lists, quotes, links and uploaded images. Stored as Markdown; raw HTML is never published.</p>
            </div>
            <RichTextEditor value={content} onChange={setContent} ariaLabelledBy="body-heading" />
          </section>
        </form>
      )}
    </div>
  )
}
