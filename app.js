// app.js — APP module, nav, buildStarfield, THEME, Service Worker
/* jshint esversion:6 */

/* ================================================================
   LEARNVERSE — UNIVERSAL GAMIFIED LEARNING APP
   Architecture: Subject Registry Pattern
   Adding new subjects = add entry to SUBJECT_REGISTRY + GAME_REGISTRY
================================================================ */

// ================================================================
// SUBJECT REGISTRY — THE EXTENSION POINT
// To add Science later: add an entry here + games in GAME_REGISTRY
// ================================================================

const APP = (() => {
  const S = {
    xp:       +localStorage.getItem('lv_xp')      || 0,
    played:   +localStorage.getItem('lv_played')  || 0,
    correct:  +localStorage.getItem('lv_correct') || 0,
    bestStreak: +localStorage.getItem('lv_streak')|| 0,
    // session
    selectedClass:   1,
    selectedSubject: 'math',
    selectedGame:    null,
    score:     0,
    qNum:      0,
    streak:    0,
    timeLeft:  30,
    timerInt:  null,
    maxQ:      10,
  };

  function save() {
    localStorage.setItem('lv_xp',      S.xp);
    localStorage.setItem('lv_played',  S.played);
    localStorage.setItem('lv_correct', S.correct);
    localStorage.setItem('lv_streak',  S.bestStreak);
  }

  function refreshStats() {
    ['xp','played','streak','correct'].forEach(k => {
      const map = {xp:S.xp, played:S.played, streak:S.bestStreak, correct:S.correct};
      const el = document.getElementById('st-'+k);
      if(el) el.textContent = map[k];
    });
    const hdr = document.getElementById('hdr-xp');
    if(hdr) hdr.textContent = S.xp;
  }

  // ── NAVIGATION ──────────────────────────────────────────────
  const nav = {
    history: ['home'],

    goHome() {
      nav.history = ['home'];
      showScreen('home');
      refreshStats();
    },

    openClass(cls) {
      S.selectedClass = cls;
      // if only one subject live, go straight to it
      nav.history.push('games');
      showScreen('games');
      renderGamesScreen(S.selectedSubject, cls);
    },

    openSubject(subjectId, cls) {
      S.selectedSubject = subjectId;
      S.selectedClass   = cls;
      nav.history.push('games');
      showScreen('games');
      renderGamesScreen(subjectId, cls);
    },

    startGame(gameId) {
      S.selectedGame = gameId;
      S.score  = 0; S.qNum = 0; S.streak = 0;
      clearInterval(S.timerInt);
      nav.history.push('play');
      showScreen('play');
      initHUD();
      loadQ(gameId);
    },

    goBack() {
      if(nav.history.length > 1) {
        nav.history.pop();
        const last = nav.history[nav.history.length-1];
        if(last==='home')  { nav.goHome(); }
        if(last==='games') { showScreen('games'); }
      } else { nav.goHome(); }
    }
  };

  // ── SCREEN RENDERER ─────────────────────────────────────────
  function showScreen(id) {
    // Only manage game-flow screens (home/games/play) — tab screens (map/pet) are managed by TABS
    ['scr-home','scr-games','scr-play'].forEach(s => {
      document.getElementById(s)?.classList.remove('active');
    });
    // Also hide map/pet when entering game flow
    document.getElementById('scr-map')?.classList.remove('active');
    document.getElementById('scr-pet')?.classList.remove('active');
    document.getElementById('scr-'+id)?.classList.add('active');
    const back = document.getElementById('nav-back');
    if (back) {
      back.style.display = id !== 'home' ? 'inline-flex' : 'none';
      back.classList.toggle('show', id !== 'home');
    }
    // Reset header tagline when returning home
    if (id === 'home') {
      const tagline = document.querySelector('.logo-tagline');
      if (tagline) tagline.textContent = 'FAST · FUN · SMART';
    }
  }

  function renderGamesScreen(subjectId, cls) {
    const subDef  = SUBJECT_REGISTRY[subjectId];
    const clsData = GAME_REGISTRY[subjectId]?.[cls];
    if(!clsData) return;

    // Title row
    document.getElementById('stitle-row').innerHTML = `
      <div class="stitle-icon ${subDef.iconClass}" style="background:linear-gradient(135deg,${subDef.color},${subDef.color}99)">${subDef.icon}</div>
      <div class="stitle-text">
        <h2>${subDef.name} — Class ${cls}</h2>
        <p>Choose a game and start your challenge!</p>
      </div>
    `;

    // Progress
    const pct = Math.min(100, (S.correct / (cls * 20)) * 100);
    document.getElementById('xp-fill').style.cssText = `width:${pct}%;background:${subDef.gradientFill}`;

    // Games
    const grid = document.getElementById('games-grid');
    grid.innerHTML = clsData.games.map((g,i) => {
      const diffClass = 'diff-'+(g.badge||g.diff);
      return `
        <div class="game-tile fade-in" style="animation-delay:${i*0.06}s" onclick="APP.nav.startGame('${g.id}')">
          <div class="tile-glow" style="background:${subDef.color}"></div>
          <span class="tile-diff ${diffClass}">${g.badge||g.diff}</span>
          <div class="tile-icon" style="background:${g.bg};border:1px solid rgba(255,255,255,0.08)">${g.icon}</div>
          <div class="tile-name">${g.name}</div>
          <div class="tile-desc">${g.desc}</div>
        </div>
      `;
    }).join('');

    // Tip
    const tc = document.getElementById('tip-card');
    tc.style.display = 'flex';
    document.getElementById('tip-title').textContent = clsData.tip.title;
    document.getElementById('tip-body').textContent  = clsData.tip.body;
  }

  // ── HUD ─────────────────────────────────────────────────────
  function initHUD() {
    document.getElementById('hud-score').textContent = '0';
    document.getElementById('hud-q').textContent     = `1/${S.maxQ}`;
    const dots = document.getElementById('streak-dots');
    dots.innerHTML = Array.from({length:5},(_,i)=>`<div class="s-dot" id="dot-${i}"></div>`).join('');
  }

  function updateHUD() {
    document.getElementById('hud-score').textContent = S.score;
    document.getElementById('hud-q').textContent     = `${S.qNum}/${S.maxQ}`;
  }

  function startTimer(secs) {
    clearInterval(S.timerInt);
    S.timeLeft = secs;
    const fill = document.getElementById('arc-fill');
    const num  = document.getElementById('arc-num');
    const C    = 151;
    function tick() {
      const r = S.timeLeft/secs;
      fill.style.strokeDashoffset = C*(1-r);
      fill.style.stroke = S.timeLeft>8 ? SUBJECT_REGISTRY[S.selectedSubject].timerColor : '#ff4757';
      num.textContent   = S.timeLeft;
      if(S.timeLeft <= 0) { clearInterval(S.timerInt); onWrong(); }
    }
    tick();
    S.timerInt = setInterval(()=>{ S.timeLeft--; tick(); }, 1000);
  }

  // ── QUESTION LOADER ─────────────────────────────────────────
  function loadQ(gameId) {
    S.qNum++;
    updateHUD();
    startTimer(30);
    const pc = document.getElementById('play-content');
    GAME_RENDERERS[gameId] ? GAME_RENDERERS[gameId](pc) : GAME_RENDERERS['quiz_add1'](pc);
  }

  // ── ANSWER HANDLERS ─────────────────────────────────────────
  function onCorrect() {
    S.streak++; S.correct++; S.score += 10 + (S.streak>2?5:0);
    if(S.streak>S.bestStreak) S.bestStreak=S.streak;
    save();
    lightDot();
    floatFeedback('✓', '#2ed573');
    setTimeout(()=>nextOrFinish(), 850);
  }
  function onWrong() {
    clearInterval(S.timerInt);
    S.streak = 0;
    resetDots();
    floatFeedback('✗', '#ff4757');
    save();
    setTimeout(()=>nextOrFinish(), 1100);
  }
  function nextOrFinish() {
    if(S.qNum < S.maxQ) loadQ(S.selectedGame);
    else                showReward();
  }
  function lightDot() {
    const idx = Math.min(S.streak-1,4);
    const d   = document.getElementById('dot-'+idx);
    if(d) d.classList.add('lit');
    if(S.streak>=5) { resetDots(); S.score+=25; updateHUD(); floatFeedback('🔥+25','#ffd700'); }
  }
  function resetDots() {
    document.querySelectorAll('.s-dot').forEach(d=>d.classList.remove('lit'));
  }

  // ── REWARD ──────────────────────────────────────────────────
  function showReward() {
    clearInterval(S.timerInt);
    S.played++; S.xp += S.score; save();
    const stars = S.score>=85?3:S.score>=50?2:1;
    const msgs  = [
      ['🌟 Perfect!',   'Incredible! You are a true maths champion!',          '🏆'],
      ['👏 Well Done!', 'Great effort! Every practice makes you stronger.',     '🎊'],
      ['💪 Good Try!',  'Keep going — every mistake is a lesson in disguise!',  '🎈'],
    ];
    const [title,msg,emoji] = msgs[3-stars];
    document.getElementById('r-emoji').textContent = emoji;
    document.getElementById('r-title').textContent = title;
    document.getElementById('r-score').textContent = `${S.score} pts earned!`;
    document.getElementById('r-msg').innerHTML     = msg;
    const sr = document.getElementById('r-stars');
    sr.innerHTML = [1,2,3].map(i=>`<span class="r-star">${i<=stars?'⭐':'☆'}</span>`).join('');
    makeConfetti();
    document.getElementById('reward-overlay').classList.add('show');
    refreshStats();
  }
  function makeConfetti() {
    const c = document.getElementById('reward-confetti');
    c.innerHTML='';
    const cols=['#ffd700','#ff6b35','#00d4aa','#a855f7','#ff6b9d','#2ed573'];
    for(let i=0;i<70;i++){
      const p=document.createElement('div');
      p.className='confetti-piece';
      p.style.cssText=`left:${Math.random()*100}%;background:${cols[Math.floor(Math.random()*cols.length)]};
        width:${6+Math.random()*10}px;height:${6+Math.random()*10}px;
        animation:cFall ${1.4+Math.random()*1.8}s ${Math.random()*0.8}s linear forwards;
        border-radius:${Math.random()>.5?'50%':'3px'};`;
      c.appendChild(p);
    }
  }

  function playAgain()   { document.getElementById('reward-overlay').classList.remove('show'); APP.nav.startGame(S.selectedGame); }
  function closeReward() { document.getElementById('reward-overlay').classList.remove('show'); nav.goBack(); }

  function floatFeedback(sym, col) {
    const el=document.createElement('div');
    el.className='float-feedback'; el.textContent=sym; el.style.color=col;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),950);
  }

  // init
  refreshStats();
  buildStarfield();

  return { nav, state:S, playAgain, closeReward, refreshStats };
})();

// Expose nav globally so HTML onclick="nav.xxx()" works
const nav = APP.nav;


const THEME = (() => {
  const STORAGE_KEY = 'zl_theme';
  const DARK_META   = '#1a0533';
  const LIGHT_META  = '#f0edff';

  function apply(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);

    // Update meta theme-color (Android status bar)
    const meta = document.getElementById('meta-theme-color');
    if (meta) meta.setAttribute('content', theme === 'dark' ? DARK_META : LIGHT_META);

    // Update toggle icon
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';

    // Update nebula colors dynamically
    const nebulas = document.querySelectorAll('.nebula');
    if (theme === 'light') {
      const lc = ['rgba(99,102,241,0.07)','rgba(139,92,246,0.06)','rgba(236,72,153,0.05)'];
      nebulas.forEach((n,i) => n.style.background = lc[i] || lc[0]);
    } else {
      const dc = ['rgba(99,102,241,0.13)','rgba(139,92,246,0.10)','rgba(236,72,153,0.08)'];
      nebulas.forEach((n,i) => n.style.background = dc[i] || dc[0]);
    }

    // Persist
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    apply(current === 'dark' ? 'light' : 'dark');
  }

  // Init on load: saved pref → system pref → dark default
  function init() {
    const saved  = localStorage.getItem(STORAGE_KEY);
    const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    apply(saved || system);

    // Also react to OS-level changes (when no user pref saved)
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) apply(e.matches ? 'light' : 'dark');
    });
  }

  init();
  return { toggle, apply };
})();

// ================================================================
//  PWA SERVICE WORKER — AUTO-UPDATE SYSTEM
//  Flow:
//    1. SW installs in background after deploy
//    2. SW posts UPDATE_AVAILABLE message to this tab
//    3. We show a non-intrusive toast at the bottom
//    4. User taps "Update" → send SKIP_WAITING → reload
//    5. On reload, new SW activates, old cache is deleted
// ================================================================
(function initSW() {
  if (!('serviceWorker' in navigator)) return;

  let newWorker = null;

  // ── Register SW ──────────────────────────────────────────
  navigator.serviceWorker.register('sw.js')
    .then(registration => {
      console.log('[App] SW registered, scope:', registration.scope);

      // Check for updates every time the page gains focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });

      // Also check every 60 minutes while tab is open
      setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);

      // A new SW is waiting (already installed, pending activation)
      registration.addEventListener('updatefound', () => {
        newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          // New SW has installed and is waiting — show toast
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[App] New version ready');
            showUpdateToast();
          }
        });
      });

      // If there's already a waiting SW on load (e.g. refreshed tab)
      if (registration.waiting && navigator.serviceWorker.controller) {
        newWorker = registration.waiting;
        showUpdateToast();
      }
    })
    .catch(err => console.warn('[App] SW registration failed:', err));

  // ── Listen for messages from SW ──────────────────────────
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'UPDATE_AVAILABLE') {
      console.log('[App] SW broadcast: update available, version', event.data.version);
      // Small delay so the page finishes loading first
      setTimeout(showUpdateToast, 2000);
    }
    if (event.data?.type === 'VERSION') {
      console.log('[App] Current SW version:', event.data.version);
    }
  });

  // ── After skipWaiting, reload all tabs ───────────────────
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    console.log('[App] New SW activated — reloading');
    window.location.reload();
  });

  // ── Update Toast UI ──────────────────────────────────────
  function showUpdateToast() {
    // Don't show twice
    if (document.getElementById('update-toast')) return;

    const toast = document.createElement('div');
    toast.id = 'update-toast';
    toast.innerHTML = `
      <div style="
        position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
        z-index:9999; display:flex; align-items:center; gap:14px;
        background:#1e0a3c; border:1px solid rgba(99,102,241,0.4);
        border-radius:16px; padding:14px 20px;
        box-shadow:0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15);
        max-width:calc(100vw - 40px);
        animation: toastSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        font-family:'Nunito',sans-serif;
      ">
        <span style="font-size:22px">⚡</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:2px">New version ready!</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);">Tap update to get the latest games</div>
        </div>
        <button id="update-btn" style="
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          border:none; border-radius:10px; padding:9px 18px;
          color:#fff; font-family:'Nunito',sans-serif; font-weight:800; font-size:13px;
          cursor:pointer; white-space:nowrap;
          box-shadow:0 4px 12px rgba(99,102,241,0.4);
        ">Update ↑</button>
        <button id="dismiss-btn" style="
          background:transparent; border:none; color:rgba(255,255,255,0.3);
          font-size:18px; cursor:pointer; padding:0 4px; line-height:1;
        ">×</button>
      </div>
      <style>
        @keyframes toastSlideUp {
          from { opacity:0; transform:translateX(-50%) translateY(20px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      </style>
    `;
    document.body.appendChild(toast);

    // Update button — tell SW to activate
    document.getElementById('update-btn').addEventListener('click', () => {
      toast.remove();
      const sw = newWorker
        || (navigator.serviceWorker.getRegistration
            ? null  // will be resolved below
            : null);

      // Send SKIP_WAITING to the waiting SW
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        });
      }
    });

    // Dismiss button — hide for this session (update will still apply next reload)
    document.getElementById('dismiss-btn').addEventListener('click', () => toast.remove());

    // Auto-dismiss after 15 seconds if user doesn't interact
    setTimeout(() => toast?.remove(), 15000);
  }
})();
