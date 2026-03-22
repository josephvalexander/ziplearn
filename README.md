# ⚡ Zipplearn

> **Fast. Fun. Smart.** — Gamified learning for Classes 1–4

A Progressive Web App (PWA) that turns maths practice into an arcade game. No app store, no install friction — works on any phone, tablet, or desktop, online or offline.

---

## 🚀 One-Time GitHub Setup (10 minutes)

### Step 1 — Create your repository

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click **"+"** → **"New repository"**
3. Name it `zipplearn`
4. Set visibility to **Public**
5. Click **"Create repository"**

### Step 2 — Upload the files

You can do this directly in the browser — no git knowledge needed.

1. In your new repository, click **"uploading an existing file"**
2. Drag and drop **all files and folders** from this package:
   ```
   index.html
   manifest.json
   sw.js
   .github/
   public/
   README.md
   .gitignore
   ```
3. Scroll down, add commit message: `Initial deploy`
4. Click **"Commit changes"**

> **Important:** The `.github/workflows/deploy.yml` file must be uploaded exactly at that path. GitHub won't show hidden folders in the drag-drop UI — use the folder structure drag or GitHub Desktop.

### Step 3 — Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages** (left sidebar)
2. Under **"Build and deployment"**, set **Source** to **"GitHub Actions"**
3. Click **Save**

### Step 4 — Watch it deploy

1. Go to the **Actions** tab in your repository
2. You'll see a workflow called **"Deploy Zipplearn to GitHub Pages"** running
3. It takes about 30 seconds
4. When it shows a green ✓, your app is live!

**Your app URL:** `https://YOUR-USERNAME.github.io/zipplearn`

---

## 🔄 How Auto-Updates Work

Every time you push a change to the `main` branch, GitHub Actions:

```
Push to main
    │
    ▼
GitHub Actions triggers
    │
    ▼
Injects BUILD_VERSION into sw.js
(timestamp + git SHA → unique cache name)
    │
    ▼
Copies files to dist/
    │
    ▼
Deploys to GitHub Pages (~30 seconds)
    │
    ▼
Users with the app open see an "⚡ Update ready" toast
    │
    ▼
User taps "Update" → new SW activates → page reloads
    │
    ▼
Old cache deleted, new version running
```

### The versioning mechanism

Each deploy stamps `sw.js` with a unique version:

```
zipplearn-2024-12-01T10:30:00Z-a1b2c3d
           ──────────────────  ───────
           deploy timestamp    git SHA (first 7 chars)
```

This means:
- **Every deploy = a new, unique cache name**
- The old cache is automatically deleted when the new SW activates
- Users who dismiss the toast get the update on their next page load anyway

---

## 📂 Project Structure

```
zipplearn/
├── index.html              ← Entire app (HTML + CSS + JS, single file)
├── manifest.json           ← PWA identity (name, icons, shortcuts)
├── sw.js                   ← Service worker (cache + auto-update)
├── .gitignore
├── README.md
│
├── public/                 ← Static assets (icons, screenshots)
│   ├── icon-192.png        ← PWA icon (required for install prompt)
│   ├── icon-512.png        ← PWA icon large
│   ├── screenshot-home.png ← Optional: shown in install dialog
│   └── screenshot-game.png ← Optional: shown in install dialog
│
└── .github/
    └── workflows/
        └── deploy.yml      ← GitHub Actions CI/CD pipeline
```

---

## ✏️ Making Updates

### Editing the app

1. Go to your repository on github.com
2. Click `index.html`
3. Click the pencil ✏️ icon (Edit)
4. Make your changes
5. Click **"Commit changes"** → add a message → **"Commit directly to main"**
6. GitHub Actions automatically deploys in ~30 seconds
7. Users see the "Update ready" toast within 60 minutes (or instantly on next open)

### Using GitHub Desktop (recommended for regular updates)

1. Download [GitHub Desktop](https://desktop.github.com)
2. Clone your repository
3. Edit files in any text editor
4. Commit and Push — deploy happens automatically

---

## 🎮 Adding New Games

See `EXTENDING.md` for the full guide. The short version:

```javascript
// 1. Add to GAME_REGISTRY in index.html
sci: {
  1: {
    games: [
      { id:'sci_animals', icon:'🐘', name:'Animal Quiz', ... }
    ]
  }
}

// 2. Add a renderer function
sci_animals(el) {
  // render HTML into el, call wireOpts(correctAnswer)
}
```

---

## 📱 PWA Install Instructions (for users)

**Android (Chrome):**
1. Open the app URL in Chrome
2. Tap the **"Install"** banner at the bottom
   — or — tap ⋮ menu → "Add to Home Screen"

**iPhone/iPad (Safari):**
1. Open the app URL in Safari
2. Tap the **Share** button (box with arrow)
3. Scroll down → tap **"Add to Home Screen"**

**Desktop (Chrome/Edge):**
1. Open the app URL
2. Look for the install icon (⊕) in the address bar
3. Click it → "Install"

---

## 🛠️ Troubleshooting

**Deploy not triggering?**
- Check the Actions tab for errors
- Ensure Pages source is set to "GitHub Actions" not "Deploy from branch"

**App not updating for users?**
- The toast appears within 60 minutes for open tabs
- Closing and reopening the app always gets the latest version
- Hard refresh (Ctrl+Shift+R) bypasses cache entirely

**Service worker not registering?**
- PWA requires HTTPS — GitHub Pages provides this automatically
- Test on the live URL, not `file://` or `http://localhost` without a dev server

**Icons not showing on install?**
- Add real `icon-192.png` and `icon-512.png` files to the `public/` folder
- Icons must be square PNGs

---

## 📊 Free Tier Limits (GitHub Pages)

| Resource | Limit | Your usage |
|----------|-------|------------|
| Bandwidth | Unlimited | ✅ No cap |
| Storage | 1 GB | ✅ App is ~65 KB |
| Deployments | Unlimited | ✅ No cap |
| Custom domain | Free | ✅ Supported |
| HTTPS | Free | ✅ Automatic |

GitHub Pages is genuinely free forever with no usage limits for public repositories.

---

## 🔮 Scaling Up

When you outgrow GitHub Pages (unlikely for 50–100 users but good to know):

| Platform | Free bandwidth | Setup |
|----------|---------------|-------|
| Cloudflare Pages | **Unlimited** | Connect GitHub repo, 2 mins |
| Vercel | 100 GB/mo | Connect GitHub repo, 2 mins |
| Firebase | 10 GB/mo | CLI deploy |

Migration from GitHub Pages to any of these takes under 5 minutes — the app files don't change at all.

---

Built with ❤️ — Zipplearn v1.0
