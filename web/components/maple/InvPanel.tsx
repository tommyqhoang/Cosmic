'use client'

import { useState } from 'react'

type Tab = 'EQUIP' | 'USE' | 'SETUP' | 'ETC' | 'CASH'

const TABS: Tab[] = ['EQUIP', 'USE', 'SETUP', 'ETC', 'CASH']

type InvItem = {
  icon: string
  name: string
  rarity?: string
  desc?: string
  count?: number
}

const ITEMS: Record<Tab, InvItem[]> = {
  EQUIP: [
    { icon: '/maple/items/maple-leaf.png', name: 'Warrior Hat', rarity: 'Uncommon', desc: 'Iron helm of the warrior.' },
    { icon: '/maple/items/maple-leaf.png', name: 'Battle Axe', rarity: 'Uncommon', desc: 'Heavy and powerful.' },
    { icon: '/maple/items/blue-snail-shell.png', name: 'Blue Robe', rarity: 'Common', desc: 'Mage attire.' },
    { icon: '/maple/items/maple-leaf.png', name: 'Steelies', rarity: 'Common', desc: 'Throwing stars.' },
    { icon: '/maple/items/red-snail-shell.png', name: 'Loric', rarity: 'Rare', desc: 'Ancient shield.' },
    { icon: '/maple/items/red-snail-shell.png', name: 'Facestompers', rarity: 'Epic', desc: 'Speed +10.' },
    { icon: '/maple/items/maple-leaf.png', name: 'Zhelm', rarity: 'Legendary', desc: 'Zakum Helmet. Best-in-slot.' },
  ],
  USE: [
    { icon: '/maple/items/red-potion.png', name: 'Elixir', rarity: 'Common', desc: 'Restores 300 HP & 300 MP.', count: 99 },
    { icon: '/maple/items/white-potion.png', name: 'Power Elixir', rarity: 'Uncommon', desc: 'Fully restores HP & MP.', count: 30 },
    { icon: '/maple/items/blue-potion.png', name: 'All Cure Potion', rarity: 'Common', desc: 'Cures all status effects.', count: 15 },
    { icon: '/maple/items/blue-potion.png', name: 'Teleport Rock', rarity: 'Uncommon', desc: 'Teleport to any location.', count: 5 },
    { icon: '/maple/items/white-potion.png', name: 'Safety Charm', rarity: 'Rare', desc: 'Prevents one death.', count: 3 },
    { icon: '/maple/items/white-potion.png', name: 'Magnifying Glass', rarity: 'Common', desc: 'Identifies equipment stats.', count: 8 },
  ],
  SETUP: [
    { icon: '/maple/items/red-potion.png', name: 'Hired Merchant', rarity: 'Common', desc: 'Set up a shop for 24 hours.' },
    { icon: '/maple/items/blue-potion.png', name: 'Vending Machine', rarity: 'Common', desc: 'Unmanned shop for 7 days.' },
    { icon: '/maple/items/white-potion.png', name: 'Kiosk', rarity: 'Common', desc: 'Trade post for 3 days.' },
  ],
  ETC: [
    { icon: '/maple/items/maple-leaf.png', name: 'Maple Leaf', count: 50, rarity: 'Common', desc: 'A shiny maple leaf. Used in quests.' },
    { icon: '/maple/items/blue-snail-shell.png', name: 'Power Crystal Ore', count: 18, rarity: 'Rare', desc: 'Refined into Power Crystal.' },
    { icon: '/maple/items/red-snail-shell.png', name: 'Dark Crystal Ore', count: 5, rarity: 'Epic', desc: 'Refined into Dark Crystal.' },
    { icon: '/maple/items/maple-leaf.png', name: 'Mixed Golem Rock', count: 207, rarity: 'Common', desc: 'Monster drop.' },
    { icon: '/maple/items/red-snail-shell.png', name: 'Eye of Fire', count: 88, rarity: 'Uncommon', desc: 'Boss drop material.' },
    { icon: '/maple/items/blue-snail-shell.png', name: 'Piece of Ice', count: 44, rarity: 'Common', desc: 'Monster drop material.' },
    { icon: '/maple/items/maple-leaf.png', name: 'Zombie Tooth', count: 120, rarity: 'Common', desc: 'Monster drop.' },
    { icon: '/maple/items/maple-leaf.png', name: 'Meso Sack', count: 12, rarity: 'Common', desc: '10,000 mesos inside.' },
  ],
  CASH: [
    { icon: '/maple/items/red-potion.png', name: 'Smega', rarity: 'Cash', desc: 'Broadcast across all channels.', count: 5 },
    { icon: '/maple/items/blue-potion.png', name: 'Name Change', rarity: 'Cash', desc: 'Change your character name.' },
    { icon: '/maple/items/maple-leaf.png', name: 'Owl of Minerva', rarity: 'Cash', desc: 'Search Hired Merchants.', count: 10 },
    { icon: '/maple/items/white-potion.png', name: 'Item Lock', rarity: 'Cash', desc: 'Lock an equip permanently.' },
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
