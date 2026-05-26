import Link from 'next/link'

export type LegalSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export default function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1
          className="font-display font-bold text-2xl sm:text-3xl"
          style={{ color: 'var(--foreground)', letterSpacing: '0.03em' }}
        >
          {title}
        </h1>
        <p className="text-xs mt-2" style={{ color: 'var(--foreground-subtle)' }}>
          Last updated: {updated}
        </p>
        <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
          {intro}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((section, i) => (
          <section key={section.heading}>
            <h2
              className="font-display font-bold text-lg mb-3 flex items-baseline gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              <span className="font-mono text-sm" style={{ color: 'var(--primary)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.heading}
            </h2>
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="text-sm leading-relaxed mb-3" style={{ color: 'var(--foreground-muted)' }}>
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="flex flex-col gap-2 mt-1">
                {section.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm leading-relaxed"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <span aria-hidden style={{ color: 'var(--primary)' }}>•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div
        className="mt-12 pt-6 text-sm flex flex-wrap gap-x-4 gap-y-1"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--foreground-subtle)' }}
      >
        <Link href="/terms" className="hover:underline" style={{ color: 'var(--primary)' }}>Terms of Service</Link>
        <Link href="/privacy" className="hover:underline" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
        <Link href="/guide" className="hover:underline" style={{ color: 'var(--primary)' }}>Player Guide</Link>
      </div>
    </div>
  )
}
