import { ReactNode } from 'react'

export default function SectionBanner({ children }: { children: ReactNode }) {
  return <div className="ms-section-banner">{children}</div>
}
