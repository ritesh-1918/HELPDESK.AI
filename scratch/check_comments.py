import subprocess
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def run_cmd(cmd):
    try:
        # Run with utf-8 encoding explicitly
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8')
        return res.stdout, res.stderr
    except Exception as e:
        return "", str(e)

def get_item_comments(number, is_pr=True):
    kind = "pr" if is_pr else "issue"
    out, err = run_cmd(f"gh {kind} view {number} --json comments,author,title,state")
    if not out or not out.strip():
        return None
    try:
        return json.loads(out)
    except Exception as e:
        return None

print("Checking PRs and Issues 80 to 105...")
for num in range(80, 106):
    data = get_item_comments(num, is_pr=True)
    if not data:
        data = get_item_comments(num, is_pr=False)
    if data:
        comments = data.get("comments", [])
        author = data.get("author", {}).get("login", "unknown")
        title = data.get("title", "")
        state = data.get("state", "")
        print(f"\n# {num} ({state}) | Title: {title} | Author: @{author}")
        for c in comments:
            c_author = c.get("author", {}).get("login", "unknown")
            body = c.get("body", "")[:120].replace('\n', ' ').strip()
            print(f"  - [{c_author}]: {body}...")
