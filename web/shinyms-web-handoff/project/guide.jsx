// Guide page — NPC tutorial walkthrough with chapter navigation
const { useState } = React;

const CHAPTERS = [
  {
    id: 'start',
    title: 'GETTING STARTED',
    npc: 'Maple Admin', npcCls: 'gm',
    icon: '🍁',
    intro: "Welcome, adventurer! Before you set foot in Maple World, let's make sure you're ready. Three quick steps and you're off to Henesys.",
    sections: [
      {
        kind: 'steps',
        items: [
          { title: 'Create an account', body: 'Pick a username and password on the registration page. No email verification — just hit submit and you have a Maple ID.' },
          { title: 'Hit Play Now', body: 'The web client loads in your browser. No download, no patch. First connection may take 10-15 seconds while we cache the sprite atlas.' },
          { title: 'Choose your class', body: 'Beginners start on Maple Island. Talk to Shanks the sailor when you hit Lv. 10 to sail to Victoria Island and pick your job.' },
        ]
      },
      {
        kind: 'tip',
        title: 'Pro tip',
        body: "Pin the tab so you don't lose your session. We auto-save every 30 seconds, but pinning means no accidental refreshes mid-PQ."
      }
    ]
  },
  {
    id: 'rates',
    title: 'SERVER RATES',
    npc: 'GM Amber', npcCls: 'bishop',
    icon: '⚙️',
    intro: "ShinyMS is a low-rate-ish server — fast enough to progress after work, slow enough that hitting a new level still feels good.",
    sections: [
      {
        kind: 'rates',
      },
      {
        kind: 'p',
        body: 'These rates are baseline. They do not stack with HS/Holy Symbol/Family bonuses — those work on top, as in classic v83.'
      },
      {
        kind: 'tip',
        title: 'No NX power',
        body: "We don't sell NX for real money. NX comes from voting and events only. Cosmetics yes, power no — that's the whole point."
      }
    ]
  },
  {
    id: 'controls',
    title: 'CONTROLS & COMMANDS',
    npc: 'Tutorial Bot', npcCls: 'cygnus',
    icon: '⌨️',
    intro: "Same controls you remember. Default key layout below — rebind anything you want from the in-game options menu (ESC).",
    sections: [
      {
        kind: 'keys',
        items: [
          { keys: ['←','→'], label: 'Move' },
          { keys: ['ALT'], label: 'Jump' },
          { keys: ['CTRL'], label: 'Attack' },
          { keys: ['Z'], label: 'Pick up' },
          { keys: ['ENTER'], label: 'Chat' },
          { keys: ['ESC'], label: 'Menu' },
          { keys: ['I'], label: 'Inventory' },
          { keys: ['S'], label: 'Skills' },
          { keys: ['Q'], label: 'Quests' },
        ]
      },
      {
        kind: 'commands',
        items: [
          { cmd: '@help', desc: 'Show all available commands' },
          { cmd: '@online', desc: 'See who is online right now' },
          { cmd: '@fm', desc: 'Warp to the Free Market' },
          { cmd: '@dispose', desc: 'Unstick yourself if NPC chat freezes' },
          { cmd: '@trade <name>', desc: 'Request a trade with a player' },
          { cmd: '@rates', desc: 'Show current server rate bonuses' },
        ]
      }
    ]
  },
  {
    id: 'jobs',
    title: 'JOB ADVANCEMENTS',
    npc: 'Job Instructor', npcCls: 'paladin',
    icon: '⚔️',
    intro: "Five job branches, four advancements each. Pick what fits your playstyle — every class is viable for endgame.",
    sections: [
      {
        kind: 'jobs',
      },
      {
        kind: 'tip',
        title: "Can't decide?",
        body: "Bowman (Bow Master) and Magician (I/L Mage) are friendly first picks — strong solo, easy to gear, welcomed in every PQ."
      }
    ]
  },
  {
    id: 'pq',
    title: 'PARTY QUESTS',
    npc: 'PQ Officer', npcCls: 'bm',
    icon: '🎯',
    intro: "PQs are the heart of v83 leveling. Find a party, do a few runs, leave best friends. Here are the ones running right now.",
    sections: [
      {
        kind: 'pqs',
        items: [
          { name: 'Kerning PQ', range: 'Lv. 21-30', party: '3-6', rewards: 'EXP, Glasses' },
          { name: 'Ludibrium PQ', range: 'Lv. 35-50', party: '6', rewards: 'EXP, Ludi gear' },
          { name: 'Orbis PQ', range: 'Lv. 51-70', party: '6', rewards: 'Sky gear, EXP' },
          { name: 'Romeo & Juliet', range: 'Lv. 70-99', party: '6', rewards: 'Helm scrolls' },
          { name: 'Pirate PQ', range: 'Lv. 55-80', party: '4-5', rewards: 'Coral gear' },
        ]
      }
    ]
  },
  {
    id: 'bossing',
    title: 'BOSSES',
    npc: 'Veteran Mapler', npcCls: 'nightlord',
    icon: '👹',
    intro: "When you're geared and ready, these are the bosses that defined v83. Don't go alone — except for Mushmom, she's fair game.",
    sections: [
      { kind: 'bosses' },
      {
        kind: 'tip',
        title: 'First-time boss tip',
        body: "Always bring more Power Elixirs than you think you need. Then bring twice that. Maple Wisdom."
      }
    ]
  },
  {
    id: 'nx',
    title: 'NX & VOTING',
    npc: 'GM Vote', npcCls: 'gm',
    icon: '🗳️',
    intro: "NX is our cosmetic currency. You earn it by voting on partner sites — that's it. No real-money store, no power-creep.",
    sections: [
      {
        kind: 'p',
        body: "Each vote credits 2,000–6,000 NX depending on the site, plus 1 Vote Point. NX never expires. Read the dedicated Vote page for the full flow and the cosmetic shop preview."
      },
      {
        kind: 'cta',
        href: 'vote.html',
        text: '🗳️ OPEN THE VOTE PAGE'
      },
    ]
  },
];

function Chapter({ chapter }) {
  return (
    <NpcBox
      title={`${chapter.icon} ${chapter.title}`}
      npcName={chapter.npc}
      npcSprite={chapter.npcSprite}
      npcCls={chapter.npcCls}
    >
      <p>{chapter.intro}</p>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {chapter.sections.map((s, i) => <ChapterSection key={i} section={s} />)}
      </div>
    </NpcBox>
  );
}

function ChapterSection({ section }) {
  if (section.kind === 'steps') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {section.items.map((s, i) => (
          <div key={i} className="step-card" style={{ background: '#f6e8b4' }}>
            <div className="num">{i + 1}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    );
  }
  if (section.kind === 'tip') {
    return (
      <div style={{
        background: '#fff8d8', border: '3px dashed #c64b1b', padding: '14px 16px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: -12, left: 12, background: '#c64b1b', color: '#fff',
          padding: '4px 10px', fontFamily: 'var(--font-display)', fontSize: 9,
          letterSpacing: 1, border: '2px solid #1a0a04', boxShadow: '2px 2px 0 rgba(0,0,0,0.4)'
        }}>💡 {section.title.toUpperCase()}</div>
        <p style={{ margin: 0, marginTop: 4, fontSize: 20 }}>{section.body}</p>
      </div>
    );
  }
  if (section.kind === 'p') {
    return <p style={{ fontSize: 20 }}>{section.body}</p>;
  }
  if (section.kind === 'rates') {
    return (
      <div className="pixel-panel" style={{ padding: 14 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 9, color: '#c64b1b',
          marginBottom: 10, letterSpacing: 1
        }}>⚙ CURRENT RATES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <StatBar kind="exp" label="EXP" value={7} max={10} displayValue="7×  (balanced)" />
          <StatBar kind="hp" label="MESO" value={5} max={10} displayValue="5×  (balanced)" />
          <StatBar kind="mp" label="DROP" value={3} max={10} displayValue="3×  (balanced)" />
        </div>
      </div>
    );
  }
  if (section.kind === 'keys') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b', marginBottom: 10, letterSpacing: 1 }}>
          ⌨ DEFAULT CONTROLS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {section.items.map((k, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', gap: 4 }}>
                {k.keys.map((key, j) => (
                  <kbd key={j} style={{
                    background: 'linear-gradient(to bottom, #fff8d8 0%, #c8a868 100%)',
                    border: '2px solid #1a0a04',
                    fontFamily: 'var(--font-display)', fontSize: 9,
                    padding: '5px 8px', color: '#2a1810',
                    boxShadow: 'inset 1px 1px 0 #fff, 2px 2px 0 rgba(0,0,0,0.3)',
                    minWidth: 24, textAlign: 'center'
                  }}>{key}</kbd>
                ))}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 19 }}>{k.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section.kind === 'commands') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b', marginBottom: 10, letterSpacing: 1 }}>
          @ COMMAND SHORTCUTS
        </div>
        <div style={{
          background: '#1a0a04', color: '#88f078', padding: 12,
          border: '2px solid #2a1810',
          fontFamily: 'var(--font-body)', fontSize: 19, lineHeight: 1.4
        }}>
          {section.items.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
              <span style={{ color: '#f8c34a', minWidth: 130 }}>{c.cmd}</span>
              <span style={{ color: '#d8c08c' }}>— {c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section.kind === 'jobs') {
    const branches = [
      { name: 'WARRIOR',  desc: 'Tanky melee, STR focus',     cls: 'hero',      color: '#e23b3b' },
      { name: 'MAGICIAN', desc: 'Ranged magic, INT focus',    cls: 'bishop',    color: '#2e80e2' },
      { name: 'BOWMAN',   desc: 'Ranged DEX, mobility',       cls: 'bowman',    color: '#4caf30' },
      { name: 'THIEF',    desc: 'Crit DEX/LUK, stealth',      cls: 'nightlord', color: '#8030a0' },
      { name: 'PIRATE',   desc: 'Hybrid gun/knuckle',         cls: 'corsair',   color: '#f8a020' },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {branches.map((j, i) => (
          <div key={i} style={{
            background: '#fff8d8', border: '3px solid #1a0a04',
            padding: 12, textAlign: 'center',
            boxShadow: `inset 0 -4px 0 ${j.color}, 3px 3px 0 rgba(0,0,0,0.4)`
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <CharAvatar cls={j.cls} size={56} label={false} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: j.color, letterSpacing: 1 }}>
              {j.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#2a1810', marginTop: 4, lineHeight: 1.15 }}>
              {j.desc}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (section.kind === 'pqs') {
    return (
      <div style={{
        background: '#f6e8b4', border: '2px solid #1a0a04',
        boxShadow: 'inset 1px 1px 0 #fff8d8'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr',
          background: '#4a3220', color: '#f8c34a',
          fontFamily: 'var(--font-display)', fontSize: 9, padding: '8px 12px',
          letterSpacing: 1, gap: 8
        }}>
          <span>PARTY QUEST</span><span>LEVEL</span><span>PARTY</span><span>REWARDS</span>
        </div>
        {section.items.map((pq, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr',
            padding: '10px 12px', gap: 8,
            fontFamily: 'var(--font-body)', fontSize: 19,
            background: i % 2 ? '#f0dfb0' : '#f6e8b4',
            borderTop: '1px dashed #c8a868'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b', alignSelf: 'center' }}>{pq.name}</span>
            <span style={{ alignSelf: 'center' }}>{pq.range}</span>
            <span style={{ alignSelf: 'center' }}>{pq.party}</span>
            <span style={{ alignSelf: 'center' }}>{pq.rewards}</span>
          </div>
        ))}
      </div>
    );
  }
  if (section.kind === 'bosses') {
    const bosses = [
      { name: 'King Slime', src: `${MAPLE_BASE}/mobs/king-slime.gif`, lv: 55, hp: '800K', tip: 'Solo-able for tanky lv 70+' },
      { name: 'Crimson Balrog', src: `${MAPLE_BASE}/mobs/balrog.gif`, lv: 80, hp: '2.4M', tip: 'Bring stunners' },
      { name: 'Zakum', src: `${MAPLE_BASE}/mobs/zakum.gif`, lv: 110, hp: '5M', tip: 'Iconic. Bring a party.' },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {bosses.map((b, i) => (
          <div key={i} style={{
            background: 'linear-gradient(to bottom, #2a1810 0%, #1a0a04 100%)',
            border: '3px solid #f8c34a',
            color: '#fff8d8', padding: 12, textAlign: 'center'
          }}>
            <div style={{
              background: 'rgba(106,32,16,0.4)', border: '2px solid #1a0a04',
              padding: 8, marginBottom: 8, minHeight: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src={b.src} alt={b.name} style={{ maxWidth: '100%', maxHeight: 90 }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#f8c34a', letterSpacing: 1 }}>{b.name}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: '#d8c08c', marginTop: 4 }}>
              LV. {b.lv} · HP {b.hp}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#fff8d8', marginTop: 8, lineHeight: 1.2 }}>
              {b.tip}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function GuideApp() {
  const [active, setActive] = useState('start');
  const chapter = CHAPTERS.find(c => c.id === active);

  return (
    <>
      <TopBar active="guide" />

      <section style={{ padding: '40px 0 20px', position: 'relative' }}>
        <img className="floating-sprite bobbing" style={{ top: 30, left: '6%', width: 56 }}
          src={`${MAPLE_BASE}/mobs/orange-mushroom.gif`} alt="" />
        <img className="floating-sprite bobbing" style={{ top: 60, right: '8%', width: 48, animationDelay: '0.4s' }}
          src={`${MAPLE_BASE}/mobs/slime.gif`} alt="" />

        <div className="container">
          <SectionBanner>HELP · GUIDE BOOK</SectionBanner>
          <h1 className="hero-title" style={{ fontSize: 'clamp(24px, 4vw, 42px)' }}>The Adventurer's Guide</h1>
          <div style={{ marginTop: 14, marginBottom: 28 }}>
            <span className="hero-sub">
              Everything you need to know to start your journey in Maple World.
              Pick a chapter from the table of contents below.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
            {/* Chapter nav — quest log style */}
            <aside style={{ position: 'sticky', top: 80 }}>
              <div className="pixel-panel" style={{ padding: 12 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b',
                  marginBottom: 10, letterSpacing: 1, textAlign: 'center'
                }}>📖 CHAPTERS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {CHAPTERS.map((c, i) => {
                    const isActive = c.id === active;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        style={{
                          textAlign: 'left',
                          background: isActive ? 'linear-gradient(to bottom, #f8c34a 0%, #e2a020 100%)' : '#f6e8b4',
                          border: '2px solid #1a0a04',
                          padding: '8px 10px',
                          fontFamily: 'var(--font-display)', fontSize: 9,
                          color: '#2a1810', letterSpacing: 0.5,
                          cursor: 'pointer',
                          boxShadow: isActive ? 'inset 2px 2px 0 #fff5b0, 2px 2px 0 rgba(0,0,0,0.3)' : 'inset 1px 1px 0 #fff8d8',
                          display: 'flex', alignItems: 'center', gap: 8,
                          lineHeight: 1.4
                        }}>
                        <span style={{ fontSize: 14 }}>{c.icon}</span>
                        <span style={{ flex: 1 }}>{c.title}</span>
                        {isActive && <span style={{ color: '#c64b1b' }}>▶</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pixel-panel" style={{ padding: 12, marginTop: 16 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 9, color: '#c64b1b',
                  marginBottom: 8, letterSpacing: 1
                }}>NEED MORE HELP?</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: '#2a1810', margin: '0 0 10px', lineHeight: 1.3 }}>
                  Join our Discord and ask in #help. GMs and veterans answer fast.
                </p>
                <a href="#" className="maple-btn sm" onClick={(e) => e.preventDefault()} style={{ width: '100%', justifyContent: 'center' }}>
                  💬 DISCORD
                </a>
              </div>
            </aside>

            {/* Chapter content */}
            <div>
              <Chapter chapter={chapter} />

              {/* Chapter pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button
                  className="maple-btn sm"
                  disabled={CHAPTERS.findIndex(c => c.id === active) === 0}
                  onClick={() => {
                    const i = CHAPTERS.findIndex(c => c.id === active);
                    if (i > 0) setActive(CHAPTERS[i - 1].id);
                  }}
                  style={{ opacity: CHAPTERS.findIndex(c => c.id === active) === 0 ? 0.4 : 1 }}
                >◀ PREVIOUS</button>
                <button
                  className="maple-btn sm primary"
                  disabled={CHAPTERS.findIndex(c => c.id === active) === CHAPTERS.length - 1}
                  onClick={() => {
                    const i = CHAPTERS.findIndex(c => c.id === active);
                    if (i < CHAPTERS.length - 1) setActive(CHAPTERS[i + 1].id);
                  }}
                  style={{ opacity: CHAPTERS.findIndex(c => c.id === active) === CHAPTERS.length - 1 ? 0.4 : 1 }}
                >NEXT ▶</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MapleFooter />
      <FloatingMobs />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<GuideApp />);
