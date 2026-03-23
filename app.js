// app.js — APP module, nav, buildStarfield, THEME, Service Worker
/* jshint esversion:6 */

const APP = (() => {
  const S = {
    // Global XP (maths) — kept for backward compat
    xp:         +localStorage.getItem('lv_xp')      || 0,
    played:     +localStorage.getItem('lv_played')  || 0,
    correct:    +localStorage.getItem('lv_correct') || 0,
    bestStreak: +localStorage.getItem('lv_streak')  || 0,
    // Per-subject XP (Science & English companions)
    sciXp:      +localStorage.getItem('lv_sci_xp')  || 0,
    engXp:      +localStorage.getItem('lv_eng_xp')  || 0,
    // session
    selectedClass:   1,
    selectedSubject: 'math',
    selectedGame:    null,
    score:  0, qNum: 0, streak: 0, timeLeft: 30, timerInt: null, maxQ: 10,
  };

  function save() {
    localStorage.setItem('lv_xp',      S.xp);
    localStorage.setItem('lv_played',  S.played);
    localStorage.setItem('lv_correct', S.correct);
    localStorage.setItem('lv_streak',  S.bestStreak);
    localStorage.setItem('lv_sci_xp',  S.sciXp);
    localStorage.setItem('lv_eng_xp',  S.engXp);
  }

  function refreshStats() {
    const map = {xp:S.xp, played:S.played, streak:S.bestStreak, correct:S.correct};
    Object.entries(map).forEach(([k,v]) => { const el=document.getElementById('st-'+k); if(el) el.textContent=v; });
    const hdr = document.getElementById('hdr-xp');
    if (hdr) hdr.textContent = S.xp;
    // Per-subject XP pills
    const sciEl = document.getElementById('hdr-sci-xp'); if (sciEl) sciEl.textContent = S.sciXp;
    const engEl = document.getElementById('hdr-eng-xp'); if (engEl) engEl.textContent = S.engXp;
  }

  // ── NAVIGATION ──────────────────────────────────────────────
  const nav = {
    history: ['home'],

    goHome() { nav.history=['home']; showScreen('home'); refreshStats(); },

    openClass(cls) {
      S.selectedClass = cls;
      // If multiple subjects are live, show the subject select (handled by subjectCount check)
      const liveSubjects = Object.keys(SUBJECT_REGISTRY);
      if (liveSubjects.length === 1) {
        nav.openSubject(liveSubjects[0], cls);
      } else {
        nav.openSubject(S.selectedSubject, cls);
      }
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
      S.score=0; S.qNum=0; S.streak=0;
      clearInterval(S.timerInt);
      nav.history.push('play');
      showScreen('play');
      initHUD();
      loadQ(gameId);
    },

    goBack() {
      if(nav.history.length>1) {
        nav.history.pop();
        const last = nav.history[nav.history.length-1];
        if(last==='home')  nav.goHome();
        if(last==='games') showScreen('games');
      } else nav.goHome();
    }
  };

  // ── SCREEN RENDERER ─────────────────────────────────────────
  function showScreen(id) {
    ['scr-home','scr-games','scr-play','scr-map','scr-pet','scr-castle','scr-lab'].forEach(s => {
      document.getElementById(s)?.classList.remove('active');
    });
    document.getElementById('scr-'+id)?.classList.add('active');
    const back = document.getElementById('nav-back');
    if (back) { back.style.display=id!=='home'?'inline-flex':'none'; back.classList.toggle('show',id!=='home'); }
    if (id==='home') { const t=document.querySelector('.logo-tagline'); if(t) t.textContent='FAST · FUN · SMART'; }
  }

  function renderGamesScreen(subjectId, cls) {
    const subDef  = SUBJECT_REGISTRY[subjectId];
    const clsData = GAME_REGISTRY[subjectId]?.[cls];
    if (!clsData) return;

    document.getElementById('stitle-row').innerHTML = `
      <div class="stitle-icon ${subDef.iconClass}" style="background:linear-gradient(135deg,${subDef.color},${subDef.color}99)">${subDef.icon}</div>
      <div class="stitle-text">
        <h2>${subDef.name} — Class ${cls}</h2>
        <p>Choose a game and start your challenge!</p>
      </div>`;

    // Subject tab switcher (show all live subjects)
    const tabRow = document.getElementById('subject-tab-row');
    if (tabRow) {
      tabRow.innerHTML = Object.values(SUBJECT_REGISTRY).map(s =>
        `<button class="subj-tab-btn ${s.id===subjectId?'stb-active':''}"
                 style="${s.id===subjectId?`border-color:${s.color};color:${s.color};background:${s.color}18`:''}"
                 onclick="nav.openSubject('${s.id}',${cls})">
           ${s.icon} ${s.name.split(' ')[0]}
         </button>`
      ).join('');
    }

    const pct = Math.min(100, (S.correct / (cls*20)) * 100);
    document.getElementById('xp-fill').style.cssText = `width:${pct}%;background:${subDef.gradientFill}`;

    const grid = document.getElementById('games-grid');
    grid.innerHTML = clsData.games.map((g,i) => `
      <div class="game-tile fade-in" style="animation-delay:${i*0.06}s" onclick="APP.nav.startGame('${g.id}')">
        <div class="tile-glow" style="background:${subDef.color}"></div>
        <span class="tile-diff diff-${g.badge||g.diff}">${g.badge||g.diff}</span>
        <div class="tile-icon" style="background:${g.bg};border:1px solid rgba(255,255,255,0.08)">${g.icon}</div>
        <div class="tile-name">${g.name}</div>
        <div class="tile-desc">${g.desc}</div>
      </div>`).join('');

    const tc = document.getElementById('tip-card');
    if (tc) { tc.style.display='flex'; document.getElementById('tip-title').textContent=clsData.tip.title; document.getElementById('tip-body').textContent=clsData.tip.body; }
  }

  // ── HUD ─────────────────────────────────────────────────────
  function initHUD() {
    document.getElementById('hud-score').textContent = '0';
    document.getElementById('hud-q').textContent = `1/${S.maxQ}`;
    const dots = document.getElementById('streak-dots');
    dots.innerHTML = Array.from({length:5},(_,i)=>`<div class="s-dot" id="dot-${i}"></div>`).join('');
  }
  function updateHUD() {
    document.getElementById('hud-score').textContent = S.score;
    document.getElementById('hud-q').textContent = `${S.qNum}/${S.maxQ}`;
  }
  function startTimer(secs) {
    clearInterval(S.timerInt); S.timeLeft=secs;
    const fill=document.getElementById('arc-fill'), num=document.getElementById('arc-num'), C=151;
    function tick(){const r=S.timeLeft/secs;fill.style.strokeDashoffset=C*(1-r);fill.style.stroke=S.timeLeft>8?SUBJECT_REGISTRY[S.selectedSubject].timerColor:'#ff4757';num.textContent=S.timeLeft;if(S.timeLeft<=0){clearInterval(S.timerInt);onWrong();}}
    tick(); S.timerInt=setInterval(()=>{S.timeLeft--;tick();},1000);
  }

  // ── QUESTION LOADER ─────────────────────────────────────────
  function loadQ(gameId) {
    S.qNum++; updateHUD(); startTimer(30);
    const pc = document.getElementById('play-content');
    const renderer = GAME_RENDERERS[gameId] || GAME_RENDERERS['quiz_add1'];
    renderer(pc);
  }

  // ── ANSWER HANDLERS ─────────────────────────────────────────
  function onCorrect() {
    S.streak++; S.correct++; S.score+=10+(S.streak>2?5:0);
    if(S.streak>S.bestStreak) S.bestStreak=S.streak;
    // Route XP to the right subject bucket
    if (S.selectedSubject === 'sci') S.sciXp += 5;
    else if (S.selectedSubject === 'eng') S.engXp += 5;
    save(); lightDot(); floatFeedback('✓','#2ed573'); setTimeout(()=>nextOrFinish(),850);
  }
  function onWrong() {
    clearInterval(S.timerInt); S.streak=0; resetDots();
    floatFeedback('✗','#ff4757'); save(); setTimeout(()=>nextOrFinish(),1100);
  }
  function nextOrFinish() { if(S.qNum<S.maxQ) loadQ(S.selectedGame); else showReward(); }
  function lightDot() {
    const idx=Math.min(S.streak-1,4), d=document.getElementById('dot-'+idx);
    if(d) d.classList.add('lit');
    if(S.streak>=5){resetDots();S.score+=25;updateHUD();floatFeedback('🔥+25','#ffd700');}
  }
  function resetDots(){document.querySelectorAll('.s-dot').forEach(d=>d.classList.remove('lit'));}

  // ── REWARD ──────────────────────────────────────────────────
  function showReward() {
    clearInterval(S.timerInt);
    S.played++; S.xp+=S.score; save();
    const stars=S.score>=85?3:S.score>=50?2:1;
    // Subject-aware messages
    const subj = S.selectedSubject;
    const msgs = subj==='sci' ? [
      ['🔬 Perfect Scientist!', 'You\'ve mastered this experiment!', '🏆'],
      ['⚗️ Great Discovery!',   'Your lab skills are growing!',     '🎊'],
      ['💡 Keep Experimenting!','Every hypothesis teaches us more!', '🎈'],
    ] : subj==='eng' ? [
      ['📖 Perfect Author!',    'Your words are truly magical!',    '🏆'],
      ['✍️ Well Written!',      'Your castle grows stronger!',      '🎊'],
      ['📝 Keep Writing!',      'Every story makes you better!',    '🎈'],
    ] : [
      ['🌟 Perfect!',           'Incredible! You are a true maths champion!', '🏆'],
      ['👏 Well Done!',         'Great effort! Every practice makes you stronger.','🎊'],
      ['💪 Good Try!',          'Keep going — every mistake is a lesson!',    '🎈'],
    ];
    const [title,msg,emoji] = msgs[3-stars];
    document.getElementById('r-emoji').textContent = emoji;
    document.getElementById('r-title').textContent = title;
    document.getElementById('r-score').textContent = `${S.score} pts earned!`;
    document.getElementById('r-msg').innerHTML = msg;
    document.getElementById('r-stars').innerHTML = [1,2,3].map(i=>`<span class="r-star">${i<=stars?'⭐':'☆'}</span>`).join('');
    makeConfetti(); document.getElementById('reward-overlay').classList.add('show'); refreshStats();
  }
  function makeConfetti() {
    const c=document.getElementById('reward-confetti'); c.innerHTML='';
    const cols=['#ffd700','#ff6b35','#00d4aa','#a855f7','#ff6b9d','#2ed573'];
    for(let i=0;i<70;i++){const p=document.createElement('div');p.className='confetti-piece';p.style.cssText=`left:${Math.random()*100}%;background:${cols[Math.floor(Math.random()*cols.length)]};width:${6+Math.random()*10}px;height:${6+Math.random()*10}px;animation:cFall ${1.4+Math.random()*1.8}s ${Math.random()*0.8}s linear forwards;border-radius:${Math.random()>.5?'50%':'3px'};`;c.appendChild(p);}
  }

  function playAgain()   { document.getElementById('reward-overlay').classList.remove('show'); APP.nav.startGame(S.selectedGame); }
  function closeReward() { document.getElementById('reward-overlay').classList.remove('show'); nav.goBack(); }
  function floatFeedback(sym,col){const el=document.createElement('div');el.className='float-feedback';el.textContent=sym;el.style.color=col;document.body.appendChild(el);setTimeout(()=>el.remove(),950);}

  refreshStats(); buildStarfield();
  return { nav, state:S, playAgain, closeReward, refreshStats };
})();

const nav = APP.nav;

// ── THEME ────────────────────────────────────────────────────
const THEME = (() => {
  const KEY='zl_theme', DM='#1a0533', LM='#f0edff';
  function apply(t){
    document.documentElement.setAttribute('data-theme',t);
    const m=document.getElementById('meta-theme-color'); if(m) m.setAttribute('content',t==='dark'?DM:LM);
    const b=document.getElementById('theme-toggle'); if(b) b.textContent=t==='dark'?'☀️':'🌙';
    const ns=document.querySelectorAll('.nebula');
    const cols=t==='light'?['rgba(99,102,241,0.07)','rgba(139,92,246,0.06)','rgba(236,72,153,0.05)']:['rgba(99,102,241,0.13)','rgba(139,92,246,0.10)','rgba(236,72,153,0.08)'];
    ns.forEach((n,i)=>n.style.background=cols[i]||cols[0]);
    localStorage.setItem(KEY,t);
  }
  function toggle(){const c=document.documentElement.getAttribute('data-theme')||'dark';apply(c==='dark'?'light':'dark');}
  function init(){const s=localStorage.getItem(KEY),sys=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';apply(s||sys);window.matchMedia('(prefers-color-scheme: light)').addEventListener('change',e=>{if(!localStorage.getItem(KEY))apply(e.matches?'light':'dark');});}
  init(); return { toggle, apply };
})();

// ── SERVICE WORKER ───────────────────────────────────────────
(function initSW() {
  if (!('serviceWorker' in navigator)) return;
  let newWorker = null;
  navigator.serviceWorker.register('sw.js')
    .then(reg => {
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{});});
      setInterval(()=>reg.update().catch(()=>{}),60*60*1000);
      reg.addEventListener('updatefound',()=>{
        newWorker=reg.installing; if(!newWorker)return;
        newWorker.addEventListener('statechange',()=>{if(newWorker.state==='installed'&&navigator.serviceWorker.controller)showToast();});
      });
      if(reg.waiting&&navigator.serviceWorker.controller){newWorker=reg.waiting;showToast();}
    }).catch(e=>console.warn('[App] SW failed:',e));
  navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='UPDATE_AVAILABLE')setTimeout(showToast,2000);});
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;window.location.reload();});
  function showToast(){
    if(document.getElementById('update-toast'))return;
    const t=document.createElement('div'); t.id='update-toast';
    t.innerHTML=`<div style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:14px;background:#1e0a3c;border:1px solid rgba(99,102,241,0.4);border-radius:16px;padding:14px 20px;box-shadow:0 8px 32px rgba(0,0,0,0.5);max-width:calc(100vw - 40px);animation:toastSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;font-family:'Nunito',sans-serif;"><span style="font-size:22px">⚡</span><div style="flex:1"><div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:2px">New version ready!</div><div style="font-size:11px;color:rgba(255,255,255,0.45)">Tap update for the latest games</div></div><button id="update-btn" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:10px;padding:9px 18px;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:13px;cursor:pointer">Update ↑</button><button id="dismiss-btn" style="background:transparent;border:none;color:rgba(255,255,255,0.3);font-size:18px;cursor:pointer;padding:0 4px">×</button></div><style>@keyframes toastSlideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>`;
    document.body.appendChild(t);
    document.getElementById('update-btn').addEventListener('click',()=>{t.remove();if(newWorker)newWorker.postMessage({type:'SKIP_WAITING'});else navigator.serviceWorker.getRegistration().then(r=>{if(r?.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});});});
    document.getElementById('dismiss-btn').addEventListener('click',()=>t.remove());
    setTimeout(()=>t?.remove(),15000);
  }
})();
