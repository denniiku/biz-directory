# PRD (Product Requirements Document) — *sc biz-directory & biz-galaxy

## 1. Goal & Vision
- Curate global partner companies under the **sistar company (`*sc`)** ecosystem (`biz-directory.sistarcompany.com`).
- Protect `*sc` brokerage value by hiding raw supplier URLs/contacts on the public web while storing full contact points in `master_db.csv`.
- Automate data harvesting using a **2-Hop Directory Crawler**: input an exhibition/company-list webpage URL -> automatically extract individual partner websites -> crawl images, contact emails, and generate AI bulletized summaries.

## 2. Core Workflow (2-Hop Automated Harvesting)
1. **Input**: User provides a **Company List / Exhibition Directory URL** (or selects from `master_db_legacy.csv`).
2. **Hop 1 (List Extraction)**: Crawler parses the directory webpage to extract `[Company Name + Official Website URL]` pairs.
3. **Hop 2 (Partner Site Crawling & AI Structuring)**:
   - Visits each extracted partner website automatically.
   - Extracts representative product/brand images -> resizes to lightweight 600px JPEG (`~35KB`) -> saves to `./storage/[id].jpg`.
   - Extracts contact email/phone -> saves to private columns in `master_db.csv`.
   - Uses Gemini AI to classify `country`, `industry`, `product_category` and write a clean multi-bullet summary.
4. **Frontend Sync**: `build_directory_data.ps1` strips private columns and updates `directory_data.js` for instant zero-latency search and filtering.

## 3. Key Frontend Features
- **Lowercase Branding**: `sistar company` eyebrow across all pages.
- **1-Row Filter Bar**: `country` | `industry` | `product category` | `search` | `✨ brief` | `inquiry for ☑`.
- **Pastel Gradient UI**: Signature 3-color pastel gradient applied to `✨ brief`, `inquiry for ☑`, and `☐ select` buttons.
- **Detail Modal**: Scrollable multi-image & bullet summary view, bottom-left `<` and bottom-right `>` navigation, `biz-galaxy` link opening in a new tab.
- **✨ Real-Time AI Brief (GAS + Gemini)**: Summarizes or compares selected (`☑`) companies on demand.
- **Serverless Inquiry (`[postman] : biz-directory`)**: Sends inquiries for selected (`☑`) companies directly to `sc@sistarcompany.com`.
- **biz-galaxy One-Page Generator**: Automatically generates standalone partner micro-pages inside `biz-galaxy/<chosen-category>/<company-slug>/index.html`.
