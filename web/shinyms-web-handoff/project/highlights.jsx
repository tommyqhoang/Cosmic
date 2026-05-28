// Community — live smega feed. Mirrors the in-game megaphone broadcasts.
// One feature, one page. No invented data systems.
const { useState, useEffect, useMemo } = React;

// A small rotating pool of in-character smegas. In production these come from
// the live `recentSmegas()` feed; here we just rotate them for show.
const SAMPLE_SMEGAS = [
  { who: 'Reqei',       cls: 'nightlord', msg: 'WTB Maple Wagner clean, 30M, /buy' },
  { who: 'Aelith',      cls: 'bishop',    msg: 'HS bus, KPQ → 30, /msg me' },
  { who: 'Pixelpete',   cls: 'bm',        msg: 'Anyone running Mushmom @ 30? Need 1 more' },
  { who: 'Borin',       cls: 'hero',      msg: 'GZ <FluffyBuns> on Lv. 100!! 🎉' },
  { who: 'sleepysnail', cls: 'shadower',  msg: 'WTS Stolen Fence +9 LUK · 8M /buy' },
  { who: 'Mochi',       cls: 'il',        msg: 'Free buffs in Henesys Market ❄' },
  { who: 'KingKonglet', cls: 'buccaneer', msg: 'Boat tour leaving Lith Harbour in 5!' },
  { who: 'Hopskip',     cls: 'paladin',   msg: 'LF Bishop for Zakum, mesos paid' },
  { who: 'Nyari',       cls: 'fp',        msg: 'Selling all-cures 800 ea, fm 12 ch1' },
  { who: 'BalrogFan',   cls: 'dk',        msg: 'Crimson Balrog run, lv 80+, msg' },
];

function timeAgo(secs) {
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function SmegaTicker() {
  // Each smega in the visible feed gets a "post time" relative to now.
  // We keep a rolling 6-item window and add a fresh one every ~5s.
  const [feed, setFeed] = useState(() =>
    SAMPLE_SMEGAS.slice(0, 6).map((s, i) => ({ ...s, postedAt: Date.now() - (i + 1) * 12_000 }))
  );
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setNowTick(x => x + 1), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setFeed((prev) => {
        const next = SAMPLE_SMEGAS[Math.floor(Math.random() * SAMPLE_SMEGAS.length)];
        return [{ ...next, postedAt: Date.now() }, ...prev].slice(0, 8);
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(to bottom, #c64b1b 0%, #8a2810 100%)',
      border: '3px solid #1a0a04',
      boxShadow: 'inset 2px 2px 0 #ff9a6a, inset -2px -2px 0 #5a0a04, 4px 4px 0 rgba(0,0,0,0.4)',
      padding: 0, overflow: 'hidden',
    }}>
      <div style={{
        background: '#1a0a04', color: '#f8c34a',
        fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 1,
        padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '2px solid #f8c34a',
      }}>
        📢 LIVE MEGAPHONE FEED
        <span style={{ marginLeft: 'auto', color: '#88f078', fontSize: 9 }}>
          ● LIVE · {feed.length} RECENT
        </span>
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {feed.map((s, i) => {
          const secs = Math.floor((Date.now() - s.postedAt) / 1000);
          return (
            <div key={`${s.postedAt}-${i}`} style={{
              display: 'grid', gridTemplateColumns: '32px 110px 1fr 70px',
              gap: 10, alignItems: 'center',
              opacity: 1 - i * 0.08,
              animation: i === 0 ? 'bob 1.5s ease-in-out' : 'none',
            }}>
              <CharAvatar cls={s.cls} size={28} label={false} />
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 9, color: '#ffd96b',
                letterSpacing: 0.5,
              }}>{s.who}</span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 18, color: '#fff8d8',
                lineHeight: 1.2
              }}>"{s.msg}"</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 8, color: '#d8c08c',
                textAlign: 'right'
              }}>{timeAgo(secs)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HighlightsApp() {
  return (
    <>
      <TopBar active="highlights" />

      <section className="page-hero">
        <img className="floating-sprite bobbing" style={{ top: 24, left: '8%', width: 56 }}
          src={`${MAPLE_BASE}/mobs/orange-mushroom.gif`} alt="" />
        <img className="floating-sprite bobbing" style={{ top: 70, right: '10%', width: 48, animationDelay: '0.4s' }}
          src={`${MAPLE_BASE}/mobs/pig.gif`} alt="" />
        <span className="sparkle" style={{ top: 60, left: '40%', fontSize: 18 }}>✦</span>

        <div className="container">
          <SectionBanner>COMMUNITY · LIVE FEED</SectionBanner>
          <h1 className="hero-title" style={{ fontSize: 'clamp(22px, 3.6vw, 38px)' }}>What's happening<br/>in Maple World</h1>
          <div style={{ marginTop: 14, marginBottom: 24, maxWidth: 600 }}>
            <span className="hero-sub">
              A live mirror of in-game megaphone broadcasts — the smegas, party
              calls and shoutouts shouted across the channels right now.
            </span>
          </div>

          <div style={{ maxWidth: 760 }}>
            <SmegaTicker />
          </div>

          <div style={{
            marginTop: 24, display: 'flex', alignItems: 'center', gap: 14,
            flexWrap: 'wrap'
          }}>
            <a href="#" className="maple-btn" onClick={(e) => e.preventDefault()}>💬 JOIN DISCORD</a>
            <a href="news.html" className="maple-btn">📰 SEE LATEST NEWS</a>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 18, color: '#4a3220'
            }}>
              Not playing yet? <a href="register.html" style={{ color: '#c64b1b', fontWeight: 700, textDecoration: 'underline dotted' }}>Make an account →</a>
            </span>
          </div>
        </div>
      </section>

      <MapleFooter />
      <FloatingMobs />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<HighlightsApp />);
