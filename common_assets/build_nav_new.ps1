$root = "C:\projects\sc_web"
$masterCommon = "$root\common_assets"
$utf8 = [System.Text.UTF8Encoding]::new($false)

$orderedDomains = @(
    @{ repo = "sc-sistarcompany";  label = "\uD83D\uDD3A sistar company" },
    @{ repo = "qubit-algorithm";   label = "\uD83D\uDD3A qubit-algorithm" },
    @{ repo = "intelligence-core"; label = "\uD83D\uDD3A intelligence-core" },
    @{ repo = "scarlet-ai";        label = "\uD83D\uDD3A scarlet-ai" },
    @{ repo = "qubit-biz";         label = "\uD83D\uDD3A qubit-biz" },
    @{ repo = "biz-galaxy";        label = "\uD83D\uDD3A biz-galaxy" },
    @{ repo = "biz-hub";           label = "\uD83D\uDD3A biz-hub" },
    @{ repo = "challengers";       label = "\uD83D\uDD39 challengers" },
    @{ repo = "partnership";       label = "\uD83D\uDD39 partnership" },
    @{ repo = "ir-pitchdeck";      label = "\uD83D\uDD39 ir-pitchdeck" },
    @{ repo = "biz-directory";     label = "\u25AB\uFE0Fbiz-directory" },
    @{ repo = "media";             label = "\uD83D\uDD3A media" }
)

$ignoreDirs = @(".git", "common_assets", "mgt", "mgnt", "common_assets_web", "storage", "varients", "reverse_engineering", "legacy_staging", "node_modules")

function Format-MenuTitle($folderName, $prefixIcon) {
    $clean = $folderName -replace '^\d+[_-]', ''
    $clean = $clean -replace '--', ': ' -replace '__', ': '
    $clean = $clean -replace '\+', '/'
    $clean = $clean -replace '-', ' '
    $clean = $clean -replace '~', '-'
    $clean = $clean -replace '\s+', ' '
    if ($clean -eq "sc") { $clean = "*sc" }
    elseif ($clean -eq "and i") { $clean = "& I" }
    elseif ($clean -eq "mall sistv") { $clean = "mall.sisTV" }
    return "$prefixIcon $clean"
}

$menuTree = @()

foreach ($d in $orderedDomains) {
    $repoName = $d.repo
    $dPath = Join-Path $root $repoName
    if (-not (Test-Path "$dPath\index.html")) { continue }

    $allDirs2 = Get-ChildItem -Path $dPath -Directory
    $lvl2Folders = @()
    foreach ($dir2 in $allDirs2) {
        if ($ignoreDirs -notcontains $dir2.Name) { $lvl2Folders += $dir2 }
    }
    $lvl2Folders = Sort-Object -InputObject $lvl2Folders -Property Name

    $childrenList = @()

    foreach ($l2 in $lvl2Folders) {
        if (-not (Test-Path (Join-Path $l2.FullName "index.html"))) { continue }

        $l2Title = Format-MenuTitle $l2.Name "\uD83D\uDD38"
        $allDirs3 = Get-ChildItem -Path $l2.FullName -Directory
        $lvl3Folders = @()
        foreach ($dir3 in $allDirs3) {
            if ($ignoreDirs -notcontains $dir3.Name) { $lvl3Folders += $dir3 }
        }
        $lvl3Folders = Sort-Object -InputObject $lvl3Folders -Property Name

        $l3Items = @()
        foreach ($l3 in $lvl3Folders) {
            if (-not (Test-Path (Join-Path $l3.FullName "index.html"))) { continue }

            $l3Title = Format-MenuTitle $l3.Name "\u25AB\uFE0F"
            $l3Items += @{
                title  = $l3Title
                folder = $l3.Name
            }
        }

        $childrenList += @{
            title = $l2Title
            path  = $l2.Name
            items = $l3Items
        }
    }

    $menuTree += @{
        title    = $d.label
        repo     = $repoName
        children = $childrenList
    }
}

$jsonMenu = (ConvertTo-Json -InputObject $menuTree -Depth 6 -Compress) -replace '\\\\u', '\u'

$navNewJs = @"
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

  const MENU_STRUCTURE = $jsonMenu;

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
        const l3Arr = Array.isArray(l2.items) ? l2.items : (l2.items ? [l2.items] : []);
        if (l3Arr.length > 0) {
          l3Html = '<div class="sc-l3-wrap"><div class="sc-l3-inner">' +
            l3Arr.map(it => {
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
"@

[System.IO.File]::WriteAllLines("$masterCommon\nav_new.js", $navNewJs, $utf8)

foreach ($d in $orderedDomains) {
    $dCommon = Join-Path $root "$($d.repo)\common_assets"
    $null = New-Item -ItemType Directory -Path $dCommon -Force
    Copy-Item -Path "$masterCommon\nav_new.js" -Destination "$dCommon\nav_new.js" -Force
}

Write-Host "[OK] Mobile Two-Tap Accordion Engine Updated!" -ForegroundColor Green

# Custom label overrides for exact navigator display
$navJsFile = "C:\projects\sc_web\common_assets\nav_new.js"
if (Test-Path $navJsFile) {
    $njContent = [System.IO.File]::ReadAllText($navJsFile, [System.Text.UTF8Encoding]::new($false))
    $labelMap = @{
        '"label": "can ceo action note"'      = '"label": "c.a.n. ceo action note"'
        '"label": "sispet  petfood general"'  = '"label": "sispet - petfood general"'
        '"label": "sispet petfood general"'   = '"label": "sispet - petfood general"'
        '"label": "sistar medix  petclinic"'  = '"label": "sistar medix - petclinic"'
        '"label": "sistar medix petclinic"'   = '"label": "sistar medix - petclinic"'
        '"label": "aquasis  marine aquarium"' = '"label": "aquasis - marine aquarium"'
        '"label": "aquasis marine aquarium"'  = '"label": "aquasis - marine aquarium"'
        '"label": "sisayurvedic  ayurveda"'   = '"label": "sisayurvedic - ayurveda"'
        '"label": "sisayurvedic ayurveda"'    = '"label": "sisayurvedic - ayurveda"'
        '"label": "sistar edu  education"'    = '"label": "sistar edu - education"'
        '"label": "sistar edu education"'     = '"label": "sistar edu - education"'
        '"label": "sismii  beauty"'           = '"label": "sismii - beauty"'
        '"label": "sismii beauty"'            = '"label": "sismii - beauty"'
        '"label": "sistar dx  diagnostics"'   = '"label": "sistar dx - diagnostics"'
        '"label": "sistar dx diagnostics"'    = '"label": "sistar dx - diagnostics"'
        '"label": "sispharm  livestock"'      = '"label": "sispharm - livestock"'
        '"label": "sispharm livestock"'       = '"label": "sispharm - livestock"'
        '"label": "sisloa  apparel"'          = '"label": "sisloa - apparel"'
        '"label": "sisloa apparel"'           = '"label": "sisloa - apparel"'
        '"label": "sistar and co"'            = '"label": "sistar& co"'
        '"label": "sistar & co"'              = '"label": "sistar& co"'
    }
    foreach ($k in $labelMap.Keys) {
        $njContent = $njContent.Replace($k, $labelMap[$k])
    }
    [System.IO.File]::WriteAllText($navJsFile, $njContent, [System.Text.UTF8Encoding]::new($false))
}

# Custom label overrides for qubit-algorithm (ensure comma in "one spark, biz galaxifying")
$navJsFile = "C:\projects\sc_web\common_assets\nav_new.js"
if (Test-Path $navJsFile) {
    $njContent = [System.IO.File]::ReadAllText($navJsFile, [System.Text.UTF8Encoding]::new($false))
    $njContent = $njContent.Replace('"label": "one spark biz galaxifying"', '"label": "one spark, biz galaxifying"')
    $njContent = $njContent.Replace('"label":"one spark biz galaxifying"', '"label":"one spark, biz galaxifying"')
    [System.IO.File]::WriteAllText($navJsFile, $njContent, [System.Text.UTF8Encoding]::new($false))
}

# Clean ampersand labels in nav_new.js
$navJsFile = "C:\projects\sc_web\common_assets\nav_new.js"
if (Test-Path $navJsFile) {
    $nj = [System.IO.File]::ReadAllText($navJsFile, [System.Text.UTF8Encoding]::new($false))
    $nj = $nj.Replace(' and ', ' & ')
    $nj = $nj.Replace('"rewards spirits & community"', '"rewards, spirits & community"')
    $nj = $nj.Replace('"the sistar herald & kpop hunters"', '"the sistar herald & k-pop hunters"')
    [System.IO.File]::WriteAllText($navJsFile, $nj, [System.Text.UTF8Encoding]::new($false))
}
