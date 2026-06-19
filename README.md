# oscarkhowong.com

Personal website for Oscar Khowong — live at [oscarkhowong.com](https://oscarkhowong.com).

---
This is a fully custom-built personal website with two main sections:

**Home** — An interactive tennis pong game playable in the browser. You control a player using keyboard (desktop) or touch/flick gestures (mobile). The game supports 4 visual court themes (Roland Garros clay, Wimbledon grass, US Open hard, Laver Cup). First to 7 points wins. Everything — the court, players, ball physics, and sound effects — was built from scratch using the HTML5 Canvas API and Web Audio API, with no game engine or external libraries.

**About** — A personal bio section with a typewriter animation that cycles through names with realistic human-style typos and backspacing. Features draggable iOS-style app icons (Safeway deals tracker, Glance, Pokémon GO scanner) that link to live projects. The whole site has a retro grain texture and hand-drawn slime/smoke scroll hints between sections. The tennis game includes a mute toggle for the grunt sound effects.

**Tech used:** React, Vite, HTML5 Canvas, Web Audio API, SVG — deployed on Vercel with a custom domain via Porkbun DNS.

---

## Local Setup

No environment variables required. The project has no backend.

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Run on LAN (accessible from phone on same WiFi)
npm run dev -- --host

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Architecture & Code Flow

```
src/
├── main.jsx              # Entry point — mounts <App /> into the DOM
├── App.jsx               # Root component — renders <Home />
├── index.css             # All global styles (no CSS modules)
├── pages/
│   └── Home.jsx          # Page layout — composes all sections
└── components/
    ├── TennisGame.jsx     # Canvas game (the main feature)
    ├── ScoreBoard.jsx     # Score display
    ├── ThemeSwitcher.jsx  # Court theme selector + THEMES export
    ├── AboutSection.jsx   # Bio section with typewriter + scroll trigger
    ├── AppGrid.jsx        # Draggable iOS-style app icons
    ├── SmokeHint.jsx      # Animated smoke at bottom of home section
    └── SlimeHint.jsx      # Animated slime blob at top of about section
```

### How the page renders

`main.jsx` → `App.jsx` → `Home.jsx`

`Home.jsx` is the top-level layout. It holds score state and theme state, then renders:
1. `<section className="home">` — the dark game section
2. `<AboutSection>` — the beige bio section below it

Scrolling between them is triggered by the `SmokeHint` (scroll down) and `SlimeHint` (scroll back up) click handlers.

---

### TennisGame.jsx — Canvas Game

The entire game runs inside a `<canvas>` element using `requestAnimationFrame` for the game loop. No game engine.

**Key pieces:**
- `drawCourt(ctx, theme)` — draws the court, service lines, net based on the active theme
- `drawPlayer(ctx, x, y, ...)` — pixel art player renderer, supports shirt colors, stripes, headbands from the theme object
- `drawBall(ctx, s)` — draws the ball
- `playGrunt()` — Web Audio API synthesized tennis grunt on ball hit (sawtooth oscillator with pitch drop)
- Game state lives in a `useRef` (`stateRef`) so the game loop reads it without triggering React re-renders
- `themeRef` mirrors the `theme` prop so the game loop always has the latest theme without needing to restart
- `onScoreChange` callback fires up to `Home.jsx` whenever a point is scored

**Mobile controls:**
- Player paddle auto-tracks the ball vertically
- Flick gesture on touchend stores `{ vx, vy }` in `s.flick`, applied on the next ball-paddle collision to redirect the ball
- `touchstart` resumes `AudioContext` (required by iOS to unlock audio after a user gesture)

---

### AboutSection.jsx — Typewriter + Bio

Two independent animations run here:

**Name typewriter** (`useEffect` with `[]` deps — runs once on mount):
- Pre-builds a keystroke sequence for each name via `buildSequence(name)`
- Each sequence is an array of `{ op: 'type'|'back'|'pause', delay: fn }` steps
- Steps run recursively via `setTimeout`, simulating realistic human typing speed with occasional typos (adjacent QWERTY keys via `NEIGHBORS` map) and self-corrections
- `activeRef` boolean guards against React Strict Mode double-invoking the effect

**Bio typewriter** (triggered by `IntersectionObserver`):
- Starts typing `FULL_TEXT` one character at a time once the section scrolls into view (30% threshold)
- `[note]` and `[building]` tokens in the text get replaced with actual `<a>` links by `renderLine()`

---

### AppGrid.jsx — Draggable App Icons

Icons are absolutely positioned over the full about section using percentage-based `x`/`y` coordinates in state.

**Drag:** Uses `pointermove`/`pointerup` on `window` (works for both mouse and touch). On `pointerdown`, records the start pointer position and the icon's current percentage position, then updates position on every move event.

**Long press:** A 500ms `setTimeout` on `pointerdown` triggers jiggle mode. Cancelled if the pointer moves first (drag wins over long press).

**Jiggle mode:** CSS `@keyframes jiggle` rotates the icon back and forth. A delete button (×) appears on the icon. Tapping outside any icon exits jiggle mode via a `document` `pointerdown` listener.

**Mobile vs desktop initial positions:** Detected once at module load via `window.matchMedia('(pointer: coarse)')`, used to set different starting coordinates.

---

### ThemeSwitcher.jsx

Exports a `THEMES` object consumed by both `Home.jsx` (passed to `TennisGame`) and `ThemeSwitcher` (for the mini court previews). Each theme contains court colors, player shirt colors, and optional flags (`stripe`, `headband`) that `drawPlayer` reads to customize the pixel art appearance.

---

## Deployment

Deployed on **Vercel** with auto-deploy on push to `main`.

DNS managed on **Porkbun**:
- `A` record: `oscarkhowong.com` → `216.198.79.1` (Vercel)
- `CNAME` record: `www.oscarkhowong.com` → `cname.vercel-dns.com`
