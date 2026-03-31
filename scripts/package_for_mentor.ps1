$projectName = "HELPDESK_AI_Professional_Submission"
$targetZip = "..\$projectName.zip"
$sourcePath = Get-Location

write-host "Starting project packaging for Mentor submission..." -ForegroundColor Cyan

# 1. Define Exclusions (Security and Heavy Binaries)
$excludeList = @(
    "node_modules",
    ".git",
    ".env",
    "__pycache__",
    ".safetensors",
    "HELPDESK_AI_Submission_Package.zip",
    "HELPDESK_AI_FullCode.zip"
)

# 2. Collect all files excluding node_modules and heavy weights
$files = Get-ChildItem -Path $sourcePath -Recurse | Where-Object {
    $path = $_.FullName
    $match = $false
    foreach ($exclude in $excludeList) {
        if ($path -like "*$exclude*") { $match = $true; break }
    }
    !$match -and !$_.PSIsContainer
}

# 3. Create a temporary staging area
$staging = New-Item -ItemType Directory -Path "$env:TEMP\HELPDESK_STAGING" -Force
foreach ($file in $files) {
    $relative = Resolve-Path $file.FullName -Relative
    # Remove leading './'
    $relative = $relative -replace "^\.\\", ""
    $dest = Join-Path $staging.FullName $relative
    $parent = Split-Path $dest
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force }
    Copy-Item $file.FullName -Destination $dest -Force
}

# 4. Compress the staging area
if (Test-Path $targetZip) { Remove-Item $targetZip -Force }
Compress-Archive -Path "$($staging.FullName)\*" -DestinationPath $targetZip -Force

# 5. Cleanup
Remove-Item $staging.FullName -Recurse -Force

write-host "Packaging complete!" -ForegroundColor Green
$zipFile = Get-Item $targetZip
write-host "File: $($zipFile.FullName)" -ForegroundColor Yellow
write-host "Size: $([math]::Round($zipFile.Length / 1MB, 2)) MB" -ForegroundColor Yellow
