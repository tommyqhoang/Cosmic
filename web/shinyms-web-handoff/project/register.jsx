// Register — just the form. Light starter-pack callout.
const { useState, useMemo, useEffect } = React;

function passwordStrength(p) {
  let s = 0;
  if (p.length >= 6)  s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s; // 0-5
}
const STRENGTH_LABEL = ['', 'Weak', 'OK', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLOR = ['#8a6f3c', '#c64b1b', '#e2a020', '#c08820', '#4caf30', '#2e7a18'];

function validateName(n) {
  if (!n) return '';
  if (n.length < 4)  return 'Too short (4 min).';
  if (n.length > 13) return 'Too long (13 max).';
  if (!/^[a-zA-Z0-9_]+$/.test(n)) return 'Letters, numbers, _ only.';
  return '';
}

function RegisterCard() {
  const [name, setName]     = useState('');
  const [pwd, setPwd]       = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail]   = useState('');
  const [show, setShow]     = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const nameErr = useMemo(() => validateName(name), [name]);
  const pwdScore = useMemo(() => passwordStrength(pwd), [pwd]);
  const pwdErr = pwd && pwd.length < 6 ? 'Min. 6 characters.' : '';
  const confirmErr = confirm && confirm !== pwd ? 'Passwords do not match.' : '';
  const emailErr = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Check your email format.' : '';

  const formOk =
    name && !nameErr &&
    pwd && pwd.length >= 6 &&
    confirm && confirm === pwd &&
    email && !emailErr &&
    agreed;

  const submit = (e) => {
    e.preventDefault();
    setTouched({ name: true, pwd: true, confirm: true, email: true });
    setServerErr('');
    if (!formOk) {
      if (!agreed) setServerErr('Please agree to the terms first.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      try { localStorage.setItem('shinyms.last-user', name); } catch (e) {}
      setSuccess(true);
    }, 700);
  };

  if (success) {
    return (
      <NpcBox title="🌟 ACCOUNT CREATED!" npcName="Maple Admin" npcCls="gm">
        <div className="banner-alert success" style={{ marginBottom: 14 }}>
          <span className="ico">✓</span>
          <div>Welcome to Maple World, <strong>{name}</strong>! You're ready to play.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="#" className="maple-btn primary" onClick={(e) => e.preventDefault()}>▶ PLAY NOW</a>
          <a href="guide.html" className="maple-btn">📖 READ THE GUIDE</a>
        </div>
      </NpcBox>
    );
  }

  return (
    <NpcBox title="🍁 CREATE AN ACCOUNT" npcName="Maple Admin" npcCls="gm">
      <p style={{ marginBottom: 12 }}>
        Pick a name and password. You'll be in Henesys within thirty seconds.
        Free forever, no pay-to-win.
      </p>

      {serverErr && (
        <div className="banner-alert error" style={{ marginBottom: 12 }}>
          <span className="ico">✕</span>
          <div>{serverErr}</div>
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="maple-field">
          <label>USERNAME <span className="hint">{name.length}/13</span></label>
          <input
            className="maple-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            placeholder="MapleHero42"
            maxLength={13}
            autoFocus
          />
          {touched.name && nameErr && <div className="err">⚠ {nameErr}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="maple-field">
            <label>PASSWORD</label>
            <input
              className="maple-input"
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, pwd: true }))}
              placeholder="••••••••"
              minLength={6}
            />
            {touched.pwd && pwdErr && <div className="err">⚠ {pwdErr}</div>}
            {pwd && (
              <div style={{ marginTop: 4 }}>
                <div style={{
                  display: 'flex', gap: 2, height: 6,
                  border: '2px solid #1a0a04', background: '#1a0a04'
                }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      flex: 1,
                      background: i <= pwdScore ? STRENGTH_COLOR[pwdScore] : '#3a2418'
                    }} />
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: STRENGTH_COLOR[pwdScore], marginTop: 4 }}>
                  {STRENGTH_LABEL[pwdScore]}
                </div>
              </div>
            )}
          </div>
          <div className="maple-field">
            <label>CONFIRM
              <span className="hint" style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                onClick={() => setShow(!show)}>
                {show ? '🙈 hide' : '👁 show'}
              </span>
            </label>
            <input
              className="maple-input"
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
              placeholder="repeat password"
            />
            {touched.confirm && confirmErr && <div className="err">⚠ {confirmErr}</div>}
          </div>
        </div>

        <div className="maple-field">
          <label>EMAIL <span className="hint">for password resets</span></label>
          <input
            className="maple-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="adventurer@maplemail.com"
          />
          {touched.email && emailErr && <div className="err">⚠ {emailErr}</div>}
        </div>

        <label className="maple-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
          </span>
        </label>

        <button
          type="submit"
          className="maple-btn primary"
          disabled={submitting}
          style={{ justifyContent: 'center', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'wait' : 'pointer' }}
        >
          {submitting ? '⏳ CREATING…' : '+ CREATE ACCOUNT'}
        </button>

        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 19, color: '#4a3220' }}>
          Already have one? <a href="login.html" style={{ color: '#c64b1b', fontWeight: 700, textDecoration: 'underline dotted' }}>Sign in →</a>
        </div>
      </form>
    </NpcBox>
  );
}

function RegisterApp() {
  return (
    <>
      <TopBar active="register" />

      <section className="page-hero">
        <img className="floating-sprite bobbing" style={{ top: 24, left: '8%', width: 56 }}
          src={`${MAPLE_BASE}/mobs/slime.gif`} alt="" />
        <img className="floating-sprite bobbing" style={{ top: 70, right: '10%', width: 48, animationDelay: '0.4s' }}
          src={`${MAPLE_BASE}/mobs/pig.gif`} alt="" />
        <span className="sparkle" style={{ top: 50, left: '40%', fontSize: 18 }}>✦</span>

        <div className="container">
          <SectionBanner>WELCOME · NEW ADVENTURER</SectionBanner>
          <h1 className="hero-title" style={{ fontSize: 'clamp(22px, 3.6vw, 38px)' }}>Create your account</h1>
          <div style={{ marginTop: 14, marginBottom: 24 }}>
            <span className="hero-sub">
              Pick a name. Pick a password. You're playing in thirty seconds.
            </span>
          </div>

          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <RegisterCard />
          </div>
        </div>
      </section>

      <MapleFooter />
      <FloatingMobs />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<RegisterApp />);
