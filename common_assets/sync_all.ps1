$ErrorActionPreference = "Continue"
$root = "C:\projects\sc_web"
$masterCommon = "$root\common_assets"
$utf8 = [System.Text.UTF8Encoding]::new($false)

# 1. VS Code(.github/copilot-instructions.md)에 common_assets의 master_prd & master_skill 자동 연결
$skillText = if (Test-Path "$masterCommon\master_skill.md") { [System.IO.File]::ReadAllText("$masterCommon\master_skill.md", $utf8) } else { "" }
$prdText   = if (Test-Path "$masterCommon\master_prd.md")   { [System.IO.File]::ReadAllText("$masterCommon\master_prd.md", $utf8) }   else { "" }
$upgrText  = if (Test-Path "$masterCommon\upgrade_skill.md"){ [System.IO.File]::ReadAllText("$masterCommon\upgrade_skill.md", $utf8) }else { "" }

$combinedRules = @"
# MANDATORY *SC WEB SYSTEM CONSTITUTION (AUTO-SYNCED FROM common_assets)
> 1. Always apply `common_assets/master_prd.md` and `common_assets/master_skill.md` first (Base Layer), then layer any local folder `*prd*.md` / `*skill*.md` on top.
> 2. NEVER inject inline `<style>` or `<script>` hacks into individual `<page>/index.html` files for global UI. Control all global UI via `common_assets`.
> 3. After any folder, HTML, or `common_assets` update, ALWAYS run `C:\projects\sc_web\common_assets\sync_all.ps1` (or type `sc-sync`).

---
$prdText
---
$skillText
---
$upgrText
"@

[void][System.IO.Directory]::CreateDirectory("$root\.github")
[System.IO.File]::WriteAllText("$root\.github\copilot-instructions.md", $combinedRules, $utf8)
$ghDirItem = Get-Item "$root\.github" -Force
$ghDirItem.Attributes = "Directory, Hidden"

if (Test-Path "$root\.vscode") {
    $vsDirItem = Get-Item "$root\.vscode" -Force
    $vsDirItem.Attributes = "Directory, Hidden"
}

# 2. 좌측 내비게이션 메뉴(nav_new.js) 최신 폴더 구조로 자동 스캔 및 빌드
if (Test-Path "$masterCommon\build_nav_new.ps1") {
    & "$masterCommon\build_nav_new.ps1"
}

# 3. nav_new.js 맨 끝에 다국어/브레드크럼 로더(SC_TR_LOAD) 보장
$navJsPath = "$masterCommon\nav_new.js"
if (Test-Path $navJsPath) {
    $navJsText = [System.IO.File]::ReadAllText($navJsPath, $utf8)
    $trLoaderLine = '/* SC_TR_LOAD */(function(){try{var p=location.pathname.replace(/\\/g,"/"),b="/common_assets/";if(location.protocol==="file:"){var i=p.toLowerCase().indexOf("/sc_web/");b=i!==-1?"file://"+p.substring(0,i+8)+"common_assets/":"./common_assets/";}var s=document.createElement("script");s.src=b+"sc_translator.js?v="+Date.now();s.defer=true;document.head.appendChild(s);}catch(e){}})();'
    if ($navJsText -notmatch 'SC_TR_LOAD') {
        $navJsText = $navJsText.TrimEnd() + "`r`n" + $trLoaderLine + "`r`n"
        [System.IO.File]::WriteAllText($navJsPath, $navJsText, $utf8)
    }
}

# 4. 12개 도메인(독립 Git 저장소) 폴더 순회하며 common_assets 100% 미러링 & GitHub Push
$domainDirs = Get-ChildItem -Path $root -Directory | Where-Object {
    $_.Name -notin @("common_assets", ".github", ".vscode") -and (Test-Path (Join-Path $_.FullName ".git"))
}

foreach ($d in $domainDirs) {
    $targetCommon = Join-Path $d.FullName "common_assets"
    $null = robocopy $masterCommon $targetCommon /MIR /NFL /NDL /NJH /NJS /nc /ns /np

    Push-Location $d.FullName
    git config core.autocrlf false
    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m "Sync unified common_assets & structure" | Out-Null
        git push | Out-Null
        Write-Host "  [SYNCED & PUSHED] $($d.Name)" -ForegroundColor Green
    } else {
        Write-Host "  [UP-TO-DATE]      $($d.Name)" -ForegroundColor Cyan
    }
    Pop-Location
}