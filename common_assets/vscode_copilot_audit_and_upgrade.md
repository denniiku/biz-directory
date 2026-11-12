# *SC (SISTAR COMPANY) — VS CODE COPILOT MASTER QA AUDIT & VISUAL UPGRADE INSTRUCTION (v2.0)

> **File Path:** `common_assets/vscode_copilot_audit_and_upgrade.md` (and `.github/copilot-instructions.md`)
> **Mission:** Comprehensive Quality Assurance (QA), Original Context Restoration, and **High-Density Visual Architecture Upgrade** using **VS Code Copilot (Agent / Edits Mode)**.
> **Core Principle:** **NEVER delete, shorten, or summarize existing prose, equations, or data.** Enhance visual rhythm, graphical richness, and scannability while preserving 100% of the textual substance.
> **Protected Exceptions:**
> - **NEVER touch `biz-directory`** (`C:\projects\sc_web\biz-directory`).
> - In **`intelligence-core`**, **NEVER overwrite `05_agent-builder/index.html` or `12_web-builder/index.html`** (preserve 100% of their restored Google Apps Script [GAS] links, interactive forms, and original UI).

---

## PART I. FIVE VISUAL ENHANCEMENT MANDATES (WITHOUT HARMING PROSE)

When upgrading any `index.html` page, elevate its visual presentation to match **Palantir Foundry / Stripe Press / Goldman Sachs Global Investment Research** standards:

### 1. Break "Walls of Text" with Visual Rhythm & Micro-UI Framing
- **Keep 100% of existing text**, but never leave 4+ consecutive plain `<p>` paragraphs without a visual anchor.
- Interleave long prose sections with **KPI Highlight Strips (`.sc-kpi-strip`)**, **2-Column or 3-Column Bento Cards (`.sc-bento-grid` > `.sc-bento-card` or `.sc-grid-2` / `.sc-grid-3`)**, **Executive Callout Boxes (`.sc-callout`)**, and **Dark Hero Accent Cards (`.sc-exec-hero` / `.sc-dark-card`)**.

### 2. Upgrade Inline `<svg>` to Multi-Layered Architectural Infographics (SVG 2.0)
- Every page MUST feature **2 to 3 bespoke Inline `<svg viewBox="0 0 960 360" class="notranslate" translate="no">` diagrams** specifically engineered for that exact L3 topic.
- **Visual Richness Requirements for SVGs:**
  - Use `<defs>` with rich `<linearGradient>`, subtle `<filter id="shadow">`, and background structural grid lines or zone containers.
  - Depict **multi-tier system topology**: Input/Ingestion Layer -> Core Quantum/AI Engine Layer -> Commercial/Settlement Output Layer, including feedback loop paths (`<path d="..." stroke-dasharray="6,4">`), metric badges (`t=0`, `WKB Tunneling`, `70/30 Split`), and color-coded node headers (`#0f172a` Dark Slate, `#0f5132` Emerald, `#d97706` Amber Gold, `#2563eb` Royal Blue).
  - Never use generic 3-box placeholder diagrams.

### 3. Step-by-Step Pipeline Strips & "Legacy vs. *SC Quantum" Comparison Cards
- Whenever a chapter describes a sequential workflow (Stage 1 -> Stage 2 -> Stage 3 -> Stage 4), add a visual **Pipeline Strip (`.sc-pipeline-strip` > `.sc-pipeline-step` with `.sc-step-num`)** alongside or below the prose.
- Whenever a chapter contrasts traditional industry bottlenecks against `*SC` innovations, render a side-by-side **Comparison Grid (`.sc-compare-grid`)** pairing `.sc-compare-legacy` (Newtonian Linear Friction) vs. `.sc-compare-quantum` (`*SC` Quantum Superposition / Entanglement Advantage).

### 4. Terminal-Grade Data Tables (`.sc-table`) with Status Pills
- Enhance `.sc-table` matrices by highlighting key metrics, formulas, and statuses using inline status pills (`.sc-pill-emerald`, `.sc-pill-gold`, `.sc-pill-slate`, `.sc-pill-crimson`) inside `<td>` cells where appropriate, making complex quantitative data effortless to scan.

### 5. Strict Adherence to Clean Outer Layout Rules
- **NO Top-Right Action Buttons:** Remove `<div class="sc-top-actions">...</div>` next to `<p class="sc-route">` (except on `06_sc-master-brochure-_ver03` and `07_sc-founder-projects-_ver02`).
- **NO Giant Full-Page / Full-Chapter White Wrapper Box:** `.sc-monograph` and `.sc-chapter` MUST remain `background: transparent !important; border: none !important; box-shadow: none !important; padding-left: 0; padding-right: 0;` so the signature pastel aurora background flows naturally behind the floating inner cards!
- **Arrow Standard:** Always use `->` for directional arrows.

---

## PART II. CONTENT FIDELITY & ZERO-SKIP TRANSLATION HYGIENE

1. **Cross-Check Against Golden Backup (`./storage/index_golden_backup.html`) & Blueprint (`common_assets/agy_upgrade_prompt_<domain>.md`):**
   - Ensure **100% of original seed concepts, product names, regional entities (`SCK`, `SCI`, `SCV`, `SCJ`, `SCC`, `SCU`, `SCS`, `SCIND`), pricing (`Rp 1,320`, `70/30`, etc.), and domain-specific mechanisms** from the backup and PHASE 3 blueprint are present and deeply explained.
2. **Strict `L1 x L2 x L3` Topic Specificity:**
   - 85%+ of every page's prose, equations, tables, and SVGs must directly address its exact **L3 node title** within its **L2 category** and **L1 domain**.
3. **Translation-Safe HTML DOM Structure:**
   - Keep `<p class="sc-p">`, `<p class="sc-lead">`, `<li>`, `<td>`, and `<th>` clean—never nest block-level `<div>`, `<section>`, or `<table>` tags inside a `<p>` tag.
   - Always include `class="notranslate" translate="no"` on all `<svg>` and `<pre>` elements.
4. **Do NOT run `sync_all.ps1`, `update_translations.js`, or `git push`.**
