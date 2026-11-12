(function () {
  var LANG_MAP = {
    en: "en",
    kr: "ko",
    id: "id",
    vn: "vi",
    cn: "zh-CN",
    jp: "ja"
  };

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

  function normalizeText(str) {
    if (!str) return "";
    return str
      .replace(/\u00a0/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  var normalizedDictCache = null;
  function getNormalizedDict() {
    if (normalizedDictCache) return normalizedDictCache;
    var raw = window.SC_TRANSLATIONS || {};
    var map = {};
    var keys = Object.keys(raw);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      map[normalizeText(k)] = raw[k];
    }
    normalizedDictCache = map;
    return map;
  }

  function applyStaticTranslations(uiLang) {
    var targetCode = LANG_MAP[uiLang] || "en";
    var root = document.querySelector("main") || document.body;
    if (!root) return;

    var selector = "h1, h2, h3, h4, h5, h6, p, li, td, th, figcaption, blockquote, a, button, span, div";
    var elements = root.querySelectorAll(selector);
    var dict = getNormalizedDict();

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.closest("#sc-left-nav") || el.closest(".notranslate") || el.closest("[translate='no']") || el.closest("svg") || el.closest("pre")) continue;
      if (el.classList && (el.classList.contains("notranslate") || el.classList.contains("sc-route") || el.classList.contains("sc-math-code") || el.classList.contains("sc-kpi-val"))) continue;

      // Skip container elements that hold block children
      if (el.querySelector("article, section, div, table, ul, ol, p, h1, h2, h3, h4, h5, h6, svg, pre")) continue;

      if (!el.hasAttribute("data-sc-orig-html")) {
        var normOrig = normalizeText(el.textContent || "");
        if (!normOrig || normOrig.length < 2) continue;
        el.setAttribute("data-sc-orig-html", el.innerHTML);
        el.setAttribute("data-sc-norm-key", normOrig);
      }

      if (targetCode === "en") {
        var origHtml = el.getAttribute("data-sc-orig-html");
        if (origHtml !== null && el.innerHTML !== origHtml) {
          el.innerHTML = origHtml;
        }
      } else {
        var key = el.getAttribute("data-sc-norm-key");
        var entry = dict[key];
        if (entry && entry[targetCode]) {
          el.textContent = entry[targetCode];
        }
      }
    }
  }

  function updateLangButtonsUI(activeLang) {
    var btns = document.querySelectorAll("[data-sc-lang], .sc-lang-bar span, .sc-lang-bar a, .sc-lang-bar button, #sc-left-nav .lang-btn");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var code = (b.getAttribute("data-sc-lang") || b.textContent || "").trim().toLowerCase();
      if (LANG_MAP[code]) {
        if (code === activeLang) {
          b.classList.add("active");
          b.style.fontWeight = "700";
          b.style.borderBottom = "2px solid #0f5132";
        } else {
          b.classList.remove("active");
          b.style.fontWeight = "";
          b.style.borderBottom = "";
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
      var txt = (t.getAttribute("data-sc-lang") || t.textContent || "").trim().toLowerCase();
      if (LANG_MAP[txt] && (t.closest("#sc-left-nav") || t.closest(".sc-lang-bar"))) {
        e.preventDefault();
        e.stopPropagation();
        window.scSetLanguage(txt);
      }
    }, true);
  }

  function init() {
    bindNavLangClicks();
    var saved = "en";
    try { saved = localStorage.getItem("sc_lang") || "en"; } catch (e) {}
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
