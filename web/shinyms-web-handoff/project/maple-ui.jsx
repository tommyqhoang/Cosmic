// MapleStory-themed UI primitives for ShinyMS
// Exports to window: NpcBox, StatBar, InvSlot, JobIcon, SectionBanner, ChatBubble, FloatingMobs, TopBar, MapleFooter, CharAvatar, charForJob

const MAPLE_BASE = 'https://shinyms.com/maple';

// ----- Character avatar -------------------------------------------------
// Stylized class portrait drawn entirely in SVG so we never depend on
// half-loaded character sprites. Each class has its own color + glyph.
const CLASS_THEMES = {
  warrior:  { color: '#e23b3b', shade: '#8a1818', glyph: '⚔',  name: 'Warrior'  },
  hero:     { color: '#e23b3b', shade: '#8a1818', glyph: '⚔',  name: 'Hero'     },
  paladin:  { color: '#dca830', shade: '#6a4f1a', glyph: '🛡',  name: 'Paladin'  },
  dk:       { color: '#8a3030', shade: '#4a1010', glyph: '🔱',  name: 'Dark Knight' },
  magician: { color: '#2e80e2', shade: '#143d80', glyph: '✨',  name: 'Magician' },
  bishop:   { color: '#f0d878', shade: '#a08018', glyph: '✝',  name: 'Bishop'   },
  fp:       { color: '#c64b1b', shade: '#6a1010', glyph: '🔥',  name: 'F/P Mage' },
  il:       { color: '#5cb0e2', shade: '#143d80', glyph: '❄',  name: 'I/L Mage' },
  bowman:   { color: '#4caf30', shade: '#1e5208', glyph: '🏹',  name: 'Bowman'   },
  bm:       { color: '#4caf30', shade: '#1e5208', glyph: '🏹',  name: 'Bowmaster' },
  mm:       { color: '#3aa078', shade: '#0a4830', glyph: '🎯',  name: 'Marksman' },
  thief:    { color: '#8030a0', shade: '#3a0a48', glyph: '🗡', name: 'Thief'    },
  nightlord:{ color: '#5018a8', shade: '#1c0640', glyph: '☄',  name: 'Night Lord' },
  shadower: { color: '#6c3098', shade: '#2a0a3a', glyph: '🌙', name: 'Shadower' },
  pirate:   { color: '#f8a020', shade: '#a05808', glyph: '⚓',  name: 'Pirate'   },
  buccaneer:{ color: '#c87018', shade: '#683008', glyph: '👊', name: 'Buccaneer' },
  corsair:  { color: '#f8c34a', shade: '#a06808', glyph: '🔫', name: 'Corsair'  },
  gm:       { color: '#c64b1b', shade: '#6a1010', glyph: '🍁', name: 'GM'       },
  npc:      { color: '#4a3220', shade: '#1a0a04', glyph: '💬', name: 'NPC'      },
  cygnus:   { color: '#88a0e2', shade: '#3a4a8a', glyph: '👸', name: 'Cygnus'   },
};

// Pick a sprite from the working mobs/items pack, never the broken /avatars/ path.
const FALLBACK_SPRITE = {
  warrior:  `${MAPLE_BASE}/mobs/orange-mushroom.gif`,
  hero:     `${MAPLE_BASE}/mobs/orange-mushroom.gif`,
  paladin:  `${MAPLE_BASE}/mobs/ribbon-pig.gif`,
  dk:       `${MAPLE_BASE}/mobs/balrog.gif`,
  magician: `${MAPLE_BASE}/mobs/slime.gif`,
  bishop:   `${MAPLE_BASE}/mobs/slime.gif`,
  fp:       `${MAPLE_BASE}/mobs/orange-mushroom.gif`,
  il:       `${MAPLE_BASE}/mobs/slime.gif`,
  bowman:   `${MAPLE_BASE}/mobs/green-mushroom.gif`,
  bm:       `${MAPLE_BASE}/mobs/green-mushroom.gif`,
  mm:       `${MAPLE_BASE}/mobs/green-mushroom.gif`,
  thief:    `${MAPLE_BASE}/mobs/stump.gif`,
  nightlord:`${MAPLE_BASE}/mobs/stump.gif`,
  shadower: `${MAPLE_BASE}/mobs/stump.gif`,
  pirate:   `${MAPLE_BASE}/mobs/pig.gif`,
  buccaneer:`${MAPLE_BASE}/mobs/pig.gif`,
  corsair:  `${MAPLE_BASE}/mobs/pig.gif`,
  gm:       `${MAPLE_BASE}/items/maple-leaf.png`,
  npc:      `${MAPLE_BASE}/items/maple-leaf.png`,
  cygnus:   `${MAPLE_BASE}/mobs/blue-snail.gif`,
};

function charForJob(job) {
  if (!job) return 'hero';
  const j = String(job).toLowerCase();
  if (j.includes('hero') || j.includes('warrior')) return 'hero';
  if (j.includes('paladin')) return 'paladin';
  if (j.includes('dark knight') || j.includes(' dk')) return 'dk';
  if (j.includes('night lord')) return 'nightlord';
  if (j.includes('shadower')) return 'shadower';
  if (j.includes('thief')) return 'thief';
  if (j.includes('bishop')) return 'bishop';
  if (j.includes('f/p')) return 'fp';
  if (j.includes('i/l')) return 'il';
  if (j.includes('magician')) return 'magician';
  if (j.includes('bowmaster') || j.includes('bow master')) return 'bm';
  if (j.includes('marksman')) return 'mm';
  if (j.includes('bowman')) return 'bowman';
  if (j.includes('buccaneer')) return 'buccaneer';
  if (j.includes('corsair')) return 'corsair';
  if (j.includes('pirate')) return 'pirate';
  if (j.includes('gm') || j.includes('admin')) return 'gm';
  if (j.includes('cygnus')) return 'cygnus';
  return 'npc';
}

function CharAvatar({ cls = 'hero', size = 72, label, glyph, frame = true }) {
  const t = CLASS_THEMES[cls] || CLASS_THEMES.hero;
  const px = size;
  return (
    <div
      style={{
        width: px, height: px, flex: `0 0 ${px}px`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(180deg, ${t.color} 0%, ${t.shade} 100%)`,
        border: frame ? '3px solid #1a0a04' : 'none',
        boxShadow: frame
          ? 'inset 2px 2px 0 rgba(255,255,255,0.35), inset -2px -2px 0 rgba(0,0,0,0.35), 3px 3px 0 rgba(0,0,0,0.3)'
          : 'none',
        color: '#fff8d8',
        fontFamily: 'var(--font-display)',
        position: 'relative',
        overflow: 'hidden',
      }}
      title={label || t.name}
    >
      <div style={{
        fontSize: Math.round(px * 0.45),
        lineHeight: 1,
        textShadow: '0 2px 0 rgba(0,0,0,0.35)',
      }}>
        {glyph || t.glyph}
      </div>
      {label !== false && (
        <div style={{
          fontSize: Math.max(7, Math.round(px * 0.11)),
          letterSpacing: 1,
          marginTop: Math.round(px * 0.06),
          textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
          textTransform: 'uppercase',
        }}>
          {label || t.name}
        </div>
      )}
      {/* Crosshatch shine */}
      <span style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(255,255,255,0.06) 6px 8px)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

function NpcBox({ title = 'NPC', npcSprite, npcName, npcCls, children, actions, closable = true }) {
  // If a sprite URL is passed AND it isn't from the broken /avatars/ path,
  // we still render it as an image. Otherwise use a CharAvatar tile.
  const useImg = npcSprite && !/\/avatars\//.test(npcSprite);
  const cls = npcCls || charForJob(npcName);
  return (
    <div className="npc-box">
      <div className="npc-box-title">
        <span>💬 {title}</span>
        {closable && <span className="close">✕</span>}
      </div>
      <div className="npc-box-body">
        {(useImg || npcSprite || npcName) && (
          <div className="npc-avatar" style={{ background: 'transparent', border: 0, boxShadow: 'none', padding: 0, width: 84, flex: '0 0 84px', height: 84, alignSelf: 'flex-start' }}>
            {useImg
              ? <img src={npcSprite} alt={npcName || 'NPC'} />
              : <CharAvatar cls={cls} size={84} label={false} />}
          </div>
        )}
        <div className="npc-text">
          {npcName && <span className="name">— {npcName} —</span>}
          {children}
        </div>
      </div>
      {actions && <div className="npc-actions">{actions}</div>}
    </div>
  );
}

function StatBar({ kind = 'hp', label, value, max, displayValue }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`stat-bar ${kind}`}>
      <div className="label">{label || kind.toUpperCase()}</div>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%` }}></div>
      </div>
      <div className="value">{displayValue || `${value} / ${max}`}</div>
    </div>
  );
}

function InvSlot({ icon, name, rarity, desc, count, onClick, alt }) {
  return (
    <div className="inv-slot" onClick={onClick} role="button" tabIndex={0}>
      {icon && <img src={icon} alt={alt || name} />}
      {count != null && <span className="count">{count}</span>}
      {name && (
        <div className="item-tooltip" style={{ left: '100%', top: 0, marginLeft: 6 }}>
          <div className="tt-name">{name}</div>
          {rarity && <div className="tt-rarity">{rarity}</div>}
          {desc && <div className="tt-desc">{desc}</div>}
        </div>
      )}
    </div>
  );
}

function JobIcon({ sprite, name, cls, alt }) {
  const useImg = sprite && !/\/avatars\//.test(sprite);
  const c = cls || charForJob(name);
  return (
    <div className="job-icon">
      <div className="sprite" style={{ width: 64, height: 64 }}>
        {useImg
          ? <img src={sprite} alt={alt || name} />
          : <CharAvatar cls={c} size={64} label={false} />}
      </div>
      <div className="name">{name}</div>
    </div>
  );
}

function SectionBanner({ children }) {
  return <div className="section-banner">{children}</div>;
}

function ChatBubble({ speaker, children, style }) {
  return (
    <div className="chat-bubble" style={style}>
      {speaker && <span className="speaker">{speaker}</span>}
      {children}
    </div>
  );
}

// Parade of mobs walking across the bottom of the page
function FloatingMobs() {
  const mobs = [
    { src: `${MAPLE_BASE}/mobs/orange-mushroom.gif`, name: 'Orange Mushroom', delay: 0, duration: 28 },
    { src: `${MAPLE_BASE}/mobs/snail.gif`, name: 'Snail', delay: 5, duration: 38 },
    { src: `${MAPLE_BASE}/mobs/slime.gif`, name: 'Slime', delay: 11, duration: 24 },
    { src: `${MAPLE_BASE}/mobs/pig.gif`, name: 'Pig', delay: 16, duration: 30 },
    { src: `${MAPLE_BASE}/mobs/blue-snail.gif`, name: 'Blue Snail', delay: 22, duration: 40 },
    { src: `${MAPLE_BASE}/mobs/green-mushroom.gif`, name: 'Green Mushroom', delay: 28, duration: 26 },
  ];
  return (
    <div className="mob-parade" aria-hidden="true">
      {mobs.map((m, i) => (
        <img
          key={i}
          src={m.src}
          alt=""
          className="mob"
          style={{
            animation: `walk-right ${m.duration}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function TopBar({ active = 'home' }) {
  return (
    <div className="top-bar">
      <a href="index.html" className="brand">
        <img className="leaf" src={`${MAPLE_BASE}/items/maple-leaf.png`} alt="" />
        SHINY<span style={{ color: '#fff8d8' }}>MS</span>
      </a>
      <nav>
        <a href="index.html" className={active === 'home' ? 'active' : ''}>Home</a>
        <a href="news.html" className={active === 'news' ? 'active' : ''}>News</a>
        <a href="guide.html" className={active === 'guide' ? 'active' : ''}>Guide</a>
        <a href="highlights.html" className={active === 'highlights' ? 'active' : ''}>Highlights</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Rankings</a>
        <a href="vote.html" className={active === 'vote' ? 'active' : ''}>Vote</a>
      </nav>
      <div className="right">
        <span className="online-indicator">SERVER ONLINE</span>
        <a href="login.html" className="maple-btn sm">LOGIN</a>
        <a href="#" className="maple-btn sm primary" onClick={(e) => e.preventDefault()}>▶ PLAY</a>
      </div>
    </div>
  );
}

function MapleFooter() {
  return (
    <footer className="maple-footer">
      <div className="footer-grid">
        <div>
          <h4>
            <img src={`${MAPLE_BASE}/items/maple-leaf.png`} alt="" style={{ width: 18, verticalAlign: 'middle', marginRight: 6 }} />
            SHINYMS
          </h4>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 19, color: '#d8c08c', lineHeight: 1.3, margin: '0 0 12px' }}>
            A free, nostalgic MapleStory v83 private server. Play instantly in your browser — no download, no pay-to-win.
          </p>
          <a href="#" className="maple-btn sm primary" onClick={(e) => e.preventDefault()}>▶ PLAY NOW</a>
        </div>
        <div>
          <h4>PLAY</h4>
          <a href="#">Play Now</a>
          <a href="register.html">Create Account</a>
          <a href="login.html">Web Login</a>
          <a href="guide.html">Getting Started</a>
        </div>
        <div>
          <h4>COMMUNITY</h4>
          <a href="highlights.html">Highlights</a>
          <a href="#">Rankings</a>
          <a href="#">Guilds</a>
          <a href="vote.html">Vote</a>
          <a href="news.html">News</a>
          <a href="#">Discord</a>
        </div>
        <div>
          <h4>SERVER</h4>
          <a href="#">Status</a>
          <a href="#">Bosses</a>
          <a href="#">Drops</a>
          <a href="#">Characters</a>
        </div>
        <div>
          <h4>LEGAL</h4>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="legal">
        © 2026 ShinyMS — Fan-made server for nostalgic purposes.<br />
        Not affiliated with or endorsed by Nexon. MapleStory is a trademark of Nexon.
      </div>
    </footer>
  );
}

Object.assign(window, {
  MAPLE_BASE,
  NpcBox, StatBar, InvSlot, JobIcon, SectionBanner, ChatBubble,
  FloatingMobs, TopBar, MapleFooter,
  CharAvatar, charForJob, CLASS_THEMES, FALLBACK_SPRITE,
});
