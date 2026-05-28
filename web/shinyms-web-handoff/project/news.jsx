// News page — quest log style
const { useState } = React;

const NEWS = [
  {
    pinned: true,
    type: 'UPDATE',
    date: 'May 24, 2026',
    author: 'admin',
    title: '🌟 ShinyMS — MapleStory v83 Private Server Opening Soon!',
    excerpt: 'Welcome to ShinyMS, a nostalgic MapleStory v83 private server built for players who miss the golden era of GMS. Re-live the classic experience with balanced rates and a friendly community — completely free.',
    rewards: ['+100 Hype EXP', '+1 Maple Leaf'],
    full: true,
  },
  {
    type: 'EVENT',
    date: 'May 22, 2026',
    author: 'gm_amber',
    title: '🍁 Maple Leaf Hunt — Pre-Launch Event',
    excerpt: 'Hunt 50 golden leaves scattered across Maple Island to claim a starter pack on launch day. Pre-registered accounts only.',
    rewards: ['Starter Pack', '500 NX'],
  },
  {
    type: 'PATCH',
    date: 'May 18, 2026',
    author: 'admin',
    title: '🔧 Closed Beta — Patch 0.9.4',
    excerpt: 'Fixed Mushmom spawn timer, restored original v83 hit-rate formula, polished web-client connection handling. Thanks to all beta testers!',
    rewards: ['Bug Hunter Medal'],
  },
  {
    type: 'NEWS',
    date: 'May 10, 2026',
    author: 'admin',
    title: '📜 The ShinyMS Manifesto',
    excerpt: 'Why we built ShinyMS, what "no pay-to-win" really means here, and how we plan to keep the lights on without ever selling power. A long read for the curious.',
    rewards: ['Knowledge +5'],
  },
  {
    type: 'COMMUNITY',
    date: 'May 03, 2026',
    author: 'gm_amber',
    title: '🎙️ Discord is Live — Come Say Hi',
    excerpt: 'Our community Discord is open for early Maplers. Channels for guild recruiting, screenshots, suggestions and a #maplers-from-2006 nostalgia thread.',
    rewards: ['Discord Role'],
  },
];

const TYPE_COLORS = {
  UPDATE: { bg: '#f8c34a', dark: '#e2a020', text: '#2a1810' },
  EVENT: { bg: '#88dc6a', dark: '#2e7a18', text: '#0a3a04' },
  PATCH: { bg: '#6ab0ff', dark: '#143d80', text: '#fff8d8' },
  NEWS: { bg: '#f0e0a8', dark: '#a88458', text: '#2a1810' },
  COMMUNITY: { bg: '#e88aff', dark: '#8030a0', text: '#fff8d8' },
};

function QuestCard({ item }) {
  const c = TYPE_COLORS[item.type] || TYPE_COLORS.NEWS;
  return (
    <article className="quest-card">
      <div className="head" style={{
        background: `linear-gradient(to bottom, ${c.bg} 0%, ${c.dark} 100%)`,
        color: c.text,
        textShadow: c.text === '#fff8d8' ? '1px 1px 0 #000' : '1px 1px 0 rgba(255,255,255,0.4)'
      }}>
        {item.pinned && <span className="pinned">📌 PINNED</span>}
        <span style={{
          background: 'rgba(0,0,0,0.25)', padding: '3px 8px', border: '1px solid rgba(0,0,0,0.4)',
          fontSize: 8, letterSpacing: 1.5
        }}>{item.type}</span>
        <span>{item.date} · {item.author}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9 }}>QUEST #{String(NEWS.indexOf(item) + 1).padStart(3, '0')}</span>
      </div>
      <div className="body">
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
        {item.full && (
          <>
            <p style={{ marginTop: 14 }}>
              We're currently preparing for launch and polishing the server.
              An official ETA and release schedule will be announced soon —
              <strong> stay tuned</strong>!
            </p>
            <div style={{
              marginTop: 14, padding: 14,
              background: '#f6e8b4', border: '2px dashed #c8a868',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 10,
                color: '#c64b1b', marginBottom: 8, letterSpacing: 1
              }}>🎮 SERVER INFORMATION</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div><StatBar kind="exp" label="EXP" value={7} max={10} displayValue="7×" /></div>
                <div><StatBar kind="hp" label="MESO" value={5} max={10} displayValue="5×" /></div>
                <div><StatBar kind="mp" label="DROP" value={3} max={10} displayValue="3×" /></div>
              </div>
              <div style={{ marginTop: 10, fontSize: 18 }}>
                Version: <strong>v83 GMS</strong> · Free to play forever
              </div>
            </div>
          </>
        )}
        <div className="rewards">
          <span className="label">⭐ REWARD:</span>
          {item.rewards.map((r, i) => (
            <span key={i} style={{
              background: '#fff8d8', border: '2px solid #1a0a04', padding: '3px 8px',
              fontFamily: 'var(--font-display)', fontSize: 9, color: '#c64b1b',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.3)'
            }}>{r}</span>
          ))}
          <a href="#" onClick={(e) => e.preventDefault()} className="maple-btn sm" style={{ marginLeft: 'auto' }}>
            READ MORE ▶
          </a>
        </div>
      </div>
    </article>
  );
}

function NewsFilter({ value, onChange }) {
  const tabs = ['ALL', 'UPDATE', 'EVENT', 'PATCH', 'NEWS', 'COMMUNITY'];
  return (
    <div className="pixel-panel" style={{ padding: 10, marginBottom: 24, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#4a3220', marginRight: 8, letterSpacing: 1 }}>
        FILTER:
      </span>
      {tabs.map(tab => {
        const active = value === tab;
        const c = tab === 'ALL' ? { bg: '#f8c34a', dark: '#e2a020', text: '#2a1810' } : TYPE_COLORS[tab];
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              padding: '6px 12px',
              background: active ? `linear-gradient(to bottom, ${c.bg}, ${c.dark})` : '#c8a868',
              border: '2px solid #1a0a04',
              color: active ? c.text : '#2a1810',
              fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: 1,
              cursor: 'pointer',
              boxShadow: active ? 'inset 2px 2px 0 rgba(255,255,255,0.4)' : 'inset -2px -2px 0 #8a6f3c',
              textShadow: active && c.text === '#fff8d8' ? '1px 1px 0 #000' : 'none',
            }}>{tab}</button>
        );
      })}
    </div>
  );
}

function NewsApp() {
  const [filter, setFilter] = useState('ALL');
  const filtered = filter === 'ALL' ? NEWS : NEWS.filter(n => n.type === filter);

  return (
    <>
      <TopBar active="news" />

      <section style={{ padding: '40px 0 20px', position: 'relative' }}>
        <img className="floating-sprite bobbing" style={{ top: 60, left: '6%', width: 56 }}
          src={`${MAPLE_BASE}/mobs/snail.gif`} alt="" />
        <img className="floating-sprite bobbing" style={{ top: 30, right: '8%', width: 36, animationDelay: '0.4s' }}
          src={`${MAPLE_BASE}/items/maple-leaf.png`} alt="" />

        <div className="container">
          <SectionBanner>QUEST LOG</SectionBanner>
          <h1 className="hero-title" style={{ fontSize: 'clamp(24px, 4vw, 42px)' }}>News & Announcements</h1>
          <div style={{ marginTop: 14, marginBottom: 24 }}>
            <span className="hero-sub">
              Patch notes, events, GM updates and community happenings.
              Check back often — and consider claiming the rewards while you're here.
            </span>
          </div>

          <NewsFilter value={filter} onChange={setFilter} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {filtered.map((item, i) => <QuestCard key={i} item={item} />)}
              {filtered.length === 0 && (
                <NpcBox title="QUEST LOG" closable={false}>
                  <p>No quests in this category yet. Check back soon!</p>
                </NpcBox>
              )}
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 80 }}>
              <NpcBox title="📊 SERVER STATUS" closable={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Server</span>
                    <span style={{ color: '#2e7a18', fontFamily: 'var(--font-display)', fontSize: 10 }}>● ONLINE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Players online</span>
                    <strong style={{ color: '#c64b1b' }}>247</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Uptime</span>
                    <strong>14d 6h</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Version</span>
                    <strong style={{ color: '#c64b1b' }}>v83 GMS</strong>
                  </div>
                </div>
              </NpcBox>

              <NpcBox title="🏆 TOP MAPLERS THIS WEEK" closable={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'Reqei', job: 'Night Lord', lv: 142, av: 'nightlord.png' },
                    { name: 'Borin', job: 'Hero', lv: 155, av: 'hero.png' },
                    { name: 'Aelith', job: 'Bishop', lv: 120, av: 'bishop.png' },
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        background: ['#f8c34a','#c8c8c8','#d8a878'][i],
                        border: '2px solid #1a0a04', padding: '2px 6px',
                        fontFamily: 'var(--font-display)', fontSize: 10,
                        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)'
                      }}>#{i + 1}</span>
                      <img src={`${MAPLE_BASE}/avatars/${p.av}`} alt="" style={{ width: 36, height: 36, background: '#d8c08c', border: '2px solid #1a0a04', padding: 4 }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#c64b1b' }}>{p.name}</div>
                        <div style={{ fontSize: 16 }}>{p.job} · Lv. {p.lv}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </NpcBox>

              <NpcBox title="💌 STAY UPDATED" closable={false}>
                <p style={{ fontSize: 19 }}>
                  Get news & event alerts by email or Discord.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  <a href="index.html#newsletter" className="maple-btn sm primary">📧 EMAIL</a>
                  <a href="#" className="maple-btn sm" onClick={(e) => e.preventDefault()}>💬 DISCORD</a>
                </div>
              </NpcBox>
            </aside>
          </div>
        </div>
      </section>

      <MapleFooter />
      <FloatingMobs />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<NewsApp />);
