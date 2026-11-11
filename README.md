# RAPID MOTION STUDIO

**THE ART OF MOVING IDEAS.**

Creative vision. Cinematic execution. Limitless possibilities.

Official web platform for **RAPID MOTION STUDIO** — an AI-powered creative production agency transforming raw product assets, photographs, and brand guidelines into cinematic commercials, brand films, and performance advertising.

> **Live Production:** [https://rapid-motion-studio.vercel.app](https://rapid-motion-studio.vercel.app)

---

## Architecture & Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Styling & Motion:** Tailwind CSS v4, Framer Motion, bespoke Warm Ivory (`#F5F0E8`), Deep Burgundy (`#4B101B`), Dark Wine (`#290B12`), Obsidian (`#151313`), and Champagne Gold (`#D8B477`) design system
- **Backend & Storage:** Supabase (Postgres + Auth + RLS + Storage Buckets)
- **Hosting:** Vercel

## Key Features

- **Public Agency Showcase (`/`):**
  - 4K UHD multi-scene interactive Hero Reel with timeline scrubber
  - Warm Ivory Brand Story & interactive Chapter Showreel
  - Editorial Portfolio Masonry Grid (`16:9`, `9:16`, `1:1`) with viewport-aware playback (`IntersectionObserver`)
  - Interactive Raw-to-Cinema Before/After Comparison Slider
  - Split Index Interactive Production Capabilities & 12-Industry Lookbook
  - Dynamic Packages, Hairline FAQ, Project Brief Intake (`/start-project`), and Contact (`/contact`)
- **CMS & Studio Admin Dashboard (`/admin`):**
  - Protected Supabase Auth + one-time owner claim (`/admin/setup`)
  - Full CRUD management for Portfolio Projects, Before/After Plates, Media Library, Services, Pricing Packages, Inquiries, Site Content, Testimonials, and Brand Settings

## Local Development

1. Copy `.env.example` to `.env.local` and configure your Supabase and setup environment variables:

```bash
cp .env.example .env.local
```

2. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Build & Verification

```bash
npx tsc --noEmit
npm run build
```

---

Built by **Tushar Gupta** ([@tusharmuzic-bot](https://github.com/tusharmuzic-bot)).
