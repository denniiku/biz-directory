const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.GEMINI_API_KEY || "";
let WORKING_GEMINI_MODEL = "";

const PUBLIC_DOMAINS = [
  "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
  "qubit-biz","biz-galaxy","biz-hub","challengers",
  "partnership","ir-pitchdeck","biz-directory","media"
];

const TARGET_LANGS = ["ko", "id", "vi", "zh-CN", "ja"];

// Step 1: Actually test candidate models with a 1-word live request to guarantee 100% working model!
async function findVerifiedWorkingGeminiModel() {
  if (!API_KEY) return "";
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    if (!listRes.ok) {
      console.log(`  [PROBE] Model list HTTP ${listRes.status}`);
      return "";
    }
    const data = await listRes.json();
    const allModels = (data.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map(m => m.name.replace("models/", ""))
      .filter(m => m.includes("flash") && !m.includes("image") && !m.includes("tts") && !m.includes("audio") && !m.includes("thinking"));

    // Prioritize latest live models (skipping deprecated 2.5-flash if it 404s)
    const testOrder = [
      "gemini-3-flash-preview",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite-preview",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      ...allModels
    ];
    const uniqueOrder = [...new Set(testOrder)].filter(m => allModels.includes(m));

    console.log(`  [PROBE] Testing live generation across candidates: ${uniqueOrder.slice(0, 6).join(", ")}...`);
    for (const model of uniqueOrder) {
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const res = await fetch(testUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Reply OK" }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        });
        if (res.ok) {
          console.log(`  [PROBE SUCCESS] Model '${model}' responded HTTP 200 OK!`);
          return model;
        } else {
          const errTxt = await res.text();
          console.log(`  [PROBE SKIP] '${model}' -> HTTP ${res.status} (${errTxt.replace(/\s+/g, " ").substring(0, 70)})`);
        }
      } catch (e) {
        console.log(`  [PROBE ERR] '${model}' -> ${e.message}`);
      }
    }
  } catch (err) {
    console.log(`  [PROBE FAILED] ${err.message}`);
  }
  return "";
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
  try { return JSON.parse(raw.substring(idx, lastIdx + 1)); } catch (e) { return {}; }
}

function saveDict(dictPath, dictObj) {
  const content = "window.SC_TRANSLATIONS = " + JSON.stringify(dictObj, null, 2) + ";\n";
  fs.writeFileSync(dictPath, content, "utf8");
}

// High-speed GTX Neural fallback so 0 blocks are EVER skipped!
async function gtxTranslateSingle(text, tl) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GTX HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
  return data[0].map(seg => seg[0] || "").join("");
}

async function gtxTranslateBatch(batchStrings) {
  return Promise.all(batchStrings.map(async (enText) => {
    const obj = {};
    await Promise.all(TARGET_LANGS.map(async (lang) => {
      try {
        obj[lang] = await gtxTranslateSingle(enText, lang);
      } catch (e) {
        obj[lang] = enText;
      }
    }));
    return obj;
  }));
}

async function geminiTranslateBatch(batchStrings) {
  if (!WORKING_GEMINI_MODEL) throw new Error("No verified Gemini model");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${WORKING_GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const systemPrompt = `You are the Chief Institutional Translator for *SC (SISTAR Company).
Translate the following JSON array of ${batchStrings.length} English strings into 5 target languages:
- "ko": Korean (한국어 — 격조 높은 글로벌 비즈니스 한국어)
- "id": Indonesian (Bahasa Indonesia)
- "vi": Vietnamese (Tiếng Việt)
- "zh-CN": Simplified Chinese (简体中文)
- "ja": Japanese (日本語)

Keep proprietary brand names/math in English (*SC, SISTAR, Qubit Algorithm™, Cosmo Seed™, One Spark, Vibe Working, K-SURE BNPL, t=0, Rp 1,320).
Return ONLY a valid JSON array of EXACTLY ${batchStrings.length} objects with keys: "ko", "id", "vi", "zh-CN", "ja".`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nINPUT_ARRAY:\n" + JSON.stringify(batchStrings) }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}`);
  }
  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const parsed = JSON.parse(txt);
  if (!Array.isArray(parsed) || parsed.length !== batchStrings.length) {
    throw new Error(`Length mismatch`);
  }
  return parsed;
}

async function main() {
  const targetMode = process.argv[2] || "sc_web";
  const isMgnt = targetMode === "mgnt";
  const dictPath = isMgnt
    ? path.join(ROOT, "mgnt", "common_assets", "sc_translations.js")
    : path.join(ROOT, "common_assets", "sc_translations.js");

  console.log("\n=== [STEP 1] Live Probing Gemini API Models ===");
  WORKING_GEMINI_MODEL = await findVerifiedWorkingGeminiModel();
  if (WORKING_GEMINI_MODEL) {
    console.log(`=== [PRIMARY ENGINE]: Gemini (${WORKING_GEMINI_MODEL}) + Instant GTX Backup ===`);
  } else {
    console.log(`=== [PRIMARY ENGINE]: Direct High-Speed GTX Neural Engine (Gemini API Key Quota/Billing Pending) ===`);
  }

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
      if (!ex || !isKoreanProperlyTranslated(s, ex["ko"]) || !ex["id"] || ex["id"] === s) domMissing++;
    }
    const doneCount = domStrings.size - domMissing;
    const pct = domStrings.size > 0 ? Math.round((doneCount / domStrings.size) * 100) : 100;
    console.log(`  [${item.name.padEnd(18)}] Total: ${String(domStrings.size).padStart(4)} | Translated: ${String(doneCount).padStart(4)} | Missing: ${String(domMissing).padStart(4)} (${pct}%)`);
  }

  const missing = [];
  for (const s of allStrings) {
    const ex = dict[s];
    if (!ex || !isKoreanProperlyTranslated(s, ex["ko"]) || !ex["id"] || ex["id"] === s) {
      missing.push(s);
    }
  }

  console.log(`\n[SUMMARY] Scanned: ${allStrings.size} | Missing: ${missing.length}\n`);
  if (missing.length === 0) {
    console.log("  [100% COMPLETE] Every single block across all 12 domains is translated!");
    return;
  }

  const BATCH_SIZE = 8;
  const CONCURRENCY = 4; // 32 blocks per round
  const batches = [];
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    batches.push(missing.slice(i, i + BATCH_SIZE));
  }

  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = batches.slice(i, i + CONCURRENCY);
    const rangeStr = `Batches ${i + 1}..${Math.min(i + CONCURRENCY, batches.length)}/${batches.length}`;
    const totalInChunk = chunk.reduce((a, b) => a + b.length, 0);
    process.stdout.write(`  -> Translating ${rangeStr} (${totalInChunk} blocks)... `);

    const settled = await Promise.all(chunk.map(async (batch) => {
      // Try verified Gemini model first; if it fails or truncates, seamlessly complete via GTX Neural so 0 blocks are ever lost!
      if (WORKING_GEMINI_MODEL) {
        try {
          const gemRes = await geminiTranslateBatch(batch);
          return { batch, res: gemRes, engine: "Gemini" };
        } catch (e) {
          if (e.message.includes("402") || e.message.includes("429")) {
            WORKING_GEMINI_MODEL = ""; // Switch remaining batches to high-speed GTX without waiting
          }
        }
      }
      const gtxRes = await gtxTranslateBatch(batch);
      return { batch, res: gtxRes, engine: "GTX-Neural" };
    }));

    let savedInRound = 0;
    let enginesUsed = new Set();
    for (const item of settled) {
      enginesUsed.add(item.engine);
      for (let j = 0; j < item.batch.length; j++) {
        const enKey = item.batch[j];
        const newEntry = item.res[j];
        if (newEntry && newEntry["ko"] && newEntry["ko"] !== enKey) {
          if (dict[enKey] && isKoreanProperlyTranslated(enKey, dict[enKey]["ko"])) {
            newEntry["ko"] = dict[enKey]["ko"];
          }
          dict[enKey] = newEntry;
          savedInRound++;
        }
      }
    }

    saveDict(dictPath, dict);
    console.log(`SAVED +${savedInRound}/${totalInChunk} blocks! [${Array.from(enginesUsed).join("+")}]`);
  }
}

main();
