(function(){
  if (window.__scTransInit) return;
  window.__scTransInit = true;

  // 1. Clean up any leftover ?sc_lang=... from the address bar immediately
  try {
    if (location.search && /[?&]sc_lang=/i.test(location.search)) {
      var cleanSearch = location.search.replace(/([?&])sc_lang=[a-zA-Z-]+(&?)/gi, function(m, p1, p2) {
        return p2 ? p1 : "";
      }).replace(/[?&]$/, "");
      history.replaceState(null, "", location.pathname + cleanSearch + location.hash);
    }
  } catch (e) {}

  // 2. Original Language Bar CSS (Preserving exact font size, spacing & layout)
  if (!document.getElementById("sc-tr-css")) {
    var st = document.createElement("style");
    st.id = "sc-tr-css";
    st.textContent = ".sc-lang-bar{display:flex!important;align-items:center!important;justify-content:flex-start!important;padding:0 12px 8px 20px!important;margin:0 0 4px 0!important;background:transparent!important;border:none!important;box-shadow:none!important;border-radius:0!important;font-family:'Space Grotesk',sans-serif!important;box-sizing:border-box!important;}.sc-lang-btns{display:flex!important;align-items:center!important;justify-content:flex-start!important;width:auto!important;gap:14px!important;}.sc-lang-btn{flex:0 0 auto!important;text-align:left!important;background:transparent!important;border:none!important;border-bottom:2px solid transparent!important;padding:2px 0 3px 0!important;font-family:'Space Grotesk',sans-serif!important;font-size:13.5px!important;font-weight:600!important;text-transform:lowercase!important;color:#526D82!important;border-radius:0!important;cursor:pointer!important;line-height:1.1!important;transition:color 0.15s ease,border-color 0.15s ease!important;}.sc-lang-btn:hover{background:transparent!important;color:#27374D!important;border-bottom:2px solid #168765!important;}.sc-lang-btn.active{background:transparent!important;color:#27374D!important;font-weight:700!important;border-bottom:2px solid #168765!important;}body.sc-nav-folded .sc-lang-bar,#sc-left-nav.folded .sc-lang-bar,#sc-left-nav.sc-folded .sc-lang-bar{display:none!important;}@media print{.sc-lang-bar{display:none!important;}}";
    document.head.appendChild(st);
  }

  var p = location.pathname.replace(/\\/g, "/"), b = "/common_assets/";
  if (location.protocol === "file:") {
    var idx = p.toLowerCase().indexOf("/sc_web/");
    if (p.toLowerCase().indexOf("/mgnt/") !== -1) {
      var mi = p.toLowerCase().indexOf("/mgnt/");
      b = "file://" + p.substring(0, mi + 6) + "common_assets/";
    } else if (idx !== -1) {
      b = "file://" + p.substring(0, idx + 8) + "common_assets/";
    } else {
      b = "./common_assets/";
    }
  }

  var LANG_BTNS = [
    { c: "en", l: "en" },
    { c: "ko", l: "kr" },
    { c: "id", l: "id" },
    { c: "vi", l: "vn" },
    { c: "zh-CN", l: "cn" },
    { c: "ja", l: "jp" }
  ];

  function normKey(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function cleanCompareKey(s) {
    return (s || "")
      .replace(/[\u2018\u2019']/g, "'")
      .replace(/[\u201C\u201D"]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  function upgradeBreadcrumb() {
    try {
      var nav = document.getElementById("sc-left-nav");
      var m = document.querySelector("main");
      if (!nav || !m) return;
      var routeEl = m.querySelector(".sc-route,.sc-eyebrow,.breadcrumb,.page-path");
      if (!routeEl) {
        var h1 = m.querySelector("h1"), ps = m.querySelectorAll("p,div");
        for (var i = 0; i < Math.min(ps.length, 6); i++) {
          var el = ps[i], tx = (el.textContent || "").trim();
          var bH1 = h1 && (el.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING);
          if (bH1 && tx.length > 3 && tx.length < 140 && tx.indexOf(" - ") !== -1 && !el.querySelector("p,div,h1")) {
            routeEl = el; break;
          }
        }
      }
      if (!routeEl || routeEl.querySelector(".sc-bc-wrap")) return;

      var raw = (routeEl.textContent || "").replace(/_ver\d+/gi, "").trim();
      var parts = raw.split(/\s+-\s+|\s+›\s+|\s+>\s+/);
      if (parts.length <= 1) return;

      var linkMap = {};
      var navLinks = nav.querySelectorAll("a.sc-l1-link,a.sc-l2-link,a.sc-l3-link");
      for (var k = 0; k < navLinks.length; k++) {
        var a = navLinks[k], nk = normKey(a.textContent || "");
        if (nk && !linkMap[nk]) linkMap[nk] = a.getAttribute("href");
      }

      var isFile = (location.protocol === "file:");
      var html = '<span class="sc-bc-wrap notranslate" translate="no">';
      for (var idx = 0; idx < parts.length; idx++) {
        var lbl = parts[idx].trim();
        var isLast = (idx === parts.length - 1);
        if (idx > 0) html += '<span class="sc-bc-sep">&rsaquo;</span>';
        if (isLast) {
          html += '<span class="sc-bc-curr">' + lbl + '</span>';
        } else {
          var key = normKey(lbl);
          var href = linkMap[key] || "";
          if (!href) {
            var up = (parts.length - 1) - idx, pre = "";
            for (var u = 0; u < up; u++) pre += "../";
            href = isFile ? (pre + "index.html") : pre;
          }
          html += '<a class="sc-bc-item" href="' + href + '">' + lbl + '</a>';
        }
      }
      html += '</span>';
      routeEl.innerHTML = html;
      routeEl.classList.add("notranslate");
      routeEl.setAttribute("translate", "no");
    } catch (e) {}
  }

  function normLangCode(raw) {
    if (!raw) return "en";
    var l = raw.trim().toLowerCase();
    if (l === "kr" || l === "ko") return "ko";
    if (l === "id") return "id";
    if (l === "vn" || l === "vi") return "vi";
    if (l === "cn" || l === "zh" || l === "zh-cn") return "zh-CN";
    if (l === "jp" || l === "ja") return "ja";
    return "en";
  }

  function saveLang(l) {
    var nl = normLangCode(l);
    try {
      window.name = "sc_lang:" + nl;
      localStorage.setItem("sc_preferred_lang", nl);
    } catch (e) {}
    return nl;
  }

  function getLang() {
    try {
      var ls = localStorage.getItem("sc_preferred_lang");
      if (ls) return normLangCode(ls);
      if (window.name && window.name.indexOf("sc_lang:") === 0) {
        return normLangCode(window.name.split(":")[1]);
      }
    } catch (e) {}
    return "en";
  }

  function getCleanEnglishText(el) {
    var clone = el.cloneNode(true);
    var brs = clone.querySelectorAll("br");
    for (var i = 0; i < brs.length; i++) brs[i].replaceWith(" ");
    return (clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  function applyDict(lang) {
    try {
      upgradeBreadcrumb();
      // Navigator (#sc-left-nav) is never queried here — its font size and layout remain 100% untouched.
      var selector = "main p, main li, main td, main th, main blockquote, main dd, main dt, main .sc-callout, main .sc-lead, main .sc-sub, main .sc-test02-sub, main .sc-sec-body, main .sc-sec-title, main .sc-h2, main .sc-h3, main h2, main h3, main h4";
      var elements = document.querySelectorAll(selector);

      var rawDict = (window.SC_AI_TRANSLATIONS && window.SC_AI_TRANSLATIONS[lang]) ? window.SC_AI_TRANSLATIONS[lang] : null;
      var normDict = {};
      if (rawDict) {
        for (var k in rawDict) {
          if (Object.prototype.hasOwnProperty.call(rawDict, k)) {
            normDict[cleanCompareKey(k)] = rawDict[k];
          }
        }
      }

      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (el.closest && (el.closest("#sc-left-nav") || el.closest(".sc-top-bar") || el.closest(".sc-bc-wrap") || el.closest(".sc-math") || el.closest(".sc-code") || el.closest(".notranslate"))) continue;
        if (el.classList && (el.classList.contains("sc-route") || el.classList.contains("sc-eyebrow") || el.classList.contains("sc-kicker") || el.classList.contains("sc-tag") || el.classList.contains("sc-num-label") || el.classList.contains("sc-num") || el.classList.contains("sc-stat-big") || el.classList.contains("sc-kpi-val") || el.classList.contains("sc-phrase-pill") || el.classList.contains("sc-test02-h1") || el.classList.contains("sc-main-title") || el.classList.contains("notranslate"))) continue;
        if (el.querySelector && el.querySelector("p, ul, ol, table, .sc-grid-2x2")) continue;

        if (!el.hasAttribute("data-sc-oh")) {
          el.setAttribute("data-sc-oh", el.innerHTML);
          el.setAttribute("data-sc-ot", getCleanEnglishText(el));
        }

        if (lang === "en") {
          el.innerHTML = el.getAttribute("data-sc-oh");
          continue;
        }

        var ot = el.getAttribute("data-sc-ot");
        if (!ot) continue;

        var translated = rawDict ? (rawDict[ot] || normDict[cleanCompareKey(ot)]) : null;
        if (translated) {
          el.textContent = translated;
        } else {
          el.innerHTML = el.getAttribute("data-sc-oh");
        }
      }
    } catch (e) {}
  }

  function updateButtonsUI(nl) {
    var bs = document.querySelectorAll(".sc-lang-btn");
    for (var i = 0; i < bs.length; i++) {
      bs[i].classList.toggle("active", normLangCode(bs[i].getAttribute("data-lang")) === nl);
    }
  }

  function switchLang(l) {
    var nl = saveLang(l);
    updateButtonsUI(nl);
    applyDict(nl);
  }

  document.addEventListener("click", function(e) {
    var btn = e.target && e.target.closest ? e.target.closest(".sc-lang-btn") : null;
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      switchLang(btn.getAttribute("data-lang"));
    }
  }, true);

  // Original alignment function: aligns language bar directly under the 's' of '*sc - sistar company'
  function alignUnderBrandS(nav, bar) {
    try {
      var brandFull = nav.querySelector(".sc-brand-full");
      if (!brandFull || !brandFull.firstChild) return;
      var tNode = brandFull.firstChild;
      if (tNode.nodeType === 3 && tNode.nodeValue.length >= 2) {
        var r = document.createRange();
        r.setStart(tNode, 1); r.setEnd(tNode, 2);
        var sRect = r.getBoundingClientRect();
        var navRect = nav.getBoundingClientRect();
        if (sRect && sRect.width > 0 && navRect) {
          var exactLeft = Math.round(sRect.left - navRect.left);
          if (exactLeft > 5 && exactLeft < 60) {
            bar.style.setProperty("padding-left", exactLeft + "px", "important");
          }
        }
      }
    } catch (e) {}
  }

  function mountBar() {
    upgradeBreadcrumb();
    var nav = document.getElementById("sc-left-nav");
    if (!nav) return false;
    var bar = nav.querySelector(".sc-lang-bar");
    var cur = getLang();

    if (!bar) {
      bar = document.createElement("div");
      bar.className = "sc-lang-bar notranslate";
      bar.setAttribute("translate", "no");
      var h = '<div class="sc-lang-btns">';
      for (var i = 0; i < LANG_BTNS.length; i++) {
        h += '<button type="button" class="sc-lang-btn' + (cur === LANG_BTNS[i].c ? " active" : "") + '" data-lang="' + LANG_BTNS[i].c + '">' + LANG_BTNS[i].l + '</button>';
      }
      bar.innerHTML = h + '</div>';
      var topWrap = nav.firstElementChild;
      var topBar = nav.querySelector(".sc-nav-top");
      if (topBar && topBar.parentNode) {
        topBar.parentNode.insertBefore(bar, topBar.nextSibling);
      } else if (topWrap) {
        topWrap.appendChild(bar);
      } else {
        nav.insertBefore(bar, nav.firstChild);
      }
      alignUnderBrandS(nav, bar);
    }

    updateButtonsUI(cur);
    if (cur !== "en") applyDict(cur);
    return true;
  }

  var ds = document.createElement("script");
  ds.src = b + "sc_translations.js?v=" + Date.now();
  ds.onload = function() {
    var cur = getLang();
    if (cur !== "en") applyDict(cur);
  };
  document.head.appendChild(ds);

  if (!mountBar()) {
    var poll = setInterval(function() { if (mountBar()) clearInterval(poll); }, 50);
    setTimeout(function() { clearInterval(poll); }, 10000);
  }
})();
