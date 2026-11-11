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

# 1. master_prd.md 와 master_skill.md 두 파일만 읽어서 통합 헌법 생성
$prdText   = if (Test-Path "$masterCommon\master_prd.md")   { [System.IO.File]::ReadAllText("$masterCommon\master_prd.md", $utf8) }   else { "" }
$skillText = if (Test-Path "$masterCommon\master_skill.md") { [System.IO.File]::ReadAllText("$masterCommon\master_skill.md", $utf8) } else { "" }

$header = "# MANDATORY *SC WEB SYSTEM CONSTITUTION (AUTO-PINNED FROM common_assets)`r`n" +
          "> [100% STRICT ENFORCEMENT FOR AGY CLI & VS CODE COPILOT]`r`n" +
          "> 1. 2-Tier Cascading Rule: Always obey common_assets/master_prd.md and common_assets/master_skill.md first (Base Layer), then layer any local folder *prd*.md or *skill*.md on top.`r`n" +
          "> 2. Centralized common_assets Governance: NEVER inject ad-hoc <style> or <script> blocks into individual <page>/index.html files for global UI. Edit global UI ONLY in C:\projects\sc_web\common_assets\.`r`n" +
          "> 3. Mandatory Sync: After any folder, HTML, or common_assets modification, ALWAYS run C:\projects\sc_web\common_assets\sync_all.ps1 (or sc-sync).`r`n"

$constitution = $header + "`r`n---`r`n`r`n" + $prdText + "`r`n`r`n---`r`n`r`n" + $skillText

$vsSettingsObj = @{
    "github.copilot.chat.codeGeneration.useInstructionFiles" = $true
    "github.copilot.chat.codeGeneration.instructions" = @(
        @{ "file" = ".github/copilot-instructions.md" },
        @{ "file" = "common_assets/master_prd.md" },
        @{ "file" = "common_assets/master_skill.md" }
    )
    "files.encoding" = "utf8"
}
$vsSettingsJson = $vsSettingsObj | ConvertTo-Json -Depth 4

# 루트 워크스페이스(C:\projects\sc_web)에 VS Code 및 AGY CLI 지침 고정 (숨김 처리)
Set-HiddenDir "$root\.github"
Set-HiddenFile "$root\.github\copilot-instructions.md" $constitution

Set-HiddenDir "$root\.vscode"
Set-HiddenFile "$root\.vscode\settings.json" $vsSettingsJson

Set-HiddenDir "$root\.agy"
Set-HiddenFile "$root\.agy\instructions.md" $constitution

foreach ($fName in @("AGENTS.md", "GEMINI.md", "CLAUDE.md", ".cursorrules")) {
    Set-HiddenFile "$root\$fName" $constitution
}
Write-Host "  [PINNED] Latest master_prd.md & master_skill.md pinned to VS Code & AGY CLI." -ForegroundColor Magenta

# 2. build_nav_new.ps1 실행하여 최신 폴더/HTML 구조를 nav_new.js에 자동 반영
if (Test-Path "$masterCommon\build_nav_new.ps1") {
    & "$masterCommon\build_nav_new.ps1"
}

# 3. nav_new.js 맨 끝에 다국어/브레드크럼 로더(SC_TR_LOAD) 보장
$navJsPath = "$masterCommon\nav_new.js"
if (Test-Path $navJsPath) {
    $navJsText = [System.IO.File]::ReadAllText($navJsPath, $utf8)
    $trLoaderLine = '/* SC_TR_LOAD */(function(){try{var p=location.pathname.replace(/\\/g,"/"),b="/common_assets/";if(location.protocol==="file:"){var i=p.toLowerCase().indexOf("/sc_web/");b=i!==-1?"file://"+p.substring(0,i+8)+"common_assets/":"./common_assets/";}var s=document.createElement("script");s.src=b+"sc_translator.js?v="+Date.now();s.defer=true;document.head.appendChild(s);}catch(e){}})();'
    if ($navJsText -notmatch "SC_TR_LOAD") {
        $navJsText = $navJsText.TrimEnd() + "`r`n" + $trLoaderLine + "`r`n"
        [System.IO.File]::WriteAllText($navJsPath, $navJsText, $utf8)
    }
}

# 4. 12개 도메인 폴더에 common_assets 미러링 (robocopy /MIR로 삭제된 upgrade_skill.md도 12개 도메인에서 자동 삭제됨) + GitHub Push
$domainDirs = Get-ChildItem -Path $root -Directory | Where-Object {
    $_.Name -notin @("common_assets", ".github", ".vscode", ".agy") -and (Test-Path (Join-Path $_.FullName ".git"))
}

foreach ($d in $domainDirs) {
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
        git commit -m "Consolidate upgrade_skill into master_skill.md & sync clean common_assets" | Out-Null
        git push -u origin main | Out-Null
        Write-Host "  [SYNCED & PUSHED] $($d.Name)" -ForegroundColor Green
    } else {
        Write-Host "  [UP-TO-DATE]      $($d.Name)" -ForegroundColor Cyan
    }
    Pop-Location
}
