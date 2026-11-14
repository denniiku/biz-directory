const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash";

// 실행 인자: node update_translations.js [domain|all] [ko|all] [maxCalls]
const targetArg = (process.argv[2] || "all").toLowerCase();
const langMode  = (process.argv[3] || "ko").toLowerCase();
const KO_ONLY   = (langMode === "ko" || langMode === "kr" || langMode === "--ko");

// 토큰 & 품질 최적 균형점 (KO_ONLY 시 25문장 배치, 추론 예산 256)
const BATCH_SIZE      = KO_ONLY ? 25 : 12;
const THINKING_BUDGET = 256;
const DELAY_MS        = 2200;
const MAX_API_CALLS   = parseInt(process.argv[4] || "300", 10);

// 우선순위 정렬: 스킵 문단 복구 도메인 및 오늘 작업 도메인 먼저 완결 후 대용량(biz-hub, biz-galaxy) 실행
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

// 중첩된 div/section 내부 문단까지 절대 스킵하지 않는 Zero-Skip 추출기
function extractFromHtml(html) {
  const units = new Set();
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<pre[\s\S]*?<\/pre>/gi, "");

  const blockCheck = /<(article|section|div|table|thead|tbody|tr|ul|ol|p|h[1-6]|svg|pre)\b/i;
  const tagRe = /<(h[1-6]|p|li|td|th|figcaption|blockquote|a|button|span|div)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

  let passHtml = cleaned;
  for (let pass = 0; pass < 4; pass++) {
    let match;
    while ((match = tagRe.exec(passHtml)) !== null) {
      const attrs = match[2] || "";
      const inner = match[3] || "";
      if (/notranslate|translate\s*=\s*["']no["']|sc-route|sc-math-code|sc-kpi-val/i.test(attrs)) continue;
      if (blockCheck.test(inner)) continue;
      const norm = normalizeText(inner);
      if (shouldTranslate(norm)) units.add(norm);
    }
    passHtml = passHtml.replace(/<(div|section|article)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, "$3");
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

async function fetchWithTimeout(url, options, ms = 45000) {
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

  const prompt = KO_ONLY
    ? `You are the Chief Localization Architect for *SC (Sistar Company).
Translate the following JSON object of English strings (keys "0" to "${batchStrings.length - 1}") into Korean ("ko") ONLY.

[STRICT QUALITY & GLOSSARY RULES]
1. Executive & Academic Tone: Use institutional-grade C-level business, international trade, deep learning, and quantum physics academic terminology in natural, authoritative Korean.
2. Protected Brand & Architecture Terms: Keep "*SC", "SISTAR", "Qubit Algorithm™", "Cosmo Seed™", "One Spark, Infinite Galaxifying", "Vibe Coding", "K-SURE BNPL", "WKB", "GradNorm", "TAG", "GraphRAG", "MRL", "LoRA", "QUBO", and hub codes ("SCK", "SCI", "SCV", "SCJ", "SCC", "SCU", "SCS", "SCIND") intact.
3. Zero-Loss Key Mapping: Return ONLY a valid JSON object where each key ("0", "1", ...) maps directly to its Korean translation string OR {"ko": "한국어 번역"}.

Input JSON:
` + JSON.stringify(indexedInput, null, 2)
    : `You are the Chief Localization Architect for *SC (Sistar Company).
Translate the following JSON object of English strings (keys "0" to "${batchStrings.length - 1}") into 5 languages: "ko", "id", "vi", "zh-CN", and "ja".
Return ONLY a valid JSON object where each key ("0", "1", ...) maps to {"ko", "id", "vi", "zh-CN", "ja"}.

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
  }, 45000);

  if (res.status === 429 && retryCount < 3) {
    const waitSec = (retryCount + 1) * 15;
    process.stdout.write(`[429 Rate-Limit 대기 ${waitSec}s]... `);
    await new Promise(r => setTimeout(r, waitSec * 1000));
    return geminiBatchTranslate(batchStrings, retryCount + 1);
  }

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.substring(0, 100)}`);
  }

  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(txt);
}

async function main() {
  const targetDomains = (targetArg === "all" || targetArg === "sc_web") ? PRIORITY_DOMAINS : [targetArg];
  const dictPath = path.join(ROOT, "common_assets", "sc_translations.js");
  const dict = loadDict(dictPath);

  // 기존 사전의 정규화/카노니컬 캐시 구성 (이미 번역된 문장 100% 재사용 보장)
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
      // 카노니컬 키가 이미 번역되어 있다면 API 호출 없이 즉시 매핑 복구
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
    console.log(`[자동 매핑 복구] 기존 사전과 공백/기호만 달랐던 ${autoLinked}개 문장을 API 호출 없이 즉시 연결했습니다.`);
  }

  console.log(`\n=== [*SC ZERO-SKIP TRANSLATION ENGINE v2.2 | Target: ${targetArg.toUpperCase()} | Mode: ${KO_ONLY ? "KOREAN ONLY (kr)" : "ALL 5 LANGS"}] ===`);
  console.log(`Total Unique Strings: ${orderedStrings.size} | Already Translated (KO): ${orderedStrings.size - missing.length} | Missing (KO): ${missing.length}`);

  if (missing.length > 0 && !API_KEY) {
    console.log("[안내] GEMINI_API_KEY가 감지되지 않았습니다. 환경변수를 확인해 주세요.");
  } else if (missing.length > 0) {
    const batches = [];
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      batches.push(missing.slice(i, i + BATCH_SIZE));
    }

    const limitBatches = Math.min(batches.length, MAX_API_CALLS);
    console.log(`Executing up to ${limitBatches} batches (${BATCH_SIZE} strings/batch, ThinkingBudget=${THINKING_BUDGET})...\n`);

    for (let i = 0; i < limitBatches; i++) {
      const b = batches[i];
      const pct = Math.round(((i + 1) / batches.length) * 100);
      process.stdout.write(`  -> [${String(pct).padStart(3)}%] Batch ${i + 1}/${batches.length} (${b.length} strings)... `);

      try {
        const resObj = await geminiBatchTranslate(b);
        let saved = 0;
        for (let j = 0; j < b.length; j++) {
          const enKey = b[j];
          const trVal = resObj[String(j)] || (Array.isArray(resObj) ? resObj[j] : null);
          const koStr = typeof trVal === "string" ? trVal : (trVal && trVal.ko ? trVal.ko : null);
          if (koStr && isKoTranslated(enKey, koStr)) {
            const prev = dict[enKey] || {};
            dict[enKey] = Object.assign({}, prev, (typeof trVal === "object" && trVal !== null) ? trVal : {}, { ko: koStr });
            saved++;
          }
        }
        saveDict(dictPath, dict);
        console.log(`SAVED +${saved}/${b.length}`);
      } catch (e) {
        console.log(`FAILED (${e.message})`);
        if (e.message.includes("429")) {
          console.log("\n[안전 정지] API 할당량(429) 도달로 안전하게 일시 정지합니다. 방금까지 번역된 모든 문장은 100% 저장되었습니다.");
          break;
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
  console.log(`\n[동기화 완료] 최신 sc_translations.js 사전이 ${synced}개 도메인 전체에 배포되었습니다.\n`);
}

main();