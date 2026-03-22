# Zipplearn — Developer Extension Guide

## Architecture Overview

Zipplearn is built on a **Subject Registry Pattern**. Adding a new subject
or game requires changes in exactly 2–3 places. No refactoring needed.

---

## Adding a New Subject (e.g. Science)

### Step 1 — Register the subject

In `index.html`, find `SUBJECT_REGISTRY` and add:

```js
sci: {
  id: 'sci',
  name: 'Science',
  icon: '🔬',
  iconClass: 'sci',
  color: 'var(--sci-1)',
  gradientFill: 'linear-gradient(90deg, var(--sci-1), var(--sci-2))',
  timerColor: '#00d4aa',
},
```

### Step 2 — Add games per class

In `GAME_REGISTRY`, add:

```js
sci: {
  1: {
    tip: { title: "Did You Know? 🌱", body: "Plants make food from sunlight!" },
    games: [
      { id:'sci_plants', icon:'🌱', bg:'rgba(0,212,170,0.12)', name:'Plant Parts', desc:'Name the parts!', diff:'easy' },
      // ... more games
    ]
  },
  2: { ... },
  3: { ... },
  4: { ... }
}
```

### Step 3 — Add game renderer

In `GAME_RENDERERS`, add your renderer function:

```js
sci_plants(el) {
  // Render question HTML into el
  // Use wireOpts(correctAnswer) to wire answer buttons
  // Dispatch 'lv:correct' or 'lv:wrong' for automatic scoring
}
```

### Step 4 — Enable the subject card on home screen

In the HTML, find the `<div class="subject-planet sci"...>` card,
remove `style="pointer-events:none;opacity:0.5"` and update the badge
from `soon` to `live`.

That's it. ✅

---

## Adding a New Game to Existing Subject

1. Add entry to `GAME_REGISTRY[subject][classNum].games[]`
2. Add renderer function to `GAME_RENDERERS`

Example renderer template:
```js
my_new_game(el) {
  const correctAnswer = 42; // your logic here
  const opts = genOpts(correctAnswer, 15, 4); // (correct, range, count)
  el.innerHTML = qCard('QUESTION LABEL', 'What is 6×7?', 'Hint text here')
    + optsHTML(opts);
  wireOpts(correctAnswer);
}
```

---

## Scoring System

| Event           | Points             |
|-----------------|-------------------|
| Correct answer  | +10                |
| Streak bonus (3+)| +5 per correct   |
| Streak of 5     | +25 bonus          |
| 3-star game     | Score ≥ 85         |
| 2-star game     | Score ≥ 50         |
| 1-star game     | Score < 50         |

---

## Persistent State (localStorage keys)

| Key          | Description           |
|--------------|-----------------------|
| `lv_xp`      | Total XP across all games |
| `lv_played`  | Total games played    |
| `lv_correct` | Total correct answers |
| `lv_streak`  | Personal best streak  |

---

## CSS Variables for New Subjects

Each subject uses 3 color shades + a neon shadow. Add to `:root`:
```css
--mysubj-1: #hex;   /* primary */
--mysubj-2: #hex;   /* lighter */
--mysubj-3: #hex;   /* pale/background */
```

---

## Deployment Checklist

- [ ] Host on HTTPS (required for service worker)
- [ ] Upload `index.html`, `manifest.json`, `sw.js`
- [ ] Add `icon-192.png` and `icon-512.png` for PWA install prompt
- [ ] Test on mobile: Chrome → "Add to Home Screen"
- [ ] Test offline: DevTools → Network → Offline

## Free Hosting Options

- **Netlify** — drag & drop the folder at netlify.com/drop
- **GitHub Pages** — free, supports custom domains
- **Vercel** — `vercel deploy` from CLI

All three are free, provide HTTPS, and support 50–1000+ users easily.
