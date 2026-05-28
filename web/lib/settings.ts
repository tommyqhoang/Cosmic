import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { SOCIAL_PLATFORMS, type SocialLinks } from '@/lib/social'

const SOCIAL_KEYS = SOCIAL_PLATFORMS.map((p) => p.key)

export const SOCIAL_LINKS_TAG = 'social-links'
export const GENERAL_SETTINGS_TAG = 'general-settings'
export const SERVER_RATES_TAG = 'server-rates'

export const CONTACT_NPC_NAME_KEY = 'site_contact_npc_name'
export const EXP_RATE_KEY = 'server_exp_rate'
export const MESO_RATE_KEY = 'server_meso_rate'
export const DROP_RATE_KEY = 'server_drop_rate'

export type GeneralSettings = { contactNpcName: string }
export type ServerRates = { expRate: number; mesoRate: number; dropRate: number }

const blankSocialLinks = (): SocialLinks =>
  Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, ''])) as SocialLinks

const DEFAULT_RATES: ServerRates = { expRate: 7, mesoRate: 5, dropRate: 3 }
const DEFAULT_NPC_NAME = 'Maya'

// Strict reads straight from the DB. These THROW on a DB error (e.g. the
// cms_settings table not existing yet) so the admin API can surface the real
// problem instead of masking it as "no value set". Public/footer code must use
// the resilient `read*` / cached `get*` variants below.
export async function readSocialLinksStrict(): Promise<SocialLinks> {
  const rows = await prisma.cmsSetting.findMany({ where: { key: { in: SOCIAL_KEYS } } })
  const byKey = new Map(rows.map((r) => [r.key, r.value]))
  return Object.fromEntries(
    SOCIAL_PLATFORMS.map((p) => [p.id, (byKey.get(p.key) ?? '').trim()]),
  ) as SocialLinks
}

export async function readGeneralSettingsStrict(): Promise<GeneralSettings> {
  const row = await prisma.cmsSetting.findUnique({ where: { key: CONTACT_NPC_NAME_KEY } })
  return { contactNpcName: row?.value?.trim() || DEFAULT_NPC_NAME }
}

export async function readServerRatesStrict(): Promise<ServerRates> {
  const rows = await prisma.cmsSetting.findMany({
    where: { key: { in: [EXP_RATE_KEY, MESO_RATE_KEY, DROP_RATE_KEY] } },
  })
  const byKey = new Map(rows.map((r) => [r.key, r.value]))
  const parse = (key: string, def: number) => {
    const v = Number(byKey.get(key))
    return v > 0 ? v : def
  }
  return {
    expRate: parse(EXP_RATE_KEY, DEFAULT_RATES.expRate),
    mesoRate: parse(MESO_RATE_KEY, DEFAULT_RATES.mesoRate),
    dropRate: parse(DROP_RATE_KEY, DEFAULT_RATES.dropRate),
  }
}

// Resilient reads: never throw. A DB hiccup (or a not-yet-created table) should
// never break public page rendering, so these fall back to blank/defaults.
// Used by public API routes (subscribe, posts) and the cached footer variants.
export async function readSocialLinks(): Promise<SocialLinks> {
  try {
    return await readSocialLinksStrict()
  } catch {
    return blankSocialLinks()
  }
}

export async function readGeneralSettings(): Promise<GeneralSettings> {
  try {
    return await readGeneralSettingsStrict()
  } catch {
    return { contactNpcName: DEFAULT_NPC_NAME }
  }
}

export async function readServerRates(): Promise<ServerRates> {
  try {
    return await readServerRatesStrict()
  } catch {
    return { ...DEFAULT_RATES }
  }
}

// Cached + resilient variants used by the global footer and public pages.
export const getSocialLinks = unstable_cache(readSocialLinks, ['social-links'], {
  tags: [SOCIAL_LINKS_TAG],
  revalidate: 300,
})

export const getGeneralSettings = unstable_cache(readGeneralSettings, ['general-settings'], {
  tags: [GENERAL_SETTINGS_TAG],
  revalidate: 300,
})

export const getServerRates = unstable_cache(readServerRates, ['server-rates'], {
  tags: [SERVER_RATES_TAG],
  revalidate: 300,
})
