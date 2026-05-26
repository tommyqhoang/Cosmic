'use client'
import { useEffect, useRef, type ReactNode } from 'react'

// Accessible modal dialog: labelled, closes on Escape and overlay click,
// moves focus in on open and restores it on close, and locks body scroll.
export default function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = 'modal-title'
  const descId = description ? 'modal-desc' : undefined

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    // Move focus into the dialog.
    panelRef.current?.querySelector<HTMLElement>('input, button, textarea, select')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-overlay-in"
      style={{ backgroundColor: 'rgba(28,21,39,0.45)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 12px 48px rgba(28,21,39,0.22)' }}
      >
        <h3 id={titleId} className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{title}</h3>
        {description && <p id={descId} className="text-sm mt-1 mb-4" style={{ color: 'var(--foreground-subtle)' }}>{description}</p>}
        {children}
      </div>
    </div>
  )
}
