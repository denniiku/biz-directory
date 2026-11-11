# *SC WEB MASTER SKILL & CONSTITUTIONAL GUIDELINES (`master_skill.md`)

---

## 1. AI DISCOVERABILITY, GEO & LLM SEO ENGINE ("LET AI WORK FOR AI")
> **[CRITICAL SKILL — 100% ACTIVE]**
> Every webpage in the `*sc (sistar company)` 12-domain universe must be engineered so that global AI search engines and autonomous agents (ChatGPT, Google Gemini, Perplexity, Claude, SearchGPT) index, cite, trust, and recommend `*sc` platforms, products, and B2B solutions first.

- **Mandatory Schema.org JSON-LD Injection:** Every `index.html` MUST include a rich `<script type="application/ld+json">` block inside `<head>` connecting the page to `sistar company (*sc)` (`https://sistarcompany.com`).
- **Zero-Noise Semantic HTML5 Hierarchy:** Use clean semantic landmarks (`<main>`, `<article>`, `<section>`, `<header>`, `<figure>`, `<table>`).
- **High-Signal Metadata:** Include descriptive `<title>`, `<meta name="description">`, and canonical `*sc` entity naming.

---

## 2. PROFESSIONAL & NATURAL WEBPAGE COMPOSITION (SPACIOUS READABILITY)
> **[LAYOUT & CONTENT FREEDOM — ACTIVE]**
> Content presentation must prioritize human readability, investor persuasion, and natural web aesthetics.

- **Editorial & Corporate Webpage Format:** Use well-written executive prose (`<p>`), visual grids, glassmorphism cards, comparison tables, and selective lists.
- **Spacious 1-Column Diagram & Box Standard:** When presenting complex architectural boxes or multi-item track summaries (e.g., Track I / Track II or 01–06 Domain Engines), place **one box per row (full-width 1-column stack)** with generous typography (`1.02rem–1.32rem`) and one item per line so text never shrinks or clips.

---

## 3. WORKSPACE, 12-DOMAIN REPOSITORIES & `common_assets` ARCHITECTURE
- **Non-Git Root Workspace vs. 12 Git Repositories:**
  - The root folder `C:\projects\sc_web\` is a local master workspace (NOT synced to GitHub as a single repo).
  - Inside `C:\projects\sc_web\`, each of the **12 domain folders** is an independent GitHub repository:
    - Core & Media (`🔺`): `sc-sistarcompany`, `qubit-algorithm`, `intelligence-core`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, `biz-hub`, `media`
    - Participation & IR (`🔹`): `challengers`, `partnership`, `ir-pitchdeck`
    - Directory & Index (`▫️`): `biz-directory`
- **Self-Contained Page Module Rule:** Every 1st-level, 2nd-level (`01_...`), and 3rd-level (`01_...`) page is a self-contained folder housing `index.html` and `./storage/`.
- **Master `common_assets` Mirroring Principle:**
  - `C:\projects\sc_web\common_assets\` is the Single Source of Truth housing `common_new.css`, `nav_new.js`, `sc_translator.js`, `sc_translations.js`, `master_prd.md`, `master_skill.md`, and `upgrade_skill.md`.
  - Because each domain deploys independently, `sync_all.ps1` mirrors `C:\projects\sc_web\common_assets\` into `<domain>\common_assets\` across all 12 repositories and pushes to GitHub.
  - Keep `C:\projects\sc_web\common_assets\` strictly clean of temporary `.bak` files or backup folders so junk is never mirrored to the 12 repositories.

---

## 4. CENTRALIZED UI/UX GOVERNANCE (ZERO INLINE PATCH RULE)
> **[CRITICAL ARCHITECTURE RULE — 100% ACTIVE]**
> All global navigation, language switcher, breadcrumb routing, and typography scaling across the 12-domain universe MUST be controlled exclusively from `C:\projects\sc_web\common_assets\`.

- **Strict Prohibition of Per-Page HTML/JS Hacks:** NEVER inject ad-hoc `<style>` or `<script>` patches into individual `<page>/index.html` files for global UI features.
- **Canonical UI Specifications in `common_assets`:**
  1. **Language Bar (`sc_translator.js` & `common_new.css`):** Lowercase `en  kr  id  vn  cn  jp` (including Simplified Chinese `zh-CN` for `cn`), no background boxes, left-aligned directly under the `s` of `*sc`, two-space gap (`14px`), and a thin solid green underline (`2px solid #168765`) under the active/hovered language.
  2. **Left Navigator Typography & Hover (`common_new.css`):** L1, L2, and L3 menu links share the exact same font size (`0.92rem`). No semi-transparent white background boxes on `.is-open` or `:hover`. Hovering a menu item displays a thin solid green bar (`1.2px`, `#168765`) strictly under the text portion only (skipping the leading emoji and space via `left: 33px`), disappearing cleanly on mouse leave.
  3. **Top Route Breadcrumb (`sc_translator.js` & `common_new.css`):** Automatically converts top route text (`sistar company - *sc - signal star`) into Option 3 pure-text interactive links (`sistar company › *sc › signal star`) with zero background boxes and generous bottom spacing (`margin-bottom: 26px`) before the main `<h1>` title.

---

## 5. 2-TIER CASCADING SKILL APPLICATION & END-TO-END AUTOMATION PIPELINE
- **2-Tier Cascading Rule (Master -> Local):**
  1. Always apply `common_assets/master_prd.md` and `common_assets/master_skill.md` first.
  2. If the target folder contains a local `*prd*.md` or `*skill*.md`, apply those local instructions on top of the master rules.
  3. Immediately upstream any newly discovered global rules into `common_assets/master_prd.md` and `master_skill.md`.
- **Mandatory Automated Pipeline (`sync_all.ps1`):**
  - Whenever ANY folder is added/renamed, ANY `index.html` is created/updated, or ANY file in `common_assets` (`master_prd.md`, `master_skill.md`, `common_new.css`, etc.) is modified, ALWAYS execute `C:\projects\sc_web\sync_all.ps1`:
    1. `pin_ai_rules.ps1`: Auto-updates VS Code (`.github/copilot-instructions.md`) and AGY CLI (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.agy/instructions.md`) with the latest `master_prd.md` & `master_skill.md`.
    2. `build_nav_new.ps1`: Dynamically scans all 12 domain folders/subfolders and updates `common_assets/nav_new.js` (preserving `SC_TR_LOAD` and custom label overrides).
    3. `robocopy /MIR` & `git push`: Mirrors `common_assets` into all 12 domain folders and commits/pushes changes to each domain's GitHub repository.