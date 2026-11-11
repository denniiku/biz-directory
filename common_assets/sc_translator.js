(function(){
  if(window.__scTransInit)return; window.__scTransInit=true;
  if(!document.getElementById("sc-tr-css")){
    var st=document.createElement("style"); st.id="sc-tr-css";
    st.textContent="iframe.goog-te-banner-frame,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.VIpgJd-ZVi9od-ORHb-OEVmcd{display:none!important;visibility:hidden!important;}body{top:0!important;position:static!important;}#google_translate_element_hidden{display:none!important;}.sc-lang-bar{display:flex!important;align-items:center!important;justify-content:flex-start!important;padding:0 12px 8px 20px!important;margin:0 0 4px 0!important;background:transparent!important;border:none!important;box-shadow:none!important;border-radius:0!important;font-family:'Space Grotesk',sans-serif!important;box-sizing:border-box!important;}.sc-lang-btns{display:flex!important;align-items:center!important;justify-content:flex-start!important;width:auto!important;gap:14px!important;}.sc-lang-btn{flex:0 0 auto!important;text-align:left!important;background:transparent!important;border:none!important;border-bottom:2px solid transparent!important;padding:2px 0 3px 0!important;font-family:'Space Grotesk',sans-serif!important;font-size:0.84rem!important;font-weight:600!important;text-transform:lowercase!important;color:#526D82!important;border-radius:0!important;cursor:pointer!important;line-height:1.1!important;transition:color 0.15s ease,border-color 0.15s ease!important;}.sc-lang-btn:hover{background:transparent!important;color:#27374D!important;border-bottom:2px solid #168765!important;}.sc-lang-btn.active{background:transparent!important;color:#27374D!important;font-weight:700!important;border-bottom:2px solid #168765!important;}body.sc-nav-folded .sc-lang-bar,#sc-left-nav.folded .sc-lang-bar,#sc-left-nav.sc-folded .sc-lang-bar{display:none!important;}@media print{.sc-lang-bar{display:none!important;}}";
    document.head.appendChild(st);
  }
  var p=location.pathname.replace(/\\/g,"/"), b="/common_assets/";
  if(location.protocol==="file:"){var idx=p.toLowerCase().indexOf("/sc_web/");b=idx!==-1?"file://"+p.substring(0,idx+8)+"common_assets/":"./common_assets/";}
  var ds=document.createElement("script"); ds.src=b+"sc_translations.js"; document.head.appendChild(ds);

  function normKey(s){
    return (s||"").toLowerCase().replace(/[^a-z0-9]+/g,"");
  }

  function upgradeBreadcrumb(){
    try{
      var nav=document.getElementById("sc-left-nav");
      var m=document.querySelector("main");
      if(!nav||!m)return;
      var routeEl=m.querySelector(".sc-route,.sc-eyebrow,.breadcrumb,.page-path");
      if(!routeEl){
        var h1=m.querySelector("h1"), ps=m.querySelectorAll("p,div");
        for(var i=0;i<Math.min(ps.length,6);i++){
          var el=ps[i], tx=(el.textContent||"").trim();
          var bH1=h1&&(el.compareDocumentPosition(h1)&Node.DOCUMENT_POSITION_FOLLOWING);
          if(bH1&&tx.length>3&&tx.length<140&&tx.indexOf(" - ")!==-1&&!el.querySelector("p,div,h1")){
            routeEl=el; break;
          }
        }
      }
      if(!routeEl||routeEl.querySelector(".sc-bc-wrap"))return;

      var raw=(routeEl.textContent||"").replace(/_ver\d+/gi,"").trim();
      var parts=raw.split(/\s+-\s+|\s+›\s+|\s+>\s+/);
      if(parts.length<=1)return;

      var linkMap={};
      var navLinks=nav.querySelectorAll("a.sc-l1-link,a.sc-l2-link,a.sc-l3-link");
      for(var k=0;k<navLinks.length;k++){
        var a=navLinks[k], nk=normKey(a.textContent||"");
        if(nk&&!linkMap[nk])linkMap[nk]=a.getAttribute("href");
      }

      var isFile=(location.protocol==="file:");
      var html='<span class="sc-bc-wrap notranslate" translate="no">';
      for(var idx=0;idx<parts.length;idx++){
        var lbl=parts[idx].trim();
        var isLast=(idx===parts.length-1);
        if(idx>0)html+='<span class="sc-bc-sep">&rsaquo;</span>';
        if(isLast){
          html+='<span class="sc-bc-curr">'+lbl+'</span>';
        }else{
          var key=normKey(lbl);
          var href=linkMap[key]||"";
          if(!href){
            var up=(parts.length-1)-idx, pre="";
            for(var u=0;u<up;u++)pre+="../";
            href=isFile?(pre+"index.html"):pre;
          }
          html+='<a class="sc-bc-item" href="'+href+'">'+lbl+'</a>';
        }
      }
      html+='</span>';
      routeEl.innerHTML=html;
      routeEl.classList.add("notranslate");
      routeEl.setAttribute("translate","no");
    }catch(e){}
  }

  function lockRoutesAndTitles(){
    try{
      upgradeBreadcrumb();
      var nav=document.getElementById("sc-left-nav");
      if(nav){nav.classList.add("notranslate");nav.setAttribute("translate","no");}
      var q="main h1,main h2,main h3,main h4,.sc-route,.sc-eyebrow,.sc-bc-wrap,.sc-kicker,.sc-tag,.sc-num-label,.sc-num,.sc-stat-big,.sc-kpi-val,.sc-phrase-pill,.sc-action-btns,.sc-minimal-dl-item>summary,.sc-minimal-dl-actions,.sc-test02-h1,.sc-landing-hero,.sc-landing-sub,svg,code,pre,.sc-table th,.sc-top-bar";
      var ns=document.querySelectorAll(q);
      for(var i=0;i<ns.length;i++){ns[i].classList.add("notranslate");ns[i].setAttribute("translate","no");}
    }catch(e){}
  }

  function applyDict(lang){
    try{
      var d=(window.SC_AI_TRANSLATIONS&&window.SC_AI_TRANSLATIONS[lang])?window.SC_AI_TRANSLATIONS[lang]:null;
      var ts=document.querySelectorAll("main p,main li,main td,main .sc-callout,main .sc-lead,main .sc-sub");
      for(var i=0;i<ts.length;i++){
        var el=ts[i];
        if(el.classList.contains("notranslate")&&!el.getAttribute("data-sc-pre"))continue;
        if(el.closest&&(el.closest(".sc-top-bar")||el.closest(".sc-bc-wrap")))continue;
        if(!el.getAttribute("data-sc-oh")){
          el.setAttribute("data-sc-oh",el.innerHTML);
          el.setAttribute("data-sc-ot",(el.textContent||"").replace(/\s+/g," ").trim());
        }
        if(lang==="en"){
          var oh=el.getAttribute("data-sc-oh"); if(oh)el.innerHTML=oh;
          if(el.getAttribute("data-sc-pre")==="1"){el.classList.remove("notranslate");el.removeAttribute("translate");el.removeAttribute("data-sc-pre");}
          continue;
        }
        var ot=el.getAttribute("data-sc-ot");
        if(d&&ot&&d[ot]){el.textContent=d[ot];el.setAttribute("data-sc-pre","1");el.classList.add("notranslate");el.setAttribute("translate","no");}
      }
    }catch(e){}
  }

  function polishTerms(){
    try{
      var cs=document.querySelectorAll("main p,main li,main td,main .sc-callout");
      var reps=[[/시스타\s*컴퍼니|시스타\s*회사/g,"SISTAR Company"],[/시그널\s*스타\s*유니버스|신호별\s*우주/g,"Signal Star Universe"],[/시그널\s*스타|신호별/g,"Signal Star"],[/큐비트\s*알고리즘|양자비트\s*알고리즘/g,"Qubit Algorithm™"],[/큐비트\s*비즈/g,"qubit-biz"],[/큐비트\s*ERP/g,"Qubit ERP"],[/큐비트\s*뱅크/g,"Qubit Bank"],[/스칼렛\s*AI|스칼렛-ai/gi,"scarlet-ai"],[/인텔리전스\s*코어|지능\s*코어/g,"intelligence-core"],[/비즈\s*갤럭시/g,"biz-galaxy"],[/비즈\s*허브/g,"biz-hub"],[/코스모\s*시드/g,"Cosmo Seed"],[/그만큼\s*(Signal\s*Star)/g,"$1"]];
      for(var i=0;i<cs.length;i++){
        if(cs[i].getAttribute("data-sc-pre")==="1")continue;
        var w=document.createTreeWalker(cs[i],NodeFilter.SHOW_TEXT,null,false), n;
        while((n=w.nextNode())){
          var v=n.nodeValue, ch=false;
          for(var r=0;r<reps.length;r++){if(reps[r][0].test(v)){v=v.replace(reps[r][0],reps[r][1]);ch=true;}}
          if(ch)n.nodeValue=v;
        }
      }
    }catch(e){}
  }

  function normLangCode(raw){
    if(!raw)return "en";
    var l=raw.trim();
    if(l.toLowerCase()==="zh-cn"||l.toLowerCase()==="cn"||l.toLowerCase()==="zh")return "zh-CN";
    return l.toLowerCase();
  }
  function saveLang(l){try{var nl=normLangCode(l);window.name="sc_lang:"+nl;localStorage.setItem("sc_preferred_lang",nl);}catch(e){}}
  function getLang(){
    try{
      var u=location.search.match(/[?&]sc_lang=([a-zA-Z-]+)/i);
      if(u&&u[1]){var ul=normLangCode(u[1]);saveLang(ul);return ul;}
      if(window.name&&window.name.indexOf("sc_lang:")===0){var wl=normLangCode(window.name.split(":")[1]);if(wl){saveLang(wl);return wl;}}
      var ls=localStorage.getItem("sc_preferred_lang"); if(ls)return normLangCode(ls);
    }catch(e){}
    return "en";
  }

  document.addEventListener("click",function(e){
    var a=e.target&&e.target.closest?e.target.closest("a[href]"):null; if(!a)return;
    var h=a.getAttribute("href");
    if(!h||h.indexOf("#")===0||h.indexOf("javascript:")===0||h.indexOf("mailto:")===0||a.hasAttribute("download"))return;
    var l=getLang(); saveLang(l);
    if(l&&l!=="en"){
      var ch=h.replace(/([?&])sc_lang=[a-zA-Z-]+&?/i,"$1").replace(/[?&]$/,"");
      var sp=ch.indexOf("?")===-1?"?":"&", hi=ch.indexOf("#");
      a.setAttribute("href",hi!==-1?ch.substring(0,hi)+sp+"sc_lang="+l+ch.substring(hi):ch+sp+"sc_lang="+l);
    }
  },true);

  function setCookie(l){
    var v="/en/"+l; document.cookie="googtrans="+v+"; path=/";
    if(location.hostname&&location.hostname.indexOf(".")!==-1){
      document.cookie="googtrans="+v+"; path=/; domain="+location.hostname;
      var ps=location.hostname.split(".");
      if(ps.length>=2)document.cookie="googtrans="+v+"; path=/; domain=."+ps.slice(-2).join(".");
    }
  }
  function clearCookie(){
    var ex="; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie="googtrans="+ex;
    if(location.hostname&&location.hostname.indexOf(".")!==-1){
      document.cookie="googtrans="+ex+"; domain="+location.hostname;
      var ps=location.hostname.split(".");
      if(ps.length>=2)document.cookie="googtrans="+ex+"; domain=."+ps.slice(-2).join(".");
    }
  }

  function loadGTrans(cb){
    if(!document.getElementById("google_translate_element_hidden")){
      var d=document.createElement("div"); d.id="google_translate_element_hidden"; document.body.appendChild(d);
    }
    window.googleTranslateElementInit=function(){
      new google.translate.TranslateElement({pageLanguage:"en",includedLanguages:"en,ko,id,vi,zh-CN,ja",autoDisplay:false},"google_translate_element_hidden");
      if(cb)cb();
    };
    if(!document.getElementById("sc-gtrans-sdk")){
      var s=document.createElement("script"); s.id="sc-gtrans-sdk";
      s.src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"; s.async=true;
      document.head.appendChild(s);
    }else if(window.google&&window.google.translate&&cb)cb();
  }

  function switchLang(l,auto){
    var nl=normLangCode(l);
    lockRoutesAndTitles(); saveLang(nl);
    var bs=document.querySelectorAll(".sc-lang-btn");
    for(var i=0;i<bs.length;i++)bs[i].classList.toggle("active",bs[i].getAttribute("data-lang")===nl);
    applyDict(nl);
    if(nl==="en"){
      clearCookie();
      if(!auto){location.replace(location.href.replace(/([?&])sc_lang=[a-zA-Z-]+&?/i,"$1").replace(/[?&]$/,""));}
      return;
    }
    setCookie(nl);
    var run=function(){
      var t=0, tm=setInterval(function(){
        t++; var sel=document.querySelector(".goog-te-combo");
        if(sel){
          clearInterval(tm); sel.value=nl; sel.dispatchEvent(new Event("change"));
          setTimeout(function(){if(sel.value!==nl){sel.value=nl;sel.dispatchEvent(new Event("change"));}setTimeout(polishTerms,350);setTimeout(polishTerms,900);},120);
        }else if(t>40)clearInterval(tm);
      },90);
    };
    if(document.querySelector(".goog-te-combo"))run(); else loadGTrans(run);
  }

  function alignUnderBrandS(nav, bar){
    try{
      var brandFull=nav.querySelector(".sc-brand-full");
      if(!brandFull||!brandFull.firstChild)return;
      var tNode=brandFull.firstChild;
      if(tNode.nodeType===3&&tNode.nodeValue.length>=2){
        var r=document.createRange();
        r.setStart(tNode,1); r.setEnd(tNode,2);
        var sRect=r.getBoundingClientRect();
        var navRect=nav.getBoundingClientRect();
        if(sRect&&sRect.width>0&&navRect){
          var exactLeft=Math.round(sRect.left-navRect.left);
          if(exactLeft>5&&exactLeft<60){
            bar.style.setProperty("padding-left",exactLeft+"px","important");
          }
        }
      }
    }catch(e){}
  }

  function mountBar(){
    lockRoutesAndTitles();
    var nav=document.getElementById("sc-left-nav");
    if(!nav)return false; if(nav.querySelector(".sc-lang-bar"))return true;
    var bar=document.createElement("div"); bar.className="sc-lang-bar notranslate"; bar.setAttribute("translate","no");
    var cur=getLang(), ls=[{c:"en",l:"en"},{c:"ko",l:"kr"},{c:"id",l:"id"},{c:"vi",l:"vn"},{c:"zh-CN",l:"cn"},{c:"ja",l:"jp"}];
    var h='<div class="sc-lang-btns">';
    for(var i=0;i<ls.length;i++)h+='<button type="button" class="sc-lang-btn'+(cur===ls[i].c?" active":"")+'" data-lang="'+ls[i].c+'">'+ls[i].l+'</button>';
    bar.innerHTML=h+'</div>';
    var topWrap=nav.firstElementChild;
    var topBar=nav.querySelector(".sc-nav-top");
    if(topBar&&topBar.parentNode){
      topBar.parentNode.insertBefore(bar,topBar.nextSibling);
    }else if(topWrap){
      topWrap.appendChild(bar);
    }else{
      nav.insertBefore(bar,nav.firstChild);
    }
    alignUnderBrandS(nav,bar);
    setTimeout(function(){alignUnderBrandS(nav,bar);},60);
    var bs=bar.querySelectorAll(".sc-lang-btn");
    for(var j=0;j<bs.length;j++)bs[j].addEventListener("click",function(e){e.preventDefault();e.stopPropagation();switchLang(this.getAttribute("data-lang"),false);});
    if(cur&&cur!=="en"){setCookie(cur);setTimeout(function(){switchLang(cur,true);},150);}else loadGTrans();
    return true;
  }
  var poll=setInterval(mountBar,120); setTimeout(function(){clearInterval(poll);},10000);
})();