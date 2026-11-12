const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash";

const PUBLIC_DOMAINS = [
  "sc-sistarcompany","qubit-algorithm","intelligence-core","scarlet-ai",
  "qubit-biz","biz-galaxy","biz-hub","challengers",
  "partnership","ir-pitchdeck","biz-directory","media"
];

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(p|div|li|tr|td|th|h[1-6])\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "") // Strip inline tags (<strong>, <em>, <span>) WITHOUT adding extra spaces, matching browser el.textContent!
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&rarr;/gi, "→")
    .replace(/&larr;/gi, "←")
    .replace(/&harr;/gi, "↔")
    .replace(/&rArr;/gi, "⇒")
    .replace(/&bull;/gi, "•")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/&trade;/gi, "™")
    .replace(/&times;/gi, "×")
    .replace(/&otimes;/gi, "⊗")
    .replace(/&Sigma;/g, "Σ")
    .replace(/&Delta;/g, "Δ")
    .replace(/&Psi;/g, "Ψ")
    .replace(/&Phi;/g, "Φ")
    .replace(/&psi;/g, "ψ")
    .replace(/&phi;/g, "φ")
    .replace(/&rho;/g, "ρ")
    .replace(/&omega;/g, "ω")
    .replace(/&langle;/gi, "⟨")
    .replace(/&rangle;/gi, "⟩")
    .replace(/&radic;/gi, "√")
    .replace(/&int;/gi, "∫")
    .replace(/&approx;/gi, "≈")
    .replace(/&forall;/gi, "∀")
    .replace(/&isin;/gi, "∈")
    .replace(/&dagger;/gi, "†")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

function shouldTranslateBlock(text) {
  if (!text || text.length < 2) return false;
  if (text.length > 4000) return false;
  if (!/[a-zA-Z]{2,}/.test(text)) return false;
  if (/^(https?:\/\/|www\.|[0-9.\s%$+\-/,~:;|•→←—–]+)$/i.test(text)) return false;
  return true;
}

function isKoreanProperlyTranslated(enText, koText) {
  if (!koText || typeof koText !== "string") return false;
  if (koText.trim() === enText.trim()) return false;
  // For sentences/paragraphs longer than 35 chars, require Korean Hangul characters to be present
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

  const blockRegex = /<(h[1-6]|p|li|td|th|figcaption|blockquote|a|button|span|div)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = blockRegex.exec(cleaned)) !== null) {
    const attrs = match[2] || "";
    const inner = match[3] || "";
    if (/notranslate|translate\s*=\s*["']no["']|sc-route|sc-math-code|sc-kpi-val/i.test(attrs)) continue;
    if (/<(article|section|div|table|ul|ol|p|h[1-6]|svg|pre)\b/i.test(inner)) continue;

    const norm = decodeHtmlEntities(inner);
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
    return JSON.parse(raw.substring(idx, lastIdx + 1));
  } catch (e) {
    return {};
  }
}

function saveDict(dictPath, dictObj) {
  const content = "window.SC_TRANSLATIONS = " + JSON.stringify(dictObj, null, 2) + ";\n";
  fs.writeFileSync(dictPath, content, "utf8");
}

async function translateBatchWithGemini(batchStrings) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const systemPrompt = `You are the Chief Institutional Translator for *SC (SISTAR Company / Signal Star Universe).
Translate the following JSON array of English strings into 5 target languages:
- "ko": Korean (한국어 — 격조 높은 글로벌 VC/투자은행 보고서 수준의 자연스러운 비즈니스 한국어)
- "id": Indonesian (Bahasa Indonesia — formal enterprise standard)
- "vi": Vietnamese (Tiếng Việt — formal enterprise standard)
- "zh-CN": Simplified Chinese (简体中文 — formal enterprise standard)
- "ja": Japanese (日本語 — formal enterprise standard)

ABSOLUTE TRANSLATION CONSTITUTION (ZERO SKIPPING ALLOWED):
1. NEVER return an English paragraph or sentence untranslated! Even if a paragraph contains mathematical formulas (e.g., $A \\rightarrow B \\rightarrow C$, $t=0$, $T \\to 1$), acronyms, or brand names, you MUST translate the entire sentence structure, verbs, adjectives, and explanatory prose into the target language.
2. Keep ONLY specific proprietary brand names, math expressions, and core technical terms in English where natural (e.g., *SC, SISTAR, Signal Star, Qubit Algorithm™, Cosmo Seed™, One Spark, One Task Multi Outcomes, Vibe Working, RAG, ERP, SaaS, B2B, ODM, OEM, K-SURE BNPL, IATA, IADA, $A \\rightarrow B \\rightarrow C$, $t=0$, Rp 1,320), while translating all surrounding words into fluent Korean/Indonesian/Vietnamese/Chinese/Japanese.
3. For example, in Korean ("ko"), EVERY sentence and paragraph MUST end with proper Korean predicates (예: ~입니다, ~합니다, ~극대화합니다) and read as 100% fluent Korean prose.
4. Return ONLY a valid JSON array of objects in the exact same order, with keys: "ko", "id", "vi", "zh-CN", "ja".`;

  const body = {
    contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nINPUT_ARRAY:\n" + JSON.stringify(batchStrings) }] }],
    generationConfig: {
      temperature: 0.1,
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

  // Identify missing OR poorly translated (skipped English paragraphs) entries
  const missing = [];
  for (const s of allStrings) {
    const existing = dict[s];
    if (!existing || !isKoreanProperlyTranslated(s, existing["ko"])) {
      missing.push(s);
    }
  }

  console.log(`[Translation Scan (${targetMode})] Total unique blocks: ${allStrings.size} | Untranslated/Skipped blocks to fix: ${missing.length}`);
  if (missing.length === 0 || !API_KEY) {
    if (!API_KEY && missing.length > 0) console.log("  [WARN] GEMINI_API_KEY not set in environment.");
    return;
  }

  const BATCH_SIZE = 15;
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    process.stdout.write(`  -> Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(missing.length / BATCH_SIZE)} (${batch.length} blocks)... `);
    try {
      const results = await translateBatchWithGemini(batch);
      if (Array.isArray(results) && results.length === batch.length) {
        for (let j = 0; j < batch.length; j++) {
          if (results[j] && results[j]["ko"]) {
            dict[batch[j]] = results[j];
          }
        }
        saveDict(dictPath, dict);
        console.log("OK");
      } else {
        console.log("MISMATCH");
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      break;
    }
  }
}

main();
