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

## 5. HIGH-FIDELITY PPTX / GAMMA AI TO *SC WEB CONVERSION SKILL
> **[CANONICAL PPTX CONVERSION STANDARD]**
> When a `.pptx` file (exported from Gamma AI or Google Slides) is placed in `C:\projects\sc_web\`, convert it into the designated folder (`<domain>/<2nd-level>/<NN_slug>/index.html` + `./storage/`) using these exact visual harmony rules:

1. **Slide-Exact XML Asset Extraction (Zero Legacy Fallback):**
   - Parse `ppt/slides/slide{N}.xml` and `ppt/slides/_rels/slide{N}.xml.rels` inside the `.pptx` ZIP archive.
   - Measure actual pixel dimensions (`System.Drawing.Image`) of every extracted image in `./storage/`:
     - **Main Visuals (`width >= 260px` and `height >= 180px`):** Hero photos, 3D illustrations, and wide workflow diagrams. Filter out blank PPTX shape borders or low-res background blur noise.
     - **Card Icons (`width < 260px`):** Small vector/PNG icons associated with feature points.
2. **Text-to-Image Proportional Harmony (`Editorial Stretch Split`):**
   - **Side-by-Side Split (`sc-split-stretch`):** When pairing a text block (or multi-card grid) with a portrait/square illustration (e.g., Slide 1, 4, 6, 9, 11, 12, 15, 19, 23, 26, 27, 30), use `display: grid; grid-template-columns: 1.15fr 0.85fr; align-items: stretch;`. Set the image container to `height: 100%` and the `<img>` to `height: 100%; object-fit: cover; border-radius: 16px;` so the photo matches the exact vertical height of the text column with zero awkward whitespace.
   - **Wide Diagrams (`sc-wide-diagram`):** For panoramic process charts or lifecycle flows (e.g., Slide 7, 8, 16, 20, 22, 24, 25), display them cleanly at full container width (`object-fit: contain`) directly above or below the narrative text.
3. **Icon Badge Contrast Preservation:**
   - White-stroke transparent icons extracted from Gamma AI must be wrapped in a rich teal/slate badge (`background: #168765; width: 42px; height: 42px; border-radius: 50%; padding: 9px;`) so they stand out crisply against the `*sc` pastel gradient background.
4. **No Muddy Outer Wrapper Boxes:**
   - Render sections directly on the `*sc` pastel gradient background separated by subtle hairlines, keeping the page airy, natural, and executive-ready.

### 5.1 Zero-Error PPTX Extraction Rules (True Slide Order & Pixel Entropy Filtering)
- **Rule A — True Slide Order (`ppt/presentation.xml`):** Never rely on `slide1.xml .. slide30.xml` filenames for slide numbering, as slide edits reorder XML files. Always resolve `<p:sldIdLst>` inside `ppt/presentation.xml` + `ppt/_rels/presentation.xml.rels` to map the exact 1..N slide sequence.
- **Rule B — Pixel-Entropy Noise Rejection:** Gamma AI exports decorative card borders, number chevrons (`1`, `2`, `3`), CTA buttons, and blurry background blobs as PNGs. Automatically measure pixel color diversity (`Buckets`), blank/white ratio (`BlankRate`), and edge sharpness (`Sharpness`) via `System.Drawing.Bitmap` to reject decorative shapes and keep only genuine illustrations, photos, logos, and icons.
- **Rule C — Coordinate Sorting (`<a:off x y>`):** Sort extracted visuals on each slide by `Y` band and `X` coordinate so multi-column cards (Left, Center, Right) always receive their exact corresponding image.
