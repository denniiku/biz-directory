# Operational Skills & Workflows — *sc biz-directory

## Skill 1: 2-Hop Directory Webpage Harvesting
- **Trigger**: Provide an exhibition exhibitor list URL or directory webpage URL to the AI assistant (or run the harvester script).
- **Process**:
  1. Extract all company names and their external homepage URLs from the list page.
  2. Visit each company homepage to fetch main product images into `biz-directory/storage/[id].jpg`.
  3. Summarize offerings into bullet points (`• Overview`, `• Key Products`, `• Certifications`) and append to `master_db.csv`.

## Skill 2: Updating `master_db.csv` Manually or via Legacy List
- Copy desired rows from `master_db_legacy.csv` into `master_db.csv` or edit `master_db.csv` directly.
- Run `C:\projects\sc_web\sync_all.ps1` to auto-compile `directory_data.js` and push to GitHub.

## Skill 3: Generating `biz-galaxy` Partner One-Page Micro-Sites
- Select a target company and choose a category folder under `C:\projects\sc_web\biz-galaxy\`.
- Run the generator to create `biz-galaxy/<category>/<company-slug>/index.html` and link `target_url` in `master_db.csv`.
