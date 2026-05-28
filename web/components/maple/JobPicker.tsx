'use client'

import { useState } from 'react'
import CharAvatar from './CharAvatar'

type Job = {
  cls: string
  name: string
  role: string
  desc: string
  stats: { str: number; dex: number; int: number; luk: number; atk: number; spd: number }
  skills: string[]
}

const JOBS: Job[] = [
  {
    cls: 'hero',
    name: 'Warrior',
    role: 'Tank / DPS',
    desc: 'STR-based melee fighters who wade into battle with swords and axes, shrugging off punishment with Power Guard and high HP.',
    stats: { str: 10, dex: 4, int: 1, luk: 1, atk: 9, spd: 5 },
    skills: ['Power Guard', 'Combo Attack', 'Brandish', 'Rush', 'Achilles'],
  },
  {
    cls: 'bishop',
    name: 'Magician',
    role: 'Support / AoE',
    desc: 'INT-based casters hurling arcane fire, blizzards, and holy light, or buffing the whole party into gods.',
    stats: { str: 1, dex: 1, int: 10, luk: 2, atk: 4, spd: 7 },
    skills: ['Heal', 'Holy Arrow', 'Blizzard', 'Meteor', 'Big Bang'],
  },
  {
    cls: 'bm',
    name: 'Bowman',
    role: 'Range DPS',
    desc: 'DEX-based archers who rain arrows from a safe distance, specialising in pin-point single targets or wide arrow rains.',
    stats: { str: 2, dex: 10, int: 1, luk: 3, atk: 8, spd: 8 },
    skills: ['Arrow Rain', 'Strafe', 'Hurricane', 'Puppet', 'Sharp Eyes'],
  },
  {
    cls: 'nightlord',
    name: 'Thief',
    role: 'Burst DPS',
    desc: 'LUK-based assassins and bandits with the highest crit rates, blinking through enemies with slices and star-storms.',
    stats: { str: 1, dex: 3, int: 1, luk: 10, atk: 9, spd: 10 },
    skills: ['Avenger', 'Drain', 'Shadow Meso', 'Boomerang Step', 'Assassinate'],
  },
  {
    cls: 'buccaneer',
    name: 'Pirate',
    role: 'Hybrid',
    desc: 'STR & DEX brawlers and gunners who punch bosses bare-handed or fire cannons from across the map.',
    stats: { str: 7, dex: 7, int: 1, luk: 1, atk: 8, spd: 9 },
    skills: ['Octopunch', 'Barrage', 'Speed Infusion', 'Rapid Fire', 'Battleship'],
  },
]

function StatDot({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            background: i < value ? 'var(--ms-gold)' : 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(0,0,0,0.4)',
          }}
        />
      ))}
    </div>
  )
}

export default function JobPicker() {
  const [selected, setSelected] = useState(0)
  const job = JOBS[selected]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 16,
        maxWidth: 680,
        margin: '0 auto',
      }}
    >
      {/* Class list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {JOBS.map((j, i) => (
          <button
            key={j.cls}
            onClick={() => setSelected(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              background: i === selected ? 'rgba(248,195,74,0.2)' : 'rgba(0,0,0,0.2)',
              border: i === selected ? '2px solid var(--ms-gold)' : '2px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              color: '#fff8d8',
              fontFamily: 'var(--ms-font-d)',
              fontSize: 9,
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <CharAvatar cls={j.cls} size={40} showLabel={false} />
            {j.name}
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="ms-pixel-panel" style={{ color: 'var(--ms-text)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
          <CharAvatar cls={job.cls} size={72} />
          <div>
            <div
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                color: 'var(--ms-text)',
                marginBottom: 4,
              }}
            >
              {job.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--ms-font-b)',
                fontSize: 18,
                color: '#8a6030',
              }}
            >
              {job.role}
            </div>
          </div>
        </div>

        <p
          style={{
            fontFamily: 'var(--ms-font-b)',
            fontSize: 18,
            lineHeight: 1.4,
            color: '#3a2010',
            marginBottom: 12,
          }}
        >
          {job.desc}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {(Object.entries(job.stats) as [string, number][]).map(([stat, val]) => (
            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  fontFamily: 'var(--ms-font-d)',
                  fontSize: 8,
                  width: 28,
                  color: '#8a6030',
                  textTransform: 'uppercase',
                }}
              >
                {stat}
              </div>
              <StatDot value={val} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.skills.map((s) => (
            <span
              key={s}
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 7,
                padding: '3px 6px',
                background: 'rgba(248,195,74,0.25)',
                border: '1px solid var(--ms-gold)',
                color: 'var(--ms-text)',
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
