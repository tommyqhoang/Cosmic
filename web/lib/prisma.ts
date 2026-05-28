import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function buildUrl(base: string | undefined): string | undefined {
  if (!base) return base
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}connection_limit=5&pool_timeout=10`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildUrl(process.env.DATABASE_URL) } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
