#!/usr/bin/env pwsh
# Post review comments on all open PRs

$prComments = @{
    190 = "scratch\pr_comment_190.md"
    184 = "scratch\pr_comment_184.md"
    178 = "scratch\pr_comment_178.md"
    177 = "scratch\pr_comment_177.md"
    176 = "scratch\pr_comment_176.md"
    172 = "scratch\pr_comment_172.md"
    171 = "scratch\pr_comment_171.md"
    170 = "scratch\pr_comment_170.md"
    197 = "scratch\pr_comment_197.md"
}

# First add correct labels to PR #197 (missing labels)
Write-Host "Adding labels to PR #197 ..."
gh pr edit 197 --add-label "gssoc"
gh pr edit 197 --add-label "gssoc:approved"
gh pr edit 197 --add-label "level:critical"
gh pr edit 197 --add-label "quality:exceptional"
gh pr edit 197 --add-label "type:security"
Write-Host "Labels added to PR #197"

# Post comments on all PRs
foreach ($pr in $prComments.Keys) {
    Write-Host "Commenting on PR #$pr ..."
    gh pr comment $pr --body-file $prComments[$pr]
    Write-Host "Done PR #$pr"
}

Write-Host "All PR comments posted!"
