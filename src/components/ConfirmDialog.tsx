import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Accessible confirmation dialog built on the native <dialog> element
 * (focus is trapped and Escape cancels by the browser). Replaces window.confirm
 * in the admin so destructive actions look and behave consistently.
 *
 *   const confirm = useConfirm()
 *   if (await confirm({ title: 'Delete post?', description: '…', confirmLabel: 'Delete', tone: 'danger' })) …
 */

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}

type Resolver = (value: boolean) => void
const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(() => Promise.resolve(false))

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<Resolver | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setOpts(null)
  }, [])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (opts && !d.open) d.showModal()
    if (!opts && d.open) d.close()
  }, [opts])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={() => resolver.current && settle(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) settle(false) // backdrop click
        }}
        className="backdrop:bg-ink/60 backdrop:backdrop-blur-[2px] bg-transparent p-0 m-auto max-w-md w-[calc(100%-2rem)] outline-none"
        aria-labelledby="confirm-title"
        aria-describedby={opts?.description ? 'confirm-desc' : undefined}
      >
        {opts && (
          <form method="dialog" className="card p-6 sm:p-7" onSubmit={(e) => e.preventDefault()}>
            <h2 id="confirm-title" className="text-h3 text-ink">{opts.title}</h2>
            {opts.description && <p id="confirm-desc" className="mt-2 text-sm text-muted leading-relaxed">{opts.description}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => settle(false)} className="btn-secondary btn-sm">
                {opts.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                autoFocus
                className={`btn btn-sm ${opts.tone === 'danger' ? 'bg-danger text-white hover:bg-red-800' : 'bg-ink text-white hover:bg-ink-700'}`}
              >
                {opts.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider
export const useConfirm = () => useContext(ConfirmContext)
