(function() {
  const isFile = location.protocol === 'file:';
  const isTouchDevice = () => window.innerWidth <= 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  function resolveUrl(repoFolder, subPath) {
    const cleanSub = subPath ? subPath.replace(/^\/+|\/+$/g, '') : '';
    if (isFile) {
      const fullPath = location.pathname.replace(/\\/g, '/');
      const idx = fullPath.toLowerCase().indexOf('/sc_web/');
      const base = idx !== -1 ? fullPath.substring(0, idx + 8) : '/C:/projects/sc_web/';
      return cleanSub ? 'file://' + base + repoFolder + '/' + cleanSub + '/index.html' : 'file://' + base + repoFolder + '/index.html';
    }
    const domain = repoFolder === 'sc-sistarcompany' ? 'https://sistarcompany.com' : 'https://' + repoFolder + '.sistarcompany.com';
    return cleanSub ? domain + '/' + cleanSub + '/' : domain + '/';
  }

  const MENU_STRUCTURE = [{"title":"\uD83D\uDD3A sistar company","repo":"sc-sistarcompany","children":[{"title":"\uD83D\uDD38 *sc","path":"01_sc","items":[{"folder":"01_signal-star","title":"\u25AB\uFE0F signal star"},{"folder":"02_sistar-company","title":"\u25AB\uFE0F sistar company"},{"folder":"03_identity-signatures","title":"\u25AB\uFE0F identity signatures"}]},{"title":"\uD83D\uDD38 sistar intl","path":"02_sistar-intl","items":[{"folder":"01_sc-korea","title":"\u25AB\uFE0F sc korea"},{"folder":"02_sc-indonesia","title":"\u25AB\uFE0F sc indonesia"},{"folder":"03_sc-vietnam","title":"\u25AB\uFE0F sc vietnam"},{"folder":"04_sc-singapore","title":"\u25AB\uFE0F sc singapore"},{"folder":"05_sc-china","title":"\u25AB\uFE0F sc china"},{"folder":"06_sc-japan","title":"\u25AB\uFE0F sc japan"},{"folder":"07_sc-usa","title":"\u25AB\uFE0F sc usa"},{"folder":"08_sc-india","title":"\u25AB\uFE0F sc india"}]},{"title":"\uD83D\uDD38 associations intl","path":"03_associations-intl","items":[{"folder":"01_intl-ai-trade-alliance","title":"\u25AB\uFE0F intl ai trade alliance"},{"folder":"02_intl-ai-data-alliance","title":"\u25AB\uFE0F intl ai data alliance"}]}]},{"title":"\uD83D\uDD3A qubit-algorithm","repo":"qubit-algorithm","children":[{"title":"\uD83D\uDD38 qubit algorithm","path":"01_qubit-algorithm","items":[]},{"title":"\uD83D\uDD38 cosmoseed biz model","path":"02_cosmoseed-biz-model","items":[]}]},{"title":"\uD83D\uDD3A intelligence-core","repo":"intelligence-core","children":[{"title":"\uD83D\uDD38 biz intelligence","path":"01_biz-intelligence","items":[{"folder":"01_qubit-erp","title":"\u25AB\uFE0F qubit erp"},{"folder":"02_ai-centers","title":"\u25AB\uFE0F ai centers"},{"folder":"03_rag-fine-tuning","title":"\u25AB\uFE0F rag fine tuning"},{"folder":"04_intelligence-on-tab-hr","title":"\u25AB\uFE0F intelligence on tab hr"},{"folder":"05_dynamic-pricing-fce","title":"\u25AB\uFE0F dynamic pricing fce"},{"folder":"06_bnpl-fce","title":"\u25AB\uFE0F bnpl fce"},{"folder":"07_smart-logistics","title":"\u25AB\uFE0F smart logistics"},{"folder":"08_space-sharing-warehousing","title":"\u25AB\uFE0F space sharing warehousing"},{"folder":"09_open-accounts-sales","title":"\u25AB\uFE0F open accounts sales"},{"folder":"10_project-generator","title":"\u25AB\uFE0F project generator"},{"folder":"12_scarlet-web-working","title":"\u25AB\uFE0F scarlet web working"}]},{"title":"\uD83D\uDD38 ai commerce","path":"02_ai-commerce","items":[]},{"title":"\uD83D\uDD38 intl ai trade","path":"03_intl-ai-trade","items":[]},{"title":"\uD83D\uDD38 robotics physical ai","path":"04_robotics-physical-ai","items":[]},{"title":"\uD83D\uDD38 agent builder","path":"05_agent-builder","items":[]},{"title":"\uD83D\uDD38 work automation","path":"06_work-automation","items":[]},{"title":"\uD83D\uDD38 exo brain","path":"07_exo-brain","items":[]},{"title":"\uD83D\uDD38 data factory","path":"08_data-factory","items":[]},{"title":"\uD83D\uDD38 money making designs","path":"09_money-making-designs","items":[]},{"title":"\uD83D\uDD38 brand new online delights","path":"10_brand-new-online-delights","items":[]},{"title":"\uD83D\uDD38 brand new ai delights","path":"11_brand-new-ai-delights","items":[]},{"title":"\uD83D\uDD38 web builder","path":"12_web-builder","items":[]},{"title":"\uD83D\uDD38 browser works","path":"13_browser-works","items":[]},{"title":"\uD83D\uDD38 ai secretary","path":"14_ai-secretary","items":[]}]},{"title":"\uD83D\uDD3A scarlet-ai","repo":"scarlet-ai","children":[{"title":"\uD83D\uDD38 intl ai trading platform","path":"01_intl-ai-trading-platform","items":[]},{"title":"\uD83D\uDD38 ai commerce platform ind","path":"02_ai-commerce-platform-ind","items":[]},{"title":"\uD83D\uDD38 mall.sisTV","path":"03_mall-sistv","items":[]},{"title":"\uD83D\uDD38 robot market","path":"04_robot-market","items":[]},{"title":"\uD83D\uDD38 on demand","path":"05_on-demand","items":[]},{"title":"\uD83D\uDD38 b2b","path":"06_b2b","items":[]},{"title":"\uD83D\uDD38 resell","path":"07_resell","items":[]},{"title":"\uD83D\uDD38 siscart nearbuy","path":"08_siscart-nearbuy","items":[]},{"title":"\uD83D\uDD38 zero wastage","path":"09_zero-wastage","items":[]},{"title":"\uD83D\uDD38 sisdiet","path":"10_sisdiet","items":[]}]},{"title":"\uD83D\uDD3A qubit-biz","repo":"qubit-biz","children":[{"title":"\uD83D\uDD38 qubit erp","path":"01_qubit-erp","items":[]},{"title":"\uD83D\uDD38 can ceo action note ai","path":"02_can-ceo-action-note-ai","items":[]},{"title":"\uD83D\uDD38 qubit marketplace","path":"03_qubit-marketplace","items":[]},{"title":"\uD83D\uDD38 qubit planet games","path":"04_qubit-planet-games","items":[]},{"title":"\uD83D\uDD38 qubit mkt","path":"05_qubit-mkt","items":[{"folder":"01_qubit-affiliators-program","title":"\u25AB\uFE0F qubit affiliators program"}]},{"title":"\uD83D\uDD38 qubit bank","path":"06_qubit-bank","items":[{"folder":"01_time-bank-space-bank-idea-bank","title":"\u25AB\uFE0F time bank space bank idea bank"},{"folder":"02_petfood-bank","title":"\u25AB\uFE0F petfood bank"}]},{"title":"\uD83D\uDD38 exo brain","path":"07_exo-brain","items":[{"folder":"01_and-i","title":"\u25AB\uFE0F \u0026 I"}]},{"title":"\uD83D\uDD38 qubit star","path":"08_qubit-star","items":[]},{"title":"\uD83D\uDD38 qubit ads","path":"09_qubit-ads","items":[]},{"title":"\uD83D\uDD38 qubit taxes","path":"10_qubit-taxes","items":[]},{"title":"\uD83D\uDD38 qubit knowledge networks","path":"11_qubit-knowledge-networks","items":[]},{"title":"\uD83D\uDD38 qubit robot","path":"12_qubit-robot","items":[]},{"title":"\uD83D\uDD38 qubit web builder","path":"13_qubit-web-builder","items":[]}]},{"title":"\uD83D\uDD3A biz-galaxy","repo":"biz-galaxy","children":[{"title":"\uD83D\uDD38 mind sistar mind company","path":"01_mind-sistar-mind-company","items":[{"folder":"01_sistar-mind-company","title":"\u25AB\uFE0F sistar mind company"},{"folder":"02_mind-navi","title":"\u25AB\uFE0F mind navi"},{"folder":"03_nfq","title":"\u25AB\uFE0F nfq"},{"folder":"04_ai-companion","title":"\u25AB\uFE0F ai companion"},{"folder":"05_mind-test","title":"\u25AB\uFE0F mind test"}]},{"title":"\uD83D\uDD38 petfood general sispet","path":"02_petfood-general-sispet","items":[{"folder":"01_scarlet-the-cat","title":"\u25AB\uFE0F scarlet the cat"},{"folder":"02_forever-young-dog","title":"\u25AB\uFE0F forever young dog"},{"folder":"03_nbs","title":"\u25AB\uFE0F nbs"},{"folder":"04_dazzle","title":"\u25AB\uFE0F dazzle"},{"folder":"05_ca-kr","title":"\u25AB\uFE0F ca kr"}]},{"title":"\uD83D\uDD38 pet clinic sistar medix","path":"03_pet-clinic-sistar-medix","items":[{"folder":"01_chd","title":"\u25AB\uFE0F chd"},{"folder":"02_sistar-medix-clinical-edition","title":"\u25AB\uFE0F sistar medix clinical edition"},{"folder":"03_sistar-medix-botanical-edition","title":"\u25AB\uFE0F sistar medix botanical edition"}]},{"title":"\uD83D\uDD38 marine aquasis ai","path":"04_marine-aquasis-ai","items":[{"folder":"01_sis-marine","title":"\u25AB\uFE0F sis marine"}]},{"title":"\uD83D\uDD38 ayurvedic therapy sistar a t","path":"05_ayurvedic-therapy-sistar-a-t","items":[]},{"title":"\uD83D\uDD38 edu sistar e i","path":"06_edu-sistar-e-i","items":[{"folder":"01_edu-institute-knowledge-to-flex","title":"\u25AB\uFE0F edu institute knowledge to flex"},{"folder":"02_flexkids-ai","title":"\u25AB\uFE0F flexkids ai"}]},{"title":"\uD83D\uDD38 food sis food","path":"07_food-sis-food","items":[{"folder":"01_sis-proteins","title":"\u25AB\uFE0F sis proteins"},{"folder":"02_jave-nature-premium","title":"\u25AB\uFE0F jave nature premium"}]},{"title":"\uD83D\uDD38 lifestyle goods sistar l g","path":"08_lifestyle-goods-sistar-l-g","items":[]},{"title":"\uD83D\uDD38 media sistar studio","path":"09_media-sistar-studio","items":[{"folder":"01_studio-butter","title":"\u25AB\uFE0F studio butter"}]},{"title":"\uD83D\uDD38 beauty sismii","path":"10_beauty-sismii","items":[]},{"title":"\uD83D\uDD38 diagnostics sistar d x","path":"11_diagnostics-sistar-d-x","items":[]},{"title":"\uD83D\uDD38 livestock sispharm","path":"12_livestock-sispharm","items":[]},{"title":"\uD83D\uDD38 apparel sisloa","path":"13_apparel-sisloa","items":[]}]},{"title":"\uD83D\uDD3A biz-hub","repo":"biz-hub","children":[{"title":"\uD83D\uDD38 sistar co","path":"01_sistar-co","items":[]},{"title":"\uD83D\uDD38 sistar br brands","path":"02_sistar-br-brands","items":[]},{"title":"\uD83D\uDD38 intl tech trading","path":"03_intl-tech-trading","items":[]},{"title":"\uD83D\uDD38 intl data factory","path":"04_intl-data-factory","items":[]},{"title":"\uD83D\uDD38 biz campaigns","path":"05_biz-campaigns","items":[{"folder":"01_zero-wastage-movement","title":"\u25AB\uFE0F zero wastage movement"}]},{"title":"\uD83D\uDD38 sistar frenz franchiseship","path":"06_sistar-frenz-franchiseship","items":[{"folder":"01_sistar-mint-colored-shop","title":"\u25AB\uFE0F sistar mint colored shop"},{"folder":"02_suu","title":"\u25AB\uFE0F suu"},{"folder":"03_iruka-is-back","title":"\u25AB\uFE0F iruka is back"},{"folder":"04_sistar-lp-my-neighbour-lifestyle","title":"\u25AB\uFE0F sistar lp my neighbour lifestyle"}]},{"title":"\uD83D\uDD38 nfq","path":"07_nfq","items":[{"folder":"01_sistar-solutions","title":"\u25AB\uFE0F sistar solutions"}]}]},{"title":"\uD83D\uDD39 challengers","repo":"challengers","children":[{"title":"\uD83D\uDD38 sistar challengers","path":"01_sistar-challengers","items":[{"folder":"01_sistar-challengers-intl","title":"\u25AB\uFE0F sistar challengers intl"}]},{"title":"\uD83D\uDD38 sistar vibe working","path":"02_sistar-vibe-working","items":[]}]},{"title":"\uD83D\uDD39 partnership","repo":"partnership","children":[{"title":"\uD83D\uDD38 biiz partnership","path":"01_biiz-partnership","items":[]}]},{"title":"\uD83D\uDD39 ir-pitchdeck","repo":"ir-pitchdeck","children":[{"title":"\uD83D\uDD38 report","path":"01_report","items":[]}]},{"title":"\u25AB\uFE0Fbiz-directory","repo":"biz-directory","children":[]},{"title":"\uD83D\uDD3A media","repo":"media","children":[{"title":"\uD83D\uDD38 sistar studio","path":"01_sistar-studio","items":[]},{"title":"\uD83D\uDD38 the sistar post","path":"02_the-sistar-post","items":[]}]}];

  function buildNavigator() {
    if (document.getElementById('sc-left-nav')) return;
    const isMobileInit = window.innerWidth <= 768;
    document.body.classList.remove('sc-nav-open', 'sc-nav-folded');
    document.body.classList.add(isMobileInit ? 'sc-nav-folded' : 'sc-nav-open');

    const nav = document.createElement('aside');
    nav.id = 'sc-left-nav';

    const searchIndex = [];
    let treeHtml = '';

    MENU_STRUCTURE.forEach(l1 => {
      const l1Url = resolveUrl(l1.repo, '');
      searchIndex.push({ title: l1.title, path: '1st Level Domain', url: l1Url });

      let l2Html = '';
      (l1.children || []).forEach(l2 => {
        const l2Url = resolveUrl(l1.repo, l2.path);
        searchIndex.push({ title: l2.title, path: l1.title, url: l2Url });

        let l3Html = '';
        if (l2.items && l2.items.length > 0) {
          l3Html = '<div class="sc-l3-wrap"><div class="sc-l3-inner">' +
            l2.items.map(it => {
              const l3Url = resolveUrl(l1.repo, l2.path + '/' + it.folder);
              searchIndex.push({ title: it.title, path: l1.title + ' > ' + l2.title, url: l3Url });
              return '<a class="sc-l3-link" href="' + l3Url + '">' + it.title + '</a>';
            }).join('') +
            '</div></div>';
        }

        l2Html += '<div class="sc-l2-item" data-l2="' + l2.path + '"><a class="sc-l2-link" href="' + l2Url + '">' + l2.title + '</a>' + l3Html + '</div>';
      });

      treeHtml += '<div class="sc-l1-item" data-repo="' + l1.repo + '"><a class="sc-l1-link" href="' + l1Url + '">' + l1.title + '</a><div class="sc-l2-wrap"><div class="sc-l2-inner">' + l2Html + '</div></div></div>';
    });

    const homeUrl = resolveUrl('sc-sistarcompany', '');

    nav.innerHTML = '<div><div class="sc-nav-top"><a href="' + homeUrl + '" class="sc-brand-link"><span class="sc-brand-full">*sc - sistar company</span><span class="sc-brand-short">*sc</span></a><div class="sc-nav-actions"><button class="sc-plain-btn sc-search-btn" id="sc-search-btn" title="Search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><line x1="20" y1="20" x2="16.2" y2="16.2"></line></svg></button><button class="sc-plain-btn" id="sc-fold-btn" title="Toggle Menu"><svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button></div></div><div class="sc-search-wrap" id="sc-search-wrap"><input type="text" class="sc-search-input" id="sc-search-input" placeholder="Search universe..." autocomplete="off" /><div class="sc-search-dropdown" id="sc-search-dropdown"></div></div></div><div class="sc-nav-scroll" id="sc-nav-scroll">' + treeHtml + '</div><div class="sc-nav-bottom"><div class="sc-copy-toast" id="sc-copy-toast">Copied: sc@sistarcompany.com</div><button class="sc-mono-icon" id="sc-copy-email" title="Copy sc@sistarcompany.com"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg></button><div class="sc-social-group"><a class="sc-mono-icon" href="https://youtube.com" target="_blank" rel="noopener" title="YouTube"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"></rect><polygon points="10 9 15 12 10 15 10 9"></polygon></svg></a><a class="sc-mono-icon" href="https://instagram.com" target="_blank" rel="noopener" title="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a><a class="sc-mono-icon" href="https://x.com" target="_blank" rel="noopener" title="X"><svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20"></path></svg></a><a class="sc-mono-icon" href="https://threads.net" target="_blank" rel="noopener" title="Threads"><svg viewBox="0 0 24 24"><path d="M12 12c-2-2.5-5-2.5-5 0s3 2.5 5 0c2 2.5 5 2.5 5 0s-3-2.5-5 0z"></path><circle cx="12" cy="12" r="9"></circle></svg></a></div></div>';

    document.body.prepend(nav);

    // Restore open state on desktop only (on mobile, keep clean folded drawer)
    if (!isMobileInit) {
      try {
        const savedRepo = sessionStorage.getItem('sc_open_l1');
        const savedL2 = sessionStorage.getItem('sc_open_l2');
        const savedScroll = sessionStorage.getItem('sc_nav_scroll');
        if (savedRepo) {
          const activeL1 = nav.querySelector('.sc-l1-item[data-repo="' + savedRepo + '"]');
          if (activeL1) {
            activeL1.classList.add('is-open');
            if (savedL2) {
              const activeL2 = activeL1.querySelector('.sc-l2-item[data-l2="' + savedL2 + '"]');
              if (activeL2) activeL2.classList.add('is-open');
            }
          }
        }
        if (savedScroll) document.getElementById('sc-nav-scroll').scrollTop = parseInt(savedScroll, 10);
      } catch(e) {}
    }

    const l1Items = nav.querySelectorAll('.sc-l1-item');
    const l2Items = nav.querySelectorAll('.sc-l2-item');

    // Link Click Handler: Mobile Two-Tap (1st tap opens submenu, 2nd tap navigates)
    nav.querySelectorAll('a[href]').forEach(link => {
      if (link.target === '_blank') return;
      link.addEventListener('click', e => {
        const targetUrl = link.getAttribute('href');
        if (!targetUrl || e.ctrlKey || e.metaKey || e.shiftKey) return;

        // If on Mobile / Touch screen:
        if (isTouchDevice()) {
          // 1) Tapped a Level 1 Link that has Level 2 children
          if (link.classList.contains('sc-l1-link')) {
            const parentL1 = link.closest('.sc-l1-item');
            const hasL2 = parentL1 && parentL1.querySelectorAll('.sc-l2-item').length > 0;
            if (hasL2 && !parentL1.classList.contains('is-open')) {
              e.preventDefault();
              e.stopPropagation();
              l1Items.forEach(o => {
                if (o !== parentL1) {
                  o.classList.remove('is-open');
                  o.querySelectorAll('.sc-l2-item.is-open').forEach(s => s.classList.remove('is-open'));
                }
              });
              parentL1.classList.add('is-open');
              return; // STOP HERE on 1st tap! Do not navigate!
            }
          }

          // 2) Tapped a Level 2 Link that has Level 3 children
          if (link.classList.contains('sc-l2-link')) {
            const parentL2 = link.closest('.sc-l2-item');
            const hasL3 = parentL2 && parentL2.querySelectorAll('.sc-l3-link').length > 0;
            if (hasL3 && !parentL2.classList.contains('is-open')) {
              e.preventDefault();
              e.stopPropagation();
              parentL2.parentElement.querySelectorAll('.sc-l2-item').forEach(sib => {
                if (sib !== parentL2) sib.classList.remove('is-open');
              });
              parentL2.classList.add('is-open');
              return; // STOP HERE on 1st tap! Do not navigate!
            }
          }
        }

        // Otherwise (2nd tap on opened menu, or leaf menu with no children, or Desktop click) -> Navigate!
        e.preventDefault();
        try {
          const parentL1 = link.closest('.sc-l1-item');
          const parentL2 = link.closest('.sc-l2-item');
          sessionStorage.setItem('sc_open_l1', parentL1 ? parentL1.getAttribute('data-repo') : '');
          sessionStorage.setItem('sc_open_l2', parentL2 ? parentL2.getAttribute('data-l2') : '');
          sessionStorage.setItem('sc_nav_scroll', document.getElementById('sc-nav-scroll').scrollTop);
        } catch(err) {}

        document.body.classList.add('sc-page-leaving');
        setTimeout(() => { window.location.href = targetUrl; }, 180);
      });
    });

    // Desktop Hover Timers (Disabled on touch devices so submenus never auto-close or conflict)
    const OPEN_DELAY = 480;
    const CLOSE_DELAY = 420;
    let l1OpenTimer = null, l1CloseTimer = null;

    l1Items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (isTouchDevice()) return;
        clearTimeout(l1CloseTimer); clearTimeout(l1OpenTimer);
        l1OpenTimer = setTimeout(() => {
          l1Items.forEach(o => { if (o !== item) { o.classList.remove('is-open'); o.querySelectorAll('.sc-l2-item.is-open').forEach(s => s.classList.remove('is-open')); } });
          item.classList.add('is-open');
        }, OPEN_DELAY);
      });
      item.addEventListener('mouseleave', () => {
        if (isTouchDevice()) return;
        clearTimeout(l1OpenTimer);
        l1CloseTimer = setTimeout(() => {
          item.classList.remove('is-open');
          item.querySelectorAll('.sc-l2-item.is-open').forEach(s => s.classList.remove('is-open'));
        }, CLOSE_DELAY);
      });
    });

    let l2OpenTimer = null, l2CloseTimer = null;
    l2Items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (isTouchDevice()) return;
        clearTimeout(l2CloseTimer); clearTimeout(l2OpenTimer);
        l2OpenTimer = setTimeout(() => {
          item.parentElement.querySelectorAll('.sc-l2-item').forEach(sib => { if (sib !== item) sib.classList.remove('is-open'); });
          item.classList.add('is-open');
        }, 380);
      });
      item.addEventListener('mouseleave', () => {
        if (isTouchDevice()) return;
        clearTimeout(l2OpenTimer);
        l2CloseTimer = setTimeout(() => { item.classList.remove('is-open'); }, 350);
      });
    });

    // Universal Outside Click/Touch: Fold navigator when clicking/tapping anywhere outside #sc-left-nav (PC & Mobile)
    document.addEventListener('click', e => {
      if (!document.body.classList.contains('sc-nav-open')) return;
      if (nav.contains(e.target)) return;
      document.body.classList.remove('sc-nav-open');
      document.body.classList.add('sc-nav-folded');
      nav.querySelectorAll('.is-open').forEach(el => el.classList.remove('is-open'));
      const sw = document.getElementById('sc-search-wrap');
      const sd = document.getElementById('sc-search-dropdown');
      if (sw) sw.classList.remove('active');
      if (sd) sd.classList.remove('show');
    });

    document.getElementById('sc-fold-btn').addEventListener('click', () => {
      const folded = document.body.classList.toggle('sc-nav-folded');
      document.body.classList.toggle('sc-nav-open', !folded);
    });

    const searchWrap = document.getElementById('sc-search-wrap');
    const searchInput = document.getElementById('sc-search-input');
    const searchDropdown = document.getElementById('sc-search-dropdown');

    document.getElementById('sc-search-btn').addEventListener('click', () => {
      searchWrap.classList.toggle('active');
      if (searchWrap.classList.contains('active')) searchInput.focus();
      else searchDropdown.classList.remove('show');
    });

    searchInput.addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) { searchDropdown.classList.remove('show'); return; }
      const matches = searchIndex.filter(it => it.title.toLowerCase().includes(q) || it.path.toLowerCase().includes(q));
      searchDropdown.innerHTML = matches.length
        ? matches.map(m => '<a class="sc-search-item" href="' + m.url + '"><span class="sc-search-item-t">' + m.title + '</span><span class="sc-search-item-p">' + m.path + '</span></a>').join('')
        : '<div class="sc-search-item"><span class="sc-search-item-p">No matching results</span></div>';
      searchDropdown.classList.add('show');
    });

    document.addEventListener('click', e => {
      if (!searchWrap.contains(e.target) && e.target.id !== 'sc-search-btn') searchDropdown.classList.remove('show');
    });

    document.getElementById('sc-copy-email').addEventListener('click', () => {
      navigator.clipboard.writeText('sc@sistarcompany.com').catch(() => {});
      const toast = document.getElementById('sc-copy-toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildNavigator);
  else buildNavigator();
})();
