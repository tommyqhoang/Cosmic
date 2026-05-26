import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/** Tiny className joiner (no dep needed). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

// ── Button ───────────────────────────────────────────────────
type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost'
type Size = 'sm' | 'md'

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', border: '1px solid transparent' },
  secondary: { backgroundColor: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' },
  danger: { backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)', border: '1px solid var(--destructive-border)' },
  success: { backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' },
  warning: { backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)', border: '1px solid #fde68a' },
  ghost: { backgroundColor: 'transparent', color: 'var(--foreground-muted)', border: '1px solid transparent' },
}

const SIZE_CLS: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className, style, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        SIZE_CLS[size],
        className,
      )}
      style={{ ...VARIANT_STYLE[variant], ...style }}
      {...rest}
    />
  )
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('admin-card', className)} {...rest}>{children}</div>
}

export function CardHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}
    >
      <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
      {action}
    </div>
  )
}

// ── Page header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

// ── Form field wrapper ───────────────────────────────────────
export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string | null; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>{label}</label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>{hint}</p>}
      {error && <p className="text-xs" style={{ color: 'var(--destructive)' }} role="alert">{error}</p>}
    </div>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('admin-field', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('admin-field resize-y', className)} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select className={cn('admin-field', className)} {...rest}>{children}</select>
}

// ── Badge ────────────────────────────────────────────────────
type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'accent'
const TONE_STYLE: Record<Tone, React.CSSProperties> = {
  neutral: { backgroundColor: 'var(--surface-subtle)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' },
  primary: { backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' },
  success: { backgroundColor: 'var(--success-subtle)', color: 'var(--success)' },
  warning: { backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)' },
  danger: { backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)' },
  accent: { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)' },
}
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded" style={TONE_STYLE[tone]}>
      {children}
    </span>
  )
}

// ── Empty state ──────────────────────────────────────────────
export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center gap-2" style={{ backgroundColor: 'var(--surface)' }}>
      {icon && <div style={{ color: 'var(--foreground-subtle)' }}>{icon}</div>}
      <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>{title}</p>
      {hint && <p className="text-xs max-w-sm" style={{ color: 'var(--foreground-subtle)' }}>{hint}</p>}
    </div>
  )
}

// ── Alert ────────────────────────────────────────────────────
export function Alert({ tone = 'danger', children, onDismiss }: { tone?: 'danger' | 'success'; children: ReactNode; onDismiss?: () => void }) {
  const style: React.CSSProperties = tone === 'danger'
    ? { backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)', border: '1px solid var(--destructive-border)' }
    : { backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }
  return (
    <div role="alert" className="rounded-lg px-4 py-3 text-sm font-medium flex items-start justify-between gap-3" style={style}>
      <span>{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="underline opacity-70 shrink-0 hover:opacity-100">Dismiss</button>
      )}
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-subtle)' }} role="status">
      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span>{label}…</span>
    </span>
  )
}
