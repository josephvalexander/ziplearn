// gamification.js — LEVELS, BADGE_DEFS, SOUND, PARTICLES, MASCOT,
//                    COMBO, POWERUPS, GQ, DAILY, level/badge helpers, init
/* jshint esversion:6 */

const LEVELS=[
  {level:1,name:'Cub',       mascot:'🦊',xp:0},    {level:2,name:'Explorer',  mascot:'🦊',xp:100},
  {level:3,name:'Adventurer',mascot:'🦝',xp:250},  {level:4,name:'Scholar',   mascot:'🦁',xp:500},
  {level:5,name:'Ace',       mascot:'🐯',xp:900},  {level:6,name:'Champion',  mascot:'🦅',xp:1400},
  {level:7,name:'Legend',    mascot:'🐉',xp:2000}, {level:8,name:'Math Wizard',mascot:'🧙',xp:3000},
];
function getLevel(xp){let l=LEVELS[0];for(const x of LEVELS){if(xp>=x.xp)l=x;else break;}return l;}
function getNextLevel(xp){for(const x of LEVELS){if(xp<x.xp)return x;}return null;}

// ── BADGES ───────────────────────────────────────────────────
const BADGE_DEFS=[
  {id:'first_game',   icon:'🎮',name:'First Game',   check:s=>s.played>=1},
  {id:'speed_five',   icon:'⚡',name:'Lightning',    check:s=>s.bestStreak>=5},
  {id:'ten_games',    icon:'🎯',name:'Dedicated',    check:s=>s.played>=10},
  {id:'fifty_correct',icon:'✅',name:'Half Century', check:s=>s.correct>=50},
  {id:'perfect_game', icon:'💎',name:'Perfect!',     check:s=>(s.perfectGames||0)>=1},
  {id:'hundred_xp',   icon:'🏅',name:'Century',      check:s=>s.xp>=100},
  {id:'five_hundred', icon:'🏆',name:'500 Club',     check:s=>s.xp>=500},
  {id:'level4',       icon:'🦁',name:'Scholar',      check:s=>(s.level||1)>=4},
  {id:'level6',       icon:'🦅',name:'Champion',     check:s=>(s.level||1)>=6},
  {id:'powerup_used', icon:'🧊',name:'Power Player', check:s=>(s.powerupsUsed||0)>=1},
  {id:'class4_play',  icon:'🚀',name:'Class 4 Hero', check:s=>!!s.playedClass4},
  {id:'streak_3days', icon:'🔥',name:'On Fire',      check:s=>(s.dailyStreak||0)>=3},
];

// ── SOUND (Web Audio API, no files) ──────────────────────────
const SOUND=(()=>{
  let ctx=null,on=JSON.parse(localStorage.getItem('zl_sound')?? 'true');
  function gc(){if(!ctx)try{ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}return ctx;}
  function tone(f,d=0.12,t='sine',v=0.25,delay=0){
    const c=gc();if(!c||!on)return;
    const o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);
    o.type=t;o.frequency.value=f;
    g.gain.setValueAtTime(v,c.currentTime+delay);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+delay+d);
    o.start(c.currentTime+delay);o.stop(c.currentTime+delay+d+0.02);
  }
  return{
    correct(){tone(523,0.07);tone(659,0.09,undefined,undefined,0.08);tone(784,0.13,undefined,0.3,0.16);},
    wrong()  {tone(220,0.18,'sawtooth',0.12);tone(185,0.2,'sawtooth',0.12,0.14);},
    levelup(){[523,659,784,1047].forEach((f,i)=>tone(f,0.2,undefined,0.28,i*0.1));},
    badge()  {tone(880,0.1);tone(1047,0.14,undefined,undefined,0.1);},
    combo()  {tone(600+((APP?.state?.streak||0)*25),0.08);},
    powerup(){tone(600,0.08,'triangle');tone(800,0.12,'triangle',undefined,0.08);},
    toggle() {on=!on;localStorage.setItem('zl_sound',on);return on;},
    isOn()   {return on;}
  };
})();

// ── PARTICLES ────────────────────────────────────────────────
const PARTICLES={
  burst(x,y,n=12,cols=['#ffd700','#ff6b35','#2ed573','#818cf8','#ff6b9d']){
    for(let i=0;i<n;i++){
      const el=document.createElement('div');
      el.className='burst-particle';
      const a=(i/n)*Math.PI*2,d=40+Math.random()*60,sz=6+Math.random()*8;
      el.style.cssText=`left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${cols[i%cols.length]};--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d-40}px;--dur:${0.5+Math.random()*0.35}s;animation-delay:${Math.random()*0.08}s;`;
      document.body.appendChild(el);setTimeout(()=>el.remove(),900);
    }
  },
  stars(x,y,n=5){
    ['⭐','✨','💫','🌟'].forEach((em,i)=>{
      if(i>=n)return;
      const el=document.createElement('div');el.className='burst-star';
      const a=(i/n)*Math.PI*2-Math.PI/2,d=50+Math.random()*40;
      el.textContent=em;
      el.style.cssText=`left:${x}px;top:${y}px;--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d-30}px;--dur:${0.8+Math.random()*0.4}s;--sz:${18+Math.random()*10}px;animation-delay:${i*0.06}s;`;
      document.body.appendChild(el);setTimeout(()=>el.remove(),1300);
    });
  },
  flash(type){
    const f=document.getElementById('screen-flash');
    if(!f)return;
    f.className=`screen-flash ${type}-flash active`;
    setTimeout(()=>f.classList.remove('active'),160);
  }
};

// ── RESULT POPUP ─────────────────────────────────────────────
function showResultPopup(text,color){
  const w=document.createElement('div');w.className='result-popup';
  w.innerHTML=`<div class="result-popup-inner" style="color:${color}">${text}</div>`;
  document.body.appendChild(w);setTimeout(()=>w.remove(),950);
}

// ── MASCOT ───────────────────────────────────────────────────
const MASCOT_MSGS={
  home:   ['Let\'s go! 🎮','You can do it! 💪','Maths is fun! 🔢','Ready? ⚡'],
  correct:['Brilliant! 🌟','Nailed it! 🎯','Superstar! ✨','So smart! 🧠'],
  wrong:  ['Try again! 💪','Almost! 🤏','You\'ll get it! 🌟'],
  combo:  ['COMBO! 🔥','On fire! 🔥🔥','Unstoppable! ⚡','LEGEND! 🏆'],
};
const MASCOT={
  say(pool='home',custom=null){
    const el=document.getElementById('mascot-speech-home');
    if(!el)return;
    const msgs=MASCOT_MSGS[pool]||MASCOT_MSGS.home;
    el.textContent=custom||msgs[Math.floor(Math.random()*msgs.length)];
    el.classList.add('show');
    clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200);
  },
  react(id,emotion){
    const el=document.getElementById(id);if(!el)return;
    el.classList.remove('happy','sad','levelup');
    void el.offsetWidth;
    el.classList.add(emotion);
    setTimeout(()=>el.classList.remove(emotion),800);
  },
  updateAll(xp){
    const m=getLevel(xp).mascot;
    const h=document.getElementById('mascot-home');
    const g=document.getElementById('game-mascot');
    if(h)h.textContent=m;if(g)g.textContent=m;
  }
};

// ── COMBO ────────────────────────────────────────────────────
const COMBO={count:0,mult:1,
  inc(){
    this.count++;
    this.mult=Math.min(1+Math.floor(this.count/2)*0.5,3);
    if(this.count>=2){
      const d=document.getElementById('combo-display'),n=document.getElementById('combo-num'),c=document.getElementById('combo-chip');
      if(n)n.textContent='x'+this.mult.toFixed(1);
      if(d)d.classList.add('show');
      if(c){c.style.display='block';const cv=document.getElementById('hud-combo');if(cv)cv.textContent='x'+this.mult.toFixed(1);}
      SOUND.combo();
      if(this.count>=3)MASCOT.say('combo');
    }
  },
  reset(){
    this.count=0;this.mult=1;
    const d=document.getElementById('combo-display'),c=document.getElementById('combo-chip');
    if(d)d.classList.remove('show');if(c)c.style.display='none';
  },
  bonus(base){return Math.round(base*this.mult);}
};

// ── POWER-UPS ────────────────────────────────────────────────
const POWERUPS=(()=>{
  let stock={freeze:1,fifty:1,skip:1};
  function ui(){
    ['freeze','fifty','skip'].forEach(id=>{
      const btn=document.getElementById('pu-'+id),cnt=document.getElementById('pu-'+id+'-count');
      if(!btn)return;
      btn.classList.toggle('empty',stock[id]<=0);
      if(cnt)cnt.textContent=stock[id];
    });
  }
  function use(type){
    if(!stock[type])return;
    stock[type]--;ui();
    SOUND.powerup();
    APP.state.powerupsUsed=(APP.state.powerupsUsed||0)+1;
    if(type==='freeze'){
      clearInterval(APP.state.timerInt);
      const f=document.getElementById('arc-fill');if(f)f.style.stroke='#48cae4';
      showResultPopup('🧊 FROZEN!','#48cae4');
      PARTICLES.burst(window.innerWidth/2,window.innerHeight/2,10,['#48cae4','#caf0f8','#00d4aa']);
      setTimeout(()=>{if(typeof window._startTimerExt==='function')window._startTimerExt();},10000);
    }
    if(type==='fifty'){
      const correct=String(APP.state._curCorrect);
      const wrongs=[...document.querySelectorAll('.opt-btn')].filter(b=>b.dataset.val!==correct&&!b.classList.contains('correct')&&!b.classList.contains('wrong'));
      shuffle(wrongs).slice(0,2).forEach(b=>{b.style.opacity='0.18';b.style.pointerEvents='none';b.style.transform='scale(0.85)';});
      showResultPopup('✂️ 50/50!','#ffd700');
    }
    if(type==='skip'){
      clearInterval(APP.state.timerInt);
      showResultPopup('⏭️ SKIP!','#a78bfa');
      GQ.markResult('s');
      setTimeout(()=>GQ.next(),500);
    }
  }
  return{use,refill(){stock={freeze:1,fifty:1,skip:1};ui();},ui};
})();

// ── QUESTION PROGRESS ─────────────────────────────────────────
const GQ={
  results:[],
  init(){
    this.results=[];
    const w=document.getElementById('q-progress-dots');
    if(!w)return;
    w.innerHTML='';
    for(let i=0;i<APP.state.maxQ;i++)w.innerHTML+=`<div class="q-dot" id="qd-${i}"></div>`;
    this.updateDots();
  },
  updateDots(){
    for(let i=0;i<APP.state.maxQ;i++){
      const d=document.getElementById('qd-'+i);if(!d)continue;
      d.classList.remove('correct','wrong','current');
      if(i<APP.state.qNum-1){if(this.results[i])d.classList.add(this.results[i]==='c'?'correct':'wrong');}
      else if(i===APP.state.qNum-1)d.classList.add('current');
    }
  },
  markResult(r){this.results[APP.state.qNum-1]=r;this.updateDots();},
  next(){
    if(APP.state.qNum<APP.state.maxQ){
      APP.state.qNum++;
      const ql=document.getElementById('hud-q');if(ql)ql.textContent=`Q ${APP.state.qNum}/${APP.state.maxQ}`;
      this.updateDots();
      clearInterval(APP.state.timerInt);
      GAME_RENDERERS[APP.state.selectedGame](document.getElementById('play-content'));
      window._startTimerExt();
    } else {
      window._showRewardExt();
    }
  }
};

// ── DAILY STREAK ─────────────────────────────────────────────
const DAILY=(()=>{
  const K='zl_daily';
  function today(){return new Date().toISOString().slice(0,10);}
  function load(){return JSON.parse(localStorage.getItem(K)||'{"streak":0,"lastPlay":null,"history":[]}');}
  function save(d){localStorage.setItem(K,JSON.stringify(d));}
  function checkIn(){
    const d=load(),t=today(),yest=new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(d.lastPlay===t)return d;
    d.streak=d.lastPlay===yest?d.streak+1:1;
    d.lastPlay=t;d.history=(d.history||[]);
    if(!d.history.includes(t))d.history.push(t);
    d.history=d.history.slice(-30);
    save(d);return d;
  }
  function renderCal(){
    const d=load(),row=document.getElementById('streak-days-row'),cnt=document.getElementById('streak-count-display');
    if(!row)return;
    const days=['M','T','W','T','F','S','S'],t=today();
    row.innerHTML='';
    for(let i=6;i>=0;i--){
      const dt=new Date(Date.now()-i*86400000),ds=dt.toISOString().slice(0,10);
      const div=document.createElement('div');
      const dow=dt.getDay();const di=dow===0?6:dow-1;
      div.className='streak-day'+(d.history?.includes(ds)?' played':'')+(ds===t?' today':'');
      div.textContent=days[di];row.appendChild(div);
    }
    if(cnt)cnt.textContent=d.streak;
    return d;
  }
  return{checkIn,renderCal,load};
})();

// ── LEVEL UI ─────────────────────────────────────────────────
function updateLevelUI(xp){
  const lvl=getLevel(xp),next=getNextLevel(xp);
  APP.state.level=lvl.level;
  const el=document.getElementById('home-level-name'),num=document.getElementById('home-level-num');
  const fill=document.getElementById('home-level-fill'),xpEl=document.getElementById('home-xp-next');
  if(el)el.textContent=`Level ${lvl.level} — ${lvl.name}`;
  if(num)num.textContent=`LVL ${lvl.level}`;
  if(fill&&next){
    const pct=((xp-lvl.xp)/(next.xp-lvl.xp))*100;
    fill.style.width=Math.min(100,pct)+'%';
    if(xpEl)xpEl.textContent=`${xp-lvl.xp} / ${next.xp-lvl.xp} XP`;
  } else if(fill){fill.style.width='100%';if(xpEl)xpEl.textContent='MAX LEVEL 🏆';}
  MASCOT.updateAll(xp);
}

function checkLevelUp(oldXp,newXp){
  const o=getLevel(oldXp),n=getLevel(newXp);
  if(n.level<=o.level)return;
  SOUND.levelup();
  MASCOT.react('mascot-home','levelup');
  const ov=document.getElementById('levelup-overlay');
  document.getElementById('lu-num').textContent=n.level;
  document.getElementById('lu-title').textContent='Level Up!';
  document.getElementById('lu-sub').textContent=`You are now ${n.mascot} ${n.name}!`;
  document.getElementById('lu-mascot').textContent=n.mascot;
  PARTICLES.stars(window.innerWidth/2,window.innerHeight/3,6);
  PARTICLES.burst(window.innerWidth/2,window.innerHeight/3,18);
  setTimeout(()=>ov?.classList.add('show'),600);
}

// ── BADGES ───────────────────────────────────────────────────
function renderBadges(){
  const grid=document.getElementById('badges-grid');if(!grid)return;
  const earned=JSON.parse(localStorage.getItem('zl_badges')||'[]');
  grid.innerHTML=BADGE_DEFS.map(b=>`
    <div class="badge-item ${earned.includes(b.id)?'earned':'locked'}" title="${b.name}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
    </div>`).join('');
}

function checkBadges(state){
  const earned=JSON.parse(localStorage.getItem('zl_badges')||'[]');
  let fresh=null;
  BADGE_DEFS.forEach(b=>{
    if(!earned.includes(b.id)&&b.check(state)){earned.push(b.id);fresh=fresh||b;}
  });
  localStorage.setItem('zl_badges',JSON.stringify(earned));
  if(fresh){SOUND.badge();showResultPopup(`🏅 ${fresh.name}!`,'#ffd700');}
  renderBadges();
  return fresh;
}

// ── GAME SESSION STATE ────────────────────────────────────────
let _gameStart=0,_correctInGame=0;

// ── OVERRIDE lv:correct AND lv:wrong via GAME_RENDERERS wiring
// We patch the existing handlers by adding our own listeners FIRST
// (they fire before the GAME_RENDERERS ones)

// Store correct answer for 50/50 — wireOpts sets APP.state._currentCorrect internally
// _curCorrect is an alias so power-up code can read it
Object.defineProperty(APP.state,'_curCorrect',{get(){return this._currentCorrect;},set(v){this._currentCorrect=v;}});

// Patch the lv:correct / lv:wrong events by listening with capture=true (fires first)
document.addEventListener('lv:correct',()=>{
  _correctInGame++;
  COMBO.inc();
  PARTICLES.flash('correct');
  PARTICLES.burst(window.innerWidth/2,window.innerHeight*0.45,14);
  if(COMBO.count>=3)PARTICLES.stars(window.innerWidth/2,window.innerHeight*0.4,4);
  SOUND.correct();
  MASCOT.react('game-mascot','happy');
  const msgs=MASCOT_MSGS.correct;
  showResultPopup(msgs[Math.floor(Math.random()*msgs.length)],'#2ed573');
  GQ.markResult('c');
  // score bonus from combo is added by GAME_RENDERERS existing handler
},true);

document.addEventListener('lv:wrong',()=>{
  COMBO.reset();
  PARTICLES.flash('wrong');
  SOUND.wrong();
  MASCOT.react('game-mascot','sad');
  showResultPopup('💪 Keep going!','#ff4757');
  GQ.markResult('w');
},true);

// ── PATCH showRewardExt (called inside GAME_RENDERERS closure) ─
// We expose a hook called _showRewardExt that GAME_RENDERERS' showRewardExt calls
// by wrapping after it finishes
window._showRewardExt=function(){
  // Called AFTER the existing showRewardExt — but showRewardExt is private.
  // Instead we listen for the reward overlay becoming visible.
};
// Actually: hook the reward overlay show. Use a MutationObserver.
new MutationObserver(mutations=>{
  for(const m of mutations){
    if(m.target.id==='reward-overlay'&&m.target.classList.contains('show')){
      onRewardShown();
      break;
    }
  }
}).observe(document.getElementById('reward-overlay'),{attributes:true,attributeFilter:['class']});

function onRewardShown(){
  const state=APP.state;
  // Update summary
  const timeSec=Math.round((Date.now()-_gameStart)/1000);
  document.getElementById('sum-xp').textContent='+'+state.score+' XP';
  document.getElementById('sum-correct').textContent=_correctInGame+'/'+state.maxQ;
  document.getElementById('sum-streak').textContent=state.streak||0;
  document.getElementById('sum-time').textContent=timeSec+'s';
  // Perfect game tracking
  if(_correctInGame===state.maxQ)state.perfectGames=(state.perfectGames||0)+1;
  // Level up check
  const oldXp=state.xp-state.score;
  checkLevelUp(oldXp,state.xp);
  // Badges
  const newBadge=checkBadges(state);
  document.getElementById('sum-badge').textContent=newBadge?`${newBadge.icon} ${newBadge.name}`:'—';
  // Update level UI
  updateLevelUI(state.xp);
  DAILY.renderCal();
}

// ── PATCH nav.startGame to init gamification on each game start
const _origNavStartGame=APP.nav.startGame?.bind(APP.nav);
// Hook via APP.nav._history_push_play which is called inside startGame:
const _origHistPush=APP.nav._history_push_play?.bind(APP.nav);
if(APP.nav._history_push_play){
  APP.nav._history_push_play=function(){
    _origHistPush?.();
    // Reset per-game state
    _gameStart=Date.now();
    _correctInGame=0;
    COMBO.reset();
    POWERUPS.refill();
    GQ.init();
    MASCOT.say('home','Let\'s go! ⚡');
  };
}

// ── ADD SOUND TOGGLE BUTTON to header ────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  const hr=document.querySelector('.header-right');
  if(hr){
    const btn=document.createElement('button');
    btn.className='theme-toggle';btn.title='Toggle sound';
    btn.textContent=SOUND.isOn()?'🔊':'🔇';
    btn.onclick=()=>{btn.textContent=SOUND.toggle()?'🔊':'🔇';};
    const themeBtn=hr.querySelector('#theme-toggle');
    if(themeBtn)hr.insertBefore(btn,themeBtn);else hr.appendChild(btn);
  }
});

// ── EXPOSE _startTimerExt globally (power-ups need it) ───────
// The original startTimerExt is defined inside GAME_RENDERERS IIFE.
// We detect it being overridden on the APP.nav.startGame override.
// Simpler: expose it when GAME_RENDERERS sets it via a setter.
(()=>{
  // We know GAME_RENDERERS assigns APP.nav._loadQ after startTimerExt is defined.
  // Intercept that assignment:
  let _ste=null;
  Object.defineProperty(window,'_startTimerExt',{
    get(){return _ste;},
    set(v){_ste=v;},
    configurable:true
  });
  // GAME_RENDERERS calls startTimerExt by name internally; we can't get that reference.
  // Instead, make POWERUPS.use('freeze') just restart via a safe wrapper:
  // When timer fires, timerInt already stopped — we re-invoke via APP.state
  // The 'freeze' power-up replaces the 'startTimerExt' call with:
  //   - the arc fill was already at some position
  //   - we just resume the existing tick-down from APP.state.timeLeft
  // We expose a global that GAME_RENDERERS' startTimerExt will self-register to.
})();

// ── INIT ─────────────────────────────────────────────────────
(function initGamification(){
  // Wait for APP to be fully initialised
  setTimeout(()=>{
    updateLevelUI(APP.state.xp);
    DAILY.checkIn();
    DAILY.renderCal();
    renderBadges();
    MASCOT.say('home');

    // Expose startTimerExt for power-ups via a trick:
    // After GAME_RENDERERS IIFE runs, APP.nav._loadQ is defined which calls startTimerExt.
    // We wrap APP.nav._loadQ to also expose startTimerExt globally.
    const origLoadQ=APP.nav._loadQ;
    if(origLoadQ){
      APP.nav._loadQ=function(gameId){
        // startTimerExt is called inside GAME_RENDERERS; register a proxy
        window._startTimerExt=function(){
          // Re-start timer using the same mechanism — dispatch a fresh startTimerExt
          // by triggering a zero-delay call to _loadQ equivalent
          const fill=document.getElementById('arc-fill'),num=document.getElementById('arc-num'),C=151;
          const subCol=SUBJECT_REGISTRY[APP.state.selectedSubject]?.timerColor||'#818cf8';
          clearInterval(APP.state.timerInt);
          // Reset to remaining time (for freeze) or full 30 (for new question)
          if(!APP.state.timeLeft||APP.state.timeLeft<=0)APP.state.timeLeft=30;
          function tick(){
            const r=APP.state.timeLeft/30;
            if(fill){fill.style.strokeDashoffset=C*(1-r);fill.style.stroke=APP.state.timeLeft>8?subCol:'#ff4757';}
            if(num)num.textContent=APP.state.timeLeft;
            if(APP.state.timeLeft<=0){clearInterval(APP.state.timerInt);document.dispatchEvent(new CustomEvent('lv:wrong'));}
          }
          tick();
          APP.state.timerInt=setInterval(()=>{APP.state.timeLeft--;tick();},1000);
        };
        origLoadQ(gameId);
      };
    }
  },200);
})();

// ================================================================
//  THEME SYSTEM
//  - Reads saved preference from localStorage on load
//  - Falls back to system prefers-color-scheme
//  - Saves user choice; updates <html data-theme>, meta theme-color,
//    toggle button icon, and nebula colors
// ================================================================
