// Pure, client-safe social-platform definitions (no server/Prisma imports) so
// both the admin form (client) and the footer/API (server) can share them. Each
// link is stored in cms_settings under `key`. Add a platform here (and an icon
// in the Footer) to surface a new one — no migration needed.
export const SOCIAL_PLATFORMS = [
  { id: 'discord', key: 'social_discord', label: 'Discord', placeholder: 'https://discord.gg/yourinvite' },
  { id: 'youtube', key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { id: 'instagram', key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
  { id: 'facebook', key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
] as const

export type SocialId = (typeof SOCIAL_PLATFORMS)[number]['id']
export type SocialLinks = Record<SocialId, string>
