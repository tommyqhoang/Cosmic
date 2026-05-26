import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// The drop tables (`drop_data`, `drop_data_global`) live in the v83 game DB but
// are not modelled in schema.prisma, so we read them with raw SQL. `chance` is
// out of 1,000,000 — the server rolls `nextInt(999999) < chance * dropRate`, so
// the base probability is chance / 1,000,000 (then scaled by the world drop
// rate). We surface that base rate; callers can note it scales in-game.

export type MobDrop = {
  dropperid: number
  itemid: number
  minimum_quantity: number
  maximum_quantity: number
  chance: number
  questid: number
}

export type GlobalDrop = {
  itemid: number
  minimum_quantity: number
  maximum_quantity: number
  chance: number
  questid: number
  continent: number
  comments: string | null
}

/** Base drop rate as a percentage string, e.g. 30000 → "3%", 5 → "0.0005%". */
export function dropRatePct(chance: number): string {
  const pct = (chance / 1_000_000) * 100
  if (pct >= 100) return '100%'
  if (pct >= 1) return `${pct.toFixed(1).replace(/\.0$/, '')}%`
  if (pct >= 0.01) return `${pct.toFixed(2)}%`
  return `${pct.toPrecision(2)}%`
}

/** Which monsters drop a given item, best chance first. */
export async function droppersOfItem(itemid: number): Promise<MobDrop[]> {
  return prisma.$queryRaw<MobDrop[]>`
    SELECT dropperid, itemid, minimum_quantity, maximum_quantity, chance, questid
    FROM drop_data WHERE itemid = ${itemid}
    ORDER BY chance DESC LIMIT 60`.catch(() => [])
}

/** Droppers for several items at once (used by name search that matches many). */
export async function droppersOfItems(itemids: number[]): Promise<MobDrop[]> {
  if (itemids.length === 0) return []
  return prisma.$queryRaw<MobDrop[]>`
    SELECT dropperid, itemid, minimum_quantity, maximum_quantity, chance, questid
    FROM drop_data WHERE itemid IN (${Prisma.join(itemids)})
    ORDER BY chance DESC LIMIT 120`.catch(() => [])
}

/** A monster's full drop table, best chance first. */
export async function dropsOfMob(dropperid: number): Promise<MobDrop[]> {
  return prisma.$queryRaw<MobDrop[]>`
    SELECT dropperid, itemid, minimum_quantity, maximum_quantity, chance, questid
    FROM drop_data WHERE dropperid = ${dropperid}
    ORDER BY chance DESC LIMIT 200`.catch(() => [])
}

/** Drop tables for several monsters at once. */
export async function dropsOfMobs(dropperids: number[]): Promise<MobDrop[]> {
  if (dropperids.length === 0) return []
  return prisma.$queryRaw<MobDrop[]>`
    SELECT dropperid, itemid, minimum_quantity, maximum_quantity, chance, questid
    FROM drop_data WHERE dropperid IN (${Prisma.join(dropperids)})
    ORDER BY chance DESC LIMIT 300`.catch(() => [])
}

/** Global drops (every monster on a continent can drop these) for an item. */
export async function globalDropsOfItem(itemid: number): Promise<GlobalDrop[]> {
  return prisma.$queryRaw<GlobalDrop[]>`
    SELECT itemid, minimum_quantity, maximum_quantity, chance, questid, continent, comments
    FROM drop_data_global WHERE itemid = ${itemid} AND chance > 0
    ORDER BY chance DESC LIMIT 20`.catch(() => [])
}
