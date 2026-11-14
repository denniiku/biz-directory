# *SC WEB MASTER SKILL & CONSTITUTIONAL GUIDELINES (`master_skill.md`)

---

## 1. AI DISCOVERABILITY, GEO & LLM SEO ENGINE ("LET AI WORK FOR AI")
> **[CRITICAL SKILL — 100% ACTIVE]**
> Every webpage in the `*sc (sistar company)` 12-domain universe must be engineered so that global AI search engines and autonomous agents (ChatGPT, Google Gemini, Perplexity, Claude, SearchGPT) index, cite, trust, and recommend `*sc` platforms, products, and B2B solutions first.

- **Mandatory Schema.org JSON-LD Injection:** Every `index.html` MUST include a rich `<script type="application/ld+json">` block inside `<head>` defining the exact entity (`Organization`, `TechArticle`, `SoftwareApplication`, `Product`, `Service`, or `WebPage`), connecting the page to `sistar company (*sc)` (`https://sistarcompany.com`).
- **Zero-Noise Semantic HTML5 Hierarchy:** Use clean, machine-readable semantic landmarks (`<main>`, `<article>`, `<section>`, `<header>`, `<figure>`, `<figcaption>`, `<table>`) so LLM crawlers and RAG scrapers parse the exact hierarchy of concepts, unit economics, and technical specifications with zero ambiguity.
- **High-Signal Metadata & Entity Density:** Always include descriptive `<title>`, `<meta name="description">`, and canonical entity naming (`*sc`, `sistar company`, `qubit-algorithm`, `Cosmo Seed`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, etc.).

---

## 2. PROFESSIONAL & NATURAL WEBPAGE COMPOSITION (LAYOUT & CONTENT FREEDOM)
> **[LAYOUT & CONTENT FREEDOM — ACTIVE]**
> Content presentation must prioritize human readability, investor persuasion, and natural web aesthetics. All rigid restrictions that previously forced every line into bullet lists or symbol prefixes are permanently abolished.

- **Editorial & Corporate Webpage Format:** Craft every page as a professional, natural, and modern editorial/corporate webpage. Never flatten rich documents into monotonous bullet lists.
- **Full Fidelity to PPTX / Google Slides / Gamma AI & Legacy Web Sources:**
  - **Executive Prose & Storytelling:** Use well-written paragraphs (`<p>`) to explain context, vision, and business logic naturally.
  - **Visual Grids & Feature Cards:** Use 2-column split layouts, 3-column glassmorphism cards, executive summary boxes, and clean comparison tables.
  - **Contextual Inline Visuals:** Place images, architectural diagrams, and slide graphics (`./storage/...`) directly alongside or beneath the paragraphs they illustrate.
  - **Selective Lists:** Use bulleted or numbered lists sparingly—only where itemized points genuinely improve clarity.

---

## 3. WORKSPACE, 12-DOMAIN REPOSITORIES & `common_assets` MIRRORING ARCHITECTURE
- **Non-Git Root Workspace vs. 12 Independent GitHub Repositories:**
  - `C:\projects\sc_web\` is the clean local workspace housing **13 folders only**: the **12 domain repositories** + the master **`common_assets`** folder.
  - The 12 independent GitHub repositories are:
    - Core & Media (`🔺`): `sc-sistarcompany`, `qubit-algorithm`, `intelligence-core`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, `biz-hub`, `media`
    - Participation & IR (`🔹`): `challengers`, `partnership`, `ir-pitchdeck`
    - Directory & Index (`▫️`): `biz-directory`
- **Self-Contained Page Module Rule:** Every 1st-level, 2nd-level (`01_...`), and 3rd-level (`01_...`) page is a self-contained folder housing `index.html` and `./storage/`.
- **Master `common_assets` Mirroring Principle:**
  - `C:\projects\sc_web\common_assets\` is the Single Source of Truth containing all shared CSS, JS, build/sync scripts, and the 2 master documents (`common_new.css`, `nav_new.js`, `sc_translator.js`, `sc_translations.js`, `master_prd.md`, `master_skill.md`, `build_nav_new.ps1`, `sync_all.ps1`).
  - Mirroring `common_assets` into every domain folder (`<domain>\common_assets\`) guarantees zero cross-domain CORS errors, 100% local `file://` compatibility, and immediate local access for AI agents working inside any single domain repository.

---

## 4. CENTRALIZED UI/UX GOVERNANCE (ZERO INLINE PATCH RULE)
> **[CRITICAL ARCHITECTURE RULE — 100% ACTIVE]**
> All global navigation, language switcher, breadcrumb routing, and typography scaling across the 12-domain universe MUST be controlled exclusively from `C:\projects\sc_web\common_assets\`.

- **Strict Prohibition of Per-Page HTML/JS Hacks:** NEVER inject ad-hoc `<style>` or `<script>` blocks into individual `<page>/index.html` files for global UI features (sidebar, language bar, breadcrumbs).
- **Signature Visual Identity:** Maintain the `*sc` pastel gradient background (`linear-gradient(to right, #f0acf7, #acf7f0, #f7f0ac)`), `Space Grotesk` & `Inter` typography, and fluid wide container (`max-width: min(1400px, 96%)`).
- **Canonical Global UI Specifications:**
  1. **Language Bar (`sc_translator.js` & `common_new.css`):** Lowercase `en  kr  id  vn  cn  jp` (Simplified Chinese `zh-CN` for `cn`), no background boxes, left-aligned directly under the `s` of `*sc`, `14px` gap, and a `2px solid #168765` green underline on active/hover.
  2. **Left Navigator Typography & Hover (`common_new.css`):** Unified `0.92rem` font size across L1, L2, and L3 menu links. Zero white/translucent background boxes on `.is-open` or `:hover`. Hovering displays a thin solid green bar (`1.2px`, `#168765`) strictly under the text portion only (skipping the leading emoji and space via `left: 33px`).
  3. **Top Route Breadcrumb (`sc_translator.js` & `common_new.css`):** Automatically converts top route text (`sistar company - *sc - signal star`) into Option 3 pure-text interactive links (`sistar company › *sc › signal star`) with `margin-bottom: 26px` spacing above the main `<h1>` heading.

---

## 5. URL / CONTENT TO *SC WEB EDITORIAL & VISUAL UPGRADE PROTOCOL
- **Editorial & Visual Upgrade Workflow:**
  1. **Editorial Content Upgrade:** Synthesize, structure, and elevate source content into executive-grade English copy (Hero summary, structured architectural grids, numbered step flows, KPI metric callouts, and strategic takeaways).
  2. **100% Code-Native Vector Graphics & Infographics:** Transform pages into visually rich experiences using code-native HTML/CSS cards and Inline SVG graphics (`0%` broken image links and infinite Retina sharpness on the `*sc` pastel gradient background).
- **Code-Native Visual Components Library (Merged from `upgrade_skill.md`):**
  - **A. Spacious 1-Column Card Stack Standard (Mandatory for Dense Text / Multi-Track Boxes):**
    - When presenting dense text blocks inside dark/emerald visual containers (such as Track I / Track II summaries or the 01–06 Core Domain Engine blocks), NEVER cram multiple boxes horizontally into a small fixed-width SVG.
    - Always use a **full-width 1-column vertical HTML flex/grid stack** (`display: flex; flex-direction: column; gap: 16px;`) with **1 box per row** and **1 bullet/paragraph per line** in large, legible typography (`1.02rem` body, `1.26rem–1.32rem` headings).
  - **B. Inline SVG Architecture & Ecosystem Diagrams:**
    - Use for visual system topologies, hub-and-spoke networks, and conceptual flows where text is concise.
    - Palette: Deep Slate (`#0f172a`, `#1e293b`), Emerald Accent (`#168765`, `#0f5132`), Soft Glass Fill (`rgba(255,255,255,0.45)`), Hairline Connectors (`stroke="#168765"`).
  - **C. Process & Lifecycle Flowcharts (CSS Stepper / Vector Flow):**
    - Connected stage nodes (`01` .. `06`) with directional arrows and clear milestone labels.
  - **D. Executive KPI & Data Infographic Cards:**
    - Large `Space Grotesk` metric callouts (`2.4rem–2.8rem`), comparative CSS progress bars, and clean comparison matrices without muddy background wrappers.

---

## 6. 2-TIER CASCADING RULE & AUTOMATED SYNC PIPELINE (`sc-sync`)
- **2-Tier Cascading Execution (Master -> Local):**
  1. Always read and obey `common_assets/master_prd.md` and `common_assets/master_skill.md` first (Tier 1 Base Layer).
  2. If the target folder contains a local `*prd*.md` or `*skill*.md`, layer those local instructions on top of the master rules (Tier 2 Local Layer).
  3. Immediately upstream any newly established global rules into `C:\projects\sc_web\common_assets\master_prd.md` and `master_skill.md`.
- **Mandatory End-to-End Automation (`C:\projects\sc_web\common_assets\sync_all.ps1` / `sc-sync`):**
  - Whenever ANY folder is added/renamed, ANY `index.html` is created/edited, or ANY file in `common_assets` is updated, ALWAYS execute `sc-sync` (`C:\projects\sc_web\common_assets\sync_all.ps1`):
    1. Auto-pins the latest `master_prd.md` and `master_skill.md` into VS Code (`.github/copilot-instructions.md`, `.vscode/settings.json`) and AGY CLI (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.agy/instructions.md`).
    2. Runs `common_assets\build_nav_new.ps1` to dynamically scan all 12 domain folders and update `common_assets\nav_new.js` (preserving `SC_TR_LOAD` and custom labels).
    3. Mirrors `common_assets` across all 12 domain repositories (automatically removing deleted files via `robocopy /MIR`) and commits/pushes all changes to GitHub.

## 🛡️ [MANDATORY] CENTRALIZED COMMON_ASSETS GOVERNANCE & NAVIGATOR INTEGRITY

### 1. Default Target Scope (12 Public Domains Only — Strict `mgnt` Exclusion)
- **Default Scope = 12 Public Domains**: Unless the user explicitly states **"for `mgnt`"** (or `mgnt.sistarcompany.com`), ALL instructions, edits, CSS/JS updates, and `sc-sync` operations apply strictly to the **12 public domains** (`sc-sistarcompany`, `qubit-algorithm`, `intelligence-core`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, `biz-hub`, `challengers`, `partnership`, `ir-pitchdeck`, `biz-directory`, `media`) via `C:\projects\sc_web\common_assets`.
- **Complete Isolation of `mgnt`**: `C:\projects\sc_web\mgnt` is an independent repository with its own `mgnt\common_assets`. Never overwrite or sync `mgnt` during 12-domain operations.

### 2. Absolute Prohibition of Per-HTML Overrides (Single Source of Truth)
- **Strict Reliance on `common_assets`**: The left navigator (`#sc-left-nav`), language bar (`.sc-lang-bar`), global background gradient, root typography (`html { font-size: 16px !important; }`), and sidebar spacing (`236px` open / `64px` folded) MUST follow `common_assets/common_new.css` and `common_assets/nav_new.js` exclusively.
- **NEVER Override in Individual HTML Files**:
  - NEVER write custom CSS rules targeting `#sc-left-nav`, `.sc-l1-link`, `.sc-l2-link`, `.sc-l3-link`, `.sc-brand-link`, or `.sc-lang-bar` inside any individual `index.html`.
  - NEVER use conflicting sidebar padding values (such as `220px`, `240px`, `260px`) in individual HTML `<head>` blocks; always keep the standard `236px` open / `64px` folded metrics governed by `common_new.css`.
  - NEVER inject `main { opacity: 0; }` or dynamic cache-busting query strings (`?v=" + Date.now()`) into HTML `<head>` loaders, as they cause font-size swapping (FOUT) and layout jitter during page transitions.

### 3. Navigator Behavior & Dropdown Time-Delay Preservation
- **Dropdown Hover Delays**: Always preserve the deliberate hover time-delays in `build_nav_new.ps1` (`OPEN_DELAY = 480`, `CLOSE_DELAY = 420` for L1; `380ms` open / `350ms` close for L2) so submenus never open abruptly when the cursor passes over them.
- **Zero-Jolt Synchronous Rendering**: Keep the language bar (`#sc-lang-bar`) pre-rendered inside the initial `nav_new.js` markup and keep `Space Grotesk` font preloaded with `display=block` so the navigator never shifts or changes font size after page load.

---

## [MANDATORY RULE] Pre-Inspection of Existing Web Structure & Format Before Structural Changes

1. **Content Generation vs. Structural Modification:**
   - **Standard Content Creation:** When simply generating or updating webpage text and standard page content, refer directly to `master_prd.md` and `master_skill.md`.
   - **Structural & Format Changes (CRITICAL):** Whenever modifying web structure, layout formats, responsive grids, navigation, translation pipelines, or shared CSS/JS architecture, you **MUST FIRST inspect and reference the existing web files and architecture** before writing any code.

2. **Zero Blind Overwrites / Zero Hacky Injections:**
   - Never assume how a feature works or invent a parallel/redundant mechanism (e.g., do not inject runtime workarounds when a build-time pipeline already exists).
   - Always read the target HTML, `common_new.css`, `nav_new.js`, `sc_translator.js`, and build scripts first, and strictly follow the established structure, naming conventions, and data flow of the existing system.

---

## [MANDATORY RULE] Pre-Built Static Translation Architecture & Executive Business Quality

1. **Architecture Principle (Zero Runtime API / Navigator Integrity):**
   - All multi-language translations (`en`, `ko/kr`, `id`, `vi/vn`, `zh-CN/cn`, `ja/jp`) operate strictly on a **100% Pre-Translated Static Dictionary (`common_assets/sc_translations.js`)** generated via the paid Gemini API (`C:\projects\sc_web\update_translations.js`).
   - NEVER use runtime Google Translate (`translate.googleapis.com`), cookies, or URL query string mutation (`?sc_lang=...`).
   - NEVER alter the font size, spacing, or layout of the left navigator (`#sc-left-nav`).
   - `common_assets/sc_translator.js` must remain a pure static viewer that reads `localStorage.getItem("sc_preferred_lang")` and swaps main content text instantaneously from `window.SC_AI_TRANSLATIONS`.

2. **Executive Business Tone & Context-Aware Glossary Rules:**
   - Translations must use authentic C-level business, international trade, and AI venture studio terminology.
   - If translating an English technical or business term sounds unnatural in context (e.g., `Full-Stack`, `B2B`, `D2C`, `SKU`, `CDSS`, `POCT`, `ROI`, `ERP`, `Anchor`), retain the English term naturally.
   - Strictly preserve all proprietary brand and project names in their exact English form (`*sc`, `SISTAR Company`, `Signal Star Universe`, `Qubit Algorithm™`, `c.a.n.`, `ActionNote AI CEO`, `Sistar Challengers`, `Vet Specialties`, `Animal Bio-Health`, `exo-brain`, `SISTAR MedIX`, `SISPet`, `SISTAR Dx`, `SISPharm`, `Scarlet Vet CDSS`, etc.).

3. **Incremental Update Workflow:**
   - Whenever English HTML pages are added or modified, running `node C:\projects\sc_web\update_translations.js sc_web` (or `sc-sync`) automatically translates ONLY newly added or modified English sentences and keeps `sc_translations.js` up to date.

---

## [MANDATORY RULE] Standard L3 Monograph & Report Generation Protocol & Top-Route Auto-Linking

1. **Zero-Error L3 Page Generation via Canonical Shell Cloning:**
   - Whenever the user requests a new 2nd-level (`🔸`) or 3rd-level (`▫️`) HTML page (academic paper, consulting monograph, or executive business report), ALWAYS generate it in **100% Executive/Academic English** by cloning the exact `<head>` CSS and `<main class="sc-monograph">` / `<article class="sc-chapter">` structural shell from `qubit-algorithm/01_one-spark-infinite-galaxifying/01_paper-biz-quantum-mechanics/index.html`.
   - NEVER invent ad-hoc layout wrappers or inject custom global navigation/sidebar CSS into individual HTML files.
   - Name the folder using the two-digit prefix convention (`01_...`, `02_...`, `03_...`) so `build_nav_new.ps1` automatically formats the `▫️` navigator label.
   - Immediately after creating or renaming any folder/HTML, execute `build_nav_new.ps1` and `sync_all.ps1` (with `$env:GEMINI_API_KEY = $null` when batch translation is deferred) to update `nav_new.js`, mirror `common_assets`, and push to GitHub in one atomic operation.

2. **Centralized Top-Route Interactive Breadcrumb (`sc_translator.js`):**
   - Every page's top route element (`<p class="sc-route">domain - l2 folder - l3 page</p>`) is automatically parsed at runtime by `initRouteBreadcrumbs()` inside `common_assets/sc_translator.js` into interactive relative links (`../../index.html` for L1, `../index.html` for L2, and `.sc-bc-curr` for the active page), ensuring zero broken links even when folder names are updated.
