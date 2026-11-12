
> **CRITICAL PROTECTED PAGES IN intelligence-core (DO NOT OVERWRITE):**
> - 05_agent-builder and 12_web-builder: Preserve 100% of the restored original HTML, Google Apps Script (GAS) links, forms, and interactive UI. NEVER overwrite these files with generic monograph prose!

# *SC (SISTAR COMPANY) — VS CODE COPILOT MASTER QA AUDIT & DEEP-UPGRADE INSTRUCTION

> **File Path:** `common_assets/vscode_copilot_audit_and_upgrade.md`
> **Purpose:** Comprehensive Quality Assurance (QA), Content Depth Audit, Original Context Restoration, and UI/UX Standardization using **VS Code Copilot (Agent / Edits Mode)**.
> **Protected Domain Exception:** **NEVER modify `biz-directory`** (`C:\projects\sc_web\biz-directory`).

---

## 1. FIVE CORE AUDIT & REMEDIATION MANDATES

When auditing or upgrading any `index.html` file in this domain, you MUST verify and enforce all 5 mandates below:

### MANDATE 1. Zero Omission of Original Seed Context (`./storage/index_golden_backup.html` vs. `index.html`)
1. Before editing any `index.html`, read its original backup at `./storage/index_golden_backup.html` AND its blueprint entry in `common_assets/agy_upgrade_prompt_<domain>.md` (PHASE 3).
2. Verify that **100% of the original headings, specific product/project names, pricing, regional details, and business logic** from `./storage/index_golden_backup.html` are preserved and deeply expanded inside `index.html`.
3. If an earlier automated pass dropped, summarized, or glossed over any original detail, restore and expand it into full institutional prose, tables, and callouts (no character or length limits).

### MANDATE 2. Strict `L1 x L2 x L3` Topic Specificity (Zero Generic Boilerplate)
1. Check the exact hierarchy path (`Domain L1 -> Category L2 -> Node L3`) and `<p class="sc-route">` breadcrumb.
2. Ensure **85%+ of the chapters, equations, tables, and SVGs** are dedicated specifically to the **exact L3 topic** of that page—not generic holding-company repetition.
3. Adjacent sibling pages MUST have 100% distinct prose, distinct `.sc-table` matrices, distinct `.sc-math-box` models, and distinct Inline `<svg>` diagrams.

### MANDATE 3. Clean UI/UX Visual Standardization
1. **NO Top-Right Action/PDF Buttons:** Remove `<div class="sc-top-actions">...</div>` or any top-right buttons next to `<p class="sc-route">` (except in `06_sc-master-brochure-_ver03` and `07_sc-founder-projects-_ver02`). The `.sc-top-bar` should contain ONLY `<p class="sc-route">...</p>`.
2. **NO Giant Full-Page / Full-Chapter Semi-Transparent White Wrapper Box:**
   - Do NOT wrap `.sc-monograph` or `.sc-chapter` in a giant translucent white background box (`background: rgba(255,255,255,...)`, `border`, `box-shadow`).
   - In `<style>`, ensure: `.sc-chapter { margin-bottom: 48px; padding: 12px 0; background: transparent; border: none; box-shadow: none; }`.
   - **Preserve Inner Content Cards:** Keep clean card backgrounds and borders on inner blocks (`.sc-panel`, `.sc-dossier-card`, `.sc-math-box`, `.sc-table-wrap`, `.sc-svg-wrap`, `.sc-exec-hero`, `.sc-callout`).
3. **Arrow Notation:** Always use `->` for directional arrows.

### MANDATE 4. Bespoke Inline `<svg>` Diagrams & Quantitative Depth
1. Every page must contain **2 to 3 bespoke Inline `<svg viewBox="0 0 960 340" class="notranslate" translate="no">` architectural diagrams** tailored to that exact L3 topic. Replace any overly simple or duplicated SVG with a rich multi-node architecture diagram.
2. Every page must contain at least **1 node-specific `.sc-math-box`** and **2 comprehensive `.sc-table` matrices**.

### MANDATE 5. Zero-Skip Translation HTML Hygiene
1. Write clean `<p class="sc-p">`, `<p class="sc-lead">`, `<li>`, `<td>`, and `<th>` blocks without nesting block-level `<div>` tags inside `<p>`.
2. Keep `<svg>` and `<pre>` blocks tagged with `class="notranslate" translate="no"`.
3. **Do NOT run `sync_all.ps1`, `update_translations.js`, or `git push`.**
