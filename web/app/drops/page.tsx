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
  if (pct >= 10) return { bg: 'var(--success-subtle)', fg: 'var(--success)' }
  if (pct >= 1) return { bg: 'var(--primary-subtle)', fg: 'var(--primary)' }
  return { bg: 'var(--accent-subtle)', fg: 'var(--accent-foreground)' }
}

function qtyLabel(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`
}

/** Pixel-art icon tile (item or monster) on the signature beige surface. */
function IconTile({ src, alt, size = 56 }: { src: string; alt: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl shrink-0"
      style={{ width: size, height: size, backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)' }}
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
    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color: fg }}>
      {dropRatePct(chance)}
    </span>
  )
}

/** One row inside a drop list: an icon, a name, then rate + quantity. */
function DropRow({
  iconSrc, name, chance, min, max, questid,
}: {
  iconSrc: string; name: string; chance: number; min: number; max: number; questid: number
}) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--surface-subtle)]">
      <IconTile src={iconSrc} alt={name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{name}</div>
        <div className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
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
    <section className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}>
      <header className="flex items-center gap-4 p-4" style={{ background: 'linear-gradient(180deg, var(--surface-raised), var(--surface))', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconTile src={itemIcon(itemId)} alt={itemName} />
        <div>
          <h2 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--foreground)' }}>{itemName}</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>Item #{itemId} · {drops.length} source{drops.length === 1 ? '' : 's'}</p>
        </div>
      </header>
      <div className="p-3" style={{ backgroundColor: 'var(--surface)' }}>
        {empty ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--foreground-subtle)' }}>No monster drops this item. It may come from a shop, quest, or reactor.</p>
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
    <section className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}>
      <header className="flex items-center gap-4 p-4" style={{ background: 'linear-gradient(180deg, var(--surface-raised), var(--surface))', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconTile src={mobRender(mobId)} alt={mobName} />
        <div>
          <h2 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--foreground)' }}>{mobName}</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>Monster #{mobId} · {drops.length} drop{drops.length === 1 ? '' : 's'}</p>
        </div>
      </header>
      <div className="p-3" style={{ backgroundColor: 'var(--surface)' }}>
        {drops.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--foreground-subtle)' }}>No drops recorded for this monster.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-0.5">
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
      className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-150"
      style={active
        ? { backgroundColor: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' }
        : { backgroundColor: 'var(--surface)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}>
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
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>Drop Search</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            Find which monster drops an item — or pull up a monster&apos;s full loot table.
          </p>
        </div>
      </div>

      {/* Mode + search */}
      <div className="flex gap-2 mb-3">
        <ModeTab label="Find an item" mode="item" active={mode === 'item'} q={query} />
        <ModeTab label="Monster drop table" mode="mob" active={mode === 'mob'} q={query} />
      </div>

      <form method="GET" action="/drops" className="flex gap-3 mb-8">
        <input type="hidden" name="mode" value={mode} />
        <input name="q" defaultValue={query} autoComplete="off"
          placeholder={mode === 'item' ? 'Item name or ID — e.g. Maple Sword, 1302063' : 'Monster name or ID — e.g. Orange Mushroom, 100100'}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--foreground)', outline: 'none' }} />
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>Search</button>
        {query && (
          <a href={`/drops?mode=${mode}`} className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}>Clear</a>
        )}
      </form>

      {/* Results */}
      {!query ? (
        <div className="rounded-2xl text-center py-16 px-6" style={{ border: '1px dashed var(--border-strong)', backgroundColor: 'var(--surface-subtle)' }}>
          <p className="font-display text-lg mb-1" style={{ color: 'var(--foreground)' }}>Search the drop tables</p>
          <p className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
            Rates shown are the <strong>base</strong> chance per kill — your in-game odds scale with the server&apos;s 3× drop rate.
          </p>
        </div>
      ) : ids.length === 0 ? (
        <div className="rounded-2xl text-center py-16 px-6" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
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
