// renderers.js — helpers, GAME_RENDERERS, answer event bridge
/* jshint esversion:6 */

// ================================================================
// HELPERS
// ================================================================
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

function genOpts(correct, range=15, count=4) {
  const s=new Set([correct]);
  let tries=0;
  while(s.size<count && tries<200){
    const d=Math.floor(Math.random()*range)+1;
    const v=Math.random()>.5?correct+d:Math.max(0,correct-d);
    if(v!==correct) s.add(v);
    tries++;
  }
  return shuffle([...s]);
}

function buildStarfield(){
  const sf=document.getElementById('starfield');
  for(let i=0;i<120;i++){
    const d=document.createElement('div');
    d.className='star';
    const sz=Math.random()*2.5+0.5;
    d.style.cssText=`width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--dur:${2+Math.random()*5}s;--delay:${Math.random()*6}s;--bright:${0.4+Math.random()*0.6}`;
    sf.appendChild(d);
  }
}

// ================================================================
// GAME RENDERERS
// Each game = a function(container) that renders HTML + wires events
// To add a new game: add an entry here
// ================================================================
const GAME_RENDERERS = (() => {

  // ── ANSWER CHECK WIRING ───────────────────────────────────
  function wireOpts(correctVal, selector='.opt-btn') {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', function() {
        clearInterval(APP.state.timerInt);
        document.querySelectorAll(selector).forEach(b=>b.style.pointerEvents='none');
        const chosen = this.dataset.val;
        if(chosen == String(correctVal)) {
          this.classList.add('correct');
          APP.nav; // call internally
          // trigger onCorrect via exposed event
          document.dispatchEvent(new CustomEvent('lv:correct'));
        } else {
          this.classList.add('wrong');
          document.querySelectorAll(selector).forEach(b=>{ if(b.dataset.val==String(correctVal)) b.classList.add('correct'); });
          document.dispatchEvent(new CustomEvent('lv:wrong'));
        }
      });
    });
  }

  // ── QUESTION CARD BUILDER ─────────────────────────────────
  function qCard(label, qHTML, hintHTML='') {
    return `<div class="q-card">
      <div class="q-label">${label}</div>
      <div class="q-text">${qHTML}</div>
      ${hintHTML ? `<div class="q-hint">💡 ${hintHTML}</div>` : ''}
    </div>`;
  }

  function optsHTML(opts, cls='opts-4') {
    return `<div class="${cls}">${opts.map(o=>`<button class="opt-btn" data-val="${o}">${o}</button>`).join('')}</div>`;
  }

  // ── INDIVIDUAL GAMES ──────────────────────────────────────

  // Count objects
  const OBJECTS = ['🍎','🍌','🥥','⭐','🌻','🐸','🦋','🎈','🍕','⚽','🐘','🌈'];
  function count_objects(el) {
    const count = Math.floor(Math.random()*14)+2;
    const obj   = OBJECTS[Math.floor(Math.random()*OBJECTS.length)];
    const opts  = genOpts(count, 8, 4);
    let items='';
    for(let i=0;i<count;i++) items+=`<span class="obj-item" style="animation-delay:${i*0.04}s">${obj}</span>`;
    el.innerHTML = `
      <div style="text-align:center;margin-bottom:12px;font-size:13px;color:rgba(255,255,255,0.4);font-weight:700;letter-spacing:1px">HOW MANY ${obj} ?</div>
      <div class="objects-display">${items}</div>
      ${optsHTML(opts)}
    `;
    wireOpts(count);
  }

  // Add 1-digit
  function quiz_add1(el) {
    const a=Math.floor(Math.random()*9)+1, b=Math.floor(Math.random()*(10-a))+1;
    const ans=a+b;
    el.innerHTML = qCard('ADDITION', `${a} + ${b} = ?`, `Imagine ${a} apples, add ${b} more`) + optsHTML(genOpts(ans,8));
    wireOpts(ans);
  }

  // Add 2-digit
  function quiz_add2(el) {
    const a=Math.floor(Math.random()*40)+10, b=Math.floor(Math.random()*30)+5;
    const ans=a+b;
    el.innerHTML = qCard('2-DIGIT ADDITION', `${a} + ${b} = ?`, `Add tens first, then units`) + optsHTML(genOpts(ans,20));
    wireOpts(ans);
  }

  // Add 3-digit
  function quiz_add3(el) {
    const a=Math.floor(Math.random()*400)+100, b=Math.floor(Math.random()*300)+100;
    const ans=a+b;
    el.innerHTML = qCard('BIG ADDITION', `${a} + ${b} = ?`) + optsHTML(genOpts(ans,100));
    wireOpts(ans);
  }

  // Subtract
  function quiz_sub(el) {
    const b=Math.floor(Math.random()*30)+1, a=b+Math.floor(Math.random()*30)+1;
    const ans=a-b;
    el.innerHTML = qCard('SUBTRACTION', `${a} − ${b} = ?`, `Count back from ${a}`) + optsHTML(genOpts(ans,15));
    wireOpts(ans);
  }

  // Multiply
  function quiz_mul(el) {
    const t=[2,3,4,5,6,7,8,9,10][Math.floor(Math.random()*9)];
    const n=Math.floor(Math.random()*10)+1;
    const ans=t*n;
    el.innerHTML = qCard('MULTIPLICATION', `${t} × ${n} = ?`, `${t} groups of ${n}`) + optsHTML(genOpts(ans,30));
    wireOpts(ans);
  }

  // Divide
  function quiz_div(el) {
    const t=Math.floor(Math.random()*8)+2, n=Math.floor(Math.random()*9)+1;
    const ans=n;
    el.innerHTML = qCard('DIVISION', `${t*n} ÷ ${t} = ?`, `How many groups of ${t} in ${t*n}?`) + optsHTML(genOpts(ans,10));
    wireOpts(ans);
  }

  // Compare
  function compare_nums(el) {
    const a=Math.floor(Math.random()*90)+1;
    let b=Math.floor(Math.random()*90)+1;
    while(b===a) b=Math.floor(Math.random()*90)+1;
    const correct = a>b?'>':'<';
    el.innerHTML = qCard('COMPARE', `${a}  __  ${b}`, 'Use &lt;, &gt;, or =') +
      `<div class="opts-3">${['<','>','='].map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:36px">${o}</button>`).join('')}</div>`;
    wireOpts(correct);
  }

  // Missing in sequence
  function missing_seq(el) {
    const start=Math.floor(Math.random()*20)+1;
    const step=[1,2,5,10][Math.floor(Math.random()*4)];
    const seq=[0,1,2,3,4].map(i=>start+step*i);
    const hideIdx=Math.floor(Math.random()*5);
    const ans=seq[hideIdx];
    const display=seq.map((n,i)=>i===hideIdx?'?':n).join('  ,  ');
    el.innerHTML = qCard('FIND THE MISSING NUMBER', display, `Pattern: +${step} each step`) + optsHTML(genOpts(ans,step*3+3));
    wireOpts(ans);
  }

  // Odd / Even
  function odd_even(el) {
    const n=Math.floor(Math.random()*99)+1;
    const correct=n%2===0?'Even':'Odd';
    el.innerHTML = qCard('ODD OR EVEN?', String(n), 'Even numbers end in 0,2,4,6,8') +
      `<div class="opts-2">
        <button class="opt-btn" data-val="Odd"  style="font-size:22px">🌙 Odd</button>
        <button class="opt-btn" data-val="Even" style="font-size:22px">🌟 Even</button>
      </div>`;
    wireOpts(correct);
  }

  // Shapes
  const SHAPES=[
    {name:'Circle',    sym:'⭕'},
    {name:'Triangle',  sym:'🔺'},
    {name:'Square',    sym:'🟦'},
    {name:'Rectangle', sym:'▬'},
    {name:'Star',      sym:'⭐'},
    {name:'Diamond',   sym:'🔷'},
  ];
  function shape_quiz(el) {
    const s=SHAPES[Math.floor(Math.random()*SHAPES.length)];
    const decoys=shuffle(SHAPES.filter(x=>x.name!==s.name)).slice(0,3).map(x=>x.name);
    const opts=shuffle([s.name,...decoys]);
    el.innerHTML=`
      <div class="q-card" style="font-size:80px;padding:40px 0">${s.sym}</div>
      <div class="q-label" style="text-align:center;margin-bottom:12px">WHAT SHAPE IS THIS?</div>
      ${optsHTML(opts,'opts-2')}
    `;
    wireOpts(s.name);
  }

  // Place value (tens & units)
  function place_value(el) {
    const n=Math.floor(Math.random()*89)+11;
    const tens=Math.floor(n/10), units=n%10;
    const q=[
      {q:`In ${n}, the tens digit is?`,  ans:tens,  hint:`${n} = ${tens} tens + ${units} units`},
      {q:`In ${n}, the units digit is?`, ans:units, hint:`${n} = ${tens} tens + ${units} units`},
      {q:`${tens} tens + ${units} units = ?`, ans:n, hint:`Combine them to get the number`},
    ][Math.floor(Math.random()*3)];
    el.innerHTML = qCard('PLACE VALUE', q.q, q.hint) + optsHTML(genOpts(q.ans,8));
    wireOpts(q.ans);
  }

  // Fractions — visual pizza slices using SVG
  function fractions(el) {
    const denominators=[2,3,4,6,8];
    const den=denominators[Math.floor(Math.random()*denominators.length)];
    const num=Math.floor(Math.random()*(den-1))+1;
    const svgSlices=buildPizzaSVG(num,den);
    const decoys=[
      `${num}/${den}`,
      `${den-num}/${den}`,
      `${Math.min(num+1,den-1)}/${den}`,
      `${Math.max(num-1,1)}/${den}`
    ];
    const opts=shuffle([...new Set(decoys)]).slice(0,4);
    if(!opts.includes(`${num}/${den}`)){opts[0]=`${num}/${den}`;}
    const shuffled=shuffle(opts);
    el.innerHTML=`
      <div class="q-card" style="padding:24px 20px">
        <div class="q-label">PIZZA FRACTIONS 🍕</div>
        <div style="display:flex;justify-content:center;margin:12px 0">${svgSlices}</div>
        <div class="q-text" style="font-size:20px">What fraction is <span style="color:var(--math-1)">orange</span>?</div>
      </div>
      <div class="opts-2">${shuffled.map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:24px">${o}</button>`).join('')}</div>
    `;
    wireOpts(`${num}/${den}`);
  }

  function buildPizzaSVG(num,den) {
    const cx=80,cy=80,r=70;
    let paths='';
    for(let i=0;i<den;i++){
      const a1=(i/den)*2*Math.PI - Math.PI/2;
      const a2=((i+1)/den)*2*Math.PI - Math.PI/2;
      const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
      const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
      const fill=i<num?'#ff6b35':'#2d2d5a';
      const stroke=i<num?'#ff8c5a':'#3a3a7a';
      paths+=`<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
    }
    return `<svg width="160" height="160" viewBox="0 0 160 160" style="filter:drop-shadow(0 8px 20px rgba(255,107,53,0.4))">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a1a4a" stroke="#3a3a7a" stroke-width="3"/>
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    </svg>`;
  }

  // ── SUBTRACT within 20 (Class 1 specific) ───────────────
  function quiz_sub1(el) {
    const b=Math.floor(Math.random()*9)+1, a=b+Math.floor(Math.random()*(20-b))+1;
    const ans=a-b;
    el.innerHTML = qCard('SUBTRACTION', `${a} − ${b} = ?`, `Count back ${b} steps from ${a}`) + optsHTML(genOpts(ans,8));
    wireOpts(ans);
  }

  // ── SUBTRACT 3-digit (Class 3/4) ─────────────────────────
  function quiz_sub3(el) {
    const b=Math.floor(Math.random()*400)+100, a=b+Math.floor(Math.random()*500)+100;
    const ans=a-b;
    el.innerHTML = qCard('SUBTRACTION', `${a} − ${b} = ?`, `Subtract hundreds, tens, then units`) + optsHTML(genOpts(ans,80));
    wireOpts(ans);
  }

  // ── MULTIPLY by 2,5,10 with visual groups (Class 2) ──────
  function multiply_groups(el) {
    const tables=[2,5,10];
    const t=tables[Math.floor(Math.random()*tables.length)];
    const n=Math.floor(Math.random()*10)+1;
    const ans=t*n;
    const emoji=['🍌','⭐','🎈'][tables.indexOf(t)];
    let groups='';
    for(let g=0;g<Math.min(n,5);g++){
      let row='';
      for(let i=0;i<t;i++) row+=emoji;
      groups+=`<div style="font-size:20px;margin:4px 0;letter-spacing:2px">${row}</div>`;
    }
    if(n>5) groups+=`<div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:4px">...and ${n-5} more groups</div>`;
    el.innerHTML = `
      <div class="q-card">
        <div class="q-label">MULTIPLICATION — GROUPS OF ${t}</div>
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;margin:12px 0;text-align:center">${groups}</div>
        <div class="q-text" style="font-size:28px">${n} × ${t} = ?</div>
        <div class="q-hint">💡 ${n} groups of ${t} ${emoji}</div>
      </div>
      ${optsHTML(genOpts(ans,20))}`;
    wireOpts(ans);
  }

  // ── DIVISION as fair sharing (Class 2) ───────────────────
  function division_share(el) {
    const shares=[2,3,4,5];
    const s=shares[Math.floor(Math.random()*shares.length)];
    const ans=Math.floor(Math.random()*8)+1;
    const total=s*ans;
    const emoji=['🍎','🌟','🎈','🍌','🏀'][Math.floor(Math.random()*5)];
    el.innerHTML = `
      <div class="q-card">
        <div class="q-label">FAIR SHARE — DIVISION</div>
        <div style="font-size:40px;margin:8px 0">${Array(Math.min(total,12)).fill(emoji).join(' ')}${total>12?'…':''}</div>
        <div class="q-text" style="font-size:26px">${total} ÷ ${s} = ?</div>
        <div class="q-hint">💡 Share ${total} ${emoji}s equally among ${s} friends</div>
      </div>
      ${optsHTML(genOpts(ans,8))}`;
    wireOpts(ans);
  }

  // ── TIME — Easy (o'clock, half past) Class 1-2 ───────────
  const TIME_EASY = [
    {h:1,  m:0,  display:'1:00',  label:"1 o'clock"},
    {h:3,  m:0,  display:'3:00',  label:"3 o'clock"},
    {h:6,  m:0,  display:'6:00',  label:"6 o'clock"},
    {h:9,  m:0,  display:'9:00',  label:"9 o'clock"},
    {h:12, m:0,  display:'12:00', label:"12 o'clock"},
    {h:2,  m:30, display:'2:30',  label:'half past 2'},
    {h:5,  m:30, display:'5:30',  label:'half past 5'},
    {h:7,  m:30, display:'7:30',  label:'half past 7'},
    {h:10, m:30, display:'10:30', label:'half past 10'},
  ];
  function time_easy(el) {
    const t=TIME_EASY[Math.floor(Math.random()*TIME_EASY.length)];
    const svg=drawClock(t.h,t.m);
    const wrongTimes=shuffle(TIME_EASY.filter(x=>x.label!==t.label)).slice(0,3);
    const opts=shuffle([t.label,...wrongTimes.map(x=>x.label)]);
    el.innerHTML = `
      <div class="q-card" style="padding:20px">
        <div class="q-label">WHAT TIME DOES THE CLOCK SHOW?</div>
        <div style="display:flex;justify-content:center;margin:12px 0">${svg}</div>
      </div>
      <div class="opts-2">${opts.map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:14px;padding:14px 8px">${o}</button>`).join('')}</div>`;
    wireOpts(t.label);
  }

  function drawClock(h, m) {
    const cx=80,cy=80,r=70;
    const angleH=(h%12+m/60)*30-90;
    const angleM=m*6-90;
    const toRad=d=>d*Math.PI/180;
    const hx=cx+38*Math.cos(toRad(angleH)), hy=cy+38*Math.sin(toRad(angleH));
    const mx=cx+55*Math.cos(toRad(angleM)), my=cy+55*Math.sin(toRad(angleM));
    let nums='';
    for(let i=1;i<=12;i++){
      const a=(i*30-90)*Math.PI/180;
      nums+=`<text x="${cx+58*Math.cos(a)}" y="${cy+58*Math.sin(a)}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="rgba(255,255,255,0.8)" font-family="Nunito">${i}</text>`;
    }
    return `<svg width="160" height="160" viewBox="0 0 160 160" style="filter:drop-shadow(0 4px 16px rgba(99,102,241,0.4))">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a0a3c" stroke="#6366f1" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="2" fill="white"/>
      ${nums}
      <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }

  // ── TIME — Medium (minutes, calendar) Class 3-4 ──────────
  function time_medium(el) {
    const types=['minutes','calendar','24hr'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='minutes') {
      const t=TIME_EASY[Math.floor(Math.random()*TIME_EASY.length)];
      const mins=t.h*60+t.m;
      const wrongMins=[mins+30,mins-30,mins+15,mins+45].map(x=>Math.max(0,x));
      const opts=shuffle([mins,...shuffle(wrongMins).slice(0,3)]);
      const svg=drawClock(t.h,t.m);
      el.innerHTML=`<div class="q-card" style="padding:20px"><div class="q-label">HOW MANY MINUTES SINCE MIDNIGHT?</div><div style="display:flex;justify-content:center;margin:12px 0">${svg}</div><div class="q-hint">💡 Hours × 60 + extra minutes</div></div>${optsHTML(opts)}`;
      wireOpts(mins);
    } else if(type==='calendar') {
      const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
      const days=[31,28,31,30,31,30,31,31,30,31,30,31];
      const idx=Math.floor(Math.random()*12);
      const qs=[
        {q:`Which is the ${['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'][idx]} month?`, ans:months[idx], opts:shuffle([months[idx],...shuffle(months.filter(m=>m!==months[idx])).slice(0,3)])},
        {q:`How many days in ${months[idx]}?`, ans:days[idx], opts:shuffle([days[idx],...[28,29,30,31].filter(d=>d!==days[idx]).slice(0,3)])},
      ][Math.floor(Math.random()*2)];
      el.innerHTML=qCard('CALENDAR CHALLENGE',qs.q,'Months: Jan(31) Feb(28) Mar(31) Apr(30)…')+`<div class="opts-2">${qs.opts.map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:18px">${o}</button>`).join('')}</div>`;
      wireOpts(qs.ans);
    } else {
      const h=Math.floor(Math.random()*12)+1;
      const ampm=Math.random()>0.5?'AM':'PM';
      const h24=ampm==='AM'?(h===12?0:h):(h===12?12:h+12);
      el.innerHTML=qCard('24-HOUR CLOCK',`${h}:00 ${ampm} = ?`,`PM → add 12 (except 12 noon stays 12)`)+`<div class="opts-2">${genOpts(h24,3,4).map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:24px">${o}:00</button>`).join('')}</div>`;
      wireOpts(h24);
    }
  }

  // ── MONEY — Easy (coins, simple sums) Class 1-2 ──────────
  const COINS=[
    {val:1,  label:'₹1',  color:'#c0c0c0'},
    {val:2,  label:'₹2',  color:'#c0c0c0'},
    {val:5,  label:'₹5',  color:'#ffd700'},
    {val:10, label:'₹10', color:'#ffd700'},
    {val:20, label:'₹20', color:'#ff9500'},
    {val:50, label:'₹50', color:'#ff9500'},
  ];
  function money_easy(el) {
    const pick=Math.floor(Math.random()*3);
    if(pick===0) {
      const coin=COINS[Math.floor(Math.random()*COINS.length)];
      el.innerHTML=`<div class="q-card"><div class="q-label">IDENTIFY THE COIN / NOTE</div><div style="font-size:56px;margin:16px 0;text-align:center">💰</div><div class="q-text" style="font-size:28px">This coin is worth</div><div style="font-size:40px;font-family:var(--font-display);color:var(--gold);margin:8px 0">${coin.label}</div><div class="q-text" style="font-size:28px">How much is it in paise?</div></div>${optsHTML(genOpts(coin.val*100,200,4))}`;
      wireOpts(coin.val*100);
    } else if(pick===1) {
      const c1=COINS[Math.floor(Math.random()*4)], c2=COINS[Math.floor(Math.random()*4)];
      const total=c1.val+c2.val;
      el.innerHTML=`<div class="q-card"><div class="q-label">ADD THE COINS</div><div style="display:flex;gap:20px;justify-content:center;margin:16px 0;font-size:40px">💰 + 💰</div><div class="q-text" style="font-size:28px">${c1.label} + ${c2.label} = ?</div></div>${optsHTML(genOpts(total,10,4).map(x=>'₹'+x),'opts-2')}`;
      wireOpts('₹'+total);
    } else {
      const price=Math.floor(Math.random()*40)+5;
      const paid=price+Math.floor(Math.random()*20)+1;
      const change=paid-price;
      el.innerHTML=qCard('CHANGE PLEASE!',`Paid ₹${paid}, cost ₹${price}. Change = ?`,'Change = Amount paid − Price')+optsHTML(genOpts(change,15,4).map(x=>'₹'+x),'opts-2');
      wireOpts('₹'+change);
    }
  }

  // ── MONEY — Medium (Rupees & Paise, bills) Class 3-4 ─────
  function money_medium(el) {
    const a=Math.floor(Math.random()*200)+50;
    const b=Math.floor(Math.random()*100)+20;
    const types=['add','subtract','change'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='add') {
      el.innerHTML=qCard('BILL TOTAL',`₹${a} + ₹${b} = ?`,'Add the amounts')+optsHTML(genOpts(a+b,50,4).map(x=>'₹'+x),'opts-2');
      wireOpts('₹'+(a+b));
    } else if(type==='subtract') {
      const big=a+b;
      el.innerHTML=qCard('FIND THE COST',`₹${big} − ₹${b} = ?`,'Subtract to find the cost')+optsHTML(genOpts(a,30,4).map(x=>'₹'+x),'opts-2');
      wireOpts('₹'+a);
    } else {
      const price=Math.floor(Math.random()*90)+10;
      const paid=Math.ceil(price/50)*50+50;
      const change=paid-price;
      el.innerHTML=qCard('HOW MUCH CHANGE?',`Paid ₹${paid} for item costing ₹${price}`,'Change = Paid − Cost')+optsHTML(genOpts(change,30,4).map(x=>'₹'+x),'opts-2');
      wireOpts('₹'+change);
    }
  }

  // ── MEASUREMENT — Easy (compare, simple units) Class 1-2 ─
  function measure_easy(el) {
    const types=['longer','heavier','units'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='longer') {
      const objects=[['🐍 snake','🐛 caterpillar'],['🚌 bus','🚗 car'],['🌴 palm tree','🌺 flower'],['✏️ pencil','🖊️ pen']];
      const pair=objects[Math.floor(Math.random()*objects.length)];
      el.innerHTML=`<div class="q-card"><div class="q-label">WHICH IS LONGER?</div><div style="display:flex;gap:20px;justify-content:center;font-size:40px;margin:16px 0">${pair[0].split(' ')[0]}<span style="color:rgba(255,255,255,0.3);font-size:24px">vs</span>${pair[1].split(' ')[0]}</div></div><div class="opts-2">${pair.map(p=>`<button class="opt-btn" data-val="${p}" style="font-size:16px">${p}</button>`).join('')}</div>`;
      wireOpts(pair[0]); // first is always longer
    } else if(type==='heavier') {
      const things=[['🐘 elephant','🐭 mouse'],['🏋️ weights','🪶 feather'],['📚 books','🧻 tissue'],['🍉 watermelon','🍇 grapes']];
      const pair=things[Math.floor(Math.random()*things.length)];
      el.innerHTML=`<div class="q-card"><div class="q-label">WHICH IS HEAVIER?</div><div style="display:flex;gap:20px;justify-content:center;font-size:40px;margin:16px 0">${pair[0].split(' ')[0]}<span style="color:rgba(255,255,255,0.3);font-size:24px">vs</span>${pair[1].split(' ')[0]}</div></div><div class="opts-2">${pair.map(p=>`<button class="opt-btn" data-val="${p}" style="font-size:16px">${p}</button>`).join('')}</div>`;
      wireOpts(pair[0]);
    } else {
      const qs=[
        {q:'100 cm = __ metre(s)?', ans:1, opts:genOpts(1,4,4)},
        {q:'1 kg = __ grams?', ans:1000, opts:genOpts(1000,200,4)},
        {q:'1 metre = __ centimetres?', ans:100, opts:genOpts(100,50,4)},
        {q:'Half a kilogram = __ grams?', ans:500, opts:genOpts(500,150,4)},
      ][Math.floor(Math.random()*4)];
      el.innerHTML=qCard('MEASUREMENT UNITS',qs.q,'Remember the conversion!')+optsHTML(qs.opts);
      wireOpts(qs.ans);
    }
  }

  // ── PATTERN — Easy (AB, AAB repeating patterns) Class 1 ──
  const PATTERN_SETS=[
    {seq:['🔴','🔵','🔴','🔵','🔴','❓'], ans:'🔵', type:'AB'},
    {seq:['⭐','⭐','🌙','⭐','⭐','❓'],   ans:'🌙', type:'AAB'},
    {seq:['🟦','🟥','🟩','🟦','🟥','❓'],  ans:'🟩', type:'ABC'},
    {seq:['🐸','🐸','🦋','🐸','🐸','❓'],  ans:'🦋', type:'AAB'},
    {seq:['🎈','🎀','🎈','🎀','🎈','❓'],  ans:'🎀', type:'AB'},
    {seq:['🌸','🌿','🌸','🌿','🌸','❓'],  ans:'🌿', type:'AB'},
  ];
  function pattern_easy(el) {
    const p=PATTERN_SETS[Math.floor(Math.random()*PATTERN_SETS.length)];
    const allEmoji=[...new Set(p.seq.filter(x=>x!=='❓'))];
    const opts=shuffle([p.ans,...shuffle(allEmoji.filter(x=>x!==p.ans)).concat(['🔶','💛','🟣']).slice(0,3)]);
    el.innerHTML=`
      <div class="q-card">
        <div class="q-label">PATTERN ${p.type} — WHAT COMES NEXT?</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-size:32px;margin:16px 0">
          ${p.seq.map(s=>s==='❓'?`<span style="background:rgba(255,215,0,0.2);border:2px dashed var(--gold);border-radius:8px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--gold)">?</span>`:`<span>${s}</span>`).join('')}
        </div>
      </div>
      <div class="opts-4">${opts.map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:28px">${o}</button>`).join('')}</div>`;
    wireOpts(p.ans);
  }

  // ── DATA HANDLING — Easy (tally, pictograph) Class 1-3 ───
  function data_easy(el) {
    const items=['🍎 Apples','🍌 Bananas','🍊 Oranges','🍇 Grapes'];
    const counts=items.map(()=>Math.floor(Math.random()*8)+1);
    const maxIdx=counts.indexOf(Math.max(...counts));
    const minIdx=counts.indexOf(Math.min(...counts));
    const types=['most','least','total'];
    const type=types[Math.floor(Math.random()*types.length)];

    let chart='<div style="display:grid;gap:8px;margin:12px 0">';
    items.forEach((item,i)=>{
      chart+=`<div style="display:flex;align-items:center;gap:8px">
        <div style="width:90px;font-size:12px;color:rgba(255,255,255,0.6)">${item}</div>
        <div style="display:flex;gap:2px">${Array(counts[i]).fill('').map(()=>`<span style="font-size:18px">${item.split(' ')[0]}</span>`).join('')}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px">(${counts[i]})</div>
      </div>`;
    });
    chart+='</div>';

    let q,ans,opts;
    if(type==='most') {
      q=`Which fruit was collected the MOST?`;
      ans=items[maxIdx].split(' ')[1];
      opts=shuffle(items.map(i=>i.split(' ')[1]));
    } else if(type==='least') {
      q=`Which fruit was collected the LEAST?`;
      ans=items[minIdx].split(' ')[1];
      opts=shuffle(items.map(i=>i.split(' ')[1]));
    } else {
      q=`How many ${items[0].split(' ')[0]} and ${items[1].split(' ')[0]} altogether?`;
      ans=counts[0]+counts[1];
      opts=genOpts(ans,10,4);
    }
    el.innerHTML=`<div class="q-card" style="padding:20px"><div class="q-label">READ THE CHART</div>${chart}<div class="q-text" style="font-size:18px">${q}</div></div>`;
    if(type==='total') el.innerHTML+=optsHTML(opts);
    else el.innerHTML+=`<div class="opts-2">${opts.map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:18px">${o}</button>`).join('')}</div>`;
    wireOpts(ans);
  }

  // ── PLACE VALUE — Class 3 (3-4 digit numbers) ────────────
  function place_value3(el) {
    const n=Math.floor(Math.random()*8999)+1000;
    const th=Math.floor(n/1000), h=Math.floor((n%1000)/100), t=Math.floor((n%100)/10), u=n%10;
    const qs=[
      {q:`In ${n}, the thousands digit is?`,  ans:th,  hint:`${n} = ${th} thousands + ${h} hundreds + ${t} tens + ${u} units`},
      {q:`In ${n}, the hundreds digit is?`,   ans:h,   hint:`Look at the third digit from right`},
      {q:`${th} thousands + ${h} hundreds + ${t} tens + ${u} units = ?`, ans:n, hint:'Add all the place values'},
      {q:`${n} rounded to nearest hundred = ?`, ans:Math.round(n/100)*100, hint:'Look at the tens digit: ≥5 round up, <5 round down'},
    ][Math.floor(Math.random()*4)];
    el.innerHTML=qCard('PLACE VALUE',qs.q,qs.hint)+optsHTML(genOpts(qs.ans,Math.max(50,qs.ans/10)));
    wireOpts(qs.ans);
  }

  // ── PLACE VALUE — Class 4 (Lakhs) ────────────────────────
  function place_value4(el) {
    const n=Math.floor(Math.random()*899999)+100001;
    const L=Math.floor(n/100000), tth=Math.floor((n%100000)/10000), th=Math.floor((n%10000)/1000);
    const qs=[
      {q:`Write ${n.toLocaleString('en-IN')} in words`, ans:null, hint:'Break it: Lakhs, Ten-thousands, Thousands, Hundreds, Tens, Units'},
      {q:`${n.toLocaleString('en-IN')} — the lakhs digit is?`, ans:L, hint:`Lakhs digit is the 6th digit from right`},
      {q:`Which is greater?\n${n.toLocaleString('en-IN')} or ${(n+Math.floor(Math.random()*50000)).toLocaleString('en-IN')}?`, ans:null, hint:'Compare digit by digit from left'},
    ];
    const q=qs[Math.floor(Math.random()*2)]; // first 2 have numeric answers
    if(q.ans===null) {
      const realAns=L;
      el.innerHTML=qCard('LAKHS & PLACE VALUE',`${n.toLocaleString('en-IN')} — the lakhs digit is?`,'6th digit from the right = lakhs')+optsHTML(genOpts(L,5,4));
      wireOpts(L);
    } else {
      el.innerHTML=qCard('LAKHS & PLACE VALUE',q.q,q.hint)+optsHTML(genOpts(q.ans,q.ans>10?q.ans/5:5));
      wireOpts(q.ans);
    }
  }

  // ── PERIMETER — Class 3 ───────────────────────────────────
  function perimeter_easy(el) {
    const shapes=[
      {name:'Square',    sides:[4,4,4,4],     formula:'4 × side'},
      {name:'Rectangle', sides:null,           formula:'2 × (length + width)'},
      {name:'Triangle',  sides:null,           formula:'Add all 3 sides'},
    ];
    const shapeIdx=Math.floor(Math.random()*shapes.length);
    let s,ans,question;
    if(shapeIdx===0) {
      s=Math.floor(Math.random()*8)+2;
      ans=4*s;
      question=`Square with side = ${s} cm`;
    } else if(shapeIdx===1) {
      const l=Math.floor(Math.random()*8)+3, w=Math.floor(Math.random()*5)+2;
      ans=2*(l+w); s=l;
      question=`Rectangle: length=${l} cm, width=${w} cm`;
    } else {
      const a=Math.floor(Math.random()*6)+2, b=Math.floor(Math.random()*6)+2, c=Math.floor(Math.random()*6)+2;
      ans=a+b+c;
      question=`Triangle with sides ${a} cm, ${b} cm, ${c} cm`;
    }
    el.innerHTML=qCard('FIND THE PERIMETER',question,`Formula: ${shapes[shapeIdx].formula}`)+optsHTML(genOpts(ans,20,4).map(x=>x+' cm'),'opts-2');
    wireOpts(ans+' cm');
  }

  // ── ANGLES — Class 4 ──────────────────────────────────────
  const ANGLE_DATA=[
    {deg:90,  type:'Right angle',   emoji:'📐', hint:'Exactly 90° — like the corner of a book'},
    {deg:45,  type:'Acute angle',   emoji:'🔺', hint:'Less than 90° — sharp and pointy'},
    {deg:120, type:'Obtuse angle',  emoji:'📏', hint:'More than 90° but less than 180°'},
    {deg:30,  type:'Acute angle',   emoji:'🔺', hint:'Less than 90° — sharp and pointy'},
    {deg:150, type:'Obtuse angle',  emoji:'📏', hint:'More than 90° but less than 180°'},
    {deg:180, type:'Straight angle',emoji:'➡️', hint:'Exactly 180° — a straight line'},
  ];
  function angles_quiz(el) {
    const a=ANGLE_DATA[Math.floor(Math.random()*ANGLE_DATA.length)];
    const types=['Right angle','Acute angle','Obtuse angle','Straight angle'];
    const opts=shuffle(types);
    el.innerHTML=`
      <div class="q-card">
        <div class="q-label">WHAT TYPE OF ANGLE IS THIS?</div>
        <div style="display:flex;justify-content:center;margin:12px 0">
          <svg width="160" height="120" viewBox="0 0 160 120">
            ${buildAngleSVG(a.deg)}
          </svg>
        </div>
        <div class="q-text" style="font-size:22px">${a.deg}°</div>
        <div class="q-hint">💡 ${a.hint}</div>
      </div>
      <div class="opts-2">${opts.map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:14px;padding:14px 8px">${o}</button>`).join('')}</div>`;
    wireOpts(a.type);
  }

  function buildAngleSVG(deg) {
    const r=60, cx=30, cy=90;
    const rad=(90-deg)*Math.PI/180;
    const x2=cx+r*Math.cos(-Math.PI/2+Math.PI/180*deg*0);
    const x3=cx+r*Math.cos(Math.PI/180*(-90+deg)), y3=cy+r*Math.sin(Math.PI/180*(-90+deg));
    const arcR=18;
    const ax=cx+arcR*Math.cos(-Math.PI/2), ay=cy+arcR*Math.sin(-Math.PI/2);
    const bx=cx+arcR*Math.cos(Math.PI/180*(-90+deg)), by=cy+arcR*Math.sin(Math.PI/180*(-90+deg));
    const la=deg>180?1:0;
    return `
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r}" stroke="#818cf8" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${cx+r*Math.cos(Math.PI/180*(deg-90))}" y2="${cy+r*Math.sin(Math.PI/180*(deg-90))}" stroke="#ff6b35" stroke-width="3" stroke-linecap="round"/>
      <path d="M ${ax} ${ay} A ${arcR} ${arcR} 0 ${la} 1 ${bx} ${by}" fill="none" stroke="rgba(255,215,0,0.7)" stroke-width="2"/>
      <text x="${cx+28}" y="${cy-20}" font-size="13" fill="rgba(255,255,255,0.6)" font-family="Nunito">${deg}°</text>`;
  }

  // ── AREA — Class 4 ────────────────────────────────────────
  function area_easy(el) {
    const l=Math.floor(Math.random()*7)+2, w=Math.floor(Math.random()*5)+2;
    const ans=l*w;
    let grid='<div style="display:inline-grid;gap:2px;margin:12px auto">';
    for(let r=0;r<Math.min(w,6);r++) {
      grid+='<div style="display:flex;gap:2px">';
      for(let c=0;c<Math.min(l,8);c++) grid+=`<div style="width:22px;height:22px;background:rgba(99,102,241,0.4);border:1px solid rgba(99,102,241,0.6);border-radius:3px"></div>`;
      grid+='</div>';
    }
    if(w>6) grid+=`<div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:4px">…${w-6} more rows</div>`;
    grid+='</div>';
    el.innerHTML=`
      <div class="q-card" style="padding:20px">
        <div class="q-label">FIND THE AREA</div>
        <div style="text-align:center">${grid}</div>
        <div class="q-text" style="font-size:22px">Rectangle: ${l} × ${w} = ?</div>
        <div class="q-hint">💡 Area = Length × Width = ${l} × ${w} sq. units</div>
      </div>
      ${optsHTML(genOpts(ans,15,4).map(x=>x+' sq.units'),'opts-2')}`;
    wireOpts(ans+' sq.units');
  }

  // ── ROMAN NUMERALS — Class 4 ─────────────────────────────
  const ROMAN_MAP=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  function toRoman(n){let r='';for(const[v,s]of ROMAN_MAP){while(n>=v){r+=s;n-=v;}}return r;}
  function roman_nums(el) {
    const n=Math.floor(Math.random()*39)+1; // I to XL (Class 4 scope)
    const roman=toRoman(n);
    const types=['toArab','toRoman'];
    const type=types[Math.floor(Math.random()*2)];
    if(type==='toArab') {
      el.innerHTML=qCard('ROMAN NUMERALS',roman,'I=1, V=5, X=10, L=50, C=100')+optsHTML(genOpts(n,10,4));
      wireOpts(n);
    } else {
      const opts=shuffle([roman,...[n-1,n+1,n+2].filter(x=>x>0).map(toRoman)]).slice(0,4);
      el.innerHTML=qCard('WRITE IN ROMAN',`${n} in Roman numerals?`,'I=1 V=5 X=10 L=50')+`<div class="opts-2">${opts.map(o=>`<button class="opt-btn" data-val="${o}" style="font-size:20px">${o}</button>`).join('')}</div>`;
      wireOpts(roman);
    }
  }

  // ── WIRE GLOBAL EVENTS ───────────────────────────────────
  // Bridge from renderer events to APP state handlers
  // (avoids passing APP reference into closures)
  document.addEventListener('lv:correct', () => {
    APP.state.streak++; APP.state.correct++; APP.state.score += 10 + (APP.state.streak>2?5:0);
    if(APP.state.streak>APP.state.bestStreak) APP.state.bestStreak=APP.state.streak;
    localStorage.setItem('lv_correct',APP.state.correct);
    localStorage.setItem('lv_streak', APP.state.bestStreak);
    // Light dot
    const idx=Math.min(APP.state.streak-1,4);
    const d=document.getElementById('dot-'+idx);
    if(d) d.classList.add('lit');
    if(APP.state.streak>=5){
      document.querySelectorAll('.s-dot').forEach(d=>d.classList.remove('lit'));
      APP.state.score+=25;
      document.getElementById('hud-score').textContent=APP.state.score;
      const fl=document.createElement('div');fl.className='float-feedback';fl.textContent='🔥+25';fl.style.color='#ffd700';
      document.body.appendChild(fl);setTimeout(()=>fl.remove(),950);
    }
    document.getElementById('hud-score').textContent=APP.state.score;
    const fl=document.createElement('div');fl.className='float-feedback';fl.textContent='✓';fl.style.color='#2ed573';
    document.body.appendChild(fl);setTimeout(()=>fl.remove(),950);
    setTimeout(()=>{
      APP.state.qNum < APP.state.maxQ ? (() => { APP.state.qNum++; document.getElementById('hud-q').textContent=`${APP.state.qNum}/${APP.state.maxQ}`; clearInterval(APP.state.timerInt); GAME_RENDERERS[APP.state.selectedGame](document.getElementById('play-content')); startTimerExt(); })()
      : showRewardExt();
    }, 850);
  });

  document.addEventListener('lv:wrong', () => {
    APP.state.streak=0;
    document.querySelectorAll('.s-dot').forEach(d=>d.classList.remove('lit'));
    const fl=document.createElement('div');fl.className='float-feedback';fl.textContent='✗';fl.style.color='#ff4757';
    document.body.appendChild(fl);setTimeout(()=>fl.remove(),950);
    setTimeout(()=>{
      APP.state.qNum < APP.state.maxQ ? (() => { APP.state.qNum++; document.getElementById('hud-q').textContent=`${APP.state.qNum}/${APP.state.maxQ}`; clearInterval(APP.state.timerInt); GAME_RENDERERS[APP.state.selectedGame](document.getElementById('play-content')); startTimerExt(); })()
      : showRewardExt();
    }, 1100);
  });

  function startTimerExt() {
    clearInterval(APP.state.timerInt);
    APP.state.timeLeft=30;
    const fill=document.getElementById('arc-fill'), num=document.getElementById('arc-num'), C=151;
    const subCol=SUBJECT_REGISTRY[APP.state.selectedSubject]?.timerColor||'#818cf8';
    function tick(){
      const r=APP.state.timeLeft/30;
      fill.style.strokeDashoffset=C*(1-r);
      fill.style.stroke=APP.state.timeLeft>8?subCol:'#ff4757';
      num.textContent=APP.state.timeLeft;
      if(APP.state.timeLeft<=0){clearInterval(APP.state.timerInt);document.dispatchEvent(new CustomEvent('lv:wrong'));}
    }
    tick();
    APP.state.timerInt=setInterval(()=>{APP.state.timeLeft--;tick();},1000);
  }

  function showRewardExt() {
    clearInterval(APP.state.timerInt);
    APP.state.played++; APP.state.xp+=APP.state.score;
    localStorage.setItem('lv_played',APP.state.played);
    localStorage.setItem('lv_xp',APP.state.xp);
    const stars=APP.state.score>=85?3:APP.state.score>=50?2:1;
    const msgs=[['🌟 Perfect!','You are a true champion!','🏆'],['👏 Well Done!','Great effort! Keep it up!','🎊'],['💪 Good Try!','Every mistake is a lesson!','🎈']];
    const [title,msg,emoji]=msgs[3-stars];
    document.getElementById('r-emoji').textContent=emoji;
    document.getElementById('r-title').textContent=title;
    document.getElementById('r-score').textContent=`${APP.state.score} pts earned!`;
    document.getElementById('r-msg').textContent=msg;
    const sr=document.getElementById('r-stars');
    sr.innerHTML=[1,2,3].map(i=>`<span class="r-star">${i<=stars?'⭐':'☆'}</span>`).join('');
    // confetti
    const c=document.getElementById('reward-confetti');c.innerHTML='';
    const cols=['#ffd700','#ff6b35','#00d4aa','#a855f7','#ff6b9d','#2ed573'];
    for(let i=0;i<70;i++){const p=document.createElement('div');p.className='confetti-piece';p.style.cssText=`left:${Math.random()*100}%;background:${cols[i%cols.length]};width:${6+Math.random()*10}px;height:${6+Math.random()*10}px;animation:cFall ${1.4+Math.random()*1.8}s ${Math.random()*0.8}s linear forwards;border-radius:${Math.random()>.5?'50%':'3px'}`;c.appendChild(p);}
    document.getElementById('reward-overlay').classList.add('show');
    document.getElementById('hdr-xp').textContent=APP.state.xp;
    document.getElementById('st-xp').textContent=APP.state.xp;
    document.getElementById('st-played').textContent=APP.state.played;
    document.getElementById('st-streak').textContent=APP.state.bestStreak;
    document.getElementById('st-correct').textContent=APP.state.correct;
  }

  // Expose startGame loader so nav can call it
  APP.nav._loadQ = (gameId) => {
    APP.state.qNum++;
    document.getElementById('hud-q').textContent=`${APP.state.qNum}/${APP.state.maxQ}`;
    startTimerExt();
    GAME_RENDERERS[gameId](document.getElementById('play-content'));
  };

  // Override nav.startGame to use our event-based system
  const _origStart=APP.nav.startGame.bind(APP.nav);
  APP.nav.startGame=(gameId)=>{
    APP.state.selectedGame=gameId;
    APP.state.score=0; APP.state.qNum=0; APP.state.streak=0;
    clearInterval(APP.state.timerInt);
    document.getElementById('reward-overlay').classList.remove('show');
    APP.nav._history_push_play();
    document.getElementById('hud-score').textContent='0';
    document.getElementById('hud-q').textContent=`1/${APP.state.maxQ}`;
    document.querySelectorAll('.s-dot').forEach(d=>d.classList.remove('lit'));
    const dots=document.getElementById('streak-dots');
    dots.innerHTML=Array.from({length:5},(_,i)=>`<div class="s-dot" id="dot-${i}"></div>`).join('');
    APP.state.qNum=1;
    document.getElementById('hud-q').textContent=`1/${APP.state.maxQ}`;
    startTimerExt();
    GAME_RENDERERS[gameId](document.getElementById('play-content'));
  };

  APP.nav._history_push_play=()=>{
    APP.nav.history.push('play');
    ['scr-home','scr-map','scr-pet','scr-games'].forEach(id=>document.getElementById(id)?.classList.remove('active'));
    document.getElementById('scr-play').classList.add('active');
    const nb=document.getElementById('nav-back');
    if(nb){nb.style.display='inline-flex';nb.classList.add('show');}
  };

  return {
    // Original games
    count_objects, quiz_add1, quiz_add2, quiz_add3, quiz_sub, quiz_mul, quiz_div,
    compare_nums, missing_seq, odd_even, shape_quiz, place_value, fractions,
    // New CBSE/ICSE syllabus games
    quiz_sub1, quiz_sub3,
    multiply_groups, division_share,
    time_easy, time_medium,
    money_easy, money_medium,
    measure_easy,
    pattern_easy,
    data_easy,
    place_value3, place_value4,
    perimeter_easy,
    angles_quiz,
    area_easy,
    roman_nums,
  };
})();

// ================================================================
// GAMIFICATION ENGINE — self-contained, wired into existing events
// ================================================================

// ── LEVELS ───────────────────────────────────────────────────
