const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.GEMINI_API_KEY || "";
let ACTIVE_MODEL = "gemini-flash-latest";

// 실행법:
//   1) 스캔만 하기 (토큰 0소모): node update_translations.js [all|도메인명] ko --dry
//   2) 한국어만 번역 실행     : node update_translations.js [all|도메인명] ko [최대배치수]
//   3) 5개국어 전체 번역 실행 : node update_translations.js [all|도메인명] all [최대배치수]
const targetArg = (process.argv[2] || "all").toLowerCase();
const langMode  = (process.argv[3] || "ko").toLowerCase();
const arg4      = (process.argv[4] || "250").toLowerCase();
const DRY_RUN   = (arg4 === "--dry" || arg4 === "dry" || process.argv.includes("--dry"));
const KO_ONLY   = (langMode === "ko" || langMode === "kr" || langMode === "--ko");

// [v3.0 핵심 최적화] 문장 수가 아니라 '글자 수 예산(3,200자)' 기준으로 배치를 묶어 출력 잘림 및 타임아웃 원천 차단
const MAX_BATCH_ITEMS = KO_ONLY ? 20 : 10;
const MAX_BATCH_CHARS = KO_ONLY ? 3200 : 1800;
const DELAY_MS        = 2000;
const MAX_API_CALLS   = DRY_RUN ? 0 : parseInt(arg4 || "250", 10);

const PRIORITY_DOMAINS = [
  "qubit-algorithm",
  "sc-sistarcompany",
  "intelligence-core",
  "scarlet-ai",
  "qubit-biz",
  "challengers",
  "ir-pitchdeck",
  "partnership",
  "media",
  "biz-directory",
  "biz-hub",
  "biz-galaxy"
];

function normalizeText(str) {
  if (!str) return "";
  return str
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, " ")
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
    .replace(/&sub;/gi, "\u2282").replace(/&le;/gi, "\u2264").replace(/&ge;/gi, "\u2265").replace(/&ne;/gi, "\u2260")
    .replace(/&gt;/gi, ">").replace(/&lt;/gi, "<")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalKey(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function shouldTranslate(text) {
  if (!text || text.length < 3) return false;
  if (!/[a-zA-Z]{2,}/.test(text)) return false;
  if (/^(https?:\/\/|www\.|[0-9.\s%$+\-/,~:;|()[\]{}<>=]+)$/i.test(text)) return false;
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

// [v3.0 ZERO-SKIP ATOMIC EXTRACTOR]
// sc_translator.js의 DOM 탐색 규칙과 100% 일치하도록 원자 블록(h1~h6, p, li, td, th, figcaption, blockquote)과
// 독립 리프 태그(div/span/a/button)를 분리 추출하여 중첩 div 삼킴 버그 및 중복 토큰 낭비를 원천 제거
function extractFromHtml(html) {
  const units = new Set();
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<pre[\s\S]*?<\/pre>/gi, "");

  // 1단계: 원자적 문단 블록(h1~h6, p, li, td, th, figcaption, blockquote)을 먼저 100% 추출한 뒤 마스킹
  // (내부에 <strong>, <code>, <span>, <br> 등이 있어도 문단 전체를 하나의 문맥으로 추출하고 자식 중복 추출 방지)
  const atomicTags = ["h1","h2","h3","h4","h5","h6","p","li","td","th","figcaption","blockquote"];
  const nestedBlockRe = /<(article|section|div|table|thead|tbody|tr|ul|ol|p|li|td|th|h[1-6]|blockquote|figcaption|svg|pre)\b/i;

  for (const tag of atomicTags) {
    const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
    cleaned = cleaned.replace(re, (fullMatch, attrs = "", inner = "") => {
      if (/notranslate|translate\s*=\s*["']no["']|sc-route|sc-kpi-val/i.test(attrs)) return " ";
      if (nestedBlockRe.test(inner)) return fullMatch;
      const norm = normalizeText(inner);
      if (shouldTranslate(norm)) units.add(norm);
      return " "; // 추출 완료된 문단은 비워서 안쪽 strong/span이 중복 추출되지 않게 차단
    });
  }

  // 2단계: 남은 HTML에서 가장 안쪽(Leaf)의 div, span, a, button 텍스트(예: .sc-panel-kicker, .sc-math-code, .sc-chapter-num 등)를 안쪽부터 재귀 추출
  const leafRe = /<(div|span|a|button)(\s[^>]*)?>((?:(?!<(?:div|span|a|button|article|section|table|ul|ol)\b)[\s\S])*?)<\/\1>/gi;
  let prev = "";
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(leafRe, (fullMatch, tag, attrs = "", inner = "") => {
      if (/notranslate|translate\s*=\s*["']no["']|sc-route|sc-kpi-val/i.test(attrs)) return " ";
      const norm = normalizeText(inner);
      if (shouldTranslate(norm)) units.add(norm);
      return " ";
    });
  }

  return Array.from(units);
}

// 글자 수 예산(MAX_BATCH_CHARS)과 문장 수(MAX_BATCH_ITEMS)를 동시에 지키는 스마트 배치 빌더
function buildSmartBatches(strings) {
  const batches = [];
  let cur = [];
  let curChars = 0;
  for (const s of strings) {
    if (cur.length > 0 && (cur.length >= MAX_BATCH_ITEMS || (curChars + s.length) > MAX_BATCH_CHARS)) {
      batches.push(cur);
      cur = [];
      curChars = 0;
    }
    cur.push(s);
    curChars += s.length;
  }
  if (cur.length > 0) batches.push(cur);
  return batches;
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

async function fetchWithTimeout(url, options, ms = 45000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

async function resolveActiveFlashModel() {
  if (!API_KEY) return ACTIVE_MODEL;
  try {
    const res = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`, {}, 15000);
    if (!res.ok) return ACTIVE_MODEL;
    const data = await res.json();
    const models = (data.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map(m => m.name.replace(/^models\//, ""));

    const preferred = [
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-3-flash-preview"
    ];
    for (const p of preferred) {
      if (models.includes(p)) return p;
    }
    const anyFlash = models.find(n => n.includes("flash") && !n.includes("8b") && !n.includes("image") && !n.includes("tts") && !n.includes("audio"));
    if (anyFlash) return anyFlash;
  } catch (e) {}
  return ACTIVE_MODEL;
}

async function geminiBatchTranslate(batchStrings, retryCount = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${ACTIVE_MODEL}:generateContent?key=${API_KEY}`;

  const indexedInput = {};
  batchStrings.forEach((s, idx) => { indexedInput[String(idx)] = s; });

  const prompt = KO_ONLY
    ? `Translate the following JSON object of English strings (keys "0" to "${batchStrings.length - 1}") into executive/academic Korean.
Rules:
1. Maintain an authoritative C-level business, international trade, AI/deep-learning, and quantum physics tone.
2. Keep brand/technical codes ("*SC", "SISTAR", "Qubit Algorithm™", "COSMO SEED™", "QubitOS", "One Spark, Infinite Galaxifying", "K-SURE BNPL", "WKB", "GradNorm", "TAG", "GraphRAG", "MRL", "LoRA", "QUBO", "SCK", "SCI", "SCV", "SCJ", "SCC", "SCU", "SCS", "SCIND") intact.
3. Return ONLY a JSON object mapping each key ("0", "1", ...) directly to its translated Korean string.
Input:
` + JSON.stringify(indexedInput)
    : `Translate the following JSON into 5 languages ("ko","id","vi","zh-CN","ja"). Return ONLY JSON:\n` + JSON.stringify(indexedInput);

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    })
  }, 45000);

  if (res.status === 429 && retryCount < 3) {
    const waitSec = (retryCount + 1) * 15;
    process.stdout.write(`[429 대기 ${waitSec}s]... `);
    await new Promise(r => setTimeout(r, waitSec * 1000));
    return geminiBatchTranslate(batchStrings, retryCount + 1);
  }

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.substring(0, 120)}`);
  }

  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(txt);
}

async function main() {
  if (!DRY_RUN && API_KEY) {
    ACTIVE_MODEL = await resolveActiveFlashModel();
  }

  const targetDomains = (targetArg === "all" || targetArg === "sc_web") ? PRIORITY_DOMAINS : [targetArg];
  const dictPath = path.join(ROOT, "common_assets", "sc_translations.js");
  const dict = loadDict(dictPath);

  const exactMap = {};
  const canonMap = {};
  for (const k of Object.keys(dict)) {
    exactMap[normalizeText(k)] = dict[k];
    const ck = canonicalKey(k);
    if (ck.length >= 4) canonMap[ck] = dict[k];
  }

  const orderedStrings = [];
  const seen = new Set();

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
          for (const s of extractFromHtml(html)) {
            if (!seen.has(s)) {
              seen.add(s);
              orderedStrings.push(s);
            }
          }
        }
      }
    }
    walk(domDir);
  }

  const missing = [];
  let autoLinked = 0;
  for (const s of orderedStrings) {
    const ex = dict[s];
    if (KO_ONLY) {
      if (ex && isKoTranslated(s, ex.ko)) continue;
      const ck = canonicalKey(s);
      const canonHit = exactMap[s] || (ck.length >= 4 ? canonMap[ck] : null);
      if (canonHit && isKoTranslated(s, canonHit.ko)) {
        dict[s] = Object.assign({}, ex || {}, { ko: canonHit.ko });
        autoLinked++;
        continue;
      }
      missing.push(s);
    } else {
      if (!ex || !isKoTranslated(s, ex.ko) || !ex.id || ex.id === s) missing.push(s);
    }
  }

  if (autoLinked > 0) {
    saveDict(dictPath, dict);
    console.log(`[무료 카노니컬 자동 매핑] 기존 번역본과 기호/공백만 달랐던 ${autoLinked}개 문장을 API 호출 없이 즉시 연결했습니다.`);
  }

  const batches = buildSmartBatches(missing);
  console.log(`\n=== [*SC ATOMIC ZERO-SKIP TRANSLATION ENGINE v3.0 | Target: ${targetArg.toUpperCase()} | Mode: ${KO_ONLY ? "KOREAN ONLY (kr)" : "ALL 5 LANGS"}${DRY_RUN ? " | DRY-RUN" : ""}] ===`);
  console.log(`Total Atomic Blocks: ${orderedStrings.length} | Already Translated (KO): ${orderedStrings.length - missing.length} | Missing (KO): ${missing.length} (${batches.length} smart batches)`);

  if (DRY_RUN || !API_KEY || missing.length === 0) {
    if (DRY_RUN) console.log("[DRY-RUN 완료] API 호출 없이 정밀 스캔 및 카노니컬 자동 매핑만 완료했습니다.");
  } else {
    const limitBatches = Math.min(batches.length, MAX_API_CALLS);
    let consecutive402 = 0;

    for (let i = 0; i < limitBatches; i++) {
      const b = batches[i];
      const pct = Math.round(((i + 1) / batches.length) * 100);
      process.stdout.write(`  -> [${String(pct).padStart(3)}%] Batch ${i + 1}/${batches.length} (${b.length} items)... `);

      try {
        const resObj = await geminiBatchTranslate(b);
        consecutive402 = 0;
        let saved = 0;
        for (let j = 0; j < b.length; j++) {
          const enKey = b[j];
          const trVal = resObj[String(j)] || (Array.isArray(resObj) ? resObj[j] : null);
          const koStr = typeof trVal === "string" ? trVal : (trVal && trVal.ko ? trVal.ko : null);
          if (koStr && isKoTranslated(enKey, koStr)) {
            const prev = dict[enKey] || {};
            dict[enKey] = Object.assign({}, prev, { ko: koStr });
            saved++;
          }
        }
        saveDict(dictPath, dict);
        console.log(`SAVED +${saved}/${b.length}`);
      } catch (e) {
        console.log(`FAILED (${e.message})`);
        if (e.message.includes("402") || e.message.includes("429") || e.message.includes("quota")) {
          consecutive402++;
          if (consecutive402 >= 2) {
            console.log("\n[안전 정지] API 크레딧 소진(402) 또는 할당량(429) 도달로 즉시 정지합니다. 방금까지 저장된 번역은 100% 보존됩니다.");
            break;
          }
        }
      }
      if (i + 1 < limitBatches) await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  let synced = 0;
  for (const d of PRIORITY_DOMAINS) {
    const dst = path.join(ROOT, d, "common_assets", "sc_translations.js");
    if (fs.existsSync(path.dirname(dst))) {
      fs.copyFileSync(dictPath, dst);
      synced++;
    }
  }
  console.log(`[동기화 완료] 최신 sc_translations.js 사전이 ${synced}개 도메인 전체에 배포되었습니다.\n`);
}

main();