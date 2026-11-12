$ErrorActionPreference = "Continue"
$root = "C:\projects\sc_web"
$masterCommon = "$root\common_assets"
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Set-HiddenFile($path, $content) {
    if (Test-Path $path) {
        $it = Get-Item $path -Force
        $it.Attributes = "Normal"
    }
    [System.IO.File]::WriteAllText($path, $content, $utf8)
    $it2 = Get-Item $path -Force
    $it2.Attributes = "Hidden"
}

function Set-HiddenDir($dirPath) {
    [void][System.IO.Directory]::CreateDirectory($dirPath)
    $dItem = Get-Item $dirPath -Force
    $dItem.Attributes = "Directory, Hidden"
}

# 1. 마스터 PRD/Skill AI 지침 고정
$prdText   = if (Test-Path "$masterCommon\master_prd.md")   { [System.IO.File]::ReadAllText("$masterCommon\master_prd.md", $utf8) }   else { "" }
$skillText = if (Test-Path "$masterCommon\master_skill.md") { [System.IO.File]::ReadAllText("$masterCommon\master_skill.md", $utf8) } else { "" }

$header = "# MANDATORY *SC WEB SYSTEM CONSTITUTION (AUTO-PINNED FROM common_assets)`r`n" +
          "> [100% STRICT ENFORCEMENT FOR AGY CLI & VS CODE COPILOT]`r`n" +
          "> 1. 2-Tier Cascading Rule: Always obey common_assets/master_prd.md and common_assets/master_skill.md first (Base Layer), then layer any local folder *prd*.md or *skill*.md on top.`r`n" +
          "> 2. Centralized common_assets Governance: NEVER inject ad-hoc <style> or <script> blocks into individual <page>/index.html files for global UI.`r`n" +
          "> 3. Mandatory Sync: After any folder, HTML, or common_assets modification in the 12 public domains, run sc-sync.`r`n"

$constitution = $header + "`r`n---`r`n`r`n" + $prdText + "`r`n`r`n---`r`n`r`n" + $skillText

Set-HiddenDir "$root\.github"
Set-HiddenFile "$root\.github\copilot-instructions.md" $constitution
Write-Host "  [PINNED] Latest master_prd.md & master_skill.md pinned to VS Code & AGY CLI." -ForegroundColor Magenta

# 2. 공개 12개 도메인 내비게이터 빌드 (build_nav_new.ps1)
if (Test-Path "$masterCommon\build_nav_new.ps1") {
    & "$masterCommon\build_nav_new.ps1"
}

$navJsPath = "$masterCommon\nav_new.js"
if (Test-Path $navJsPath) {
    $navJsText = [System.IO.File]::ReadAllText($navJsPath, $utf8)
    $trLoaderLine = '/* SC_TR_LOAD */(function(){try{var p=location.pathname.replace(/\\/g,"/"),b="/common_assets/";if(location.protocol==="file:"){var i=p.toLowerCase().indexOf("/sc_web/");b=i!==-1?"file://"+p.substring(0,i+8)+"common_assets/":"./common_assets/";}var s=document.createElement("script");s.src=b+"sc_translator.js?v="+Date.now();s.defer=true;document.head.appendChild(s);}catch(e){}})();'
    if ($navJsText -notmatch "SC_TR_LOAD") {
        $navJsText = $navJsText.TrimEnd() + "`r`n" + $trLoaderLine + "`r`n"
        [System.IO.File]::WriteAllText($navJsPath, $navJsText, $utf8)
    }
}

# 2.5 공개 12개 도메인 증분 번역 자동 업데이트 (변경/추가된 문장만 Gemini API로 번역)
if ((Test-Path "$masterCommon\update_translations.js") -and $env:GEMINI_API_KEY) {
    Write-Host "  [TRANSLATIONS] Checking for new/modified English text across 12 domains..." -ForegroundColor Yellow
    node "$masterCommon\update_translations.js" sc_web
}

# 3. 오직 공개 12개 도메인만 미러링 및 GitHub Push (mgnt는 100% 제외하여 절대 간섭하지 않음)
$publicDomains = Get-ChildItem -Path $root -Directory | Where-Object {
    $_.Name -notin @("common_assets", "mgnt", "mgt", ".github", ".vscode", ".agy") -and (Test-Path (Join-Path $_.FullName ".git"))
}

foreach ($d in $publicDomains) {
    $targetCommon = Join-Path $d.FullName "common_assets"
    $null = robocopy $masterCommon $targetCommon /MIR /NFL /NDL /NJH /NJS /nc /ns /np

    Set-HiddenDir "$($d.FullName)\.github"
    Set-HiddenFile "$($d.FullName)\.github\copilot-instructions.md" $constitution

    Push-Location $d.FullName
    git config core.autocrlf false
    git config gc.auto 0
    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m "Sync public domain common_assets & structure" | Out-Null
        git push -u origin main | Out-Null
        Write-Host "  [SYNCED & PUSHED] $($d.Name)" -ForegroundColor Green
    } else {
        Write-Host "  [UP-TO-DATE]      $($d.Name)" -ForegroundColor Cyan
    }
    Pop-Location
}
