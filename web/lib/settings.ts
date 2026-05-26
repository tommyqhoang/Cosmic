import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { SOCIAL_PLATFORMS, type SocialLinks } from '@/lib/social'

const SOCIAL_KEYS = SOCIAL_PLATFORMS.map((p) => p.key)

// Cache tag for the social links. The footer renders in the root layout on every
// page, so reading from the DB per request would deopt every route to dynamic.
// Wrapping the read in unstable_cache keeps pages cacheable; the admin save path
// calls revalidateTag(SOCIAL_LINKS_TAG) so changes show without a redeploy.
export const SOCIAL_LINKS_TAG = 'social-links'

// Uncached read straight from the DB. Used by the admin API (low traffic, needs
// to reflect the latest save immediately). The footer uses the cached variant.
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

// Returns the configured social links, mapped by platform id ('' when unset).
// Cached with a 5-minute safety revalidate plus on-demand invalidation via tag.
export const getSocialLinks = unstable_cache(readSocialLinks, ['social-links'], {
  tags: [SOCIAL_LINKS_TAG],
  revalidate: 300,
})
