import Link from 'next/link'
import type { Metadata } from 'next'
import GuideToc, { type TocItem } from '@/components/guide/GuideToc'

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

const panel = {
  background: 'linear-gradient(to bottom, #f8efd0 0%, #e8dcc0 100%)',
  border: '3px solid #5a3e2a',
  boxShadow: 'inset 0 0 0 2px #fff, 4px 4px 0 rgba(0,0,0,0.25)',
} as const

const titleBar = {
  background: 'linear-gradient(to bottom, #3a5a8a 0%, #2a4060 100%)',
  borderBottom: '2px solid #5a3e2a',
  padding: '10px 16px',
} as const

function SectionHead({ kicker, emoji, title, sub }: { kicker: string; emoji: string; title: string; sub: string }) {
  return (
    <div className="mb-6">
      <p style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#3a5a8a', letterSpacing: 1, margin: '0 0 6px' }}>
        {kicker}
      </p>
      <h2 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 12, color: '#3a2418', letterSpacing: 1, margin: '0 0 8px' }}>
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30', maxWidth: '36rem', lineHeight: 1.4, margin: 0 }}>
        {sub}
      </p>
    </div>
  )
}

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

type Diff = 'Easy' | 'Medium' | 'Hard'
const DIFF_COLOR: Record<Diff, string> = { Easy: '#1d6b41', Medium: '#b45309', Hard: '#b91c1c' }

const CLASSES = [
  { emoji: '🛡️', name: 'Warrior', accent: '#c0392b', diff: 'Easy' as Diff, beginner: true, play: 'Tanky melee bruiser. Wade into mobs and swing.', strengths: ['Huge HP', 'Forgiving', 'Great survivability'], weakness: 'Short range — must get up close.', role: 'Strong mobber, solid bosser later.' },
  { emoji: '🔮', name: 'Magician', accent: '#6d28d9', diff: 'Medium' as Diff, beginner: true, play: 'Ranged spellcaster that hits whole groups of monsters.', strengths: ['Best AoE mobbing', 'Ranged & safe', 'Fast leveling'], weakness: 'Very low HP early — squishy until gear improves.', role: 'King of mobbing; useful support at bosses.' },
  { emoji: '🏹', name: 'Bowman', accent: '#1d6b41', diff: 'Medium' as Diff, beginner: false, play: 'Long-range archer that picks enemies off from a distance.', strengths: ['Longest range', 'High single-target damage', 'Safe positioning'], weakness: 'Needs arrows; weaker at clearing big clusters.', role: 'Decent mobber, excellent bosser.' },
  { emoji: '🗡️', name: 'Thief', accent: '#334155', diff: 'Hard' as Diff, beginner: false, play: 'Stars (assassin) or claws/daggers (bandit). Fast and mobile.', strengths: ['High burst', 'Mobile & evasive', 'Strong bossing'], weakness: 'Gear-hungry; trickier to play well.', role: 'Bandit mobs well, assassin bosses well.' },
  { emoji: '⚓', name: 'Pirate', accent: '#b45309', diff: 'Medium' as Diff, beginner: true, play: 'Gunslinger (ranged) or Brawler (melee). Flashy & flexible.', strengths: ['Balanced HP & damage', 'Fun & versatile', 'Good all-rounder'], weakness: 'Jack-of-all-trades — masters none early on.', role: 'Comfortable at both mobbing and bossing.' },
]

const HERO_CLASSES = [
  { emoji: '🦋', name: 'Cygnus Knights', accent: '#0284c7', play: 'An alternate starting path of five elemental knights. You begin as a Noblesse on Ereve, then pick a branch.', branches: ['Dawn Warrior — STR melee', 'Blaze Wizard — INT mage', 'Wind Archer — DEX bow', 'Night Walker — LUK thief / stars', 'Thunder Breaker — STR pirate'], note: 'Fast early leveling and strong skills — a great change of pace once you know the basics.' },
  { emoji: '❄️', name: 'Aran', accent: '#0891b2', play: 'A polearm-wielding warrior hero awakened from a long slumber. You start as a Legend in Rien.', branches: ['Combo-driven melee damage', 'High HP & great mobility', 'Excellent solo mobber'], note: 'Beginner-friendly melee with flashy combos — a popular solo-leveling class.' },
]

const STAFF_CLASSES = [
  { emoji: '👑', name: 'GM', text: 'Game Master — a staff member who runs events, helps players and moderates the server.' },
  { emoji: '🌟', name: 'SuperGM', text: 'Senior administrator with full server powers. Oversees the team and major decisions.' },
]

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
  "Don't leave mid-run; it can fail the whole party.",
  'Keep some potions handy — a few stages have tougher monsters.',
]

const TRAINING = [
  { tier: 'Early', color: '#1d6b41', range: 'Lv 1–30', mode: 'Solo or Kerning PQ', spots: [{ map: 'Maple Island', mob: 'Snails & Shrooms', note: 'Quick start to Lv 10.' }, { map: 'Henesys Hunting Grounds', mob: 'Slimes / Stumps', note: 'Easy AoE leveling.' }, { map: 'Kerning PQ', mob: 'Party Quest', note: 'Best EXP at Lv 21–30.' }] },
  { tier: 'Mid', color: '#b45309', range: 'Lv 31–70', mode: 'Party recommended', spots: [{ map: 'Ant Tunnel (Ellinia)', mob: 'Horned/Zombie Mushrooms', note: 'Dense maps, great AoE.' }, { map: 'Ludibrium PQ', mob: 'Party Quest', note: 'Top EXP for Lv 35–50.' }, { map: 'Kerning Subway', mob: 'Jr. Wraiths', note: 'Mage-friendly clusters.' }] },
  { tier: 'High', color: '#3b6ea5', range: 'Lv 71–120', mode: 'Party or strong solo', spots: [{ map: 'Petrifighters (Sleepywood)', mob: 'Petrifighters', note: 'Classic grind spot.' }, { map: 'Skeles (Ludibrium)', mob: 'Skelegons/Skelosaurus', note: 'Elite EXP, brings gear.' }, { map: 'Himes (Showa/Ludi)', mob: 'Dreamy Ghosts', note: 'Excellent steady EXP.' }] },
  { tier: 'End', color: '#7c3aed', range: 'Lv 120+', mode: 'Strong gear / party', spots: [{ map: 'Gallos / Oblivion', mob: 'Gallopera', note: 'High-density end-game grind.' }, { map: 'Temple of Time', mob: 'Various', note: 'Quests + strong EXP maps.' }, { map: 'Leafre / Cavern', mob: 'Dragons', note: 'Pre-bossing grind zone.' }] },
]

const FAST_TIPS = [
  'Stack EXP: combine grinding with a daily PQ for the best gains.',
  'Use HP/MP potions freely — dying costs EXP.',
  'Hunt where monsters are 5–15 levels above you for max EXP.',
  'Party up — shared maps clear faster and split safely.',
]

const COMMANDS = [
  { cmd: '@help', desc: 'Show available commands.' },
  { cmd: '@commands', desc: 'Show available commands.' },
  { cmd: '@droplimit', desc: 'Check drop limit of current map.' },
  { cmd: '@time', desc: 'Show current server time.' },
  { cmd: '@credits', desc: 'Show credits — the people who made the server possible.' },
  { cmd: '@uptime', desc: 'Show server online time.' },
  { cmd: '@gacha', desc: 'Show gachapon rewards.' },
  { cmd: '@dispose', desc: 'Dispose to fix a stuck NPC chat or frozen character.' },
  { cmd: '@changel', desc: 'Change language settings.' },
  { cmd: '@equiplv', desc: 'Show levels of all equipped items.' },
  { cmd: '@showrates', desc: 'Show all world/character rates.' },
  { cmd: '@rates', desc: 'Show your personal rates.' },
  { cmd: '@online', desc: 'Show all online players.' },
  { cmd: '@gm', desc: 'Send a message to the game masters.' },
  { cmd: '@reportbug', desc: 'Send in a bug report.' },
  { cmd: '@points', desc: 'Show your point total.' },
  { cmd: '@joinevent', desc: 'Join the active event.' },
  { cmd: '@leaveevent', desc: 'Leave the active event.' },
  { cmd: '@ranks', desc: 'Show player rankings.' },
  { cmd: '@str', desc: 'Assign AP into STR.' },
  { cmd: '@dex', desc: 'Assign AP into DEX.' },
  { cmd: '@int', desc: 'Assign AP into INT.' },
  { cmd: '@luk', desc: 'Assign AP into LUK.' },
  { cmd: '@enableauth', desc: 'Enable PIC code by resetting the cooldown.' },
  { cmd: '@toggleexp', desc: 'Toggle enable/disable all EXP gain.' },
  { cmd: '@mylawn', desc: 'Claim ownership of the current map.' },
  { cmd: '@bosshp', desc: 'Show HP of bosses on the current map.' },
  { cmd: '@mobhp', desc: 'Show HP of mobs on the current map.' },
]

const NPCS = [
  { emoji: '🔁', name: 'Rebirth NPC', purpose: 'Reborn your maxed character for permanent bonuses.', location: 'Free Market entrance', why: 'Your gateway to long-term, end-game power.' },
  { emoji: '🎓', name: 'Job Advancer', purpose: 'Handles every job advancement (2nd, 3rd, 4th).', location: 'Major towns / FM', why: 'Advance jobs instantly without hunting town NPCs.' },
  { emoji: '🌀', name: 'Teleporter', purpose: 'Warps you to popular towns & training maps.', location: 'Free Market entrance', why: 'Saves loads of travel time.' },
  { emoji: '🧰', name: 'FM Helper', purpose: 'Sells potions, scrolls & basic gear; useful tools.', location: 'Free Market', why: 'One-stop shop for everyday supplies.' },
  { emoji: '🎁', name: 'Event NPC', purpose: 'Runs current events and hands out prizes.', location: 'Town spawn / FM', why: 'Free rewards and seasonal fun.' },
  { emoji: '🗳️', name: 'Vote Reward NPC', purpose: 'Claim the NX you earned from voting.', location: 'Free Market entrance', why: 'Turn daily votes into Cash Shop items.' },
  { emoji: '📦', name: 'Starter Pack NPC', purpose: 'Gives new characters beginner gear & potions.', location: 'First town', why: 'A free head-start for fresh characters.' },
]

const PROGRESSION_STAGES = [
  { emoji: '🌱', tier: 'Early Game (Lv 1–70)', color: '#1d6b41', text: "Wear whatever drops, do PQs, and grab cheap FM gear. Don't over-invest — you'll out-level it fast." },
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

const MISTAKES = [
  "Dumping AP into the wrong stat — check your class's main stat first.",
  'Scrolling expensive gear too early (before you understand fail rates).',
  "Ignoring Party Quests — they're the fastest, most fun early EXP.",
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
  { term: 'Buff', def: "A temporary boost to your stats or party's." },
]

const EXTRA_CARDS = [
  { emoji: '🛡️', title: 'Guilds & Social', text: 'Join a guild for chat, parties and group bosses. Use the buddy list to keep friends close and party up faster.' },
  { emoji: '🛒', title: 'Free Market', text: 'Set up or browse player shops to buy/sell gear. Always price-check here before NPC-selling rare items.' },
  { emoji: '🐾', title: 'Pets & Mounts', text: 'Pets auto-loot drops (huge quality-of-life) and mounts speed up travel. Grab one early if you can.' },
  { emoji: '🗳️', title: 'Vote Rewards & Dailies', text: 'Vote every day for NX, and check the Event NPC for daily/seasonal rewards.' },
  { emoji: '🔒', title: 'Account Safety', text: 'Never share your password, set a secondary (storage) PIN, and beware of "free item" scams.' },
]

const FAQ = [
  { q: 'How do I create an account?', a: "Sign up free on the website — you'll need a valid email. A website account is required before you can log in (the game won't auto-create one), and it's how you agree to our Terms & Privacy Policy. Then play instantly in your browser or with the desktop client." },
  { q: "I'm brand new — what should I do first?", a: 'Make a beginner-friendly class (Warrior or Magician), finish Maple Island to Lv 10, take your 1st job, grab the Starter Pack, then jump into Kerning PQ at Lv 21.' },
  { q: 'Do I have to pay anything?', a: 'No. ShinyMS is completely free and not pay-to-win. You earn NX simply by voting daily.' },
  { q: 'What are the server rates?', a: 'ShinyMS runs 7× EXP, 5× Meso and 3× Drop. Type @rates in-game to confirm any active event boosts.' },
  { q: 'How do I level up fastest?', a: 'Combine grinding at high-density maps with a daily Party Quest, party with others, and hunt monsters slightly above your level.' },
  { q: 'My NPC chat froze — help!', a: "Type @dispose to unstick the conversation. If you're stuck in terrain, use @mapfix." },
  { q: 'How does rebirth work?', a: 'Once your character is maxed, talk to the Rebirth NPC at the Free Market to reset for permanent stat bonuses. See the Rebirth section above.' },
]

export default function GuidePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-14 sm:pt-20 pb-20 sm:pb-28 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="mb-5" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#3a5a8a', letterSpacing: 1 }}>
            BEGINNER FRIENDLY · RETURNING PLAYERS WELCOME
          </p>
          <h1 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 'clamp(12px, 3vw, 18px)', color: '#3a2418', letterSpacing: 1, lineHeight: 1.3, margin: '0 0 16px' }}>
            SHINYMS PLAYER GUIDE
          </h1>
          <p className="max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: '#5a4a30' }}>
            New to MapleStory or dusting off your old adventurer hat? This guide walks you through everything — from your very first steps to slaying end-game bosses.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a href="https://play.shinyms.com" target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn-green">
              PLAY NOW
            </a>
            <a href="#getting-started" className="ms-btn">
              START READING
            </a>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <div style={panel}>
              <div style={titleBar}>
                <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#fff8d8', letterSpacing: 1 }}>CONTENTS</span>
              </div>
              <div className="p-3">
                <GuideToc items={TOC} />
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex flex-col gap-14">

            {/* Getting Started */}
            <section id="getting-started">
              <SectionHead kicker="CHAPTER 01" emoji="🚀" title="Getting Started" sub="Everything you need for a smooth first hour — from making your character to your very first levels." />

              <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 12px' }}>WHAT SHOULD I DO FIRST?</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {FIRST_STEPS.map((s) => (
                  <div key={s.n} className="p-4 flex gap-3" style={panel}>
                    <div className="shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, background: '#3a5a8a', color: '#fff', fontFamily: 'var(--ms-font-d)', fontSize: 10 }}>{s.n}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#3a2418', fontWeight: 700 }}><span aria-hidden>{s.emoji}</span> {s.title}</div>
                      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30', margin: '4px 0 0' }}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-5" style={panel}>
                  <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 12px' }}>BASIC CONTROLS</h3>
                  <div className="flex flex-col gap-2">
                    {BASIC_CONTROLS.map((c) => (
                      <div key={c.key} className="flex items-center justify-between gap-2">
                        <kbd style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, padding: '3px 8px', background: '#f8efd0', border: '2px solid #3a2418', color: '#3a2418' }}>{c.key}</kbd>
                        <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30' }}>{c.do}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5" style={panel}>
                  <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 12px' }}>INVENTORY TABS</h3>
                  <div className="flex flex-col gap-2">
                    {INVENTORY_TABS.map((t) => (
                      <div key={t.name} className="flex items-center gap-2">
                        <span aria-hidden style={{ fontSize: 16 }}>{t.emoji}</span>
                        <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#3a2418', fontWeight: 700, width: 48, flexShrink: 0 }}>{t.name}</span>
                        <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30' }}>{t.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {[{ emoji: '📡', t: 'Channels', d: 'Switch channels (1–N) to find quieter maps or rejoin friends. Your character stays the same.' }, { emoji: '❤️', t: 'HP / MP', d: 'HP is your health, MP fuels skills. Keep potions in your Use tab and hot-keyed.' }, { emoji: '📘', t: 'Skills & SP', d: 'Each level grants SP — spend it in the Skills (S) window to power up your abilities.' }].map((b) => (
                  <div key={b.t} className="p-4" style={{ ...panel, background: 'linear-gradient(to bottom, #f8f0d8 0%, #e8dcc0 100%)' }}>
                    <div style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#3a5a8a', fontWeight: 700, marginBottom: 4 }}><span aria-hidden>{b.emoji}</span> {b.t}</div>
                    <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: 0 }}>{b.d}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 flex items-start gap-3" style={{ ...panel, background: 'linear-gradient(to bottom, #e8f5ef 0%, #d8e8d8 100%)', borderColor: '#5a8a3a' }}>
                <span aria-hidden style={{ fontSize: 18, lineHeight: '24px' }}>💡</span>
                <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30', margin: 0 }}><strong style={{ color: '#1d6b41' }}>Beginner tip:</strong> Warriors and Magicians are the most forgiving first classes. You can always make a second character later to try the rest!</p>
              </div>
            </section>

            {/* Classes */}
            <section id="classes">
              <SectionHead kicker="CHAPTER 02" emoji="⚔️" title="Classes & Jobs" sub="The five classic Explorer paths — plus the Cygnus Knights and Aran hero classes." />

              <div className="grid sm:grid-cols-2 gap-4">
                {CLASSES.map((c) => (
                  <div key={c.name} style={panel}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${c.accent}18, ${c.accent}06)`, borderBottom: '2px solid #5a3e2a' }}>
                      <div className="flex items-center gap-2">
                        <span aria-hidden style={{ fontSize: 20 }}>{c.emoji}</span>
                        <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1 }}>{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.beginner && <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 8, padding: '2px 6px', background: '#e8f5ef', color: '#1d6b41', border: '1px solid #1d6b41' }}>BEGINNER</span>}
                        <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 8, padding: '2px 6px', background: DIFF_COLOR[c.diff] + '20', color: DIFF_COLOR[c.diff], border: '1px solid ' + DIFF_COLOR[c.diff] }}>{c.diff}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30', margin: '0 0 8px' }}>{c.play}</p>
                      <div className="flex flex-col gap-1 mb-2">
                        {c.strengths.map((s) => (
                          <div key={s} className="flex items-center gap-2">
                            <span style={{ width: 6, height: 6, background: c.accent, display: 'inline-block' }} />
                            <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>{s}</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#7a5a3a', margin: '0 0 8px' }}>⚠️ {c.weakness}</p>
                      <div style={{ borderTop: '1px solid #c8b898', paddingTop: 8 }}>
                        <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#7a5a3a' }}><strong style={{ color: c.accent }}>Role:</strong> {c.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '24px 0 12px' }}>HERO CLASSES</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {HERO_CLASSES.map((c) => (
                  <div key={c.name} style={panel}>
                    <div className="px-4 py-3 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${c.accent}18, ${c.accent}06)`, borderBottom: '2px solid #5a3e2a' }}>
                      <span aria-hidden style={{ fontSize: 20 }}>{c.emoji}</span>
                      <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1 }}>{c.name}</span>
                    </div>
                    <div className="p-4">
                      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30', margin: '0 0 8px' }}>{c.play}</p>
                      <div className="flex flex-col gap-1 mb-2">
                        {c.branches.map((b) => (
                          <div key={b} className="flex items-center gap-2">
                            <span style={{ width: 6, height: 6, background: c.accent, display: 'inline-block' }} />
                            <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>{b}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid #c8b898', paddingTop: 8 }}>
                        <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#7a5a3a' }}><strong style={{ color: c.accent }}>Note:</strong> {c.note}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5" style={panel}>
                <p style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#8a6512', letterSpacing: 1, margin: '0 0 12px' }}>STAFF-ONLY CLASSES</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {STAFF_CLASSES.map((s) => (
                    <div key={s.name} className="flex items-start gap-2">
                      <span aria-hidden style={{ fontSize: 18 }}>{s.emoji}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#3a2418', fontWeight: 700 }}>{s.name}</div>
                        <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: '2px 0 0' }}>{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Party Quests */}
            <section id="party-quests">
              <SectionHead kicker="CHAPTER 03" emoji="🎉" title="Party Quests" sub="PQs are co-op mini-adventures — fast EXP, exclusive rewards, and the best way to make friends on day one." />

              <div className="flex flex-col gap-3">
                {PQS.map((pq) => (
                  <div key={pq.name} className="p-5" style={panel}>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span aria-hidden style={{ fontSize: 20 }}>{pq.emoji}</span>
                      <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: 0 }}>{pq.name}</h3>
                      <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 8, padding: '2px 8px', background: '#3a5a8a', color: '#fff', marginLeft: 'auto' }}>{pq.level}</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div><span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#7a5a3a', display: 'block' }}>Location</span><span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>{pq.location}</span></div>
                      <div><span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#7a5a3a', display: 'block' }}>Party</span><span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>{pq.party}</span></div>
                      <div><span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#7a5a3a', display: 'block' }}>Rewards</span><span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>{pq.reward}</span></div>
                    </div>
                    <p className="mt-3 pt-3" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', borderTop: '1px solid #c8b898', margin: '12px 0 0' }}><strong style={{ color: '#8a6512' }}>Why:</strong> {pq.why}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5" style={panel}>
                <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 12px' }}>PQ ETIQUETTE</h3>
                <ul className="flex flex-col gap-2">
                  {PQ_TIPS.map((t) => (
                    <li key={t} className="flex items-start gap-2" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30' }}><span style={{ color: '#1d6b41' }}>✓</span> {t}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Training */}
            <section id="training">
              <SectionHead kicker="CHAPTER 04" emoji="🗺️" title="Training Guide" sub="A clear leveling path from Lv 1 to end-game. Follow the tiers and watch your level fly with 7× EXP." />

              <div className="flex flex-col gap-4">
                {TRAINING.map((t) => (
                  <div key={t.tier} style={panel}>
                    <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-2" style={{ background: t.color + '15', borderBottom: `2px solid ${t.color}` }}>
                      <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: t.color, letterSpacing: 1 }}>{t.tier} GAME</span>
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: t.color }}>{t.range}</span>
                        <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#7a5a3a', background: 'rgba(0,0,0,0.05)', padding: '2px 8px' }}>{t.mode}</span>
                      </div>
                    </div>
                    <div>
                      {t.spots.map((s, i) => (
                        <div key={s.map} className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4" style={{ borderTop: i === 0 ? 'none' : '1px solid #c8b898' }}>
                          <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418', fontWeight: 700, minWidth: 180 }}>📌 {s.map}</span>
                          <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', minWidth: 140 }}>👾 {s.mob}</span>
                          <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#7a5a3a' }}>{s.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5" style={{ ...panel, background: 'linear-gradient(to bottom, #e8f0f8 0%, #d8e0e8 100%)' }}>
                <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3b6ea5', letterSpacing: 1, margin: '0 0 12px' }}>FAST LEVELING TIPS</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {FAST_TIPS.map((t) => (
                    <div key={t} className="flex items-start gap-2" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30' }}><span>🔥</span> {t}</div>
                  ))}
                </div>
              </div>
            </section>

            {/* Rebirth */}
            <section id="rebirth">
              <SectionHead kicker="CHAPTER 05" emoji="🔁" title="Rebirth System" sub="Hit max level? Rebirth resets your journey for permanent power — the heart of long-term progression." />

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[{ emoji: '🤔', t: 'What is it?', d: 'Rebirth resets a maxed character back to a low level while granting permanent, stacking bonuses.' }, { emoji: '✅', t: 'Requirements', d: 'Reach the max level cap, then visit the Rebirth NPC at the Free Market.' }, { emoji: '📈', t: 'Benefits', d: 'Each rebirth boosts your base stats and damage — your character gets stronger every cycle.' }].map((b) => (
                  <div key={b.t} className="p-5" style={panel}>
                    <div style={{ fontSize: 20, marginBottom: 8 }} aria-hidden>{b.emoji}</div>
                    <h3 style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418', fontWeight: 700, margin: '0 0 4px' }}>{b.t}</h3>
                    <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: 0 }}>{b.d}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 mb-4" style={{ ...panel, background: 'linear-gradient(to bottom, #3a2418 0%, #2a1810 100%)' }}>
                <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#f8c34a', letterSpacing: 1, margin: '0 0 8px' }}>LONG-TERM GOALS</h3>
                <ul className="flex flex-col gap-2">
                  {['Rebirth as soon as you are maxed — the bonuses compound over time.', 'Each cycle gets faster as your permanent stats climb.', 'Aim for high rebirth counts before tackling the hardest bosses.'].map((t, i) => (
                    <li key={i} className="flex gap-2" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#d8c08c' }}><span>⭐</span> {t}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5" style={panel}>
                <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 8px' }}>REBIRTH FAQ</h3>
                <div className="flex flex-col gap-3">
                  <div><strong style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>Do I lose my gear?</strong><p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: '2px 0 0' }}>No — your equipment and items stay. Only your level and EXP reset.</p></div>
                  <div><strong style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>Is it worth it?</strong><p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: '2px 0 0' }}>Absolutely. Rebirthing is the main way to keep growing once you have maxed out.</p></div>
                </div>
              </div>
            </section>

            {/* Commands */}
            <section id="commands">
              <SectionHead kicker="CHAPTER 06" emoji="💬" title="In-Game Commands" sub="Type these in the chat box (including the @) to get info and quality-of-life help instantly." />

              <div style={panel}>
                <div className="hidden sm:grid grid-cols-[160px_1fr] gap-4 px-5 py-3" style={{ background: 'linear-gradient(to bottom, #e8dcc0 0%, #d8ccb0 100%)', borderBottom: '2px solid #5a3e2a' }}>
                  <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#7a5a3a', letterSpacing: 1 }}>COMMAND</span>
                  <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#7a5a3a', letterSpacing: 1 }}>WHAT IT DOES</span>
                </div>
                <div>
                  {COMMANDS.map((c) => (
                    <div key={c.cmd} className="grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 px-5 py-2.5" style={{ borderTop: '1px solid #c8b898' }}>
                      <code style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#3a5a8a', alignSelf: 'center' }}>{c.cmd}</code>
                      <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418' }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* NPCs */}
            <section id="npcs">
              <SectionHead kicker="CHAPTER 07" emoji="🧙" title="Important NPCs" sub="ShinyMS adds helpful NPCs to make your life easier. Most live at the Free Market entrance — your home base." />

              <div className="grid sm:grid-cols-2 gap-4">
                {NPCS.map((n) => (
                  <div key={n.name} className="p-5 flex gap-4" style={panel}>
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center text-xl" style={{ background: '#f8f0d8', border: '2px solid #c8b898' }} aria-hidden>{n.emoji}</div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#3a2418', fontWeight: 700, margin: '0 0 4px' }}>{n.name}</h3>
                      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: '0 0 4px' }}>{n.purpose}</p>
                      <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#7a5a3a' }}>📍 {n.location}</span>
                      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#8a6512', margin: '4px 0 0' }}>💡 {n.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Progression */}
            <section id="progression">
              <SectionHead kicker="CHAPTER 08" emoji="💎" title="Progression & Bossing" sub="How gear, mesos and upgrades come together — and the legendary bosses waiting at the top." />

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {PROGRESSION_STAGES.map((p) => (
                  <div key={p.tier} className="p-5" style={{ ...panel, borderTop: `3px solid ${p.color}` }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }} aria-hidden>{p.emoji}</div>
                    <h3 style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: p.color, fontWeight: 700, margin: '0 0 4px' }}>{p.tier}</h3>
                    <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: 0 }}>{p.text}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 mb-6" style={{ ...panel, background: 'linear-gradient(to bottom, #f8f0d8 0%, #e8dcc0 100%)' }}>
                <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#8a6512', letterSpacing: 1, margin: '0 0 12px' }}>MESO FARMING & SCROLLING</h3>
                <ul className="flex flex-col gap-2">
                  {SCROLL_TIPS.map((t) => (
                    <li key={t} className="flex items-start gap-2" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30' }}><span>•</span> {t}</li>
                  ))}
                </ul>
              </div>

              <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 12px' }}>POPULAR BOSSES</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {BOSSES.map((b) => (
                  <div key={b.name} className="p-5" style={panel}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span aria-hidden style={{ fontSize: 20 }}>{b.emoji}</span>
                      <h4 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: 0 }}>{b.name}</h4>
                      <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 8, padding: '2px 8px', background: '#c03a2b20', color: '#c03a2b', border: '1px solid #c03a2b', marginLeft: 'auto' }}>{b.level}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: '0 0 8px' }}>{b.note}</p>
                    <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 14, color: '#8a6512', margin: 0 }}>🎁 {b.reward}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a5a8a' }}>
                <Link href="/bosses" style={{ color: '#3a5a8a', textDecoration: 'none', fontWeight: 700 }}>See live boss leaderboards →</Link>
              </p>

              <div id="drop-search" className="mt-6 p-5 flex flex-col sm:flex-row sm:items-center gap-4" style={{ ...panel, background: 'linear-gradient(to bottom, #e8f0f8 0%, #d8e0e8 100%)' }}>
                <div className="flex-1">
                  <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 4px' }}>🔍 DROP SEARCH</h3>
                  <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: 0 }}>Hunting a specific item? Look up exactly which monsters drop it — or pull up any monster's full loot table with base drop rates.</p>
                </div>
                <Link href="/drops" className="ms-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>Open Drop Search →</Link>
              </div>
            </section>

            {/* Systems */}
            <section id="systems">
              <SectionHead kicker="CHAPTER 09" emoji="🎀" title="Systems & Features" sub="The classic side systems that make Maple World more than just grinding — gacha, social bonds, collections and more." />

              <div className="grid sm:grid-cols-2 gap-4">
                {SYSTEMS.map((s) => (
                  <div key={s.name} className="p-5" style={panel}>
                    <div className="flex items-center gap-3 mb-2">
                      <span aria-hidden style={{ fontSize: 20 }}>{s.emoji}</span>
                      <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: 0 }}>{s.name}</h3>
                    </div>
                    <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: 0 }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faq">
              <SectionHead kicker="CHAPTER 10" emoji="❓" title="FAQ & Extra Help" sub="Common questions, rookie mistakes to dodge, a handy glossary, and the social systems that make Maple great." />

              <div className="flex flex-col gap-2 mb-8">
                {FAQ.map((f) => (
                  <details key={f.q} className="group" style={panel}>
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418', fontWeight: 700 }}>
                      <span>{f.q}</span>
                      <span aria-hidden className="shrink-0 transition-transform group-open:rotate-45" style={{ color: '#3a5a8a', fontSize: 18 }}>+</span>
                    </summary>
                    <p className="px-5 pb-4" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: 0 }}>{f.a}</p>
                  </details>
                ))}
              </div>

              <div className="p-5 mb-8" style={{ ...panel, background: 'linear-gradient(to bottom, #f8d0d0 0%, #e8c0c0 100%)', borderColor: '#c03a2b' }}>
                <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#c03a2b', letterSpacing: 1, margin: '0 0 12px' }}>BEGINNER MISTAKES TO AVOID</h3>
                <ul className="flex flex-col gap-2">
                  {MISTAKES.map((m) => (
                    <li key={m} className="flex items-start gap-2" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30' }}><span style={{ color: '#c03a2b' }}>✗</span> {m}</li>
                  ))}
                </ul>
              </div>

              <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 12px' }}>HELPFUL SYSTEMS</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {EXTRA_CARDS.map((c) => (
                  <div key={c.title} className="p-5" style={panel}>
                    <h4 style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#3a2418', fontWeight: 700, margin: '0 0 4px' }}><span aria-hidden>{c.emoji}</span> {c.title}</h4>
                    <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30', margin: 0 }}>{c.text}</p>
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#3a2418', letterSpacing: 1, margin: '0 0 12px' }}>GLOSSARY</h3>
              <div className="p-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5" style={panel}>
                {GLOSSARY.map((g) => (
                  <div key={g.term} className="flex gap-2">
                    <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#3a5a8a', minWidth: 60 }}>{g.term}</span>
                    <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: 16, color: '#5a4a30' }}>— {g.def}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Closing CTA */}
            <section className="p-8 sm:p-10 text-center" style={{ ...panel, background: 'linear-gradient(to bottom, #3a2418 0%, #2a1810 100%)' }}>
              <p style={{ fontFamily: 'var(--ms-font-d)', fontSize: 12, color: '#f8c34a', letterSpacing: 1, margin: '0 0 8px' }}>READY TO BEGIN YOUR ADVENTURE?</p>
              <p className="max-w-md mx-auto" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#d8c08c', margin: '0 0 20px' }}>You have got the knowledge — now go make some memories. The island awaits!</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="https://play.shinyms.com" target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn-green" style={{ textDecoration: 'none' }}>PLAY NOW →</a>
                <Link href="/register" className="ms-btn" style={{ textDecoration: 'none' }}>CREATE FREE ACCOUNT</Link>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
