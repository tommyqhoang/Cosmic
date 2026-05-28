// Applies the idempotent CMS table definitions in prisma/sql/create_*.sql to the
// database before the web server boots. These tables (cms_settings, cms_posts,
// cms_smega, ...) live alongside the v83 game schema, which Prisma must NOT
// `db push` (that would drop game columns). Each file is `CREATE TABLE IF NOT
// EXISTS`, so running this on every boot is safe and cheap when they exist.
//
// Failures never block startup: a missing table only degrades the affected
// admin feature (which now reports an actionable error), and the public site
// stays up. Run standalone with: node scripts/ensure-cms-tables.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const sqlDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'prisma', 'sql')
const LOG = '[ensure-cms-tables]'

// Split a .sql file into executable statements: drop `--` comment lines and
// blank lines, then split on the statement terminator. The create_*.sql files
// contain only DDL with no semicolons inside a statement, so this is sufficient.
function statementsOf(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
  } catch (err) {
    console.error(`${LOG} could not connect to the database; skipping. The server will start anyway.`, err)
    await prisma.$disconnect().catch(() => {})
    return
  }

  try {
    const files = readdirSync(sqlDir)
      .filter((f) => f.startsWith('create_') && f.endsWith('.sql'))
      .sort()
    for (const file of files) {
      const statements = statementsOf(readFileSync(path.join(sqlDir, file), 'utf8'))
      for (const stmt of statements) {
        await prisma.$executeRawUnsafe(stmt)
      }
      console.log(`${LOG} applied ${file} (${statements.length} statement(s))`)
    }
    console.log(`${LOG} done (${files.length} file(s))`)
  } catch (err) {
    console.error(`${LOG} failed while applying SQL; the server will start anyway.`, err)
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

main()
