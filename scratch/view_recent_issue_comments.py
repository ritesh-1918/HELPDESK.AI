import subprocess
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def run_cmd(cmd):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8')
    return res.stdout

out = run_cmd("gh issue list --limit 100 --json number,title")
issues = json.loads(out)
for iss in issues:
    num = iss["number"]
    title = iss["title"]
    if num > 190:
        view_out = run_cmd(f"gh issue view {num} --json comments,assignees,labels")
        data = json.loads(view_out)
        comments = data.get("comments", [])
        assignees = [a["login"] for a in data.get("assignees", [])]
        labels = [l["name"] for l in data.get("labels", [])]
        
        print(f"\n# {num}: {title}")
        print(f"  Assignees: {assignees}")
        print(f"  Labels: {labels}")
        for c in comments:
            author = c.get("author", {}).get("login", "unknown")
            body = c.get("body", "").replace('\n', ' ').strip()[:140]
            print(f"    - [{author}]: {body}")
