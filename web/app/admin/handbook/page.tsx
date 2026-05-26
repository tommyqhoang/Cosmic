'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Alert, Badge, Card, CardHeader, EmptyState, Input, Select, Spinner, PageHeader } from '@/components/admin/ui'
import type { HandbookItem, CommandSection } from '@/app/api/admin/handbook/route'

type Tab = 'Commands' | 'Items' | 'Maps' | 'Mobs' | 'Skills' | 'NPCs' | 'Jobs'

const TABS: { label: Tab; category: string | null }[] = [
  { label: 'Commands', category: 'commands' },
  { label: 'Items',    category: null },
  { label: 'Maps',     category: 'map' },
  { label: 'Mobs',     category: 'mob' },
  { label: 'Skills',   category: 'skill' },
  { label: 'NPCs',     category: 'npc' },
  { label: 'Jobs',     category: 'job' },
]

const ITEM_SUBCATEGORIES = [
  { label: 'Hair',      value: 'equip/hair' },
  { label: 'Face',      value: 'equip/face' },
  { label: 'Cap',       value: 'equip/cap' },
  { label: 'Coat',      value: 'equip/coat' },
  { label: 'Longcoat',  value: 'equip/longcoat' },
  { label: 'Pants',     value: 'equip/pants' },
  { label: 'Shoes',     value: 'equip/shoes' },
  { label: 'Cape',      value: 'equip/cape' },
  { label: 'Gloves',    value: 'equip/glove' },
  { label: 'Accessory', value: 'equip/accessory' },
  { label: 'Ring',      value: 'equip/ring' },
  { label: 'Shield',    value: 'equip/shield' },
  { label: 'Weapon',    value: 'equip/weapon' },
  { label: 'Skin',      value: 'equip/skin' },
  { label: 'Taming',    value: 'equip/taming' },
  { label: 'Pet Equip', value: 'equip/petequip' },
  { label: 'Use',       value: 'use' },
  { label: 'Cash',      value: 'cash' },
  { label: 'Etc',       value: 'etc' },
  { label: 'Setup',     value: 'setup' },
  { label: 'Pet',       value: 'pet' },
]

const SECTION_TONES: Record<string, 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'accent'> = {
  'Common Commands':    'neutral',
  'Donator Commands':   'success',
  'JrGM Commands':      'primary',
  'GM Commands':        'warning',
  'SuperGM Commands':   'danger',
  'Admin Commands':     'danger',
  'Developer Commands': 'accent',
}


function getImageUrl(tab: Tab, subCat: string, id: string): string | null {
  if (tab === 'Items') return `https://maplestory.io/api/GMS/83/item/${id}/icon`
  if (tab === 'Mobs')  return `https://maplestory.io/api/GMS/83/mob/${id}/render/stand`
  if (tab === 'Skills') return `https://maplestory.io/api/GMS/83/skill/${id}/icon`
  if (tab === 'NPCs')  return `https://maplestory.io/api/GMS/83/npc/${id}/render/stand`
  return null
}

function ItemImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="w-12 h-12 flex items-center justify-center rounded" style={{ backgroundColor: 'var(--surface-subtle)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ color: 'var(--foreground-subtle)' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="w-12 h-12 object-contain" onError={() => setFailed(true)} loading="lazy" />
  )
}

function CopyBadge({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }, [id])
  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Copied!' : 'Copy ID'}
      className="font-mono text-xs px-1 rounded transition-colors"
      style={{
        color: copied ? 'var(--success)' : 'var(--foreground-subtle)',
        backgroundColor: copied ? 'var(--success-subtle)' : 'transparent',
      }}
    >
      {id}
    </button>
  )
}

function ItemGrid({ items, tab, subCat }: { items: HandbookItem[]; tab: Tab; subCat: string }) {
  const hasImages = ['Items', 'Mobs', 'Skills', 'NPCs'].includes(tab)
  return (
    <div className={`grid gap-2 ${hasImages ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
      {items.map(item => {
        const imgUrl = hasImages ? getImageUrl(tab, subCat, item.id) : null
        return (
          <div
            key={item.id}
            className={`admin-card flex gap-3 items-center ${hasImages ? 'flex-col p-3 text-center' : 'flex-row px-4 py-3'}`}
          >
            {imgUrl && <ItemImage src={imgUrl} alt={item.name} />}
            <div className={`flex flex-col gap-0.5 min-w-0 ${hasImages ? 'items-center' : 'items-start'}`}>
              <CopyBadge id={item.id} />
              <span className="text-sm font-medium leading-tight" style={{ color: 'var(--foreground)' }}>
                {item.name}
              </span>
              {item.description && (
                <span
                  className="text-xs leading-tight line-clamp-2"
                  style={{ color: 'var(--foreground-subtle)' }}
                >
                  {item.description}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CommandsView({ sections, query }: { sections: CommandSection[]; query: string }) {
  const q = query.toLowerCase()
  const filtered = sections
    .map(s => ({
      ...s,
      commands: q
        ? s.commands.filter(c => c.cmd.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
        : s.commands,
    }))
    .filter(s => s.commands.length > 0)

  if (filtered.length === 0) {
    return <EmptyState title="No commands match your search" hint="Try a different keyword or clear the search." />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filtered.map(section => (
        <Card key={section.title}>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <span>{section.title}</span>
                <Badge tone={SECTION_TONES[section.title] ?? 'neutral'}>{section.commands.length}</Badge>
              </div>
            }
          />
          <div>
            {section.commands.map((cmd, i) => (
              <div
                key={cmd.cmd + i}
                className="flex gap-3 px-5 py-2.5 items-start"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <code
                  className="text-xs font-mono shrink-0 px-1.5 py-0.5 rounded mt-0.5"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    color: 'var(--primary)',
                    border: '1px solid var(--border-subtle)',
                    minWidth: '6rem',
                  }}
                >
                  {cmd.cmd}
                </code>
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {cmd.description}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function HandbookPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Commands')
  const [subCat, setSubCat] = useState('equip/hair')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<HandbookItem[]>([])
  const [sections, setSections] = useState<CommandSection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeCategory = useMemo(() => {
    const tab = TABS.find(t => t.label === activeTab)!
    return tab.category ?? subCat
  }, [activeTab, subCat])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setItems([])
    setSections([])

    fetch(`/api/admin/handbook?category=${encodeURIComponent(activeCategory)}`)
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.error ?? 'Failed to load') })
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        if (data.type === 'commands') setSections(data.sections)
        else setItems(data.items)
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [activeCategory])

  const filteredItems = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(it => it.name.toLowerCase().includes(q) || it.id.includes(q))
  }, [items, query])

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setQuery('')
  }

  function handleQueryChange(q: string) {
    setQuery(q)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="GM Handbook"
        subtitle="Search items, maps, mobs, skills, and commands by name or ID"
      />

      {/* Tab bar */}
      <div
        className="flex gap-1 overflow-x-auto pb-1 -mb-1"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {TABS.map(({ label }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleTabChange(label)}
            className="px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              color: activeTab === label ? 'var(--primary)' : 'var(--foreground-muted)',
              backgroundColor: activeTab === label ? 'var(--primary-subtle)' : 'transparent',
              borderBottom: activeTab === label ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        {activeTab === 'Items' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
              Category
            </label>
            <Select
              value={subCat}
              onChange={e => setSubCat(e.target.value)}
              className="text-sm"
              style={{ minWidth: '10rem' }}
            >
              {ITEM_SUBCATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-1 flex-1" style={{ minWidth: '16rem' }}>
          <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--foreground-subtle)' }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              placeholder={activeTab === 'Commands' ? 'Search commands…' : 'Search by name or ID…'}
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        {activeTab !== 'Commands' && !loading && items.length > 0 && (
          <p className="text-xs self-end pb-2.5" style={{ color: 'var(--foreground-subtle)' }}>
            {query ? `${filteredItems.length} of ${items.length} results` : `${items.length} entries`}
          </p>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="py-16 flex justify-center">
          <Spinner label="Loading" />
        </div>
      )}

      {!loading && error && (
        <Alert tone="danger">{error}</Alert>
      )}

      {!loading && !error && activeTab === 'Commands' && sections.length > 0 && (
        <CommandsView sections={sections} query={query} />
      )}

      {!loading && !error && activeTab !== 'Commands' && filteredItems.length > 0 && (
        <ItemGrid items={filteredItems} tab={activeTab} subCat={subCat} />
      )}

      {!loading && !error && activeTab !== 'Commands' && items.length > 0 && filteredItems.length === 0 && query && (
        <EmptyState
          title="No results"
          hint={`No entries match "${query}". Try a different name or paste the numeric ID.`}
        />
      )}

      {!loading && !error && activeTab === 'Commands' && sections.length === 0 && (
        <EmptyState title="No commands loaded" hint="Could not parse the commands file." />
      )}
    </div>
  )
}
