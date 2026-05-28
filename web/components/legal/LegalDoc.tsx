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
      {/* Title panel */}
      <div
        className="mb-8 px-6 py-5"
        style={{
          background: 'linear-gradient(to bottom, #f8efd0 0%, #e8dcc0 100%)',
          border: '3px solid #5a3e2a',
          boxShadow: 'inset 0 0 0 2px #fff, 4px 4px 0 rgba(0,0,0,0.25)',
          imageRendering: 'pixelated',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--ms-font-d)',
            fontSize: 14,
            color: '#3a2418',
            letterSpacing: 1,
            margin: '0 0 8px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: 'var(--ms-font-b)',
            fontSize: 18,
            color: '#7a5a3a',
          }}
        >
          Last updated: {updated}
        </p>
        <p
          className="mt-3 leading-relaxed"
          style={{
            fontFamily: 'var(--ms-font-b)',
            fontSize: 20,
            color: '#5a4a30',
          }}
        >
          {intro}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {sections.map((section, i) => (
          <section
            key={section.heading}
            className="px-5 py-5 sm:px-6 sm:py-6"
            style={{
              background: 'linear-gradient(to bottom, #f8efd0 0%, #e8dcc0 100%)',
              border: '3px solid #5a3e2a',
              boxShadow: 'inset 0 0 0 2px #fff, 4px 4px 0 rgba(0,0,0,0.25)',
              imageRendering: 'pixelated',
            }}
          >
            <h2
              className="flex items-center gap-2 mb-3"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                color: '#3a2418',
                letterSpacing: 1,
              }}
            >
              <span
                className="inline-flex items-center justify-center"
                style={{
                  width: 24,
                  height: 24,
                  background: '#3a2418',
                  color: '#f8c34a',
                  fontFamily: 'var(--ms-font-d)',
                  fontSize: 9,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.heading}
            </h2>
            {section.paragraphs?.map((p, j) => (
              <p
                key={j}
                className="mb-3 leading-relaxed"
                style={{
                  fontFamily: 'var(--ms-font-b)',
                  fontSize: 19,
                  color: '#5a4a30',
                }}
              >
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="flex flex-col gap-2 mt-1">
                {section.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 leading-relaxed"
                    style={{
                      fontFamily: 'var(--ms-font-b)',
                      fontSize: 19,
                      color: '#5a4a30',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{ color: '#c03a2b', fontSize: 16, lineHeight: '24px' }}
                    >
                      &#9654;
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div
        className="mt-10 pt-5 flex flex-wrap gap-x-4 gap-y-2"
        style={{
          borderTop: '2px dashed #5a3e2a',
          fontFamily: 'var(--ms-font-b)',
          fontSize: 18,
          color: '#5a4a30',
        }}
      >
        <Link href="/terms" style={{ color: '#3a5a8a', textDecoration: 'none' }}>
          Terms of Service
        </Link>
        <Link href="/privacy" style={{ color: '#3a5a8a', textDecoration: 'none' }}>
          Privacy Policy
        </Link>
        <Link href="/guide" style={{ color: '#3a5a8a', textDecoration: 'none' }}>
          Player Guide
        </Link>
      </div>
    </div>
  )
}
