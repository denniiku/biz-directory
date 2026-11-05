Clear-Host
$root = "C:\projects\sc_web"
$bizDir = "$root\biz-directory"
$storageDir = "$bizDir\storage"
$csvPath = "$bizDir\master_db.csv"
$legacyPath = "$bizDir\master_db_legacy.csv"
$gasUrl = "https://script.google.com/macros/s/AKfycby_9cLWQp8T2yzbnjmAAwOMrCzL-RwT8l5gin9YNAf_pzRk2rOyLKklcjddAzjhqUm5Mg/exec"
$utf8 = [System.Text.UTF8Encoding]::new($false)

Add-Type -AssemblyName System.Drawing
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Save-ResizedImage($imgUrl, $baseUrl, $destPath) {
    try {
        $fullUrl = $imgUrl.Trim()
        if ($fullUrl -match "^//") { $fullUrl = "https:" + $fullUrl }
        elseif ($fullUrl -notmatch "^https?://") {
            $bUri = New-Object System.Uri($baseUrl)
            $fUri = New-Object System.Uri($bUri, $fullUrl)
            $fullUrl = $fUri.AbsoluteUri
        }
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0")
        $bytes = $wc.DownloadData($fullUrl)
        if ($bytes.Length -lt 1000) { return $false }

        $ms = New-Object System.IO.MemoryStream(,$bytes)
        $img = [System.Drawing.Image]::FromStream($ms)
        $w = if ($img.Width -gt 650) { 650 } else { $img.Width }
        $h = [int]($img.Height * ($w / $img.Width))
        if ($w -lt 60 -or $h -lt 60) { $img.Dispose(); $ms.Dispose(); return $false }

        $bmp = New-Object System.Drawing.Bitmap($w, $h)
        $bmp.SetResolution(72, 72)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.Clear([System.Drawing.Color]::White)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $w, $h)
        $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $g.Dispose(); $bmp.Dispose(); $img.Dispose(); $ms.Dispose()
        return ([System.IO.File]::Exists($destPath) -and ((Get-Item $destPath).Length -gt 1000))
    } catch {
        return $false
    }
}

function Harvest-SinglePartner($companyName, $websiteUrl, $sourceTag) {
    $rows = @()
    if ([System.IO.File]::Exists($csvPath)) {
        $rows = @(Import-Csv -Path $csvPath -Encoding UTF8)
    }
    $nextNum = $rows.Count + 1
    $newId = ("sc-{0:D3}" -f $nextNum)

    Write-Host "`n  -> Harvesting [$companyName] ($websiteUrl) via GAS + Gemini AI..." -ForegroundColor Cyan
    $payload = @{ action = "harvest_site"; company_name = $companyName; url = $websiteUrl } | ConvertTo-Json -Compress
    try {
        $resp = Invoke-RestMethod -Uri $gasUrl -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($payload)) -ContentType "application/json; charset=utf-8" -TimeoutSec 45
    } catch {
        Write-Host "     [!] GAS request failed: $_" -ForegroundColor Red
        return
    }

    $cName = if ($resp.company_name) { $resp.company_name } else { $companyName }
    $ctry  = if ($resp.country) { $resp.country.ToLower() } else { "korea" }
    $ind   = if ($resp.industry) { $resp.industry.ToLower() } else { "living & lifestyle" }
    $pcat  = if ($resp.product_category) { $resp.product_category.ToLower() } else { "general" }
    $sum   = if ($resp.summary) { $resp.summary } else { "• Overview: Official partner $cName." }
    $fMail = if ($resp.found_email) { $resp.found_email } else { "" }

    # Download & resize up to 3 product images found on the partner's website
    $savedImgUrls = @()
    $imgIdx = 0
    if ($resp.found_images) {
        foreach ($rawImg in $resp.found_images) {
            $imgIdx++
            $jpgName = if ($imgIdx -eq 1) { "$newId.jpg" } else { "$newId-$imgIdx.jpg" }
            $jpgFull = Join-Path $storageDir $jpgName
            if (Save-ResizedImage $rawImg $websiteUrl $jpgFull) {
                $savedImgUrls += "./storage/$jpgName"
                Write-Host "     [+] Saved image: ./storage/$jpgName" -ForegroundColor Green
            }
        }
    }

    # Always create clean SVG backup card
    $svgName = "$newId.svg"
    $svgFull = Join-Path $storageDir $svgName
    $safeName = [System.Security.SecurityElement]::Escape($cName)
    $safeInd  = [System.Security.SecurityElement]::Escape(($ind + "  |  " + $pcat).ToUpper())
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="100%" height="100%"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f7dffb"/><stop offset="50%" stop-color="#dffbf7"/><stop offset="100%" stop-color="#fbf7df"/></linearGradient></defs><rect width="800" height="420" fill="url(#bg)"/><rect x="28" y="28" width="744" height="364" rx="20" fill="rgba(255,255,255,0.72)" stroke="rgba(157,178,191,0.5)" stroke-width="2"/><text x="64" y="88" font-family="sans-serif" font-size="15" font-weight="700" fill="#526D82" letter-spacing="2">sistar company  •  ' + $ctry.ToUpper() + '  •  ' + $newId + '</text><text x="64" y="215" font-family="sans-serif" font-size="32" font-weight="700" fill="#27374D">' + $safeName + '</text><rect x="64" y="265" width="672" height="2" fill="rgba(157,178,191,0.4)"/><text x="64" y="315" font-family="sans-serif" font-size="16" font-weight="600" fill="#526D82" letter-spacing="1">' + $safeInd + '</text><text x="64" y="355" font-family="sans-serif" font-size="13" font-weight="500" fill="#9DB2BF">biz-directory.sistarcompany.com</text></svg>'
    [System.IO.File]::WriteAllText($svgFull, $svg, $utf8)

    $finalImgUrl = if ($savedImgUrls.Count -gt 0) { $savedImgUrls -join " | " } else { "./storage/$svgName" }
    $finalLocal  = if ($savedImgUrls.Count -gt 0) { "$newId.jpg" } else { $svgName }

    $newRow = [PSCustomObject]@{
        id               = $newId
        source_event     = $sourceTag
        country          = $ctry
        location         = $ctry
        industry         = $ind
        product_category = $pcat
        company_name     = $cName
        summary          = $sum
        image_url        = $finalImgUrl
        local_file       = $finalLocal
        target_url       = "https://biz-galaxy.sistarcompany.com"
        contact_email    = "sc@sistarcompany.com"
        raw_website      = $websiteUrl
        subpage_url      = $fMail
        catalog_url      = ""
        meeting_url      = ""
        drive_logo_id    = ""
        drive_img_id     = ""
    }

    $allRows = @($rows) + @($newRow)
    $allRows | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8 -Force
    $pub = $allRows | Select-Object id, country, industry, product_category, company_name, summary, image_url, local_file, drive_img_id, drive_logo_id, target_url, contact_email
    $json = ConvertTo-Json -InputObject @($pub) -Depth 4 -Compress
    [System.IO.File]::WriteAllText("$bizDir\directory_data.js", "window.SC_DIRECTORY_DATA = $json;", $utf8)

    Write-Host "     [OK] Added [$newId] $cName ($ind > $pcat) | Partner Email: $fMail" -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " *sc | biz-directory 2-Hop AI Harvester" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [1] Input Exhibition Company-List Webpage URL (2-Hop Extract)"
Write-Host " [2] Input Single Partner Website URL Directly"
Write-Host " [3] Search & Import from master_db_legacy.csv (235 Companies)"
Write-Host "==========================================================" -ForegroundColor Cyan
$mode = Read-Host "Select Mode (1, 2, or 3)"

if ($mode -eq "1") {
    $listUrl = Read-Host "Paste Exhibition Exhibitor-List Webpage URL"
    Write-Host "Extracting partner companies and websites from $listUrl ..." -ForegroundColor Yellow
    $payload = @{ action = "extract_list"; list_url = $listUrl } | ConvertTo-Json -Compress
    $res = Invoke-RestMethod -Uri $gasUrl -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($payload)) -ContentType "application/json; charset=utf-8" -TimeoutSec 50
    if (-not $res.companies -or $res.companies.Count -eq 0) {
        Write-Host "No direct external links found on that page (or GEMINI_API_KEY not set in GAS)." -ForegroundColor Yellow
    } else {
        for ($i = 0; $i -lt $res.companies.Count; $i++) {
            Write-Host ("  [{0}] {1} -> {2}" -f ($i + 1), $res.companies[$i].company_name, $res.companies[$i].url)
        }
        $sel = Read-Host "Enter numbers to harvest (e.g. 1,3,5 or 'all')"
        $indices = if ($sel -eq "all") { 1..$res.companies.Count } else { $sel -split "," | ForEach-Object { [int]$_.Trim() } }
        foreach ($idx in $indices) {
            $item = $res.companies[$idx - 1]
            if ($item) { Harvest-SinglePartner $item.company_name $item.url "WEB_LIST" }
        }
    }
} elseif ($mode -eq "2") {
    $cName = Read-Host "Enter Company Name"
    $wUrl  = Read-Host "Enter Partner Website URL (e.g. https://...)"
    Harvest-SinglePartner $cName $wUrl "DIRECT"
} elseif ($mode -eq "3") {
    $kw = Read-Host "Enter keyword or company name to search in master_db_legacy.csv (or Enter for top 15)"
    $leg = Import-Csv -Path $legacyPath -Encoding UTF8
    $matches = $leg | Where-Object { $_.raw_website -and $_.raw_website -notmatch "biz-galaxy" -and ($kw -eq "" -or $_.company_name -match $kw -or $_.industry -match $kw) } | Select-Object -First 20
    for ($i = 0; $i -lt $matches.Count; $i++) {
        Write-Host ("  [{0}] {1} ({2}) -> {3}" -f ($i + 1), $matches[$i].company_name, $matches[$i].industry, $matches[$i].raw_website)
    }
    $sel = Read-Host "Enter numbers to harvest (e.g. 1,2,4)"
    $indices = $sel -split "," | ForEach-Object { [int]$_.Trim() }
    foreach ($idx in $indices) {
        $item = $matches[$idx - 1]
        if ($item) { Harvest-SinglePartner $item.company_name $item.raw_website $item.source_event }
    }
}

& "$root\sync_all.ps1"
Write-Host "`n[COMPLETE] All harvested companies synced to master_db.csv & GitHub!" -ForegroundColor Green
Start-Process "$bizDir\index.html"