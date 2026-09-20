// Attachment validation for the tender form. The browser sends
// { filename, content (base64) }. Nothing is executed or written to disk; the
// bytes are only forwarded to the email provider after these checks pass.

export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024 // 2 MB decoded

const ALLOWED = {
  pdf: { mime: 'application/pdf', magic: [Buffer.from('%PDF')] },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', magic: [Buffer.from([0x50, 0x4b, 0x03, 0x04])] },
  xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', magic: [Buffer.from([0x50, 0x4b, 0x03, 0x04])] },
}

export function safeFilename(name) {
  // strip any path component, keep a conservative character set
  let base = String(name || '').split(/[\\/]/).pop() || ''
  base = base.replace(/[^A-Za-z0-9._ -]/g, '_').replace(/\s+/g, ' ').trim()
  base = base.replace(/^\.+/, '') // no dot-files
  if (base.length > 120) {
    const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : ''
    base = base.slice(0, 120 - ext.length) + ext
  }
  return base || 'attachment'
}

/**
 * @returns {{ok: true, attachment: {filename: string, content: string, contentType: string}} | {ok: false, error: string}}
 */
export function validateAttachment(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, attachment: null }
  if (typeof raw !== 'object') return { ok: false, error: 'Invalid attachment.' }

  const filename = safeFilename(raw.filename)
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.') + 1).toLowerCase() : ''
  const spec = ALLOWED[ext]
  if (!spec) return { ok: false, error: 'Only PDF, DOCX and XLSX files are accepted.' }

  const content = typeof raw.content === 'string' ? raw.content.replace(/^data:[^;]+;base64,/, '') : ''
  if (!content || !/^[A-Za-z0-9+/=\r\n]+$/.test(content)) {
    return { ok: false, error: 'Attachment content is not valid.' }
  }
  // 4/3 expansion: reject before decoding anything oversized
  if (content.length > Math.ceil(MAX_ATTACHMENT_BYTES * 1.37)) {
    return { ok: false, error: 'Attachment exceeds the 2 MB limit.' }
  }

  let bytes
  try {
    bytes = Buffer.from(content, 'base64')
  } catch {
    return { ok: false, error: 'Attachment content is not valid.' }
  }
  if (bytes.length === 0 || bytes.length > MAX_ATTACHMENT_BYTES) {
    return { ok: false, error: 'Attachment exceeds the 2 MB limit.' }
  }

  const magicOk = spec.magic.some((m) => bytes.subarray(0, m.length).equals(m))
  if (!magicOk) return { ok: false, error: 'The file content does not match its extension.' }

  return {
    ok: true,
    attachment: { filename, content: bytes.toString('base64'), contentType: spec.mime },
  }
}
