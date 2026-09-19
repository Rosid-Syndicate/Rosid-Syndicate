import type { ReactNode } from 'react'

/**
 * Minimal, safe renderer for the markdown subset used by the blog editor:
 *   ## / ### headings · paragraphs · - / * bullet lists · 1. numbered lists
 *   --- rules · ``` code fences · **bold** · *italic* · [text](url)
 *
 * It builds React elements instead of HTML strings, so raw HTML in content is
 * rendered as text (the previous renderer used dangerouslySetInnerHTML over
 * unescaped content and allowed javascript: links). Only http(s), mailto and
 * same-site relative URLs are linkable.
 */

const SAFE_URL = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i
// C0 control characters and DEL, built without escape sequences so the source stays ASCII.
const CONTROL_CHARS = new RegExp(`[${String.fromCharCode(0)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`)

function safeHref(url: string): string | null {
  const trimmed = url.trim()
  if (!SAFE_URL.test(trimmed)) return null
  if (CONTROL_CHARS.test(trimmed)) return null
  return trimmed
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // tokens: [text](url) | **bold** | *italic*
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const key = `${keyPrefix}-${i++}`
    if (m[1] !== undefined) {
      const href = safeHref(m[2])
      const external = href ? /^https?:\/\//i.test(href) : false
      nodes.push(
        href ? (
          <a key={key} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {m[1]}
          </a>
        ) : (
          <span key={key}>{m[1]}</span>
        )
      )
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={key}>{m[3]}</strong>)
    } else if (m[4] !== undefined) {
      nodes.push(<em key={key}>{m[4]}</em>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function renderMarkdown(content: string): ReactNode[] {
  const blocks = content.replace(/\r\n?/g, '\n').split(/\n{2,}/)
  const out: ReactNode[] = []

  blocks.forEach((raw, index) => {
    const block = raw.trim()
    if (!block) return
    const key = `b${index}`

    if (block.startsWith('```')) {
      const code = block.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '')
      out.push(
        <pre key={key}>
          <code>{code}</code>
        </pre>
      )
      return
    }
    if (/^---+$/.test(block)) {
      out.push(<hr key={key} />)
      return
    }
    if (block.startsWith('### ')) {
      out.push(<h3 key={key}>{renderInline(block.slice(4), key)}</h3>)
      return
    }
    if (block.startsWith('## ')) {
      out.push(<h2 key={key}>{renderInline(block.slice(3), key)}</h2>)
      return
    }
    if (block.startsWith('# ')) {
      // A single H1 belongs to the page title; demote stray H1s in content.
      out.push(<h2 key={key}>{renderInline(block.slice(2), key)}</h2>)
      return
    }
    if (block.startsWith('> ')) {
      out.push(<blockquote key={key}>{renderInline(block.replace(/^>\s?/gm, ''), key)}</blockquote>)
      return
    }
    const lines = block.split('\n')
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push(
        <ul key={key}>
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^[-*]\s+/, ''), `${key}-${i}`)}</li>
          ))}
        </ul>
      )
      return
    }
    if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      out.push(
        <ol key={key}>
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\d+\.\s+/, ''), `${key}-${i}`)}</li>
          ))}
        </ol>
      )
      return
    }
    // paragraph — single newlines inside a paragraph become line breaks
    const parts: ReactNode[] = []
    lines.forEach((l, i) => {
      if (i > 0) parts.push(<br key={`${key}-br${i}`} />)
      parts.push(...renderInline(l, `${key}-l${i}`))
    })
    out.push(<p key={key}>{parts}</p>)
  })

  return out
}

/** Plain-text excerpt (for meta descriptions) from markdown content. */
export function markdownToText(content: string, max = 160): string {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_>`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}
