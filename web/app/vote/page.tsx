import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import VoteClient from './VoteClient'
import type { Metadata } from 'next'

// Per-player vote links embed the account name, so this must render per-request.
export const dynamic = 'force-dynamic'

// TopG passes whatever follows "server-682556-" back to our postback as p_resp,
// so we append the signed-in account name to credit the right player.
const TOPG_BASE = 'https://topg.org/maplestory-private-servers/server-682556'
const GTOP100_BASE = 'https://gtop100.com/MapleStory/server-106072'

export const metadata: Metadata = {
  title: 'Vote & Earn NX',
  description: 'Vote for ShinyMS on MapleStory private server lists and earn free NX Cash rewards every day.',
  alternates: { canonical: 'https://shinyms.com/vote' },
  openGraph: {
    url: 'https://shinyms.com/vote',
    title: 'Vote for ShinyMS — Earn Free NX',
    description: 'Vote daily and earn free NX Cash on ShinyMS.',
  },
}

async function getTopVoters() {
  return prisma.account
    .findMany({
      where: { votepoints: { gt: 0 }, webadmin: 0 },
      orderBy: { votepoints: 'desc' },
      take: 10,
      select: { name: true, votepoints: true },
    })
    .catch(() => [])
}

export default async function VotePage() {
  const [topVoters, session] = await Promise.all([
    getTopVoters(),
    getServerSession(authOptions),
  ])
  const username = session?.user?.name ?? null

  const sites = [
    {
      id: 'gtop100',
      name: 'Gtop100',
      logo: 'G·100',
      cdHours: 12,
      url: username
        ? `${GTOP100_BASE}?vote=1&pingUsername=${encodeURIComponent(username)}`
        : GTOP100_BASE,
      urlNoUser: GTOP100_BASE,
      desc: 'Vote every 12 hours',
      reward: '+1 Vote Point',
    },
    {
      id: 'topg',
      name: 'TopG.org',
      logo: 'TopG',
      cdHours: 24,
      url: username
        ? `${TOPG_BASE}-${encodeURIComponent(username)}#vote`
        : `${TOPG_BASE}#vote`,
      urlNoUser: `${TOPG_BASE}#vote`,
      desc: 'Vote every 24 hours',
      reward: '+1 Vote Point',
    },
  ]

  return (
    <VoteClient
      sites={sites}
      topVoters={topVoters}
      username={username}
    />
  )
}
