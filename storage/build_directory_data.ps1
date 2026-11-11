$bizDir = "C:\projects\sc_web\biz-directory"
$csvPath = "$bizDir\storage\master_db.csv"
$utf8 = [System.Text.UTF8Encoding]::new($false)

if (Test-Path $csvPath) {
    $rows = Import-Csv -Path $csvPath -Encoding UTF8
    $publicRows = $rows | Select-Object id, country, industry, product_category, company_name, summary, image_url, local_file, drive_img_id, drive_logo_id, target_url, contact_email
    $json = ConvertTo-Json -InputObject @($publicRows) -Depth 4 -Compress
    [System.IO.File]::WriteAllLines("$bizDir\directory_data.js", "window.SC_DIRECTORY_DATA = $json;", $utf8)
    Write-Host "[AUTO-SYNC] storage/master_db.csv ($($rows.Count) rows) -> directory_data.js updated!" -ForegroundColor Cyan
}
