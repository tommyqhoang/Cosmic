// Vote — 4 sites + how it works. That's it.
const { useState, useEffect } = React;

function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return Math.max(0, targetMs - now);
}

function fmt(ms) {
  if (ms <= 0) return 'READY';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
}

const SITES = [
  { id: 'gtop100',  name: 'Gtop100',    logo: 'G·100', cd: 12, nx: 4000 },
  { id: 'topg',     name: 'TopG.org',   logo: 'TopG',  cd: 24, nx: 6000 },
  { id: 'msrank',   name: 'MapleRanks', logo: 'MS·R',  cd: 24, nx: 3000 },
  { id: 'xtrm',     name: 'XtremeTop',  logo: 'X·T',   cd: 12, nx: 2000 },
];

function VoteCard({ site, nextAvailable, onVote, signedIn }) {
  const remaining = useCountdown(nextAvailable);
  const ready = remaining === 0;
  return (
    <div className="vote-card">
      <div className="v-head">
        <span>🗳️ {site.name.toUpperCase()}</span>
        <span className="badge-rew">+{site.nx.toLocaleString()} NX</span>
      </div>
      <div className="v-body">
        <div className="v-logo">{site.logo}</div>
        <div className="v-info">
          <div className="title">VOTE FOR SHINYMS</div>
          <div className="meta">Cooldown: {site.cd}h</div>
        </div>
      </div>
      <div className="v-foot">
        <span className={`v-timer ${ready ? '' : 'locked'}`}>
          {ready ? '✓ READY' : `NEXT IN ${fmt(remaining)}`}
        </span>
        <button
          className={`maple-btn sm ${ready ? 'primary' : ''}`}
          disabled={!ready || !signedIn}
          onClick={() => onVote(site)}
          style={{ opacity: ready && signedIn ? 1 : 0.5, cursor: ready && signedIn ? 'pointer' : 'not-allowed' }}
        >
          {!signedIn ? '🔒 SIGN IN TO VOTE' : ready ? '▶ VOTE NOW' : '⏳ COOLDOWN'}
        </button>
      </div>
    </div>
  );
}

function VoteApp() {
  const [username, setUsername] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('shinyms.last-user');
      if (u) setUsername(u);
      const raw = localStorage.getItem('shinyms.vote-cd');
      if (raw) setCooldowns(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const handleVote = (site) => {
    const until = Date.now() + site.cd * 3600 * 1000;
    const next = { ...cooldowns, [site.id]: until };
    setCooldowns(next);
    setToast({ site: site.name, nx: site.nx });
    try { localStorage.setItem('shinyms.vote-cd', JSON.stringify(next)); } catch (e) {}
    setTimeout(() => setToast(null), 4000);
  };

  const signedIn = !!username;

  return (
    <>
      <TopBar active="vote" />

      <section className="page-hero">
        <img className="floating-sprite bobbing" style={{ top: 30, left: '8%', width: 56 }}
          src={`${MAPLE_BASE}/items/maple-leaf.png`} alt="" />
        <img className="floating-sprite bobbing" style={{ top: 80, right: '10%', width: 48, animationDelay: '0.4s' }}
          src={`${MAPLE_BASE}/mobs/orange-mushroom.gif`} alt="" />
        <span className="sparkle" style={{ top: 60, left: '40%', fontSize: 18 }}>✦</span>

        <div className="container">
          <SectionBanner>SUPPORT · VOTE</SectionBanner>
          <h1 className="hero-title" style={{ fontSize: 'clamp(22px, 3.6vw, 38px)' }}>Vote for ShinyMS,<br/>earn free NX</h1>
          <div style={{ marginTop: 14, marginBottom: 24, maxWidth: 600 }}>
            <span className="hero-sub">
              Click a site, pass the captcha — we credit NX to your account when
              they confirm the vote. NX is cosmetic only.
            </span>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 50px' }}>
        <div className="container">
          {!signedIn && (
            <div className="banner-alert info" style={{ marginBottom: 18, maxWidth: 760 }}>
              <span className="ico">★</span>
              <div>
                <strong>Sign in before voting</strong> so your NX credits to the right account.{' '}
                <a href="login.html" style={{ color: '#c64b1b', fontWeight: 700, textDecoration: 'underline dotted' }}>
                  Sign in →
                </a>
              </div>
            </div>
          )}

          {toast && (
            <div className="banner-alert success" style={{ marginBottom: 18, maxWidth: 760 }}>
              <span className="ico">🎁</span>
              <div>
                <strong>Thanks for voting on {toast.site}!</strong> +{toast.nx.toLocaleString()} NX credited.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, maxWidth: 880 }}>
            {SITES.map(s => (
              <VoteCard
                key={s.id}
                site={s}
                nextAvailable={cooldowns[s.id] || 0}
                onVote={handleVote}
                signedIn={signedIn}
              />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '50px 0', background: 'rgba(255, 248, 216, 0.4)', borderTop: '2px solid #c8a868', borderBottom: '2px solid #c8a868' }}>
        <div className="container">
          <SectionBanner>HOW VOTING WORKS</SectionBanner>
          <h2 className="section-title">Three quick steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 18 }}>
            {[
              { t: 'Click a vote site',  b: 'Opens in a new tab. Pick any of the four.' },
              { t: 'Pass the captcha',   b: 'Takes about five seconds.' },
              { t: 'Get credited',       b: 'NX lands in your account automatically.' },
            ].map((s, i) => (
              <div key={i} className="step-card">
                <div className="num">{i + 1}</div>
                <h3>{s.t}</h3>
                <p>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MapleFooter />
      <FloatingMobs />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<VoteApp />);
