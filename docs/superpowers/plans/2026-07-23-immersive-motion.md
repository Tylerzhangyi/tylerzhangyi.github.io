# Immersive GSAP Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a site-wide GSAP motion system for cinematic scroll storytelling (B) and pointer micro-interactions (C), with desktop-full / mobile-lite / reduced modes and per-section `data-motion` flags—without Lenis or a second animation library.

**Architecture:** Add `lib/motionSystem/` with capability detection, reusable primitives (split, parallax, magnetic, tilt, cursor), and a `MotionRoot` provider mounted in `Providers`. Wire flags into homepage sections, header/menu, cards, and detail pages while preserving existing ScrollTrigger pins, blog deck, page transitions, and detail navigation.

**Tech Stack:** Next.js 15 App Router (static `output: 'export'`), React 19, GSAP 3 + ScrollTrigger, existing neo-brutal CSS, Node test runner (`node --test`) + Playwright for smoke checks.

## Global Constraints

- No Lenis / no second motion library (GSAP only)
- Desktop gate: `min-width: 993px` + `(hover: hover) and (pointer: fine)`
- Tilt cap: ±10deg rotateX/Y, ≤12px translate; magnetic cap: ≤18px
- Do not break detail navigation (`commitClientNavigation`)
- Do not dual-animate nodes already handled by `observeReveals` when `split`/`parallax` is opted in
- Honor `prefers-reduced-motion: reduce`
- Static export must keep working (`npx next build`)

## File map

| Path | Responsibility |
|------|----------------|
| `personal-portfolio/lib/motionSystem/capabilities.js` | Mode detection + subscribe API |
| `personal-portfolio/lib/motionSystem/capabilities.test.mjs` | Unit tests for mode resolution |
| `personal-portfolio/lib/motionSystem/registerSection.js` | Parse `data-motion` flags |
| `personal-portfolio/lib/motionSystem/registerSection.test.mjs` | Flag parsing tests |
| `personal-portfolio/lib/motionSystem/primitives/splitReveal.js` | Split text + scrub/enter reveals |
| `personal-portfolio/lib/motionSystem/primitives/scrubParallax.js` | Transform parallax via ScrollTrigger |
| `personal-portfolio/lib/motionSystem/primitives/magnetic.js` | Magnetic pull on pointer |
| `personal-portfolio/lib/motionSystem/primitives/tiltCard.js` | 3D tilt on pointer |
| `personal-portfolio/lib/motionSystem/primitives/cursor.js` | Custom cursor controller |
| `personal-portfolio/lib/motionSystem/MotionRoot.jsx` | Provider, cursor DOM, GSAP bootstrap |
| `personal-portfolio/lib/motionSystem/motion.css` | Cursor + motion utility styles |
| `personal-portfolio/components/Providers.jsx` | Mount `MotionRoot` |
| `personal-portfolio/components/SiteHeader.jsx` | Magnetic + menu stagger + cursor targets |
| Homepage sections / detail clients / cards | `data-motion` + `data-split` wiring |
| `personal-portfolio/lib/motion.js` | Skip legacy reveal when motionSystem owns node |

---

### Task 1: Capability detection + flag parsing

**Files:**
- Create: `personal-portfolio/lib/motionSystem/capabilities.js`
- Create: `personal-portfolio/lib/motionSystem/capabilities.test.mjs`
- Create: `personal-portfolio/lib/motionSystem/registerSection.js`
- Create: `personal-portfolio/lib/motionSystem/registerSection.test.mjs`

**Interfaces:**
- Produces: `resolveMotionMode({ reducedMotion, finePointer, hoverHover, width }) → 'desktopFull' | 'mobileLite' | 'reduced'`
- Produces: `subscribeMotionMode(cb) → unsubscribe` (browser)
- Produces: `getMotionMode() → mode`
- Produces: `parseMotionFlags(value) → Set<'split'|'parallax'|'tilt'|'magnetic'|'cursor-target'>`
- Produces: `elementHasMotionFlag(el, flag) → boolean`

- [ ] **Step 1: Write failing capability tests**

```js
// personal-portfolio/lib/motionSystem/capabilities.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveMotionMode } from './capabilities.js'

test('reduced wins over desktop signals', () => {
  assert.equal(
    resolveMotionMode({
      reducedMotion: true,
      finePointer: true,
      hoverHover: true,
      width: 1400
    }),
    'reduced'
  )
})

test('desktopFull when fine pointer + hover + wide', () => {
  assert.equal(
    resolveMotionMode({
      reducedMotion: false,
      finePointer: true,
      hoverHover: true,
      width: 1200
    }),
    'desktopFull'
  )
})

test('mobileLite when narrow even with fine pointer', () => {
  assert.equal(
    resolveMotionMode({
      reducedMotion: false,
      finePointer: true,
      hoverHover: true,
      width: 800
    }),
    'mobileLite'
  )
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `cd personal-portfolio && node --test lib/motionSystem/capabilities.test.mjs`  
Expected: FAIL (module missing)

- [ ] **Step 3: Implement `capabilities.js`**

```js
export const DESKTOP_MIN_WIDTH = 993

export function resolveMotionMode({
  reducedMotion,
  finePointer,
  hoverHover,
  width
}) {
  if (reducedMotion) return 'reduced'
  if (finePointer && hoverHover && width >= DESKTOP_MIN_WIDTH) return 'desktopFull'
  return 'mobileLite'
}

export function readMotionEnvironment(win = window) {
  return {
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: win.matchMedia('(pointer: fine)').matches,
    hoverHover: win.matchMedia('(hover: hover)').matches,
    width: win.innerWidth
  }
}

let cachedMode = 'mobileLite'
const listeners = new Set()

export function getMotionMode() {
  return cachedMode
}

export function subscribeMotionMode(cb) {
  if (typeof window === 'undefined') return () => {}
  const emit = () => {
    cachedMode = resolveMotionMode(readMotionEnvironment())
    listeners.forEach((fn) => fn(cachedMode))
  }
  listeners.add(cb)
  const mq = [
    window.matchMedia('(prefers-reduced-motion: reduce)'),
    window.matchMedia('(pointer: fine)'),
    window.matchMedia('(hover: hover)')
  ]
  mq.forEach((m) => m.addEventListener?.('change', emit))
  window.addEventListener('resize', emit, { passive: true })
  emit()
  cb(cachedMode)
  return () => {
    listeners.delete(cb)
    mq.forEach((m) => m.removeEventListener?.('change', emit))
    window.removeEventListener('resize', emit)
  }
}
```

- [ ] **Step 4: Write flag parser tests + implementation**

```js
// registerSection.js
const ALLOWED = new Set(['split', 'parallax', 'tilt', 'magnetic', 'cursor-target'])

export function parseMotionFlags(value) {
  const flags = new Set()
  if (!value || typeof value !== 'string') return flags
  for (const part of value.split(',')) {
    const key = part.trim()
    if (ALLOWED.has(key)) flags.add(key)
  }
  return flags
}

export function elementHasMotionFlag(el, flag) {
  if (!el?.getAttribute) return false
  return parseMotionFlags(el.getAttribute('data-motion')).has(flag)
}
```

- [ ] **Step 5: Run all Task 1 tests — expect PASS**

Run: `cd personal-portfolio && node --test lib/motionSystem/capabilities.test.mjs lib/motionSystem/registerSection.test.mjs`

- [ ] **Step 6: Commit**

```bash
git add personal-portfolio/lib/motionSystem/capabilities.js \
  personal-portfolio/lib/motionSystem/capabilities.test.mjs \
  personal-portfolio/lib/motionSystem/registerSection.js \
  personal-portfolio/lib/motionSystem/registerSection.test.mjs
git commit -m "feat: add motion capability detection and data-motion flag parsing"
```

---

### Task 2: Cursor + magnetic primitives + MotionRoot shell

**Files:**
- Create: `personal-portfolio/lib/motionSystem/primitives/cursor.js`
- Create: `personal-portfolio/lib/motionSystem/primitives/magnetic.js`
- Create: `personal-portfolio/lib/motionSystem/primitives/magnetic.test.mjs`
- Create: `personal-portfolio/lib/motionSystem/motion.css`
- Create: `personal-portfolio/lib/motionSystem/MotionRoot.jsx`
- Modify: `personal-portfolio/components/Providers.jsx`

**Interfaces:**
- Consumes: `getMotionMode`, `subscribeMotionMode`
- Produces: `createCursorController(rootEl) → { destroy, setEnabled }`
- Produces: `bindMagnetic(el, { maxPull = 18 }) → cleanup`
- Produces: `clampPull(dx, dy, maxPull) → { x, y }` (pure, tested)

- [ ] **Step 1: Write failing magnetic clamp test**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { clampPull } from './magnetic.js'

test('clampPull limits vector length to maxPull', () => {
  const { x, y } = clampPull(100, 0, 18)
  assert.ok(Math.hypot(x, y) <= 18 + 1e-6)
})
```

- [ ] **Step 2: Implement magnetic + cursor**

`magnetic.js`: on `pointermove` within element bounds, set `transform: translate3d(x,y,0)` capped at 18px; reset on leave. No-op unless caller enables for `desktopFull`.

`cursor.js`: render/update `.motion-cursor` / `.motion-cursor__label` under a host; follow pointer with GSAP `quickTo` or direct style; expand on `[data-cursor], a, button`; set label from `data-cursor`; host `pointer-events: none`, `aria-hidden="true"`.

- [ ] **Step 3: Add `motion.css`**

Hide native cursor on `html.motion-cursor-on` for fine pointers only. Style default dot + ring + optional label. Ensure focus outlines still visible on focused elements.

- [ ] **Step 4: Implement `MotionRoot.jsx`**

```jsx
'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { subscribeMotionMode, getMotionMode } from './capabilities'
import { createCursorController } from './primitives/cursor'
import './motion.css'

const MotionModeContext = createContext('mobileLite')

export function useMotionMode() {
  return useContext(MotionModeContext)
}

export default function MotionRoot({ children }) {
  const [mode, setMode] = useState(getMotionMode)
  useEffect(() => subscribeMotionMode(setMode), [])
  useEffect(() => {
    const host = document.createElement('div')
    host.className = 'motion-cursor-host'
    document.body.appendChild(host)
    const cursor = createCursorController(host)
    const enabled = mode === 'desktopFull'
    document.documentElement.classList.toggle('motion-cursor-on', enabled)
    cursor.setEnabled(enabled)
    return () => {
      cursor.destroy()
      host.remove()
      document.documentElement.classList.remove('motion-cursor-on')
    }
  }, [mode])
  const value = useMemo(() => mode, [mode])
  return <MotionModeContext.Provider value={value}>{children}</MotionModeContext.Provider>
}
```

Wire in `Providers.jsx` wrapping `AppShell` (inside existing providers).

- [ ] **Step 5: Unit tests PASS + quick manual/dev check**

Run: `node --test lib/motionSystem/primitives/magnetic.test.mjs`  
Dev: hover links → cursor ring; reduced-motion / narrow width → no `motion-cursor-on`.

- [ ] **Step 6: Commit**

```bash
git add personal-portfolio/lib/motionSystem personal-portfolio/components/Providers.jsx
git commit -m "feat: add MotionRoot with custom cursor and magnetic primitive"
```

---

### Task 3: Wire header/menu magnetic + menu stagger

**Files:**
- Modify: `personal-portfolio/components/SiteHeader.jsx`
- Modify: `personal-portfolio/styles/neo-menu.css` (only if stagger needs class hooks)
- Create: optional small helper `personal-portfolio/lib/motionSystem/primitives/menuStagger.js`

**Interfaces:**
- Consumes: `useMotionMode`, `bindMagnetic`, GSAP timeline
- Produces: menu open/close stagger that respects `reduced` / `mobileLite` (instant or CSS-only)

- [ ] **Step 1: Mark interactive header controls**

Add `data-motion="magnetic,cursor-target"` and existing/compatible `data-cursor="menu"` on menu button; brand/lang get magnetic + cursor-target.

- [ ] **Step 2: Bind magnetics in `useEffect` when mode === `desktopFull`**

Collect brand/lang/menu button (+ menu links when open); `bindMagnetic` each; cleanup on close/unmount/mode change.

- [ ] **Step 3: Menu link stagger with GSAP**

On open (`desktopFull`): from `y: 24, opacity: 0` stagger 0.05s expo-out.  
On close: quick opacity/y out ≤220ms (keep existing `MENU_ANIM_MS` contract).  
`reduced`/`mobileLite`: keep current CSS visibility behavior without GSAP.

- [ ] **Step 4: Verify manually**

Desktop: menu items cascade; header controls magnetize; clicks still navigate/scroll.  
Mobile width: no magnetic drift; menu still usable.

- [ ] **Step 5: Commit**

```bash
git add personal-portfolio/components/SiteHeader.jsx personal-portfolio/lib/motionSystem personal-portfolio/styles/neo-menu.css
git commit -m "feat: magnetic header controls and staggered menu motion"
```

---

### Task 4: Split reveal + scrub parallax primitives; homepage storytelling

**Files:**
- Create: `personal-portfolio/lib/motionSystem/primitives/splitReveal.js`
- Create: `personal-portfolio/lib/motionSystem/primitives/scrubParallax.js`
- Create: `personal-portfolio/lib/motionSystem/primitives/splitReveal.test.mjs` (pure helpers only)
- Modify: `personal-portfolio/lib/motion.js` (skip dual animation)
- Modify: homepage sections:
  - `components/sections/FormStudioHero.jsx` / intro
  - `components/sections/IntroWelcomeSection.jsx`
  - `components/sections/AboutSection.jsx` / `AboutMeShowcase.jsx`
  - `components/sections/EducationSection.jsx` (node pop only; keep timeline)
  - `components/sections/SplitTitleSection.jsx`
  - `components/sections/ContactSection.jsx`
  - `app/page.jsx` (section `data-motion` attributes)

**Interfaces:**
- Produces: `splitTextElement(el, { type: 'chars'|'words' }) → { chars|words, revert }`
- Produces: `bindSplitReveal(el, { mode, trigger }) → cleanup`
- Produces: `bindScrubParallax(el, { yFrom, yTo, trigger }) → cleanup`
- Produces: `shouldSkipLegacyReveal(el) → boolean` used by `observeReveals`

- [ ] **Step 1: Test pure split helper**

Assert wrapping `"Hello"` as words yields 1 word node structure / char count helpers without touching DOM if easier: test `tokenizeWords('Hello world') → ['Hello','world']`.

- [ ] **Step 2: Implement splitReveal + scrubParallax with GSAP context**

- Split only `[data-split]` or h1–h3 inside flagged roots
- ScrollTrigger `scrub: true` for parallax; kill on cleanup
- No-op when mode is `reduced`; `mobileLite` uses simple fade/slide once (no scrub)

- [ ] **Step 3: Update `observeReveals`**

```js
import { elementHasMotionFlag } from '@/lib/motionSystem/registerSection'

// when observing, skip nodes where elementHasMotionFlag(el, 'split')
// or closest section has split/parallax ownership on the same target
```

- [ ] **Step 4: Wire homepage flags + bind on mount**

Examples:
- Hero/Intro: `data-motion="split,parallax"` + `data-split="chars"` on headline
- About: `data-motion="split"`
- SplitTitle: strengthen scrub (adjust existing GSAP or bind parallax on left/right)
- Contact: `data-motion="split"` + cascade children
- Education: enhance node pop only (do not rebuild timeline)

Create a small `bindSectionMotion(sectionEl, mode)` used from `app/page.jsx` or each section.

- [ ] **Step 5: Verify**

Desktop scroll homepage: clear staged storytelling.  
Toggle reduced-motion in DevTools: no continuous scrub.  
`node --test` for tokenize helpers.

- [ ] **Step 6: Commit**

```bash
git add personal-portfolio/lib/motionSystem personal-portfolio/lib/motion.js \
  personal-portfolio/app/page.jsx personal-portfolio/components/sections
git commit -m "feat: add split/parallax storytelling motion on homepage"
```

---

### Task 5: Tilt cards + projects/blog wake; CTA magnetics

**Files:**
- Create: `personal-portfolio/lib/motionSystem/primitives/tiltCard.js`
- Create: `personal-portfolio/lib/motionSystem/primitives/tiltCard.test.mjs`
- Modify: `components/sections/ProjectsSection.jsx`
- Modify: `components/sections/BlogSection.jsx`
- Modify: `components/sections/LinksSection.jsx`
- Modify: `components/CardCta.jsx` / card wrappers
- Modify: `components/DetailLink.jsx` only if needed for `data-cursor` (already has view/read)

**Interfaces:**
- Produces: `computeTilt({ px, py, width, height, maxDeg = 10, maxShift = 12 }) → { rotateX, rotateY, x, y }`
- Produces: `bindTiltCard(el, options) → cleanup`
- Produces: section wake tween helpers that do not alter pin scrub progress

- [ ] **Step 1: Failing tilt math test**

```js
test('computeTilt caps degrees', () => {
  const t = computeTilt({ px: 0, py: 0, width: 200, height: 200, maxDeg: 10, maxShift: 12 })
  // pointer at corner should still be within ±10
})
```

- [ ] **Step 2: Implement tilt + bind on project/blog/links cards when `desktopFull` and flag `tilt`**

`perspective` on parent; reset transform on leave; ignore when reduced/mobile.

- [ ] **Step 3: Projects/Blog wake**

On ScrollTrigger `onEnter` of section: brief opacity/y stagger on columns/cards (one-shot). Must not call `scrollTween` progress changes. Leave: optional soft opacity on section chrome only.

- [ ] **Step 4: Magnetic on `CardCta` media wrap / detail CTAs**

Reuse `bindMagnetic` for CTA shells already tracked by cursor.

- [ ] **Step 5: Verify horizontal projects still scrub; blog deck still peels; card clicks navigate**

- [ ] **Step 6: Commit**

```bash
git add personal-portfolio/lib/motionSystem personal-portfolio/components
git commit -m "feat: add tilt cards, section wake, and CTA magnetics"
```

---

### Task 6: Detail pages + final verification

**Files:**
- Modify: `app/projects/[id]/ProjectDetailClient.jsx`
- Modify: `app/blog/[id]/BlogDetailClient.jsx`
- Modify: detail CSS modules only if needed for split wrappers
- Optional: Playwright smoke script `personal-portfolio/scripts/smoke-motion.mjs`

**Interfaces:**
- Consumes: splitReveal, magnetic, useMotionMode
- Must not intercept `DetailLink` / back button beyond existing transition handlers

- [ ] **Step 1: Detail title `data-split` short entrance on mount when mode allows**

- [ ] **Step 2: Magnetic on back/close controls; `data-cursor` labels if missing**

- [ ] **Step 3: Optional paragraph cascade behind `data-motion="split"` on article body—keep ≤400ms total**

- [ ] **Step 4: Smoke verification**

```bash
cd personal-portfolio
node --test lib/motionSystem/**/*.test.mjs lib/navigateCommit.test.mjs
npx next build
npx serve out -p 8806
# Playwright: homepage project click still reaches /projects/1/
# Desktop: cursor visible; Mobile viewport: no motion-cursor-on
```

Expected: tests PASS, build succeeds, detail navigation still works, motion modes behave.

- [ ] **Step 5: Commit**

```bash
git add personal-portfolio
git commit -m "feat: apply motion system to detail pages and verify build"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Capability modes desktopFull/mobileLite/reduced | Task 1 |
| `data-motion` flags | Task 1, 4–6 |
| MotionRoot + cursor | Task 2 |
| Magnetic header/menu/CTA | Task 2–3, 5 |
| Split + parallax storytelling | Task 4 |
| Education node pop only | Task 4 |
| SplitTitle stronger scrub | Task 4 |
| Tilt cards | Task 5 |
| Projects/Blog wake | Task 5 |
| Detail pages | Task 6 |
| No Lenis / preserve pins & navigation | Tasks 4–6 verification |
| Skip dual legacy reveals | Task 4 |
| Reduced-motion / mobile lite | Tasks 1–6 |
| Static export | Task 6 |

## Self-review notes

- No Lenis anywhere in tasks
- Interfaces named consistently: `resolveMotionMode`, `bindMagnetic`, `bindTiltCard`, `bindSplitReveal`, `bindScrubParallax`
- Amplitude caps match spec (±10deg / 12px / 18px)
- Desktop breakpoint 993px matches projects gate
