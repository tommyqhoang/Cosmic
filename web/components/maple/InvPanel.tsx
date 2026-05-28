'use client'

import { useState } from 'react'

type Tab = 'EQUIP' | 'USE' | 'SETUP' | 'ETC' | 'CASH'

const TABS: Tab[] = ['EQUIP', 'USE', 'SETUP', 'ETC', 'CASH']

const API = 'https://maplestory.io/api/GMS/83/item'
const icon = (id: number) => `${API}/${id}/icon`

type InvItem = {
  icon: string
  name: string
  rarity?: string
  desc?: string
  count?: number
}

const ITEMS: Record<Tab, InvItem[]> = {
  EQUIP: [
    { icon: icon(1002140), name: 'Warrior Hat',   rarity: 'Uncommon',  desc: 'Iron helm of the warrior.' },
    { icon: icon(1312032), name: 'Battle Axe',    rarity: 'Uncommon',  desc: 'Heavy and powerful.' },
    { icon: icon(1051010), name: 'Blue Robe',     rarity: 'Common',    desc: 'Mage attire.' },
    { icon: icon(2070003), name: 'Steelies',      rarity: 'Common',    desc: 'Throwing stars.' },
    { icon: icon(1092010), name: 'Loric',         rarity: 'Rare',      desc: 'Ancient shield.' },
    { icon: icon(1072169), name: 'Facestompers',  rarity: 'Epic',      desc: 'Speed +10.' },
    { icon: icon(1002357), name: 'Zhelm',         rarity: 'Legendary', desc: 'Zakum Helmet. Best-in-slot.' },
  ],
  USE: [
    { icon: icon(2000004), name: 'Elixir',           rarity: 'Common',   desc: 'Restores 300 HP & 300 MP.',     count: 99 },
    { icon: icon(2000005), name: 'Power Elixir',     rarity: 'Uncommon', desc: 'Fully restores HP & MP.',       count: 30 },
    { icon: icon(2050004), name: 'All Cure Potion',  rarity: 'Common',   desc: 'Cures all status effects.',     count: 15 },
    { icon: icon(2030000), name: 'Teleport Rock',    rarity: 'Uncommon', desc: 'Teleport to any location.',     count: 5  },
    { icon: icon(5130000), name: 'Safety Charm',     rarity: 'Rare',     desc: 'Prevents one death.',           count: 3  },
    { icon: icon(2049000), name: 'Magnifying Glass', rarity: 'Common',   desc: 'Identifies equipment stats.',   count: 8  },
  ],
  SETUP: [
    { icon: icon(5140000), name: 'Hired Merchant', rarity: 'Common', desc: 'Set up a shop for 24 hours.' },
    { icon: icon(5140001), name: 'Vending Machine', rarity: 'Common', desc: 'Unmanned shop for 7 days.' },
    { icon: icon(5140002), name: 'Kiosk',          rarity: 'Common', desc: 'Trade post for 3 days.' },
  ],
  ETC: [
    { icon: icon(4001046), name: 'Maple Leaf',        count: 50,  rarity: 'Common',   desc: 'A shiny maple leaf. Used in quests.' },
    { icon: icon(4004000), name: 'Power Crystal Ore', count: 18,  rarity: 'Rare',     desc: 'Refined into Power Crystal.' },
    { icon: icon(4004001), name: 'Dark Crystal Ore',  count: 5,   rarity: 'Epic',     desc: 'Refined into Dark Crystal.' },
    { icon: icon(4000030), name: 'Mixed Golem Rock',  count: 207, rarity: 'Common',   desc: 'Monster drop.' },
    { icon: icon(4001007), name: 'Eye of Fire',       count: 88,  rarity: 'Uncommon', desc: 'Boss drop material.' },
    { icon: icon(4001013), name: 'Piece of Ice',      count: 44,  rarity: 'Common',   desc: 'Monster drop material.' },
    { icon: icon(4000082), name: 'Zombie Tooth',      count: 120, rarity: 'Common',   desc: 'Monster drop.' },
    { icon: icon(4031868), name: 'Meso Sack',         count: 12,  rarity: 'Common',   desc: '10,000 mesos inside.' },
  ],
  CASH: [
    { icon: icon(5076000), name: 'Smega',          rarity: 'Cash', desc: 'Broadcast across all channels.', count: 5  },
    { icon: icon(5070000), name: 'Name Change',    rarity: 'Cash', desc: 'Change your character name.' },
    { icon: icon(5230000), name: 'Owl of Minerva', rarity: 'Cash', desc: 'Search Hired Merchants.',        count: 10 },
    { icon: icon(5061000), name: 'Item Lock',      rarity: 'Cash', desc: 'Lock an equip permanently.' },
  ],
}

export default function InvPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('EQUIP')
  const items = ITEMS[activeTab]

  return (
    <div className="ms-pixel-panel" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`ms-inv-tab${t === activeTab ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 6,
          minHeight: 160,
        }}
      >
        {items.map((item, i) => (
          <div key={i} className="ms-inv-slot" style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.icon} alt={item.name} style={{ imageRendering: 'pixelated' }} />
            {item.count != null && <span className="ms-inv-count">{item.count}</span>}
            <div className="ms-tooltip">
              <div className="ms-tooltip-name">{item.name}</div>
              {item.rarity && <div className="ms-tooltip-rarity">{item.rarity}</div>}
              {item.desc && <div className="ms-tooltip-desc">{item.desc}</div>}
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="ms-inv-slot ms-inv-slot-empty" />
        ))}
      </div>
    </div>
  )
}
