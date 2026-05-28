import type { Metadata } from 'next'
import Sprite from '@/components/maple/Sprite'
import {
  droppersOfItem, dropsOfMob, globalDropsOfItem, dropRatePct,
  type MobDrop, type GlobalDrop,
} from '@/lib/drops'
import {
  itemIcon, mobRender, searchItemIds, searchMobIds,
  resolveItemNames, resolveMobNames,
} from '@/lib/maplestory'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Drop Search — Where to Find Items',
  description: 'Search the ShinyMS MapleStory v83 drop tables: find which monsters drop any item, or look up a monster’s full loot table with base drop rates and quantities.',
  alternates: { canonical: 'https://shinyms.com/drops' },
  openGraph: { url: 'https://shinyms.com/drops', title: 'Drop Search | ShinyMS', description: 'Find which monsters drop any item, or look up a monster’s full drop table.' },
}

const MAX_MATCHES = 6

function rateColor(chance: number): { bg: string; fg: string } {
  const pct = (chance / 1_000_000) * 100
  if (pct >= 10) return { bg: '#e8f5ef', fg: '#1d6b41' }
  if (pct >= 1) return { bg: '#e8f0f8', fg: '#3b6ea5' }
  return { bg: '#fef8e7', fg: '#6b4e10' }
}

function qtyLabel(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`
}

/** Pixel-art icon tile with pixel border. */
function IconTile({ src, alt, size = 56 }: { src: string; alt: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 sprite"
      style={{
        width: size,
        height: size,
        backgroundColor: '#f8efd0',
        border: '2px solid #3a2418',
        boxShadow: 'inset 1px 1px 0 #fff5d8, inset -1px -1px 0 #b89460',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" draggable={false}
        className="sprite" style={{ maxHeight: size - 12, maxWidth: size - 12, width: 'auto', height: 'auto' }} />
    </span>
  )
}

function RatePill({ chance }: { chance: number }) {
  const { bg, fg } = rateColor(chance)
  return (
    <span
      className="inline-block"
      style={{
        fontFamily: 'var(--ms-font-d)',
        fontSize: '9px',
        letterSpacing: '1px',
        backgroundColor: bg,
        color: fg,
        border: '2px solid #3a2418',
        padding: '4px 8px',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
      }}
    >
      {dropRatePct(chance)}
    </span>
  )
}

/** One row inside a drop list. */
function DropRow({
  iconSrc, name, chance, min, max, questid,
}: {
  iconSrc: string; name: string; chance: number; min: number; max: number; questid: number
}) {
  return (
    <li
      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--ms-slot-hover)]"
      style={{ backgroundColor: 'var(--ms-panel-bg)' }}
    >
      <IconTile src={iconSrc} alt={name} size={44} />
      <div className="min-w-0 flex-1">
        <div
          className="truncate"
          style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#2a1810' }}
        >
          {name}
        </div>
        <div style={{ fontFamily: 'var(--ms-font-b)', fontSize: '16px', color: '#4a3220' }}>
          Qty {qtyLabel(min, max)}{questid > 0 ? ' · quest item' : ''}
        </div>
      </div>
      <RatePill chance={chance} />
    </li>
  )
}

/** Resolve a free-text or numeric query into a bounded list of ids. */
async function resolveQuery(q: string, kind: 'item' | 'mob'): Promise<number[]> {
  const term = q.trim()
  if (!term) return []
  if (/^\d+$/.test(term)) return [Number(term)]
  return kind === 'item' ? searchItemIds(term, MAX_MATCHES) : searchMobIds(term, MAX_MATCHES)
}

// ── Item view: "which monsters drop this item?" ──
async function ItemResults({ itemId }: { itemId: number }) {
  const [drops, globals] = await Promise.all([droppersOfItem(itemId), globalDropsOfItem(itemId)])
  const mobIds = drops.map((d) => d.dropperid)
  const [itemNames, mobNames] = await Promise.all([resolveItemNames([itemId]), resolveMobNames(mobIds)])
  const itemName = itemNames.get(itemId) ?? `Item #${itemId}`

  const empty = drops.length === 0 && globals.length === 0
  return (
    <section className="ms-pixel-panel overflow-hidden">
      <header
        className="flex items-center gap-4 px-4 py-3"
        style={{
          background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 50%, #3a2418 100%)',
          borderBottom: '3px solid #2a1810',
        }}
      >
        <IconTile src={itemIcon(itemId)} alt={itemName} />
        <div>
          <h2
            style={{ fontFamily: 'var(--ms-font-d)', fontSize: '12px', color: '#ffd96b', letterSpacing: '1px', textShadow: '2px 2px 0 #1a0a04' }}
          >
            {itemName}
          </h2>
          <p style={{ fontFamily: 'var(--ms-font-d)', fontSize: '9px', color: '#b89460', marginTop: '4px' }}>
            Item #{itemId} · {drops.length} source{drops.length === 1 ? '' : 's'}
          </p>
        </div>
      </header>
      <div className="p-2" style={{ backgroundColor: 'var(--ms-panel-bg)' }}>
        {empty ? (
          <p className="text-center py-8" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', color: '#4a3220' }}>
            No monster drops this item. It may come from a shop, quest, or reactor.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {globals.map((g: GlobalDrop, i) => (
              <DropRow key={`g${i}`} iconSrc="/maple/items/maple-leaf.png" name="Global drop (any monster)" chance={g.chance} min={g.minimum_quantity} max={g.maximum_quantity} questid={g.questid} />
            ))}
            {drops.map((d: MobDrop) => (
              <DropRow key={d.dropperid} iconSrc={mobRender(d.dropperid)} name={mobNames.get(d.dropperid) ?? `Monster #${d.dropperid}`} chance={d.chance} min={d.minimum_quantity} max={d.maximum_quantity} questid={d.questid} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// ── Monster view: "what does this monster drop?" ──
async function MobResults({ mobId }: { mobId: number }) {
  const drops = await dropsOfMob(mobId)
  const itemIds = drops.map((d) => d.itemid)
  const [mobNames, itemNames] = await Promise.all([resolveMobNames([mobId]), resolveItemNames(itemIds)])
  const mobName = mobNames.get(mobId) ?? `Monster #${mobId}`

  return (
    <section className="ms-pixel-panel overflow-hidden">
      <header
        className="flex items-center gap-4 px-4 py-3"
        style={{
          background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 50%, #3a2418 100%)',
          borderBottom: '3px solid #2a1810',
        }}
      >
        <IconTile src={mobRender(mobId)} alt={mobName} />
        <div>
          <h2
            style={{ fontFamily: 'var(--ms-font-d)', fontSize: '12px', color: '#ffd96b', letterSpacing: '1px', textShadow: '2px 2px 0 #1a0a04' }}
          >
            {mobName}
          </h2>
          <p style={{ fontFamily: 'var(--ms-font-d)', fontSize: '9px', color: '#b89460', marginTop: '4px' }}>
            Monster #{mobId} · {drops.length} drop{drops.length === 1 ? '' : 's'}
          </p>
        </div>
      </header>
      <div className="p-2" style={{ backgroundColor: 'var(--ms-panel-bg)' }}>
        {drops.length === 0 ? (
          <p className="text-center py-8" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', color: '#4a3220' }}>
            No drops recorded for this monster.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
            {drops.map((d: MobDrop) => (
              <DropRow key={d.itemid} iconSrc={itemIcon(d.itemid)} name={itemNames.get(d.itemid) ?? `Item #${d.itemid}`} chance={d.chance} min={d.minimum_quantity} max={d.maximum_quantity} questid={d.questid} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function ModeTab({ label, mode, active, q }: { label: string; mode: string; active: boolean; q: string }) {
  const href = `/drops?mode=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}`
  return (
    <a href={href} aria-current={active ? 'true' : undefined}
      className={active ? 'ms-btn ms-btn-green' : 'ms-btn'}
    >
      {label}
    </a>
  )
}

export default async function DropsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>
}) {
  const { q = '', mode: rawMode = 'item' } = await searchParams
  const mode: 'item' | 'mob' = rawMode === 'mob' ? 'mob' : 'item'
  const query = q.trim()

  const ids = query ? await resolveQuery(query, mode) : []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Sprite src="/maple/mobs/blue-mushroom.gif" alt="" height={52} anim="hop" grounded={false} className="hidden sm:block shrink-0" />
        <div>
          <h1 className="ms-section-title" style={{ margin: 0 }}>
            Drop Search
          </h1>
          <p className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>
            Find which monster drops an item — or pull up a monster&apos;s full loot table.
          </p>
        </div>
      </div>

      {/* Mode + search */}
      <div className="flex flex-wrap gap-2 mb-3">
        <ModeTab label="Find an item" mode="item" active={mode === 'item'} q={query} />
        <ModeTab label="Monster drop table" mode="mob" active={mode === 'mob'} q={query} />
      </div>

      <form method="GET" action="/drops" className="flex flex-col sm:flex-row gap-3 mb-8">
        <input type="hidden" name="mode" value={mode} />
        <input name="q" defaultValue={query} autoComplete="off"
          placeholder={mode === 'item' ? 'Item name or ID — e.g. Maple Sword, 1302063' : 'Monster name or ID — e.g. Orange Mushroom, 100100'}
          className="flex-1 px-4 py-2.5"
          style={{
            border: '3px solid #3a2418',
            backgroundColor: '#f8efd0',
            color: '#2a1810',
            fontFamily: 'var(--ms-font-b)',
            fontSize: '18px',
            outline: 'none',
            boxShadow: 'inset 2px 2px 0 #b89460, inset -2px -2px 0 #fff5d8',
          }} />
        <button type="submit" className="ms-btn">Search</button>
        {query && (
          <a href={`/drops?mode=${mode}`} className="ms-btn" style={{ background: 'linear-gradient(to bottom, #d8c08c 0%, #b89460 100%)', color: '#2a1810', textShadow: '1px 1px 0 #f0dc9c' }}>
            Clear
          </a>
        )}
      </form>

      {/* Results */}
      {!query ? (
        <div className="ms-pixel-panel text-center py-16 px-6">
          <p style={{ fontFamily: 'var(--ms-font-d)', fontSize: '12px', color: '#2a1810', marginBottom: '8px' }}>
            Search the drop tables
          </p>
          <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>
            Rates shown are the <strong style={{ color: '#2a1810' }}>base</strong> chance per kill — your in-game odds scale with the server&apos;s 3× drop rate.
          </p>
        </div>
      ) : ids.length === 0 ? (
        <div className="ms-pixel-panel text-center py-16 px-6">
          <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>
            No {mode === 'item' ? 'items' : 'monsters'} match &quot;{query}&quot;. Try a different spelling or a numeric ID.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {ids.map((id) => (mode === 'item' ? <ItemResults key={id} itemId={id} /> : <MobResults key={id} mobId={id} />))}
        </div>
      )}
    </div>
  )
}
