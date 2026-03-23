// features.js — TABS, ADVENTURE_MAP, PET (Maths), CASTLE (English), LAB (Science)
/* jshint esversion:6 */

// ================================================================
// TABS — tab router for home / map / pet / castle / lab screens
// ================================================================
const TABS = (() => {
  const SCREENS  = { home:'scr-home', map:'scr-map', pet:'scr-pet', castle:'scr-castle', lab:'scr-lab', garden:'scr-garden' };
  const TAGLINES = { home:'FAST · FUN · SMART', map:'ADVENTURE MAP', pet:'MY PET 🐣', castle:'CASTLE BUILDER 🏰', lab:'SCIENCE LAB 🔬', garden:'MY GARDEN 🌿' };
  let current = 'home';

  function show(tab) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const next = document.getElementById(SCREENS[tab]);
    if (next) next.classList.add('active');
    current = tab;

    const tagline = document.querySelector('.logo-tagline');
    if (tagline) tagline.textContent = TAGLINES[tab] || TAGLINES.home;

    const backBtn = document.getElementById('nav-back');
    if (backBtn) { backBtn.style.display='none'; backBtn.classList.remove('show'); }

    const xpEl = document.getElementById('hdr-xp');
    if (xpEl) xpEl.textContent = APP.state.xp;

    document.querySelectorAll('.bnav-btn').forEach(b => {
      b.classList.toggle('bnav-active', b.dataset.tab === tab);
    });

    if (tab === 'map')    ADVENTURE_MAP.render();
    if (tab === 'pet')    PET.render();
    if (tab === 'castle') CASTLE.render();
    if (tab === 'lab')    LAB.render();
    if (tab === 'garden') GARDEN.render();
  }

  APP.nav.goHome = function() { show('home'); if(typeof APP.refreshStats==='function') APP.refreshStats(); };

  return { show, current: () => current };
})();

// ================================================================
// ADVENTURE MAP — worlds for all three subjects
// ================================================================
const ADVENTURE_MAP = (() => {
  // Three subject tracks, each with 4 worlds
  const TRACKS = {
    math: [
      { class:1, name:'Counting Village',   region:'MATHS · CLASS 1', icon:'🏡', color:'#ff6b35', desc:'Where every number has a home!' },
      { class:2, name:'Number Forest',      region:'MATHS · CLASS 2', icon:'🌲', color:'#2ed573', desc:'Tall trees of tens and units!' },
      { class:3, name:'Fraction Mountains', region:'MATHS · CLASS 3', icon:'⛰️', color:'#818cf8', desc:'Climb peaks of division!' },
      { class:4, name:'Champion Castle',    region:'MATHS · CLASS 4', icon:'🏰', color:'#ffd700', desc:'The ultimate fortress of large numbers!' },
    ],
    sci: [
      { class:1, name:'Discovery Garden',   region:'SCIENCE · CLASS 1', icon:'🌱', color:'#00d4aa', desc:'Discover living things all around you!' },
      { class:2, name:'Explorer Jungle',    region:'SCIENCE · CLASS 2', icon:'🦁', color:'#2ed573', desc:'Food chains and habitats await!' },
      { class:3, name:'Experiment Island',  region:'SCIENCE · CLASS 3', icon:'⚗️', color:'#33ddb8', desc:'Mix, observe and discover!' },
      { class:4, name:'Space Station',      region:'SCIENCE · CLASS 4', icon:'🚀', color:'#818cf8', desc:'Explore the cosmos and beyond!', badge:'new' },
    ],
    eng: [
      { class:1, name:'Alphabet Meadow',    region:'ENGLISH · CLASS 1', icon:'🌸', color:'#a855f7', desc:'Where letters bloom into words!' },
      { class:2, name:'Story Forest',       region:'ENGLISH · CLASS 2', icon:'📚', color:'#bf7fff', desc:'Every tree holds a tale!' },
      { class:3, name:'Grammar Peaks',      region:'ENGLISH · CLASS 3', icon:'✍️', color:'#c084fc', desc:'Master tenses and clauses!' },
      { class:4, name:'Author\'s Citadel',  region:'ENGLISH · CLASS 4', icon:'🏰', color:'#ffd700', desc:'Write your own epic story!', badge:'new' },
    ],
    evs: [
      { class:1, name:'Community Garden',   region:'EVS/GK · CLASS 1', icon:'🌻', color:'#22c55e', desc:'Plants, animals and helpers around us!' },
      { class:2, name:'Discovery Park',     region:'EVS/GK · CLASS 2', icon:'🦁', color:'#4ade80', desc:'India, the world and wild wonders!' },
      { class:3, name:'Knowledge Forest',   region:'EVS/GK · CLASS 3', icon:'🌳', color:'#16a34a', desc:'Geography, history and science GK!' },
      { class:4, name:'World Explorer HQ',  region:'EVS/GK · CLASS 4', icon:'🌍', color:'#ffd700', desc:'Master GK champion of the world!', badge:'new' },
    ],
  };

  function getProgress(subject, classNum) {
    const played = JSON.parse(localStorage.getItem(`zl_played_${subject}_c${classNum}`) || '[]');
    const total  = (GAME_REGISTRY[subject]?.[classNum]?.games?.length) || 12;
    return { played: played.length, total };
  }

  function isUnlocked(subject, classNum) {
    if (classNum === 1) return true;
    const prev = getProgress(subject, classNum - 1);
    return prev.played >= Math.floor(prev.total * 0.5);
  }

  function renderTrack(subject, wrap) {
    const worlds = TRACKS[subject];
    const currentClass = APP.state.selectedClass || 1;
    let html = '';

    // Subject header pill
    const subDef = SUBJECT_REGISTRY[subject];
    html += `<div class="map-subject-pill" style="background:${subDef.color}22;border:1px solid ${subDef.color}44">
      <span style="font-size:20px">${subDef.icon}</span>
      <span style="color:${subDef.color};font-weight:700;font-size:13px">${subDef.name.toUpperCase()}</span>
    </div>`;

    worlds.forEach((w, idx) => {
      const unlocked = isUnlocked(subject, w.class);
      const prog = getProgress(subject, w.class);
      const pct  = Math.round((prog.played / prog.total) * 100);
      const done = pct >= 100;
      const isCurrent = (w.class === currentClass && subject === (APP.state.selectedSubject || 'math'));

      let badgeClass = 'wbg-locked', badgeText = '🔒 LOCKED';
      if (done)          { badgeClass = 'wbg-done';    badgeText = '✅ COMPLETE'; }
      else if (unlocked) { badgeClass = 'wbg-current'; badgeText = isCurrent ? '▶ CURRENT' : '🔓 UNLOCKED'; }

      if (idx > 0) {
        html += `<div class="world-connector"><div class="world-connector-inner">
          <div class="wcon-line"></div><div class="wcon-dot"></div><div class="wcon-line"></div>
        </div></div>`;
      }

      html += `<div class="world-card ${unlocked?'':'wlocked'} ${isCurrent&&unlocked?'wcurrent':''} ${done?'wdone':''}"
           onclick="${unlocked ? `nav.openSubject('${subject}',${w.class})` : 'void(0)'}">
        <div class="world-icon ${unlocked&&!done?'world-icon-glow':''}"
             style="background:${unlocked?w.color+'22':'var(--bg-hud)'};border-radius:16px;width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">
          ${done ? '🏆' : unlocked ? w.icon : '🔒'}
        </div>
        <div class="world-info">
          <div class="world-name">${w.name} ${w.badge?'<span class="sp-badge live" style="font-size:9px">NEW</span>':''}</div>
          <div class="world-region">${w.region}</div>
          ${unlocked ? `
            <div class="world-pbar-wrap"><div class="world-pbar" style="width:${pct}%;background:${done?'var(--success)':w.color}"></div></div>
            <div class="world-pbar-label">${prog.played}/${prog.total} games · ${pct}%</div>
          ` : `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Complete Class ${w.class-1} to unlock</div>`}
        </div>
        <div class="world-badge ${badgeClass}">${badgeText}</div>
      </div>`;
    });

    return html;
  }

  function render() {
    const wrap = document.getElementById('world-map-wrap');
    if (!wrap) return;

    // Tab pills for subject selection
    const activeSubject = ADVENTURE_MAP._activeSubject || 'math';
    let html = `<div class="map-tab-row">
      ${['math','sci','eng','evs'].map(s => {
        const d = SUBJECT_REGISTRY[s];
        return `<button class="map-tab-btn ${s===activeSubject?'mta-active':''}" onclick="ADVENTURE_MAP.setSubject('${s}')"
                  style="${s===activeSubject?`background:${d.color}22;border-color:${d.color};color:${d.color}`:''}">
          ${d.icon} ${d.name.split(' ')[0]}
        </button>`;
      }).join('')}
    </div>`;

    html += renderTrack(activeSubject, wrap);
    wrap.innerHTML = html;
  }

  function setSubject(s) {
    ADVENTURE_MAP._activeSubject = s;
    render();
  }

  function trackGamePlayed(subject, classNum, gameId) {
    const key = `zl_played_${subject}_c${classNum}`;
    const played = JSON.parse(localStorage.getItem(key) || '[]');
    if (!played.includes(gameId)) { played.push(gameId); localStorage.setItem(key, JSON.stringify(played)); }
  }

  return { render, setSubject, trackGamePlayed, getProgress, isUnlocked, _activeSubject: 'math' };
})();

// Track on reward shown
const _origOnRewardShown = window.onRewardShown;
window.onRewardShown = function() {
  const subj = APP.state.selectedSubject || 'math';
  if (APP.state.selectedGame && APP.state.selectedClass) {
    ADVENTURE_MAP.trackGamePlayed(subj, APP.state.selectedClass, APP.state.selectedGame);
  }
  if (typeof _origOnRewardShown === 'function') _origOnRewardShown();
};

// ================================================================
// PET — Maths companion  (hatching & growing animal)
// ================================================================
const PET = (() => {
  const KEY = 'zl_pet';
  const XP_PER_FEED = 20;

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
    happy:  ['I love maths! ❤️','You\'re amazing! 🌟','Keep going! ⚡','Yummy brain food! 🧠'],
    hungry: ['Feed me please! 🍖','I\'m so hungry! 😢','Play a game to feed me!','I need XP! ⭐'],
    fed:    ['Yum yum! 😋','So tasty! 🍖','Thank you! 💛','More please! 😄'],
    levelup:['I\'M EVOLVING! ✨','WOW I GREW! 🌟','Level UP! 🚀','So powerful now! ⚡'],
    idle:   ['Hi there! 👋','Play with me! 🎮','I love maths! 🔢','Let\'s go! ⚡'],
  };

  function load(){const d={xp:0,hunger:100,happiness:80,lastFed:null,lastVisit:null,evoIdx:0,feedsAvail:0,totalXpGiven:0};try{return{...d,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return d}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
  function getEvo(xp){let e=EVOS[0];for(const ev of EVOS){if(xp>=ev.xp)e=ev;else break;}return e;}
  function decay(d){const now=Date.now();if(!d.lastVisit){d.lastVisit=now;return d;}const h=(now-d.lastVisit)/3600000;d.hunger=Math.max(0,d.hunger-(h/12)*10);d.happiness=Math.max(0,d.happiness-(h/24)*5);d.lastVisit=now;return d;}
  function syncXP(d){const xp=APP.state.xp;const fe=Math.floor(xp/XP_PER_FEED);d.feedsAvail=Math.max(0,fe-(d.totalXpGiven||0));d.xp=xp;return d;}

  function drawSVG(evo, hunger, happy) {
    const svg = document.getElementById('pet-svg');
    if (!svg) return;
    const mood = hunger < 25 ? 'hungry' : happy < 30 ? 'sad' : 'happy';
    const col = evo.color, lt = col + '44';
    const smile = mood==='hungry'
      ? `<path d="M62,100 Q75,94 88,100" stroke="rgba(0,0,0,0.35)" stroke-width="2.5" fill="none"/>`
      : `<path d="M62,100 Q75,108 88,100" stroke="rgba(0,0,0,0.35)" stroke-width="2.5" fill="none"/>`;
    const arts = {
      '🥚':`<ellipse cx="75" cy="85" rx="42" ry="52" fill="${col}" opacity="0.9"/><ellipse cx="75" cy="75" rx="34" ry="40" fill="${lt}"/><ellipse cx="62" cy="68" rx="7" ry="9" fill="rgba(255,255,255,0.4)"/>${smile}`,
      '🐣':`<ellipse cx="75" cy="90" rx="40" ry="38" fill="${col}" opacity="0.85"/><ellipse cx="75" cy="72" rx="28" ry="30" fill="${col}"/><circle cx="65" cy="68" r="5" fill="#1a0533"/><circle cx="85" cy="68" r="5" fill="#1a0533"/><circle cx="63" cy="66" r="2" fill="white"/><circle cx="83" cy="66" r="2" fill="white"/><ellipse cx="75" cy="80" rx="10" ry="7" fill="#ff9500"/>${mood==='hungry'?`<path d="M62,88 Q75,83 88,88" stroke="#1a0533" stroke-width="2" fill="none"/>`:`<path d="M62,88 Q75,95 88,88" stroke="#1a0533" stroke-width="2" fill="none"/>`}<ellipse cx="40" cy="88" rx="18" ry="12" fill="${lt}" transform="rotate(-20,40,88)"/><ellipse cx="110" cy="88" rx="18" ry="12" fill="${lt}" transform="rotate(20,110,88)"/>`,
      '🐤':`<ellipse cx="75" cy="88" rx="38" ry="35" fill="${col}" opacity="0.9"/><circle cx="75" cy="66" r="26" fill="${col}"/><circle cx="65" cy="62" r="5.5" fill="#1a0533"/><circle cx="85" cy="62" r="5.5" fill="#1a0533"/><circle cx="63" cy="60" r="2" fill="white"/><circle cx="83" cy="60" r="2" fill="white"/><ellipse cx="75" cy="74" rx="9" ry="6" fill="#ff9500"/>${mood==='hungry'?`<path d="M62,83 Q75,77 88,83" stroke="#1a0533" stroke-width="2.5" fill="none"/>`:`<path d="M62,83 Q75,91 88,83" stroke="#1a0533" stroke-width="2.5" fill="none"/>`}<path d="M37,80 Q28,65 40,58 Q52,70 48,83 Z" fill="${lt}"/><path d="M113,80 Q122,65 110,58 Q98,70 102,83 Z" fill="${lt}"/><path d="M60,118 L75,105 L90,118" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      '🦜':`<ellipse cx="75" cy="95" rx="32" ry="30" fill="${col}" opacity="0.85"/><circle cx="75" cy="65" r="24" fill="${col}"/><circle cx="65" cy="60" r="5" fill="#1a0533"/><circle cx="85" cy="60" r="5" fill="#1a0533"/><circle cx="63" cy="58" r="2" fill="white"/><circle cx="83" cy="58" r="2" fill="white"/><path d="M68,72 L75,78 L82,72 L78,68 L72,68 Z" fill="#ff6b35"/>${mood==='hungry'?`<path d="M60,82 Q75,76 90,82" stroke="#1a0533" stroke-width="2" fill="none"/>`:`<path d="M60,82 Q75,90 90,82" stroke="#1a0533" stroke-width="2" fill="none"/>`}<path d="M43,85 C30,70 25,55 38,50 C48,46 55,62 52,80 Z" fill="#ff6b35"/><path d="M107,85 C120,70 125,55 112,50 C102,46 95,62 98,80 Z" fill="#2ed573"/>`,
      '🦅':`<ellipse cx="75" cy="98" rx="28" ry="26" fill="${col}" opacity="0.8"/><circle cx="75" cy="60" r="22" fill="${col}"/><circle cx="65" cy="56" r="5" fill="#1a0533"/><circle cx="85" cy="56" r="5" fill="#1a0533"/><circle cx="63" cy="54" r="2.5" fill="white"/><circle cx="83" cy="54" r="2.5" fill="white"/><path d="M68,68 L75,75 L82,68 L79,63 L71,63 Z" fill="#ffd700"/>${mood==='hungry'?`<path d="M61,78 Q75,72 89,78" stroke="#1a0533" stroke-width="2" fill="none"/>`:`<path d="M61,78 Q75,86 89,78" stroke="#1a0533" stroke-width="2" fill="none"/>`}<path d="M47,90 C25,75 15,50 30,42 C45,35 55,58 52,85 Z" fill="${lt}"/><path d="M103,90 C125,75 135,50 120,42 C105,35 95,58 98,85 Z" fill="${lt}"/>`,
      '🐲':`<ellipse cx="75" cy="100" rx="35" ry="32" fill="${col}" opacity="0.8"/><ellipse cx="75" cy="62" rx="26" ry="24" fill="${col}"/><circle cx="63" cy="57" r="6" fill="#1a0533"/><circle cx="87" cy="57" r="6" fill="#1a0533"/><circle cx="61" cy="55" r="2.5" fill="white"/><circle cx="85" cy="55" r="2.5" fill="white"/><ellipse cx="75" cy="71" rx="8" ry="5" fill="#ff4757"/>${mood==='hungry'?`<path d="M59,82 Q75,76 91,82" stroke="#1a0533" stroke-width="2.5" fill="none"/>`:`<path d="M59,82 Q75,91 91,82" stroke="#1a0533" stroke-width="2.5" fill="none"/>`}<path d="M62,40 L67,52 M75,36 L75,50 M88,40 L83,52" stroke="#ffd700" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M35,95 C10,75 5,45 25,40 C42,36 50,65 47,92 Z" fill="${col}" opacity="0.7"/><path d="M115,95 C140,75 145,45 125,40 C108,36 100,65 103,92 Z" fill="${col}" opacity="0.7"/>`,
      '🔥':`<circle cx="75" cy="75" r="50" fill="${col}" opacity="0.12"/><path d="M75,30 C75,30 95,55 90,75 C108,58 110,80 95,100 C90,115 55,115 55,115 C40,115 30,100 35,82 C25,90 28,108 35,115 C20,105 18,85 30,70 C22,60 35,45 50,52 C50,38 65,25 75,30 Z" fill="${col}" opacity="0.9"/><path d="M75,55 C75,55 87,68 84,80 C92,72 93,84 86,94 C82,102 62,102 60,94 C53,86 58,74 65,72 C62,64 68,54 75,55 Z" fill="#ffd700" opacity="0.85"/><ellipse cx="75" cy="95" rx="12" ry="8" fill="white" opacity="0.7"/><circle cx="70" cy="93" r="3.5" fill="#1a0533"/><circle cx="80" cy="93" r="3.5" fill="#1a0533"/>`,
    };
    svg.innerHTML = arts[evo.icon] || arts['🥚'];
    svg.style.filter = hunger < 25 ? 'saturate(0.5) brightness(0.85)' : '';
  }

  function renderEvoTrack(d) {
    const row = document.getElementById('evo-row'); if (!row) return;
    const cur = getEvo(d.xp);
    row.innerHTML = EVOS.map(e => {
      const reached = d.xp >= e.xp, isCur = e.icon===cur.icon;
      return `<div class="evo-pip ${reached?'ep-reached':''} ${isCur?'ep-current':''}">
        <div class="evo-pip-dot">${reached?e.icon:'?'}</div>
        <div class="evo-pip-lbl">${e.stage}</div>
      </div>`;
    }).join('');
  }

  function renderBars(d) {
    const curEvo=getEvo(d.xp), nextEvo=EVOS.find(e=>e.xp>d.xp);
    const els = {
      'pbar-hunger': Math.round(d.hunger), 'pbar-hunger-lbl': d.hunger>70?'Full':d.hunger>40?'Peckish':d.hunger>15?'Hungry!':'Starving!',
      'pbar-happy':  Math.round(d.happiness), 'pbar-happy-lbl': d.happiness>70?'Happy':d.happiness>40?'Okay':'Sad 😢',
    };
    Object.entries(els).forEach(([id,v]) => {
      const el=document.getElementById(id); if(!el)return;
      if(typeof v==='number') el.style.width=v+'%'; else el.textContent=v;
    });
    const xBar=document.getElementById('pbar-xp'),xLbl=document.getElementById('pbar-xp-lbl');
    if(xBar&&nextEvo){const p=((d.xp-curEvo.xp)/(nextEvo.xp-curEvo.xp))*100;xBar.style.width=Math.min(100,Math.round(p))+'%';if(xLbl)xLbl.textContent=`${d.xp-curEvo.xp}/${nextEvo.xp-curEvo.xp}`;}
    else if(xBar){xBar.style.width='100%';if(xLbl)xLbl.textContent='MAX!';}
  }

  function speak(pool) {
    const msgs=SPEECHES[pool]||SPEECHES.idle;
    const b=document.getElementById('pet-speech'); if(!b)return;
    b.textContent=msgs[Math.floor(Math.random()*msgs.length)];
    b.classList.add('show'); clearTimeout(b._t); b._t=setTimeout(()=>b.classList.remove('show'),2400);
  }

  function checkHungerBadge(d) {
    const dot=document.getElementById('pet-hunger-dot');
    if(dot) dot.style.display=d.hunger<30?'flex':'none';
    const evo=getEvo(d.xp);
    ['bnav-pet-icon','map-pet-icon','pet-pet-icon'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=evo.icon;});
  }

  function render() {
    let d=load(); d=decay(d); d=syncXP(d); save(d);
    const evo=getEvo(d.xp);
    const map={'pet-stage-lbl':evo.stage.toUpperCase(),'pet-name-el':'Zippy','pet-evo-txt':evo.label,'pet-xp-hdr':d.xp};
    Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
    drawSVG(evo,d.hunger,d.happiness); renderEvoTrack(d); renderBars(d);
    const btn=document.getElementById('pet-feed-btn');
    if(btn){btn.disabled=(d.feedsAvail||0)<=0;btn.textContent=d.feedsAvail>0?`🍖 Feed (${d.feedsAvail} left)`:'🍖 Play maths to earn feeds!';}
    const tipT=document.getElementById('pet-tip-title'),tipB=document.getElementById('pet-tip-body');
    if(d.hunger<30&&tipT){tipT.textContent='⚠️ Zippy is hungry!';if(tipB)tipB.textContent='Play maths games to earn XP!';}
    else if(d.feedsAvail>0&&tipT){tipT.textContent=`🍖 ${d.feedsAvail} feed${d.feedsAvail>1?'s':''} ready!`;if(tipB)tipB.textContent='Tap Feed to give Zippy a treat!';}
    checkHungerBadge(d);
    setTimeout(()=>speak(d.hunger<25?'hungry':'idle'),600);
  }

  function feed() {
    let d=load(); d=syncXP(d); if((d.feedsAvail||0)<=0)return;
    d.feedsAvail--; d.totalXpGiven=(d.totalXpGiven||0)+1;
    d.hunger=Math.min(100,d.hunger+30); d.happiness=Math.min(100,d.happiness+20); d.lastFed=Date.now();
    save(d);
    const svg=document.getElementById('pet-svg');
    if(svg){svg.classList.remove('pet-anim-fed');void svg.offsetWidth;svg.classList.add('pet-anim-fed');setTimeout(()=>svg.classList.remove('pet-anim-fed'),900);}
    speak('fed'); PARTICLES.burst(window.innerWidth/2,window.innerHeight*0.4,12,['#ffd700','#ff9500','#ff6b35','#2ed573']); SOUND.correct();
    render();
  }

  function onXPEarned() {
    if ((APP.state.selectedSubject||'math') !== 'math') return; // only math XP feeds pet
    let d=load(); d=syncXP(d); save(d); checkHungerBadge(d);
    const evo=getEvo(APP.state.xp);
    ['bnav-pet-icon','map-pet-icon','pet-pet-icon'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=evo.icon;});
  }

  return { render, feed, onXPEarned, speak, getEvo, load };
})();

// ================================================================
// CASTLE — English companion  (build a castle, room by room)
// ================================================================
const CASTLE = (() => {
  const KEY = 'zl_castle';
  const XP_PER_BRICK = 15;

  // Castle grows through 8 stages — each stage adds a new part
  const STAGES = [
    { xp:0,   name:'Bare Land',      label:'Start building!',       color:'#a855f7', part:'foundation',
      desc:'Your castle story begins here…' },
    { xp:40,  name:'Foundation',     label:'Walls rising!',          color:'#9333ea', part:'walls',
      desc:'The first stones are laid!' },
    { xp:100, name:'First Tower',    label:'A tower appears!',       color:'#7c3aed', part:'tower1',
      desc:'Knights can watch from up high!' },
    { xp:200, name:'Great Hall',     label:'Feasts inside!',         color:'#6d28d9', part:'hall',
      desc:'Stories echo in the great hall!' },
    { xp:380, name:'Second Tower',   label:'Growing stronger!',      color:'#c084fc', part:'tower2',
      desc:'Your castle is the talk of the land!' },
    { xp:600, name:'Drawbridge',     label:'A drawbridge appears!',  color:'#e879f9', part:'bridge',
      desc:'Friends can visit your castle!' },
    { xp:900, name:'Royal Banners',  label:'Banners flying!',        color:'#ffd700', part:'banners',
      desc:'Your name flies above all!' },
    { xp:1300,name:'Grand Castle',   label:'LEGENDARY AUTHOR!',      color:'#ffd700', part:'complete',
      desc:'You are a master of English!', badge:'👑' },
  ];

  const PHRASES = {
    correct: ['Brilliant word! 📖','Perfect grammar! ✨','Your castle grows! 🏰','Excellent! ⚡'],
    wrong:   ['Try again, brave writer!','Every mistake is a lesson!','Keep writing! ✍️'],
    brick:   ['A new brick is laid! 🧱','Your castle grows taller!','Building mastery! 🏰'],
    complete:['YOUR CASTLE IS COMPLETE! 👑','LEGENDARY AUTHOR! 🌟','MASTER OF ENGLISH! 📚'],
  };

  function load(){const d={xp:0,bricks:0,totalBricksEarned:0,bricksAvail:0,lastVisit:null};try{return{...d,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return d}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
  function getStage(xp){let s=STAGES[0];for(const st of STAGES){if(xp>=st.xp)s=st;else break;}return s;}
  function syncBricks(d){const fe=Math.floor(APP.state.engXp/XP_PER_BRICK);d.bricksAvail=Math.max(0,fe-(d.totalBricksEarned||0));return d;}

  function drawCastle(stage) {
    const svg = document.getElementById('castle-svg');
    if (!svg) return;
    const c = stage.color, lt = c+'33';
    const stageIdx = STAGES.indexOf(stage);

    // Build castle SVG progressively by stage
    let parts = '';

    // Ground
    parts += `<rect x="10" y="130" width="130" height="20" rx="4" fill="${lt}"/>`;

    // Foundation / base walls (stage 1+)
    if (stageIdx >= 1) {
      parts += `<rect x="25" y="90" width="100" height="45" fill="${c}" opacity="0.8" rx="3"/>`;
      parts += `<rect x="35" y="100" width="15" height="20" fill="${lt}" rx="2"/>`;
      parts += `<rect x="65" y="100" width="20" height="35" fill="${lt}" rx="2"/>`;  // door
      parts += `<rect x="100" y="100" width="15" height="20" fill="${lt}" rx="2"/>`;
    } else {
      // Just ground plot
      parts += `<rect x="35" y="120" width="80" height="10" rx="3" fill="${c}" opacity="0.4"/>`;
      parts += `<text x="75" y="115" text-anchor="middle" font-size="11" fill="${c}" opacity="0.7">Your story starts here</text>`;
    }

    // Tower 1 left (stage 2+)
    if (stageIdx >= 2) {
      parts += `<rect x="15" y="60" width="35" height="75" fill="${c}" opacity="0.9" rx="3"/>`;
      // Battlements
      parts += `<rect x="15" y="54" width="8" height="10" fill="${c}" rx="1"/>`;
      parts += `<rect x="28" y="54" width="8" height="10" fill="${c}" rx="1"/>`;
      parts += `<rect x="41" y="54" width="8" height="10" fill="${c}" rx="1"/>`;
      parts += `<circle cx="32" cy="74" r="7" fill="${lt}"/>`;  // window
    }

    // Great Hall — wider middle section (stage 3+)
    if (stageIdx >= 3) {
      parts += `<rect x="50" y="70" width="50" height="65" fill="${c}" opacity="0.85" rx="3"/>`;
      parts += `<path d="M50,70 Q75,55 100,70" fill="${c}" opacity="0.7"/>`;  // arch roof
      // Windows
      parts += `<circle cx="62" cy="85" r="6" fill="${lt}"/>`;
      parts += `<circle cx="88" cy="85" r="6" fill="${lt}"/>`;
    }

    // Tower 2 right (stage 4+)
    if (stageIdx >= 4) {
      parts += `<rect x="100" y="60" width="35" height="75" fill="${c}" opacity="0.9" rx="3"/>`;
      parts += `<rect x="100" y="54" width="8" height="10" fill="${c}" rx="1"/>`;
      parts += `<rect x="113" y="54" width="8" height="10" fill="${c}" rx="1"/>`;
      parts += `<rect x="126" y="54" width="8" height="10" fill="${c}" rx="1"/>`;
      parts += `<circle cx="118" cy="74" r="7" fill="${lt}"/>`;
    }

    // Drawbridge (stage 5+)
    if (stageIdx >= 5) {
      parts += `<rect x="63" y="118" width="24" height="12" fill="#8b6914" rx="2"/>`;
      parts += `<line x1="63" y1="118" x2="55" y2="130" stroke="#8b6914" stroke-width="2"/>`;
      parts += `<line x1="87" y1="118" x2="95" y2="130" stroke="#8b6914" stroke-width="2"/>`;
      // Moat
      parts += `<ellipse cx="75" cy="134" rx="50" ry="8" fill="#1e40af" opacity="0.4"/>`;
    }

    // Banners (stage 6+)
    if (stageIdx >= 6) {
      parts += `<line x1="32" y1="32" x2="32" y2="56" stroke="#ffd700" stroke-width="2"/>`;
      parts += `<polygon points="32,32 46,39 32,46" fill="#ffd700"/>`;
      parts += `<line x1="118" y1="32" x2="118" y2="56" stroke="#ffd700" stroke-width="2"/>`;
      parts += `<polygon points="118,32 132,39 118,46" fill="#ffd700"/>`;
    }

    // Complete — add sun/rainbow backdrop (stage 7)
    if (stageIdx >= 7) {
      parts = `<circle cx="130" cy="30" r="22" fill="#ffd700" opacity="0.25"/>` + parts;
      parts += `<path d="M5,140 Q75,100 145,140" fill="none" stroke="url(#rainbow)" stroke-width="4" opacity="0.5"/>`;
      parts += `<defs><linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff0"/><stop offset="50%" stop-color="#0f0"/><stop offset="100%" stop-color="#00f"/></linearGradient></defs>`;
    }

    svg.innerHTML = parts;
  }

  function render() {
    let d = load(); d = syncBricks(d); save(d);
    const xp = APP.state.engXp || 0;
    const stage = getStage(xp);
    const stageIdx = STAGES.indexOf(stage);
    const nextStage = STAGES[stageIdx + 1];

    // Labels
    ['castle-stage-lbl','castle-name-el'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('stage') ? stage.name.toUpperCase() : '🏰 My Castle';
    });
    const evoTxt = document.getElementById('castle-evo-txt');
    if (evoTxt) evoTxt.textContent = stage.label;
    const xpHdr = document.getElementById('castle-xp-hdr');
    if (xpHdr) xpHdr.textContent = xp;

    drawCastle(stage);

    // Progress bar to next stage
    const xBar = document.getElementById('castle-pbar-xp');
    const xLbl = document.getElementById('castle-pbar-xp-lbl');
    if (xBar && nextStage) {
      const pct = ((xp - stage.xp) / (nextStage.xp - stage.xp)) * 100;
      xBar.style.width = Math.min(100, Math.round(pct)) + '%';
      xBar.style.background = stage.color;
      if (xLbl) xLbl.textContent = `${xp - stage.xp}/${nextStage.xp - stage.xp} to ${nextStage.name}`;
    } else if (xBar) {
      xBar.style.width = '100%';
      if (xLbl) xLbl.textContent = '👑 LEGENDARY!';
    }

    // Stage track
    const row = document.getElementById('castle-evo-row');
    if (row) {
      row.innerHTML = STAGES.map((s, i) => {
        const reached = xp >= s.xp, isCur = s === stage;
        return `<div class="evo-pip ${reached?'ep-reached':''} ${isCur?'ep-current':''}">
          <div class="evo-pip-dot" style="${reached?`color:${s.color}`:''}">
            ${reached ? (s.badge || '🧱') : '?'}
          </div>
          <div class="evo-pip-lbl">${s.part}</div>
        </div>`;
      }).join('');
    }

    // Brick button
    const btn = document.getElementById('castle-brick-btn');
    const avail = d.bricksAvail || 0;
    if (btn) {
      btn.disabled = avail <= 0;
      btn.textContent = avail > 0 ? `🧱 Place Brick (${avail} left)` : '🧱 Play English to earn bricks!';
    }

    // Tip
    const tipT = document.getElementById('castle-tip-title'), tipB = document.getElementById('castle-tip-body');
    if (avail > 0 && tipT) {
      tipT.textContent = `🧱 ${avail} brick${avail>1?'s':''} ready to place!`;
      if (tipB) tipB.textContent = 'Tap "Place Brick" to grow your castle!';
    } else if (tipT) {
      tipT.textContent = `📖 Play English games to earn bricks!`;
      if (tipB) tipB.textContent = stage.desc;
    }

    // Speech bubble
    setTimeout(() => castleSpeak(stageIdx >= 7 ? 'complete' : 'brick'), 600);
  }

  function castleSpeak(pool) {
    const msgs = PHRASES[pool] || PHRASES.brick;
    const b = document.getElementById('castle-speech'); if (!b) return;
    b.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    b.classList.add('show'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), 2400);
  }

  function placeBrick() {
    let d = load(); d = syncBricks(d);
    if ((d.bricksAvail || 0) <= 0) return;
    d.bricksAvail--;
    d.totalBricksEarned = (d.totalBricksEarned || 0) + 1;
    // Each brick adds XP to the castle
    APP.state.engXp = (APP.state.engXp || 0) + XP_PER_BRICK;
    save(d);
    PARTICLES.burst(window.innerWidth/2, window.innerHeight*0.4, 14, ['#a855f7','#c084fc','#ffd700','#e879f9']);
    SOUND.correct();
    castleSpeak('brick');
    render();
  }

  function onEngXP() {
    if ((APP.state.selectedSubject || 'math') !== 'eng') return;
    let d = load(); d = syncBricks(d); save(d);
    const btn = document.getElementById('castle-brick-dot');
    if (btn) btn.style.display = d.bricksAvail > 0 ? 'flex' : 'none';
  }

  return { render, placeBrick, onEngXP, castleSpeak, getStage, load };
})();

// ================================================================
// LAB — Science companion  (grow an experiment / discovery tree)
// ================================================================
const LAB = (() => {
  const KEY = 'zl_lab';
  const XP_PER_FLASK = 18;

  // Lab tree grows through 8 discoveries
  const DISCOVERIES = [
    { xp:0,   name:'Empty Lab',      label:'Start experimenting!',   color:'#00d4aa', icon:'🧪',
      desc:'Every scientist starts with curiosity…' },
    { xp:40,  name:'First Flask',    label:'Bubbles forming!',       color:'#33ddb8', icon:'⚗️',
      desc:'Your first experiment is alive!' },
    { xp:100, name:'Microscope',     label:'Tiny worlds revealed!',  color:'#00b8a9', icon:'🔬',
      desc:'You can see cells now!' },
    { xp:200, name:'Circuit Board',  label:'Electricity flows!',     color:'#2ed573', icon:'⚡',
      desc:'You\'ve mastered circuits!' },
    { xp:380, name:'Plant Chamber',  label:'Growing life!',          color:'#4ade80', icon:'🌱',
      desc:'Plants respond to your experiments!' },
    { xp:600, name:'Telescope',      label:'Stars in sight!',        color:'#818cf8', icon:'🔭',
      desc:'The universe opens up!' },
    { xp:900, name:'Robot Lab',      label:'AI is born!',            color:'#a78bfa', icon:'🤖',
      desc:'You\'ve built a thinking machine!' },
    { xp:1300,name:'Space Station',  label:'MASTER SCIENTIST!',      color:'#ffd700', icon:'🚀',
      desc:'You are a true scientist!', badge:'🏆' },
  ];

  const PHRASES = {
    discover:['Eureka! 🔬','Science is magic! ⚡','Great discovery! 🌟','You\'re a scientist! ⚗️'],
    flask:   ['Flask filled! ⚗️','Experiment running!','Data collected! 📊','Hypothesis confirmed! ✅'],
    complete:['MASTER SCIENTIST! 🚀','ALL EXPERIMENTS DONE! 🌟','THE UNIVERSE IS YOURS! 🔭'],
  };

  function load(){const d={xp:0,flasksAvail:0,totalFlasksEarned:0,lastVisit:null};try{return{...d,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return d}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
  function getDiscovery(xp){let s=DISCOVERIES[0];for(const d of DISCOVERIES){if(xp>=d.xp)s=d;else break;}return s;}
  function syncFlasks(d){const fe=Math.floor((APP.state.sciXp||0)/XP_PER_FLASK);d.flasksAvail=Math.max(0,fe-(d.totalFlasksEarned||0));return d;}

  function drawLab(discovery) {
    const svg = document.getElementById('lab-svg');
    if (!svg) return;
    const c = discovery.color, lt = c + '33';
    const idx = DISCOVERIES.indexOf(discovery);

    let parts = '';

    // Lab bench — always present
    parts += `<rect x="10" y="120" width="130" height="15" rx="4" fill="${lt}" stroke="${c}" stroke-width="1.5"/>`;
    parts += `<rect x="15" y="135" width="25" height="20" rx="2" fill="${lt}"/>`;
    parts += `<rect x="110" y="135" width="25" height="20" rx="2" fill="${lt}"/>`;

    // Flask (stage 1+)
    if (idx >= 1) {
      parts += `<rect x="66" y="85" width="18" height="30" fill="${c}" opacity="0.7" rx="3"/>`;
      parts += `<ellipse cx="75" cy="115" rx="22" ry="12" fill="${c}" opacity="0.8"/>`;
      parts += `<circle cx="75" cy="110" r="6" fill="white" opacity="0.5"/>`;
      // Bubbles
      parts += `<circle cx="68" cy="100" r="3" fill="white" opacity="0.6"/>`;
      parts += `<circle cx="82" cy="92" r="2" fill="white" opacity="0.5"/>`;
      parts += `<text x="75" y="130" text-anchor="middle" font-size="9" fill="${c}">BOILING!</text>`;
    }

    // Microscope (stage 2+)
    if (idx >= 2) {
      parts += `<rect x="20" y="90" width="10" height="30" fill="${c}" opacity="0.8" rx="2"/>`;
      parts += `<rect x="15" y="88" width="20" height="6" rx="2" fill="${c}" opacity="0.9"/>`;
      parts += `<circle cx="25" cy="80" r="10" fill="${c}" opacity="0.5" stroke="${c}" stroke-width="2"/>`;
      parts += `<circle cx="25" cy="80" r="5" fill="white" opacity="0.7"/>`;
    }

    // Circuit board (stage 3+)
    if (idx >= 3) {
      parts += `<rect x="95" y="88" width="40" height="28" rx="4" fill="${lt}" stroke="${c}" stroke-width="1.5"/>`;
      parts += `<line x1="100" y1="98" x2="130" y2="98" stroke="${c}" stroke-width="1.5"/>`;
      parts += `<line x1="115" y1="92" x2="115" y2="112" stroke="${c}" stroke-width="1.5"/>`;
      parts += `<circle cx="107" cy="102" r="4" fill="${c}" opacity="0.7"/>`;
      parts += `<circle cx="123" cy="102" r="4" fill="${c}" opacity="0.7"/>`;
      // Lightning bolt
      parts += `<text x="115" y="88" text-anchor="middle" font-size="14">⚡</text>`;
    }

    // Plant chamber (stage 4+)
    if (idx >= 4) {
      parts += `<rect x="48" y="65" width="20" height="50" fill="${lt}" stroke="${c}" stroke-width="1" rx="3"/>`;
      // Plant growing inside
      parts += `<line x1="58" y1="115" x2="58" y2="85" stroke="#22c55e" stroke-width="2.5"/>`;
      parts += `<circle cx="58" cy="80" r="8" fill="#22c55e" opacity="0.8"/>`;
      parts += `<circle cx="50" cy="90" r="5" fill="#4ade80" opacity="0.7"/>`;
      parts += `<circle cx="66" cy="90" r="5" fill="#4ade80" opacity="0.7"/>`;
    }

    // Telescope (stage 5+)
    if (idx >= 5) {
      parts += `<rect x="5" y="60" width="50" height="12" rx="6" fill="${c}" opacity="0.8" transform="rotate(-20 30 66)"/>`;
      parts += `<circle cx="8" cy="54" r="8" fill="${c}" opacity="0.5" stroke="${c}" stroke-width="2"/>`;
      // Stars
      parts += `<text x="130" y="40" font-size="16" opacity="0.8">⭐</text>`;
      parts += `<text x="110" y="25" font-size="12" opacity="0.6">✨</text>`;
      parts += `<text x="20" y="30" font-size="10" opacity="0.5">🌟</text>`;
    }

    // Robot (stage 6+)
    if (idx >= 6) {
      parts += `<rect x="108" y="55" width="28" height="28" rx="4" fill="${c}" opacity="0.7"/>`;
      parts += `<circle cx="116" cy="63" r="4" fill="white" opacity="0.9"/>`;
      parts += `<circle cx="128" cy="63" r="4" fill="white" opacity="0.9"/>`;
      parts += `<rect x="114" y="71" width="14" height="5" rx="2" fill="${c}" opacity="0.5"/>`;
      parts += `<text x="122" y="90" text-anchor="middle" font-size="9" fill="${c}">🤖</text>`;
    }

    // Space station backdrop (stage 7)
    if (idx >= 7) {
      parts = `<circle cx="75" cy="75" r="65" fill="${c}" opacity="0.06"/>` + parts;
      parts += `<text x="75" y="30" text-anchor="middle" font-size="24">🚀</text>`;
      parts += `<circle cx="25" cy="20" r="4" fill="#ffd700" opacity="0.7"/>`;
      parts += `<circle cx="130" cy="15" r="3" fill="#ffd700" opacity="0.5"/>`;
      parts += `<circle cx="140" cy="45" r="5" fill="#818cf8" opacity="0.5"/>`;
    }

    svg.innerHTML = parts;
  }

  function render() {
    let d = load(); d = syncFlasks(d); save(d);
    const xp = APP.state.sciXp || 0;
    const disc = getDiscovery(xp);
    const idx = DISCOVERIES.indexOf(disc);
    const next = DISCOVERIES[idx + 1];

    ['lab-stage-lbl','lab-name-el'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('stage') ? disc.name.toUpperCase() : '🔬 My Lab';
    });
    const evoTxt = document.getElementById('lab-evo-txt');
    if (evoTxt) evoTxt.textContent = disc.label;
    const xpHdr = document.getElementById('lab-xp-hdr');
    if (xpHdr) xpHdr.textContent = xp;

    drawLab(disc);

    const xBar = document.getElementById('lab-pbar-xp'), xLbl = document.getElementById('lab-pbar-xp-lbl');
    if (xBar && next) {
      const pct = ((xp - disc.xp) / (next.xp - disc.xp)) * 100;
      xBar.style.width = Math.min(100, Math.round(pct)) + '%';
      xBar.style.background = disc.color;
      if (xLbl) xLbl.textContent = `${xp - disc.xp}/${next.xp - disc.xp} to ${next.name}`;
    } else if (xBar) {
      xBar.style.width = '100%';
      if (xLbl) xLbl.textContent = '🚀 MASTER SCIENTIST!';
    }

    const row = document.getElementById('lab-evo-row');
    if (row) {
      row.innerHTML = DISCOVERIES.map((s, i) => {
        const reached = xp >= s.xp, isCur = s === disc;
        return `<div class="evo-pip ${reached?'ep-reached':''} ${isCur?'ep-current':''}">
          <div class="evo-pip-dot">${reached ? s.icon : '?'}</div>
          <div class="evo-pip-lbl">${s.name.split(' ')[0]}</div>
        </div>`;
      }).join('');
    }

    const btn = document.getElementById('lab-flask-btn');
    const avail = d.flasksAvail || 0;
    if (btn) {
      btn.disabled = avail <= 0;
      btn.textContent = avail > 0 ? `⚗️ Run Experiment (${avail} left)` : '⚗️ Play Science to fill flasks!';
    }

    const tipT = document.getElementById('lab-tip-title'), tipB = document.getElementById('lab-tip-body');
    if (avail > 0 && tipT) {
      tipT.textContent = `⚗️ ${avail} experiment${avail>1?'s':''} ready!`;
      if (tipB) tipB.textContent = 'Tap "Run Experiment" to unlock discoveries!';
    } else if (tipT) {
      tipT.textContent = '🔬 Play Science games to fill flasks!';
      if (tipB) tipB.textContent = disc.desc;
    }

    setTimeout(() => labSpeak(idx >= 7 ? 'complete' : 'discover'), 600);
  }

  function labSpeak(pool) {
    const msgs = PHRASES[pool] || PHRASES.discover;
    const b = document.getElementById('lab-speech'); if (!b) return;
    b.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    b.classList.add('show'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), 2400);
  }

  function runExperiment() {
    let d = load(); d = syncFlasks(d);
    if ((d.flasksAvail || 0) <= 0) return;
    d.flasksAvail--;
    d.totalFlasksEarned = (d.totalFlasksEarned || 0) + 1;
    APP.state.sciXp = (APP.state.sciXp || 0) + XP_PER_FLASK;
    save(d);
    PARTICLES.burst(window.innerWidth/2, window.innerHeight*0.4, 14, ['#00d4aa','#33ddb8','#2ed573','#818cf8']);
    SOUND.correct();
    labSpeak('flask');
    render();
  }

  function onSciXP() {
    if ((APP.state.selectedSubject || 'math') !== 'sci') return;
    let d = load(); d = syncFlasks(d); save(d);
    const dot = document.getElementById('lab-flask-dot');
    if (dot) dot.style.display = d.flasksAvail > 0 ? 'flex' : 'none';
  }

  return { render, runExperiment, onSciXP, labSpeak, getDiscovery, load };
})();

// ================================================================
// Hook companions into XP reward flow
// ================================================================
new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.target.id === 'reward-overlay' && m.target.classList.contains('show')) {
      const subj = APP.state.selectedSubject || 'math';
      if (subj === 'math') PET.onXPEarned();
      if (subj === 'eng')  CASTLE.onEngXP();
      if (subj === 'sci')  LAB.onSciXP();
      if (subj === 'evs')  GARDEN.onEvsXP();
      ADVENTURE_MAP.render();
      break;
    }
  }
}).observe(document.getElementById('reward-overlay'), {attributes:true, attributeFilter:['class']});

// Init
setTimeout(() => {
  PET.render();
  CASTLE.render();
  LAB.render();
  GARDEN.render();
  ADVENTURE_MAP.render();
}, 300);

// ================================================================
// GARDEN — EVS/GK companion  (grow a garden, plant by plant)
// ================================================================
const GARDEN = (() => {
  const KEY = 'zl_garden';
  const XP_PER_SEED = 16;

  const STAGES = [
    { xp:0,   name:'Bare Soil',      label:'Start planting!',        color:'#22c55e', icon:'🌱', desc:'Your garden journey begins…' },
    { xp:40,  name:'First Sprout',   label:'Something is growing!',  color:'#4ade80', icon:'🌿', desc:'A tiny green shoot appears!' },
    { xp:100, name:'Flower Patch',   label:'Colours blooming!',      color:'#86efac', icon:'🌼', desc:'Your garden bursts into colour!' },
    { xp:200, name:'Veggie Plot',    label:'Food is growing!',        color:'#16a34a', icon:'🥦', desc:'Vegetables fill your garden!' },
    { xp:380, name:'Fruit Trees',    label:'Trees are fruiting!',     color:'#15803d', icon:'🌳', desc:'A small orchard takes shape!' },
    { xp:600, name:'Butterfly Garden',label:'Wildlife arrives!',     color:'#22c55e', icon:'🦋', desc:'Butterflies and bees have moved in!' },
    { xp:900, name:'Nature Reserve', label:'Almost complete!',        color:'#ffd700', icon:'🌺', desc:'A thriving mini nature reserve!' },
    { xp:1300,name:'World Garden',   label:'GK CHAMPION!',           color:'#ffd700', icon:'🌍', desc:'You know the whole wide world!', badge:'🏆' },
  ];

  const PHRASES = {
    grow:    ['A new plant sprouts! 🌱','Your garden grows! 🌸','Knowledge blooms! 🌼','Great GK! 🌿'],
    seed:    ['Seed planted! 🌱','Growing knowledge! 🌸','Garden expanding! 🌻','Nature thrives! 🦋'],
    complete:['WORLD GARDEN COMPLETE! 🌍','GK CHAMPION! 🏆','ALL KNOWLEDGE GROWN! 🌟'],
  };

  function load(){const d={xp:0,seedsAvail:0,totalSeedsPlanted:0};try{return{...d,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return d}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
  function getStage(xp){let s=STAGES[0];for(const st of STAGES){if(xp>=st.xp)s=st;else break;}return s;}
  function syncSeeds(d){const fe=Math.floor((APP.state.evsXp||0)/XP_PER_SEED);d.seedsAvail=Math.max(0,fe-(d.totalSeedsPlanted||0));return d;}

  function drawGarden(stage) {
    const svg = document.getElementById('garden-svg');
    if (!svg) return;
    const c = stage.color, lt = c+'33', idx = STAGES.indexOf(stage);
    let parts = '';

    // Sky gradient backdrop
    parts += `<rect x="0" y="0" width="150" height="155" fill="#0f0520" rx="8" opacity="0.3"/>`;

    // Ground
    parts += `<rect x="5" y="120" width="140" height="30" rx="6" fill="${lt}" stroke="${c}" stroke-width="1"/>`;

    // Sun (always)
    parts += `<circle cx="125" cy="22" r="14" fill="#ffd700" opacity="0.8"/>`;
    parts += `<line x1="125" y1="4" x2="125" y2="10" stroke="#ffd700" stroke-width="2"/>`;
    parts += `<line x1="143" y1="22" x2="137" y2="22" stroke="#ffd700" stroke-width="2"/>`;
    parts += `<line x1="137" y1="10" x2="133" y2="14" stroke="#ffd700" stroke-width="2"/>`;

    // Stage 0: just soil
    if (idx === 0) {
      parts += `<text x="75" y="115" text-anchor="middle" font-size="10" fill="${c}" opacity="0.6">Plant a seed to begin!</text>`;
    }

    // Stage 1: first sprout
    if (idx >= 1) {
      parts += `<line x1="75" y1="120" x2="75" y2="95" stroke="#22c55e" stroke-width="3"/>`;
      parts += `<ellipse cx="65" cy="102" rx="10" ry="6" fill="#4ade80" opacity="0.9" transform="rotate(-30,65,102)"/>`;
      parts += `<ellipse cx="85" cy="108" rx="10" ry="6" fill="#4ade80" opacity="0.9" transform="rotate(30,85,108)"/>`;
    }

    // Stage 2: flowers
    if (idx >= 2) {
      // Left flower
      parts += `<line x1="35" y1="120" x2="35" y2="85" stroke="#22c55e" stroke-width="2.5"/>`;
      parts += `<circle cx="35" cy="80" r="10" fill="#ffd700" opacity="0.8"/>`;
      parts += `<circle cx="35" cy="80" r="5" fill="#ff9500"/>`;
      // Right flower
      parts += `<line x1="115" y1="120" x2="115" y2="88" stroke="#22c55e" stroke-width="2.5"/>`;
      parts += `<circle cx="115" cy="83" r="9" fill="#e879f9" opacity="0.8"/>`;
      parts += `<circle cx="115" cy="83" r="4" fill="#ffd700"/>`;
    }

    // Stage 3: vegetables
    if (idx >= 3) {
      // Carrot
      parts += `<polygon points="55,120 60,120 57.5,100" fill="#ff9500"/>`;
      parts += `<path d="M53,102 Q57.5,98 62,102" fill="#22c55e"/>`;
      // Tomato
      parts += `<circle cx="95" cy="112" r="8" fill="#ff4757" opacity="0.9"/>`;
      parts += `<line x1="95" y1="104" x2="95" y2="99" stroke="#22c55e" stroke-width="2"/>`;
      parts += `<path d="M90,102 Q95,99 100,102" fill="none" stroke="#22c55e" stroke-width="1.5"/>`;
    }

    // Stage 4: fruit trees
    if (idx >= 4) {
      // Tree left
      parts += `<rect x="18" y="88" width="8" height="32" fill="#8b5e3c" rx="2"/>`;
      parts += `<circle cx="22" cy="82" r="18" fill="#22c55e" opacity="0.85"/>`;
      parts += `<circle cx="16" cy="78" r="6" fill="#ff4757" opacity="0.8"/>`;
      parts += `<circle cx="28" cy="75" r="5" fill="#ff9500" opacity="0.8"/>`;
      // Tree right
      parts += `<rect x="120" y="88" width="8" height="32" fill="#8b5e3c" rx="2"/>`;
      parts += `<circle cx="124" cy="82" r="16" fill="#4ade80" opacity="0.85"/>`;
      parts += `<circle cx="118" cy="78" r="5" fill="#ffd700" opacity="0.9"/>`;
      parts += `<circle cx="130" cy="76" r="5" fill="#ffd700" opacity="0.8"/>`;
    }

    // Stage 5: butterflies
    if (idx >= 5) {
      parts += `<path d="M58,55 C50,45 40,48 45,58 C50,65 58,62 58,55 Z" fill="#a855f7" opacity="0.8"/>`;
      parts += `<path d="M58,55 C66,45 76,48 71,58 C66,65 58,62 58,55 Z" fill="#c084fc" opacity="0.8"/>`;
      parts += `<line x1="58" y1="52" x2="58" y2="60" stroke="#1a0533" stroke-width="1.5"/>`;
      // Bee
      parts += `<ellipse cx="95" cy="48" rx="7" ry="4" fill="#ffd700"/>`;
      parts += `<line x1="88" y1="48" x2="88" y2="48" stroke="#1a0533" stroke-width="3"/>`;
      parts += `<ellipse cx="91" cy="45" rx="5" ry="3" fill="white" opacity="0.6"/>`;
    }

    // Stage 6: rainbow & birds
    if (idx >= 6) {
      parts += `<path d="M5,50 Q75,10 145,50" fill="none" stroke="url(#gRainbow)" stroke-width="5" opacity="0.4"/>`;
      parts += `<path d="M25,38 Q30,33 35,38" fill="none" stroke="${c}" stroke-width="2"/>`;
      parts += `<path d="M45,28 Q50,23 55,28" fill="none" stroke="${c}" stroke-width="2"/>`;
      parts += `<defs><linearGradient id="gRainbow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff0"/><stop offset="50%" stop-color="#0f0"/><stop offset="100%" stop-color="#00f"/></linearGradient></defs>`;
    }

    // Stage 7: globe overlay
    if (idx >= 7) {
      parts = `<circle cx="75" cy="75" r="65" fill="${c}" opacity="0.07"/>` + parts;
      parts += `<text x="75" y="18" text-anchor="middle" font-size="16">🌍</text>`;
    }

    svg.innerHTML = parts;
  }

  function render() {
    let d = load(); d = syncSeeds(d); save(d);
    const xp = APP.state.evsXp || 0;
    const stage = getStage(xp);
    const idx = STAGES.indexOf(stage);
    const next = STAGES[idx + 1];

    ['garden-stage-lbl','garden-name-el'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('stage') ? stage.name.toUpperCase() : '🌿 My Garden';
    });
    const evoTxt = document.getElementById('garden-evo-txt');
    if (evoTxt) evoTxt.textContent = stage.label;
    const xpHdr = document.getElementById('garden-xp-hdr');
    if (xpHdr) xpHdr.textContent = xp;

    drawGarden(stage);

    const xBar = document.getElementById('garden-pbar-xp'), xLbl = document.getElementById('garden-pbar-xp-lbl');
    if (xBar && next) {
      const pct = ((xp - stage.xp) / (next.xp - stage.xp)) * 100;
      xBar.style.width = Math.min(100, Math.round(pct)) + '%';
      xBar.style.background = stage.color;
      if (xLbl) xLbl.textContent = `${xp - stage.xp}/${next.xp - stage.xp} to ${next.name}`;
    } else if (xBar) {
      xBar.style.width = '100%';
      if (xLbl) xLbl.textContent = '🌍 WORLD GARDEN!';
    }

    const row = document.getElementById('garden-evo-row');
    if (row) {
      row.innerHTML = STAGES.map((s, i) => {
        const reached = xp >= s.xp, isCur = s === stage;
        return `<div class="evo-pip ${reached?'ep-reached':''} ${isCur?'ep-current':''}">
          <div class="evo-pip-dot">${reached ? s.icon : '?'}</div>
          <div class="evo-pip-lbl">${s.name.split(' ')[0]}</div>
        </div>`;
      }).join('');
    }

    const btn = document.getElementById('garden-seed-btn');
    const avail = d.seedsAvail || 0;
    if (btn) {
      btn.disabled = avail <= 0;
      btn.textContent = avail > 0 ? `🌱 Plant Seed (${avail} left)` : '🌱 Play EVS/GK to earn seeds!';
    }

    const tipT = document.getElementById('garden-tip-title'), tipB = document.getElementById('garden-tip-body');
    if (avail > 0 && tipT) {
      tipT.textContent = `🌱 ${avail} seed${avail>1?'s':''} ready to plant!`;
      if (tipB) tipB.textContent = 'Tap "Plant Seed" to grow your garden!';
    } else if (tipT) {
      tipT.textContent = '🌿 Play EVS/GK games to earn seeds!';
      if (tipB) tipB.textContent = stage.desc;
    }

    setTimeout(() => gardenSpeak(idx >= 7 ? 'complete' : 'grow'), 600);
  }

  function gardenSpeak(pool) {
    const msgs = PHRASES[pool] || PHRASES.grow;
    const b = document.getElementById('garden-speech'); if (!b) return;
    b.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    b.classList.add('show'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), 2400);
  }

  function plantSeed() {
    let d = load(); d = syncSeeds(d);
    if ((d.seedsAvail || 0) <= 0) return;
    d.seedsAvail--;
    d.totalSeedsPlanted = (d.totalSeedsPlanted || 0) + 1;
    APP.state.evsXp = (APP.state.evsXp || 0) + XP_PER_SEED;
    save(d);
    PARTICLES.burst(window.innerWidth/2, window.innerHeight*0.4, 14, ['#22c55e','#4ade80','#ffd700','#86efac']);
    SOUND.correct();
    gardenSpeak('seed');
    render();
  }

  function onEvsXP() {
    if ((APP.state.selectedSubject || 'math') !== 'evs') return;
    let d = load(); d = syncSeeds(d); save(d);
    const dot = document.getElementById('garden-seed-dot');
    if (dot) dot.style.display = d.seedsAvail > 0 ? 'flex' : 'none';
  }

  return { render, plantSeed, onEvsXP, gardenSpeak, getStage, load };
})();
