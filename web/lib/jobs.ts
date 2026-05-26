export type JobClass =
  | 'Beginner' | 'Warrior' | 'Mage' | 'Bowman' | 'Thief' | 'Pirate'
  | 'Cygnus' | 'Aran' | 'GM' | 'SuperGM'

export function getJobName(jobId: number): string {
  const jobs: Record<number, string> = {
    0: 'Beginner',
    // Warrior
    100: 'Warrior', 110: 'Fighter', 111: 'Crusader', 112: 'Hero',
    120: 'Page', 121: 'White Knight', 122: 'Paladin',
    130: 'Spearman', 131: 'Dragon Knight', 132: 'Dark Knight',
    // Mage
    200: 'Magician',
    210: 'F/P Wizard', 211: 'F/P Mage', 212: 'F/P Arch Mage',
    220: 'I/L Wizard', 221: 'I/L Mage', 222: 'I/L Arch Mage',
    230: 'Cleric', 231: 'Priest', 232: 'Bishop',
    // Bowman
    300: 'Bowman',
    310: 'Hunter', 311: 'Ranger', 312: 'Bow Master',
    320: 'Crossbowman', 321: 'Sniper', 322: 'Marksman',
    // Thief
    400: 'Rogue',
    410: 'Assassin', 411: 'Hermit', 412: 'Night Lord',
    420: 'Bandit', 421: 'Chief Bandit', 422: 'Shadower',
    // Pirate
    500: 'Pirate',
    510: 'Brawler', 511: 'Marauder', 512: 'Buccaneer',
    520: 'Gunslinger', 521: 'Outlaw', 522: 'Corsair',
    // GM
    900: 'GM', 910: 'Super GM',
    // Cygnus Knights (same name across all advancements)
    1000: 'Noblesse',
    1100: 'Dawn Warrior', 1110: 'Dawn Warrior', 1111: 'Dawn Warrior', 1112: 'Dawn Warrior',
    1200: 'Blaze Wizard', 1210: 'Blaze Wizard', 1211: 'Blaze Wizard', 1212: 'Blaze Wizard',
    1300: 'Wind Archer', 1310: 'Wind Archer', 1311: 'Wind Archer', 1312: 'Wind Archer',
    1400: 'Night Walker', 1410: 'Night Walker', 1411: 'Night Walker', 1412: 'Night Walker',
    1500: 'Thunder Breaker', 1510: 'Thunder Breaker', 1511: 'Thunder Breaker', 1512: 'Thunder Breaker',
    // Aran
    2000: 'Legend',
    2100: 'Aran', 2110: 'Aran', 2111: 'Aran', 2112: 'Aran',
  }
  return jobs[jobId] ?? 'Unknown'
}

export function getJobClass(jobId: number): JobClass {
  if (jobId === 0) return 'Beginner'
  if (jobId >= 100 && jobId < 200) return 'Warrior'
  if (jobId >= 200 && jobId < 300) return 'Mage'
  if (jobId >= 300 && jobId < 400) return 'Bowman'
  if (jobId >= 400 && jobId < 500) return 'Thief'
  if (jobId >= 500 && jobId < 600) return 'Pirate'
  if (jobId >= 900 && jobId < 910) return 'GM'
  if (jobId >= 910 && jobId < 1000) return 'SuperGM'
  if (jobId >= 1000 && jobId < 2000) return 'Cygnus'
  if (jobId >= 2000 && jobId < 3000) return 'Aran'
  return 'Beginner'
}

// Display labels for classes whose internal key differs from what players read.
export const jobClassLabels: Record<JobClass, string> = {
  Beginner: 'Beginner',
  Warrior:  'Warrior',
  Mage:     'Mage',
  Bowman:   'Bowman',
  Thief:    'Thief',
  Pirate:   'Pirate',
  Cygnus:   'Cygnus Knight',
  Aran:     'Aran',
  GM:       'GM',
  SuperGM:  'Super GM',
}

// Job classes offered as ranking filters (Beginner excluded — not a meaningful rank tier)
export const FILTERABLE_JOB_CLASSES: JobClass[] = [
  'Warrior', 'Mage', 'Bowman', 'Thief', 'Pirate', 'Cygnus', 'Aran', 'GM', 'SuperGM',
]

// Staff classes — selecting these lifts the "players only" (gm = 0) exclusion so staff appear.
export const STAFF_JOB_CLASSES: JobClass[] = ['GM', 'SuperGM']

// Numeric job-ID range for a class, used to filter the character table by class.
export function jobClassRange(jobClass: JobClass): { gte: number; lt: number } | null {
  switch (jobClass) {
    case 'Warrior': return { gte: 100, lt: 200 }
    case 'Mage':    return { gte: 200, lt: 300 }
    case 'Bowman':  return { gte: 300, lt: 400 }
    case 'Thief':   return { gte: 400, lt: 500 }
    case 'Pirate':  return { gte: 500, lt: 600 }
    case 'GM':      return { gte: 900, lt: 910 }
    case 'SuperGM': return { gte: 910, lt: 1000 }
    case 'Cygnus':  return { gte: 1000, lt: 2000 }
    case 'Aran':    return { gte: 2000, lt: 3000 }
    default:        return null
  }
}

export const jobClassColors: Record<JobClass, string> = {
  Beginner: 'bg-gray-100 text-gray-700',
  Warrior:  'bg-red-100 text-red-800',
  Mage:     'bg-purple-100 text-purple-800',
  Bowman:   'bg-green-100 text-green-800',
  Thief:    'bg-yellow-100 text-yellow-800',
  Pirate:   'bg-orange-100 text-orange-800',
  Cygnus:   'bg-sky-100 text-sky-800',
  Aran:     'bg-cyan-100 text-cyan-800',
  GM:       'bg-slate-200 text-slate-800',
  SuperGM:  'bg-pink-100 text-pink-800',
}
