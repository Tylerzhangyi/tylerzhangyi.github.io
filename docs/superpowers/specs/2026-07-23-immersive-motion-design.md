# Immersive Motion System (GSAP) — Design Spec

**Date:** 2026-07-23  
**Status:** Approved for planning  
**Scope:** Personal portfolio (`personal-portfolio/`) on GitHub Pages static export

## Summary

Add a site-wide immersive motion language using **GSAP + ScrollTrigger only** (no Lenis). Focus on:

- **B — Cinematic section storytelling:** split text, scrubbed parallax, staged reveals
- **C — Pointer micro-interactions:** custom cursor, magnetic controls, 3D tilt cards

Desktop gets the full bold experience; mobile auto-downgrades; `prefers-reduced-motion` disables continuous motion.

## Goals

1. Unify motion across homepage, menu, CTAs, and project/blog detail pages.
2. Feel bold and experimental, with per-section kill switches.
3. Preserve existing GSAP features: projects horizontal pin, education timeline, circular page transition, and the recently fixed detail navigation.
4. Keep a single animation engine and a single scroll source (native scroll + ScrollTrigger).

## Non-goals

- Lenis / any smooth-scroll library
- Replacing the existing page-transition ball expand/contract system
- Rewriting projects horizontal scroll or blog card-deck scroll from scratch
- Adding a second motion library (Motion One, Framer Motion, Anime.js, etc.)

## Current Context

Already in use:

- GSAP + ScrollTrigger (projects rail, education grow-in, scroll helpers)
- Custom page transition (`lib/pageTransition.jsx`)
- Custom blog scrub (`lib/blogScroll.js`)
- Reveal observers (`lib/motion.js`)
- Three.js / R3F in neo scene (unchanged by this work)

Missing today: shared primitives for split text, magnetic hover, tilt, and a coordinated custom cursor.

Relationship to `lib/motion.js`: keep existing `observeReveals` working during rollout; new storytelling reveals are owned by `motionSystem`. Do not dual-animate the same node—if a section opts into `split`/`parallax`, skip legacy reveal on that target.

## Architecture

### Capability modes

`lib/motionSystem/capabilities.js` detects:

| Mode | When | Behavior |
|------|------|----------|
| `desktopFull` | `(hover: hover) and (pointer: fine)` and not reduced-motion and viewport `min-width: 993px` (matches existing projects desktop gate) | B + C full |
| `mobileLite` | touch / coarse pointer / viewport `< 993px` | Lightweight scroll reveals only; no cursor, magnetic, or tilt |
| `reduced` | `prefers-reduced-motion: reduce` | Instant opacity / no continuous animation |

Capability is reactive to resize and media-query changes.

### Module layout

```
lib/motionSystem/
  capabilities.js
  MotionRoot.jsx          # provider + cursor host + GSAP bootstrap
  registerSection.js      # data-motion flag parsing + section registry
  primitives/
    splitReveal.js
    scrubParallax.js
    magnetic.js
    tiltCard.js
    cursor.js
```

`MotionRoot` mounts inside existing `Providers` / `AppShell`, so route changes can tear down and re-init safely for static export client navigations.

### Integration rules

1. One GSAP `context()` per page/section owner; call `revert()` on unmount and route change.
2. New effects **compose with** existing ScrollTriggers; they must not create a competing scroll container.
3. Detail navigation (`commitClientNavigation` / page transition) remains authoritative; motion must not `preventDefault` on detail links beyond what `DetailLink` already does.
4. Prefer `transform` / `opacity` only for continuous effects.

### Section flags

Sections/components opt in via:

```html
data-motion="split,parallax,tilt,magnetic"
```

Supported flags: `split`, `parallax`, `tilt`, `magnetic`, `cursor-target`.

Omitting a flag disables that primitive for the node even in `desktopFull`.

## Interaction Inventory

### B — Cinematic storytelling

| Surface | Effect |
|---------|--------|
| Hero / Intro | Split headline entrance; delayed supporting copy; light scrub parallax on scroll |
| About | Split title + staggered content blocks |
| Education | Keep existing timeline scrub; add stronger node pop emphasis |
| Projects Intro (`SplitTitle`) | Stronger scrubbed left/right split with a short hold near center |
| Projects / Blog | One-shot “wake” when section enters; soft fade when leaving (must not fight pin/deck) |
| Contact | Title + cards cascade lift-in |
| Project / Blog detail | Short title split-in; optional paragraph cascade (short duration, flag-gated) |

### C — Pointer micro-interactions (desktopFull only)

| Surface | Effect |
|---------|--------|
| Global | Custom cursor: default dot → ring on interactive; label for `data-cursor="view\|read\|menu"` |
| Header brand / lang / menu | Magnetic pull |
| Menu overlay links | Staggered open/close + magnetic hover |
| Primary CTAs / `CardCta` / detail back | Magnetic |
| Project cards, blog posters, Links cards | Bounded 3D tilt |

### Motion language

- Easing bias: spring / expo-out (avoid linear for hero moments)
- Bold amplitudes allowed; tilt hard-capped at **±10deg** rotateX/Y and **≤12px** translate toward pointer
- Magnetic pull hard-capped at **≤18px** from rest
- Cursor and magnetic share the same interactive selector set where possible

## Performance Guardrails

- Split text only on heading-level targets (h1–h3 / explicit `data-split`), never whole sections
- Enable `will-change` briefly while active; clear when idle/offscreen
- Pause or kill offscreen scrub/tilt listeners
- No Lenis RAF loop; rely on ScrollTrigger + pointer events
- Bundle impact: GSAP already present; no new runtime animation dependency

## Accessibility

- Honor `prefers-reduced-motion: reduce` → `reduced` mode
- Custom cursor must not replace focus rings; keyboard focus styles remain visible
- Magnetic/tilt never trap pointer or block click hit-testing (`pointer-events` on overlays carefully managed)
- Cursor layer is `aria-hidden` and ignores pointer events

## Testing / Acceptance

1. Desktop homepage → Contact reads as a continuous cinematic scroll story.
2. Desktop menu, CTAs, and detail back controls share magnetic + cursor feedback.
3. Mobile: no custom cursor residue; no jank; clicks remain reliable.
4. Project/blog detail navigation still works (soft or hard fallback).
5. Removing a `data-motion` flag disables only that effect.
6. Reduced-motion mode shows no continuous animation.
7. Static `next build` / `out` export succeeds.

## Implementation Phases (for planning)

1. Scaffold `motionSystem` + capability detection + `MotionRoot`
2. Cursor + magnetic primitives; wire header/menu/CTA
3. Split reveal + scrub parallax on homepage storytelling sections
4. Tilt on cards; projects/blog wake/leave polish
5. Detail pages + flag cleanup + reduced/mobile verification

## Open Decisions (resolved)

- Libraries: GSAP only (no Lenis) — **resolved**
- Scope: full-site unified language — **resolved**
- Intensity: bold/experimental with per-section switches — **resolved**
- Mobile: full desktop / lite mobile — **resolved**
