import subprocess
import json
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"
issues = [168, 167, 166, 161, 156, 151, 150, 117, 102, 100, 85]

for iss in issues:
    print(f"\n==================== ISSUE #{iss} ====================")
    res = subprocess.run([
        "gh", "issue", "view", str(iss),
        "--repo", REPO,
        "--json", "number,title,assignees,labels,comments,body"
    ], capture_output=True, text=True, encoding="utf-8")
    
    if res.returncode != 0:
        print(f"Error viewing issue #{iss}: {res.stderr}")
        continue
        
    try:
        data = json.loads(res.stdout)
        print(f"Title: {data.get('title')}")
        assignees = [a.get('login') for a in data.get('assignees', [])]
        print(f"Assignees: {assignees}")
        labels = [l.get('name') for l in data.get('labels', [])]
        print(f"Labels: {labels}")
        comments = data.get('comments', [])
        print(f"Number of comments: {len(comments)}")
        if comments:
            print("Last 3 Comments:")
            for c in comments[-3:]:
                print(f"  - @{c.get('author', {}).get('login')}: {c.get('body')[:200]}...")
    except Exception as e:
        print(f"Exception parsing JSON for issue #{iss}: {e}")
