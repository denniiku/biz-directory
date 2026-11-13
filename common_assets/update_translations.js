const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.GEMINI_API_KEY || "";
let CANDIDATE_MODELS = [];
let CURRENT_MODEL_IDX = 0;

const PUBLIC_DOMAINS = [
  "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
  "qubit-biz","biz-galaxy","biz-hub","challengers",
  "partnership","ir-pitchdeck","biz-directory","media"
];

async function initModels() {
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  const res = await fetch(listUrl);
  if (!res.ok) throw new Error(`Failed to list models: HTTP ${res.status}`);
  const data = await res.json();
  const available = (data.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map(m => m.name.replace("models/", ""))
    .filter(m => m.includes("flash") && !m.includes("image") && !m.includes("tts") && !m.includes("audio") && !m.includes("thinking"));

  // Prefer stable high-quota models first, then preview models
  const priority = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-3-flash"];
  for (const p of priority) {
    for (const m of available) {
      if ((m === p || m.startsWith(p)) && !CANDIDATE_MODELS.includes(m)) {
        CANDIDATE_MODELS.push(m);
      }
    }
  }
  for (const m of available) {
    if (!CANDIDATE_MODELS.includes(m)) CANDIDATE_MODELS.push(m);
  }
  if (CANDIDATE_MODELS.length === 0) CANDIDATE_MODELS = ["gemini-2.0-flash"];
}

function getActiveModel() {
  return CANDIDATE_MODELS[CURRENT_MODEL_IDX % CANDIDATE_MODELS.length];
}

function rotateModel() {
  if (CANDIDATE_MODELS.length > 1) {
    CURRENT_MODEL_IDX = (CURRENT_MODEL_IDX + 1) % CANDIDATE_MODELS.length;
    console.log(`    [SWITCH MODEL] Switched to -> ${getActiveModel()}`);
  }
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(p|div|li|tr|td|th|h[1-6])\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&rarr;/gi, "\u2192")
    .replace(/&larr;/gi, "\u2190")
    .replace(/&harr;/gi, "\u2194")
    .replace(/&rArr;/gi, "\u21D2")
    .replace(/&bull;/gi, "\u2022")
    .replace(/&mdash;/gi, "\u2014")
    .replace(/&ndash;/gi, "\u2013")
    .replace(/&rsquo;/gi, "\u2019")
    .replace(/&lsquo;/gi, "\u2018")
    .replace(/&ldquo;/gi, "\u201C")
    .replace(/&rdquo;/gi, "\u201D")
    .replace(/&trade;/gi, "\u2122")
    .replace(/&times;/gi, "\u00D7")
    .replace(/&otimes;/gi, "\u2297")
    .replace(/&Sigma;/g, "\u03A3")
    .replace(/&Delta;/g, "\u0394")
    .replace(/&Psi;/g, "\u03A8")
    .replace(/&Phi;/g, "\u03A6")
    .replace(/&psi;/g, "\u03C8")
    .replace(/&phi;/g, "\u03C6")
    .replace(/&rho;/g, "\u03C1")
    .replace(/&omega;/g, "\u03C9")
    .replace(/&langle;/gi, "\u27E8")
    .replace(/&rangle;/gi, "\u27E9")
    .replace(/&radic;/gi, "\u221A")
    .replace(/&int;/gi, "\u222B")
    .replace(/&approx;/gi, "\u2248")
    .replace(/&forall;/gi, "\u2200")
    .replace(/&isin;/gi, "\u2208")
    .replace(/&dagger;/gi, "\u2020")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

function shouldTranslateBlock(text) {
  if (!text || text.length < 2) return false;
  if (!/[a-zA-Z]{2,}/.test(text)) return false;
  if (/^(https?:\/\/|www\.|[0-9.\s%$+\-/,~:;|•→←—–]+)$/i.test(text)) return false;
  return true;
}

function isKoreanProperlyTranslated(enText, koText) {
  if (!koText || typeof koText !== "string") return false;
  if (koText.trim() === enText.trim()) return false;
  if (enText.length > 35) {
    const hangulMatches = koText.match(/[\uAC00-\uD7AF]/g);
    const hangulCount = hangulMatches ? hangulMatches.length : 0;
    if (hangulCount < 4) return false;
  }
  return true;
}

function extractTranslatableUnitsFromHtml(html) {
  const units = new Set();
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<pre[\s\S]*?<\/pre>/gi, "");

  const tags = ["h1","h2","h3","h4","h5","h6","p","li","td","th","figcaption","blockquote","a","button","span","div"];
  for (const tag of tags) {
    const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
    let match;
    while ((match = re.exec(cleaned)) !== null) {
      const attrs = match[1] || "";
      const inner = match[2] || "";
      if (/notranslate|translate\s*=\s*["']no["']|sc-route|sc-math-code|sc-kpi-val/i.test(attrs)) continue;
      if (/<(article|section|div|table|thead|tbody|tr|ul|ol|p|h[1-6]|svg|pre)\b/i.test(inner)) continue;

      const norm = decodeHtmlEntities(inner);
      if (shouldTranslateBlock(norm)) {
        units.add(norm);
      }
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
    return JSON.parse(raw.substring(idx, lastIdx + 1));
  } catch (e) {
    return {};
  }
}

function saveDict(dictPath, dictObj) {
  const content = "window.SC_TRANSLATIONS = " + JSON.stringify(dictObj, null, 2) + ";\n";
  fs.writeFileSync(dictPath, content, "utf8");
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function translateBatchWithGemini(batchStrings, attempt = 1) {
  const model = getActiveModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const systemPrompt = `You are the Chief Institutional Translator for *SC (SISTAR Company).
Translate the following JSON array of ${batchStrings.length} English strings into 5 languages:
- "ko": Korean (한국어 — 자연스러운 격조 높은 비즈니스 한국어)
- "id": Indonesian (Bahasa Indonesia)
- "vi": Vietnamese (Tiếng Việt)
- "zh-CN": Simplified Chinese (简体中文)
- "ja": Japanese (日本語)

RULES:
1. Translate the full sentence structure into each target language.
2. Keep brand names/math in English (*SC, SISTAR, Qubit Algorithm™, Cosmo Seed™, One Spark, Vibe Working, K-SURE BNPL, t=0, Rp 1,320).
3. Return ONLY a valid JSON array of EXACTLY ${batchStrings.length} objects with keys: "ko", "id", "vi", "zh-CN", "ja".`;

  const body = {
    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nINPUT_ARRAY:\n" + JSON.stringify(batchStrings) }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
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
    if (res.status === 429 || res.status === 503) {
      rotateModel();
      if (attempt <= 3) {
        await sleep(4000 * attempt);
        return translateBatchWithGemini(batchStrings, attempt + 1);
      }
    }
    throw new Error(`HTTP ${res.status} (${model}): ${errText.substring(0, 90)}`);
  }

  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  return JSON.parse(txt);
}

async function main() {
  const targetMode = process.argv[2] || "sc_web";
  const maxBatchesArg = parseInt(process.argv[3] || "9999", 10);
  const isMgnt = targetMode === "mgnt";
  const dictPath = isMgnt
    ? path.join(ROOT, "mgnt", "common_assets", "sc_translations.js")
    : path.join(ROOT, "common_assets", "sc_translations.js");

  if (!API_KEY) {
    console.log("  [ERROR] GEMINI_API_KEY is not set.");
    return;
  }

  await initModels();
  console.log(`\n=== [AVAILABLE FLASH MODELS]: ${CANDIDATE_MODELS.join(" -> ")} ===`);

  const dict = loadDict(dictPath);
  const domainFilter = (!isMgnt && targetMode !== "sc_web") ? [targetMode] : PUBLIC_DOMAINS;
  const scanDirs = isMgnt
    ? [{ name: "mgnt", dir: path.join(ROOT, "mgnt") }]
    : domainFilter.map(d => ({ name: d, dir: path.join(ROOT, d) })).filter(x => fs.existsSync(x.dir));

  const allStrings = new Set();
  console.log("\n=== DOMAIN-BY-DOMAIN TRANSLATION AUDIT ===");

  for (const item of scanDirs) {
    const domStrings = new Set();
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (["common_assets", "storage", ".git", "node_modules", ".github"].includes(entry.name)) continue;
          walk(full);
        } else if (entry.isFile() && entry.name.toLowerCase() === "index.html") {
          const html = fs.readFileSync(full, "utf8");
          for (const s of extractTranslatableUnitsFromHtml(html)) {
            domStrings.add(s);
            allStrings.add(s);
          }
        }
      }
    }
    walk(item.dir);

    let domMissing = 0;
    for (const s of domStrings) {
      const ex = dict[s];
      if (!ex || !isKoreanProperlyTranslated(s, ex["ko"])) domMissing++;
    }
    const doneCount = domStrings.size - domMissing;
    const pct = domStrings.size > 0 ? Math.round((doneCount / domStrings.size) * 100) : 100;
    console.log(`  [${item.name.padEnd(18)}] Total: ${String(domStrings.size).padStart(4)} | Translated: ${String(doneCount).padStart(4)} | Missing: ${String(domMissing).padStart(4)} (${pct}%)`);
  }

  const missing = [];
  for (const s of allStrings) {
    const existing = dict[s];
    if (!existing || !isKoreanProperlyTranslated(s, existing["ko"])) {
      missing.push(s);
    }
  }

  console.log(`\n[SUMMARY] Scanned: ${allStrings.size} | Missing: ${missing.length}\n`);
  if (missing.length === 0 || maxBatchesArg === 0) return;

  // Smaller batch size (8 blocks) prevents 5-language JSON output truncation!
  const BATCH_SIZE = 8;
  const CONCURRENCY = 3;
  const batches = [];
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    batches.push(missing.slice(i, i + BATCH_SIZE));
  }

  const limit = Math.min(batches.length, maxBatchesArg);
  for (let i = 0; i < limit; i += CONCURRENCY) {
    const chunk = batches.slice(i, Math.min(i + CONCURRENCY, limit));
    const rangeStr = `Batches ${i + 1}..${i + chunk.length}/${batches.length}`;
    process.stdout.write(`  -> [${getActiveModel()}] ${rangeStr} (${chunk.reduce((a,b)=>a+b.length,0)} blocks)... `);

    let lastErr = "";
    const promises = chunk.map(async (batch) => {
      try {
        const res = await translateBatchWithGemini(batch);
        if (Array.isArray(res) && res.length === batch.length) {
          return { batch, res, ok: true };
        } else {
          lastErr = `Length mismatch (${Array.isArray(res) ? res.length : 0}/${batch.length})`;
        }
      } catch (e) {
        lastErr = e.message;
      }
      return { batch, res: null, ok: false };
    });

    const settled = await Promise.all(promises);
    let savedInRound = 0;
    for (const item of settled) {
      if (item.ok) {
        for (let j = 0; j < item.batch.length; j++) {
          if (item.res[j] && item.res[j]["ko"]) {
            dict[item.batch[j]] = item.res[j];
            savedInRound++;
          }
        }
      }
    }
    if (savedInRound > 0) {
      saveDict(dictPath, dict);
      console.log(`SAVED +${savedInRound} blocks!`);
    } else {
      console.log(`0 saved (${lastErr.substring(0, 70)})`);
      rotateModel();
      await sleep(3000);
    }
  }
}

main();
