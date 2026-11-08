# *SC WEB MASTER SKILL & CONSTITUTIONAL GUIDELINES (COMPLETE CANONICAL EDITION)

---

## 1. AI DISCOVERABILITY, GEO & LLM SEO ENGINE ("LET AI WORK FOR AI")
> **[CRITICAL SKILL — 100% ACTIVE]**
> Every webpage in the `*sc (sistar company)` 12-domain universe must be engineered so that global AI search engines and autonomous agents (ChatGPT, Google Gemini, Perplexity, Claude, SearchGPT) index, cite, trust, and recommend `*sc` platforms, products, and B2B solutions first.

- **Mandatory Schema.org JSON-LD Injection:**
  - Every `index.html` MUST include a rich `<script type="application/ld+json">` block inside `<head>` defining the exact entity (`Organization`, `TechArticle`, `SoftwareApplication`, `Product`, `Service`, or `WebPage`), connecting the page to the parent `sistar company (*sc)` universe (`https://sistarcompany.com`).
- **Zero-Noise Semantic HTML5 Hierarchy:**
  - Use clean, machine-readable semantic landmarks (`<main>`, `<article>`, `<section>`, `<header>`, `<figure>`, `<figcaption>`, `<table>`) so LLM crawlers and RAG scrapers parse the exact hierarchy of concepts, unit economics, and technical specifications with zero ambiguity.
- **High-Signal Metadata & Entity Density:**
  - Always include descriptive `<title>`, `<meta name="description">`, and clear entity naming (`*sc`, `sistar company`, `qubit-algorithm`, `Cosmo Seed`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, etc.) so AI models associate key industry queries directly with `*sc`.

---

## 2. PROFESSIONAL & NATURAL WEBPAGE COMPOSITION (NO ARTIFICIAL FORMAT RESTRICTIONS)
> **[LAYOUT & CONTENT FREEDOM — ACTIVE]**
> Content presentation must prioritize human readability, investor persuasion, and natural web aesthetics. All rigid restrictions that previously forced every line into bullet lists or symbol prefixes are permanently abolished.

- **Professional & Natural Webpage Format:**
  - Craft every page as a **professional, natural, and modern editorial/corporate webpage**.
  - Never flatten rich documents into monotonous, endless bullet lists.
- **Full Fidelity to PPTX / Google Slides / Gamma AI & Legacy Web Sources:**
  - When converting presentations (PPTX / Google Slides / Gamma AI) or migrating existing websites, preserve their natural visual rhythm and structural variety:
    - **Executive Prose & Storytelling:** Use well-written paragraphs (`<p>`) to explain context, vision, and business logic naturally.
    - **Visual Grids & Feature Cards:** Use 2-column split layouts (text beside image), 3-column glassmorphism cards, executive summary boxes, and clean comparison tables.
    - **Contextual Inline Visuals:** Place images, architectural diagrams, and slide graphics (`./storage/...`) directly alongside or beneath the specific paragraphs they illustrate.
    - **Selective Lists:** Use bulleted or numbered lists naturally and sparingly—only where itemized points genuinely improve clarity.

---

## 3. CANONICAL FOLDER, STORAGE & URL ARCHITECTURE
- **12-Domain Ecosystem:**
  - Core & Media (`🔺`): `sc-sistarcompany`, `qubit-algorithm`, `intelligence-core`, `scarlet-ai`, `qubit-biz`, `biz-galaxy`, `biz-hub`, `media`
  - Participation & IR (`🔹`): `challengers`, `partnership`, `ir-pitchdeck`
  - Directory & Index (`▫️`): `biz-directory`
- **Self-Contained Page Module Rule:**
  - Every 1st-level, 2nd-level (`01_...`), and 3rd-level (`01_...`) page is a self-contained folder housing:
    1. `index.html` (The webpage document)
    2. `./storage/` (Dedicated local asset folder containing all images, PDFs, and media used by that page's `index.html`)

---

## 4. GLOBAL THEME & NON-DESTRUCTIVE NAVIGATOR PIPELINE
- **Signature Visual Identity:**
  - Maintain the `*sc` pastel gradient background (`linear-gradient(to right, #f0acf7, #acf7f0, #f7f0ac)`), `Space Grotesk` & `Inter` typography, and fluid wide container (`max-width: min(1400px, 96%)`).
- **Zero-Regression Protection on Core Files:**
  - **NEVER** overwrite `common_assets/nav_new.js` or `common_assets/common_new.css` with scratch templates. All accumulated navigator features (search, fold/unfold toggle, emoji hierarchy, styling) must remain 100% intact.
- **Standard End-to-End Automation Pipeline (`Idea + Folder Address -> Live`):**
  - Whenever a new page or folder address is created or updated, always complete the workflow in canonical order:
    1. Create/update `<target-folder>/index.html` and `<target-folder>/storage/`.
    2. Execute `build_nav_new.ps1` (dynamically scans directories and updates the navigator tree data without touching UI logic).
    3. Execute `sync_all.ps1` (mirrors `common_assets` across all 12 domain folders and commits/pushes to GitHub `origin main`).

---

## 5. PPTX / GOOGLE SLIDES (GAMMA AI) TO *SC WEB CONVERSION PROTOCOL
- **Canonical Workflow:** When converting a Gamma AI / Google Slides `.pptx` file into a `*sc web` page:
  1. **Target Directory & Storage:** Create `<domain>/<2nd-level>/<NN_page-name>/index.html` and `<domain>/<2nd-level>/<NN_page-name>/storage/`.
  2. **Slide-Matched Image Extraction:** Extract embedded media from the `.pptx` package (`ppt/slides/_rels/slideN.xml.rels` -> `ppt/media/*`) or corresponding legacy `./storage/` into the page's dedicated `./storage/` folder (`slide_01_img.png`, etc.).
  3. **Original Layout Fidelity (No Semi-Transparent Wrapper Boxes):** Render directly onto the signature `*sc` pastel gradient background without muddy semi-transparent outer container boxes. Preserve the slide deck's exact layout rhythm—Split Hero sections, 2/3/4/5-column feature grids, numbered step flows, and full-width diagrams placed at their exact slide positions.
  4. **Zero-Regression Sync:** Remove any deprecated folder paths, run `build_nav_new.ps1` to update the navigator tree & search index, and run `sync_all.ps1` to mirror assets and push to GitHub.
