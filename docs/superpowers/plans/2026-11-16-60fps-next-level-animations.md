# 60fps Luxury Animations & Next-Level Interactivity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform RAPID MOTION STUDIO into a world-class, 60fps hardware-accelerated creative studio showcase with realistic 3D specular optics, magnetic cursor dynamics, kinetic typography, and silky responsive micro-interactions.

**Architecture:** Use CSS GPU composite properties (`translate3d`, `scale3d`, `opacity`, `will-change`) and Framer Motion spring physics with `requestAnimationFrame` for stutter-free 60fps performance across mobile and desktop. Integrate realistic 3D perspective tilt with mouse-following liquid specular glare, animated audio equalizers, live radial progress rings on hero chapters, and tactile magnetic snapping on before/after comparison stages.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Supabase (backend/storage).

---

## Global Constraints
- Target 60fps on all devices: only animate composite-only properties (`transform`, `opacity`), zero layout thrashing (`width`, `height`, `top`, `left`).
- Brand identity: RAPID MOTION STUDIO, *"THE ART OF MOVING IDEAS."*, Warm Ivory (`#F5F0E8`), Deep Burgundy (`#4B101B`), Dark Wine (`#290B12`), Obsidian (`#151313`), Champagne Gold (`#D8B477`).
- Respect `prefers-reduced-motion` gracefully across all animated layers.
- Maintain Next.js 16 build passing with 0 type errors (`npx tsc --noEmit`).

---

## Tasks

- [ ] **Task 1: Hardware-Accelerated CSS Utilities & Viewport Progress**
  - Add 60fps GPU acceleration utility classes (`.gpu-accelerated`, `.card-specular-glare`, `.hairline-expand`, `.audio-bar-pulse`) to `src/app/globals.css`.
  - Create global hairline scroll progress bar in `src/components/layout/scroll-progress.tsx` with Champagne Gold gradient.
  - Mount scroll progress in `src/app/(public)/layout.tsx`.
  - Verify build with `npx tsc --noEmit`.

- [ ] **Task 2: Magnetic Studio Cursor & Contextual Viewport Reticles**
  - Upgrade `src/components/ui/studio-cursor.tsx` with spring physics (`stiffness: 450, damping: 32`), `data-magnetic` target attraction, and dynamic reticle badges (`"EXPLORE"`, `"DRAG"`, `"PLAY"`, `"VIEW"`, `"INQUIRE"`).
  - Add smooth scale down on click and hover state transitions without layout jumps.
  - Verify desktop and mobile responsiveness.

- [ ] **Task 3: Kinetic 3D Card Tilt & Specular Optical Glare Engine**
  - Create `src/components/ui/card-tilt.tsx` component providing smooth mouse-tracking 3D perspective tilt (`rotateX`, `rotateY`, `scale3d`) and dynamic liquid specular sheen overlay.
  - Wrap portfolio cards in `src/components/portfolio/portfolio-showcase.tsx` with `CardTilt`.
  - Wrap services and industries cards in `src/components/home/services-grid.tsx` and `src/components/home/process-and-advantages.tsx`.

- [ ] **Task 4: Hero Section 60fps Upgrades (Chapter Radial Rings & Soundwave Equalizer)**
  - In `src/components/home/hero-section.tsx`:
    - Add animated SVG circular progress indicators around the active chapter pills (`01`–`06`) syncing to video playback.
    - Add animated 4-bar studio audio equalizer icon next to the reel format indicator.
    - Add kinetic staggered word entrance masks on headline (`WE MAKE IDEAS MOVE.`).
    - Add subtle multi-plane parallax depth separating the background 4K reel from typography lockup.

- [ ] **Task 5: Tactile Magnetic Before/After Comparison Showcase**
  - In `src/components/home/before-after-showcase.tsx`:
    - Add magnetic snap points (at 25%, 50%, 75% aperture) on drag release.
    - Add live resolution badge indicator (`4K MASTER` vs `RAW CLIENT INPUT`) on handle hover.
    - Enhance slider divider handle with glowing golden reticle pulse and smooth spring-based cursor tracking.

- [ ] **Task 6: Interactive Micro-Juice on Navigation & CTA Buttons**
  - In `src/components/layout/site-header.tsx` and `src/components/layout/site-footer.tsx`:
    - Add magnetic pull and liquid highlight shimmer to primary CTAs (`Start a Project`, `Submit Project Brief`).
    - Add smooth staggered mobile drawer reveal animations.
  - Add subtle live status beacon (`● STUDIO CAPACITY: ACCEPTING Q1/Q2 PRODUCTION BRIEFS`) with gentle ambient breathing animation.

- [ ] **Task 7: End-to-End Build, Git Push & Production Deployment Verification**
  - Run `npx tsc --noEmit` and `npm run build`.
  - Verify all 64 static/PPR routes compile cleanly.
  - Commit changes to Git (`main`) and push to `github.com/tusharmuzic-bot/rapid-motion-studio`.
  - Deploy to Vercel production (`rapid-motion-studio.vercel.app`) and verify 60fps animation smoothness and zero errors.
