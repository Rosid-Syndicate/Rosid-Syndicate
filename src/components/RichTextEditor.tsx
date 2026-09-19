import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import toast from 'react-hot-toast'
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  LinkIcon,
  PhotoIcon,
  ListBulletIcon,
  NumberedListIcon,
  ChatBubbleLeftIcon,
  CodeBracketIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'
import { IMAGE_ACCEPT, uploadImage } from '../lib/uploads'

interface RichTextEditorProps {
  /** Markdown source of truth */
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  id?: string
  ariaLabelledBy?: string
}

/**
 * WYSIWYG editor for blog posts. Content is stored as Markdown (the public
 * site renders it with the safe renderer in src/lib/markdown.tsx), so nothing
 * changes for existing posts and no HTML is ever persisted. Images upload to
 * the site-media bucket and are inserted as ![alt](https://…).
 */
export default function RichTextEditor({ value, onChange, placeholder = 'Write the article…', id, ariaLabelledBy }: RichTextEditorProps) {
  const lastEmitted = useRef(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', protocols: ['https', 'mailto'], HTMLAttributes: { rel: 'noopener noreferrer' } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: 'prose-body min-h-[22rem] px-5 py-4 focus:outline-none',
        ...(id ? { id } : {}),
        ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.getMarkdown()
      lastEmitted.current = md
      onChange(md)
    },
  })

  // External value change (e.g. post loaded after mount) → replace content.
  useEffect(() => {
    if (!editor) return
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return <div className="card min-h-[22rem]" aria-busy="true" />

  return (
    <div className="card overflow-hidden focus-within:ring-2 focus-within:ring-ink/20">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolButton({ onClick, active, disabled, label, children }: { onClick: () => void; active?: boolean; disabled?: boolean; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep editor selection
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`grid place-items-center min-w-[36px] h-9 px-2 rounded-sm text-sm font-bold transition-colors duration-fast disabled:opacity-40 ${active ? 'bg-ink text-white' : 'text-ink hover:bg-canvas'}`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [linkDraft, setLinkDraft] = useState<string | null>(null)

  const insertImage = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, 'blog')
      const alt = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ')
      editor.chain().focus().setImage({ src: url, alt }).run()
      toast.success('Image inserted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const openLink = () => {
    const current = editor.getAttributes('link').href as string | undefined
    setLinkDraft(current ?? 'https://')
  }
  const applyLink = () => {
    const href = (linkDraft ?? '').trim()
    setLinkDraft(null)
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    if (!/^(https:\/\/|mailto:)/i.test(href)) {
      toast.error('Links must start with https:// or mailto:')
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  const headingLevel = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'

  return (
    <div className="border-b border-line bg-canvas/60 px-2 py-1.5 flex flex-wrap items-center gap-1" role="toolbar" aria-label="Formatting">
      <label className="sr-only" htmlFor="rte-block">Block type</label>
      <select
        id="rte-block"
        value={headingLevel}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const v = e.target.value
          if (v === 'p') editor.chain().focus().setParagraph().run()
          else editor.chain().focus().toggleHeading({ level: v === 'h2' ? 2 : 3 }).run()
        }}
        className="h-9 rounded-sm border border-line bg-surface px-2 text-xs font-semibold text-ink"
      >
        <option value="p">Paragraph</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <span className="w-px h-6 bg-line mx-1" aria-hidden="true" />
      <ToolButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><span className="font-black">B</span></ToolButton>
      <ToolButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><span className="italic font-serif">I</span></ToolButton>
      <ToolButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><ListBulletIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><NumberedListIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>
      <ToolButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><ChatBubbleLeftIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>
      <ToolButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><CodeBracketIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>
      <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><MinusIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>

      <span className="w-px h-6 bg-line mx-1" aria-hidden="true" />
      <ToolButton label={editor.isActive('link') ? 'Edit link' : 'Add link'} active={editor.isActive('link')} onClick={openLink}><LinkIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>
      <ToolButton label={uploading ? 'Uploading image…' : 'Insert image'} disabled={uploading} onClick={() => fileRef.current?.click()}><PhotoIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>
      <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} onChange={(e) => insertImage(e.target.files?.[0])} />

      <span className="flex-1" />
      <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><ArrowUturnLeftIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>
      <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><ArrowUturnRightIcon className="w-4 h-4" aria-hidden="true" /></ToolButton>

      {linkDraft !== null && (
        <div className="basis-full flex items-center gap-2 pt-2" role="group" aria-label="Link URL">
          <label htmlFor="rte-link" className="sr-only">Link URL</label>
          <input
            id="rte-link"
            type="url"
            autoFocus
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink() }
              if (e.key === 'Escape') setLinkDraft(null)
            }}
            className="field py-1.5 text-xs font-mono"
            placeholder="https://… or mailto:…"
          />
          <button type="button" onClick={applyLink} className="btn-primary btn-sm">Apply</button>
          <button type="button" onClick={() => { setLinkDraft(''); applyLink() }} className="btn-ghost btn-sm">Remove link</button>
          <button type="button" onClick={() => setLinkDraft(null)} className="btn-ghost btn-sm">Cancel</button>
        </div>
      )}
    </div>
  )
}
