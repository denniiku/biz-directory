$ErrorActionPreference = "Continue"
$root = "C:\projects\sc_web"
$masterCommon = "$root\common_assets"

# 1. 좌측 내비게이션 메뉴(nav_new.js) 최신 폴더 구조로 빌드
if (Test-Path "$root\build_nav_new.ps1") {
    & "$root\build_nav_new.ps1"
}

# 2. 모든 도메인(Git 저장소) 폴더 순회하며 common_assets 100% 동일하게 미러링 & GitHub Push
$domainDirs = Get-ChildItem -Path $root -Directory | Where-Object {
    $_.Name -notin @("common_assets", "legacy_staging", "varients", ".git") -and (Test-Path (Join-Path $_.FullName ".git"))
}

foreach ($d in $domainDirs) {
    $targetCommon = Join-Path $d.FullName "common_assets"

    # robocopy /MIR : 원본(masterCommon)에서 삭제된 파일은 대상(targetCommon)에서도 자동 삭제하여 100% 동일하게 유지
    $null = robocopy $masterCommon $targetCommon /MIR /NFL /NDL /NJH /NJS /nc /ns /np

    # 도메인 루트에 남아있던 구버전 SKILL.md 파일이 있다면 깔끔하게 삭제
    $oldRootSkill = Join-Path $d.FullName "SKILL.md"
    if (Test-Path $oldRootSkill) {
        Remove-Item $oldRootSkill -Force
    }

    # 도메인 루트에 storage 폴더가 없으면 기본 생성 (.gitkeep 포함)
    $rootStorage = Join-Path $d.FullName "storage"
    if (-not (Test-Path $rootStorage)) {
        [void][System.IO.Directory]::CreateDirectory($rootStorage)
    }
    $gitKeep = Join-Path $rootStorage ".gitkeep"
    if (-not (Test-Path $gitKeep)) {
        [System.IO.File]::WriteAllText($gitKeep, "")
    }

    # Git Commit & Push
    Push-Location $d.FullName
    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m "Sync exact common_assets mirror & structure" | Out-Null
        git push | Out-Null
        Write-Host "  [SYNCED & PUSHED] $($d.Name)" -ForegroundColor Green
    } else {
        Write-Host "  [UP-TO-DATE]      $($d.Name)" -ForegroundColor Cyan
    }
    Pop-Location
}