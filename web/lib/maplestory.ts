// Helpers for maplestory.io — the community sprite/metadata API we already use
// for the local asset pack. Region GMS / version 83 matches our v83 server.
//
// Icons are plain URLs (rendered by <img>). Names come from two large id→name
// lists that we fetch once and cache for a day; a module-level promise keeps
// repeated lookups within a request cheap. Everything degrades gracefully: if
// the API is unreachable, icons just show alt text and name search returns
// nothing (numeric ID search still works straight off our own database).

const REGION = 'GMS'
const VERSION = '83'
const BASE = `https://maplestory.io/api/${REGION}/${VERSION}`

export const itemIcon = (id: number) => `${BASE}/item/${id}/icon`
export const mobRender = (id: number) => `${BASE}/mob/${id}/render/stand`

type NameRow = { id: number; name: string }

// One cached fetch per list, shared across requests for the process lifetime.
// A failed fetch must NOT be cached forever (it would poison name search until
// the next deploy), so the loader resets its slot to null on empty/error so a
// later request retries. The fetch is also time-boxed so a slow maplestory.io
// can never hang a server-rendered (force-dynamic) request.
let itemNamesPromise: Promise<Map<number, string>> | null = null
let mobNamesPromise: Promise<Map<number, string>> | null = null

const FETCH_TIMEOUT_MS = 4000

async function fetchNameList(path: string): Promise<Map<number, string>> {
  try {
    const res = await fetch(`${BASE}/${path}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return new Map()
    const rows = (await res.json()) as NameRow[]
    if (!Array.isArray(rows)) return new Map()
    const map = new Map<number, string>()
    for (const r of rows) {
      if (r?.id != null && r.name) map.set(r.id, r.name)
    }
    return map
  } catch {
    return new Map()
  }
}

function itemNames(): Promise<Map<number, string>> {
  if (!itemNamesPromise) {
    itemNamesPromise = fetchNameList('item').then((m) => {
      if (m.size === 0) itemNamesPromise = null // allow a later retry after failure
      return m
    })
  }
  return itemNamesPromise
}
function mobNames(): Promise<Map<number, string>> {
  if (!mobNamesPromise) {
    mobNamesPromise = fetchNameList('mob').then((m) => {
      if (m.size === 0) mobNamesPromise = null
      return m
    })
  }
  return mobNamesPromise
}

/** Resolve a set of item ids to display names (falls back to "#id"). */
export async function resolveItemNames(ids: number[]): Promise<Map<number, string>> {
  const names = await itemNames()
  return new Map(ids.map((id) => [id, names.get(id) ?? `Item #${id}`]))
}

/** Resolve a set of mob ids to display names (falls back to "#id"). */
export async function resolveMobNames(ids: number[]): Promise<Map<number, string>> {
  const names = await mobNames()
  return new Map(ids.map((id) => [id, names.get(id) ?? `Monster #${id}`]))
}

function searchNames(list: Map<number, string>, term: string, limit: number): number[] {
  const q = term.trim().toLowerCase()
  if (!q) return []
  const exact: number[] = []
  const partial: number[] = []
  for (const [id, name] of list) {
    const n = name.toLowerCase()
    if (n === q) exact.push(id)
    else if (n.includes(q)) partial.push(id)
    // Stop scanning the (multi-thousand entry) list once we have enough
    // candidates; exact matches are preferred in the final slice.
    if (exact.length + partial.length >= limit) break
  }
  return [...exact, ...partial].slice(0, limit)
}

export async function searchItemIds(term: string, limit = 40): Promise<number[]> {
  return searchNames(await itemNames(), term, limit)
}

export async function searchMobIds(term: string, limit = 40): Promise<number[]> {
  return searchNames(await mobNames(), term, limit)
}
