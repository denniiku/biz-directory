(function () {
  var LANG_MAP = {
    en: "en",
    kr: "ko",
    id: "id",
    vn: "vi",
    cn: "zh-CN",
    jp: "ja"
  };
  var LANG_LIST = ["en", "kr", "id", "vn", "cn", "jp"];

  function getBaseAssetsPath() {
    var p = location.pathname.replace(/\\/g, "/");
    if (location.protocol === "file:") {
      var idxMgnt = p.toLowerCase().indexOf("/mgnt/");
      if (idxMgnt !== -1) return "file://" + p.substring(0, idxMgnt + 6) + "common_assets/";
      var idxWeb = p.toLowerCase().indexOf("/sc_web/");
      if (idxWeb !== -1) return "file://" + p.substring(0, idxWeb + 8) + "common_assets/";
      return "./common_assets/";
    }
    return "/common_assets/";
  }

  function injectLangStyles() {
    if (document.getElementById("sc-lang-bar-styles")) return;
    var style = document.createElement("style");
    style.id = "sc-lang-bar-styles";
    style.textContent = [
      "#sc-left-nav .sc-lang-bar {",
      "  display: flex !important;",
      "  align-items: center !important;",
      "  gap: 13px !important;",
      "  padding: 6px 18px 12px 18px !important;",
      "  margin: 0 !important;",
      "  border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;",
      "  font-family: 'Space Grotesk', 'Inter', sans-serif !important;",
      "  font-size: 13.5px !important;",
      "  line-height: 1.2 !important;",
      "  user-select: none !important;",
      "}",
      "body.sc-nav-folded #sc-left-nav .sc-lang-bar {",
      "  display: none !important;",
      "}",
      "#sc-left-nav .sc-lang-bar .sc-lang-btn {",
      "  cursor: pointer !important;",
      "  color: #475569 !important;",
      "  font-weight: 500 !important;",
      "  text-decoration: none !important;",
      "  padding: 2px 1px 4px 1px !important;",
      "  border-bottom: 2px solid transparent !important;",
      "  transition: all 0.15s ease !important;",
      "  text-transform: lowercase !important;",
      "  background: transparent !important;",
      "  border-top: none !important; border-left: none !important; border-right: none !important;",
      "}",
      "#sc-left-nav .sc-lang-bar .sc-lang-btn:hover {",
      "  color: #0f172a !important;",
      "}",
      "#sc-left-nav .sc-lang-bar .sc-lang-btn.active {",
      "  color: #0f5132 !important;",
      "  font-weight: 700 !important;",
      "  border-bottom: 2px solid #0f5132 !important;",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function ensureLangBarInNav() {
    injectLangStyles();
    var nav = document.getElementById("sc-left-nav");
    if (!nav) return false;

    var existing = nav.querySelector(".sc-lang-bar");
    if (existing) return true;

    var bar = document.createElement("div");
    bar.className = "sc-lang-bar notranslate";
    bar.setAttribute("translate", "no");

    var currentLang = "en";
    try { currentLang = (localStorage.getItem("sc_lang") || "en").toLowerCase(); } catch (e) {}
    if (!LANG_MAP[currentLang]) currentLang = "en";

    for (var i = 0; i < LANG_LIST.length; i++) {
      var code = LANG_LIST[i];
      var btn = document.createElement("span");
      btn.className = "sc-lang-btn" + (code === currentLang ? " active" : "");
      btn.setAttribute("data-sc-lang", code);
      btn.textContent = code;
      bar.appendChild(btn);
    }

    var headerEl = nav.querySelector(".sc-nav-header, .sc-brand-header, .nav-header, header") || nav.firstElementChild;
    if (headerEl && headerEl.nextSibling) {
      nav.insertBefore(bar, headerEl.nextSibling);
    } else if (headerEl) {
      nav.appendChild(bar);
    } else {
      nav.insertBefore(bar, nav.firstChild);
    }
    return true;
  }

  function normalizeText(str) {
    if (!str) return "";
    return str
      .replace(/\u00a0/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Canonical key strips all punctuation/spaces/symbols so minor HTML tag boundary or quote differences NEVER break lookup
  function canonicalKey(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  var exactDictCache = null;
  var canonDictCache = null;
  function ensureCaches() {
    if (exactDictCache && canonDictCache) return;
    var raw = window.SC_TRANSLATIONS || {};
    exactDictCache = {};
    canonDictCache = {};
    var keys = Object.keys(raw);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var val = raw[k];
      exactDictCache[normalizeText(k)] = val;
      var ck = canonicalKey(k);
      if (ck.length >= 4) {
        canonDictCache[ck] = val;
      }
    }
  }

  function applyStaticTranslations(uiLang) {
    var targetCode = LANG_MAP[uiLang] || "en";
    var root = document.querySelector("main") || document.body;
    if (!root) return;

    var selector = "h1, h2, h3, h4, h5, h6, p, li, td, th, figcaption, blockquote, a, button, span, div";
    var elements = root.querySelectorAll(selector);
    ensureCaches();

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.closest("#sc-left-nav") || el.closest(".notranslate") || el.closest("[translate='no']") || el.closest("svg") || el.closest("pre")) continue;
      if (el.classList && (el.classList.contains("notranslate") || el.classList.contains("sc-route") || el.classList.contains("sc-math-code") || el.classList.contains("sc-kpi-val"))) continue;

      if (el.querySelector("article, section, div, table, ul, ol, p, h1, h2, h3, h4, h5, h6, svg, pre")) continue;

      if (!el.hasAttribute("data-sc-orig-html")) {
        var normOrig = normalizeText(el.textContent || "");
        if (!normOrig || normOrig.length < 2) continue;
        el.setAttribute("data-sc-orig-html", el.innerHTML);
        el.setAttribute("data-sc-norm-key", normOrig);
        el.setAttribute("data-sc-canon-key", canonicalKey(normOrig));
      }

      if (targetCode === "en") {
        var origHtml = el.getAttribute("data-sc-orig-html");
        if (origHtml !== null && el.innerHTML !== origHtml) {
          el.innerHTML = origHtml;
        }
      } else {
        var nKey = el.getAttribute("data-sc-norm-key");
        var cKey = el.getAttribute("data-sc-canon-key");
        var entry = exactDictCache[nKey] || (cKey ? canonDictCache[cKey] : null);
        if (entry && entry[targetCode]) {
          el.textContent = entry[targetCode];
        }
      }
    }
  }

  function updateLangButtonsUI(activeLang) {
    ensureLangBarInNav();
    var btns = document.querySelectorAll("[data-sc-lang], .sc-lang-bar span, .sc-lang-bar a, .sc-lang-bar button, #sc-left-nav .lang-btn");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var code = (b.getAttribute("data-sc-lang") || b.textContent || "").trim().toLowerCase();
      if (LANG_MAP[code]) {
        if (code === activeLang) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      }
    }
  }

  window.scSetLanguage = function (langCode) {
    var code = (langCode || "en").toLowerCase().trim();
    if (!LANG_MAP[code]) code = "en";
    try { localStorage.setItem("sc_lang", code); } catch (e) {}
    updateLangButtonsUI(code);
    if (code === "en") {
      applyStaticTranslations("en");
      return;
    }
    ensureDictionaryLoaded(function () {
      applyStaticTranslations(code);
    });
  };

  var dictLoading = false;
  function ensureDictionaryLoaded(cb) {
    if (window.SC_TRANSLATIONS) {
      cb();
      return;
    }
    if (dictLoading) {
      var timer = setInterval(function () {
        if (window.SC_TRANSLATIONS) {
          clearInterval(timer);
          cb();
        }
      }, 60);
      return;
    }
    dictLoading = true;
    var s = document.createElement("script");
    s.src = getBaseAssetsPath() + "sc_translations.js?v=" + Date.now();
    s.onload = function () { cb(); };
    document.head.appendChild(s);
  }

  function bindNavLangClicks() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t) return;
      var btn = t.closest("[data-sc-lang]") || t;
      var txt = (btn.getAttribute("data-sc-lang") || btn.textContent || "").trim().toLowerCase();
      if (LANG_MAP[txt] && (btn.closest("#sc-left-nav") || btn.closest(".sc-lang-bar"))) {
        e.preventDefault();
        e.stopPropagation();
        window.scSetLanguage(txt);
      }
    }, true);
  }

  function watchNavMount() {
    ensureLangBarInNav();
    var obs = new MutationObserver(function () {
      ensureLangBarInNav();
    });
    obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

    function initRouteBreadcrumbs() {
    var routes = document.querySelectorAll(".sc-route, .sc-eyebrow, .breadcrumb, .page-path");
    for (var i = 0; i < routes.length; i++) {
      var el = routes[i];
      if (el.querySelector(".sc-bc-wrap") || el.querySelector("a")) continue;
      var raw = (el.textContent || "").trim();
      if (!raw || raw.indexOf(" - ") === -1) continue;

      var parts = raw.split(/\s+-\s+/);
      if (parts.length < 2) continue;

      var wrap = document.createElement("span");
      wrap.className = "sc-bc-wrap notranslate";
      wrap.setAttribute("translate", "no");

      var total = parts.length;
      for (var j = 0; j < total; j++) {
        if (j > 0) {
          var sep = document.createElement("span");
          sep.className = "sc-bc-sep";
          sep.textContent = "-";
          wrap.appendChild(sep);
        }
        if (j < total - 1) {
          var upLevels = (total - 1) - j;
          var relHref = "";
          for (var k = 0; k < upLevels; k++) {
            relHref += "../";
          }
          relHref += "index.html";
          var a = document.createElement("a");
          a.className = "sc-bc-item";
          a.href = relHref;
          a.textContent = parts[j].trim();
          wrap.appendChild(a);
        } else {
          var curr = document.createElement("span");
          curr.className = "sc-bc-curr";
          curr.textContent = parts[j].trim();
          wrap.appendChild(curr);
        }
      }
      el.textContent = "";
      el.appendChild(wrap);
    }
  }
  function init() {
    initRouteBreadcrumbs();
    bindNavLangClicks();
    watchNavMount();
    var saved = "en";
    try { saved = localStorage.getItem("sc_lang") || "en"; } catch (e) {}
    updateLangButtonsUI(saved && LANG_MAP[saved] ? saved : "en");
    if (saved && saved !== "en" && LANG_MAP[saved]) {
      window.scSetLanguage(saved);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
