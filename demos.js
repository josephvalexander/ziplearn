// demos.js — Interactive animated learning demos
// Science experiments, Maths magic, Nature wonders
// Each demo: renders into a container, fully self-contained, touch-friendly
/* jshint esversion:6 */

// ================================================================
// DEMO REGISTRY — keyed by demo id
// Each: { title, subject, emoji, render(container) }
// ================================================================
const DEMO_REGISTRY = {};

// ── Helper: animated counter ─────────────────────────────────
function animCount(el, from, to, dur=800) {
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now-start)/dur);
    const ease = t<.5 ? 2*t*t : -1+(4-2*t)*t;
    el.textContent = Math.round(from + (to-from)*ease);
    if (t<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Helper: SVG circle animation ─────────────────────────────
function svgCircleProgress(svg, pct, color, r=36) {
  const circ = 2*Math.PI*r;
  const dash = (pct/100)*circ;
  svg.innerHTML = `
    <circle cx="44" cy="44" r="${r}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="7"/>
    <circle cx="44" cy="44" r="${r}" fill="none" stroke="${color}" stroke-width="7"
      stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ/4}"
      stroke-linecap="round" style="transition:stroke-dasharray 1s ease"/>`;
}

// ================================================================
// SCIENCE DEMOS
// ================================================================

// 1. Volcano reaction
DEMO_REGISTRY['demo_volcano'] = {
  title: 'Volcano Eruption!', subject:'sci', emoji:'🌋',
  desc: 'Baking soda + vinegar = CO₂ gas! A chemical reaction.',
  render(c) {
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🌋 Volcano Reaction</h3>
        <p class="demo-desc">Vinegar (acid) + Baking Soda (base) → CO₂ gas bubbles!</p>
        <div class="demo-scene" id="volc-scene" style="height:200px;position:relative;overflow:hidden">
          <svg viewBox="0 0 200 200" style="width:100%;height:100%">
            <!-- Ground -->
            <rect x="0" y="160" width="200" height="40" fill="#8b4513"/>
            <!-- Volcano body -->
            <polygon points="100,60 40,160 160,160" fill="#666"/>
            <polygon points="100,60 55,160 145,160" fill="#888"/>
            <!-- Crater -->
            <ellipse cx="100" cy="62" rx="18" ry="6" fill="#555"/>
            <!-- Lava flows (hidden initially) -->
            <path id="lava-l" d="M88,70 Q70,110 60,145" stroke="#ff4500" stroke-width="6" fill="none" stroke-linecap="round" opacity="0"/>
            <path id="lava-r" d="M112,70 Q130,110 140,145" stroke="#ff6500" stroke-width="6" fill="none" stroke-linecap="round" opacity="0"/>
          </svg>
          <!-- Bubbles container -->
          <div id="volc-bubbles" style="position:absolute;left:50%;transform:translateX(-50%);bottom:60%;width:36px"></div>
        </div>
        <div class="demo-fact-row">
          <span class="demo-fact">Acid + Base → Salt + Water + CO₂</span>
        </div>
        <button class="demo-btn" id="volc-btn" onclick="demoVolcano()">⚗️ Mix & React!</button>
        <div class="demo-steps">
          <div class="demo-step" id="vstep-1">1️⃣ Add baking soda to the crater</div>
          <div class="demo-step" id="vstep-2" style="opacity:0.3">2️⃣ Pour vinegar in…</div>
          <div class="demo-step" id="vstep-3" style="opacity:0.3">3️⃣ ERUPTION! CO₂ gas escapes!</div>
        </div>
      </div>`;
    window.demoVolcano = () => {
      const btn = document.getElementById('volc-btn');
      btn.disabled = true; btn.textContent = '💥 Reacting…';
      document.getElementById('vstep-2').style.opacity='1';
      // Animate bubbles
      const bw = document.getElementById('volc-bubbles');
      bw.innerHTML = '';
      for (let i=0;i<18;i++) {
        const b = document.createElement('div');
        const sz = 4+Math.random()*10;
        const hue = 30+Math.random()*40;
        b.style.cssText = `
          position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;
          background:hsl(${hue},100%,55%);opacity:0.9;
          left:${Math.random()*30-5}px;bottom:0;
          animation:bubbleUp ${0.6+Math.random()*0.8}s ${i*0.08}s ease-out forwards;`;
        bw.appendChild(b);
      }
      // Animate lava
      setTimeout(() => {
        document.getElementById('lava-l').style.cssText += 'opacity:1;transition:opacity 0.5s';
        document.getElementById('lava-r').style.cssText += 'opacity:1;transition:opacity 0.5s';
        document.getElementById('vstep-3').style.opacity='1';
        btn.textContent = '🔄 Again!'; btn.disabled = false;
        setTimeout(()=>demoReset(),2000);
      }, 800);
    };
    window.demoReset = () => {
      document.getElementById('lava-l').style.opacity='0';
      document.getElementById('lava-r').style.opacity='0';
      document.getElementById('volc-bubbles').innerHTML='';
      document.getElementById('vstep-2').style.opacity='0.3';
      document.getElementById('vstep-3').style.opacity='0.3';
      document.getElementById('volc-btn').textContent='⚗️ Mix & React!';
    };
  }
};

// 2. Rainbow / Light Prism
DEMO_REGISTRY['demo_prism'] = {
  title:'Rainbow from White Light', subject:'sci', emoji:'🌈',
  desc:'A prism splits white light into all the colours of the rainbow!',
  render(c) {
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🌈 Light Through a Prism</h3>
        <p class="demo-desc">White light is made of ALL colours mixed together.</p>
        <div class="demo-scene" style="height:180px;display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 280 140" style="width:100%;max-width:320px">
            <!-- White light beam in -->
            <line x1="10" y1="70" x2="100" y2="70" stroke="white" stroke-width="12" opacity="0.9"/>
            <text x="5" y="58" font-size="9" fill="rgba(255,255,255,0.6)">White light</text>
            <!-- Prism -->
            <polygon points="100,30 100,110 145,70" fill="rgba(99,200,255,0.25)" stroke="rgba(99,200,255,0.7)" stroke-width="2"/>
            <text x="108" y="73" font-size="8" fill="rgba(99,200,255,0.9)">PRISM</text>
            <!-- Dispersed colours -->
            <line id="pr-v" x1="145" y1="70" x2="270" y2="25"  stroke="#9400D3" stroke-width="4" opacity="0" stroke-linecap="round"/>
            <line id="pr-b" x1="145" y1="70" x2="270" y2="42"  stroke="#0000FF" stroke-width="4" opacity="0" stroke-linecap="round"/>
            <line id="pr-g" x1="145" y1="70" x2="270" y2="57"  stroke="#00AA00" stroke-width="4" opacity="0" stroke-linecap="round"/>
            <line id="pr-y" x1="145" y1="70" x2="270" y2="70"  stroke="#FFFF00" stroke-width="4" opacity="0" stroke-linecap="round"/>
            <line id="pr-o" x1="145" y1="70" x2="270" y2="84"  stroke="#FF7F00" stroke-width="4" opacity="0" stroke-linecap="round"/>
            <line id="pr-r" x1="145" y1="70" x2="270" y2="100" stroke="#FF0000" stroke-width="4" opacity="0" stroke-linecap="round"/>
            <!-- Labels (hidden) -->
            <text id="lb-v" x="274" y="28"  font-size="8" fill="#bf5fff" opacity="0">Violet</text>
            <text id="lb-b" x="274" y="45"  font-size="8" fill="#6666ff" opacity="0">Blue</text>
            <text id="lb-g" x="274" y="60"  font-size="8" fill="#44cc44" opacity="0">Green</text>
            <text id="lb-y" x="274" y="73"  font-size="8" fill="#ffff44" opacity="0">Yellow</text>
            <text id="lb-o" x="274" y="87"  font-size="8" fill="#ffaa44" opacity="0">Orange</text>
            <text id="lb-r" x="274" y="103" font-size="8" fill="#ff5555" opacity="0">Red</text>
          </svg>
        </div>
        <div class="demo-fact-row">
          <span class="demo-fact">ROYGBIV: Red Orange Yellow Green Blue Indigo Violet</span>
        </div>
        <button class="demo-btn" onclick="demoPrism()">💡 Shine the Light!</button>
      </div>`;
    window.demoPrism = () => {
      const cols = ['v','b','g','y','o','r'];
      cols.forEach((col,i) => {
        setTimeout(() => {
          document.getElementById(`pr-${col}`).style.cssText += 'opacity:1;transition:opacity 0.3s';
          document.getElementById(`lb-${col}`).style.cssText += 'opacity:1;transition:opacity 0.3s';
        }, i*120);
      });
    };
  }
};

// 3. Plant water experiment
DEMO_REGISTRY['demo_plant'] = {
  title:'How Plants Drink Water', subject:'sci', emoji:'🌱',
  desc:'Roots absorb water and it travels up the stem to leaves.',
  render(c) {
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🌱 How Plants Drink</h3>
        <p class="demo-desc">Water travels from roots → stem → leaves through tiny tubes (xylem).</p>
        <div class="demo-scene" style="height:200px;display:flex;align-items:flex-end;justify-content:center;gap:30px">
          <!-- Plant SVG -->
          <svg viewBox="0 0 100 180" style="height:180px;width:100px">
            <!-- Soil -->
            <rect x="0" y="130" width="100" height="50" fill="#6b4226" rx="4"/>
            <!-- Water fill animated -->
            <rect id="water-fill" x="0" y="178" width="100" height="0" fill="#4488ff" opacity="0.4" rx="4"/>
            <!-- Roots -->
            <path d="M50,130 Q35,145 25,155" stroke="#8b6914" stroke-width="3" fill="none"/>
            <path d="M50,130 Q50,148 45,158" stroke="#8b6914" stroke-width="3" fill="none"/>
            <path d="M50,130 Q65,145 75,155" stroke="#8b6914" stroke-width="3" fill="none"/>
            <!-- Stem with water column -->
            <rect x="46" y="40" width="8" height="90" fill="#2d8c2d" rx="3"/>
            <!-- Water column inside stem -->
            <rect id="stem-water" x="48" y="130" width="4" height="0" fill="#44aaff" opacity="0.7" rx="2"/>
            <!-- Leaves -->
            <ellipse cx="30" cy="75" rx="22" ry="14" fill="#22aa22" transform="rotate(-30,30,75)"/>
            <ellipse cx="70" cy="65" rx="22" ry="14" fill="#2db82d" transform="rotate(25,70,65)"/>
            <ellipse cx="50" cy="42" rx="18" ry="12" fill="#33cc33"/>
            <!-- Water drops on leaves -->
            <circle id="wd1" cx="28" cy="68" r="3" fill="#44aaff" opacity="0"/>
            <circle id="wd2" cx="70" cy="58" r="3" fill="#44aaff" opacity="0"/>
            <circle id="wd3" cx="50" cy="36" r="3" fill="#44aaff" opacity="0"/>
          </svg>
          <div style="flex:1;max-width:140px">
            <div class="demo-step" id="ps1">🌊 Roots absorb</div>
            <div class="demo-step" id="ps2" style="opacity:0.3">↑ Up the stem</div>
            <div class="demo-step" id="ps3" style="opacity:0.3">🍃 Into leaves</div>
            <div class="demo-step" id="ps4" style="opacity:0.3">💨 Evaporation!</div>
          </div>
        </div>
        <button class="demo-btn" onclick="demoPlant()">💧 Water the Plant!</button>
      </div>`;
    window.demoPlant = () => {
      // Animate water rising
      const wf = document.getElementById('water-fill');
      const sw = document.getElementById('stem-water');
      wf.style.cssText += 'transition:height 0.8s,y 0.8s';
      setTimeout(()=>{ wf.setAttribute('height','30'); wf.setAttribute('y','148'); document.getElementById('ps1').style.fontWeight='800'; },100);
      setTimeout(()=>{ sw.setAttribute('height','80'); sw.setAttribute('y','50'); sw.style.transition='height 1.2s,y 1.2s'; document.getElementById('ps2').style.opacity='1'; },900);
      setTimeout(()=>{
        document.getElementById('ps3').style.opacity='1';
        ['wd1','wd2','wd3'].forEach(id=>{ document.getElementById(id).style.cssText+='opacity:1;transition:opacity 0.5s'; });
      }, 2000);
      setTimeout(()=>{ document.getElementById('ps4').style.opacity='1'; }, 2800);
    };
  }
};

// 4. Food chain interactive
DEMO_REGISTRY['demo_foodchain'] = {
  title:'Build a Food Chain', subject:'sci', emoji:'🦁',
  desc:'Energy flows from the Sun → Plants → Animals.',
  render(c) {
    const chain = [
      {e:'☀️',n:'Sun',c:'#ffd700'},
      {e:'🌿',n:'Plant',c:'#22c55e'},
      {e:'🐛',n:'Caterpillar',c:'#86efac'},
      {e:'🐸',n:'Frog',c:'#4ade80'},
      {e:'🐍',n:'Snake',c:'#166534'},
      {e:'🦅',n:'Eagle',c:'#78350f'},
    ];
    let step = 0;
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🦁 Food Chain</h3>
        <p class="demo-desc">Tap to add each link — energy flows from Sun to top predator!</p>
        <div id="fc-chain" style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;min-height:80px;background:var(--bg-hud);border-radius:12px;padding:12px;margin:8px 0;justify-content:center"></div>
        <div id="fc-fact" class="demo-fact-row" style="min-height:32px"></div>
        <button class="demo-btn" id="fc-btn" onclick="demoFoodChain()">➕ Add Next</button>
        <button class="demo-btn" style="background:var(--bg-hud);color:var(--text-secondary);margin-top:6px" onclick="demoFCReset()">🔄 Reset</button>
      </div>`;
    const facts = [
      '☀️ The Sun provides ALL energy on Earth!',
      '🌿 Plants are PRODUCERS — they make food from sunlight.',
      '🐛 Caterpillars are PRIMARY consumers — they eat plants.',
      '🐸 Frogs are SECONDARY consumers — they eat insects.',
      '🐍 Snakes are TERTIARY consumers — they eat frogs.',
      '🦅 Eagles are APEX predators — nothing eats them!',
    ];
    window.demoFoodChain = () => {
      if (step >= chain.length) return;
      const ch = document.getElementById('fc-chain');
      const item = chain[step];
      if (step > 0) ch.insertAdjacentHTML('beforeend',`<span style="font-size:18px;color:${chain[step-1].c}"> → </span>`);
      ch.insertAdjacentHTML('beforeend',`<span style="font-size:28px;animation:popIn 0.3s var(--bounce) both">${item.e}<div style="font-size:9px;text-align:center;color:var(--text-muted);font-weight:700">${item.n}</div></span>`);
      document.getElementById('fc-fact').innerHTML = `<span class="demo-fact">${facts[step]}</span>`;
      step++;
      if (step >= chain.length) document.getElementById('fc-btn').disabled = true;
    };
    window.demoFCReset = () => { step=0; document.getElementById('fc-chain').innerHTML=''; document.getElementById('fc-fact').innerHTML=''; document.getElementById('fc-btn').disabled=false; };
  }
};

// ================================================================
// MATHS MAGIC DEMOS
// ================================================================

// 5. Times table pattern revealer
DEMO_REGISTRY['demo_times9'] = {
  title:'9× Table Magic', subject:'math', emoji:'🪄',
  desc:'Your fingers can do the 9 times table! Always works.',
  render(c) {
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🪄 The 9× Finger Trick</h3>
        <p class="demo-desc">Tap a number to see the trick!</p>
        <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin:10px 0" id="fingers-row">
          ${[1,2,3,4,5,6,7,8,9,10].map(n=>`
            <div class="finger-btn" onclick="demoFinger(${n})" style="
              width:38px;height:60px;background:var(--bg-hud);border:2px solid var(--border);
              border-radius:8px 8px 4px 4px;display:flex;align-items:center;justify-content:center;
              font-size:11px;font-weight:800;cursor:pointer;transition:all 0.2s;color:var(--text-secondary)
            " id="f${n}">${n}</div>
          `).join('')}
        </div>
        <div id="finger-result" style="text-align:center;font-size:28px;font-weight:900;font-family:var(--font-display);color:var(--indigo);min-height:50px;padding:8px"></div>
        <div id="finger-explain" class="demo-fact-row" style="min-height:40px"></div>
      </div>`;
    window.demoFinger = (n) => {
      document.querySelectorAll('.finger-btn').forEach((f,i)=>{
        const fn = i+1;
        f.style.background = fn === n ? 'var(--indigo)' : fn < n ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)';
        f.style.borderColor = fn === n ? 'var(--indigo)' : fn < n ? 'rgba(99,102,241,0.4)' : 'var(--border)';
        f.style.color = fn === n ? '#fff' : 'var(--text-secondary)';
        f.style.transform = fn === n ? 'scaleY(0.5) translateY(15px)' : 'scaleY(1)';
      });
      const left = n-1; const right = 10-n;
      const ans = n * 9;
      document.getElementById('finger-result').textContent = `9 × ${n} = ${ans}`;
      document.getElementById('finger-explain').innerHTML =
        `<span class="demo-fact">Fingers to left of folded: <b>${left}</b> (tens) | Right: <b>${right}</b> (units) → <b>${left}${right} = ${ans}</b></span>`;
    };
  }
};

// 6. Magic number trick
DEMO_REGISTRY['demo_magic_num'] = {
  title:'Think of a Number — I\'ll read your mind!', subject:'math', emoji:'🧠',
  desc:'Maths always brings you back to the same number!',
  render(c) {
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🧠 Mind Reader</h3>
        <p class="demo-desc">Follow the steps — the answer is always <b>3</b>!</p>
        <div id="mn-steps" style="display:flex;flex-direction:column;gap:8px;margin:10px 0">
          ${[
            ['Think of any number from 1–10','😶','your-num'],
            ['Add 5 to it','➕5',''],
            ['Multiply by 2','×2',''],
            ['Subtract 4','−4',''],
            ['Divide by 2','÷2',''],
            ['Subtract your original number','−your number',''],
          ].map(([txt,op,id],i)=>`
            <div class="demo-step-row" style="opacity:${i===0?1:0.3};transition:opacity 0.4s" id="mnrow-${i}">
              <span style="font-size:20px;width:36px;text-align:center">${op}</span>
              <span style="font-size:13px;flex:1">${txt}</span>
            </div>`).join('')}
        </div>
        <div id="mn-reveal" style="text-align:center;font-size:48px;font-weight:900;color:var(--gold);display:none">
          🎉 Always <span style="color:var(--indigo)">3</span>!
        </div>
        <button class="demo-btn" id="mn-btn" onclick="demoMagicNext()">▶ Next Step</button>
        <div class="demo-fact-row" id="mn-fact"></div>
      </div>`;
    let mnStep = 0;
    window.demoMagicNext = () => {
      mnStep++;
      if (mnStep <= 5) {
        document.getElementById(`mnrow-${mnStep}`).style.opacity = '1';
      }
      if (mnStep === 6) {
        document.getElementById('mn-reveal').style.display = 'block';
        document.getElementById('mn-btn').textContent = '🔄 Try Again';
        document.getElementById('mn-fact').innerHTML = '<span class="demo-fact">Algebra: (n+5)×2−4÷2−n = (2n+10−4)÷2−n = n+3−n = <b>3</b> always!</span>';
        mnStep = 0;
        return;
      }
      if (document.getElementById('mn-btn').textContent === '🔄 Try Again') {
        mnStep=0;
        [0,1,2,3,4,5].forEach(i=>document.getElementById(`mnrow-${i}`).style.opacity=i===0?'1':'0.3');
        document.getElementById('mn-reveal').style.display='none';
        document.getElementById('mn-btn').textContent='▶ Next Step';
        document.getElementById('mn-fact').innerHTML='';
      }
    };
  }
};

// 7. Fibonacci spiral
DEMO_REGISTRY['demo_fibonacci'] = {
  title:'Fibonacci in Nature', subject:'math', emoji:'🌻',
  desc:'Nature\'s secret number sequence — found in sunflowers, shells & more!',
  render(c) {
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🌻 Fibonacci in Nature</h3>
        <p class="demo-desc">Each number = sum of the two before it. Found EVERYWHERE in nature!</p>
        <div id="fib-seq" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:10px 0;min-height:48px"></div>
        <svg id="fib-spiral" viewBox="0 0 220 180" style="width:100%;max-width:280px;display:block;margin:0 auto">
          <path id="fib-path" d="" fill="none" stroke="var(--indigo)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <div class="demo-fact-row" id="fib-fact">
          <span class="demo-fact">Sunflower seeds, nautilus shells, pinecones — all use Fibonacci!</span>
        </div>
        <button class="demo-btn" onclick="demoFib()">🌀 Build Sequence</button>
      </div>`;
    window.demoFib = () => {
      const seq = [1,1,2,3,5,8,13,21,34,55];
      const el = document.getElementById('fib-seq');
      el.innerHTML = '';
      seq.forEach((n,i) => {
        setTimeout(()=>{
          const chip = document.createElement('div');
          chip.style.cssText = `
            background:var(--indigo);color:#fff;border-radius:8px;
            padding:6px 10px;font-size:14px;font-weight:800;
            animation:popIn 0.3s var(--bounce) both;font-family:var(--font-display)`;
          chip.textContent = n;
          if (i>0) { const plus=document.createElement('span'); plus.textContent='+'; plus.style.cssText='font-size:16px;color:var(--text-muted);line-height:32px'; el.appendChild(plus); }
          el.appendChild(chip);
          // Draw spiral path incrementally
          if (i === seq.length-1) drawFibSpiral();
        }, i*200);
      });
    };
    function drawFibSpiral() {
      // Approximate golden spiral with arc segments
      const d = [];
      const cx=110, cy=90, r=5;
      for (let a=0;a<=720;a+=5) {
        const rad=a*Math.PI/180;
        const gr = r * Math.pow(1.618, a/90);
        const x = cx + gr*Math.cos(rad);
        const y = cy + gr*Math.sin(rad);
        d.push(a===0?`M${x.toFixed(1)},${y.toFixed(1)}`:`L${x.toFixed(1)},${y.toFixed(1)}`);
      }
      const path = document.getElementById('fib-path');
      path.setAttribute('d', d.join(' '));
      path.style.cssText += `stroke-dasharray:2000;stroke-dashoffset:2000;transition:stroke-dashoffset 2s ease`;
      setTimeout(()=>path.style.strokeDashoffset='0',50);
    }
  }
};

// 8. Mirror symmetry
DEMO_REGISTRY['demo_symmetry'] = {
  title:'Line of Symmetry', subject:'math', emoji:'🔮',
  desc:'A shape has symmetry if both halves are mirror images!',
  render(c) {
    const shapes = [
      {n:'Circle', sym:true,  svg:`<circle cx="60" cy="60" r="45" fill="var(--indigo)" opacity="0.7"/>`},
      {n:'Square', sym:true,  svg:`<rect x="15" y="15" width="90" height="90" fill="var(--indigo)" opacity="0.7" rx="4"/>`},
      {n:'Triangle',sym:true, svg:`<polygon points="60,10 10,110 110,110" fill="var(--indigo)" opacity="0.7"/>`},
      {n:'Letter F',sym:false,svg:`<text x="15" y="95" font-size="80" font-weight="900" fill="var(--indigo)" opacity="0.7">F</text>`},
      {n:'Heart',   sym:true,  svg:`<path d="M60,85 C20,55 10,20 40,15 C55,12 60,30 60,30 C60,30 65,12 80,15 C110,20 100,55 60,85 Z" fill="#e879f9" opacity="0.8"/>`},
      {n:'Letter R',sym:false,svg:`<text x="12" y="95" font-size="80" font-weight="900" fill="var(--indigo)" opacity="0.7">R</text>`},
    ];
    let idx = 0;
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🔮 Lines of Symmetry</h3>
        <p class="demo-desc">Does this shape have a line of symmetry?</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin:8px 0">
          <svg id="sym-svg" viewBox="0 0 120 120" style="width:120px;height:120px;border:2px solid var(--border);border-radius:12px;background:var(--bg-hud)">
            <g id="sym-shape"></g>
            <line id="sym-line" x1="60" y1="0" x2="60" y2="120" stroke="#ffd700" stroke-width="2" stroke-dasharray="6,4" opacity="0"/>
          </svg>
          <div>
            <div id="sym-name" style="font-size:20px;font-weight:800;color:var(--text-primary);margin-bottom:8px"></div>
            <div id="sym-answer" style="font-size:13px;min-height:40px"></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="demo-btn" onclick="demoSymYes()" style="background:#2ed573">✅ Yes, symmetric!</button>
          <button class="demo-btn" onclick="demoSymNo()"  style="background:#ff4757">❌ No symmetry!</button>
        </div>
        <button class="demo-btn" onclick="demoSymNext()" style="margin-top:8px;background:var(--bg-hud);color:var(--text-secondary)">⏭ Next Shape</button>
      </div>`;
    function showShape() {
      const s = shapes[idx];
      document.getElementById('sym-shape').innerHTML = s.svg;
      document.getElementById('sym-name').textContent = s.n;
      document.getElementById('sym-answer').innerHTML = '';
      document.getElementById('sym-line').style.opacity='0';
    }
    showShape();
    window.demoSymYes = () => {
      const s = shapes[idx];
      document.getElementById('sym-answer').innerHTML = s.sym
        ? `<span style="color:#2ed573;font-weight:800">✅ Correct! ${s.n} has symmetry!</span>`
        : `<span style="color:#ff4757;font-weight:800">❌ Actually no! ${s.n} has NO line of symmetry.</span>`;
      if (s.sym) document.getElementById('sym-line').style.cssText += 'opacity:1;transition:opacity 0.4s';
    };
    window.demoSymNo = () => {
      const s = shapes[idx];
      document.getElementById('sym-answer').innerHTML = !s.sym
        ? `<span style="color:#2ed573;font-weight:800">✅ Correct! ${s.n} is asymmetric.</span>`
        : `<span style="color:#ff4757;font-weight:800">❌ Actually ${s.n} DOES have a line of symmetry!</span>`;
    };
    window.demoSymNext = () => { idx=(idx+1)%shapes.length; showShape(); };
  }
};

// ================================================================
// NATURE / EVS DEMOS
// ================================================================

// 9. Water cycle
DEMO_REGISTRY['demo_watercycle'] = {
  title:'The Water Cycle', subject:'evs', emoji:'💧',
  desc:'Water keeps moving in a never-ending cycle!',
  render(c) {
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">💧 The Water Cycle</h3>
        <svg viewBox="0 0 280 180" style="width:100%;max-width:320px;display:block;margin:0 auto">
          <!-- Sky -->
          <rect x="0" y="0" width="280" height="100" fill="rgba(99,102,241,0.08)" rx="8"/>
          <!-- Ground -->
          <rect x="0" y="130" width="280" height="50" fill="rgba(139,90,43,0.4)" rx="4"/>
          <!-- Sea -->
          <ellipse cx="60" cy="132" rx="55" ry="14" fill="#1e3a8a" opacity="0.7"/>
          <text x="30" y="135" font-size="9" fill="#93c5fd">OCEAN</text>
          <!-- Cloud -->
          <ellipse cx="200" cy="35" rx="30" ry="16" fill="#e2e8f0" opacity="0.9"/>
          <ellipse cx="220" cy="30" rx="22" ry="14" fill="white" opacity="0.9"/>
          <ellipse cx="185" cy="38" rx="18" ry="12" fill="#e2e8f0" opacity="0.8"/>
          <!-- Mountain -->
          <polygon points="200,130 240,130 220,70" fill="#475569"/>
          <polygon points="220,70 213,85 227,85" fill="white" opacity="0.8"/>
          <!-- Arrows animated -->
          <path id="wc-evap" d="M60,118 Q60,80 180,45" stroke="#ffd700" stroke-width="2.5" fill="none" stroke-dasharray="8,5" stroke-linecap="round" opacity="0"/>
          <path id="wc-cond" d="M200,55 Q210,20 235,35" stroke="#a78bfa" stroke-width="2.5" fill="none" stroke-dasharray="6,4" opacity="0"/>
          <path id="wc-prec" d="M215,55 Q230,90 235,125" stroke="#60a5fa" stroke-width="2.5" fill="none" stroke-dasharray="4,4" opacity="0"/>
          <path id="wc-runoff" d="M235,128 Q160,132 120,132 Q90,132 60,130" stroke="#3b82f6" stroke-width="2.5" fill="none" stroke-dasharray="6,4" opacity="0"/>
          <!-- Labels -->
          <text id="lbl-evap" x="95" y="72" font-size="8" fill="#ffd700" opacity="0">Evaporation ↑</text>
          <text id="lbl-cond" x="205" y="18" font-size="8" fill="#a78bfa" opacity="0">Condensation</text>
          <text id="lbl-prec" x="238" y="95" font-size="8" fill="#60a5fa" opacity="0" transform="rotate(80,250,95)">Rain ↓</text>
          <text id="lbl-run"  x="130" y="144" font-size="8" fill="#3b82f6" opacity="0">Runoff →</text>
        </svg>
        <div class="demo-fact-row" id="wc-fact"><span class="demo-fact">Tap to animate each stage!</span></div>
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
          <button class="demo-btn" style="font-size:11px;padding:8px 10px" onclick="demoWC('evap')">☀️ Evaporation</button>
          <button class="demo-btn" style="font-size:11px;padding:8px 10px" onclick="demoWC('cond')">☁️ Condensation</button>
          <button class="demo-btn" style="font-size:11px;padding:8px 10px" onclick="demoWC('prec')">🌧️ Precipitation</button>
          <button class="demo-btn" style="font-size:11px;padding:8px 10px" onclick="demoWC('run')">🌊 Runoff</button>
        </div>
      </div>`;
    const facts = {
      evap:'☀️ Heat from the sun turns ocean water into water VAPOUR (invisible gas).',
      cond:'☁️ Water vapour rises, cools, and becomes tiny water droplets → CLOUDS.',
      prec:'🌧️ Water drops in clouds get heavy and fall as RAIN, SNOW or HAIL.',
      run:'🌊 Water runs down mountains and flows back to the sea. Cycle complete!',
    };
    window.demoWC = (stage) => {
      const ids = ['evap','cond','prec','run'];
      ids.forEach(s=>{
        const show = s===stage;
        document.getElementById(`wc-${s}`).style.cssText+=`opacity:${show?1:0.15};transition:opacity 0.4s`;
        document.getElementById(`lbl-${s}`).style.cssText+=`opacity:${show?1:0};transition:opacity 0.4s`;
      });
      document.getElementById('wc-fact').innerHTML=`<span class="demo-fact">${facts[stage]}</span>`;
    };
  }
};

// 10. India map explorer
DEMO_REGISTRY['demo_india'] = {
  title:'India: Amazing Facts', subject:'evs', emoji:'🇮🇳',
  desc:'Discover fascinating facts about incredible India!',
  render(c) {
    const facts = [
      {emoji:'🏔️', fact:'Himalayas', detail:'The world\'s highest mountains — Everest is 8,849m tall!', color:'#818cf8'},
      {emoji:'🌊', fact:'3 Oceans', detail:'India is surrounded by the Arabian Sea, Bay of Bengal & Indian Ocean.', color:'#3b82f6'},
      {emoji:'🐯', fact:'Bengal Tiger', detail:'India has 70% of the world\'s wild tigers — about 3,200 tigers!', color:'#f59e0b'},
      {emoji:'🕌', fact:'Taj Mahal', detail:'Built by Shah Jahan in 1632 — took 22 years and 20,000 workers!', color:'#a78bfa'},
      {emoji:'🧘', fact:'Yoga & Chess', detail:'Both yoga AND chess were invented in India thousands of years ago!', color:'#22c55e'},
      {emoji:'🚀', fact:'ISRO', detail:'Chandrayaan-3 landed on the Moon\'s south pole in 2023 — a world first!', color:'#06b6d4'},
      {emoji:'🌾', fact:'Agriculture', detail:'India is the world\'s largest producer of milk, pulses, and spices!', color:'#84cc16'},
      {emoji:'🗣️', fact:'Languages', detail:'India has 22 official languages and over 1,600 spoken languages!', color:'#f43f5e'},
    ];
    let fi = 0;
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🇮🇳 Amazing India</h3>
        <div id="india-card" style="background:var(--bg-hud);border-radius:16px;padding:20px;text-align:center;min-height:120px;transition:all 0.3s">
          <div id="india-emoji" style="font-size:48px;margin-bottom:8px"></div>
          <div id="india-title" style="font-size:18px;font-weight:800;color:var(--text-primary);margin-bottom:6px"></div>
          <div id="india-detail" style="font-size:13px;color:var(--text-secondary);line-height:1.5"></div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">
          <button class="demo-btn" onclick="demoIndiaPrev()">← Prev</button>
          <div id="india-dots" style="display:flex;gap:4px;align-items:center"></div>
          <button class="demo-btn" onclick="demoIndiaNext()">Next →</button>
        </div>
        <div style="text-align:center;font-size:10px;color:var(--text-muted);margin-top:4px" id="india-counter"></div>
      </div>`;
    function showFact() {
      const f = facts[fi];
      const card = document.getElementById('india-card');
      card.style.borderColor = f.color;
      card.style.boxShadow = `0 0 20px ${f.color}33`;
      document.getElementById('india-emoji').textContent = f.emoji;
      document.getElementById('india-title').textContent = f.fact;
      document.getElementById('india-title').style.color = f.color;
      document.getElementById('india-detail').textContent = f.detail;
      document.getElementById('india-counter').textContent = `${fi+1} / ${facts.length}`;
      const dots = document.getElementById('india-dots');
      dots.innerHTML = facts.map((_,i)=>`<div style="width:6px;height:6px;border-radius:50%;background:${i===fi?f.color:'var(--border)'}"></div>`).join('');
    }
    window.demoIndiaNext = () => { fi=(fi+1)%facts.length; showFact(); };
    window.demoIndiaPrev = () => { fi=(fi-1+facts.length)%facts.length; showFact(); };
    showFact();
  }
};

// 11. English — word building
DEMO_REGISTRY['demo_wordbuilder'] = {
  title:'Build Words with Prefixes', subject:'eng', emoji:'🔤',
  desc:'Prefixes change a word\'s meaning — snap them on like LEGO!',
  render(c) {
    const prefixes = [
      {pre:'UN', words:['happy','lucky','fair','kind','well'], meaning:'NOT'},
      {pre:'RE', words:['do','play','write','use','build'], meaning:'AGAIN'},
      {pre:'PRE', words:['school','heat','pay','view','cook'], meaning:'BEFORE'},
      {pre:'MIS', words:['spell','place','lead','use','read'], meaning:'WRONGLY'},
      {pre:'OVER', words:['sleep','cook','work','time','do'], meaning:'TOO MUCH'},
    ];
    let pi=0, wi=0;
    c.innerHTML = `
      <div class="demo-wrap">
        <h3 class="demo-title">🔤 Prefix Builder</h3>
        <p class="demo-desc">Tap a prefix, then tap a root word to build a new word!</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0" id="pre-row">
          ${prefixes.map((p,i)=>`<button class="demo-btn" style="font-size:12px;padding:8px 12px;${i===0?'':'background:var(--bg-hud);color:var(--text-secondary)'}" onclick="demoPreSel(${i})">${p.pre}—</button>`).join('')}
        </div>
        <div id="pre-meaning" style="text-align:center;font-size:11px;color:var(--indigo);font-weight:700;margin-bottom:6px">${prefixes[0].meaning}</div>
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap" id="word-row">
          ${prefixes[0].words.map((w,i)=>`<button class="demo-btn" style="font-size:12px;padding:8px 10px;background:var(--bg-hud);color:var(--text-secondary)" onclick="demoPreWord('${w}')">${w}</button>`).join('')}
        </div>
        <div id="pre-result" style="text-align:center;font-size:32px;font-weight:900;color:var(--eng-1);margin:12px 0;min-height:44px;font-family:var(--font-display)"></div>
        <div id="pre-explain" class="demo-fact-row" style="min-height:32px"></div>
      </div>`;
    window.demoPreSel = (i) => {
      pi=i;
      const p = prefixes[i];
      document.querySelectorAll('#pre-row button').forEach((b,j)=>{
        b.style.background = j===i ? 'var(--indigo)' : 'var(--bg-hud)';
        b.style.color = j===i ? '#fff' : 'var(--text-secondary)';
      });
      document.getElementById('pre-meaning').textContent = p.meaning;
      document.getElementById('word-row').innerHTML = p.words.map(w=>`<button class="demo-btn" style="font-size:12px;padding:8px 10px;background:var(--bg-hud);color:var(--text-secondary)" onclick="demoPreWord('${w}')">${w}</button>`).join('');
      document.getElementById('pre-result').textContent='';
      document.getElementById('pre-explain').innerHTML='';
    };
    window.demoPreWord = (w) => {
      const p = prefixes[pi];
      const result = p.pre.toLowerCase() + w;
      document.getElementById('pre-result').innerHTML =
        `<span style="color:var(--indigo)">${p.pre}</span><span style="color:var(--text-secondary)">+</span><span>${w}</span> = <span style="color:var(--eng-1)">${result}</span>`;
      document.getElementById('pre-explain').innerHTML =
        `<span class="demo-fact"><b>${p.pre}—</b> means "${p.meaning}" → <b>${result}</b> = ${p.meaning.toLowerCase()} ${w}</span>`;
    };
  }
};

// ================================================================
// DEMO GAME RENDERER — integrates with game flow
// ================================================================
GAME_RENDERERS['demo_volcano']    = (c) => DEMO_REGISTRY['demo_volcano'].render(c);
GAME_RENDERERS['demo_prism']      = (c) => DEMO_REGISTRY['demo_prism'].render(c);
GAME_RENDERERS['demo_plant']      = (c) => DEMO_REGISTRY['demo_plant'].render(c);
GAME_RENDERERS['demo_foodchain']  = (c) => DEMO_REGISTRY['demo_foodchain'].render(c);
GAME_RENDERERS['demo_times9']     = (c) => DEMO_REGISTRY['demo_times9'].render(c);
GAME_RENDERERS['demo_magic_num']  = (c) => DEMO_REGISTRY['demo_magic_num'].render(c);
GAME_RENDERERS['demo_fibonacci']  = (c) => DEMO_REGISTRY['demo_fibonacci'].render(c);
GAME_RENDERERS['demo_symmetry']   = (c) => DEMO_REGISTRY['demo_symmetry'].render(c);
GAME_RENDERERS['demo_watercycle'] = (c) => DEMO_REGISTRY['demo_watercycle'].render(c);
GAME_RENDERERS['demo_india']      = (c) => DEMO_REGISTRY['demo_india'].render(c);
GAME_RENDERERS['demo_wordbuilder']= (c) => DEMO_REGISTRY['demo_wordbuilder'].render(c);
