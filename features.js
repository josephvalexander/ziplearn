// features.js — TABS (tab router), ADVENTURE_MAP, PET (growing companion)
/* jshint esversion:6 */

const TABS = (() => {
  const SCREENS = { home:'scr-home', map:'scr-map', pet:'scr-pet' };
  const TAGLINES = { home:'FAST · FUN · SMART', map:'ADVENTURE MAP', pet:'MY PET' };
  let current = 'home';

  function show(tab) {
    // Hide ALL screens, then show only the target tab
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const next = document.getElementById(SCREENS[tab]);
    if (next) next.classList.add('active');
    current = tab;

    // Update global header tagline
    const tagline = document.querySelector('.logo-tagline');
    if (tagline) tagline.textContent = TAGLINES[tab] || TAGLINES.home;

    // Hide back button — tabs don't use it
    const backBtn = document.getElementById('nav-back');
    if (backBtn) { backBtn.style.display = 'none'; backBtn.classList.remove('show'); }

    // Sync XP in header
    const xpEl = document.getElementById('hdr-xp');
    if (xpEl) xpEl.textContent = APP.state.xp;

    // Mark active state on all bottom-nav buttons across all three navs
    document.querySelectorAll('.bnav-btn').forEach(b => {
      b.classList.toggle('bnav-active', b.dataset.tab === tab);
    });

    if (tab === 'map') ADVENTURE_MAP.render();
    if (tab === 'pet') PET.render();
  }

  // Override goHome to show home tab and refresh stats
  APP.nav.goHome = function() { show('home'); if(typeof APP.refreshStats==='function') APP.refreshStats(); };

  return { show, current: () => current };
})();

// ================================================================
// ADVENTURE MAP — 4 worlds matching 4 classes
// ================================================================
const ADVENTURE_MAP = (() => {
  const WORLDS = [
    { class:1, name:'Counting Village',   region:'CLASS 1', icon:'🏡', color:'#ff6b35',
      desc:'Where every number has a home and shapes come to life!',
      topics:['Counting','Addition','Subtraction','Shapes','Patterns'] },
    { class:2, name:'Number Forest',      region:'CLASS 2', icon:'🌲', color:'#2ed573',
      desc:'Tall trees of tens and units, where multiplication sprouts!',
      topics:['Place Value','Multiplication','Fractions','Measurement','Time'] },
    { class:3, name:'Fraction Mountains', region:'CLASS 3', icon:'⛰️', color:'#818cf8',
      desc:'Climb peaks of division and conquer the fraction cliffs!',
      topics:['4-digit Numbers','Division','Fractions','Perimeter','Bar Graphs'] },
    { class:4, name:'Champion Castle',    region:'CLASS 4', icon:'🏰', color:'#ffd700',
      desc:'The ultimate fortress of large numbers and geometry!',
      topics:['Lakhs','Long Division','Angles','Area','Roman Numerals'] },
  ];

  function getProgress(classNum) {
    // Count how many games have been played for this class
    // We track via localStorage key zl_played_c{n}
    const played = JSON.parse(localStorage.getItem(`zl_played_c${classNum}`) || '[]');
    const totalGames = (window.GAME_REGISTRY?.math?.[classNum]?.length) || 12;
    return { played: played.length, total: totalGames };
  }

  function isUnlocked(classNum) {
    if (classNum === 1) return true;
    const prev = getProgress(classNum - 1);
    return prev.played >= Math.floor(prev.total * 0.5); // unlock when 50% of previous done
  }

  function render() {
    const wrap = document.getElementById('world-map-wrap');
    if (!wrap) return;

    const currentClass = APP.state.selectedClass || 1;
    let html = '';

    WORLDS.forEach((w, idx) => {
      const unlocked = isUnlocked(w.class);
      const prog = getProgress(w.class);
      const pct = Math.round((prog.played / prog.total) * 100);
      const done = pct >= 100;
      const isCurrent = w.class === currentClass;

      let badgeClass = 'wbg-locked', badgeText = '🔒 LOCKED';
      if (done)         { badgeClass = 'wbg-done';    badgeText = '✅ COMPLETE'; }
      else if (unlocked){ badgeClass = 'wbg-current';
                          badgeText = isCurrent ? '▶ CURRENT' : '🔓 UNLOCKED'; }

      if (idx > 0) {
        html += `<div class="world-connector">
          <div class="world-connector-inner">
            <div class="wcon-line"></div>
            <div class="wcon-dot"></div>
            <div class="wcon-line"></div>
          </div>
        </div>`;
      }

      const iconBg = unlocked ? `background:${w.color}22;` : 'background:var(--bg-hud);';
      const glowStyle = (unlocked && !done) ? `style="--wcolor:${w.color}" ` : '';

      html += `
        <div class="world-card ${unlocked?'':'wlocked'} ${isCurrent&&unlocked?'wcurrent':''} ${done?'wdone':''}"
             onclick="${unlocked ? `nav.openClass(${w.class})` : 'void(0)'}">
          <div class="world-icon ${unlocked&&!done?'world-icon-glow':''}" ${glowStyle}style="${iconBg}border-radius:16px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">
            ${done ? '🏆' : unlocked ? w.icon : '🔒'}
          </div>
          <div class="world-info">
            <div class="world-name">${w.name}</div>
            <div class="world-region">${w.region}</div>
            ${unlocked ? `
              <div class="world-pbar-wrap">
                <div class="world-pbar" style="width:${pct}%;background:${done?'var(--success)':w.color}"></div>
              </div>
              <div class="world-pbar-label">${prog.played}/${prog.total} games · ${pct}%</div>
            ` : `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Complete Class ${w.class-1} to unlock</div>`}
          </div>
          <div class="world-badge ${badgeClass}">${badgeText}</div>
        </div>`;
    });

    wrap.innerHTML = html;
  }

  // Track games played per class
  function trackGamePlayed(classNum, gameId) {
    const key = `zl_played_c${classNum}`;
    const played = JSON.parse(localStorage.getItem(key) || '[]');
    if (!played.includes(gameId)) {
      played.push(gameId);
      localStorage.setItem(key, JSON.stringify(played));
    }
  }

  return { render, trackGamePlayed, getProgress, isUnlocked };
})();

// Hook game completion into ADVENTURE_MAP tracker
document.addEventListener('lv:correct', () => {
  if (APP.state.selectedGame && APP.state.selectedClass) {
    // Track after first correct answer as "started"
  }
}, false);

// Track on reward shown (game completed)
const _origOnRewardShown = window.onRewardShown;
window.onRewardShown = function() {
  if (APP.state.selectedGame && APP.state.selectedClass) {
    ADVENTURE_MAP.trackGamePlayed(APP.state.selectedClass, APP.state.selectedGame);
  }
  if (typeof _origOnRewardShown === 'function') _origOnRewardShown();
};

// ================================================================
// PET — Growing companion, Tamagotchi-style
// ================================================================
const PET = (() => {
  const KEY = 'zl_pet';
  const XP_PER_FEED = 20; // XP needed to unlock one "feed"

  // Evolution stages: [minXP, emoji, stageName, evoLabel, color]
  const EVOS = [
    { xp:0,    icon:'🥚', stage:'Egg',       label:'Hatch me!',          color:'#a78bfa' },
    { xp:50,   icon:'🐣', stage:'Hatchling', label:'Just hatched!',      color:'#ffd700' },
    { xp:150,  icon:'🐤', stage:'Chick',     label:'Growing fast!',      color:'#ff9500' },
    { xp:350,  icon:'🦜', stage:'Parrot',    label:'Getting colourful!', color:'#2ed573' },
    { xp:700,  icon:'🦅', stage:'Eagle',     label:'Soaring high!',      color:'#818cf8' },
    { xp:1200, icon:'🐲', stage:'Dragon',    label:'Legendary!',         color:'#ff6b35' },
    { xp:2000, icon:'🔥', stage:'Phoenix',   label:'IMMORTAL!',          color:'#ffd700' },
  ];

  const SPEECHES = {
    happy:   ['I love learning! ❤️', 'You\'re amazing! 🌟', 'Keep going! ⚡', 'Yummy brain food! 🧠'],
    hungry:  ['Feed me please! 🍖', 'I\'m so hungry! 😢', 'Play a game to feed me!', 'I need XP! ⭐'],
    fed:     ['Yum yum! 😋', 'So tasty! 🍖', 'Thank you! 💛', 'More please! 😄'],
    levelup: ['I\'M EVOLVING! ✨', 'WOW I GREW! 🌟', 'Level UP! 🚀', 'So powerful now! ⚡'],
    idle:    ['Hi there! 👋', 'Play with me! 🎮', 'I love maths! 🔢', 'Let\'s go! ⚡'],
  };

  function load() {
    const def = { xp:0, hunger:100, happiness:80, lastFed:null, lastVisit:null, evoIdx:0, feedsAvail:0, totalXpGiven:0 };
    try { return { ...def, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch(e) { return def; }
  }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  function getEvo(xp) {
    let e = EVOS[0];
    for (const ev of EVOS) { if (xp >= ev.xp) e = ev; else break; }
    return e;
  }

  function decay(d) {
    // Hunger decays 10 pts per 12 hours, happiness decays 5 pts per day
    const now = Date.now();
    if (!d.lastVisit) { d.lastVisit = now; return d; }
    const hoursPassed = (now - d.lastVisit) / 3600000;
    d.hunger    = Math.max(0, d.hunger    - (hoursPassed / 12) * 10);
    d.happiness = Math.max(0, d.happiness - (hoursPassed / 24) * 5);
    d.lastVisit = now;
    return d;
  }

  function syncXPFeeds(d) {
    // Every XP_PER_FEED XP earned = 1 feed available
    const xp = APP.state.xp;
    const feedsEarned = Math.floor(xp / XP_PER_FEED);
    const feedsGiven  = d.totalXpGiven || 0;
    d.feedsAvail = Math.max(0, feedsEarned - feedsGiven);
    d.xp = xp; // mirror total XP into pet
    return d;
  }

  function drawSVG(evo, hunger, happy) {
    const svg = document.getElementById('pet-svg');
    if (!svg) return;
    const mood = hunger < 25 ? 'hungry' : happy < 30 ? 'sad' : 'happy';
    const col = evo.color;
    const lighten = col + '44';

    // Unique SVG art for each stage
    const arts = {
      '🥚': `<ellipse cx="75" cy="85" rx="42" ry="52" fill="${col}" opacity="0.9"/>
              <ellipse cx="75" cy="75" rx="34" ry="40" fill="${lighten}"/>
              <ellipse cx="62" cy="68" rx="7" ry="9" fill="rgba(255,255,255,0.4)"/>
              ${mood==='hungry'?`<path d="M60,100 Q75,94 90,100" stroke="rgba(0,0,0,0.3)" stroke-width="2.5" fill="none"/>`
              :`<path d="M60,100 Q75,108 90,100" stroke="rgba(0,0,0,0.3)" stroke-width="2.5" fill="none"/>`}`,

      '🐣': `<ellipse cx="75" cy="90" rx="40" ry="38" fill="${col}" opacity="0.85"/>
              <ellipse cx="75" cy="72" rx="28" ry="30" fill="${col}"/>
              <circle cx="65" cy="68" r="5" fill="#1a0533"/><circle cx="85" cy="68" r="5" fill="#1a0533"/>
              <circle cx="63" cy="66" r="2" fill="white"/><circle cx="83" cy="66" r="2" fill="white"/>
              <ellipse cx="75" cy="80" rx="10" ry="7" fill="#ff9500"/>
              ${mood==='hungry'?`<path d="M62,88 Q75,83 88,88" stroke="#1a0533" stroke-width="2" fill="none"/>`
              :`<path d="M62,88 Q75,95 88,88" stroke="#1a0533" stroke-width="2" fill="none"/>`}
              <ellipse cx="40" cy="88" rx="18" ry="12" fill="${lighten}" transform="rotate(-20,40,88)"/>
              <ellipse cx="110" cy="88" rx="18" ry="12" fill="${lighten}" transform="rotate(20,110,88)"/>`,

      '🐤': `<ellipse cx="75" cy="88" rx="38" ry="35" fill="${col}" opacity="0.9"/>
              <circle cx="75" cy="66" r="26" fill="${col}"/>
              <circle cx="65" cy="62" r="5.5" fill="#1a0533"/><circle cx="85" cy="62" r="5.5" fill="#1a0533"/>
              <circle cx="63" cy="60" r="2" fill="white"/><circle cx="83" cy="60" r="2" fill="white"/>
              <ellipse cx="75" cy="74" rx="9" ry="6" fill="#ff9500"/>
              ${mood==='hungry'?`<path d="M62,83 Q75,77 88,83" stroke="#1a0533" stroke-width="2.5" fill="none"/>`
              :`<path d="M62,83 Q75,91 88,83" stroke="#1a0533" stroke-width="2.5" fill="none"/>`}
              <path d="M37,80 Q28,65 40,58 Q52,70 48,83 Z" fill="${lighten}"/>
              <path d="M113,80 Q122,65 110,58 Q98,70 102,83 Z" fill="${lighten}"/>
              <path d="M60,118 L75,105 L90,118" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round"/>`,

      '🦜': `<ellipse cx="75" cy="95" rx="32" ry="30" fill="${col}" opacity="0.85"/>
              <circle cx="75" cy="65" r="24" fill="${col}"/>
              <circle cx="65" cy="60" r="5" fill="#1a0533"/><circle cx="85" cy="60" r="5" fill="#1a0533"/>
              <circle cx="63" cy="58" r="2" fill="white"/><circle cx="83" cy="58" r="2" fill="white"/>
              <path d="M68,72 L75,78 L82,72 L78,68 L72,68 Z" fill="#ff6b35"/>
              ${mood==='hungry'?`<path d="M60,82 Q75,76 90,82" stroke="#1a0533" stroke-width="2" fill="none"/>`
              :`<path d="M60,82 Q75,90 90,82" stroke="#1a0533" stroke-width="2" fill="none"/>`}
              <path d="M43,85 C30,70 25,55 38,50 C48,46 55,62 52,80 Z" fill="#ff6b35"/>
              <path d="M107,85 C120,70 125,55 112,50 C102,46 95,62 98,80 Z" fill="#2ed573"/>
              <path d="M65,120 C60,130 55,138 50,135" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/>
              <path d="M85,120 C90,130 95,138 100,135" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/>`,

      '🦅': `<ellipse cx="75" cy="98" rx="28" ry="26" fill="${col}" opacity="0.8"/>
              <circle cx="75" cy="60" r="22" fill="${col}"/>
              <circle cx="65" cy="56" r="5" fill="#1a0533"/><circle cx="85" cy="56" r="5" fill="#1a0533"/>
              <circle cx="63" cy="54" r="2.5" fill="white"/><circle cx="83" cy="54" r="2.5" fill="white"/>
              <path d="M68,68 L75,75 L82,68 L79,63 L71,63 Z" fill="#ffd700"/>
              ${mood==='hungry'?`<path d="M61,78 Q75,72 89,78" stroke="#1a0533" stroke-width="2" fill="none"/>`
              :`<path d="M61,78 Q75,86 89,78" stroke="#1a0533" stroke-width="2" fill="none"/>`}
              <path d="M47,90 C25,75 15,50 30,42 C45,35 55,58 52,85 Z" fill="${lighten}"/>
              <path d="M103,90 C125,75 135,50 120,42 C105,35 95,58 98,85 Z" fill="${lighten}"/>
              <path d="M60,120 L50,140 M75,124 L75,144 M90,120 L100,140" stroke="${col}" stroke-width="4" stroke-linecap="round" fill="none"/>`,

      '🐲': `<ellipse cx="75" cy="100" rx="35" ry="32" fill="${col}" opacity="0.8"/>
              <ellipse cx="75" cy="62" rx="26" ry="24" fill="${col}"/>
              <circle cx="63" cy="57" r="6" fill="#1a0533"/><circle cx="87" cy="57" r="6" fill="#1a0533"/>
              <circle cx="61" cy="55" r="2.5" fill="white"/><circle cx="85" cy="55" r="2.5" fill="white"/>
              <ellipse cx="75" cy="71" rx="8" ry="5" fill="#ff4757"/>
              ${mood==='hungry'?`<path d="M59,82 Q75,76 91,82" stroke="#1a0533" stroke-width="2.5" fill="none"/>`
              :`<path d="M59,82 Q75,91 91,82" stroke="#1a0533" stroke-width="2.5" fill="none"/>`}
              <path d="M62,40 L67,52 M75,36 L75,50 M88,40 L83,52" stroke="#ffd700" stroke-width="3" stroke-linecap="round" fill="none"/>
              <path d="M35,95 C10,75 5,45 25,40 C42,36 50,65 47,92 Z" fill="${col}" opacity="0.7"/>
              <path d="M115,95 C140,75 145,45 125,40 C108,36 100,65 103,92 Z" fill="${col}" opacity="0.7"/>
              <path d="M65,128 C55,145 48,155 42,150 M85,128 C95,145 102,155 108,150" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/>`,

      '🔥': `<circle cx="75" cy="75" r="50" fill="${col}" opacity="0.12"/>
              <path d="M75,30 C75,30 95,55 90,75 C108,58 110,80 95,100 C90,115 55,115 55,115 C40,115 30,100 35,82 C25,90 28,108 35,115 C20,105 18,85 30,70 C22,60 35,45 50,52 C50,38 65,25 75,30 Z" fill="${col}" opacity="0.9"/>
              <path d="M75,55 C75,55 87,68 84,80 C92,72 93,84 86,94 C82,102 62,102 60,94 C53,86 58,74 65,72 C62,64 68,54 75,55 Z" fill="#ffd700" opacity="0.85"/>
              <ellipse cx="75" cy="95" rx="12" ry="8" fill="white" opacity="0.7"/>
              <circle cx="70" cy="93" r="3.5" fill="#1a0533"/><circle cx="80" cy="93" r="3.5" fill="#1a0533"/>
              <circle cx="69" cy="92" r="1.2" fill="white"/><circle cx="79" cy="92" r="1.2" fill="white"/>
              ${mood==='hungry'?`<path d="M65,102 Q75,97 85,102" stroke="#1a0533" stroke-width="2" fill="none"/>`
              :`<path d="M65,102 Q75,108 85,102" stroke="#1a0533" stroke-width="2" fill="none"/>`}`,
    };

    svg.innerHTML = arts[evo.icon] || arts['🥚'];

    // Hunger visual overlay — slightly desaturate when hungry
    if (hunger < 25) {
      svg.style.filter = 'saturate(0.5) brightness(0.85)';
      svg.classList.add('pet-anim-sad');
      setTimeout(()=>svg.classList.remove('pet-anim-sad'),700);
    } else {
      svg.style.filter = '';
    }
  }

  function renderEvoTrack(d) {
    const row = document.getElementById('evo-row');
    if (!row) return;
    const cur = getEvo(d.xp);
    row.innerHTML = EVOS.map((e,i) => {
      const reached = d.xp >= e.xp;
      const isCur   = e.icon === cur.icon;
      return `<div class="evo-pip ${reached?'ep-reached':''} ${isCur?'ep-current':''}">
        <div class="evo-pip-dot">${reached ? e.icon : '?'}</div>
        <div class="evo-pip-lbl">${e.stage}</div>
      </div>`;
    }).join('');
  }

  function renderBars(d) {
    const hBar = document.getElementById('pbar-hunger');
    const hLbl = document.getElementById('pbar-hunger-lbl');
    const jBar = document.getElementById('pbar-happy');
    const jLbl = document.getElementById('pbar-happy-lbl');
    const xBar = document.getElementById('pbar-xp');
    const xLbl = document.getElementById('pbar-xp-lbl');

    if (hBar) hBar.style.width = Math.round(d.hunger) + '%';
    if (hLbl) hLbl.textContent = d.hunger > 70 ? 'Full' : d.hunger > 40 ? 'Peckish' : d.hunger > 15 ? 'Hungry!' : 'Starving!';
    if (jBar) jBar.style.width = Math.round(d.happiness) + '%';
    if (jLbl) jLbl.textContent = d.happiness > 70 ? 'Happy' : d.happiness > 40 ? 'Okay' : 'Sad 😢';

    const curEvo = getEvo(d.xp);
    const nextEvo = EVOS.find(e => e.xp > d.xp);
    if (xBar && nextEvo) {
      const pct = ((d.xp - curEvo.xp) / (nextEvo.xp - curEvo.xp)) * 100;
      xBar.style.width = Math.min(100, Math.round(pct)) + '%';
      if (xLbl) xLbl.textContent = `${d.xp - curEvo.xp}/${nextEvo.xp - curEvo.xp}`;
    } else if (xBar) {
      xBar.style.width = '100%';
      if (xLbl) xLbl.textContent = 'MAX!';
    }
  }

  function renderFeedBtn(d) {
    const btn = document.getElementById('pet-feed-btn');
    if (!btn) return;
    const avail = d.feedsAvail || 0;
    btn.disabled = avail <= 0;
    btn.textContent = avail > 0 ? `🍖 Feed (${avail} left)` : '🍖 Play to earn feeds!';
  }

  function speak(pool) {
    const msgs = SPEECHES[pool] || SPEECHES.idle;
    const bubble = document.getElementById('pet-speech');
    if (!bubble) return;
    bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    bubble.classList.add('show');
    clearTimeout(bubble._t);
    bubble._t = setTimeout(() => bubble.classList.remove('show'), 2400);
  }

  function checkHungerBadge(d) {
    const dot = document.getElementById('pet-hunger-dot');
    if (dot) dot.style.display = d.hunger < 30 ? 'flex' : 'none';
    // Update pet icon in bottom navs
    const evo = getEvo(d.xp);
    ['bnav-pet-icon','map-pet-icon','pet-pet-icon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = evo.icon;
    });
  }

  function render() {
    let d = load();
    d = decay(d);
    d = syncXPFeeds(d);
    save(d);

    const evo = getEvo(d.xp);

    const stageLbl = document.getElementById('pet-stage-lbl');
    const nameLbl  = document.getElementById('pet-name-el');
    const evoTxt   = document.getElementById('pet-evo-txt');
    const xpHdr    = document.getElementById('pet-xp-hdr');

    if (stageLbl) stageLbl.textContent = evo.stage.toUpperCase();
    if (nameLbl)  nameLbl.textContent  = 'Zippy';
    if (evoTxt)   evoTxt.textContent   = evo.label;
    if (xpHdr)    xpHdr.textContent    = d.xp;

    drawSVG(evo, d.hunger, d.happiness);
    renderEvoTrack(d);
    renderBars(d);
    renderFeedBtn(d);
    checkHungerBadge(d);

    // Tip text
    const tipTitle = document.getElementById('pet-tip-title');
    const tipBody  = document.getElementById('pet-tip-body');
    if (d.hunger < 30 && tipTitle) {
      tipTitle.textContent = '⚠️ Zippy is hungry!';
      if (tipBody) tipBody.textContent = ' Play games to earn XP, then come back to feed Zippy!';
    } else if (d.feedsAvail > 0 && tipTitle) {
      tipTitle.textContent = `🍖 You have ${d.feedsAvail} feed${d.feedsAvail>1?'s':''}!`;
      if (tipBody) tipBody.textContent = ' Tap the Feed button to give Zippy a treat and boost happiness!';
    }

    // Idle speech
    setTimeout(() => speak(d.hunger < 25 ? 'hungry' : 'idle'), 600);
  }

  function feed() {
    let d = load();
    d = syncXPFeeds(d);
    if ((d.feedsAvail || 0) <= 0) return;
    d.feedsAvail--;
    d.totalXpGiven = (d.totalXpGiven || 0) + 1;
    d.hunger    = Math.min(100, d.hunger + 30);
    d.happiness = Math.min(100, d.happiness + 20);
    d.lastFed   = Date.now();
    save(d);

    // Animate
    const svg = document.getElementById('pet-svg');
    if (svg) {
      svg.classList.remove('pet-anim-fed','pet-anim-happy');
      void svg.offsetWidth;
      svg.classList.add('pet-anim-fed');
      setTimeout(() => svg.classList.remove('pet-anim-fed'), 900);
    }
    speak('fed');
    PARTICLES.burst(window.innerWidth/2, window.innerHeight*0.4, 12, ['#ffd700','#ff9500','#ff6b35','#2ed573']);
    SOUND.correct();

    // Check evolution
    const oldEvo = getEvo(d.xp);
    const newEvo = getEvo(APP.state.xp);
    if (newEvo.xp > oldEvo.xp) speak('levelup');

    render();
  }

  // Called when XP is earned — sync feeds available
  function onXPEarned() {
    let d = load();
    d = syncXPFeeds(d);
    save(d);
    checkHungerBadge(d);
    // Update pet icon in navs to reflect evolution
    const evo = getEvo(APP.state.xp);
    ['bnav-pet-icon','map-pet-icon','pet-pet-icon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = evo.icon;
    });
  }

  return { render, feed, onXPEarned, speak, getEvo, load };
})();

// Hook PET.onXPEarned into the reward flow via MutationObserver on reward-overlay
// (reward-overlay already has one observer from gamification — add another)
new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.target.id === 'reward-overlay' && m.target.classList.contains('show')) {
      PET.onXPEarned();
      ADVENTURE_MAP.render(); // refresh map progress too
      break;
    }
  }
}).observe(document.getElementById('reward-overlay'), {attributes:true,attributeFilter:['class']});

// Init on load
setTimeout(() => {
  PET.render();
  ADVENTURE_MAP.render();
}, 300);

</script>
