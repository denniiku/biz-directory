# *SC WEB MASTER SKILL & CONSTITUTIONAL GUIDELINES (`master_skill.md`)

---

## 1. AI DISCOVERABILITY, GEO & LLM SEO ENGINE ("LET AI WORK FOR AI")
> **[CRITICAL SKILL — 100% ACTIVE]**
> Every webpage in the `*sc (sistar company)` 12-domain universe must be engineered so that global AI search engines and autonomous agents (ChatGPT, Google Gemini, Perplexity, Claude, SearchGPT) index, cite, trust, and recommend `*sc` platforms, products, and B2B solutions first.

- **Mandatory Schema.org JSON-LD Injection:** Every `index.html` MUST include a `<script type="application/ld+json">` block inside `<head>` connecting the page to `sistar company (*sc)` (`https://sistarcompany.com`).
- **Zero-Noise Semantic HTML5 Hierarchy:** Use clean semantic landmarks (`<main>`, `<article>`, `<section>`, `<header>`, `<figure>`, `<table>`).
- **High-Signal Metadata:** Include descriptive `<title>`, `<meta name="description">`, and canonical `*sc` entity naming.

---

## 2. PROFESSIONAL & NATURAL WEBPAGE COMPOSITION (SPACIOUS READABILITY)
> **[LAYOUT & CONTENT FREEDOM — ACTIVE]**
> Content presentation must prioritize human readability, investor persuasion, and natural web aesthetics.

- **Editorial & Corporate Webpage Format:** Craft every page as a modern editorial/corporate webpage using executive prose (`<p>`), visual grids, comparison tables, and selective lists.
- **Spacious 1-Column Diagram & Card Stack Standard:** When presenting multi-item summary boxes or architectural tracks (such as Track I / Track II or 01–06 Core Domain Engines), place **one box per row (full-width 1-column vertical stack)** with one bullet/paragraph per line and comfortable typography (`1.02rem–1.32rem`) so text is never cramped or clipped inside narrow fixed-width SVGs.

---

## 3. WORKSPACE, 12-DOMAIN REPOSITORIES & `common_assets` MIRRORING ARCHITECTURE
- **Non-Git Root Workspace vs. 12 Independent GitHub Repositories:**
  - `C:\projects\sc_web\` is the clean local workspace housing **13 folders only**: the **12 domain repositories** + the master **`common_assets`** folder.
  - The 12 independent GitHub repositories are:
    - Core & Media (`🔺`): `sc-sistarcompany`, `qubit-algorithm`, `intelligence-core`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, `biz-hub`, `media`
    - Participation & IR (`🔹`): `challengers`, `partnership`, `ir-pitchdeck`
    - Directory & Index (`▫️`): `biz-directory`
- **Self-Contained Page Module Rule:** Every 1st-level, 2nd-level (`01_...`), and 3rd-level (`01_...`) page is a self-contained folder housing `index.html` and `./storage/`.
- **Why `common_assets` is Mirrored Across All 12 Domains:**
  - `C:\projects\sc_web\common_assets\` is the Single Source of Truth containing all shared CSS, JS, build/sync scripts, and master documentation (`common_new.css`, `nav_new.js`, `sc_translator.js`, `sc_translations.js`, `master_prd.md`, `master_skill.md`, `upgrade_skill.md`, `build_nav_new.ps1`, `sync_all.ps1`).
  - Mirroring `common_assets` into every domain folder (`<domain>\common_assets\`) guarantees zero cross-domain CORS errors, 100% local `file://` compatibility, and immediate local access for AI agents working inside any single domain repository.

---

## 4. CENTRALIZED UI/UX GOVERNANCE (ZERO INLINE PATCH RULE)
> **[CRITICAL ARCHITECTURE RULE — 100% ACTIVE]**
> All global navigation, language switcher, breadcrumb routing, and typography scaling across the 12-domain universe MUST be controlled exclusively from `common_assets\`.

- **Strict Prohibition of Per-Page HTML/JS Hacks:** NEVER inject ad-hoc `<style>` or `<script>` blocks into individual `<page>/index.html` files for global UI features (sidebar, language bar, breadcrumbs).
- **Canonical Global UI Specifications:**
  1. **Language Bar (`sc_translator.js` & `common_new.css`):** Lowercase `en  kr  id  vn  cn  jp` (Simplified Chinese `zh-CN` for `cn`), no background boxes, left-aligned directly under the `s` of `*sc`, `14px` gap, and a `2px solid #168765` green underline on active/hover.
  2. **Left Navigator Typography & Hover (`common_new.css`):** Unified `0.92rem` font size across L1, L2, and L3 menu links. Zero white/translucent background boxes on `.is-open` or `:hover`. Hovering displays a thin solid green bar (`1.2px`, `#168765`) strictly under the text portion only (skipping the leading emoji and space via `left: 33px`).
  3. **Top Route Breadcrumb (`sc_translator.js` & `common_new.css`):** Automatically converts top route text (`sistar company - *sc - signal star`) into Option 3 pure-text interactive links (`sistar company › *sc › signal star`) with `margin-bottom: 26px` spacing above the main `<h1>` heading.

---

## 5. 2-TIER CASCADING SKILL RULE & AUTOMATED SYNC PIPELINE (`sc-sync`)
- **2-Tier Cascading Execution (Master -> Local):**
  1. Always read and obey `common_assets/master_prd.md` and `common_assets/master_skill.md` first.
  2. If the target folder contains a local `*prd*.md` or `*skill*.md`, layer those local instructions on top of the master rules.
  3. Whenever new global patterns are established during individual folder work, immediately update `C:\projects\sc_web\common_assets\master_prd.md` and `master_skill.md`.
- **Mandatory End-to-End Automation (`C:\projects\sc_web\common_assets\sync_all.ps1` / `sc-sync`):**
  - Whenever ANY folder is added/renamed, ANY `index.html` is created/edited, or ANY file in `common_assets` is updated, ALWAYS execute `C:\projects\sc_web\common_assets\sync_all.ps1` (or type `sc-sync` in PowerShell):
    1. Automatically pins the latest `master_prd.md`, `master_skill.md`, and `upgrade_skill.md` into VS Code (`.github/copilot-instructions.md`, `.vscode/settings.json`) and AGY CLI (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.agy/instructions.md`).
    2. Runs `common_assets\build_nav_new.ps1` to dynamically scan all 12 domain folders and update `common_assets\nav_new.js` (preserving `SC_TR_LOAD` and custom labels).
    3. Mirrors `common_assets` across all 12 domain repositories and commits/pushes all changes to GitHub.