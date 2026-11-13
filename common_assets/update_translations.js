const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DOMAINS = [
  "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
  "qubit-biz","biz-galaxy","biz-hub","challengers",
  "partnership","ir-pitchdeck","biz-directory","media"
];

const TARGET_LANGS = ["ko", "id", "vi", "zh-CN", "ja"];
const DELIM = "\n ||| \n";

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

// Fetch with hard 12-second timeout so it NEVER hangs!
async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function translateSingleText(text, tl) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(tl)}&dt=t`;
  const body = new URLSearchParams({ q: text }).toString();
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body
  }, 12000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
  return data[0].map(seg => seg[0] || "").join("");
}

// Translate an array of strings into 1 language in a single bulk POST call (with automatic per-item fallback)
async function translateBulkForLang(strings, tl) {
  const joined = strings.join(DELIM);
  try {
    const bulkOut = await translateSingleText(joined, tl);
    const parts = bulkOut.split(/\s*\|\|\|\s*/);
    if (parts.length === strings.length) {
      return parts.map(p => p.trim());
    }
  } catch (e) {}
  // Fallback to individual parallel calls if bulk split count differed
  return Promise.all(strings.map(async (s) => {
    try { return await translateSingleText(s, tl); } catch (e) { return s; }
  }));
}

async function translateGroup5Langs(strings) {
  const langResults = {};
  await Promise.all(TARGET_LANGS.map(async (lang) => {
    langResults[lang] = await translateBulkForLang(strings, lang);
  }));
  return strings.map((_, idx) => ({
    ko: langResults["ko"][idx],
    id: langResults["id"][idx],
    vi: langResults["vi"][idx],
    "zh-CN": langResults["zh-CN"][idx],
    ja: langResults["ja"][idx]
  }));
}

async function main() {
  const targetMode = process.argv[2] || "sc_web";
  const isMgnt = targetMode === "mgnt";
  const dictPath = isMgnt
    ? path.join(ROOT, "mgnt", "common_assets", "sc_translations.js")
    : path.join(ROOT, "common_assets", "sc_translations.js");

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

  // Group 8 strings per bulk request x 8 concurrent groups = 64 blocks translated every ~1.5 seconds!
  const GROUP_SIZE = 8;
  const CONCURRENCY = 8;
  const groups = [];
  for (let i = 0; i < missing.length; i += GROUP_SIZE) {
    groups.push(missing.slice(i, i + GROUP_SIZE));
  }

  for (let i = 0; i < groups.length; i += CONCURRENCY) {
    const chunk = groups.slice(i, i + CONCURRENCY);
    const totalInRound = chunk.reduce((a, b) => a + b.length, 0);
    const pctDone = Math.round(((i * GROUP_SIZE) / missing.length) * 100);
    process.stdout.write(`  -> [${String(pctDone).padStart(2)}%] Round ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(groups.length / CONCURRENCY)} (${totalInRound} blocks)... `);

    const settled = await Promise.all(chunk.map(async (grp) => {
      try {
        const res = await translateGroup5Langs(grp);
        return { grp, res };
      } catch (e) {
        return { grp, res: [] };
      }
    }));

    let savedInRound = 0;
    for (const item of settled) {
      for (let j = 0; j < item.grp.length; j++) {
        const enKey = item.grp[j];
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

    // Save to disk every 3 rounds or at the very end for maximum speed
    if ((i / CONCURRENCY) % 3 === 0 || (i + CONCURRENCY) >= groups.length) {
      saveDict(dictPath, dict);
    }
    console.log(`SAVED +${savedInRound}/${totalInRound}!`);
  }

  saveDict(dictPath, dict);
  console.log("\n=== [TRANSLATION ENGINE FINISHED] ===");
}

main();
