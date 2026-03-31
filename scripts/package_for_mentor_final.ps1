$projectName = "HELPDESK_AI_Final_Submission"
$targetZip = "..\$projectName.zip"
$sourcePath = Get-Location

write-host "Starting full project consolidation for Mentor submission..." -ForegroundColor Cyan

# 1. Stage all source folders (Ensuring everything is in the next commit)
write-host "Staging source folders: Frontend, backend, Model, supabase, docs, scripts..." -ForegroundColor Gray
git add Frontend backend Model supabase docs scripts README.md final_dataset.xlsx PLATFORM_MAP.md .gitignore PROJECT` REPORT.pdf

# 2. Final Commit (Capturing all latest Sprint 5 restoration code)
write-host "Committing changes..." -ForegroundColor Gray
git commit -m "Final project consolidation: Captured all source code and documentation for submission."

# 3. Fast Archive using Git (Instantly creates zip of HEAD)
write-host "Generating zip archive via git archive (Fast)..." -ForegroundColor Gray
if (Test-Path $targetZip) { Remove-Item $targetZip -Force }
git archive --format=zip --output=$targetZip HEAD

# 4. Verification
write-host "Packaging complete!" -ForegroundColor Green
$zipFile = Get-Item $targetZip
write-host "File: $($zipFile.FullName)" -ForegroundColor Yellow
write-host "Size: $([math]::Round($zipFile.Length / 1MB, 2)) MB" -ForegroundColor Yellow
