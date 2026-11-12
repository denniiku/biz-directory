const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("  [ERROR] GEMINI_API_KEY environment variable is missing!");
  process.exit(1);
}

const mode = process.argv[2] || "sc_web";
const rootDir = "C:\\projects\\sc_web";
const LANGS = ["ko", "id", "vi", "zh-CN", "ja"];

const targetDirs = mode === "mgnt"
  ? [path.join(rootDir, "mgnt")]
  : [
      "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
      "qubit-biz","biz-galaxy","biz-hub","challengers",
      "partnership","ir-pitchdeck","biz-directory","media"
    ].map(d => path.join(rootDir, d));

const dictFile = mode === "mgnt"
  ? path.join(rootDir, "mgnt", "common_assets", "sc_translations.js")
  : path.join(rootDir, "common_assets", "sc_translations.js");

function decodeEntities(str) {
  return str
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&trade;/g, "\u2122")
    .replace(/&times;/g, "\u00D7")
    .replace(/&rarr;/g, "\u2192")
    .replace(/&rsaquo;/g, "\u203A")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTranslatableStrings(html) {
  const found = new Set();
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const content = mainMatch ? mainMatch[1] : html;

  // 1) Extract standard leaf text tags (never swallowed by outer divs)
  const leafRx = /<(p|li|td|th|blockquote|dd|dt|h2|h3|h4)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = leafRx.exec(content)) !== null) {
    const attrs = m[2] || "";
    const inner = m[3] || "";
    if (/sc-(route|eyebrow|bc-wrap|kicker|tag|num-label|num|stat-big|kpi-val|phrase-pill|test02-h1|main-title|top-bar|math|code)|notranslate/i.test(attrs)) continue;
    if (/<(p|ul|ol|table)\b/i.test(inner)) continue;
    const clean = decodeEntities(inner);
    if (clean.length >= 2 && /[a-zA-Z]{2,}/.test(clean)) found.add(clean);
  }

  // 2) Extract special leaf divs (e.g. .sc-callout, .sc-lead, .sc-sub, etc.) that do not contain child blocks
  const divRx = /<div\b([^>]*)>([\s\S]*?)<\/div>/gi;
  while ((m = divRx.exec(content)) !== null) {
    const attrs = m[1] || "";
    const inner = m[2] || "";
    if (!/sc-(callout|lead|sub|test02-sub|sec-body|sec-title|h2|h3)\b/i.test(attrs)) continue;
    if (/sc-(route|eyebrow|bc-wrap|kicker|tag|num-label|num|stat-big|kpi-val|phrase-pill|test02-h1|main-title|top-bar|math|code)|notranslate/i.test(attrs)) continue;
    if (/<(p|ul|ol|table|div)\b/i.test(inner)) continue;
    const clean = decodeEntities(inner);
    if (clean.length >= 2 && /[a-zA-Z]{2,}/.test(clean)) found.add(clean);
  }

  return Array.from(found);
}

function getAllHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (["common_assets", ".git", ".github", "node_modules"].includes(item.name)) continue;
      getAllHtmlFiles(fullPath, fileList);
    } else if (item.name.toLowerCase().endsWith(".html")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// 1. Load existing dictionary if present
let dict = { "ko": {}, "id": {}, "vi": {}, "zh-CN": {}, "ja": {} };
if (fs.existsSync(dictFile)) {
  try {
    const raw = fs.readFileSync(dictFile, "utf8");
    const jsonStr = raw.replace(/^\s*window\.SC_AI_TRANSLATIONS\s*=\s*/, "").replace(/;\s*$/, "").trim();
    const parsed = JSON.parse(jsonStr);
    for (const l of LANGS) {
      if (parsed[l] && typeof parsed[l] === "object") dict[l] = parsed[l];
    }
  } catch (e) {
    console.log("  - Starting with a clean dictionary object.");
  }
}

// 2. Scan all current HTML files
const activeStrings = new Set();
for (const d of targetDirs) {
  for (const hf of getAllHtmlFiles(d)) {
    const html = fs.readFileSync(hf, "utf8");
    for (const s of extractTranslatableStrings(html)) {
      activeStrings.add(s);
    }
  }
}

// 3. Prune obsolete strings & find missing strings
for (const l of LANGS) {
  for (const existingKey of Object.keys(dict[l])) {
    if (!activeStrings.has(existingKey)) {
      delete dict[l][existingKey];
    }
  }
}

const missing = Array.from(activeStrings).filter(s => LANGS.some(l => !dict[l][s]));

console.log(`  - [${mode}] Total active sentences across web pages: ${activeStrings.size}`);
console.log(`  - [${mode}] Already translated & up-to-date: ${activeStrings.size - missing.length}`);
console.log(`  - [${mode}] New/Modified sentences to translate: ${missing.length}`);

function saveDict() {
  const output = "window.SC_AI_TRANSLATIONS = " + JSON.stringify(dict, null, 2) + ";\n";
  fs.writeFileSync(dictFile, output, "utf8");
}

// Auto-discover the latest available Gemini Flash model from Google API
async function resolveBestGeminiModel() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
        .map(m => m.name.replace(/^models\//, ""));
      if (models.includes("gemini-3.8-flash")) return "gemini-3.8-flash";
      const flash = models.find(m => /gemini-3.*flash/i.test(m)) || models.find(m => /flash/i.test(m)) || models[0];
      if (flash) return flash;
    }
  } catch (e) {}
  return "gemini-3.8-flash";
}

async function translateBatchWithGemini(batch, modelName) {
  const numberedInput = {};
  batch.forEach((txt, idx) => { numberedInput[String(idx)] = txt; });

  const prompt = `You are the Chief Global Communications & Enterprise Strategy Translator for *SC (SISTAR Company), an AI-Native Venture Studio & Cross-Border Commerce Holding Company.

Translate each English string in the input JSON object into 5 target languages:
- "ko": Korean (C-level executive corporate tone, natural Korean enterprise & IR terminology)
- "id": Indonesian (Polished executive corporate Indonesian used in enterprise B2B & venture capital)
- "vi": Vietnamese (Polished executive corporate Vietnamese used in international trade & tech)
- "zh-CN": Simplified Chinese (Polished executive corporate Simplified Chinese)
- "ja": Japanese (Polished executive corporate Japanese / standard business Keigo)

### CRITICAL TRANSLATION & QUALITY GUIDELINES:

1. **STRICT PROPRIETARY GLOSSARY (NEVER TRANSLATE — KEEP EXACT ENGLISH SPELLING, PUNCTUATION & CASE):**
   - Corporate & Universe Brands: \`*sc\`, \`*SC\`, \`SISTAR Company\`, \`SISTAR\`, \`Signal Star Universe\`, \`Signal Star\`, \`*Signal Star\`
   - Core Engines & Domains: \`Qubit Algorithm™\`, \`qubit-algorithm\`, \`intelligence-core\`, \`scarlet-ai\`, \`qubit-biz\`, \`biz-galaxy\`, \`biz-hub\`, \`challengers\`, \`Sistar Challengers\`, \`partnership\`, \`ir-pitchdeck\`, \`biz-directory\`, \`media\`
   - Flagship Projects & Products: \`c.a.n.\` (CRITICAL: NEVER translate "c.a.n." as "can / 할 수 있다 / dapat / có thể" — always keep exact lowercase "c.a.n."), \`ActionNote AI CEO\`, \`CEO Action Note\`, \`exo-brain\`, \`Qubit ERP\`, \`Qubit Bank\`, \`Cosmo Seed\`, \`Spark Exploder\`, \`Galaxify\`, \`Galaxifying\`, \`One Spark, Infinite Galaxifying\`, \`One Task, Multi Outcomes\`
   - Bio-Health & Vet Verticals: \`Animal Bio-Health\`, \`Vet Specialties\`, \`SISTAR MedIX\`, \`SISPet\`, \`SISTAR Dx\`, \`SISPharm\`, \`Scarlet Vet CDSS\`, \`Vet CDSS\`, \`PetCare AI\`, \`PetFood Bank Re:D\`, \`CHD\`, \`SungBo\`, \`Michlo\`, \`Iskhan\`, \`Dazzle\`, \`Zeelice\`
   - Platforms & Currencies: \`Shopee\`, \`Tokopedia\`, \`ASEAN\`, \`Rp\`, \`KRW\`, \`USD\`

2. **CONTEXT-FIRST BUSINESS FLUENCY & NATURAL ENGLISH RETENTION:**
   - Use authentic, high-level business and industry terminology rather than literal word-for-word dictionary translations.
   - Do NOT force-translate English business/tech terms if translating them sounds awkward or loses precision in the target language. Keep standard English business/technical terms in English when natural (e.g., \`Full-Stack\`, \`AI Commerce\`, \`Spaceship\`, \`Venture Studio\`, \`Holding Company\`, \`B2B\`, \`D2C\`, \`SKU\`, \`CDSS\`, \`POCT\`, \`ROI\`, \`KPI\`, \`ERP\`, \`CRM\`, \`Anchor\`, \`Pipeline\`, \`Playbook\`).

Return ONLY a valid JSON object matching the exact input keys ("0", "1", ...) where each value is an object containing {"ko": "...", "id": "...", "vi": "...", "zh-CN": "...", "ja": "..."}.

Input JSON:
${JSON.stringify(numberedInput, null, 2)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`HTTP ${res.status} (${modelName}): ${errBody.substring(0, 180)}`);
  }

  const data = await res.json();
  const rawText = data.candidates[0].content.parts[0].text;
  return JSON.parse(rawText);
}

(async () => {
  if (missing.length === 0) {
    saveDict();
    console.log("  - All translations are already 100% up-to-date!");
    return;
  }

  const activeModel = await resolveBestGeminiModel();
  console.log(`  - Connected to Gemini Model: ${activeModel}`);

  const BATCH_SIZE = 30;
  const batches = [];
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    batches.push(missing.slice(i, i + BATCH_SIZE));
  }

  const CONCURRENCY = 3;
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const group = batches.slice(i, i + CONCURRENCY);
    const rangeStr = `${i + 1}~${Math.min(i + CONCURRENCY, batches.length)}/${batches.length}`;
    process.stdout.write(`  - Translating batches [${rangeStr}] via ${activeModel}... `);

    await Promise.all(group.map(async (batch) => {
      try {
        const resultObj = await translateBatchWithGemini(batch, activeModel);
        for (let j = 0; j < batch.length; j++) {
          const item = resultObj[String(j)];
          if (item) {
            for (const l of LANGS) {
              if (item[l]) dict[l][batch[j]] = item[l];
            }
          }
        }
      } catch (err) {
        console.error(`\n    [Batch Error] ${err.message}`);
      }
    }));

    saveDict();
    console.log("OK & Saved!");
  }

  saveDict();
  console.log(`  - Finished! Final Dictionary size: ${(fs.statSync(dictFile).size / 1024).toFixed(1)} KB`);
})();
