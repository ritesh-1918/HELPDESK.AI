import subprocess
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8')
        return res.stdout, res.stderr
    except Exception as e:
        return "", str(e)

def get_open_issues():
    out, err = run_cmd("gh issue list --limit 100 --json number,title,labels,assignees")
    if not out or not out.strip():
        return []
    try:
        return json.loads(out)
    except Exception as e:
        return []

def get_issue_comments(number):
    out, err = run_cmd(f"gh issue view {number} --json comments")
    if not out or not out.strip():
        return []
    try:
        data = json.loads(out)
        return data.get("comments", [])
    except Exception as e:
        return []

issues = get_open_issues()
print(f"Found {len(issues)} open issues.")
for iss in issues:
    num = iss["number"]
    title = iss["title"]
    labels = [l["name"] for l in iss.get("labels", [])]
    assignees = [a["login"] for a in iss.get("assignees", [])]
    
    comments = get_issue_comments(num)
    
    # Only print issues that have comments or are recently active
    if len(comments) > 0:
        print(f"\n# {num} | Title: {title}")
        print(f"  Labels: {labels}")
        print(f"  Assignees: {assignees}")
        print(f"  Comments count: {len(comments)}")
        for c in comments:
            author = c.get("author", {}).get("login", "unknown")
            body = c.get("body", "").replace('\n', ' ').strip()[:140]
            print(f"    - [{author}]: {body}...")
