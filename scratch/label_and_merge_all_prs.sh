#!/usr/bin/env bash
set -euo pipefail
REPO=ritesh-1918/HELPDESK.AI
BRANCH=gssoc
# Ensure we are on the gssoc branch
git checkout $BRANCH
# Pull latest
git pull origin $BRANCH
# Define the high difficulty label (create if missing)
LABEL="difficulty:high"
# Try to create the label (ignore if exists)
gh api -X POST "/repos/$REPO/labels" -f name="$LABEL" -f color="FF0000" || true
# List open PR numbers
PR_NUMS=$(gh api "/repos/$REPO/pulls?state=open" --jq '.[].number')
for PR in $PR_NUMS; do
  echo "Processing PR #$PR"
  # Add high difficulty label
  gh api -X POST "/repos/$REPO/issues/$PR/labels" -f labels='["$LABEL"]'
  # Fetch PR head into a temporary branch
  git fetch origin "pull/$PR/head:pr-$PR"
  # Merge into gssoc without fast‑forward to keep history clear
  git merge --no-ff pr-$PR -m "feat: merge PR #$PR with high difficulty label"
  # Clean up temporary branch
  git branch -D pr-$PR
done
# Push merged commits to remote gssoc
git push origin $BRANCH
