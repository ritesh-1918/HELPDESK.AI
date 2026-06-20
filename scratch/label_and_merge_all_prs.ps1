#!/usr/bin/env pwsh
# Step 1: Create labels
Write-Host "Creating labels..."
gh label create "difficulty:extreme" --color "B60205" --description "Extreme difficulty - highest GSSoC points"
gh label create "difficulty:crucial" --color "9C1F61" --description "Crucial/critical task - high GSSoC points"
Write-Host "Labels done."

# Step 2: Process each PR - add both labels and merge
$prs = @(170, 171, 172, 176, 177, 178, 180, 181, 182, 183, 184, 185, 186, 188, 190, 193, 194)

foreach ($pr in $prs) {
    Write-Host "Processing PR #$pr ..."
    gh pr edit $pr --add-label "difficulty:extreme"
    gh pr edit $pr --add-label "difficulty:crucial"
    Write-Host "Labels added to PR #$pr"
    gh pr merge $pr --merge --admin --delete-branch
    Write-Host "PR #$pr merged"
}

Write-Host "All PRs processed."
