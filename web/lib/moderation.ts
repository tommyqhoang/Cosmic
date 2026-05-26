import { prisma } from '@/lib/prisma'

// Loads the target account for an admin moderation action (ban/unban/mute/unmute).
//
// Centralizes two guards every moderation route needs:
//   - the account must exist (otherwise prisma.update throws P2025 -> unhandled 500)
//   - the target must not itself be a web admin (a GM must not be able to ban or
//     mute another GM — that includes themselves, since their own webadmin === 1)
//
// Returns either `{ error: Response }` to send back, or `{ target }` to proceed.
export async function loadModerationTarget(accountId: number) {
  const target = await prisma.account
    .findUnique({ where: { id: accountId }, select: { id: true, webadmin: true } })
    .catch(() => null)

  if (!target) {
    return { error: Response.json({ error: 'Account not found' }, { status: 404 }) }
  }
  if (target.webadmin === 1) {
    return { error: Response.json({ error: 'Cannot moderate an administrator account' }, { status: 403 }) }
  }
  return { target }
}
