const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-3.1-flash-lite";

const PUBLIC_DOMAINS = [
  "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
  "qubit-biz","biz-galaxy","biz-hub","challengers",
  "partnership","ir-pitchdeck","biz-directory","media"
];

function normalizeKey(str) {
  if (!str) return "";
  return str
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&rarr;/gi, "→")
    .replace(/&larr;/gi, "←")
    .replace(/&bull;/gi, "•")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&trade;/gi, "™")
    .replace(/&times;/gi, "×")
    .replace(/&#[0-9]+;/g, " ")
    .replace(/&[a-zA-Z0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldTranslateBlock(text) {
  if (!text || text.length < 2) return false;
  if (text.length > 3500) return false; // Allow long institutional paragraphs up to 3,500 chars!
  if (!/[a-zA-Z]{2,}/.test(text)) return false;
  if (/^(https?:\/\/|www\.|[0-9.\s%$+\-/,~:;|•→←—–]+)$/i.test(text)) return false;
  return true;
}

function extractTranslatableUnitsFromHtml(html) {
  const units = new Set();
  // Remove script, style, svg, pre, code blocks with notranslate
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<pre[\s\S]*?<\/pre>/gi, "");

  // Extract leaf/editorial blocks: h1-h6, p, li, td, th, div.sc-callout-title, div.sc-kpi-desc, div.sc-panel-kicker, span.sc-chapter-num, span.sc-chapter-tag, span.sc-phrase-pill, a.sc-btn-pdf, button.sc-btn-pdf
  const blockRegex = /<(h[1-6]|p|li|td|th|figcaption|blockquote|a|button|span|div)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = blockRegex.exec(cleaned)) !== null) {
    const attrs = match[2] || "";
    const inner = match[3] || "";
    if (/notranslate|translate\s*=\s*["']no["']|sc-route|sc-math-code|sc-kpi-val/i.test(attrs)) continue;
    // Skip container divs/spans that wrap other block elements
    if (/<(article|section|div|table|ul|ol|p|h[1-6]|svg|pre)\b/i.test(inner)) continue;

    const norm = normalizeKey(inner);
    if (shouldTranslateBlock(norm)) {
      units.add(norm);
    }
  }
  return Array.from(units);
}

function loadDict(dictPath) {
  if (!fs.existsSync(dictPath)) return {};
  const raw = fs.readFileSync(dictPath, "utf8");
  const idx = raw.indexOf("{");
  const lastIdx = raw.lastIndexOf("}");
  if (idx === -1 || lastIdx === -1) return {};
  try {
    const parsed = JSON.parse(raw.substring(idx, lastIdx + 1));
    const langs = ["ko", "id", "vi", "zh-CN", "ja"];
    if (parsed.ko && typeof parsed.ko === "object" && !parsed.ko.ko) {
      const unified = {};
      for (const l of langs) {
        if (parsed[l] && typeof parsed[l] === "object") {
          for (const [enKey, val] of Object.entries(parsed[l])) {
            const nk = normalizeKey(enKey);
            if (!nk) continue;
            if (!unified[nk]) unified[nk] = {};
            unified[nk][l] = val;
          }
        }
      }
      return unified;
    }
    const normalized = {};
    for (const [k, v] of Object.entries(parsed)) {
      const nk = normalizeKey(k);
      if (nk) normalized[nk] = v;
    }
    return normalized;
  } catch (e) {
    return {};
  }
}

function saveDict(dictPath, dictObj) {
  const content = "window.SC_TRANSLATIONS = " + JSON.stringify(dictObj, null, 2) + ";\nwindow.SC_AI_TRANSLATIONS = window.SC_TRANSLATIONS;\n";
  fs.writeFileSync(dictPath, content, "utf8");
}

async function translateBatchWithGemini(batchStrings) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const systemPrompt = `You are an elite institutional financial & technical translator for *SC (SISTAR Company / Signal Star Universe).
Translate the following JSON array of English strings into 5 target languages:
- "ko": Korean (한국어 — 격조 높은 글로벌 VC/엔터프라이즈 비즈니스 한국어)
- "id": Indonesian (Bahasa Indonesia — formal enterprise standard)
- "vi": Vietnamese (Tiếng Việt — formal enterprise standard)
- "zh-CN": Simplified Chinese (简体中文 — formal enterprise standard)
- "ja": Japanese (日本語 — formal enterprise standard)

CRITICAL TRANSLATION RULES (NEVER SKIP A PARAGRAPH!):
1. NEVER skip or leave an entire sentence or paragraph in English! Every single item in the array MUST be fully translated into the target language's grammar and sentence structure.
2. Keep key brand names, proprietary terms, and technical acronyms in English naturally inside the translated sentence when appropriate for context (e.g., *SC, SISTAR Company, Signal Star, Qubit Algorithm™, Cosmo Seed™, Scarlet.ai, Ms. Scarlet, Buy4Me, c.a.n., Qubit ERP, RAG, Vibe Working, SaaS, B2B, D2C, ODM, OEM, K-SURE BNPL, IATA, IADA, t=0, Rp 1,320).
3. However, all surrounding explanations, verbs, clauses, and analytical prose MUST be completely translated so there is zero awkwardness or untranslated English paragraphs.
4. Return ONLY a valid JSON array of objects in the exact same order, where each object has keys: "ko", "id", "vi", "zh-CN", "ja".`;

  const body = {
    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nINPUT_ARRAY:\n" + JSON.stringify(batchStrings) }] }],
    generationConfig: {
      temperature: 0.15,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  return JSON.parse(txt);
}

async function main() {
  const targetMode = process.argv[2] || "sc_web";
  const isMgnt = targetMode === "mgnt";
  const dictPath = isMgnt
    ? path.join(ROOT, "mgnt", "common_assets", "sc_translations.js")
    : path.join(ROOT, "common_assets", "sc_translations.js");

  const dict = loadDict(dictPath);
  const scanDirs = isMgnt
    ? [path.join(ROOT, "mgnt")]
    : PUBLIC_DOMAINS.map(d => path.join(ROOT, d)).filter(d => fs.existsSync(d));

  const allStrings = new Set();
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "common_assets" || entry.name === "storage" || entry.name === ".git" || entry.name === "node_modules") continue;
        walk(full);
      } else if (entry.isFile() && entry.name.toLowerCase() === "index.html") {
        const html = fs.readFileSync(full, "utf8");
        for (const s of extractTranslatableUnitsFromHtml(html)) {
          allStrings.add(s);
        }
      }
    }
  }
  scanDirs.forEach(walk);

  // Identify missing OR previously untranslated (where ko === english key) strings
  const missing = [];
  for (const s of allStrings) {
    const existing = dict[s];
    if (!existing || !existing["ko"] || (s.length > 25 && existing["ko"] === s)) {
      missing.push(s);
    }
  }

  console.log(`[Translation Scan (${targetMode})] Total unique blocks: ${allStrings.size} | New/Untranslated blocks to process: ${missing.length}`);
  saveDict(dictPath, dict);
  if (missing.length === 0 || !API_KEY) {
    if (!API_KEY && missing.length > 0) console.log("  [WARN] GEMINI_API_KEY not set in environment.");
    return;
  }

  const BATCH_SIZE = 25;
  const CONCURRENCY = 4;
  const batches = [];
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    batches.push({ idx: Math.floor(i / BATCH_SIZE) + 1, items: missing.slice(i, i + BATCH_SIZE) });
  }
  const totalBatches = batches.length;

  for (let w = 0; w < batches.length; w += CONCURRENCY) {
    const wave = batches.slice(w, w + CONCURRENCY);
    console.log(`  -> Translating wave ${Math.floor(w / CONCURRENCY) + 1}/${Math.ceil(totalBatches / CONCURRENCY)} (batches ${wave[0].idx}..${wave[wave.length - 1].idx} of ${totalBatches})...`);
    await Promise.all(wave.map(async (b) => {
      try {
        const results = await translateBatchWithGemini(b.items);
        if (Array.isArray(results) && results.length === b.items.length) {
          for (let j = 0; j < b.items.length; j++) {
            if (results[j] && results[j]["ko"]) {
              dict[b.items[j]] = results[j];
            }
          }
          console.log(`     [Batch ${b.idx}/${totalBatches}] OK (${b.items.length} blocks)`);
        } else {
          console.log(`     [Batch ${b.idx}/${totalBatches}] MISMATCH (${Array.isArray(results) ? results.length : 0}/${b.items.length})`);
        }
      } catch (err) {
        console.log(`     [Batch ${b.idx}/${totalBatches}] ERROR: ${err.message}`);
      }
    }));
    saveDict(dictPath, dict);
  }
}

main();
