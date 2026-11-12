const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const mode = process.argv[2] || "sc_web"; // "sc_web" or "mgnt"
const rootDir = "C:\\projects\\sc_web";

const targetDomains = mode === "mgnt"
  ? [path.join(rootDir, "mgnt")]
  : [
      "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
      "qubit-biz","biz-galaxy","biz-hub","challengers",
      "partnership","ir-pitchdeck","biz-directory","media"
    ].map(d => path.join(rootDir, d));

const dictPath = mode === "mgnt"
  ? path.join(rootDir, "mgnt", "common_assets", "sc_translations.js")
  : path.join(rootDir, "common_assets", "sc_translations.js");

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
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
    .replace(/&nbsp;/g, " ");
}

function cleanCompareKey(s) {
  return (s || "")
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/[\u201C\u201D"]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTextsFromHtml(html) {
  const results = new Set();
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const body = mainMatch ? mainMatch[1] : html;

  // Match leaf blocks: p, li, td, th, blockquote, dd, dt, h2, h3, h4, and key sc-* classes
  const blockRegex = /<(p|li|td|th|blockquote|dd|dt|h2|h3|h4|div)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = blockRegex.exec(body)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    const inner = m[3] || "";

    if (tag === "div" && !/sc-(callout|lead|sub|test02-sub|sec-body|sec-title|h2|h3)\b/i.test(attrs)) continue;
    if (/sc-(route|eyebrow|bc-wrap|kicker|tag|num-label|num|stat-big|kpi-val|phrase-pill|test02-h1|main-title|top-bar|math|code)|notranslate/i.test(attrs)) continue;
    if (/<(p|ul|ol|table)\b/i.test(inner)) continue;

    const textOnly = decodeEntities(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (textOnly.length >= 2 && /[a-zA-Z]{2,}/.test(textOnly)) {
      results.add(textOnly);
    }
  }
  return Array.from(results);
}

function walkHtmlFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "common_assets" || entry.name === ".git" || entry.name === ".github") continue;
      walkHtmlFiles(full, list);
    } else if (entry.name.endsWith(".html")) {
      list.push(full);
    }
  }
  return list;
}

// Load existing dictionary
let dict = { "ko": {}, "id": {}, "vi": {}, "zh-CN": {}, "ja": {} };
if (fs.existsSync(dictPath)) {
  try {
    const raw = fs.readFileSync(dictPath, "utf8");
    const jsonPart = raw.replace(/^[\s\S]*?window\.SC_AI_TRANSLATIONS\s*=\s*(?:window\.SC_AI_TRANSLATIONS\s*\|\|\s*)?/, "").replace(/;\s*$/, "").trim();
    const parsed = JSON.parse(jsonPart);
    for (const lang of ["ko", "id", "vi", "zh-CN", "ja"]) {
      if (parsed[lang]) dict[lang] = parsed[lang];
    }
  } catch (e) {
    console.log("  - Starting with fresh dictionary structure.");
  }
}

// Fix any existing "할 수 있다." in dictionary
for (const lang of Object.keys(dict)) {
  for (const k of Object.keys(dict[lang])) {
    dict[lang][k] = dict[lang][k]
      .replace(/할\s*수\s*있다\.?\s*-\s*ActionNote/g, "c.a.n. - ActionNote")
      .replace(/\|\s*할\s*수\s*있다\.?/g, "| c.a.n.");
  }
}

const allStrings = new Set();
for (const d of targetDomains) {
  const htmlFiles = walkHtmlFiles(d);
  for (const hf of htmlFiles) {
    const content = fs.readFileSync(hf, "utf8");
    for (const s of extractTextsFromHtml(content)) {
      allStrings.add(s);
    }
  }
}

const existingNormKeys = new Set(Object.keys(dict["ko"] || {}).map(cleanCompareKey));
const missingStrings = Array.from(allStrings).filter(s => !existingNormKeys.has(cleanCompareKey(s)));

console.log(`  - Total unique English blocks scanned (${mode}): ${allStrings.size}`);
console.log(`  - Already in sc_translations.js: ${allStrings.size - missingStrings.length}`);
console.log(`  - New/Updated sentences to translate via Gemini API: ${missingStrings.length}`);

async function callGeminiBatch(batch) {
  const prompt = `You are the official enterprise translator for *SC (SISTAR Company).
Translate the following JSON array of English strings into 5 languages:
- "ko": Korean (Professional executive business tone, natural corporate Korean)
- "id": Indonesian (Formal corporate Indonesian)
- "vi": Vietnamese (Formal corporate Vietnamese)
- "zh-CN": Simplified Chinese (Formal corporate Simplified Chinese)
- "ja": Japanese (Formal corporate Japanese / Keigo)

CRITICAL GLOSSARY RULES (NEVER TRANSLATE THESE PROPRIETARY TERMS; KEEP EXACT ENGLISH SPELLING & CASE):
- c.a.n. (Never translate as "can" or "할 수 있다" — always keep exact string "c.a.n.")
- ActionNote AI CEO
- CEO Action Note
- Sistar Challengers
- Vet Specialties
- Animal Bio-Health
- exo-brain
- *sc / *SC / SISTAR Company
- Signal Star Universe / Signal Star
- Qubit Algorithm™ / qubit-algorithm
- qubit-biz / Qubit ERP / Qubit Bank
- scarlet-ai / intelligence-core / biz-galaxy / biz-hub / biz-directory
- Cosmo Seed / Spark Exploder / Galaxify

Return ONLY a valid JSON object with keys "ko", "id", "vi", "zh-CN", "ja", where each value is a JSON array of translated strings in the EXACT same order and length (${batch.length} items) as the input array.

Input JSON Array:
${JSON.stringify(batch)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
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
    const errText = await res.text();
    throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawJson = data.candidates[0].content.parts[0].text;
  return JSON.parse(rawJson);
}

function saveDictionary() {
  const out = "window.SC_AI_TRANSLATIONS = " + JSON.stringify(dict, null, 2) + ";\n";
  fs.writeFileSync(dictPath, out, "utf8");
}

(async () => {
  const BATCH_SIZE = 25;
  for (let i = 0; i < missingStrings.length; i += BATCH_SIZE) {
    const batch = missingStrings.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(missingStrings.length / BATCH_SIZE);
    process.stdout.write(`  - Translating batch ${batchNum}/${totalBatches} (${batch.length} sentences)... `);
    try {
      const translatedObj = await callGeminiBatch(batch);
      for (const lang of ["ko", "id", "vi", "zh-CN", "ja"]) {
        const arr = translatedObj[lang];
        if (Array.isArray(arr)) {
          for (let j = 0; j < batch.length; j++) {
            if (arr[j]) {
              dict[lang][batch[j]] = arr[j]
                .replace(/할\s*수\s*있다\.?\s*-\s*ActionNote/g, "c.a.n. - ActionNote")
                .replace(/\|\s*할\s*수\s*있다\.?/g, "| c.a.n.");
            }
          }
        }
      }
      saveDictionary();
      console.log("Done & Saved!");
    } catch (err) {
      console.log("Failed: " + err.message);
    }
  }
  saveDictionary();
  console.log("  - Successfully updated static translation file: " + dictPath);
})();
