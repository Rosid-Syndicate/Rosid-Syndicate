import { useId, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { IMAGE_ACCEPT, uploadImage } from '../lib/uploads'

interface ImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  folder: 'blog' | 'testimonials'
  /** Allow pasting an https URL as an alternative to uploading */
  allowUrl?: boolean
  hint?: string
  previewClass?: string
}

/**
 * Admin image control: upload to the site-media bucket (with client-side
 * validation and downscaling) or paste an https URL. Shows a preview and lets
 * the user clear the value.
 */
export default function ImageField({ label, value, onChange, folder, allowUrl = true, hint, previewClass = 'aspect-[16/9]' }: ImageFieldProps) {
  const id = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const applyUrl = () => {
    const u = urlDraft.trim()
    if (!/^https:\/\/\S+$/i.test(u)) {
      toast.error('Enter an https:// image URL.')
      return
    }
    onChange(u)
    setUrlDraft('')
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      {value ? (
        <div className="relative rounded-sm overflow-hidden border border-line bg-canvas">
          <img src={value} alt="" className={`w-full ${previewClass} object-cover`} />
          <button type="button" onClick={() => onChange('')} className="absolute top-2 right-2 btn btn-sm bg-surface/95 text-ink border border-line" aria-label={`Remove ${label.toLowerCase()}`}>
            <XMarkIcon className="w-4 h-4" aria-hidden="true" /> Remove
          </button>
        </div>
      ) : (
        <label htmlFor={id} className="block border-2 border-dashed border-line rounded-sm p-6 text-center hover:border-ink/40 focus-within:border-ink transition-colors cursor-pointer bg-canvas">
          <input id={id} ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={uploading} />
          <PhotoIcon className="w-7 h-7 text-muted mx-auto mb-2" aria-hidden="true" />
          <span className="block text-sm font-bold text-ink">{uploading ? 'Uploading…' : 'Choose an image'}</span>
          <span className="block text-xs text-muted mt-1">{hint ?? 'JPG, PNG, WebP or GIF · up to 5 MB · large images are downscaled automatically'}</span>
        </label>
      )}
      {allowUrl && !value && (
        <div className="mt-2 flex gap-2">
          <label htmlFor={`${id}-url`} className="sr-only">Or paste an image URL</label>
          <input id={`${id}-url`} type="url" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="…or paste an https:// image URL" className="field py-2 text-xs font-mono" />
          <button type="button" onClick={applyUrl} className="btn-secondary btn-sm shrink-0">
            <ArrowUpTrayIcon className="w-4 h-4" aria-hidden="true" /> Use URL
          </button>
        </div>
      )}
    </div>
  )
}
