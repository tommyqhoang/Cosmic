import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readFileSync } from 'fs'
import path from 'path'

export type HandbookItem = { id: string; name: string; description?: string }
export type CommandEntry = { cmd: string; description: string }
export type CommandSection = { title: string; commands: CommandEntry[] }
export type HandbookResponse =
  | { type: 'items'; items: HandbookItem[] }
  | { type: 'commands'; sections: CommandSection[] }

const HANDBOOK_DIR = process.env.HANDBOOK_DIR ?? path.join(process.cwd(), 'public', 'handbook')

const CATEGORY_FILES: Record<string, string> = {
  'equip/accessory': 'Equip/Accessory.txt',
  'equip/cap': 'Equip/Cap.txt',
  'equip/cape': 'Equip/Cape.txt',
  'equip/coat': 'Equip/Coat.txt',
  'equip/face': 'Equip/Face.txt',
  'equip/glove': 'Equip/Glove.txt',
  'equip/hair': 'Equip/Hair.txt',
  'equip/longcoat': 'Equip/Longcoat.txt',
  'equip/pants': 'Equip/Pants.txt',
  'equip/petequip': 'Equip/PetEquip.txt',
  'equip/ring': 'Equip/Ring.txt',
  'equip/shield': 'Equip/Shield.txt',
  'equip/shoes': 'Equip/Shoes.txt',
  'equip/skin': 'Equip/Skin.txt',
  'equip/taming': 'Equip/Taming.txt',
  'equip/weapon': 'Equip/Weapon.txt',
  map: 'Map.txt',
  mob: 'Mob.txt',
  use: 'Use.txt',
  skill: 'Skill.txt',
  cash: 'Cash.txt',
  etc: 'Etc.txt',
  npc: 'NPC.txt',
  pet: 'Pet.txt',
  quest: 'Quest.txt',
  setup: 'Setup.txt',
  job: 'Job.txt',
  gender: 'Gender.txt',
  commands: 'Commands.txt',
}

function parseItems(text: string): HandbookItem[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .flatMap((line): HandbookItem[] => {
      const sep = line.indexOf(' - ')
      if (sep === -1) return []
      const id = line.slice(0, sep).trim()
      if (!id || !/^\d+$/.test(id)) return []
      const rest = line.slice(sep + 3)

      // Skills: "Name - [Master Level : N]\nDesc"
      const mlMatch = rest.match(/^(.+?)\s+-\s+\[Master Level\s*:\s*\d+\](.*)/i)
      if (mlMatch) {
        return [{
          id,
          name: mlMatch[1].trim(),
          description: mlMatch[2].replace(/^\\n/, '').replace(/\\n/g, ' ').trim() || undefined,
        }]
      }

      // Strip trailing "(no description)"
      const clean = rest.replace(/\s+-\s+\(no description\)$/, '').trim()
      const nameDash = clean.indexOf(' - ')
      if (nameDash !== -1) {
        return [{
          id,
          name: clean.slice(0, nameDash).trim(),
          description: clean.slice(nameDash + 3).trim() || undefined,
        }]
      }
      return [{ id, name: clean }]
    })
}

function parseCommands(text: string): CommandSection[] {
  const sections: CommandSection[] = []
  let current: CommandSection | null = null

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    // Section headers end with ":" and don't start with command prefixes
    if (line.endsWith(':') && !line.startsWith('!') && !line.startsWith('@')) {
      current = { title: line.slice(0, -1), commands: [] }
      sections.push(current)
      continue
    }
    if (!current) continue

    if (!line.startsWith('!') && !line.startsWith('@')) continue

    // Handle "!cmd - desc", "@cmd - desc", "!cmd- desc" (no space before dash)
    const dashIdx = line.indexOf(' - ')
    if (dashIdx !== -1) {
      current.commands.push({ cmd: line.slice(0, dashIdx).trim(), description: line.slice(dashIdx + 3).trim() })
    } else {
      const altDash = line.indexOf('-')
      if (altDash !== -1) {
        current.commands.push({ cmd: line.slice(0, altDash).trim(), description: line.slice(altDash + 1).trim() })
      }
    }
  }

  return sections.filter(s => s.commands.length > 0)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const category = req.nextUrl.searchParams.get('category')?.toLowerCase() ?? ''
  const file = CATEGORY_FILES[category]
  if (!file) return Response.json({ error: 'Unknown category' }, { status: 400 })

  try {
    const text = readFileSync(path.join(HANDBOOK_DIR, file), 'utf-8')
    if (category === 'commands') {
      return Response.json({ type: 'commands', sections: parseCommands(text) } satisfies HandbookResponse)
    }
    return Response.json({ type: 'items', items: parseItems(text) } satisfies HandbookResponse)
  } catch {
    return Response.json({ error: 'Could not read handbook data' }, { status: 500 })
  }
}
