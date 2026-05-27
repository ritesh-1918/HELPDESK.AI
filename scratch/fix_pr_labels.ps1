#!/usr/bin/env pwsh
# Fix labels: remove wrong labels, apply correct GSSoC labels based on PR type

# PR number -> correct type label mapping (based on title analysis)
$prTypeMap = @{
    170 = "type:security"       # WebSockets Heartbeat - bounty
    171 = "type:security"       # AES-256 Encryption - bounty
    172 = "type:security"       # AES-256 Encryption - bounty
    176 = "type:bug"            # degraded backend import fix
    177 = "type:security"       # Spam/Phishing Detection bounty
    178 = "type:feature"        # WebSocket heartbeat feature
    180 = "type:bug"            # ticket store ordering fix
    181 = "type:devops"         # Prometheus/Grafana monitoring
    182 = "type:bug"            # mobile supabase env fix
    183 = "type:security"       # AES-256 GCM PII encryption
    184 = "type:feature"        # WebSocket Connection Pool
    185 = "type:security"       # tenant auth on ticket reads
    186 = "type:security"       # Spam/Phishing Detection
    188 = "type:bug"            # Slack notifier company case fix
    190 = "type:bug"            # Slack payload fallbacks fix
    193 = "type:security"       # auth profile cache bypass fix
    194 = "type:bug"            # analyze_image signature mismatch fix
}

$correctLabels = @("gssoc", "gssoc:approved", "level:critical", "quality:exceptional")
$wrongLabels   = @("difficulty:extreme", "difficulty:crucial", "difficulty:high")

foreach ($pr in $prTypeMap.Keys) {
    Write-Host "Fixing labels on PR #$pr ..."

    # Remove wrong labels
    foreach ($lbl in $wrongLabels) {
        gh pr edit $pr --remove-label $lbl 2>$null
    }

    # Add correct labels
    $typeLabel = $prTypeMap[$pr]
    $allLabels = $correctLabels + @($typeLabel)
    foreach ($lbl in $allLabels) {
        gh pr edit $pr --add-label $lbl
    }

    Write-Host "PR #$pr -> $typeLabel + gssoc, gssoc:approved, level:critical, quality:exceptional"
}

Write-Host "Done! All PRs now have correct GSSoC labels."
