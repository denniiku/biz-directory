---
name: sc-master-web-builder
description: Integrated Master Skill for *SC - SISTAR Company (sc_web) combining Luminous Prismatic palette, Gemini-style Left Collapsible Navigator, Cinematic Cosmos Main Landing, and Palantir/Linear/a16z infographic benchmarks.
---

# *SC Master Web Builder Skill (v5.0 Final)

## 1. Visual Philosophy, Benchmarks & Mandatory Color Tokens
- **Strict Aesthetic Rule:** No dark-space black or cheesy cyberpunk neon[cite: 6]. Use the **Luminous Prismatic Pastel Gradient** with **Deep Slate Navy** typography[cite: 6].
- **Brand Mood:** Luminous Prismatic, Quantum-Tech, Architectural, Authoritative[cite: 6].
- **3 Global Benchmarks to Emulate:**
  1. **Palantir (palantir.com):** Crisp system architecture diagrams, node-link flows, and mathematical formula cards (Qubit Algorithm™ wavefunctions, superposition, entanglement, tunneling, and offsetting matrices)[cite: 6, 9, 10].
  2. **Linear / Vercel:** Precision Bento grids, frosted glass surfaces (`backdrop-filter: blur(20px)`), and smooth cubic-bezier motion[cite: 6].
  3. **a16z (a16z.com):** Filterable portfolio matrices organizing 100+ projects clearly[cite: 6, 10].
- **Mandatory Color & Gradient CSS Tokens:**
  - **Main Canvas Background (All Pages):**
    - Fallback: `#f7f0ac`[cite: 6]
    - Webkit: `-webkit-linear-gradient(to right, #f0acf7, #acf7f0, #f7f0ac)`[cite: 6]
    - Standard: `linear-gradient(to right, #f0acf7, #acf7f0, #f7f0ac)`[cite: 6]
  - **Navigator Surface (Half-Transparent Bright-Gray):**
    - `--sc-nav-surface`: `rgba(221, 230, 237, 0.65)` with `backdrop-filter: blur(20px)` above the main gradient canvas[cite: 4, 5, 6].
  - **Typography & UI Palette (Color Hunt Slate Series):**
    - Primary Text / Headlines (`--sc-ink-primary`): `#27374D` (Deep Slate Navy)[cite: 6]
    - Secondary Text / Body (`--sc-ink-secondary`): `#526D82` (Muted Steel Blue)[cite: 6]
    - Borders & Dividers (`--sc-border`): `#9DB2BF` (Soft Cool Grey)[cite: 6]
    - Glass Card Surface (`--sc-surface`): `#DDE6ED` (`rgba(221, 230, 237, 0.58)` with `backdrop-filter: blur(20px)`)[cite: 6]

## 2. Gemini-Style Left Collapsible Navigator Rules
- **Layout & Structure:** Left-side collapsible sidebar (inspired by Gemini Web design) shared across all 10 domains via `/common_assets/common.css` and `/common_assets/nav.js`[cite: 4, 5].
- **Top-Left Control Bar:** Displays `*sc - sistarcompany` + `Search Button` + `Unfolding/Folding Button`[cite: 4, 5].
- **Folded State:** Only `*sc` and the `Unfolding Button` are shown[cite: 4, 5].
- **Unfolded State:**
  - Displays all **🔺 1st Level (About / 10 Core Domains)** and **🔸 2nd Level (Main Categories / Companies)** titles[cite: 4, 5].
  - Clicking any **🔸 2nd Level** item dynamically drops down its **🔹 3rd Level (Projects)** and **▫️ 4th Level (Details)**[cite: 4, 5].
  - Clicking any menu item navigates directly to the target subdomain or sub-folder URL.
- **Auto-Sync Requirement:** Directory/GitHub updates automatically sync to the shared navigator in `common_assets`.

## 3. Main Landing Page vs. Sub-Pages Design Rules
1. **Main Landing Page (`sistarcompany.com` Exclusive):**
   - Apply the **Cosmos / Universe Cinematic Dynamic Theme** exclusively to the main root landing page[cite: 4, 5].
   - **No Floating Keywords:** Never render literal text keywords floating around the screen.
   - **Inspired Cinematic Canvas:** Visually express the essence of `*sc - sistar company spaceship`, `command center`, `qubit engine`, `biz galaxy`, and `signal star universe` through dynamic quantum orbital geometry, wavefunctions, and architectural command-center depth[cite: 4, 5].
   - **Master Slogan & Core Corporate Copy:**
     - Slogan: **"Signal Star Universe — One Spark, Infinite Galaxifying"**[cite: 4, 5, 9, 10]
     - "Starting November 2026, PT. SISTAR Indonesia (a SISTAR Company) is fully integrating the SISTAR family groups and proudly launching our new corporate identity: *SC — SISTAR Company."[cite: 6]
     - "Pioneering new ways of working and doing global business, *SC operates as a Full-Stack AI Commerce & International AI Trading enterprise—equipped with our proprietary Qubit Algorithm, developed by *SC for brand-new AI commerce and global trading."[cite: 6]
     - "Furthermore, this web portal is currently being fully upgraded into a next-generation platform to deliver brand-new AI experiences for our global partners and clients."[cite: 6]
2. **All Other Subdomains & Sub-Pages (9 Core Subdomains + Sub-folders):**
   - **Infographic First:** Use flowcharts, metric counters, Bento grids, and pill badges instead of long text blocks[cite: 6].
   - Use GSAP (`gsap@3.12.5`) staggered reveal animations and frosted glass cards over the Luminous Prismatic gradient[cite: 6].

## 4. Target Architecture & Mandatory Execution Workflow
- **Target Architecture:** Pure Static Multi-Page Architecture (`index.html` + local `./storage/` folder per page + shared `/common_assets/`), deployed via GitHub & Cloudflare Pages across all 10 domains (`sistarcompany.com`, `qubit-algorithm`, `challengers`, `ir-pitchdeck`, `media`, `intelligence-core`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, `biz-hub`)[cite: 4, 6, 7, 8].
- **Mandatory HTML Head Injection (Every Page):**
  - Stylesheet: `<link rel="stylesheet" href="/common_assets/common.css">`
  - Navigator Script: `<script src="/common_assets/nav.js" defer></script>`
  - Motion Engine: `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>`[cite: 6]
- **Quality & Accessibility Standards:** Respect `prefers-reduced-motion`, semantic HTML5 structure, and full desktop/mobile responsiveness[cite: 6].