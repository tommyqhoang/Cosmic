"use client"

import { useState, useEffect } from 'react'
import { itemIcon } from '@/lib/maplestory'
import type { Smega } from '@/lib/community'
import CharAvatar from './CharAvatar'

function timeAgo(date: Date | string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`
}

const TYPE_LABELS: Record<string, string> = {
  mega: 'Mega', super: 'Super', item: 'Item', triple: 'Triple', tv: 'MapleTV',
}
function typeLabel(t: string): string {
  return TYPE_LABELS[t] ?? t
}

const SAMPLE_CLASSES = ['hero', 'bishop', 'bm', 'nightlord', 'shadower', 'buccaneer', 'paladin', 'il', 'fp', 'dk'] as const

export default function LiveSmegaFeed({ smegas }: { smegas: Smega[] }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(i)
  }, [])

  if (smegas.length === 0) {
    return (
      <div className="ms-pixel-panel rounded-xl text-center py-14 px-6">
        <div className="text-3xl mb-2" aria-hidden>📢</div>
        <p className="ms-section-title" style={{ fontSize: 'clamp(12px, 2vw, 16px)' }}>The feed is quiet… for now</p>
        <p className="ms-muted text-base mt-1">Fire a Super Megaphone in-game and it&apos;ll show up here instantly.</p>
      </div>
    )
  }

  return (
    <div className="w-full" style={{
      background: 'linear-gradient(to bottom, #c64b1b 0%, #8a2810 100%)',
      border: '3px solid #1a0a04',
      boxShadow: 'inset 2px 2px 0 #ff9a6a, inset -2px -2px 0 #5a0a04, 4px 4px 0 rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2" style={{
        background: '#1a0a04', color: '#f8c34a',
        fontFamily: 'var(--ms-font-d)', fontSize: 11, letterSpacing: 1,
        borderBottom: '2px solid #f8c34a',
      }}>
        <span aria-hidden>📢</span>
        <span className="hidden sm:inline">LIVE MEGAPHONE FEED</span>
        <span className="sm:hidden">SMEGAS</span>
        <span className="ml-auto" style={{ color: '#88f078', fontSize: 9 }}>
          <span className="animate-pulse-dot inline-block mr-1">●</span> LIVE · {smegas.length} RECENT
        </span>
      </div>

      {/* Feed items */}
      <div className="px-3.5 py-2.5 flex flex-col gap-2">
        {smegas.slice(0, 8).map((s, i) => {
          const cls = SAMPLE_CLASSES[i % SAMPLE_CLASSES.length]
          return (
            <div key={s.id} className="flex items-start gap-2.5 sm:gap-3" style={{ opacity: 1 - i * 0.08 }}>
              <div className="shrink-0 pt-0.5">
                <CharAvatar cls={cls} size={28} showLabel={false} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span style={{
                    fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#ffd96b',
                    letterSpacing: 0.5,
                  }}>{s.player}</span>
                  <span style={{
                    fontFamily: 'var(--ms-font-b)', fontSize: 'clamp(14px, 2vw, 18px)', color: '#fff8d8',
                    lineHeight: 1.2, wordBreak: 'break-word',
                  }}>
                    &ldquo;{s.message}&rdquo;
                  </span>
                  {s.itemId != null && (
                    <img src={itemIcon(s.itemId)} alt="" className="sprite inline-block" style={{ height: 18, width: 'auto', verticalAlign: 'middle' }} />
                  )}
                </div>
              </div>
              <span className="shrink-0 text-right pt-0.5" style={{
                fontFamily: 'var(--ms-font-d)', fontSize: 8, color: '#d8c08c',
                whiteSpace: 'nowrap',
              }}>
                <span className="hidden sm:inline">{typeLabel(s.type)} · ch{s.channel} · </span>
                {tick >= 0 ? timeAgo(s.createdAt) : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
