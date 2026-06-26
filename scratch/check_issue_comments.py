import subprocess
import json
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

issues = [168, 167, 166, 156, 151, 150, 117, 102, 100, 85]

for iss in issues:
    res = subprocess.run(["gh", "issue", "view", str(iss), "--json", "number,title,assignees,comments"], capture_output=True, check=False)
    if res.returncode == 0:
        try:
            # Decode using utf-8
            out_str = res.stdout.decode('utf-8', errors='ignore')
            data = json.loads(out_str)
            print("="*60)
            print(f"Issue #{data['number']}: {data['title']}")
            print(f"Assignees: {[a['login'] for a in data.get('assignees', [])]}")
            comments = data.get("comments", [])
            print(f"Total Comments: {len(comments)}")
            # Filter and print recent comments asking for assignment
            for c in comments[-5:]:
                body_snippet = c['body'].replace('\n', ' ').strip()[:120]
                print(f"  - @{c['author']['login']}: {body_snippet}...")
        except Exception as e:
            print(f"Error parsing issue #{iss}: {e}")
    else:
        print(f"Error querying issue #{iss}")
