import Link from 'next/link'
import type { Metadata } from 'next'
import GuideToc, { type TocItem } from '@/components/guide/GuideToc'
import HeroScene from '@/components/maple/HeroScene'

export const metadata: Metadata = {
  title: 'Player Guide',
  description:
    'New to ShinyMS or returning after years away? This beginner-friendly MapleStory v83 guide covers getting started, classes, party quests, training spots, rebirth, commands, NPCs, bossing and more.',
  alternates: { canonical: 'https://shinyms.com/guide' },
  openGraph: {
    url: 'https://shinyms.com/guide',
    title: 'Player Guide | ShinyMS',
    description: 'The complete beginner-friendly guide to ShinyMS — MapleStory v83. Classes, PQs, training, rebirth, commands & bossing.',
  },
}

/* ── Table of contents ── */
const TOC: TocItem[] = [
  { id: 'getting-started', label: 'Getting Started', emoji: '🚀' },
  { id: 'classes', label: 'Classes & Jobs', emoji: '⚔️' },
  { id: 'party-quests', label: 'Party Quests', emoji: '🎉' },
  { id: 'training', label: 'Training Guide', emoji: '🗺️' },
  { id: 'rebirth', label: 'Rebirth System', emoji: '🔁' },
  { id: 'commands', label: 'In-Game Commands', emoji: '💬' },
  { id: 'npcs', label: 'Important NPCs', emoji: '🧙' },
  { id: 'progression', label: 'Progression & Bossing', emoji: '💎' },
  { id: 'drop-search', label: 'Drop Search', emoji: '🔍' },
  { id: 'systems', label: 'Systems & Features', emoji: '🎀' },
  { id: 'faq', label: 'FAQ & Tips', emoji: '❓' },
]

/* ── Section header ── */
function SectionHead({ kicker, emoji, title, sub }: { kicker: string; emoji: string; title: string; sub: string }) {
  return (
    <div className="mb-6">
      <p className="guide-kicker mb-1.5">{kicker}</p>
      <h2 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-3" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>{sub}</p>
    </div>
  )
}

const cardStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  boxShadow: '0 1px 6px rgba(28,21,39,0.05)',
} as const

/* ── Getting Started data ── */
const FIRST_STEPS = [
  { n: 1, emoji: '🧍', title: 'Make your character', text: 'Pick a name & a beginner look. You can change your appearance later in-game.' },
  { n: 2, emoji: '🏝️', title: 'Finish Maple Island', text: 'Hit Level 10, then talk to the boat NPC to sail to Victoria Island.' },
  { n: 3, emoji: '🎓', title: 'Take your 1st job', text: 'At Lv8–10 visit the right town and pick Warrior, Magician, Bowman, Thief or Pirate.' },
  { n: 4, emoji: '🛒', title: 'Grab starter gear', text: 'Visit the Starter Pack & FM Helper NPCs for beginner equips and potions.' },
  { n: 5, emoji: '🤝', title: 'Join a Party Quest', text: 'Kerning PQ at Lv21+ is the fastest, friendliest way to level and meet people.' },
  { n: 6, emoji: '🗳️', title: 'Vote daily for NX', text: 'Use the Vote page every day for free NX to spend in the Cash Shop.' },
]

const INVENTORY_TABS = [
  { emoji: '⚙️', name: 'Equip', desc: 'Weapons, armor & accessories you wear' },
  { emoji: '🧪', name: 'Use', desc: 'Potions, scrolls, arrows & throwing stars' },
  { emoji: '📜', name: 'Etc', desc: 'Quest items & monster drops' },
  { emoji: '⚙️', name: 'Setup', desc: 'Chairs, pets & mounts' },
  { emoji: '💵', name: 'Cash', desc: 'NX items from the Cash Shop' },
]

const BASIC_CONTROLS = [
  { key: 'Arrow Keys', do: 'Move left / right' },
  { key: 'Alt', do: 'Jump' },
  { key: 'Ctrl', do: 'Attack' },
  { key: 'Z / Space', do: 'Pick up items / NPC chat' },
  { key: 'I', do: 'Open Inventory' },
  { key: 'S', do: 'Open Skills' },
  { key: 'K', do: 'Open Stats (assign AP)' },
]

/* ── Classes data ── */
type Diff = 'Easy' | 'Medium' | 'Hard'
const DIFF_COLOR: Record<Diff, string> = { Easy: '#1d6b41', Medium: '#b45309', Hard: '#b91c1c' }

const CLASSES = [
  {
    emoji: '🛡️', name: 'Warrior', accent: '#c0392b', diff: 'Easy' as Diff, beginner: true,
    play: 'Tanky melee bruiser. Wade into mobs and swing.',
    strengths: ['Huge HP', 'Forgiving', 'Great survivability'],
    weakness: 'Short range — must get up close.',
    role: 'Strong mobber, solid bosser later.',
  },
  {
    emoji: '🔮', name: 'Magician', accent: '#6d28d9', diff: 'Medium' as Diff, beginner: true,
    play: 'Ranged spellcaster that hits whole groups of monsters.',
    strengths: ['Best AoE mobbing', 'Ranged & safe', 'Fast leveling'],
    weakness: 'Very low HP early — squishy until gear improves.',
    role: 'King of mobbing; useful support at bosses.',
  },
  {
    emoji: '🏹', name: 'Bowman', accent: '#1d6b41', diff: 'Medium' as Diff, beginner: false,
    play: 'Long-range archer that picks enemies off from a distance.',
    strengths: ['Longest range', 'High single-target damage', 'Safe positioning'],
    weakness: 'Needs arrows; weaker at clearing big clusters.',
    role: 'Decent mobber, excellent bosser.',
  },
  {
    emoji: '🗡️', name: 'Thief', accent: '#334155', diff: 'Hard' as Diff, beginner: false,
    play: 'Stars (assassin) or claws/daggers (bandit). Fast and mobile.',
    strengths: ['High burst', 'Mobile & evasive', 'Strong bossing'],
    weakness: 'Gear-hungry; trickier to play well.',
    role: 'Bandit mobs well, assassin bosses well.',
  },
  {
    emoji: '⚓', name: 'Pirate', accent: '#b45309', diff: 'Medium' as Diff, beginner: true,
    play: 'Gunslinger (ranged) or Brawler (melee). Flashy & flexible.',
    strengths: ['Balanced HP & damage', 'Fun & versatile', 'Good all-rounder'],
    weakness: 'Jack-of-all-trades — masters none early on.',
    role: 'Comfortable at both mobbing and bossing.',
  },
]

/* ── Hero / alternate-start classes ── */
const HERO_CLASSES = [
  {
    emoji: '🦋', name: 'Cygnus Knights', accent: '#0284c7',
    play: 'An alternate starting path of five elemental knights. You begin as a Noblesse on Ereve, then pick a branch.',
    branches: [
      'Dawn Warrior — STR melee',
      'Blaze Wizard — INT mage',
      'Wind Archer — DEX bow',
      'Night Walker — LUK thief / stars',
      'Thunder Breaker — STR pirate',
    ],
    note: 'Fast early leveling and strong skills — a great change of pace once you know the basics.',
  },
  {
    emoji: '❄️', name: 'Aran', accent: '#0891b2',
    play: 'A polearm-wielding warrior hero awakened from a long slumber. You start as a Legend in Rien.',
    branches: [
      'Combo-driven melee damage',
      'High HP & great mobility',
      'Excellent solo mobber',
    ],
    note: 'Beginner-friendly melee with flashy combos — a popular solo-leveling class.',
  },
]

const STAFF_CLASSES = [
  { emoji: '👑', name: 'GM', text: 'Game Master — a staff member who runs events, helps players and moderates the server.' },
  { emoji: '🌟', name: 'SuperGM', text: 'Senior administrator with full server powers. Oversees the team and major decisions.' },
]

/* ── Party Quests data ── */
const PQS = [
  { emoji: '🐀', name: 'Kerning PQ', level: 'Lv 21–30', location: 'Kerning City (subway)', party: '3–6 players', reward: 'Big EXP + Broken Glasses', why: 'The classic first PQ — easy, social and the fastest early levels.' },
  { emoji: '🧸', name: 'Ludibrium PQ', level: 'Lv 35–50', location: 'Ludibrium (toy castle)', party: '3–6 players', reward: 'EXP + Ludi PQ equips', why: 'Puzzle stages with great EXP and useful gear rewards.' },
  { emoji: '🌳', name: 'Orbis PQ', level: 'Lv 51–70', location: 'Orbis (tower)', party: '6 players', reward: 'EXP + Orbis gear & scrolls', why: 'Teamwork-heavy PQ with strong mid-game rewards.' },
  { emoji: '🏴‍☠️', name: 'Pirate PQ', level: 'Lv 55–100', location: 'Herb Town', party: '3–6 players', reward: 'EXP + meso', why: 'Fast, chill PQ that stays useful well into the mid game.' },
  { emoji: '🎪', name: 'Monster Carnival', level: 'Lv 30–50', location: 'El Nath / Ludibrium', party: '2–6 (PvP teams)', reward: 'EXP + CP for prizes', why: 'A competitive mini-game — summon monsters against the other team.' },
]

const PQ_TIPS = [
  'Be patient and friendly — many parties welcome first-timers.',
  'Ask your leader which stage job you have before rushing ahead.',
  'Don’t leave mid-run; it can fail the whole party.',
  'Keep some potions handy — a few stages have tougher monsters.',
]

/* ── Training data ── */
const TRAINING = [
  { tier: 'Early', color: '#1d6b41', range: 'Lv 1–30', mode: 'Solo or Kerning PQ', spots: [
    { map: 'Maple Island', mob: 'Snails & Shrooms', note: 'Quick start to Lv 10.' },
    { map: 'Henesys Hunting Grounds', mob: 'Slimes / Stumps', note: 'Easy AoE leveling.' },
    { map: 'Kerning PQ', mob: 'Party Quest', note: 'Best EXP at Lv 21–30.' },
  ]},
  { tier: 'Mid', color: '#b45309', range: 'Lv 31–70', mode: 'Party recommended', spots: [
    { map: 'Ant Tunnel (Ellinia)', mob: 'Horned/Zombie Mushrooms', note: 'Dense maps, great AoE.' },
    { map: 'Ludibrium PQ', mob: 'Party Quest', note: 'Top EXP for Lv 35–50.' },
    { map: 'Kerning Subway', mob: 'Jr. Wraiths', note: 'Mage-friendly clusters.' },
  ]},
  { tier: 'High', color: '#3b6ea5', range: 'Lv 71–120', mode: 'Party or strong solo', spots: [
    { map: 'Petrifighters (Sleepywood)', mob: 'Petrifighters', note: 'Classic grind spot.' },
    { map: 'Skeles (Ludibrium)', mob: 'Skelegons/Skelosaurus', note: 'Elite EXP, brings gear.' },
    { map: 'Himes (Showa/Ludi)', mob: 'Dreamy Ghosts', note: 'Excellent steady EXP.' },
  ]},
  { tier: 'End', color: '#7c3aed', range: 'Lv 120+', mode: 'Strong gear / party', spots: [
    { map: 'Gallos / Oblivion', mob: 'Gallopera', note: 'High-density end-game grind.' },
    { map: 'Temple of Time', mob: 'Various', note: 'Quests + strong EXP maps.' },
    { map: 'Leafre / Cavern', mob: 'Dragons', note: 'Pre-bossing grind zone.' },
  ]},
]

const FAST_TIPS = [
  'Stack EXP: combine grinding with a daily PQ for the best gains.',
  'Use HP/MP potions freely — dying costs EXP.',
  'Hunt where monsters are 5–15 levels above you for max EXP.',
  'Party up — shared maps clear faster and split safely.',
]

/* ── Commands data ── */
const COMMANDS = [
  { cmd: '@help', desc: 'Shows the list of player commands available to you.', when: 'When you’re lost or just starting out.' },
  { cmd: '@commands', desc: 'Full reference of every command you can use.', when: 'To discover what’s possible.' },
  { cmd: '@rates', desc: 'Displays the server’s EXP, Meso and Drop rates.', when: 'To confirm current event rates.' },
  { cmd: '@online', desc: 'Lists players currently online.', when: 'To see who’s around to party.' },
  { cmd: '@save', desc: 'Force-saves your character progress.', when: 'Before logging off or after big gains.' },
  { cmd: '@ea', desc: 'Auto-accepts your active expedition / party invites.', when: 'When joining boss runs quickly.' },
  { cmd: '@dispose', desc: 'Fixes a “stuck” NPC conversation or frozen character.', when: 'If an NPC won’t respond.' },
  { cmd: '@mapfix', desc: 'Returns you to the map’s entry point if you fall out of bounds.', when: 'When stuck in terrain.' },
  { cmd: '@gm', desc: 'Sends a help request to online staff.', when: 'Only when you genuinely need a GM.' },
]

/* ── NPC data ── */
const NPCS = [
  { emoji: '🔁', name: 'Rebirth NPC', purpose: 'Reborn your maxed character for permanent bonuses.', location: 'Free Market entrance', why: 'Your gateway to long-term, end-game power.' },
  { emoji: '🎓', name: 'Job Advancer', purpose: 'Handles every job advancement (2nd, 3rd, 4th).', location: 'Major towns / FM', why: 'Advance jobs instantly without hunting town NPCs.' },
  { emoji: '🌀', name: 'Teleporter', purpose: 'Warps you to popular towns & training maps.', location: 'Free Market entrance', why: 'Saves loads of travel time.' },
  { emoji: '🧰', name: 'FM Helper', purpose: 'Sells potions, scrolls & basic gear; useful tools.', location: 'Free Market', why: 'One-stop shop for everyday supplies.' },
  { emoji: '🎁', name: 'Event NPC', purpose: 'Runs current events and hands out prizes.', location: 'Town spawn / FM', why: 'Free rewards and seasonal fun.' },
  { emoji: '🗳️', name: 'Vote Reward NPC', purpose: 'Claim the NX you earned from voting.', location: 'Free Market entrance', why: 'Turn daily votes into Cash Shop items.' },
  { emoji: '📦', name: 'Starter Pack NPC', purpose: 'Gives new characters beginner gear & potions.', location: 'First town', why: 'A free head-start for fresh characters.' },
]

/* ── Bossing data ── */
const PROGRESSION_STAGES = [
  { emoji: '🌱', tier: 'Early Game (Lv 1–70)', color: '#1d6b41', text: 'Wear whatever drops, do PQs, and grab cheap FM gear. Don’t over-invest — you’ll out-level it fast.' },
  { emoji: '⚒️', tier: 'Mid Game (Lv 70–135)', color: '#b45309', text: 'Start scrolling weapons & armor, farm mesos, and chase your first set bonuses. Zakum becomes your goal.' },
  { emoji: '💎', tier: 'End Game (Lv 135+)', color: '#3b6ea5', text: 'Hunt boss-drop gear (Horntail, etc.), perfect your scrolls, and optimize for damage. Begin rebirthing.' },
]

const BOSSES = [
  { emoji: '🌋', name: 'Zakum', level: 'Lv 50+ (party)', reward: 'Zakum Helmet & EXP', note: 'The classic first big boss. Form a party at the El Nath altar.' },
  { emoji: '🐉', name: 'Horntail', level: 'Lv 80+ (expedition)', reward: 'HTP pendant & rare gear', note: 'Multi-stage dragon fight in Leafre — top mid/end-game loot.' },
  { emoji: '⏰', name: 'Papulatus', level: 'Lv 115+ (small party)', reward: 'Pap Mark & scrolls', note: 'Time-themed boss in Ludibrium clocktower.' },
  { emoji: '🐟', name: 'Pianus', level: 'Lv 110+ (party)', reward: 'Strong accessories', note: 'Aqua Road sea boss — long, gear-checking fight.' },
]

const SYSTEMS = [
  { emoji: '🎰', name: 'Gachapon', text: 'Spend Gachapon Tickets at the machines in major towns for a shot at rare scrolls, equips, chairs and cash items.' },
  { emoji: '🤝', name: 'Alliance', text: 'Band several guilds together into an Alliance with shared alliance chat — perfect for bigger events and bossing.' },
  { emoji: '👨‍👩‍👧', name: 'Family', text: 'Recruit juniors or pick a senior on the Family tree. Playing together earns reward points you spend on EXP and buff coupons.' },
  { emoji: '💍', name: 'Marriage', text: 'Propose with a ring, hold a ceremony at the Wedding Cathedral or Chapel, and unlock the couple-only Amoria party quest.' },
  { emoji: '🏅', name: 'Medals', text: 'Hit milestones — monster kills, quests, level goals — to earn medals and titles you can wear right under your name.' },
  { emoji: '📖', name: 'Monster Book', text: 'Monsters drop collectible cards. Complete sets in your Monster Book for permanent stat bonuses and ring rewards.' },
  { emoji: '🐶', name: 'Pets', text: 'Hatch a pet egg, keep it fed, and equip auto-loot / auto-HP so it gathers drops and items while you train.' },
]

const SCROLL_TIPS = [
  'Scrolls add stats but can fail and even destroy the item — start on cheap gear.',
  'Use a Clean Slate Scroll to recover a failed upgrade slot.',
  'Farm mesos at high-density maps or sell drops in the Free Market.',
]

/* ── FAQ / extras ── */
const MISTAKES = [
  'Dumping AP into the wrong stat — check your class’s main stat first.',
  'Scrolling expensive gear too early (before you understand fail rates).',
  'Ignoring Party Quests — they’re the fastest, most fun early EXP.',
  'Forgetting to vote daily for free NX.',
  'Selling rare drops to NPCs instead of the Free Market.',
]

const GLOSSARY = [
  { term: 'AP', def: 'Ability Points — assign these to STR/DEX/INT/LUK each level.' },
  { term: 'SP', def: 'Skill Points — used to level up your class skills.' },
  { term: 'PQ', def: 'Party Quest — a co-op instance for EXP & rewards.' },
  { term: 'FM', def: 'Free Market — player trading hub.' },
  { term: 'Mesos', def: 'The in-game currency.' },
  { term: 'NX', def: 'Cash Shop currency — earn it free by voting.' },
  { term: 'Mobbing', def: 'Clearing many monsters at once for EXP.' },
  { term: 'Bossing', def: 'Fighting powerful single bosses for loot.' },
  { term: 'Scrolling', def: 'Using scrolls to upgrade equipment stats.' },
  { term: 'Buff', def: 'A temporary boost to your stats or party’s.' },
]

const EXTRA_CARDS = [
  { emoji: '🛡️', title: 'Guilds & Social', text: 'Join a guild for chat, parties and group bosses. Use the buddy list to keep friends close and party up faster.' },
  { emoji: '🛒', title: 'Free Market', text: 'Set up or browse player shops to buy/sell gear. Always price-check here before NPC-selling rare items.' },
  { emoji: '🐾', title: 'Pets & Mounts', text: 'Pets auto-loot drops (huge quality-of-life) and mounts speed up travel. Grab one early if you can.' },
  { emoji: '🗳️', title: 'Vote Rewards & Dailies', text: 'Vote every day for NX, and check the Event NPC for daily/seasonal rewards.' },
  { emoji: '🔒', title: 'Account Safety', text: 'Never share your password, set a secondary (storage) PIN, and beware of “free item” scams.' },
]

const FAQ = [
  { q: 'How do I create an account?', a: 'Sign up free on the website — you’ll need a valid email. A website account is required before you can log in (the game won’t auto-create one), and it’s how you agree to our Terms & Privacy Policy. Then play instantly in your browser or with the desktop client.' },
  { q: 'I’m brand new — what should I do first?', a: 'Make a beginner-friendly class (Warrior or Magician), finish Maple Island to Lv 10, take your 1st job, grab the Starter Pack, then jump into Kerning PQ at Lv 21.' },
  { q: 'Do I have to pay anything?', a: 'No. ShinyMS is completely free and not pay-to-win. You earn NX simply by voting daily.' },
  { q: 'What are the server rates?', a: 'ShinyMS runs 7× EXP, 5× Meso and 3× Drop. Type @rates in-game to confirm any active event boosts.' },
  { q: 'How do I level up fastest?', a: 'Combine grinding at high-density maps with a daily Party Quest, party with others, and hunt monsters slightly above your level.' },
  { q: 'My NPC chat froze — help!', a: 'Type @dispose to unstick the conversation. If you’re stuck in terrain, use @mapfix.' },
  { q: 'How does rebirth work?', a: 'Once your character is maxed, talk to the Rebirth NPC at the Free Market to reset for permanent stat bonuses. See the Rebirth section above.' },
]

export default function GuidePage() {
  return (
    <div>
      {/* ── Hero banner — daytime Maple World scene ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #2f74bd 0%, #4a8fce 45%, #79b4e2 78%, #a7d2ef 100%)' }}
      >
        <HeroScene />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-32 sm:pb-40 text-center">
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(26,58,92,0.35)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
          >
            📖 Beginner Friendly · Returning Players Welcome
          </div>
          <h1 className="font-display font-bold leading-tight mb-4 maple-logo-text" style={{ fontSize: 'clamp(2.1rem, 6vw, 3.6rem)' }}>
            ShinyMS Player Guide
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium" style={{ color: '#fff', textShadow: '0 1px 6px rgba(26,58,92,0.55)' }}>
            New to MapleStory or dusting off your old adventurer hat? This guide walks you through everything —
            from your very first steps to slaying end-game bosses. 🍁
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a href="https://play.shinyms.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.03]" style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 4px 0 #8a6512, 0 8px 18px rgba(26,58,92,0.35)' }}>
              ▶ Play Now
            </a>
            <a href="#getting-started" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.03]" style={{ backgroundColor: '#fff', color: 'var(--primary)', boxShadow: '0 4px 0 #b9c7d6, 0 8px 18px rgba(26,58,92,0.25)' }}>
              Start Reading ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── Body: sticky TOC + content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8 lg:gap-12">
          <GuideToc items={TOC} />

          <div className="min-w-0 flex flex-col gap-16">

            {/* ═══ Getting Started ═══ */}
            <section id="getting-started" className="guide-anchor">
              <SectionHead kicker="Chapter 01" emoji="🚀" title="Getting Started"
                sub="Everything you need for a smooth first hour — from making your character to your very first levels." />

              {/* Quick-start steps */}
              <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>✨ What should I do first?</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {FIRST_STEPS.map((s) => (
                  <div key={s.n} className="rounded-xl p-4 flex gap-3 hover-card" style={cardStyle}>
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>{s.n}</div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}><span aria-hidden>{s.emoji}</span> {s.title}</div>
                      <p className="text-sm mt-0.5 leading-snug" style={{ color: 'var(--foreground-muted)' }}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls + Inventory */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl p-5" style={cardStyle}>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>🎮 Basic Controls</h3>
                  <div className="flex flex-col gap-1.5">
                    {BASIC_CONTROLS.map((c) => (
                      <div key={c.key} className="flex items-center justify-between gap-2 text-sm">
                        <kbd className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>{c.key}</kbd>
                        <span style={{ color: 'var(--foreground-muted)' }}>{c.do}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-5" style={cardStyle}>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>🎒 Inventory Tabs</h3>
                  <div className="flex flex-col gap-1.5">
                    {INVENTORY_TABS.map((t) => (
                      <div key={t.name} className="flex items-center gap-2.5 text-sm">
                        <span aria-hidden className="text-base">{t.emoji}</span>
                        <span className="font-semibold w-12 shrink-0" style={{ color: 'var(--foreground)' }}>{t.name}</span>
                        <span style={{ color: 'var(--foreground-muted)' }}>{t.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basics callouts */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { emoji: '📡', t: 'Channels', d: 'Switch channels (1–N) to find quieter maps or rejoin friends. Your character stays the same.' },
                  { emoji: '❤️', t: 'HP / MP', d: 'HP is your health, MP fuels skills. Keep potions in your Use tab and hot-keyed.' },
                  { emoji: '📘', t: 'Skills & SP', d: 'Each level grants SP — spend it in the Skills (S) window to power up your abilities.' },
                ].map((b) => (
                  <div key={b.t} className="rounded-xl p-4" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--border-subtle)' }}>
                    <div className="font-semibold text-sm mb-1" style={{ color: 'var(--accent-foreground)' }}><span aria-hidden>{b.emoji}</span> {b.t}</div>
                    <p className="text-xs leading-snug" style={{ color: 'var(--foreground-muted)' }}>{b.d}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl px-5 py-4 flex items-start gap-3" style={{ backgroundColor: 'var(--success-subtle)', border: '1px solid var(--success-border)' }}>
                <span aria-hidden className="text-lg">💡</span>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}><strong style={{ color: 'var(--success)' }}>Beginner tip:</strong> Warriors and Magicians are the most forgiving first classes. You can always make a second character later to try the rest!</p>
              </div>
            </section>

            {/* ═══ Classes ═══ */}
            <section id="classes" className="guide-anchor">
              <SectionHead kicker="Chapter 02" emoji="⚔️" title="Classes & Jobs"
                sub="The five classic Explorer paths — plus the Cygnus Knights and Aran hero classes. Here’s how each plays, and which suit a fresh start." />

              <div className="grid sm:grid-cols-2 gap-4">
                {CLASSES.map((c) => (
                  <div key={c.name} className="rounded-2xl overflow-hidden hover-card" style={cardStyle}>
                    <div className="px-5 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${c.accent}14, ${c.accent}04)`, borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-3">
                        <span aria-hidden className="text-2xl">{c.emoji}</span>
                        <span className="font-display font-bold text-lg" style={{ color: 'var(--foreground)' }}>{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.beginner && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>BEGINNER ✓</span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${DIFF_COLOR[c.diff]}18`, color: DIFF_COLOR[c.diff] }}>{c.diff}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>{c.play}</p>
                      <div className="flex flex-col gap-1.5 mb-3">
                        {c.strengths.map((s) => (
                          <div key={s} className="flex items-center gap-2 text-sm">
                            <span className="guide-pip" style={{ backgroundColor: c.accent }} />
                            <span style={{ color: 'var(--foreground)' }}>{s}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs mb-3 flex items-start gap-1.5" style={{ color: 'var(--foreground-muted)' }}><span aria-hidden>⚠️</span> {c.weakness}</p>
                      <div className="text-xs pt-3" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--foreground-subtle)' }}>
                        <strong style={{ color: c.accent }}>⚔️ Mob vs Boss:</strong> {c.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hero / alternate-start classes */}
              <h3 className="font-display font-bold text-lg mt-8 mb-4" style={{ color: 'var(--foreground)' }}>🦸 Hero Classes — Cygnus Knights & Aran</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {HERO_CLASSES.map((c) => (
                  <div key={c.name} className="rounded-2xl overflow-hidden hover-card" style={cardStyle}>
                    <div className="px-5 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${c.accent}14, ${c.accent}04)`, borderBottom: '1px solid var(--border-subtle)' }}>
                      <span aria-hidden className="text-2xl">{c.emoji}</span>
                      <span className="font-display font-bold text-lg" style={{ color: 'var(--foreground)' }}>{c.name}</span>
                    </div>
                    <div className="p-5">
                      <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>{c.play}</p>
                      <div className="flex flex-col gap-1.5 mb-3">
                        {c.branches.map((b) => (
                          <div key={b} className="flex items-center gap-2 text-sm">
                            <span className="guide-pip" style={{ backgroundColor: c.accent }} />
                            <span style={{ color: 'var(--foreground)' }}>{b}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs pt-3" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--foreground-subtle)' }}>
                        <strong style={{ color: c.accent }}>💡 Good to know:</strong> {c.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff classes */}
              <div className="mt-6 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, var(--accent-subtle), var(--surface))', border: '1px solid var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-foreground)' }}>🔒 Staff-Only Classes</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {STAFF_CLASSES.map((s) => (
                    <div key={s.name} className="flex items-start gap-3">
                      <span aria-hidden className="text-xl">{s.emoji}</span>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{s.name}</div>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--foreground-subtle)' }}>These cannot be chosen by players — they’re reserved for the ShinyMS team. 🛡️</p>
              </div>
            </section>

            {/* ═══ Party Quests ═══ */}
            <section id="party-quests" className="guide-anchor">
              <SectionHead kicker="Chapter 03" emoji="🎉" title="Party Quests (PQ Guide)"
                sub="PQs are co-op mini-adventures — fast EXP, exclusive rewards, and the best way to make friends on day one." />

              <div className="flex flex-col gap-3">
                {PQS.map((pq) => (
                  <div key={pq.name} className="rounded-2xl p-5 hover-card" style={cardStyle}>
                    <div className="flex items-center gap-3 mb-3">
                      <span aria-hidden className="text-2xl">{pq.emoji}</span>
                      <h3 className="font-display font-bold text-lg" style={{ color: 'var(--foreground)' }}>{pq.name}</h3>
                      <span className="ml-auto text-xs font-mono font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>{pq.level}</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-xs block" style={{ color: 'var(--foreground-subtle)' }}>📍 Location</span><span style={{ color: 'var(--foreground)' }}>{pq.location}</span></div>
                      <div><span className="text-xs block" style={{ color: 'var(--foreground-subtle)' }}>👥 Party</span><span style={{ color: 'var(--foreground)' }}>{pq.party}</span></div>
                      <div><span className="text-xs block" style={{ color: 'var(--foreground-subtle)' }}>🎁 Rewards</span><span style={{ color: 'var(--foreground)' }}>{pq.reward}</span></div>
                    </div>
                    <p className="text-sm mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--foreground-muted)' }}><strong style={{ color: 'var(--accent)' }}>Why do it:</strong> {pq.why}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl p-5" style={cardStyle}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--foreground)' }}>🤝 PQ Etiquette & Beginner Tips</h3>
                <ul className="flex flex-col gap-2">
                  {PQ_TIPS.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}><span aria-hidden style={{ color: 'var(--success)' }}>✓</span> {t}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ═══ Training ═══ */}
            <section id="training" className="guide-anchor">
              <SectionHead kicker="Chapter 04" emoji="🗺️" title="Training Guide"
                sub="A clear leveling path from Lv 1 to end-game. Follow the tiers and watch your level fly with 7× EXP." />

              <div className="flex flex-col gap-4">
                {TRAINING.map((t) => (
                  <div key={t.tier} className="rounded-2xl overflow-hidden" style={cardStyle}>
                    <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: `${t.color}12`, borderBottom: `2px solid ${t.color}` }}>
                      <span className="font-display font-bold" style={{ color: t.color }}>{t.tier} Game</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono font-bold" style={{ color: t.color }}>{t.range}</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--foreground-muted)' }}>{t.mode}</span>
                      </div>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                      {t.spots.map((s) => (
                        <div key={s.map} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover-row">
                          <span className="font-semibold text-sm sm:w-52 shrink-0" style={{ color: 'var(--foreground)' }}>📌 {s.map}</span>
                          <span className="text-sm sm:w-44 shrink-0" style={{ color: 'var(--foreground-muted)' }}>👾 {s.mob}</span>
                          <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>{s.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--primary)' }}>⚡ Fast Leveling Tips</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {FAST_TIPS.map((t) => (
                    <div key={t} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}><span aria-hidden>🔥</span> {t}</div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ Rebirth ═══ */}
            <section id="rebirth" className="guide-anchor">
              <SectionHead kicker="Chapter 05" emoji="🔁" title="Rebirth System"
                sub="Hit max level? Rebirth resets your journey for permanent power — the heart of long-term progression." />

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { emoji: '🤔', t: 'What is it?', d: 'Rebirth resets a maxed character back to a low level while granting permanent, stacking bonuses.' },
                  { emoji: '✅', t: 'Requirements', d: 'Reach the max level cap, then visit the Rebirth NPC at the Free Market.' },
                  { emoji: '📈', t: 'Benefits', d: 'Each rebirth boosts your base stats and damage — your character gets stronger every cycle.' },
                ].map((b) => (
                  <div key={b.t} className="rounded-2xl p-5" style={cardStyle}>
                    <div className="text-2xl mb-2" aria-hidden>{b.emoji}</div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>{b.t}</h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{b.d}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}>
                <h3 className="font-display font-bold text-base mb-2" style={{ color: '#fff' }}>🎯 Long-Term Goals & Strategy</h3>
                <ul className="flex flex-col gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <li className="flex gap-2"><span aria-hidden>⭐</span> Rebirth as soon as you’re maxed — the bonuses compound over time.</li>
                  <li className="flex gap-2"><span aria-hidden>⭐</span> Each cycle gets faster as your permanent stats climb.</li>
                  <li className="flex gap-2"><span aria-hidden>⭐</span> Aim for high rebirth counts before tackling the hardest bosses.</li>
                </ul>
              </div>

              <div className="rounded-2xl p-5" style={cardStyle}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--foreground)' }}>❓ Rebirth FAQ</h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div><strong style={{ color: 'var(--foreground)' }}>Do I lose my gear?</strong><p style={{ color: 'var(--foreground-muted)' }}>No — your equipment and items stay. Only your level and EXP reset.</p></div>
                  <div><strong style={{ color: 'var(--foreground)' }}>Is it worth it?</strong><p style={{ color: 'var(--foreground-muted)' }}>Absolutely. Rebirthing is the main way to keep growing once you’ve maxed out.</p></div>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--foreground-subtle)' }}>ℹ️ Exact caps & bonuses can change with server updates — type <code style={{ fontFamily: 'var(--font-geist-mono)' }}>@help</code> or ask a GM for current details.</p>
            </section>

            {/* ═══ Commands ═══ */}
            <section id="commands" className="guide-anchor">
              <SectionHead kicker="Chapter 06" emoji="💬" title="In-Game Commands"
                sub="Type these in the chat box (including the @) to get info and quality-of-life help instantly." />

              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="hidden sm:grid grid-cols-[140px_1fr_1fr] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--foreground-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <span>Command</span><span>What it does</span><span>When to use</span>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {COMMANDS.map((c) => (
                    <div key={c.cmd} className="grid sm:grid-cols-[140px_1fr_1fr] gap-1 sm:gap-4 px-5 py-3 hover-row">
                      <code className="font-mono font-bold text-sm self-start" style={{ color: 'var(--primary)' }}>{c.cmd}</code>
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{c.desc}</span>
                      <span className="text-xs sm:text-sm" style={{ color: 'var(--foreground-subtle)' }}>{c.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ NPCs ═══ */}
            <section id="npcs" className="guide-anchor">
              <SectionHead kicker="Chapter 07" emoji="🧙" title="Important Custom NPCs"
                sub="ShinyMS adds helpful NPCs to make your life easier. Most live at the Free Market entrance — your home base." />

              <div className="grid sm:grid-cols-2 gap-4">
                {NPCS.map((n) => (
                  <div key={n.name} className="rounded-2xl p-5 flex gap-4 hover-card" style={cardStyle}>
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--border-subtle)' }} aria-hidden>{n.emoji}</div>
                    <div>
                      <h3 className="font-display font-bold text-base" style={{ color: 'var(--foreground)' }}>{n.name}</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>{n.purpose}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                        <span style={{ color: 'var(--foreground-subtle)' }}>📍 {n.location}</span>
                      </div>
                      <p className="text-xs mt-1.5" style={{ color: 'var(--accent)' }}>💡 {n.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ Progression & Bossing ═══ */}
            <section id="progression" className="guide-anchor">
              <SectionHead kicker="Chapter 08" emoji="💎" title="Progression & Bossing"
                sub="How gear, mesos and upgrades come together — and the legendary bosses waiting at the top." />

              {/* Gear stages */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {PROGRESSION_STAGES.map((p) => (
                  <div key={p.tier} className="rounded-2xl p-5" style={{ ...cardStyle, borderTop: `3px solid ${p.color}` }}>
                    <div className="text-2xl mb-2" aria-hidden>{p.emoji}</div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: p.color }}>{p.tier}</h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{p.text}</p>
                  </div>
                ))}
              </div>

              {/* Meso + scrolling */}
              <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--accent-foreground)' }}>💰 Meso Farming & 📜 Scrolling Basics</h3>
                <ul className="flex flex-col gap-2">
                  {SCROLL_TIPS.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}><span aria-hidden>•</span> {t}</li>
                  ))}
                </ul>
              </div>

              {/* Bosses */}
              <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>🐲 Popular Bosses</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {BOSSES.map((b) => (
                  <div key={b.name} className="rounded-2xl p-5 hover-card" style={cardStyle}>
                    <div className="flex items-center gap-3 mb-2">
                      <span aria-hidden className="text-2xl">{b.emoji}</span>
                      <h4 className="font-display font-bold text-lg" style={{ color: 'var(--foreground)' }}>{b.name}</h4>
                      <span className="ml-auto text-xs font-mono font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)' }}>{b.level}</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{b.note}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>🎁 {b.reward}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm mt-4 text-center">
                <Link href="/bosses" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>See live boss leaderboards →</Link>
              </p>

              {/* Drop Search callout */}
              <div id="drop-search" className="guide-anchor rounded-2xl p-5 mt-6 flex flex-col sm:flex-row sm:items-center gap-4" style={{ backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg mb-1 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>🔍 Drop Search</h3>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Hunting a specific item? Look up exactly which monsters drop it — or pull up any monster&apos;s full loot table with base drop rates.
                  </p>
                </div>
                <Link href="/drops" className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.03]" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                  Open Drop Search →
                </Link>
              </div>
            </section>

            {/* ═══ Systems & Features ═══ */}
            <section id="systems" className="guide-anchor">
              <SectionHead kicker="Chapter 09" emoji="🎀" title="Systems & Features"
                sub="The classic side systems that make Maple World more than just grinding — gacha, social bonds, collections and more." />

              <div className="grid sm:grid-cols-2 gap-4">
                {SYSTEMS.map((s) => (
                  <div key={s.name} className="rounded-2xl p-5 hover-card" style={cardStyle}>
                    <div className="flex items-center gap-3 mb-2">
                      <span aria-hidden className="text-2xl">{s.emoji}</span>
                      <h3 className="font-display font-bold text-lg" style={{ color: 'var(--foreground)' }}>{s.name}</h3>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ FAQ & Extras ═══ */}
            <section id="faq" className="guide-anchor">
              <SectionHead kicker="Chapter 10" emoji="❓" title="FAQ & Extra Help"
                sub="Common questions, rookie mistakes to dodge, a handy glossary, and the social systems that make Maple great." />

              {/* FAQ accordion */}
              <div className="flex flex-col gap-2 mb-8">
                {FAQ.map((f) => (
                  <details key={f.q} className="rounded-xl group" style={cardStyle}>
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                      <span>{f.q}</span>
                      <span aria-hidden className="shrink-0 transition-transform group-open:rotate-45 text-lg" style={{ color: 'var(--primary)' }}>+</span>
                    </summary>
                    <p className="px-5 pb-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>{f.a}</p>
                  </details>
                ))}
              </div>

              {/* Mistakes to avoid */}
              <div className="rounded-2xl p-5 mb-8" style={{ backgroundColor: 'var(--destructive-subtle)', border: '1px solid var(--destructive-border)' }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--destructive)' }}>🚫 Beginner Mistakes to Avoid</h3>
                <ul className="flex flex-col gap-2">
                  {MISTAKES.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}><span aria-hidden style={{ color: 'var(--destructive)' }}>✗</span> {m}</li>
                  ))}
                </ul>
              </div>

              {/* Extra helpful cards */}
              <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>🌟 Helpful Systems</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {EXTRA_CARDS.map((c) => (
                  <div key={c.title} className="rounded-2xl p-5 hover-card" style={cardStyle}>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}><span aria-hidden>{c.emoji}</span> {c.title}</h4>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Glossary */}
              <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>📖 MapleStory Glossary</h3>
              <div className="rounded-2xl p-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5" style={cardStyle}>
                {GLOSSARY.map((g) => (
                  <div key={g.term} className="flex gap-2 text-sm">
                    <span className="font-mono font-bold shrink-0" style={{ color: 'var(--primary)' }}>{g.term}</span>
                    <span style={{ color: 'var(--foreground-muted)' }}>— {g.def}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Closing CTA ── */}
            <section className="rounded-3xl p-8 sm:p-10 text-center" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}>
              <p className="font-display font-bold text-xl sm:text-2xl mb-2" style={{ color: '#fff', letterSpacing: '0.03em' }}>Ready to begin your adventure? 🍁</p>
              <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>You’ve got the knowledge — now go make some memories. The island awaits!</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="https://play.shinyms.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.02]" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>Play Now →</a>
                <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150 hover:bg-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}>Create Free Account</Link>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
