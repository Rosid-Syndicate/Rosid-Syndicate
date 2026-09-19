import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, ArrowLeftIcon, FolderIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import type { BlogCategory } from '../../data/blog'

const slugify = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80)

export default function AdminCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('blog_categories').select('id, name, slug, description').order('name').limit(200)
    if (error) {
      setState('error')
      toast.error(`Could not load categories: ${error.message}`)
      return
    }
    setCategories((data ?? []) as BlogCategory[])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const finalSlug = slugify(slug || name)
    if (!name.trim() || !finalSlug) {
      toast.error('Category name and slug are required.')
      return
    }
    setAdding(true)
    const { error } = await supabase.from('blog_categories').insert([{ name: name.trim(), slug: finalSlug, description: description.trim() || null }])
    setAdding(false)
    if (error) {
      toast.error(/duplicate key/i.test(error.message) ? 'That slug already exists.' : `Could not create category: ${error.message}`)
      return
    }
    toast.success('Category created')
    setName('')
    setSlug('')
    setSlugTouched(false)
    setDescription('')
    load()
  }

  const remove = async (cat: BlogCategory) => {
    if (!window.confirm(`Delete category "${cat.name}"? Posts keep their category label but the category page will disappear.`)) return
    const { error } = await supabase.from('blog_categories').delete().eq('id', cat.id)
    if (error) {
      toast.error(`Delete failed: ${error.message}`)
      return
    }
    setCategories((list) => list.filter((c) => c.id !== cat.id))
    toast.success('Category deleted')
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto">
      <header className="flex items-center gap-3 mb-8 pb-4 border-b border-line">
        <Link to="/admin/blog" className="btn-ghost btn-sm" aria-label="Back to blog posts">
          <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-h3 text-ink">Blog categories</h1>
          <p className="text-xs text-muted">Organise articles by discipline.</p>
        </div>
      </header>

      <div className="grid md:grid-cols-12 gap-6">
        <form onSubmit={add} className="md:col-span-5 card p-6 space-y-4" noValidate>
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted pb-3 border-b border-line inline-flex items-center gap-2">
            <PlusIcon className="w-4 h-4 text-accent-text" aria-hidden="true" /> Add category
          </h2>
          <div>
            <label htmlFor="cat-name" className="field-label">Name <span aria-hidden="true" className="text-accent-text">*</span></label>
            <input id="cat-name" type="text" required maxLength={255} value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }} className="field" placeholder="e.g. Renewable energy" />
          </div>
          <div>
            <label htmlFor="cat-slug" className="field-label">Slug <span aria-hidden="true" className="text-accent-text">*</span></label>
            <input id="cat-slug" type="text" required maxLength={80} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }} onBlur={() => setSlug(slugify(slug))} className="field font-mono text-xs" placeholder="renewable-energy" />
          </div>
          <div>
            <label htmlFor="cat-desc" className="field-label">Description</label>
            <textarea id="cat-desc" rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} className="field" placeholder="Shown on the category page." />
          </div>
          <button type="submit" disabled={adding} className="btn-primary w-full" aria-busy={adding}>
            {adding ? 'Adding…' : 'Add category'}
          </button>
        </form>

        <section className="md:col-span-7 card overflow-hidden" aria-labelledby="existing-cats">
          <h2 id="existing-cats" className="p-4 bg-canvas border-b border-line text-xs font-bold uppercase tracking-[0.1em] text-muted">
            Existing categories ({categories.length})
          </h2>
          {state === 'loading' ? (
            <p className="p-6 text-sm text-muted" role="status">Loading…</p>
          ) : state === 'error' ? (
            <p className="p-6 text-sm text-danger" role="alert">Categories could not be loaded.</p>
          ) : categories.length === 0 ? (
            <p className="p-6 text-sm text-muted">No categories yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {categories.map((cat) => (
                <li key={cat.id} className="p-4 flex items-start justify-between gap-4 hover:bg-canvas/60">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FolderIcon className="w-4 h-4 text-accent-text shrink-0" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-ink">{cat.name}</h3>
                      <Link to={`/blog/category/${cat.slug}`} target="_blank" rel="noopener" className="text-xs font-mono text-muted hover:text-ink">/blog/category/{cat.slug}</Link>
                    </div>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{cat.description || 'No description.'}</p>
                  </div>
                  <button type="button" onClick={() => remove(cat)} className="btn-ghost btn-sm text-danger hover:bg-danger-soft shrink-0" aria-label={`Delete category ${cat.name}`}>
                    <TrashIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
