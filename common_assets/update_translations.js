const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash";

// Master Governance v2.0 Guardrails
const BATCH_SIZE = 12;          // 문맥 품질과 출력 안정성의 황금 균형점 (12문장 x 5개국어 = 60문장)
const THINKING_BUDGET = 512;    // 학술·금융 전문용어 추론 품질 유지 + 추론 토큰 폭탄 방지
const DELAY_MS = 2500;          // 429 Rate Limit 예방용 순차 대기 (2.5초)
const MAX_API_CALLS = 80;       // 1회 실행당 최대 API 호출 안전 브레이크

const ALL_DOMAINS = [
  "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
  "qubit-biz","biz-galaxy","biz-hub","challengers",
  "partnership","ir-pitchdeck","biz-directory","media"
];

function normalizeText(str) {
  if (!str) return "";
  return str
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(p|div|li|tr|td|th|h[1-6])\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&rarr;/gi, "\u2192").replace(/&larr;/gi, "\u2190").replace(/&harr;/gi, "\u2194").replace(/&rArr;/gi, "\u21D2")
    .replace(/&bull;/gi, "\u2022").replace(/&mdash;/gi, "\u2014").replace(/&ndash;/gi, "\u2013")
    .replace(/&rsquo;/gi, "\u2019").replace(/&lsquo;/gi, "\u2018").replace(/&ldquo;/gi, "\u201C").replace(/&rdquo;/gi, "\u201D")
    .replace(/&trade;/gi, "\u2122").replace(/&times;/gi, "\u00D7").replace(/&otimes;/gi, "\u2297")
    .replace(/&Sigma;/g, "\u03A3").replace(/&Delta;/g, "\u0394").replace(/&Psi;/g, "\u03A8").replace(/&Phi;/g, "\u03A6")
    .replace(/&psi;/g, "\u03C8").replace(/&phi;/g, "\u03C6").replace(/&rho;/g, "\u03C1").replace(/&omega;/g, "\u03C9")
    .replace(/&langle;/gi, "\u27E8").replace(/&rangle;/gi, "\u27E9").replace(/&radic;/gi, "\u221A").replace(/&int;/gi, "\u222B")
    .replace(/&approx;/gi, "\u2248").replace(/&forall;/gi, "\u2200").replace(/&isin;/gi, "\u2208").replace(/&dagger;/gi, "\u2020")
    .replace(/&gt;/gi, ">").replace(/&lt;/gi, "<")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

function shouldTranslate(text) {
  if (!text || text.length < 3) return false;
  if (!/[a-zA-Z]{2,}/.test(text)) return false;
  if (/^(https?:\/\/|www\.|[0-9.\s%$+\-/,~:;|•→←—–()[\]{}<>=×⊗∑ΔΨΦψφρω√∫≈∀∈†]+)$/i.test(text)) return false;
  if (/^(SCK|SCI|SCV|SCJ|SCC|SCU|SCS|SCIND|IATA|IADA|BNPL|K-SURE|WKB|L1|L2|L3|B2B|B2C|D2C|SaaS|API|SDK|ROI|KPI|PDF|SVG|HTML|CSS|JS)$/i.test(text)) return false;
  return true;
}

function isKoTranslated(en, ko) {
  if (!ko || typeof ko !== "string") return false;
  if (ko.trim() === en.trim()) return false;
  if (en.length > 30) {
    const m = ko.match(/[\uAC00-\uD7AF]/g);
    if (!m || m.length < 3) return false;
  }
  return true;
}

function extractFromHtml(html) {
  const units = new Set();
  const cleaned = html
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
      if (/notranslate|translate\s*=\s*["']no["']|sc-route|sc-math-code/i.test(attrs)) continue;
      if (/<(article|section|div|table|thead|tbody|tr|ul|ol|p|h[1-6]|svg|pre)\b/i.test(inner)) continue;
      const norm = normalizeText(inner);
      if (shouldTranslate(norm)) units.add(norm);
    }
  }
  return Array.from(units);
}

function loadDict(dictPath) {
  if (!fs.existsSync(dictPath)) return {};
  const raw = fs.readFileSync(dictPath, "utf8");
  const i = raw.indexOf("{");
  const j = raw.lastIndexOf("}");
  if (i === -1 || j === -1) return {};
  try { return JSON.parse(raw.substring(i, j + 1)); } catch (e) { return {}; }
}

function saveDict(dictPath, dictObj) {
  fs.writeFileSync(dictPath, "window.SC_TRANSLATIONS = " + JSON.stringify(dictObj, null, 2) + ";\n", "utf8");
}

async function fetchWithTimeout(url, options, ms = 35000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

async function geminiBatchTranslate(batchStrings, retryCount = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  
  const indexedInput = {};
  batchStrings.forEach((s, idx) => { indexedInput[String(idx)] = s; });

  const prompt = `You are the Chief Localization Architect for *SC (Sistar Company).
Translate the following JSON object of English strings (keys "0" to "${batchStrings.length - 1}") into 5 languages: "ko" (Korean), "id" (Indonesian), "vi" (Vietnamese), "zh-CN" (Simplified Chinese), and "ja" (Japanese).

[STRICT QUALITY & GLOSSARY RULES]
1. Executive Tone: Use institutional-grade Goldman Sachs / Palantir / Quantum Physics academic-business terminology. Never use awkward literal translations.
2. Protected Brand & Architecture Terms: Keep "*SC", "SISTAR", "Qubit Algorithm™", "Cosmo Seed™", "Vibe Working", "K-SURE BNPL", "WKB Tunneling", "IATA", "IADA", and regional node codes ("SCK", "SCI", "SCV", "SCJ", "SCC", "SCU", "SCS", "SCIND") intact or accurately contextualized.
3. Zero-Loss Key Mapping: Return ONLY a valid JSON object where each key ("0", "1", ...) maps to an object with keys {"ko", "id", "vi", "zh-CN", "ja"}.

Input JSON:
` + JSON.stringify(indexedInput, null, 2);

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: THINKING_BUDGET }
      }
    })
  }, 35000);

  if (res.status === 429 && retryCount < 2) {
    const waitSec = (retryCount + 1) * 12;
    process.stdout.write(`[429 대기 ${waitSec}s]... `);
    await new Promise(r => setTimeout(r, waitSec * 1000));
    return geminiBatchTranslate(batchStrings, retryCount + 1);
  }

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.substring(0, 80)}`);
  }

  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(txt);
}

async function main() {
  const targetArg = (process.argv[2] || "all").toLowerCase();
  const targetDomains = targetArg === "all" ? ALL_DOMAINS : [targetArg];
  const dictPath = path.join(ROOT, "common_assets", "sc_translations.js");
  const dict = loadDict(dictPath);

  const allStrings = new Set();
  for (const d of targetDomains) {
    const domDir = path.join(ROOT, d);
    if (!fs.existsSync(domDir)) continue;
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (["common_assets", "storage", ".git", "node_modules", ".github"].includes(entry.name)) continue;
          walk(full);
        } else if (entry.isFile() && entry.name.toLowerCase() === "index.html") {
          const html = fs.readFileSync(full, "utf8");
          for (const s of extractFromHtml(html)) allStrings.add(s);
        }
      }
    }
    walk(domDir);
  }

  const missing = [];
  for (const s of allStrings) {
    const ex = dict[s];
    if (!ex || !isKoTranslated(s, ex.ko) || !ex.id || ex.id === s) {
      missing.push(s);
    }
  }

  console.log(`\n=== [*SC TRANSLATION ENGINE v2.0 | Target: ${targetArg.toUpperCase()}] ===`);
  console.log(`Total Unique Strings: ${allStrings.size} | Already Translated: ${allStrings.size - missing.length} | Missing: ${missing.length}`);

  if (missing.length > 0 && !API_KEY) {
    console.log("[안내] GEMINI_API_KEY가 설정되지 않아 번역 요청을 건너뛰고 사전 동기화만 수행합니다.");
  } else if (missing.length > 0) {
    const batches = [];
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      batches.push(missing.slice(i, i + BATCH_SIZE));
    }

    const limitBatches = Math.min(batches.length, MAX_API_CALLS);
    for (let i = 0; i < limitBatches; i++) {
      const b = batches[i];
      const pct = Math.round(((i + 1) / batches.length) * 100);
      process.stdout.write(`  -> [${String(pct).padStart(3)}%] Batch ${i + 1}/${batches.length} (${b.length} strings)... `);

      try {
        const resObj = await geminiBatchTranslate(b);
        let saved = 0;
        for (let j = 0; j < b.length; j++) {
          const enKey = b[j];
          const trObj = resObj[String(j)] || (Array.isArray(resObj) ? resObj[j] : null);
          if (trObj && isKoTranslated(enKey, trObj.ko)) {
            if (dict[enKey] && isKoTranslated(enKey, dict[enKey].ko)) {
              trObj.ko = dict[enKey].ko;
            }
            dict[enKey] = trObj;
            saved++;
          }
        }
        saveDict(dictPath, dict);
        console.log(`SAVED +${saved}/${b.length}`);
      } catch (e) {
        console.log(`FAILED (${e.message})`);
        if (e.message.includes("429")) {
          console.log("[안전 정지] API 일일 할당량(Quota) 도달로 인해 안전하게 중단합니다. 지금까지 저장된 번역은 100% 보존됩니다.");
          break;
        }
      }
      if (i + 1 < limitBatches) await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  // 12개 도메인 전체에 최신 마스터 사전 동기화
  let synced = 0;
  for (const d of ALL_DOMAINS) {
    const dst = path.join(ROOT, d, "common_assets", "sc_translations.js");
    if (fs.existsSync(path.dirname(dst))) {
      fs.copyFileSync(dictPath, dst);
      synced++;
    }
  }
  console.log(`[동기화 완료] 최신 sc_translations.js 사전이 ${synced}개 도메인에 배포되었습니다.\n`);
}

main();