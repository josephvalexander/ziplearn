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

// ================================================================
// SCIENCE RENDERERS — CBSE/NCERT EVS/Science Classes 1-4
// ================================================================
const SCI_RENDERERS = (() => {
  // Helper: build a multiple-choice question
  function mcq(pc, question, options, correct, emoji) {
    const opts = [...options].sort(() => Math.random() - 0.5);
    pc.innerHTML = `
      <div class="q-emoji">${emoji || '🔬'}</div>
      <div class="q-text">${question}</div>
      <div class="opts-grid opts-2">${opts.map(o =>
        `<button class="opt-btn" data-ans="${o}" data-correct="${o===correct}">${o}</button>`
      ).join('')}</div>`;
    wireOpts(pc, correct);
  }

  // Helper: true/false question
  function tf(pc, question, correct, emoji) {
    pc.innerHTML = `
      <div class="q-emoji">${emoji || '🔬'}</div>
      <div class="q-text">${question}</div>
      <div class="opts-grid opts-2">
        <button class="opt-btn" data-ans="True"  data-correct="${correct==='True'}">✅ True</button>
        <button class="opt-btn" data-ans="False" data-correct="${correct==='False'}">❌ False</button>
      </div>`;
    wireOpts(pc, correct);
  }

  // Helper: image/emoji match question
  function imgMatch(pc, question, items, correct, emoji) {
    const opts = [...items].sort(() => Math.random() - 0.5);
    pc.innerHTML = `
      <div class="q-emoji">${emoji}</div>
      <div class="q-text">${question}</div>
      <div class="opts-grid opts-2">${opts.map(o =>
        `<button class="opt-btn opt-big" data-ans="${o.label}" data-correct="${o.label===correct}">${o.icon}<br><span style="font-size:13px">${o.label}</span></button>`
      ).join('')}</div>`;
    wireOpts(pc, correct);
  }

  // ── Class 1 Science ─────────────────────────────────────
  const POOLS = {
    sci_living: [
      {q:'Is a dog a living thing?', opts:['Yes, it eats and grows','No, it cannot move','Yes, but only sometimes','No, it lives indoors'], correct:'Yes, it eats and grows', emoji:'🐕'},
      {q:'Which of these is NOT a living thing?', opts:['🌺 Flower','🪨 Rock','🐛 Caterpillar','🌿 Grass'], correct:'🪨 Rock', emoji:'🌍'},
      {q:'What do ALL living things need?', opts:['Food and water','Wheels','A house','A mobile phone'], correct:'Food and water', emoji:'🌱'},
      {q:'Can a chair eat food?', opts:['No, chairs are not alive','Yes, it absorbs wood','Yes, in fairy tales','Only wooden chairs'], correct:'No, chairs are not alive', emoji:'🪑'},
      {q:'Which grows and breathes?', opts:['A puppy','A brick','A spoon','A rock'], correct:'A puppy', emoji:'🐾'},
    ],
    sci_body1: [
      {q:'Which part of your body do you use to see?', opts:['Eyes','Nose','Ear','Tongue'], correct:'Eyes', emoji:'👁️'},
      {q:'How many fingers do we have in total?', opts:['10','8','12','5'], correct:'10', emoji:'✋'},
      {q:'Which body part helps you smell?', opts:['Nose','Tongue','Ears','Eyes'], correct:'Nose', emoji:'👃'},
      {q:'What does your heart do?', opts:['Pumps blood','Helps you think','Helps you breathe','Holds your bones'], correct:'Pumps blood', emoji:'❤️'},
      {q:'Which part do you use to walk?', opts:['Legs','Arms','Head','Fingers'], correct:'Legs', emoji:'🦵'},
    ],
    sci_senses: [
      {q:'You use your ears to ___', opts:['Hear sounds','Smell flowers','Taste food','See colours'], correct:'Hear sounds', emoji:'👂'},
      {q:'Which sense helps you enjoy the smell of a rose?', opts:['Smell','Touch','Sight','Taste'], correct:'Smell', emoji:'🌹'},
      {q:'Touching something hot or cold is which sense?', opts:['Touch','Sight','Hearing','Taste'], correct:'Touch', emoji:'🔥'},
      {q:'You use your tongue to ___', opts:['Taste food','See things','Hear music','Smell flowers'], correct:'Taste food', emoji:'👅'},
      {q:'How many senses do humans have?', opts:['5','3','6','10'], correct:'5', emoji:'🧠'},
    ],
    sci_animals1: [
      {q:'Which animal gives us milk?', opts:['Cow','Dog','Parrot','Fish'], correct:'Cow', emoji:'🐄'},
      {q:'Which animal lives in the sea?', opts:['Fish','Cat','Lion','Horse'], correct:'Fish', emoji:'🐟'},
      {q:'A hen lays ___', opts:['Eggs','Milk','Wool','Honey'], correct:'Eggs', emoji:'🐔'},
      {q:'Which is a wild animal?', opts:['Lion','Dog','Hen','Cow'], correct:'Lion', emoji:'🦁'},
      {q:'Which animal can fly?', opts:['Eagle','Cat','Cow','Fish'], correct:'Eagle', emoji:'🦅'},
    ],
    sci_plants1: [
      {q:'Plants make their food using ___', opts:['Sunlight','Water only','Soil only','Darkness'], correct:'Sunlight', emoji:'☀️'},
      {q:'Which part of a plant is underground?', opts:['Root','Leaf','Flower','Stem'], correct:'Root', emoji:'🌱'},
      {q:'What do plants breathe in?', opts:['Carbon dioxide','Oxygen only','Milk','Water'], correct:'Carbon dioxide', emoji:'🌿'},
      {q:'Which part of the plant holds it up?', opts:['Stem','Root','Leaf','Flower'], correct:'Stem', emoji:'🌻'},
      {q:'Flowers grow into ___', opts:['Fruits','Roots','Leaves','Soil'], correct:'Fruits', emoji:'🍎'},
    ],
    sci_sky: [
      {q:'Which gives us light during the day?', opts:['Sun','Moon','Stars','Lamp'], correct:'Sun', emoji:'☀️'},
      {q:'The moon shines brightest at ___', opts:['Night','Noon','Morning','Sunset'], correct:'Night', emoji:'🌕'},
      {q:'Which is the closest star to Earth?', opts:['The Sun','Polaris','Sirius','Moon'], correct:'The Sun', emoji:'⭐'},
      {q:'What causes day and night?', opts:['Earth spins','Sun moves','Moon changes','Clouds'], correct:'Earth spins', emoji:'🌍'},
      {q:'Stars are seen clearly on a ___ night', opts:['Clear','Rainy','Foggy','Cloudy'], correct:'Clear', emoji:'🌟'},
    ],
    sci_weather1: [
      {q:'We carry an umbrella when it is ___', opts:['Rainy','Sunny','Windy','Cold'], correct:'Rainy', emoji:'☔'},
      {q:'In summer the weather is ___', opts:['Hot','Cold','Snowy','Rainy'], correct:'Hot', emoji:'🌞'},
      {q:'Snow falls when it is very ___', opts:['Cold','Hot','Windy','Sunny'], correct:'Cold', emoji:'❄️'},
      {q:'Wind is moving ___', opts:['Air','Water','Clouds','Dust'], correct:'Air', emoji:'🌬️'},
      {q:'Which season has the most rain in India?', opts:['Monsoon','Winter','Summer','Spring'], correct:'Monsoon', emoji:'🌧️'},
    ],
    sci_materials: [
      {q:'A pillow is ___', opts:['Soft','Hard','Rough','Heavy'], correct:'Soft', emoji:'🛏️'},
      {q:'A rock feels ___', opts:['Hard','Soft','Smooth only','Warm'], correct:'Hard', emoji:'🪨'},
      {q:'Which material can you see through?', opts:['Glass','Wood','Cloth','Metal'], correct:'Glass', emoji:'🪟'},
      {q:'A sandpaper feels ___', opts:['Rough','Smooth','Soft','Slippery'], correct:'Rough', emoji:'📄'},
      {q:'Wood floats on water. True or False?', opts:['True','False','Sometimes','Never'], correct:'True', emoji:'🌊'},
    ],
    sci_food1: [
      {q:'Which food gives us energy?', opts:['Rice','Salt','Water only','Pepper'], correct:'Rice', emoji:'🍚'},
      {q:'Vegetables and fruits give us ___', opts:['Vitamins','Only sugar','Only water','Nothing'], correct:'Vitamins', emoji:'🥦'},
      {q:'Which is a healthy drink?', opts:['Water','Soda','Juice with sugar','Tea'], correct:'Water', emoji:'💧'},
      {q:'Which food group do eggs belong to?', opts:['Protein','Vegetable','Grain','Fat'], correct:'Protein', emoji:'🥚'},
      {q:'Eating too much sugar causes ___', opts:['Tooth decay','Strong bones','Better eyesight','More energy'], correct:'Tooth decay', emoji:'🦷'},
    ],
    sci_water1: [
      {q:'Water is used for ___', opts:['Drinking & cooking','Only washing','Only cooking','Only bathing'], correct:'Drinking & cooking', emoji:'💧'},
      {q:'Where is most of Earth\'s water found?', opts:['Oceans','Clouds','Rivers','Lakes'], correct:'Oceans', emoji:'🌊'},
      {q:'We should save water because ___', opts:['It is limited','It is free','It is heavy','It is blue'], correct:'It is limited', emoji:'🚿'},
      {q:'Rain water comes from ___', opts:['Clouds','Mountains','Rivers','Lakes'], correct:'Clouds', emoji:'☁️'},
      {q:'Water turns to ice when it gets very ___', opts:['Cold','Hot','Salty','Dark'], correct:'Cold', emoji:'🧊'},
    ],
    sci_transport1: [
      {q:'An aeroplane travels through ___', opts:['Air','Water','Land','Underground'], correct:'Air', emoji:'✈️'},
      {q:'A boat travels on ___', opts:['Water','Land','Air','Space'], correct:'Water', emoji:'⛵'},
      {q:'Which travels on land?', opts:['Bus','Aeroplane','Boat','Submarine'], correct:'Bus', emoji:'🚌'},
      {q:'A train runs on ___', opts:['Rails','Roads','Water','Air'], correct:'Rails', emoji:'🚂'},
      {q:'Which is the fastest?', opts:['Aeroplane','Car','Bus','Bicycle'], correct:'Aeroplane', emoji:'🚀'},
    ],
    sci_family: [
      {q:'Your father\'s mother is your ___', opts:['Grandmother','Aunt','Sister','Cousin'], correct:'Grandmother', emoji:'👵'},
      {q:'A family with many generations living together is called ___', opts:['Joint family','Nuclear family','Single family','One family'], correct:'Joint family', emoji:'👨‍👩‍👧‍👦'},
      {q:'Who is a firefighter?', opts:['A community helper','A family member','A classmate','A pet'], correct:'A community helper', emoji:'👩‍🚒'},
      {q:'A teacher helps us ___', opts:['Learn and grow','Sell things','Fix cars','Build houses'], correct:'Learn and grow', emoji:'👩‍🏫'},
      {q:'Which family member is older than your parents?', opts:['Grandparents','Siblings','Cousins','Friends'], correct:'Grandparents', emoji:'👴'},
    ],
    // Class 2
    sci_foodchain1: [
      {q:'In a food chain, plants are called ___', opts:['Producers','Consumers','Decomposers','Hunters'], correct:'Producers', emoji:'🌿'},
      {q:'What does a herbivore eat?', opts:['Plants only','Meat only','Plants and meat','Nothing'], correct:'Plants only', emoji:'🐰'},
      {q:'A lion is a ___', opts:['Carnivore','Herbivore','Producer','Decomposer'], correct:'Carnivore', emoji:'🦁'},
      {q:'Grass → Grasshopper → Frog → Snake. The grasshopper is a ___', opts:['Consumer','Producer','Decomposer','Predator'], correct:'Consumer', emoji:'🦗'},
      {q:'What eats both plants AND animals?', opts:['Omnivore','Herbivore','Carnivore','Producer'], correct:'Omnivore', emoji:'🐻'},
    ],
    sci_habitat: [
      {q:'A polar bear lives in ___', opts:['Arctic/snowy regions','Desert','Rainforest','Ocean'], correct:'Arctic/snowy regions', emoji:'🐻‍❄️'},
      {q:'A camel is adapted to live in the ___', opts:['Desert','Forest','Ocean','Arctic'], correct:'Desert', emoji:'🐪'},
      {q:'Which animal lives in water?', opts:['Dolphin','Elephant','Tiger','Eagle'], correct:'Dolphin', emoji:'🐬'},
      {q:'Birds build nests to ___', opts:['Lay eggs and raise young','Store food','Sleep only','Hide from rain'], correct:'Lay eggs and raise young', emoji:'🐦'},
      {q:'A fish breathes using ___', opts:['Gills','Lungs','Skin','Nose'], correct:'Gills', emoji:'🐟'},
    ],
    sci_states: [
      {q:'Water is an example of a ___', opts:['Liquid','Solid','Gas','Plasma'], correct:'Liquid', emoji:'💧'},
      {q:'Ice is water in its ___ form', opts:['Solid','Liquid','Gas','Energy'], correct:'Solid', emoji:'🧊'},
      {q:'Steam is water changing to ___', opts:['Gas','Solid','Liquid','Nothing'], correct:'Gas', emoji:'♨️'},
      {q:'Which is a solid?', opts:['Iron nail','Milk','Oxygen','Steam'], correct:'Iron nail', emoji:'🔩'},
      {q:'A gas has ___ shape', opts:['No fixed shape','A fixed shape','A round shape','A square shape'], correct:'No fixed shape', emoji:'🌫️'},
    ],
    sci_force1: [
      {q:'When you push a door, you apply a ___', opts:['Force','Sound','Light','Heat'], correct:'Force', emoji:'🚪'},
      {q:'Pulling a rope is an example of a ___ force', opts:['Pull','Push','Gravity','Magnetic'], correct:'Pull', emoji:'🪢'},
      {q:'Gravity pulls things ___', opts:['Downward','Upward','Sideways','In circles'], correct:'Downward', emoji:'🍎'},
      {q:'Friction makes moving objects ___', opts:['Slow down','Speed up','Disappear','Float'], correct:'Slow down', emoji:'🛹'},
      {q:'A magnet attracts ___', opts:['Iron','Wood','Plastic','Glass'], correct:'Iron', emoji:'🧲'},
    ],
    sci_magnets: [
      {q:'A magnet has how many poles?', opts:['2 — North and South','1','3','4'], correct:'2 — North and South', emoji:'🧲'},
      {q:'Like poles ___ each other', opts:['Repel','Attract','Ignore','Break'], correct:'Repel', emoji:'↔️'},
      {q:'Which material is attracted to a magnet?', opts:['Iron pin','Plastic ruler','Rubber eraser','Wooden stick'], correct:'Iron pin', emoji:'📎'},
      {q:'A compass needle points to ___', opts:['North','South','East','West'], correct:'North', emoji:'🧭'},
      {q:'Opposite poles ___ each other', opts:['Attract','Repel','Break','Ignore'], correct:'Attract', emoji:'🔴🔵'},
    ],
    // Class 3
    sci_plants2: [
      {q:'The process by which plants make food is called ___', opts:['Photosynthesis','Digestion','Respiration','Transpiration'], correct:'Photosynthesis', emoji:'🌿'},
      {q:'Plants need ___ to make food', opts:['Sunlight, water, CO₂','Only water','Only soil','Only sunlight'], correct:'Sunlight, water, CO₂', emoji:'☀️'},
      {q:'Leaves contain ___ which traps sunlight', opts:['Chlorophyll','Glucose','Oxygen','Carbon'], correct:'Chlorophyll', emoji:'🍃'},
      {q:'During photosynthesis, plants release ___', opts:['Oxygen','Carbon dioxide','Nitrogen','Water vapour'], correct:'Oxygen', emoji:'💨'},
      {q:'Roots absorb ___ from soil', opts:['Water and minerals','Sunlight','Oxygen','Carbon dioxide'], correct:'Water and minerals', emoji:'🌱'},
    ],
    sci_water2: [
      {q:'When water is heated, it becomes ___', opts:['Water vapour','Ice','Snow','Dew'], correct:'Water vapour', emoji:'♨️'},
      {q:'Water vapour rising into the sky is called ___', opts:['Evaporation','Condensation','Precipitation','Transpiration'], correct:'Evaporation', emoji:'☀️'},
      {q:'Water vapour cooling to form clouds is ___', opts:['Condensation','Evaporation','Freezing','Boiling'], correct:'Condensation', emoji:'☁️'},
      {q:'Rain, snow and hail are forms of ___', opts:['Precipitation','Evaporation','Condensation','Transpiration'], correct:'Precipitation', emoji:'🌧️'},
      {q:'Where does the water in clouds come from?', opts:['Oceans and seas','Mountains','Underground','Rivers only'], correct:'Oceans and seas', emoji:'🌊'},
    ],
    sci_planets: [
      {q:'How many planets are in our solar system?', opts:['8','9','7','10'], correct:'8', emoji:'🪐'},
      {q:'The planet closest to the Sun is ___', opts:['Mercury','Venus','Earth','Mars'], correct:'Mercury', emoji:'☀️'},
      {q:'Which planet is known as the Red Planet?', opts:['Mars','Jupiter','Venus','Saturn'], correct:'Mars', emoji:'🔴'},
      {q:'Earth is the ___ planet from the Sun', opts:['3rd','2nd','4th','1st'], correct:'3rd', emoji:'🌍'},
      {q:'The largest planet in our solar system is ___', opts:['Jupiter','Saturn','Neptune','Uranus'], correct:'Jupiter', emoji:'🌌'},
    ],
    sci_electricity: [
      {q:'For current to flow, a circuit must be ___', opts:['Complete/closed','Broken/open','Half connected','Inverted'], correct:'Complete/closed', emoji:'⚡'},
      {q:'A ___ allows electricity to pass through it', opts:['Conductor','Insulator','Resistor','Switch'], correct:'Conductor', emoji:'🔌'},
      {q:'Rubber is an example of an ___', opts:['Insulator','Conductor','Battery','Circuit'], correct:'Insulator', emoji:'🟡'},
      {q:'A switch in the OFF position ___ the circuit', opts:['Opens/breaks','Closes','Completes','Powers'], correct:'Opens/breaks', emoji:'💡'},
      {q:'Which is a good conductor of electricity?', opts:['Copper wire','Plastic spoon','Rubber glove','Wood'], correct:'Copper wire', emoji:'🔩'},
    ],
    sci_light2: [
      {q:'When light bends as it passes through water, this is called ___', opts:['Refraction','Reflection','Dispersion','Absorption'], correct:'Refraction', emoji:'🌈'},
      {q:'A mirror reflects light because its surface is ___', opts:['Smooth and shiny','Rough','Transparent','Coloured'], correct:'Smooth and shiny', emoji:'🪞'},
      {q:'A prism splits white light into ___', opts:['Rainbow colours','Red only','Black','Two colours'], correct:'Rainbow colours', emoji:'🌈'},
      {q:'Objects we can see through clearly are ___', opts:['Transparent','Opaque','Translucent','Reflective'], correct:'Transparent', emoji:'🪟'},
      {q:'An opaque object ___ light', opts:['Blocks','Passes','Bends','Stores'], correct:'Blocks', emoji:'⬛'},
    ],
    // Class 4
    sci_energy: [
      {q:'A moving ball has ___ energy', opts:['Kinetic','Potential','Heat','Light'], correct:'Kinetic', emoji:'⚽'},
      {q:'A book on a shelf has ___ energy', opts:['Potential','Kinetic','Sound','Light'], correct:'Potential', emoji:'📚'},
      {q:'Energy cannot be ___ — only transformed', opts:['Created or destroyed','Stored','Transferred','Used'], correct:'Created or destroyed', emoji:'⚡'},
      {q:'The sun is the source of ___ energy', opts:['Solar','Wind','Tidal','Nuclear'], correct:'Solar', emoji:'☀️'},
      {q:'Which energy source is renewable?', opts:['Solar and wind','Coal','Petrol','Natural gas'], correct:'Solar and wind', emoji:'🌬️'},
    ],
    sci_nutrition: [
      {q:'Carbohydrates give us ___', opts:['Energy','Immunity','Body building','Repair'], correct:'Energy', emoji:'🍞'},
      {q:'Proteins help in ___ the body', opts:['Building and repairing','Giving energy','Protecting from germs','Digestion'], correct:'Building and repairing', emoji:'🥩'},
      {q:'Vitamin C is found mainly in ___', opts:['Citrus fruits','Meat','Milk','Rice'], correct:'Citrus fruits', emoji:'🍊'},
      {q:'Lack of Vitamin D causes ___', opts:['Weak bones (rickets)','Scurvy','Night blindness','Anaemia'], correct:'Weak bones (rickets)', emoji:'🦴'},
      {q:'Minerals like calcium help build ___', opts:['Bones and teeth','Muscles only','Skin','Blood cells only'], correct:'Bones and teeth', emoji:'🦷'},
    ],
    sci_cells: [
      {q:'The basic unit of life is the ___', opts:['Cell','Organ','Tissue','System'], correct:'Cell', emoji:'🔬'},
      {q:'A cell wall is found in ___ cells only', opts:['Plant','Animal','Both','Neither'], correct:'Plant', emoji:'🌿'},
      {q:'The powerhouse of the cell is the ___', opts:['Mitochondria','Nucleus','Cell membrane','Vacuole'], correct:'Mitochondria', emoji:'⚡'},
      {q:'The nucleus controls ___', opts:['Cell activities','Cell wall','Photosynthesis','Water intake'], correct:'Cell activities', emoji:'🎯'},
      {q:'Animal cells have a ___ but no cell wall', opts:['Cell membrane','Chloroplast','Rigid wall','Cellulose'], correct:'Cell membrane', emoji:'🟡'},
    ],
    sci_gravity: [
      {q:'Gravity is the force that pulls objects ___', opts:['Downward','Upward','Sideways','In circles'], correct:'Downward', emoji:'🌍'},
      {q:'An apple falls from a tree because of ___', opts:['Gravity','Wind','Friction','Magnetism'], correct:'Gravity', emoji:'🍎'},
      {q:'Friction acts in ___ direction to motion', opts:['Opposite','Same','Upward','No'], correct:'Opposite', emoji:'🛹'},
      {q:'In space, there is almost no ___', opts:['Gravity','Sound','Light','Heat'], correct:'Gravity', emoji:'🚀'},
      {q:'On the Moon, gravity is ___ than on Earth', opts:['Less','More','The same','Zero'], correct:'Less', emoji:'🌕'},
    ],
  };

  // Fallback renderer for any sci_ game
  function make_sci_renderer(gameId) {
    return function(pc) {
      const pool = POOLS[gameId];
      if (!pool) { pc.innerHTML='<div class="q-text">🔬 Coming soon!</div>'; return; }
      const q = pool[Math.floor(Math.random() * pool.length)];
      mcq(pc, q.q, q.opts, q.correct, q.emoji);
    };
  }

  const renderers = {};
  Object.keys(POOLS).forEach(id => { renderers[id] = make_sci_renderer(id); });
  return renderers;
})();

// ================================================================
// ENGLISH RENDERERS — CBSE/NCERT Marigold/Raindrops Classes 1-4
// ================================================================
const ENG_RENDERERS = (() => {
  function mcq(pc, question, options, correct, emoji) {
    const opts = [...options].sort(() => Math.random() - 0.5);
    pc.innerHTML = `
      <div class="q-emoji">${emoji || '📖'}</div>
      <div class="q-text">${question}</div>
      <div class="opts-grid opts-2">${opts.map(o =>
        `<button class="opt-btn" data-ans="${o}" data-correct="${o===correct}">${o}</button>`
      ).join('')}</div>`;
    wireOpts(pc, correct);
  }

  const POOLS = {
    eng_letters: [
      {q:'What is the lowercase of "G"?', opts:['g','p','q','b'], correct:'g', emoji:'🔡'},
      {q:'Which letter comes after "M" in the alphabet?', opts:['N','O','L','P'], correct:'N', emoji:'🔤'},
      {q:'"D" and "d" are ___', opts:['Same letter, different case','Different letters','Vowels','Consonants only'], correct:'Same letter, different case', emoji:'📚'},
      {q:'How many vowels are in the English alphabet?', opts:['5','6','4','7'], correct:'5', emoji:'🗣️'},
      {q:'Which letter is this in uppercase? "a"', opts:['A','D','O','C'], correct:'A', emoji:'🔠'},
    ],
    eng_phonics1: [
      {q:'What sound does "B" make?', opts:['Buh (as in Ball)','Puh (as in Pen)','Muh (as in Mop)','Duh (as in Dog)'], correct:'Buh (as in Ball)', emoji:'🎵'},
      {q:'Apple starts with the sound ___', opts:['/a/','/ e/','/ i/','/ o/'], correct:'/a/', emoji:'🍎'},
      {q:'Which word starts with the same sound as "CAT"?', opts:['Cup','Hat','Bat','Dot'], correct:'Cup', emoji:'🐱'},
      {q:'The word "SUN" starts with ___', opts:['S','C','Z','Sh'], correct:'S', emoji:'☀️'},
      {q:'"Dog" and "Doll" start with the same ___', opts:['Sound','Vowel','Ending','Rhyme'], correct:'Sound', emoji:'🐕'},
    ],
    eng_cvc: [
      {q:'Which is a CVC (consonant-vowel-consonant) word?', opts:['Cat','Play','Tree','Blast'], correct:'Cat', emoji:'🐱'},
      {q:'Complete the word: B _ G', opts:['i (big)','a (bag)','o (bog)','All of these'], correct:'All of these', emoji:'🎯'},
      {q:'"H_T" — which vowel makes the word "hot"?', opts:['o','a','i','e'], correct:'o', emoji:'🔥'},
      {q:'Which rhymes with "PIG"?', opts:['Big','Cat','Dog','Bed'], correct:'Big', emoji:'🐷'},
      {q:'The word "MOP" has ___ letters', opts:['3','4','2','5'], correct:'3', emoji:'🧹'},
    ],
    eng_sight1: [
      {q:'Which word means "the opposite of off"?', opts:['On','In','Up','At'], correct:'On', emoji:'💡'},
      {q:'Fill in: "She ___ happy."', opts:['is','am','are','be'], correct:'is', emoji:'😊'},
      {q:'Which sight word means "not false"?', opts:['True','Can','The','And'], correct:'True', emoji:'✅'},
      {q:'"They ___ my friends." Choose the right word.', opts:['are','is','am','was'], correct:'are', emoji:'👫'},
      {q:'Which is a sight word?', opts:['the','elephant','difficult','caterpillar'], correct:'the', emoji:'📖'},
    ],
    eng_rhyme: [
      {q:'Which word rhymes with "CAKE"?', opts:['Lake','Kick','Sock','Pick'], correct:'Lake', emoji:'🎂'},
      {q:'Which word rhymes with "MOON"?', opts:['Spoon','Star','Light','Night'], correct:'Spoon', emoji:'🌙'},
      {q:'"CAT" rhymes with ___', opts:['Hat','Cut','Pit','Hot'], correct:'Hat', emoji:'🐱'},
      {q:'Which pair rhymes?', opts:['Rain – Train','Cat – Dog','Sun – Moon','Tree – Bee... wait — Bee rhymes with Tree!'], correct:'Rain – Train', emoji:'🎵'},
      {q:'Which word does NOT rhyme with "BALL"?', opts:['Bell','Wall','Hall','Fall'], correct:'Bell', emoji:'🎾'},
    ],
    eng_nouns1: [
      {q:'Which is a noun?', opts:['Dog','Run','Happy','Quickly'], correct:'Dog', emoji:'🏷️'},
      {q:'"School" is a ___ noun', opts:['Place','Person','Animal','Thing'], correct:'Place', emoji:'🏫'},
      {q:'Which word is the name of a person?', opts:['Teacher','Jump','Blue','Fast'], correct:'Teacher', emoji:'👩‍🏫'},
      {q:'Nouns are the names of ___', opts:['People, places, things, animals','Actions','Feelings only','Colours only'], correct:'People, places, things, animals', emoji:'📦'},
      {q:'Which is a proper noun?', opts:['Mumbai','city','river','mountain'], correct:'Mumbai', emoji:'🏙️'},
    ],
    eng_opposite1: [
      {q:'Opposite of "HOT" is ___', opts:['Cold','Warm','Cool','Icy'], correct:'Cold', emoji:'🌡️'},
      {q:'Opposite of "BIG" is ___', opts:['Small','Huge','Tiny... wait — Tiny is also correct!','Little'], correct:'Small', emoji:'🐘'},
      {q:'Opposite of "DAY" is ___', opts:['Night','Morning','Evening','Noon'], correct:'Night', emoji:'🌙'},
      {q:'Opposite of "FAST" is ___', opts:['Slow','Quick','Swift','Rapid'], correct:'Slow', emoji:'🐢'},
      {q:'Opposite of "HAPPY" is ___', opts:['Sad','Angry','Tired','Hungry'], correct:'Sad', emoji:'😢'},
    ],
    eng_plurals: [
      {q:'Plural of "BOOK" is ___', opts:['Books','Bookes','Bookies','Book'], correct:'Books', emoji:'📚'},
      {q:'Plural of "CHURCH" is ___', opts:['Churches','Churchs','Churchies','Church'], correct:'Churches', emoji:'⛪'},
      {q:'Plural of "BABY" is ___', opts:['Babies','Babys','Babyes','Baby'], correct:'Babies', emoji:'👶'},
      {q:'Plural of "LEAF" is ___', opts:['Leaves','Leafs','Leafes','Leaf'], correct:'Leaves', emoji:'🍃'},
      {q:'Plural of "MOUSE" is ___', opts:['Mice','Mouses','Mousies','Mouse'], correct:'Mice', emoji:'🐭'},
    ],
    eng_adjectives: [
      {q:'Which word is an adjective?', opts:['Beautiful','Run','Quickly','She'], correct:'Beautiful', emoji:'🌸'},
      {q:'"The ___ cat slept." Which fits best?', opts:['Lazy','Run','She','Never'], correct:'Lazy', emoji:'😴'},
      {q:'Adjectives describe ___', opts:['Nouns','Verbs','Pronouns','Prepositions'], correct:'Nouns', emoji:'🏷️'},
      {q:'Which is NOT an adjective?', opts:['Dance','Tall','Small','Green'], correct:'Dance', emoji:'💃'},
      {q:'"She has a ___ voice." Which adjective fits?', opts:['Sweet','Runs','Slowly','Her'], correct:'Sweet', emoji:'🎵'},
    ],
    eng_verbs1: [
      {q:'Which is an action verb?', opts:['Jump','Happy','Blue','Quick'], correct:'Jump', emoji:'🏃'},
      {q:'"She ___ to school." Which verb fits?', opts:['Runs','Running','Run only if past','Ran only'], correct:'Runs', emoji:'🏫'},
      {q:'Verbs describe ___', opts:['Actions or states','Things','Places','People'], correct:'Actions or states', emoji:'⚡'},
      {q:'Which is NOT a verb?', opts:['Beautiful','Eat','Sleep','Think'], correct:'Beautiful', emoji:'🌺'},
      {q:'"They ___ a song." Which verb completes it?', opts:['Sang','Beautiful','Tall','Always'], correct:'Sang', emoji:'🎵'},
    ],
    eng_tense1: [
      {q:'"She PLAYS cricket every day." This is ___ tense.', opts:['Present','Past','Future','Perfect'], correct:'Present', emoji:'⏰'},
      {q:'"He PLAYED cricket yesterday." This is ___ tense.', opts:['Past','Present','Future','Perfect'], correct:'Past', emoji:'📅'},
      {q:'"They WILL PLAY tomorrow." This is ___ tense.', opts:['Future','Past','Present','Continuous'], correct:'Future', emoji:'🔮'},
      {q:'Change to past: "I EAT an apple."', opts:['I ate an apple','I eated an apple','I eats an apple','I eating'], correct:'I ate an apple', emoji:'🍎'},
      {q:'Change to future: "She WRITES a letter."', opts:['She will write a letter','She wrote a letter','She writes a letter','She writing'], correct:'She will write a letter', emoji:'✉️'},
    ],
    eng_articles: [
      {q:'"___ elephant is large." Use:', opts:['An','A','The','Some'], correct:'An', emoji:'🐘'},
      {q:'"___ dog barked." (specific dog)', opts:['The','A','An','Some'], correct:'The', emoji:'🐕'},
      {q:'"I saw ___ bird in the tree." (any bird)', opts:['A','An','The','Some'], correct:'A', emoji:'🐦'},
      {q:'"___ honest man told the truth." Use:', opts:['An','A','The','Some'], correct:'An', emoji:'🤝'},
      {q:'"She is ___ best student."', opts:['The','A','An','Some'], correct:'The', emoji:'🥇'},
    ],
    eng_prefixes: [
      {q:'"UN" + "happy" = ___', opts:['Unhappy (not happy)','Very happy','Quite happy','Always happy'], correct:'Unhappy (not happy)', emoji:'😞'},
      {q:'The prefix "RE" means ___', opts:['Again','Not','Before','After'], correct:'Again', emoji:'🔁'},
      {q:'"PRE" + "school" = school ___', opts:['Before regular school','After school','In school','Big school'], correct:'Before regular school', emoji:'🏫'},
      {q:'Opposite of "possible" using a prefix:', opts:['Impossible','Nonpossible','Unpossible','Dispossible'], correct:'Impossible', emoji:'🚫'},
      {q:'"MIS" + "spell" = ___', opts:['Misspell (spell wrongly)','Spell again','Spell correctly','Double spell'], correct:'Misspell (spell wrongly)', emoji:'✍️'},
    ],
    eng_compound: [
      {q:'"RAIN" + "BOW" = ___', opts:['Rainbow','Raincoat','Rainforest','Rainfall'], correct:'Rainbow', emoji:'🌈'},
      {q:'"SUN" + "FLOWER" = ___', opts:['Sunflower','Sunshine','Sunburn','Sunset'], correct:'Sunflower', emoji:'🌻'},
      {q:'"FOOT" + "BALL" = ___', opts:['Football','Footwear','Footstep','Footprint'], correct:'Football', emoji:'⚽'},
      {q:'"BOOK" + "SHELF" = ___', opts:['Bookshelf','Bookstore','Bookmark','Bookworm'], correct:'Bookshelf', emoji:'📚'},
      {q:'Which is a compound word?', opts:['Butterfly','Happy','Quickly','Beautiful'], correct:'Butterfly', emoji:'🦋'},
    ],
    eng_tense2: [
      {q:'"She HAS EATEN lunch." This is ___ tense.', opts:['Present Perfect','Simple Past','Future Perfect','Past Continuous'], correct:'Present Perfect', emoji:'⏰'},
      {q:'"They WERE PLAYING when it rained." — the playing was ___', opts:['Past Continuous','Simple Past','Future','Present Perfect'], correct:'Past Continuous', emoji:'⚽'},
      {q:'Choose the correct form: "By tomorrow, I ___ finished."', opts:['will have','have','had','will be'], correct:'will have', emoji:'📅'},
      {q:'"I ___ here since 2020." Use:', opts:['have been','was','am been','will be'], correct:'have been', emoji:'🏠'},
      {q:'Past perfect: "She ___ before I arrived."', opts:['had left','has left','left','leaves'], correct:'had left', emoji:'🚶'},
    ],
    eng_figure: [
      {q:'"The classroom was a ZOO." This is a ___', opts:['Metaphor','Simile','Personification','Alliteration'], correct:'Metaphor', emoji:'🦁'},
      {q:'"As brave as a LION" is a ___', opts:['Simile','Metaphor','Personification','Hyperbole'], correct:'Simile', emoji:'🔍'},
      {q:'"The WIND whispered" is an example of ___', opts:['Personification','Simile','Metaphor','Alliteration'], correct:'Personification', emoji:'🌬️'},
      {q:'"Peter Piper picked a peck" — this is ___', opts:['Alliteration','Rhyme','Simile','Hyperbole'], correct:'Alliteration', emoji:'🎵'},
      {q:'"I\'ve told you a MILLION times!" is ___', opts:['Hyperbole','Fact','Simile','Metaphor'], correct:'Hyperbole', emoji:'📢'},
    ],
    eng_clauses: [
      {q:'"Although it was raining, she went out." The clause after "although" is a ___', opts:['Subordinate clause','Main clause','Noun clause','Independent clause'], correct:'Subordinate clause', emoji:'🌧️'},
      {q:'Which conjunction joins two equal clauses?', opts:['And, but, or','Although, because, since','Whether, if','That, which'], correct:'And, but, or', emoji:'🔗'},
      {q:'"Because she studied hard" — is this a complete sentence?', opts:['No — it is a fragment','Yes, it is complete','Yes, it is a question','Yes, it is a command'], correct:'No — it is a fragment', emoji:'📝'},
      {q:'A main clause ___', opts:['Makes sense on its own','Needs another clause','Starts with "because"','Has no verb'], correct:'Makes sense on its own', emoji:'✅'},
      {q:'"The girl WHO won the race is my friend." WHO introduces a ___', opts:['Relative clause','Main clause','Adverb clause','Noun clause'], correct:'Relative clause', emoji:'🏆'},
    ],
    eng_vocabulary: [
      {q:'What does "BENEVOLENT" mean?', opts:['Kind and generous','Angry','Clever','Nervous'], correct:'Kind and generous', emoji:'💛'},
      {q:'A synonym for "RAPID" is ___', opts:['Fast','Slow','Careful','Quiet'], correct:'Fast', emoji:'⚡'},
      {q:'What does "TRANSPARENT" mean?', opts:['See-through','Hidden','Colourful','Rough'], correct:'See-through', emoji:'🪟'},
      {q:'Antonym of "ANCIENT" is ___', opts:['Modern','Old','Antique','Historic'], correct:'Modern', emoji:'🏛️'},
      {q:'Which word means "very happy"?', opts:['Ecstatic','Furious','Melancholy','Anxious'], correct:'Ecstatic', emoji:'🎉'},
    ],
  };

  function make_eng_renderer(gameId) {
    return function(pc) {
      const pool = POOLS[gameId];
      if (!pool) { pc.innerHTML='<div class="q-text">📖 Coming soon!</div>'; return; }
      const q = pool[Math.floor(Math.random() * pool.length)];
      mcq(pc, q.q, q.opts, q.correct, q.emoji);
    };
  }

  const renderers = {};
  Object.keys(POOLS).forEach(id => { renderers[id] = make_eng_renderer(id); });
  return renderers;
})();

// Merge SCI and ENG renderers into GAME_RENDERERS
Object.assign(GAME_RENDERERS, SCI_RENDERERS, ENG_RENDERERS);

// ================================================================
// MISSING RENDERER POOLS — fills every gap so no game crashes
// ================================================================
(function addMissingPools() {

  // ── Helper shared with SCI/ENG_RENDERERS ─────────────────
  function mcq(pc, question, options, correct, emoji) {
    const opts = [...options].sort(() => Math.random() - 0.5);
    pc.innerHTML = `
      <div class="q-emoji">${emoji || '🔬'}</div>
      <div class="q-text">${question}</div>
      <div class="opts-grid opts-2">${opts.map(o =>
        `<button class="opt-btn" data-ans="${o}" data-correct="${o===correct}">${o}</button>`
      ).join('')}</div>`;
    wireOpts(pc, correct);
  }

  const EXTRA_POOLS = {

    // ── Science missing pools ────────────────────────────────
    sci_body2: [
      {q:'How many bones are in an adult human body?', opts:['206','100','150','250'], correct:'206', emoji:'🦴'},
      {q:'Which teeth help us grind food?', opts:['Molars','Incisors','Canines','Wisdom teeth'], correct:'Molars', emoji:'🦷'},
      {q:'Food is digested mainly in the ___', opts:['Small intestine','Stomach only','Mouth','Large intestine'], correct:'Small intestine', emoji:'🫀'},
      {q:'Bones meet at a ___', opts:['Joint','Muscle','Tendon','Ligament'], correct:'Joint', emoji:'💪'},
      {q:'The largest bone in the body is the ___', opts:['Femur (thigh)','Skull','Spine','Ribs'], correct:'Femur (thigh)', emoji:'🦵'},
    ],
    sci_growth: [
      {q:'A caterpillar grows into a ___', opts:['Butterfly','Moth only','Spider','Beetle'], correct:'Butterfly', emoji:'🦋'},
      {q:'A seed grows into a ___', opts:['Plant','Fruit directly','Flower only','Root'], correct:'Plant', emoji:'🌱'},
      {q:'A tadpole grows into a ___', opts:['Frog','Fish','Lizard','Toad only'], correct:'Frog', emoji:'🐸'},
      {q:'Which animal hatches from an egg?', opts:['Hen','Cat','Dog','Cow'], correct:'Hen', emoji:'🐣'},
      {q:'Complete metamorphosis has ___ stages', opts:['4 — egg, larva, pupa, adult','2','3','5'], correct:'4 — egg, larva, pupa, adult', emoji:'🔄'},
    ],
    sci_light1: [
      {q:'The sun, bulb and fire are sources of ___', opts:['Light','Sound','Heat only','Electricity'], correct:'Light', emoji:'💡'},
      {q:'A shadow is formed when an object ___ light', opts:['Blocks','Reflects','Bends','Absorbs completely'], correct:'Blocks', emoji:'🌑'},
      {q:'Light travels in a ___ line', opts:['Straight','Curved','Zigzag','Circular'], correct:'Straight', emoji:'➡️'},
      {q:'The moon produces ___ own light', opts:['No — it reflects sunlight','Yes, all planets do','Only sometimes','Only at full moon'], correct:'No — it reflects sunlight', emoji:'🌕'},
      {q:'Which material lets light pass through fully?', opts:['Glass','Wood','Brick','Cloth'], correct:'Glass', emoji:'🪟'},
    ],
    sci_sound1: [
      {q:'Sound is produced by ___', opts:['Vibrations','Light','Pressure only','Heat'], correct:'Vibrations', emoji:'🔊'},
      {q:'Sound travels fastest through ___', opts:['Solids','Liquids','Gases','Vacuum'], correct:'Solids', emoji:'🔩'},
      {q:'Sound cannot travel through a ___', opts:['Vacuum','Liquid','Gas','Solid'], correct:'Vacuum', emoji:'🌌'},
      {q:'The unit of loudness is ___', opts:['Decibel (dB)','Hertz (Hz)','Watt','Metre'], correct:'Decibel (dB)', emoji:'📢'},
      {q:'An echo is sound being ___', opts:['Reflected','Absorbed','Created','Destroyed'], correct:'Reflected', emoji:'🏔️'},
    ],
    sci_seasons: [
      {q:'How many seasons does India mainly have?', opts:['3 — Summer, Monsoon, Winter','4','2','6'], correct:'3 — Summer, Monsoon, Winter', emoji:'🌦️'},
      {q:'Days are longest in ___', opts:['Summer','Winter','Monsoon','Spring'], correct:'Summer', emoji:'☀️'},
      {q:'Deciduous trees shed leaves in ___', opts:['Autumn/Winter','Spring','Summer','Monsoon'], correct:'Autumn/Winter', emoji:'🍂'},
      {q:'Which season brings the most rainfall to India?', opts:['Monsoon (June–September)','Winter','Summer','Spring'], correct:'Monsoon (June–September)', emoji:'🌧️'},
      {q:'Earth\'s seasons are caused by its ___', opts:['Tilt on its axis','Distance from the sun','Rotation speed','Size'], correct:'Tilt on its axis', emoji:'🌍'},
    ],
    sci_soil: [
      {q:'Which type of soil is best for growing crops?', opts:['Loamy soil','Sandy soil','Clay soil','Rocky soil'], correct:'Loamy soil', emoji:'🌱'},
      {q:'Soil is formed from the breaking down of ___', opts:['Rocks and dead organisms','Only rocks','Only dead plants','Water and air'], correct:'Rocks and dead organisms', emoji:'🪨'},
      {q:'Sandy soil has ___ particles', opts:['Large','Small','Medium','No'], correct:'Large', emoji:'🏖️'},
      {q:'Earthworms are helpful because they ___', opts:['Loosen and enrich soil','Damage roots','Eat crops','Dry the soil'], correct:'Loosen and enrich soil', emoji:'🪱'},
      {q:'Clay soil holds ___ water', opts:['More','Less','No','Hot'], correct:'More', emoji:'💧'},
    ],
    sci_air: [
      {q:'Air is a mixture of ___', opts:['Gases (mainly nitrogen & oxygen)','Only oxygen','Only nitrogen','Only carbon dioxide'], correct:'Gases (mainly nitrogen & oxygen)', emoji:'🌬️'},
      {q:'Oxygen in air is about ___', opts:['21%','78%','1%','50%'], correct:'21%', emoji:'💨'},
      {q:'Plants need ___ from air to make food', opts:['Carbon dioxide','Oxygen','Nitrogen','Hydrogen'], correct:'Carbon dioxide', emoji:'🌿'},
      {q:'Moving air is called ___', opts:['Wind','Breeze only','Storm only','Oxygen'], correct:'Wind', emoji:'💨'},
      {q:'Air pollution is mainly caused by ___', opts:['Burning fossil fuels','Breathing','Plants','Rain'], correct:'Burning fossil fuels', emoji:'🏭'},
    ],
    sci_save: [
      {q:'The 3 Rs of conservation are ___', opts:['Reduce, Reuse, Recycle','Read, Rest, Run','Rain, River, Rock','Remove, Replace, Refill'], correct:'Reduce, Reuse, Recycle', emoji:'♻️'},
      {q:'Cutting down too many trees is called ___', opts:['Deforestation','Afforestation','Conservation','Pollution'], correct:'Deforestation', emoji:'🌳'},
      {q:'Planting more trees is called ___', opts:['Afforestation','Deforestation','Pollution','Mining'], correct:'Afforestation', emoji:'🌱'},
      {q:'Biodegradable waste ___', opts:['Breaks down naturally','Stays forever','Causes pollution always','Is all plastic'], correct:'Breaks down naturally', emoji:'🍌'},
      {q:'Which energy source does NOT pollute?', opts:['Solar energy','Coal','Petrol','Wood burning'], correct:'Solar energy', emoji:'☀️'},
    ],
    sci_ecosystem: [
      {q:'A community of living things and their environment is called ___', opts:['Ecosystem','Habitat','Population','Biome'], correct:'Ecosystem', emoji:'🌿'},
      {q:'Producers in an ecosystem are ___', opts:['Plants','Animals','Fungi','Bacteria'], correct:'Plants', emoji:'🌱'},
      {q:'Decomposers break down ___', opts:['Dead organisms','Living plants','Water','Rocks'], correct:'Dead organisms', emoji:'🍄'},
      {q:'A food web shows ___', opts:['Multiple overlapping food chains','One food chain','Just predators','Just prey'], correct:'Multiple overlapping food chains', emoji:'🕸️'},
      {q:'Removing one species from an ecosystem can ___', opts:['Affect all others','Have no effect','Only affect predators','Only affect plants'], correct:'Affect all others', emoji:'⚠️'},
    ],
    sci_matter2: [
      {q:'Melting is a ___ change', opts:['Physical','Chemical','Biological','Nuclear'], correct:'Physical', emoji:'🧊'},
      {q:'Burning wood is a ___ change', opts:['Chemical','Physical','Reversible','Simple'], correct:'Chemical', emoji:'🔥'},
      {q:'A physical change is ___', opts:['Reversible','Irreversible','Always chemical','Permanent'], correct:'Reversible', emoji:'🔄'},
      {q:'Rusting of iron is a ___ change', opts:['Chemical','Physical','Reversible','Harmless'], correct:'Chemical', emoji:'🪝'},
      {q:'Dissolving sugar in water is a ___ change', opts:['Physical','Chemical','Biological','Permanent'], correct:'Physical', emoji:'☕'},
    ],
    sci_simple_machines: [
      {q:'A see-saw is an example of a ___', opts:['Lever','Pulley','Wheel','Inclined plane'], correct:'Lever', emoji:'⚖️'},
      {q:'A ramp (slope) is an ___', opts:['Inclined plane','Lever','Pulley','Screw'], correct:'Inclined plane', emoji:'📐'},
      {q:'A wheel and axle make it easier to ___', opts:['Turn and move heavy loads','Lift objects straight up','Cut things','Pull ropes'], correct:'Turn and move heavy loads', emoji:'🎡'},
      {q:'A pulley is used to ___', opts:['Lift heavy objects using a rope','Slice through material','Roll things','Hold things together'], correct:'Lift heavy objects using a rope', emoji:'🪤'},
      {q:'A wedge is used to ___', opts:['Split or cut things','Lift things','Roll things','Hold bolts'], correct:'Split or cut things', emoji:'🪓'},
    ],
    sci_skeleton: [
      {q:'The skull protects the ___', opts:['Brain','Heart','Lungs','Stomach'], correct:'Brain', emoji:'💀'},
      {q:'The ribcage protects the ___', opts:['Heart and lungs','Brain','Stomach','Kidneys'], correct:'Heart and lungs', emoji:'🫁'},
      {q:'Muscles are attached to bones by ___', opts:['Tendons','Ligaments','Nerves','Cartilage'], correct:'Tendons', emoji:'💪'},
      {q:'Bones and muscles together form the ___ system', opts:['Musculoskeletal','Nervous','Digestive','Circulatory'], correct:'Musculoskeletal', emoji:'🦴'},
      {q:'Which bone protects the spinal cord?', opts:['Vertebral column (spine)','Ribcage','Skull','Pelvis'], correct:'Vertebral column (spine)', emoji:'🦴'},
    ],
    sci_human: [
      {q:'The heart pumps blood around the body through ___', opts:['Blood vessels','Nerves','Bones','Lymph nodes'], correct:'Blood vessels', emoji:'❤️'},
      {q:'We breathe oxygen INTO our lungs and breathe OUT ___', opts:['Carbon dioxide','Nitrogen','Hydrogen','Water vapour only'], correct:'Carbon dioxide', emoji:'🫁'},
      {q:'The brain is part of the ___ system', opts:['Nervous','Circulatory','Digestive','Respiratory'], correct:'Nervous', emoji:'🧠'},
      {q:'Blood is pumped by the ___', opts:['Heart','Liver','Lungs','Kidneys'], correct:'Heart', emoji:'💓'},
      {q:'The stomach is part of the ___ system', opts:['Digestive','Circulatory','Nervous','Respiratory'], correct:'Digestive', emoji:'🫀'},
    ],
    sci_human2: [
      {q:'The nervous system controls ___', opts:['All body functions and responses','Only movement','Only thinking','Only breathing'], correct:'All body functions and responses', emoji:'🧠'},
      {q:'A reflex action is ___', opts:['Automatic, without thinking','Planned','Learned','Slow'], correct:'Automatic, without thinking', emoji:'⚡'},
      {q:'Neurons are cells in the ___', opts:['Brain and nerves','Muscles','Blood','Skin'], correct:'Brain and nerves', emoji:'🔬'},
      {q:'The spinal cord connects the brain to ___', opts:['The rest of the body','The heart only','The lungs','The stomach'], correct:'The rest of the body', emoji:'🦴'},
      {q:'Which sense organ connects to the brain via the optic nerve?', opts:['Eyes','Ears','Nose','Tongue'], correct:'Eyes', emoji:'👁️'},
    ],
    sci_animals2: [
      {q:'A camel stores water/fat in its ___', opts:['Hump','Stomach','Legs','Neck'], correct:'Hump', emoji:'🐪'},
      {q:'Fish have ___ to breathe underwater', opts:['Gills','Lungs','Both gills and lungs','Skin only'], correct:'Gills', emoji:'🐟'},
      {q:'Birds have ___ to help them fly', opts:['Hollow bones','Dense bones','No bones','Stone bones'], correct:'Hollow bones', emoji:'🦅'},
      {q:'Which animal can survive in both water and land?', opts:['Frog','Fish','Eagle','Camel'], correct:'Frog', emoji:'🐸'},
      {q:'Polar bears have ___ fur to stay warm', opts:['Thick white','Thin','Colourful','No'], correct:'Thick white', emoji:'🐻‍❄️'},
    ],
    sci_electricity2: [
      {q:'A conductor allows ___ to flow', opts:['Electricity','Water only','Heat only','Sound'], correct:'Electricity', emoji:'⚡'},
      {q:'Which is the best conductor?', opts:['Copper','Rubber','Plastic','Wood'], correct:'Copper', emoji:'🔩'},
      {q:'A fuse protects a circuit from ___', opts:['Too much current','Too little current','Short circuits only','Water'], correct:'Too much current', emoji:'🔌'},
      {q:'Current flows from ___ terminal of a battery', opts:['Positive (+)','Negative (–)','Either terminal','Neither'], correct:'Positive (+)', emoji:'🔋'},
      {q:'LED stands for ___', opts:['Light Emitting Diode','Large Electric Device','Low Energy Device','Laser Emitting Display'], correct:'Light Emitting Diode', emoji:'💡'},
    ],
    sci_pollution: [
      {q:'Air pollution is measured in ___', opts:['AQI (Air Quality Index)','Decibels','pH levels','Lumens'], correct:'AQI (Air Quality Index)', emoji:'🏭'},
      {q:'Which gas causes the greenhouse effect?', opts:['Carbon dioxide (CO₂)','Oxygen','Nitrogen','Hydrogen'], correct:'Carbon dioxide (CO₂)', emoji:'🌍'},
      {q:'Water pollution is mainly caused by ___', opts:['Factory waste and sewage','Rain','Fish','Boats'], correct:'Factory waste and sewage', emoji:'🏭'},
      {q:'Soil pollution is caused by ___', opts:['Excessive pesticides and chemicals','Planting trees','Irrigation','Compost'], correct:'Excessive pesticides and chemicals', emoji:'🌱'},
      {q:'Global warming leads to ___', opts:['Rising sea levels','Lower temperatures','Less rain','Larger ice caps'], correct:'Rising sea levels', emoji:'🌊'},
    ],
    sci_rocks2: [
      {q:'Rocks formed from cooled lava are ___', opts:['Igneous','Sedimentary','Metamorphic','Composite'], correct:'Igneous', emoji:'🌋'},
      {q:'Rocks formed from layers of sediment are ___', opts:['Sedimentary','Igneous','Metamorphic','Crystal'], correct:'Sedimentary', emoji:'🏔️'},
      {q:'Rocks changed by heat and pressure are ___', opts:['Metamorphic','Igneous','Sedimentary','Basic'], correct:'Metamorphic', emoji:'💎'},
      {q:'Fossils are mainly found in ___ rocks', opts:['Sedimentary','Igneous','Metamorphic','Crystal'], correct:'Sedimentary', emoji:'🦕'},
      {q:'Marble is a ___ rock', opts:['Metamorphic','Igneous','Sedimentary','Volcanic'], correct:'Metamorphic', emoji:'🏛️'},
    ],
    sci_weather2: [
      {q:'A thermometer measures ___', opts:['Temperature','Rainfall','Wind speed','Humidity'], correct:'Temperature', emoji:'🌡️'},
      {q:'A barometer measures ___', opts:['Air pressure','Temperature','Wind','Humidity'], correct:'Air pressure', emoji:'📊'},
      {q:'Climate is the ___ weather of a region', opts:['Average long-term','Daily','Weekly','Monthly only'], correct:'Average long-term', emoji:'🌍'},
      {q:'The tropical climate zone is near the ___', opts:['Equator','North Pole','South Pole','Arctic Circle'], correct:'Equator', emoji:'🌴'},
      {q:'El Niño affects ___', opts:['Global weather patterns','Only South America','Only the ocean','Only rainfall'], correct:'Global weather patterns', emoji:'🌊'},
    ],
    sci_reproduction: [
      {q:'Plants that reproduce by seeds include ___', opts:['Mango tree','Fern','Mushroom','Moss'], correct:'Mango tree', emoji:'🌳'},
      {q:'Asexual reproduction needs ___ parent(s)', opts:['1','2','3','4'], correct:'1', emoji:'🔬'},
      {q:'Budding is seen in ___', opts:['Yeast and hydra','Humans','Fish','Birds'], correct:'Yeast and hydra', emoji:'🌱'},
      {q:'Pollination is the transfer of ___ to a flower', opts:['Pollen','Seeds','Water','Nutrients'], correct:'Pollen', emoji:'🌸'},
      {q:'A fertilised egg in animals develops into ___', opts:['An embryo','A seed','A bud','A spore'], correct:'An embryo', emoji:'🐣'},
    ],
    sci_environment: [
      {q:'Biodiversity means ___', opts:['Variety of life forms on Earth','Only animal diversity','Plant diversity only','Ocean life'], correct:'Variety of life forms on Earth', emoji:'🌍'},
      {q:'An endangered species is one that ___', opts:['May become extinct','Is very common','Lives in zoos','Was never wild'], correct:'May become extinct', emoji:'🐼'},
      {q:'Conservation means ___', opts:['Protecting and preserving nature','Destroying forests','Building dams','Burning forests'], correct:'Protecting and preserving nature', emoji:'🌱'},
      {q:'Climate change is mainly caused by ___', opts:['Human activities releasing CO₂','Natural events only','The sun getting hotter','Ocean currents'], correct:'Human activities releasing CO₂', emoji:'🏭'},
      {q:'Ozone layer protects Earth from ___', opts:['Harmful UV radiation','Gravity','Sound','Earthquakes'], correct:'Harmful UV radiation', emoji:'☀️'},
    ],

    // ── English missing pools ────────────────────────────────
    eng_abc_order: [
      {q:'Which comes first in alphabetical order?', opts:['Apple, Banana, Cherry','Cherry, Banana, Apple','Banana, Apple, Cherry','Cherry, Apple, Banana'], correct:'Apple, Banana, Cherry', emoji:'🔡'},
      {q:'Arrange: Dog, Cat, Elephant', opts:['Cat, Dog, Elephant','Dog, Cat, Elephant','Elephant, Dog, Cat','Dog, Elephant, Cat'], correct:'Cat, Dog, Elephant', emoji:'📚'},
      {q:'Which letter comes before "P" in the alphabet?', opts:['O','Q','R','N'], correct:'O', emoji:'🔤'},
      {q:'Words in a dictionary are arranged ___', opts:['Alphabetically','By length','By importance','Randomly'], correct:'Alphabetically', emoji:'📖'},
      {q:'Arrange: Mango, Apple, Orange', opts:['Apple, Mango, Orange','Mango, Apple, Orange','Orange, Apple, Mango','Apple, Orange, Mango'], correct:'Apple, Mango, Orange', emoji:'🍎'},
    ],
    eng_blends: [
      {q:'Which word starts with a consonant blend?', opts:['Bread','Dog','Apple','Egg'], correct:'Bread', emoji:'🍞'},
      {q:'"ST" + "ar" = ___', opts:['Star','Scar','Tar','Bar'], correct:'Star', emoji:'⭐'},
      {q:'Which has the blend "CL"?', opts:['Clock','Lock','Dock','Rock'], correct:'Clock', emoji:'🕐'},
      {q:'"TR" + "ain" = ___', opts:['Train','Rain','Gain','Pain'], correct:'Train', emoji:'🚂'},
      {q:'Which starts with "SP"?', opts:['Spider','Rider','Cider','Tiger'], correct:'Spider', emoji:'🕷️'},
    ],
    eng_colours: [
      {q:'What colour is the sky on a clear day?', opts:['Blue','Red','Green','Yellow'], correct:'Blue', emoji:'🌤️'},
      {q:'Which colour do you get by mixing red and yellow?', opts:['Orange','Purple','Green','Brown'], correct:'Orange', emoji:'🎨'},
      {q:'The colour of grass is ___', opts:['Green','Brown','Yellow','Blue'], correct:'Green', emoji:'🌿'},
      {q:'Red + Blue = ___', opts:['Purple','Orange','Green','Brown'], correct:'Purple', emoji:'🟣'},
      {q:'Which colour represents danger on a traffic light?', opts:['Red','Green','Yellow','Blue'], correct:'Red', emoji:'🚦'},
    ],
    eng_picture: [
      {q:'In a picture story, what helps you understand what is happening?', opts:['The actions shown','Only the colours','Only the background','The frame size'], correct:'The actions shown', emoji:'🖼️'},
      {q:'Which question word asks WHAT is happening?', opts:['What','Who','Where','When'], correct:'What', emoji:'❓'},
      {q:'A picture shows a dog running. What is the dog doing?', opts:['Running','Sleeping','Eating','Swimming'], correct:'Running', emoji:'🐕'},
      {q:'Looking at a picture and writing about it is called ___', opts:['Picture composition','Story writing','Poetry','Grammar'], correct:'Picture composition', emoji:'✍️'},
      {q:'In a picture, the main character is usually ___', opts:['In the centre or most prominent','Hidden at the back','Very small','Outside the frame'], correct:'In the centre or most prominent', emoji:'🎭'},
    ],
    eng_question1: [
      {q:'"___ is your name?" Use:', opts:['What','Where','Why','How'], correct:'What', emoji:'❓'},
      {q:'"___ do you live?" Use:', opts:['Where','When','Who','What'], correct:'Where', emoji:'🏠'},
      {q:'"___ is your birthday?" Use:', opts:['When','Where','Who','Why'], correct:'When', emoji:'🎂'},
      {q:'"___ are you crying?" Use:', opts:['Why','What','Who','Which'], correct:'Why', emoji:'😢'},
      {q:'"___ is at the door?" Use:', opts:['Who','What','Where','How'], correct:'Who', emoji:'🚪'},
    ],
    eng_question2: [
      {q:'Reading a passage carefully to find specific information is called ___', opts:['Scanning','Skimming','Inferring','Summarising'], correct:'Scanning', emoji:'🔍'},
      {q:'The main idea of a paragraph is usually in the ___', opts:['Topic sentence','Last sentence','Middle sentence','Title'], correct:'Topic sentence', emoji:'📄'},
      {q:'An inference is ___', opts:['A conclusion based on clues','A direct quote','A question','A definition'], correct:'A conclusion based on clues', emoji:'🔍'},
      {q:'A synonym for "comprehension" is ___', opts:['Understanding','Confusion','Question','Summary'], correct:'Understanding', emoji:'📖'},
      {q:'After reading, you should be able to answer ___', opts:['Who, What, Where, When, Why','Only "what"','Only "who"','Only "where"'], correct:'Who, What, Where, When, Why', emoji:'❓'},
    ],
    eng_sentence1: [
      {q:'A sentence must have a ___ and a verb', opts:['Subject','Object','Adjective','Adverb'], correct:'Subject', emoji:'📝'},
      {q:'"The dog barks." This is a ___ sentence.', opts:['Simple','Compound','Complex','Fragment'], correct:'Simple', emoji:'🐕'},
      {q:'A sentence always starts with a ___', opts:['Capital letter','Lowercase letter','Number','Symbol'], correct:'Capital letter', emoji:'🔠'},
      {q:'Which is a complete sentence?', opts:['The cat sat on the mat.','The cat','Sat on','On the mat.'], correct:'The cat sat on the mat.', emoji:'🐱'},
      {q:'A sentence ends with a ___, ! or ?', opts:['.','#','@','&'], correct:'.', emoji:'🔚'},
    ],
    eng_sentence2: [
      {q:'In "She ate the apple," the subject is ___', opts:['She','Ate','Apple','The'], correct:'She', emoji:'🍎'},
      {q:'The object in "He kicked the ball" is ___', opts:['Ball','He','Kicked','The'], correct:'Ball', emoji:'⚽'},
      {q:'A compound sentence has ___ main clauses', opts:['Two or more','One','Three only','Four'], correct:'Two or more', emoji:'🔗'},
      {q:'"The girl who won was my friend" — this is ___', opts:['Complex','Simple','Compound','Fragment'], correct:'Complex', emoji:'🏆'},
      {q:'Which conjunction joins two sentences of equal importance?', opts:['And','Because','Although','Since'], correct:'And', emoji:'➕'},
    ],
    eng_sight2: [
      {q:'Choose the correct spelling:', opts:['Because','Becaus','Becuase','Becouse'], correct:'Because', emoji:'📝'},
      {q:'Which is a sight word?', opts:['Their','Caterpillar','Dictionary','Multiplication'], correct:'Their', emoji:'👀'},
      {q:'"___ going to the park." Fill in:', opts:['They\'re','Their','There','Thier'], correct:'They\'re', emoji:'🌳'},
      {q:'"___ is my bag." Fill in:', opts:['Where','Were','Wear','We\'re'], correct:'Where', emoji:'👜'},
      {q:'Which is spelled correctly?', opts:['Enough','Enuff','Inough','Enouf'], correct:'Enough', emoji:'✅'},
    ],
    eng_spell2: [
      {q:'How do you spell the sound "sh" + "oo" + "l"?', opts:['School','Skhool','Scool','Skool'], correct:'School', emoji:'🏫'},
      {q:'Which is the correct spelling?', opts:['Beautiful','Beautifull','Beautifal','Beutiful'], correct:'Beautiful', emoji:'🌸'},
      {q:'Correct spelling of the opposite of "come"?', opts:['Go','Goo','Goe','Gow'], correct:'Go', emoji:'👣'},
      {q:'Which word is spelled incorrectly?', opts:['Tomato vs Tomarto — "Tomarto" is wrong','Banana','Potato','Mango'], correct:'Tomato vs Tomarto — "Tomarto" is wrong', emoji:'🍅'},
      {q:'Correct spelling:', opts:['Wednesday','Wednessday','Wendsday','Wensday'], correct:'Wednesday', emoji:'📅'},
    ],
    eng_spell3: [
      {q:'Correct spelling:', opts:['Necessary','Neccesary','Necesary','Neccessary'], correct:'Necessary', emoji:'✅'},
      {q:'Correct spelling:', opts:['Accommodation','Accomodation','Acommodation','Accommodaton'], correct:'Accommodation', emoji:'🏨'},
      {q:'Correct spelling:', opts:['Occurrence','Occurence','Occurrance','Occurince'], correct:'Occurrence', emoji:'📅'},
      {q:'Correct spelling:', opts:['Separate','Seperate','Separrate','Seperrate'], correct:'Separate', emoji:'✂️'},
      {q:'Correct spelling:', opts:['Definitely','Definately','Definitly','Definitley'], correct:'Definitely', emoji:'👍'},
    ],
    eng_spell4: [
      {q:'Correct spelling:', opts:['Miscellaneous','Miscelaneous','Miscellanious','Miscellaneus'], correct:'Miscellaneous', emoji:'📦'},
      {q:'Correct spelling:', opts:['Conscientious','Consciencious','Concientious','Consientious'], correct:'Conscientious', emoji:'🧠'},
      {q:'Correct spelling:', opts:['Bureaucracy','Beurocracy','Burocracy','Bureocracy'], correct:'Bureaucracy', emoji:'🏛️'},
      {q:'Correct spelling:', opts:['Rhythm','Rythm','Rhytm','Rhythum'], correct:'Rhythm', emoji:'🎵'},
      {q:'Correct spelling:', opts:['Millennium','Millenium','Milenium','Milennium'], correct:'Millennium', emoji:'🎆'},
    ],
    eng_vowels: [
      {q:'In "cake", the "a" makes a ___ vowel sound', opts:['Long','Short','Silent','Blended'], correct:'Long', emoji:'🎂'},
      {q:'In "cat", the "a" makes a ___ vowel sound', opts:['Short','Long','Silent','Double'], correct:'Short', emoji:'🐱'},
      {q:'"Kite" has a ___ "i" sound', opts:['Long','Short','Silent','Blended'], correct:'Long', emoji:'🪁'},
      {q:'Which word has a short "o" sound?', opts:['Hot','Hole','Hope','Home'], correct:'Hot', emoji:'🌡️'},
      {q:'A silent "e" at the end of a word makes the vowel ___', opts:['Long','Short','Disappear','Double'], correct:'Long', emoji:'🔤'},
    ],
    eng_pronouns: [
      {q:'"___  is a good student." (referring to a girl)', opts:['She','He','They','It'], correct:'She', emoji:'👧'},
      {q:'Replace "The dog" with a pronoun:', opts:['It','He','She','They'], correct:'It', emoji:'🐕'},
      {q:'"___ and I went to school." Use:', opts:['He','Him','His','Himself'], correct:'He', emoji:'👦'},
      {q:'"Give the book to ___." (referring to a boy)', opts:['him','he','his','himself'], correct:'him', emoji:'📚'},
      {q:'Which is a possessive pronoun?', opts:['Mine','I','Me','Myself'], correct:'Mine', emoji:'👐'},
    ],
    eng_punctuation: [
      {q:'A sentence that asks a question ends with ___', opts:['?','!','.', ','], correct:'?', emoji:'❓'},
      {q:'A sentence showing strong feeling ends with ___', opts:['!','?','.', ','], correct:'!', emoji:'😲'},
      {q:'A comma is used to ___', opts:['Separate items in a list','End a sentence','Ask a question','Show possession'], correct:'Separate items in a list', emoji:'📝'},
      {q:'An apostrophe in "it\'s" means ___', opts:['It is (contraction)','Belonging to it','Plural of it','Nothing'], correct:'It is (contraction)', emoji:'✏️'},
      {q:'Quotation marks are used for ___', opts:['Direct speech','Titles only','Emphasis only','Questions'], correct:'Direct speech', emoji:'💬'},
    ],
    eng_story1: [
      {q:'What is the correct order of a story?', opts:['Beginning, Middle, End','End, Middle, Beginning','Middle, End, Beginning','End, Beginning, Middle'], correct:'Beginning, Middle, End', emoji:'📚'},
      {q:'The problem in a story is called the ___', opts:['Conflict','Setting','Theme','Climax'], correct:'Conflict', emoji:'⚔️'},
      {q:'Where and when a story takes place is the ___', opts:['Setting','Character','Plot','Theme'], correct:'Setting', emoji:'🌍'},
      {q:'The most exciting part of a story is the ___', opts:['Climax','Resolution','Introduction','Setting'], correct:'Climax', emoji:'🎭'},
      {q:'The lesson of a story is its ___', opts:['Theme/moral','Plot','Character','Setting'], correct:'Theme/moral', emoji:'💡'},
    ],
    eng_story2: [
      {q:'Round characters in a story are ___', opts:['Complex and change over time','Flat and unchanged','Only villains','Only heroes'], correct:'Complex and change over time', emoji:'🎭'},
      {q:'The narrator tells the story from a ___ of view', opts:['Point','Story','Character','Theme'], correct:'Point', emoji:'📖'},
      {q:'First-person narration uses ___', opts:['"I" and "we"','"He" and "she"','"You"','"They"'], correct:'"I" and "we"', emoji:'✍️'},
      {q:'The resolution of a story ___', opts:['Solves the conflict','Introduces characters','Creates the problem','Sets the scene'], correct:'Solves the conflict', emoji:'✅'},
      {q:'Foreshadowing is when the author ___', opts:['Hints at future events','Explains the past','Describes a character','Sets the scene'], correct:'Hints at future events', emoji:'🔮'},
    ],
    eng_story3: [
      {q:'A good story opening should ___', opts:['Hook the reader immediately','List all characters','Explain the ending','Be very long'], correct:'Hook the reader immediately', emoji:'🎣'},
      {q:'Show don\'t tell means ___', opts:['Describe actions to show feelings','Tell readers how to feel','Always use dialogue','Avoid description'], correct:'Describe actions to show feelings', emoji:'🎭'},
      {q:'Dialogue in a story ___', opts:['Shows character personality','Is always unnecessary','Must rhyme','Must be formal'], correct:'Shows character personality', emoji:'💬'},
      {q:'A story with a circular narrative ___', opts:['Ends where it began','Has no plot','Is non-fiction','Has no characters'], correct:'Ends where it began', emoji:'🔄'},
      {q:'The protagonist is the ___', opts:['Main character','Villain','Narrator','Author'], correct:'Main character', emoji:'🦸'},
    ],
    eng_suffixes: [
      {q:'"Hope" + "-ful" = ___', opts:['Hopeful','Hopefull','Hopful','Hopefully'], correct:'Hopeful', emoji:'🌟'},
      {q:'"Care" + "-less" = ___', opts:['Careless','Carefull','Carful','Caring'], correct:'Careless', emoji:'⚠️'},
      {q:'"-er" added to "teach" = ___', opts:['Teacher','Teaching','Teaches','Teachful'], correct:'Teacher', emoji:'👩‍🏫'},
      {q:'"-est" makes a word ___', opts:['Superlative (most extreme)','Comparative','Negative','Plural'], correct:'Superlative (most extreme)', emoji:'🏆'},
      {q:'"-tion" changes a verb to a ___', opts:['Noun','Adjective','Adverb','Verb still'], correct:'Noun', emoji:'📝'},
    ],
    eng_synonym1: [
      {q:'Synonym for "happy" is ___', opts:['Joyful','Sad','Angry','Tired'], correct:'Joyful', emoji:'😊'},
      {q:'Synonym for "big" is ___', opts:['Large','Tiny','Small','Little'], correct:'Large', emoji:'🐘'},
      {q:'Synonym for "fast" is ___', opts:['Quick','Slow','Lazy','Heavy'], correct:'Quick', emoji:'⚡'},
      {q:'Synonym for "cold" is ___', opts:['Chilly','Hot','Warm','Boiling'], correct:'Chilly', emoji:'❄️'},
      {q:'Synonym for "brave" is ___', opts:['Courageous','Cowardly','Fearful','Timid'], correct:'Courageous', emoji:'🦁'},
    ],
    eng_idioms1: [
      {q:'"Break a leg!" means ___', opts:['Good luck!','Hurt yourself','Run fast','Jump high'], correct:'Good luck!', emoji:'🎭'},
      {q:'"It\'s raining cats and dogs" means ___', opts:['It\'s raining heavily','Animals are falling','It\'s stormy','It\'s cold'], correct:'It\'s raining heavily', emoji:'🌧️'},
      {q:'"A piece of cake" means ___', opts:['Very easy','Delicious','Expensive','Difficult'], correct:'Very easy', emoji:'🎂'},
      {q:'"The ball is in your court" means ___', opts:['It\'s your decision to make','Play tennis','Go to court','Throw the ball'], correct:'It\'s your decision to make', emoji:'⚽'},
      {q:'"Hit the books" means ___', opts:['Study hard','Throw books','Buy books','Read slowly'], correct:'Study hard', emoji:'📚'},
    ],
    eng_idioms2: [
      {q:'"Bite the bullet" means ___', opts:['Endure pain or hardship bravely','Literally bite a bullet','Eat metal','Be brave in a fight'], correct:'Endure pain or hardship bravely', emoji:'💪'},
      {q:'"Burning the midnight oil" means ___', opts:['Working late into the night','Setting fire to oil','Wasting energy','Studying during a fire'], correct:'Working late into the night', emoji:'🌙'},
      {q:'"The tip of the iceberg" means ___', opts:['A small visible part of a big problem','A cold climate','The top of a mountain','Arctic travel'], correct:'A small visible part of a big problem', emoji:'🧊'},
      {q:'"Costing an arm and a leg" means ___', opts:['Very expensive','Physically painful','A body part injury','Free of charge'], correct:'Very expensive', emoji:'💰'},
      {q:'"Every cloud has a silver lining" means ___', opts:['Every bad situation has something positive','Clouds are always shiny','Weather improves','Lightning is silver'], correct:'Every bad situation has something positive', emoji:'☁️'},
    ],
    eng_direct: [
      {q:'In direct speech, the speaker\'s exact words are in ___', opts:['Inverted commas " "','Brackets ( )','Italics','Bold'], correct:'Inverted commas " "', emoji:'💬'},
      {q:'Change to indirect: "She said, \'I am happy.\'"', opts:['She said she was happy.','She said I am happy.','She says I was happy.','She told I am happy.'], correct:'She said she was happy.', emoji:'🗣️'},
      {q:'In reported speech, the tense usually shifts ___', opts:['One step back in time','Forward in time','Stays the same','Becomes future'], correct:'One step back in time', emoji:'⏰'},
      {q:'Which is correct direct speech punctuation?', opts:['"Come here," she said.','Come here she said.','She said come here.','She said, come here.'], correct:'"Come here," she said.', emoji:'✅'},
      {q:'He asked, "___ is your name?" — fill in:', opts:['What','Where','Why','How'], correct:'What', emoji:'❓'},
    ],
    eng_passive: [
      {q:'"The cat chased the mouse." Change to passive:', opts:['The mouse was chased by the cat.','The mouse chased the cat.','The cat was chased by the mouse.','The mouse is chasing the cat.'], correct:'The mouse was chased by the cat.', emoji:'🐱'},
      {q:'In passive voice, the ___ receives the action', opts:['Object becomes subject','Subject stays same','Verb disappears','Tense changes only'], correct:'Object becomes subject', emoji:'🔄'},
      {q:'Passive voice uses ___ + past participle', opts:['To be (is/was/were)','To do','To have','To make'], correct:'To be (is/was/were)', emoji:'📝'},
      {q:'"A cake was baked by her." The doer is ___', opts:['Her','Cake','Baked','A'], correct:'Her', emoji:'🎂'},
      {q:'Which is passive voice?', opts:['The letter was written by him.','He wrote the letter.','He is writing.','He writes letters.'], correct:'The letter was written by him.', emoji:'✉️'},
    ],
    eng_formal: [
      {q:'A formal letter begins with ___', opts:['Dear Sir/Madam,','Hi there!','Hey,','To whom it may concern' ], correct:'Dear Sir/Madam,', emoji:'📧'},
      {q:'A formal letter ends with ___', opts:['Yours sincerely/faithfully,','Love,','Bye!','See you,'], correct:'Yours sincerely/faithfully,', emoji:'✍️'},
      {q:'The subject line in a letter tells ___', opts:['What the letter is about','Who wrote it','Where it was sent','When it was written'], correct:'What the letter is about', emoji:'📋'},
      {q:'An informal letter is written to ___', opts:['Friends and family','Officials','Companies','Authorities'], correct:'Friends and family', emoji:'👫'},
      {q:'Which is a formal sentence?', opts:['I am writing to request information.','Hey, I need info.','Can u send me stuff?','Gimme the details pls.'], correct:'I am writing to request information.', emoji:'📝'},
    ],
    eng_essay: [
      {q:'An essay introduction should ___', opts:['State the topic and thesis','List all points','Give the conclusion','Be very long'], correct:'State the topic and thesis', emoji:'📄'},
      {q:'The body of an essay contains ___', opts:['Supporting arguments with evidence','The introduction','The conclusion','The title'], correct:'Supporting arguments with evidence', emoji:'📝'},
      {q:'A conclusion should ___', opts:['Summarise and restate the thesis','Introduce new ideas','Ask questions','List examples'], correct:'Summarise and restate the thesis', emoji:'✅'},
      {q:'A thesis statement tells ___', opts:['The main argument of the essay','A fact','An example','The title'], correct:'The main argument of the essay', emoji:'🎯'},
      {q:'Transition words like "Furthermore" are used to ___', opts:['Connect ideas smoothly','End paragraphs','Start introductions','List examples only'], correct:'Connect ideas smoothly', emoji:'🔗'},
    ],
    eng_paragraph: [
      {q:'A paragraph usually begins with a ___', opts:['Topic sentence','Conclusion','Question','Quotation'], correct:'Topic sentence', emoji:'📄'},
      {q:'All sentences in a paragraph should be about ___', opts:['One main idea','Many different topics','Only facts','Only opinions'], correct:'One main idea', emoji:'🎯'},
      {q:'How do you show a new paragraph?', opts:['Indent or skip a line','Use a capital letter only','Use a comma','Use an exclamation mark'], correct:'Indent or skip a line', emoji:'↩️'},
      {q:'A concluding sentence in a paragraph ___', opts:['Wraps up the main idea','Introduces a new idea','Asks a question','Gives an example'], correct:'Wraps up the main idea', emoji:'✅'},
      {q:'Supporting sentences in a paragraph ___', opts:['Give evidence for the topic sentence','Introduce a new topic','Ask questions','End the essay'], correct:'Give evidence for the topic sentence', emoji:'📋'},
    ],
    eng_poem: [
      {q:'Two consecutive lines that rhyme are called a ___', opts:['Couplet','Stanza','Verse','Sonnet'], correct:'Couplet', emoji:'🎵'},
      {q:'A simile compares using "like" or ___', opts:['As','Is','Are','Was'], correct:'As', emoji:'🔍'},
      {q:'The pattern of stressed and unstressed syllables in poetry is ___', opts:['Metre/Rhythm','Rhyme','Stanza','Alliteration'], correct:'Metre/Rhythm', emoji:'🎼'},
      {q:'An onomatopoeia is a word that ___', opts:['Sounds like what it means (buzz, splash)','Has no meaning','Rhymes with everything','Is very long'], correct:'Sounds like what it means (buzz, splash)', emoji:'💥'},
      {q:'A haiku has ___ lines', opts:['3','4','2','5'], correct:'3', emoji:'🌸'},
    ],
    eng_debate: [
      {q:'In a debate, you must support your argument with ___', opts:['Evidence and reasons','Personal feelings only','Made-up facts','Emotions only'], correct:'Evidence and reasons', emoji:'⚖️'},
      {q:'The side arguing FOR a motion is called ___', opts:['Proposition','Opposition','Neutral','Chair'], correct:'Proposition', emoji:'👍'},
      {q:'The side arguing AGAINST a motion is ___', opts:['Opposition','Proposition','Neutral','Judge'], correct:'Opposition', emoji:'👎'},
      {q:'A rebuttal in a debate means ___', opts:['Countering the opponent\'s argument','Agreeing with the opponent','Leaving the debate','Asking a question'], correct:'Countering the opponent\'s argument', emoji:'🗣️'},
      {q:'A good debater listens carefully to ___', opts:['The opponent, to find weaknesses','Only their own team','The audience only','The judge only'], correct:'The opponent, to find weaknesses', emoji:'👂'},
    ],
    eng_comprehension: [
      {q:'Skimming a text means ___', opts:['Reading quickly for the main idea','Reading every word carefully','Reading only the first line','Reading backwards'], correct:'Reading quickly for the main idea', emoji:'📖'},
      {q:'An explicit answer is ___', opts:['Stated directly in the text','Inferred from clues','Your own opinion','Not in the text'], correct:'Stated directly in the text', emoji:'🔍'},
      {q:'An implicit answer requires you to ___', opts:['Read between the lines','Only read the text','Guess randomly','Use a dictionary'], correct:'Read between the lines', emoji:'💭'},
      {q:'The author\'s purpose can be to ___', opts:['Inform, entertain or persuade','Only to inform','Only to entertain','Only to persuade'], correct:'Inform, entertain or persuade', emoji:'✍️'},
      {q:'A summary should be ___', opts:['Shorter than the original and in your own words','The same length as the original','Longer with more detail','A copy of the text'], correct:'Shorter than the original and in your own words', emoji:'📋'},
    ],
  };

  // Build a renderer function for each missing pool
  Object.entries(EXTRA_POOLS).forEach(([id, pool]) => {
    if (!GAME_RENDERERS[id]) {
      GAME_RENDERERS[id] = function(pc) {
        const q = pool[Math.floor(Math.random() * pool.length)];
        mcq(pc, q.q, q.opts, q.correct, q.emoji);
      };
    }
  });

})();
