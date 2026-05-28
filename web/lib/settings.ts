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

// Uncached read straight from the DB. Used by the admin API.
export async function readSocialLinks(): Promise<SocialLinks> {
  const blank = Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, ''])) as SocialLinks

  try {
    const rows = await prisma.cmsSetting.findMany({ where: { key: { in: SOCIAL_KEYS } } })
    const byKey = new Map(rows.map((r) => [r.key, r.value]))
    return Object.fromEntries(
      SOCIAL_PLATFORMS.map((p) => [p.id, (byKey.get(p.key) ?? '').trim()]),
    ) as SocialLinks
  } catch {
    // The footer is global; a DB hiccup should never break page rendering.
    return blank
  }
}

// Cached variant used by the footer (global layout).
export const getSocialLinks = unstable_cache(readSocialLinks, ['social-links'], {
  tags: [SOCIAL_LINKS_TAG],
  revalidate: 300,
})

export type GeneralSettings = { contactNpcName: string }

export async function readGeneralSettings(): Promise<GeneralSettings> {
  try {
    const row = await prisma.cmsSetting.findUnique({ where: { key: CONTACT_NPC_NAME_KEY } })
    return { contactNpcName: row?.value?.trim() || 'Maya' }
  } catch {
    return { contactNpcName: 'Maya' }
  }
}

export const getGeneralSettings = unstable_cache(readGeneralSettings, ['general-settings'], {
  tags: [GENERAL_SETTINGS_TAG],
  revalidate: 300,
})

export type ServerRates = { expRate: number; mesoRate: number; dropRate: number }

export async function readServerRates(): Promise<ServerRates> {
  try {
    const rows = await prisma.cmsSetting.findMany({
      where: { key: { in: [EXP_RATE_KEY, MESO_RATE_KEY, DROP_RATE_KEY] } },
    })
    const byKey = new Map(rows.map((r) => [r.key, r.value]))
    const parse = (key: string, def: number) => {
      const v = Number(byKey.get(key))
      return v > 0 ? v : def
    }
    return {
      expRate: parse(EXP_RATE_KEY, 7),
      mesoRate: parse(MESO_RATE_KEY, 5),
      dropRate: parse(DROP_RATE_KEY, 3),
    }
  } catch {
    return { expRate: 7, mesoRate: 5, dropRate: 3 }
  }
}

export const getServerRates = unstable_cache(readServerRates, ['server-rates'], {
  tags: [SERVER_RATES_TAG],
  revalidate: 300,
})
