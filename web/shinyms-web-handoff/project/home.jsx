// ShinyMS home — full MapleStory cosplay
const { useState, useEffect } = React;

const MOBS = [
  { name: 'Snail', src: `${MAPLE_BASE}/mobs/snail.gif`, lv: 1, hp: 8 },
  { name: 'Orange Mushroom', src: `${MAPLE_BASE}/mobs/orange-mushroom.gif`, lv: 8, hp: 80 },
  { name: 'Slime', src: `${MAPLE_BASE}/mobs/slime.gif`, lv: 4, hp: 25 },
  { name: 'Pig', src: `${MAPLE_BASE}/mobs/pig.gif`, lv: 10, hp: 120 },
  { name: 'Ribbon Pig', src: `${MAPLE_BASE}/mobs/ribbon-pig.gif`, lv: 15, hp: 240 },
  { name: 'Stump', src: `${MAPLE_BASE}/mobs/stump.gif`, lv: 6, hp: 50 },
  { name: 'Mano', src: `${MAPLE_BASE}/mobs/mano.gif`, lv: 20, hp: 6500, rare: true },
  { name: 'Mushmom', src: `${MAPLE_BASE}/mobs/mushmom.gif`, lv: 35, hp: 35000, rare: true },
];

const BOSSES = [
  { name: 'King Slime', src: `${MAPLE_BASE}/mobs/king-slime.gif`, lv: 55, hp: 800000 },
  { name: 'Crimson Balrog', src: `${MAPLE_BASE}/mobs/balrog.gif`, lv: 80, hp: 2400000 },
  { name: 'Zakum', src: `${MAPLE_BASE}/mobs/zakum.gif`, lv: 110, hp: 5000000 },
];

const FEATURES = [
  { icon: '⚔️', name: 'Jobs',           desc: 'Every classic v83 class',     tab: 'EQUIP' },
  { icon: '📜', name: 'Scrolling',      desc: 'Enhance your gear',           tab: 'EQUIP' },
  { icon: '🏅', name: 'Medals',         desc: 'Earn titles',                 tab: 'EQUIP' },
  { icon: '🌟', name: 'Rebirths',       desc: 'Reset and grow stronger',     tab: 'EQUIP' },
  { icon: '🍄', name: 'Mushroom House', desc: 'Cozy starter homes',          tab: 'EQUIP' },

  { icon: '🛡️', name: 'Party Quests',   desc: 'Run the classic PQs',         tab: 'USE' },
  { icon: '👹', name: 'Bossing',        desc: 'Zakum, Horntail & more',      tab: 'USE' },
  { icon: '🗳️', name: 'Voting',         desc: 'Earn NX by voting',           tab: 'USE' },
  { icon: '💰', name: 'Free Market',    desc: 'Trade with other players',    tab: 'USE' },

  { icon: '⌨️', name: 'Commands',       desc: 'Handy @ shortcuts',           tab: 'SETUP' },
  { icon: '🌀', name: 'Teleporter',     desc: 'Fast travel anywhere',        tab: 'SETUP' },
  { icon: '🏘️', name: 'Henesys Hub',    desc: 'Community hangout',           tab: 'SETUP' },
  { icon: '🎵', name: 'OG Soundtrack',  desc: 'The music you remember',      tab: 'SETUP' },

  { icon: '📖', name: 'Monster Book',   desc: 'Collect cards',               tab: 'ETC' },
  { icon: '🤝', name: 'Alliance',       desc: 'Unite guilds',                tab: 'ETC' },
  { icon: '👨‍👩‍👧', name: 'Family',     desc: 'Mentor for bonus EXP',        tab: 'ETC' },
  { icon: '💍', name: 'Marriage',       desc: 'Wed and quest together',      tab: 'ETC' },

  { icon: '🎁', name: 'NX Items',       desc: 'Cosmetics & gear',            tab: 'CASH' },
  { icon: '🎰', name: 'Gachapon',       desc: 'Spin for rare prizes',        tab: 'CASH' },
  { icon: '🐶', name: 'Pets',           desc: 'Hatch, raise & equip',        tab: 'CASH' },
];

const TAB_META = {
  EQUIP: { color: '#f8c34a', label: 'Equipment, gear & progression' },
  USE:   { color: '#88dc6a', label: 'Things to do in-game' },
  SETUP: { color: '#7ec4f5', label: 'Controls, travel & world setup' },
  ETC:   { color: '#e2a020', label: 'Collections & community ties' },
  CASH:  { color: '#ff9ab8', label: 'Cosmetic cash-shop items' },
};

const JOBS = [
  {
    id: 'warrior', name: 'Warrior', cls: 'hero',
    stat: 'STR', sec: 'DEX',
    weapon: '1H/2H Sword · Axe · Spear · Pole Arm',
    role: 'Front-line damage and tank. High HP, melee range, simple rotations. The Maple classic for new players.',
    branches: ['Hero (1H, combo)', 'Paladin (shield, charges)', 'Dark Knight (2H spear, beserk)'],
  },
  {
    id: 'magician', name: 'Magician', cls: 'bishop',
    stat: 'INT', sec: 'LUK',
    weapon: 'Wand · Staff',
    role: 'Ranged magic damage. Big AoE clears, party buffs, teleport mobility. F/P and I/L nuke; Bishop heals + parties love them.',
    branches: ['F/P Arch Mage (fire + poison)', 'I/L Arch Mage (ice + lightning)', 'Bishop (heal + HS)'],
  },
  {
    id: 'bowman', name: 'Bowman', cls: 'bowman',
    stat: 'DEX', sec: 'STR',
    weapon: 'Bow · Crossbow',
    role: 'Ranged DEX class with mobility and crit. Strong solo, friendly damage, no buffs to manage outside of haste.',
    branches: ['Bowmaster (rapid-fire bow)', 'Marksman (high-crit crossbow)'],
  },
  {
    id: 'thief', name: 'Thief', cls: 'nightlord',
    stat: 'LUK', sec: 'DEX',
    weapon: 'Claw (throwing star) · Dagger',
    role: 'Crit-stack, high-mobility damage. Night Lords throw stars across the screen; Shadowers burst single targets and meso-explode.',
    branches: ['Night Lord (claw + stars)', 'Shadower (dagger + boomerang step)'],
  },
  {
    id: 'pirate', name: 'Pirate', cls: 'buccaneer',
    stat: 'STR/DEX', sec: '—',
    weapon: 'Knuckle (melee) · Gun (ranged)',
    role: 'Hybrid melee or ranged. Buccaneers punch with transformations; Corsairs gun from range and summon a battleship.',
    branches: ['Buccaneer (knuckle, transforms)', 'Corsair (gun + ship)'],
  },
];

function HeroSection() {
  return (
    <section style={{ padding: '40px 0 30px', position: 'relative' }}>
      {/* Floating decorations */}
      <img className="floating-sprite bobbing" style={{ top: 20, left: '8%', width: 36 }}
        src={`${MAPLE_BASE}/items/maple-leaf.png`} alt="" />
      <img className="floating-sprite bobbing" style={{ top: 80, right: '8%', width: 48, animationDelay: '0.4s' }}
        src={`${MAPLE_BASE}/items/maple-leaf.png`} alt="" />
      <img className="floating-sprite" style={{ top: 180, right: '20%', width: 56, animation: 'bob 2.4s ease-in-out infinite' }}
        src={`${MAPLE_BASE}/mobs/orange-mushroom.gif`} alt="" />
      <span className="sparkle" style={{ top: 60, left: '40%', fontSize: 18 }}>✦</span>
      <span className="sparkle" style={{ top: 140, left: '60%', fontSize: 14, animationDelay: '0.6s' }}>✦</span>
      <span className="sparkle" style={{ top: 200, left: '15%', fontSize: 20, animationDelay: '1.1s' }}>✦</span>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ marginBottom: 18 }}>
              <span style={{
                background: '#fff8d8', border: '2px solid #2a1810', padding: '4px 10px',
                fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: 1, color: '#c64b1b',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.3)'
              }}>
                🍁 V83 GMS PRIVATE SERVER · EST. 2026
              </span>
            </div>
            <h1 className="hero-title">Welcome to<br/>Maple World</h1>
            <div style={{ marginTop: 18, marginBottom: 24 }}>
              <span className="hero-sub">
                A nostalgic MapleStory v83 private server.<br />
                Play instantly in your browser — Windows, Mac & Linux.
              </span>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <a href="register.html" className="maple-btn primary">+ CREATE FREE ACCOUNT</a>
              <a href="login.html" className="maple-btn">▶ SIGN IN</a>
            </div>

            {/* Server stat panel */}
            <div className="pixel-panel" style={{ marginTop: 28, padding: 16, maxWidth: 460 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: '#c64b1b', marginBottom: 12, letterSpacing: 1 }}>
                ⚙ SERVER RATES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <StatBar kind="exp" label="EXP" value={7} max={10} displayValue="7×  RATE" />
                <StatBar kind="hp" label="MESO" value={5} max={10} displayValue="5×  RATE" />
                <StatBar kind="mp" label="DROP" value={3} max={10} displayValue="3×  RATE" />
              </div>
              <div style={{ marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 18, color: '#4a3220' }}>
                Version: <strong style={{ color: '#c64b1b' }}>v83 GMS</strong> · 100% Free · Zero Pay-to-Win
              </div>
            </div>
          </div>

          {/* Right side — NPC welcoming */}
          <div style={{ position: 'relative' }}>
            <NpcBox
              title="MAPLE ADMIN"
              npcName="Maple Admin"
              npcCls="gm"
              actions={
                <>
                  <button className="maple-btn sm">END CHAT</button>
                  <button className="maple-btn sm primary">NEXT ▶</button>
                </>
              }
            >
              <p>Welcome back, Mapler!</p>
              <p>
                The world you left behind is <strong>still here</strong> —
                same towns, same mushrooms, same soundtrack.
              </p>
              <p>
                <a href="register.html" style={{ color: '#c64b1b', fontWeight: 700, textDecoration: 'underline dotted' }}>Create a free account</a>{' '}
                — about thirty seconds — then hit <strong>Play Now</strong> and you'll be
                in Henesys. No launcher. No patches.
              </p>
            </NpcBox>
            {/* Chat bubble nearby */}
            <div style={{ position: 'absolute', bottom: -30, right: -20, transform: 'rotate(2deg)' }}>
              <ChatBubble speaker="Pig">Oink! ♥</ChatBubble>
            </div>
            <img src={`${MAPLE_BASE}/mobs/pig.gif`}
              style={{ position: 'absolute', bottom: -60, right: 40, width: 56 }} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const reasons = [
    {
      icon: '🌐',
      title: 'Play Instantly in Your Browser',
      body: 'No download, no installer, no patch. Click Play and you are in Maple World within seconds — on any machine.'
    },
    {
      icon: '⚖️',
      title: 'Fair Rates, Zero Pay-to-Win',
      body: 'Balanced 7× EXP, 5× Meso & 3× Drop. Everything is earned in-game — no cash shop power, ever.'
    },
    {
      icon: '💻',
      title: 'Windows, Mac & Linux',
      body: 'One server, every platform. Same nostalgic v83 experience whether you are on a laptop, desktop or anything in between.'
    },
    {
      icon: '🤝',
      title: 'A Living Community',
      body: 'Active players, regular events, guild rankings and a friendly Discord. Adventure with old friends and meet new ones.'
    },
  ];
  return (
    <section style={{ padding: '40px 0', background: 'rgba(255, 248, 216, 0.4)' }}>
      <div className="container">
        <SectionBanner>WHY SHINYMS</SectionBanner>
        <h2 className="section-title">The MapleStory you remember,<br/>made effortless.</h2>
        <p className="muted" style={{ maxWidth: 640, marginBottom: 28 }}>
          Everything that made the golden era great — preserved, balanced and one click away.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {reasons.map((r, i) => (
            <NpcBox
              key={i}
              title={`QUEST · ${String(i + 1).padStart(2, '0')}`}
              closable={false}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  fontSize: 32, lineHeight: 1, padding: 8, background: '#fff8d8',
                  border: '2px solid #2a1810', boxShadow: 'inset 1px 1px 0 #fff'
                }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 12, color: '#c64b1b',
                    marginBottom: 6, letterSpacing: 1, lineHeight: 1.4
                  }}>{r.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 21, lineHeight: 1.25, color: '#2a1810' }}>
                    {r.body}
                  </div>
                </div>
              </div>
            </NpcBox>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorldSection() {
  return (
    <section style={{ padding: '60px 0', position: 'relative' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 36, alignItems: 'center' }}>
          <div>
            <SectionBanner>A FAMILIAR WORLD</SectionBanner>
            <h2 className="section-title">Step right back into<br/>Maple World</h2>
            <p className="muted" style={{ marginBottom: 18 }}>
              The same hand-drawn towns, the same cozy mushroom houses, the same
              soundtrack you have not heard in years — running live in your browser,
              exactly as you left it.
            </p>
            <ul style={{
              listStyle: 'none', padding: 0, margin: '0 0 24px',
              fontFamily: 'var(--font-body)', fontSize: 22, color: '#2a1810'
            }}>
              <li style={{ marginBottom: 6 }}>
                <span style={{ color: '#2e7a18', marginRight: 8 }}>✓</span>
                Classic v83 maps, jobs and monsters
              </li>
              <li style={{ marginBottom: 6 }}>
                <span style={{ color: '#2e7a18', marginRight: 8 }}>✓</span>
                Pixel-perfect sprites and original UI
              </li>
              <li style={{ marginBottom: 6 }}>
                <span style={{ color: '#2e7a18', marginRight: 8 }}>✓</span>
                Smooth, lag-free play right in the tab
              </li>
            </ul>
            <a href="register.html" className="maple-btn primary">+ CREATE FREE ACCOUNT</a>
          </div>

          <div className="screenshot-frame">
            <span className="badge">MAPLE WORLD · LIVE</span>
            <img src="https://shinyms.com/gameplay.jpeg"
              alt="Maple Road gameplay screenshot" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MobSection() {
  return (
    <section style={{ padding: '40px 0', background: 'rgba(106, 184, 74, 0.18)', position: 'relative' }}>
      <div className="container">
        <SectionBanner>OLD FRIENDS</SectionBanner>
        <h2 className="section-title">The faces you grew up with</h2>
        <p className="muted" style={{ marginBottom: 24, maxWidth: 600 }}>
          From your very first snail to Henesys' Mushmom — every classic v83 monster,
          exactly as you remember it. Hover for stats.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'flex-start' }}>
          <NpcBox title="MAPLE WORLD FIELD GUIDE" closable={false}>
            <p style={{ fontSize: 19 }}>
              <strong>Adventurer!</strong> Be careful out there.
              Even the cutest snail has friends — and some of these little guys
              hit harder than they look.
            </p>
            <p style={{ fontSize: 18, color: '#4a3220', margin: 0 }}>
              <em>Hover any monster to see its stats. Click Play to fight 'em.</em>
            </p>
          </NpcBox>

          <div className="inv-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {MOBS.map((m, i) => (
              <InvSlot
                key={i}
                icon={m.src}
                alt={m.name}
                name={m.name}
                rarity={m.rare ? '⭐ Rare Spawn' : 'Common'}
                desc={`Lv. ${m.lv}  ·  HP ${m.hp.toLocaleString()}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BossSection() {
  return (
    <section style={{ padding: '40px 0', background: 'rgba(20, 12, 6, 0.85)', color: '#fff8d8', position: 'relative' }}>
      <div className="container">
        <SectionBanner>END GAME</SectionBanner>
        <h2 className="section-title" style={{ color: '#f8c34a', textShadow: '2px 2px 0 #1a0a04' }}>
          Then test your might
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 22, color: '#d8c08c', marginBottom: 28, maxWidth: 600 }}>
          Gear up, rally a party and take on the bosses that defined the era.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {BOSSES.map((b, i) => (
            <div key={i} style={{
              background: 'rgba(40, 24, 12, 0.85)',
              border: '3px solid #f8c34a',
              boxShadow: 'inset 0 0 0 3px #1a0a04, 4px 4px 0 rgba(0,0,0,0.6)',
              padding: 20,
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: -12, left: 12,
                background: '#c64b1b', color: '#fff', border: '2px solid #1a0a04',
                padding: '3px 8px', fontFamily: 'var(--font-display)', fontSize: 8,
                letterSpacing: 1, boxShadow: '2px 2px 0 rgba(0,0,0,0.5)'
              }}>BOSS</div>
              <div style={{
                background: 'rgba(106, 32, 16, 0.5)', border: '2px solid #1a0a04',
                padding: 16, marginBottom: 12, minHeight: 130,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img src={b.src} alt={b.name} style={{ maxWidth: '100%', maxHeight: 110 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#f8c34a', marginBottom: 8, letterSpacing: 1 }}>
                {b.name}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: '#d8c08c', marginBottom: 8 }}>
                LV. {b.lv}
              </div>
              <StatBar kind="hp" label="HP" value={100} max={100} displayValue={b.hp.toLocaleString()} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [tab, setTab] = useState('EQUIP');
  const TABS = ['EQUIP', 'USE', 'SETUP', 'ETC', 'CASH'];
  const items = FEATURES.filter(f => f.tab === tab);
  // Pad to a 4×4 grid for classic-inventory feel.
  const GRID_SLOTS = 16;
  const filled = items.concat(Array.from({ length: Math.max(0, GRID_SLOTS - items.length) }, () => null));
  return (
    <section style={{ padding: '50px 0', position: 'relative' }}>
      <div className="container">
        <SectionBanner>INVENTORY · IN THE GAME</SectionBanner>
        <h2 className="section-title">Everything packed in</h2>
        <p className="muted" style={{ marginBottom: 24, maxWidth: 600 }}>
          From your first party quest to endgame bossing — all the systems you
          loved, ready to go. <strong style={{ color: '#c64b1b' }}>Click a tab</strong> to flip through.
        </p>

        <div className="pixel-panel" style={{ padding: 20 }}>
          {/* Inventory tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, fontFamily: 'var(--font-display)', fontSize: 9, alignItems: 'flex-end' }}>
            {TABS.map((t) => {
              const active = t === tab;
              const meta = TAB_META[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  aria-pressed={active}
                  style={{
                    padding: active ? '8px 14px' : '6px 12px',
                    background: active ? meta.color : '#c8a868',
                    border: '2px solid #1a0a04',
                    color: '#1a0a04',
                    letterSpacing: 1,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: active ? 11 : 9,
                    fontWeight: 'bold',
                    boxShadow: active
                      ? 'inset 2px 2px 0 rgba(255,255,255,0.6)'
                      : 'inset -2px -2px 0 #8a6f3c',
                    transition: 'transform 80ms ease-out',
                    transform: active ? 'translateY(-2px)' : 'none',
                    position: 'relative',
                    zIndex: active ? 2 : 1,
                  }}
                >
                  {t}
                </button>
              );
            })}
            <div style={{ flex: 1 }}></div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: '#4a3220', alignSelf: 'center' }}>
              MESO: 12,345,678 ⛁
            </div>
          </div>

          {/* Tab description */}
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 18, color: '#4a3220',
            marginBottom: 10, paddingLeft: 4, fontStyle: 'italic',
          }}>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b', letterSpacing: 1, fontStyle: 'normal' }}>
              {tab} TAB
            </strong>{' '}— {TAB_META[tab].label}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, background: '#a88458', padding: 8, border: '2px solid #1a0a04' }}>
            {filled.map((f, i) => (
              <div
                key={`${tab}-${i}`}
                className="inv-slot"
                style={{
                  aspectRatio: 'auto',
                  padding: '12px 8px',
                  flexDirection: 'column',
                  minHeight: 96,
                  opacity: f ? 1 : 0.35,
                  cursor: f ? 'pointer' : 'default',
                  position: 'relative',
                  animation: f ? 'bob 0.4s ease-out both' : 'none',
                  animationDelay: `${i * 30}ms`,
                }}
                title={f ? `${f.name} — ${f.desc}` : undefined}
              >
                {f ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 6, lineHeight: 1 }}>{f.icon}</div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 9, color: '#2a1810',
                      textAlign: 'center', lineHeight: 1.4, marginBottom: 4, letterSpacing: 0.5
                    }}>{f.name}</div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: 15, color: '#4a3220',
                      textAlign: 'center', lineHeight: 1.1
                    }}>{f.desc}</div>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 10,
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--font-display)', fontSize: 9, color: '#6a4f1a',
            letterSpacing: 1,
          }}>
            <span>{items.length} / {GRID_SLOTS} SLOTS</span>
            <span>SORT ▼</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function JobsSection() {
  const [selected, setSelected] = useState(JOBS[0].id);
  const job = JOBS.find(j => j.id === selected) || JOBS[0];
  const theme = (window.CLASS_THEMES && window.CLASS_THEMES[job.cls]) || { color: '#c64b1b', shade: '#6a1010' };
  return (
    <section style={{ padding: '40px 0', background: 'rgba(248, 195, 74, 0.18)' }}>
      <div className="container">
        <SectionBanner>CHARACTER SELECT</SectionBanner>
        <h2 className="section-title">Pick your class</h2>
        <p className="muted" style={{ marginBottom: 20, maxWidth: 600 }}>
          Every classic v83 job tree. <strong style={{ color: '#c64b1b' }}>Click a portrait</strong> to read its
          story — primary stat, weapons and final job branches.
        </p>

        <div role="tablist" aria-label="Class picker" style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10, marginBottom: 16,
        }}>
          {JOBS.map((j) => {
            const active = j.id === selected;
            const t = (window.CLASS_THEMES && window.CLASS_THEMES[j.cls]) || { color: '#c64b1b' };
            return (
              <button
                key={j.id}
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(j.id)}
                style={{
                  background: active ? '#fff8d8' : '#f6e8b4',
                  border: '3px solid #1a0a04',
                  padding: '12px 8px 14px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-display)',
                  fontSize: 11, letterSpacing: 1,
                  color: active ? t.color : '#4a3220',
                  position: 'relative',
                  boxShadow: active
                    ? `inset 0 -6px 0 ${t.color}, 3px 3px 0 rgba(0,0,0,0.35)`
                    : `inset 0 -3px 0 ${t.color}77, 3px 3px 0 rgba(0,0,0,0.25)`,
                  transform: active ? 'translateY(-3px)' : 'none',
                  transition: 'transform 100ms ease-out, background 150ms',
                }}
              >
                <CharAvatar cls={j.cls} size={56} label={false} />
                <span>{j.name.toUpperCase()}</span>
                {active && (
                  <span style={{
                    position: 'absolute', top: -10, right: -8,
                    background: '#c64b1b', color: '#fff',
                    fontSize: 9, padding: '3px 6px', border: '2px solid #1a0a04',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.3)', letterSpacing: 1,
                  }}>SELECTED</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Class detail card */}
        <div style={{
          background: 'var(--npc-bg)',
          border: '3px solid var(--npc-border-outer)',
          boxShadow: 'inset 0 0 0 3px var(--npc-border-inner), 4px 4px 0 rgba(0,0,0,0.4)',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 0,
        }}>
          <div style={{
            background: `linear-gradient(180deg, ${theme.color} 0%, ${theme.shade} 100%)`,
            borderRight: '3px solid #1a0a04',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px 16px', position: 'relative', overflow: 'hidden',
          }}>
            <span style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(255,255,255,0.06) 6px 8px)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <CharAvatar cls={job.cls} size={120} label={false} />
            </div>
            <div style={{
              marginTop: 12,
              fontFamily: 'var(--font-display)', fontSize: 14, color: '#fff8d8',
              letterSpacing: 2, textShadow: '2px 2px 0 rgba(0,0,0,0.4)',
              position: 'relative', zIndex: 2,
            }}>
              {job.name.toUpperCase()}
            </div>
          </div>

          <div style={{ padding: '20px 22px', fontFamily: 'var(--font-body)', fontSize: 19, color: '#2a1810' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px 14px',
              marginBottom: 14,
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b', letterSpacing: 1, alignSelf: 'center' }}>PRIMARY STAT</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: theme.color }}>{job.stat}</span>

              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b', letterSpacing: 1, alignSelf: 'center' }}>SECONDARY</span>
              <span style={{ color: '#4a3220' }}>{job.sec}</span>

              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b', letterSpacing: 1, alignSelf: 'center' }}>WEAPON</span>
              <span>{job.weapon}</span>
            </div>

            <p style={{ margin: '0 0 12px', lineHeight: 1.3 }}>{job.role}</p>

            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b',
              letterSpacing: 1, marginBottom: 6,
            }}>4TH JOB BRANCHES</div>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'grid', gap: 6,
            }}>
              {job.branches.map((b, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-body)', fontSize: 19, color: '#2a1810',
                }}>
                  <span style={{
                    width: 10, height: 10, background: theme.color,
                    border: '2px solid #1a0a04', flex: '0 0 10px'
                  }} />
                  {b}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="register.html" className="maple-btn primary">+ CREATE ACCOUNT</a>
              <a href="guide.html" className="maple-btn">📖 JOB GUIDE</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GetStartedSection() {
  const steps = [
    { title: 'CREATE A FREE ACCOUNT', body: 'Pick a username and password. About thirty seconds — no email verification hoops.' },
    { title: 'SIGN IN', body: 'Sign in on the web, then launch the game straight in your browser. Nothing to install.' },
    { title: 'START YOUR ADVENTURE', body: 'Choose your class, leave Maple Island and dive back into the world you remember.' },
  ];
  return (
    <section style={{ padding: '60px 0', position: 'relative' }}>
      <div className="container">
        <SectionBanner>GET STARTED</SectionBanner>
        <h2 className="section-title">Playing takes about a minute</h2>
        <p className="muted" style={{ marginBottom: 36, maxWidth: 600 }}>
          No downloads, no waiting room. Three quick steps and you are back in the game.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div className="row">
          <a href="register.html" className="maple-btn primary">+ CREATE FREE ACCOUNT</a>
          <a href="guide.html" className="maple-btn">📖 READ THE GUIDE</a>
        </div>
      </div>
    </section>
  );
}

function TestimonySection() {
  const reviews = [
    {
      tag: 'NIGHT LORD',
      cls: 'nightlord',
      name: 'Reqei',
      meta: 'Night Lord · Lv. 142',
      body: "I have not played MapleStory since high school. Being able to just click a link and be back in Henesys — no launcher, no patching — genuinely got me emotional."
    },
    {
      tag: 'BISHOP',
      cls: 'bishop',
      name: 'Aelith',
      meta: 'Bishop · Lv. 120',
      body: "The rates feel exactly right. Fast enough that I can actually progress after work, slow enough that hitting a new level still means something."
    },
    {
      tag: 'HERO',
      cls: 'hero',
      name: 'Borin',
      meta: 'Hero · Lv. 155',
      body: "Playing on my Mac with zero setup was the selling point. The community is small but kind, and the events keep me logging in every week."
    },
  ];
  return (
    <section style={{ padding: '50px 0', background: 'rgba(255, 248, 216, 0.4)' }}>
      <div className="container">
        <SectionBanner>WHISPERS · FROM THE COMMUNITY</SectionBanner>
        <h2 className="section-title">Loved by returning Maplers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 18 }}>
          {reviews.map((r, i) => (
            <div key={i} className="testimony">
              <span className="tag">★ {r.tag}</span>
              <div className="body">"{r.body}"</div>
              <div className="who">
                <CharAvatar cls={r.cls} size={48} label={false} />
                <div>
                  <div className="name">{r.name}</div>
                  <div className="meta">{r.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnnouncementSection() {
  return (
    <section style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <SectionBanner>QUEST LOG · ANNOUNCEMENTS</SectionBanner>
            <h2 className="section-title">Latest from the GMs</h2>
          </div>
          <a href="news.html" className="maple-btn sm">VIEW ALL NEWS ▶</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div className="quest-card">
            <div className="head">
              <span className="pinned">📌 PINNED</span>
              <span>UPDATE · MAY 24, 2026 · admin</span>
            </div>
            <div className="body">
              <h3>🌟 ShinyMS — MapleStory v83 Private Server Opening Soon!</h3>
              <p>
                Welcome to ShinyMS, a nostalgic MapleStory v83 private server built for
                players who miss the golden era of GMS.
              </p>
              <p>
                Re-live the classic experience with balanced rates, old-school progression,
                and a friendly community — completely free to play.
              </p>
              <p>
                <strong>🚀 Coming Soon:</strong> Client Web · Full launch ETA · Discord ·
                Patch notes
              </p>
              <div className="rewards">
                <span className="label">⭐ REWARD QUEST:</span>
                <span style={{ fontSize: 18 }}>
                  Read the post, share with old guildmates, get +1 nostalgia point.
                </span>
                <a href="news.html" className="maple-btn sm" style={{ marginLeft: 'auto' }}>READ MORE ▶</a>
              </div>
            </div>
          </div>

          <NpcBox title="🔗 QUICK LINKS" closable={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b' }}>RANKINGS</div>
                  <div style={{ fontSize: 18 }}>Top players by level & class</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>▶</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b' }}>PLAY NOW</div>
                  <div style={{ fontSize: 18 }}>Launch the game in your browser</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🗳️</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b' }}>VOTE</div>
                  <div style={{ fontSize: 18 }}>Earn NX rewards</div>
                </div>
              </div>
            </div>
          </NpcBox>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section style={{ padding: '50px 0', background: 'rgba(255, 248, 216, 0.4)' }}>
      <div className="container">
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <SectionBanner>STAY IN THE LOOP</SectionBanner>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Get ShinyMS updates by email</h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            Be the first to know about events, updates and maintenance.
            No spam — just announcements. Unsubscribe any time.
          </p>
          <div className="pixel-panel" style={{ padding: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="email"
              placeholder="adventurer@maplemail.com"
              style={{
                flex: 1, padding: '12px 14px',
                fontFamily: 'var(--font-body)', fontSize: 20,
                background: '#fff', border: '2px solid #1a0a04',
                boxShadow: 'inset 2px 2px 0 #c8a868',
                color: '#2a1810', outline: 'none',
              }}
            />
            <button className="maple-btn primary" type="button">SUBSCRIBE</button>
          </div>
          <div style={{ marginTop: 14, fontFamily: 'var(--font-body)', fontSize: 18, color: '#4a3220' }}>
            🍁 Joined by <strong>1,247</strong> Maplers so far
          </div>
        </div>
      </div>
    </section>
  );
}

function MapleIntensityTweaks({ onChange }) {
  const [t, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "intensity": "full",
    "showMobs": true
  }/*EDITMODE-END*/);

  // Apply intensity class to body + persist for other pages
  useEffect(() => {
    document.body.classList.remove('intensity-subtle', 'intensity-medium', 'intensity-full');
    document.body.classList.add(`intensity-${t.intensity}`);
    try {
      localStorage.setItem('shinyms.intensity', t.intensity);
      localStorage.setItem('shinyms.showMobs', String(t.showMobs));
    } catch (e) {}
    onChange && onChange(t);
  }, [t.intensity, t.showMobs]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Maple Intensity">
        <TweakRadio
          label="Theme strength"
          value={t.intensity}
          options={['subtle', 'medium', 'full']}
          onChange={(v) => setTweak('intensity', v)}
        />
        <TweakToggle
          label="Walking mobs"
          value={t.showMobs}
          onChange={(v) => setTweak('showMobs', v)}
        />
      </TweakSection>
      <div style={{
        fontSize: 11, color: '#777', padding: '8px 12px', lineHeight: 1.5,
        background: '#f5f0e0', borderRadius: 4, marginTop: 4,
      }}>
        <strong>Subtle:</strong> Maple palette only.<br />
        <strong>Medium:</strong> Pixel UI, calmer.<br />
        <strong>Full:</strong> Full cosplay.
      </div>
    </TweaksPanel>
  );
}

function App() {
  const [showMobs, setShowMobs] = useState(true);

  return (
    <>
      <TopBar active="home" />
      <HeroSection />
      <WhySection />
      <WorldSection />
      <MobSection />
      <BossSection />
      <JobsSection />
      <FeaturesSection />
      <GetStartedSection />
      <TestimonySection />
      <AnnouncementSection />
      <NewsletterSection />
      <MapleFooter />

      {showMobs && <FloatingMobs />}
      <MapleIntensityTweaks onChange={(t) => setShowMobs(t.showMobs)} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
