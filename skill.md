# Tech Stack — *sc biz-directory

## 1. Frontend & Hosting
- **HTML5 / CSS3 / Vanilla JS**: Zero framework overhead, glassmorphic pastel UI (`#f0acf7`, `#acf7f0`, `#f7f0ac`).
- **Hosting & Image CDN**: GitHub (`denniiku/biz-directory`) + Cloudflare Pages (`biz-directory.sistarcompany.com/storage/`).

## 2. Data & Storage Architecture
- **`master_db.csv`**: Single source of truth containing both public fields and private brokerage fields (`raw_website`, `contact_email`, `catalog_url`).
- **`master_db_legacy.csv`**: Reference archive of 235+ pre-extracted exhibition companies and URLs.
- **`directory_data.js`**: Auto-compiled public JSON payload excluding private URLs for local `file://` and web compatibility.
- **`storage/`**: Lightweight resized images (`[id].jpg`, max 600px width, ~30-50KB per file).

## 3. Serverless AI & Email Backend (Google Apps Script)
- **Project**: `[postman] : biz-directory`
- **Webhook URL**: `https://script.google.com/macros/s/AKfycbxD-PwPgkkC4289ddIBBQisgPNZNBrRSjVfJqylMrTQRlF97ERlTUMHh-eSba-yGC4C/exec`
- **Capabilities**:
  1. `action: "inquire"` -> Sends buyer inquiries to `sc@sistarcompany.com` via `MailApp`.
  2. `action: "ai_brief"` -> Calls Gemini API to generate executive summaries and comparisons for selected (`☑`) companies.
  3. Outbound Batch Mailer -> Sends partnership inquiries to supplier emails stored in `master_db.csv`.
