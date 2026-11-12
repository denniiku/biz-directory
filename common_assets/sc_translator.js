(function(){
  if(window.__scTransInit)return; window.__scTransInit=true;

  // 1. Style for language buttons
  if(!document.getElementById("sc-tr-css")){
    var st=document.createElement("style"); st.id="sc-tr-css";
    st.textContent="iframe.goog-te-banner-frame,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.VIpgJd-ZVi9od-ORHb-OEVmcd{display:none!important;visibility:hidden!important;}body{top:0!important;position:static!important;}#google_translate_element_hidden{display:none!important;}.sc-lang-bar{display:flex!important;align-items:center!important;justify-content:flex-start!important;padding:0 12px 8px 20px!important;margin:0 0 4px 0!important;background:transparent!important;border:none!important;box-shadow:none!important;border-radius:0!important;font-family:'Space Grotesk',sans-serif!important;box-sizing:border-box!important;}.sc-lang-btns{display:flex!important;align-items:center!important;justify-content:flex-start!important;width:auto!important;gap:14px!important;}.sc-lang-btn{flex:0 0 auto!important;text-align:left!important;background:transparent!important;border:none!important;border-bottom:2px solid transparent!important;padding:2px 0 3px 0!important;font-family:'Space Grotesk',sans-serif!important;font-size:13.5px!important;font-weight:600!important;text-transform:lowercase!important;color:#526D82!important;border-radius:0!important;cursor:pointer!important;line-height:1.1!important;transition:color 0.15s ease,border-color 0.15s ease!important;pointer-events:auto!important;position:relative!important;z-index:10!important;}.sc-lang-btn:hover{background:transparent!important;color:#27374D!important;border-bottom:2px solid #168765!important;}.sc-lang-btn.active{background:transparent!important;color:#27374D!important;font-weight:700!important;border-bottom:2px solid #168765!important;}body.sc-nav-folded .sc-lang-bar,#sc-left-nav.folded .sc-lang-bar,#sc-left-nav.sc-folded .sc-lang-bar{display:none!important;}@media print{.sc-lang-bar{display:none!important;}}";
    document.head.appendChild(st);
  }

  var p=location.pathname.replace(/\\/g,"/"), b="/common_assets/";
  if(location.protocol==="file:"){
    var idx=p.toLowerCase().indexOf("/sc_web/");
    b = (idx!==-1) ? "file://"+p.substring(0,idx+8)+"common_assets/" : "./common_assets/";
  }

  // 2. Proprietary Glossary Lock (Pre-Masking + Post-Polish)
  var SC_GLOSSARY_LOCK = [
    { rx: /\bc\s*\.\s*a\s*\.\s*n\.?/gi, keep: "c.a.n." },
    { rx: /\baction\s*note\s+ai\s+ceo\b/gi, keep: "ActionNote AI CEO" },
    { rx: /\bceo\s+action\s+notes?\b/gi, keep: "CEO Action Note" },
    { rx: /\bsistar\s+challengers\b/gi, keep: "Sistar Challengers" },
    { rx: /\bvet\s+specialties\b/gi, keep: "Vet Specialties" },
    { rx: /\banimal\s+bio[\s-]health\b/gi, keep: "Animal Bio-Health" },
    { rx: /\bexo[\s-]brain\b/gi, keep: "exo-brain" },
    { rx: /\*sc\b/gi, keep: "*sc" },
    { rx: /\bsistar\s+company\b/gi, keep: "SISTAR Company" },
    { rx: /\bsignal\s+star\s+universe\b/gi, keep: "Signal Star Universe" },
    { rx: /\bsignal\s+star\b/gi, keep: "Signal Star" },
    { rx: /\bqubit[\s-]algorithm(?:™)?\b/gi, keep: "Qubit Algorithm™" },
    { rx: /\bqubit[\s-]biz\b/gi, keep: "qubit-biz" },
    { rx: /\bqubit\s+erp\b/gi, keep: "Qubit ERP" },
    { rx: /\bqubit\s+bank\b/gi, keep: "Qubit Bank" },
    { rx: /\bscarlet[\s-]ai\b/gi, keep: "scarlet-ai" },
    { rx: /\bintelligence[\s-]core\b/gi, keep: "intelligence-core" },
    { rx: /\bbiz[\s-]galaxy\b/gi, keep: "biz-galaxy" },
    { rx: /\bbiz[\s-]hub\b/gi, keep: "biz-hub" },
    { rx: /\bbiz[\s-]directory\b/gi, keep: "biz-directory" },
    { rx: /\bcosmo\s+seed\b/gi, keep: "Cosmo Seed" }
  ];

  function maskGlossary(text){
    var masked = text, tokens = [];
    for(var i=0; i<SC_GLOSSARY_LOCK.length; i++){
      var item = SC_GLOSSARY_LOCK[i];
      masked = masked.replace(item.rx, function(){
        var id = tokens.length;
        tokens.push(item.keep);
        return "ZXQGLOSS" + id + "ZXQ";
      });
    }
    return { text: masked, tokens: tokens };
  }

  function unmaskGlossary(translated, tokens){
    var res = translated;
    for(var i=0; i<tokens.length; i++){
      var rx = new RegExp("ZXQGLOSS\\s*" + i + "\\s*ZXQ", "gi");
      res = res.replace(rx, tokens[i]);
    }
    return res;
  }

  function polishTermsOnElement(el){
    try{
      var reps=[
        [/할\s*수\s*있다\.?\s*-\s*/g,"c.a.n. - "],
        [/\|\s*할\s*수\s*있다\.?/g,"| c.a.n."],
        [/시스타\s*챌린저스/g,"Sistar Challengers"],
        [/수의학?\s*전문\s*분야|수의\s*스페셜티/g,"Vet Specialties"],
        [/동물\s*바이오\s*헬스/g,"Animal Bio-Health"],
        [/엑소\s*브레인|외뇌/g,"exo-brain"],
        [/시스타\s*컴퍼니|시스타\s*회사/g,"SISTAR Company"],
        [/시그널\s*스타\s*유니버스|신호별\s*우주/g,"Signal Star Universe"],
        [/시그널\s*스타|신호별/g,"Signal Star"],
        [/큐비트\s*알고리즘|양자비트\s*알고리즘/g,"Qubit Algorithm™"],
        [/큐비트\s*비즈/g,"qubit-biz"],
        [/큐비트\s*ERP/g,"Qubit ERP"],
        [/큐비트\s*뱅크/g,"Qubit Bank"],
        [/스칼렛\s*AI|스칼렛-ai/gi,"scarlet-ai"],
        [/인텔리전스\s*코어|지능\s*코어/g,"intelligence-core"],
        [/비즈\s*갤럭시/g,"biz-galaxy"],
        [/비즈\s*허브/g,"biz-hub"],
        [/코스모\s*시드/g,"Cosmo Seed"],
        [/그만큼\s*Signal\s*Star/g,"Signal Star"]
      ];
      var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false), n;
      while((n=w.nextNode())){
        var v=n.nodeValue, ch=false;
        for(var r=0;r<reps.length;r++){if(reps[r][0].test(v)){v=v.replace(reps[r][0],reps[r][1]);ch=true;}}
        if(ch)n.nodeValue=v;
      }
    }catch(e){}
  }

  function cleanCompareKey(s){
    return (s||"").replace(/[\u2018\u2019']/g,"'").replace(/[\u201C\u201D"]/g,'"').replace(/[\u2013\u2014]/g,"-").replace(/\s+/g," ").trim();
  }

  function normLangCode(raw){
    if(!raw)return "en";
    var l=raw.trim().toLowerCase();
    if(l==="zh-cn"||l==="cn"||l==="zh")return "zh-CN";
    if(l==="kr"||l==="ko")return "ko";
    if(l==="vn"||l==="vi")return "vi";
    if(l==="jp"||l==="ja")return "ja";
    if(l==="id")return "id";
    return "en";
  }

  function saveLang(l){
    try{
      var nl=normLangCode(l);
      window.name="sc_lang:"+nl;
      localStorage.setItem("sc_preferred_lang",nl);
    }catch(e){}
  }

  function getLang(){
    try{
      var u=location.search.match(/[?&]sc_lang=([a-zA-Z-]+)/i);
      if(u&&u[1]){var ul=normLangCode(u[1]);saveLang(ul);return ul;}
      if(window.name&&window.name.indexOf("sc_lang:")===0){var wl=normLangCode(window.name.split(":")[1]);if(wl){saveLang(wl);return wl;}}
      var ls=localStorage.getItem("sc_preferred_lang"); if(ls)return normLangCode(ls);
    }catch(e){}
    return "en";
  }

  var liveCache = {};

  function fetchLiveTranslation(text, targetLang, callback){
    if(!text || text.length < 2) return;
    var cacheKey = targetLang + "||" + text;
    if(liveCache[cacheKey]){ callback(liveCache[cacheKey]); return; }
    try{
      var m = maskGlossary(text);
      var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + encodeURIComponent(targetLang) + "&dt=t&q=" + encodeURIComponent(m.text);
      fetch(url).then(function(r){ return r.json(); }).then(function(data){
        if(data && Array.isArray(data[0])){
          var rawTranslated = data[0].map(function(seg){ return seg[0]; }).join("");
          if(rawTranslated){
            var finalTranslated = unmaskGlossary(rawTranslated, m.tokens);
            liveCache[cacheKey] = finalTranslated;
            callback(finalTranslated);
          }
        }
      }).catch(function(){});
    }catch(e){}
  }

  function applyDict(lang){
    try{
      var rawDict=(window.SC_AI_TRANSLATIONS&&window.SC_AI_TRANSLATIONS[lang])?window.SC_AI_TRANSLATIONS[lang]:null;
      var normDict={};
      if(rawDict){
        for(var k in rawDict){
          if(Object.prototype.hasOwnProperty.call(rawDict,k)){
            normDict[cleanCompareKey(k)] = rawDict[k];
          }
        }
      }

      // Expanded selector to cover all pages including homepage hero & subpages
      var selector = "main h1, main h2, main h3, main h4, main p, main li, main td, main th, main blockquote, main dd, main dt, main .sc-hero-heading, main .sc-hero-subline, main .sc-callout, main .sc-lead, main .sc-sub, main .sc-test02-sub, main .sc-sec-body, main .sc-sec-title, main .sc-h2, main .sc-h3";
      var ts=document.querySelectorAll(selector);

      for(var i=0;i<ts.length;i++){
        var el=ts[i];
        if(el.closest&&(el.closest(".sc-top-bar")||el.closest(".sc-bc-wrap")||el.closest(".sc-math")||el.closest(".sc-code")||el.closest(".notranslate")))continue;
        if(el.classList&&(el.classList.contains("sc-eyebrow")||el.classList.contains("sc-route")||el.classList.contains("bd-eyebrow")||el.classList.contains("notranslate")))continue;
        if(el.querySelector && el.querySelector("p, ul, ol, table, .sc-grid-2x2"))continue;

        if(!el.getAttribute("data-sc-oh")){
          el.setAttribute("data-sc-oh",el.innerHTML);
          el.setAttribute("data-sc-ot",(el.textContent||"").replace(/\s+/g," ").trim());
        }

        if(lang==="en"){
          var oh=el.getAttribute("data-sc-oh");
          if(oh!==null)el.innerHTML=oh;
          continue;
        }

        var ot=el.getAttribute("data-sc-ot");
        if(!ot)continue;
        var ck=cleanCompareKey(ot);

        if(rawDict && (rawDict[ot] || normDict[ck])){
          el.textContent = rawDict[ot] || normDict[ck];
          polishTermsOnElement(el);
        } else {
          (function(targetEl, origText){
            fetchLiveTranslation(origText, lang, function(translatedText){
              if(getLang() === lang){
                targetEl.textContent = translatedText;
                polishTermsOnElement(targetEl);
              }
            });
          })(el, ot);
        }
      }
    }catch(e){}
  }

  function updateBtnActiveState(nl){
    var bs=document.querySelectorAll(".sc-lang-btn");
    for(var i=0;i<bs.length;i++){
      var bLang = normLangCode(bs[i].getAttribute("data-lang") || bs[i].textContent);
      bs[i].classList.toggle("active", bLang===nl);
    }
  }

  function switchLang(l){
    var nl=normLangCode(l);
    saveLang(nl);
    updateBtnActiveState(nl);
    applyDict(nl);
  }

  // Global exposing for debugging or direct call
  window.scSwitchLang = switchLang;

  // 3. Bulletproof Document-Level Click Delegation for Language Buttons!
  // No matter when or how .sc-lang-btn is created (by nav_new.js or sc_translator.js), clicking it ALWAYS works!
  document.addEventListener("click", function(e){
    var btn = e.target && e.target.closest ? e.target.closest(".sc-lang-btn") : null;
    if(btn){
      e.preventDefault();
      e.stopPropagation();
      var rawLang = btn.getAttribute("data-lang") || btn.textContent;
      switchLang(rawLang);
      return;
    }

    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if(!a) return;
    var h = a.getAttribute("href");
    if(!h||h.indexOf("#")===0||h.indexOf("javascript:")===0||h.indexOf("mailto:")===0||a.hasAttribute("download"))return;
    var l = getLang();
    if(l && l!=="en"){
      var ch=h.replace(/([?&])sc_lang=[a-zA-Z-]+&?/i,"$1").replace(/[?&]$/,"");
      var sp=ch.indexOf("?")===-1?"?":"&", hi=ch.indexOf("#");
      a.setAttribute("href",hi!==-1?ch.substring(0,hi)+sp+"sc_lang="+l+ch.substring(hi):ch+sp+"sc_lang="+l);
    }
  }, true);

  function mountBar(){
    var nav=document.getElementById("sc-left-nav");
    if(!nav)return false;
    var bar=nav.querySelector(".sc-lang-bar");
    var cur=getLang(), ls=[{c:"en",l:"en"},{c:"ko",l:"kr"},{c:"id",l:"id"},{c:"vi",l:"vn"},{c:"zh-CN",l:"cn"},{c:"ja",l:"jp"}];

    if(!bar){
      bar=document.createElement("div");
      bar.className="sc-lang-bar notranslate";
      bar.setAttribute("translate","no");
      var h='<div class="sc-lang-btns">';
      for(var i=0;i<ls.length;i++)h+='<button type="button" class="sc-lang-btn'+(cur===ls[i].c?" active":"")+'" data-lang="'+ls[i].c+'">'+ls[i].l+'</button>';
      bar.innerHTML=h+'</div>';
      var topBar=nav.querySelector(".sc-nav-top");
      if(topBar&&topBar.parentNode){
        topBar.parentNode.insertBefore(bar,topBar.nextSibling);
      }else{
        nav.insertBefore(bar,nav.firstChild);
      }
    }
    updateBtnActiveState(cur);
    if(cur&&cur!=="en") applyDict(cur);
    return true;
  }

  // Load dictionary and apply immediately
  var ds=document.createElement("script");
  ds.src=b+"sc_translations.js";
  ds.onload=function(){
    var cur=getLang();
    if(cur&&cur!=="en") applyDict(cur);
  };
  document.head.appendChild(ds);

  if(!mountBar()){
    var poll=setInterval(function(){ if(mountBar()) clearInterval(poll); }, 50);
    setTimeout(function(){clearInterval(poll);},10000);
  }
})();
