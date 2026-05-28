// Login — just the form. Nothing else.
const { useState, useEffect } = React;

function LoginCard() {
  const [name, setName] = useState('');
  const [pwd, setPwd]   = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shinyms.last-user');
      if (saved) setName(saved);
    } catch (e) {}
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !pwd) {
      setError('Enter your username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (pwd === 'wrong') {
        setError('Invalid username or password.');
        return;
      }
      try {
        if (remember) localStorage.setItem('shinyms.last-user', name);
        else localStorage.removeItem('shinyms.last-user');
      } catch (e) {}
      setSuccess(true);
    }, 600);
  };

  return (
    <NpcBox
      title="🍁 SIGN IN TO SHINYMS"
      npcName="Login Officer"
      npcCls="bishop"
    >
      {success ? (
        <>
          <div className="banner-alert success" style={{ marginBottom: 14 }}>
            <span className="ico">✓</span>
            <div>Welcome back, <strong>{name}</strong>! Launching the client…</div>
          </div>
          <a href="#" className="maple-btn primary" onClick={(e) => e.preventDefault()}>▶ PLAY NOW</a>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 12 }}>
            Sign in with your ShinyMS account. Same credentials for the website
            and the game.
          </p>

          {error && (
            <div className="banner-alert error" style={{ marginBottom: 12 }}>
              <span className="ico">✕</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="maple-field">
              <label>USERNAME</label>
              <input
                className="maple-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your username"
                autoFocus
                maxLength={13}
              />
            </div>

            <div className="maple-field">
              <label>
                PASSWORD
                <span className="hint" style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                  onClick={() => setShow(!show)}>
                  {show ? '🙈 hide' : '👁 show'}
                </span>
              </label>
              <input
                className="maple-input"
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
              <label className="maple-check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a href="#" onClick={(e) => e.preventDefault()}
                style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: '#c64b1b', textDecoration: 'underline dotted' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="maple-btn primary"
              disabled={loading}
              style={{ justifyContent: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? '⏳ SIGNING IN…' : '▶ SIGN IN'}
            </button>
          </form>
        </>
      )}
    </NpcBox>
  );
}

function LoginApp() {
  return (
    <>
      <TopBar active="login" />

      <section className="page-hero">
        <img className="floating-sprite bobbing" style={{ top: 24, left: '8%', width: 56 }}
          src={`${MAPLE_BASE}/mobs/orange-mushroom.gif`} alt="" />
        <img className="floating-sprite bobbing" style={{ top: 70, right: '10%', width: 48, animationDelay: '0.4s' }}
          src={`${MAPLE_BASE}/mobs/slime.gif`} alt="" />
        <span className="sparkle" style={{ top: 50, left: '40%', fontSize: 18 }}>✦</span>

        <div className="container">
          <SectionBanner>WELCOME BACK</SectionBanner>
          <h1 className="hero-title" style={{ fontSize: 'clamp(22px, 3.6vw, 38px)' }}>Sign in</h1>
          <div style={{ marginTop: 14, marginBottom: 24 }}>
            <span className="hero-sub">
              Your characters, mesos and hair colours are exactly where you parked them.
            </span>
          </div>

          <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            <LoginCard />
            <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 20, color: '#2a1810' }}>
              No account yet?{' '}
              <a href="register.html" style={{ color: '#c64b1b', fontWeight: 700, textDecoration: 'underline dotted' }}>
                Create one →
              </a>
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
root.render(<LoginApp />);
