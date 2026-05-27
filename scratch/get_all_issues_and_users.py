import subprocess
import json
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, encoding="utf-8")
    return result

def main():
    # Fetch all issues (up to 300)
    print("Fetching all issues...")
    res = run_gh(["issue", "list", "--limit", "300", "--state", "all", "--json", "number,title,state,author,assignees"])
    if res.returncode != 0:
        print(f"Error fetching issues: {res.stderr}")
        return

    issues = json.loads(res.stdout)
    print(f"Found {len(issues)} issues total.")

    all_data = []
    for idx, iss in enumerate(issues):
        num = iss["number"]
        title = iss["title"]
        state = iss["state"]
        
        # We need to find all unique users who:
        # - are assignees
        # - is the author of the issue
        # - commented on the issue
        users = set()
        
        # Add author (if exists and is not owner ritesh-1918)
        author = iss.get("author", {}).get("login") if iss.get("author") else None
        if author and author != "ritesh-1918":
            users.add(author)
            
        # Add assignees
        for a in iss.get("assignees", []):
            if a.get("login") and a.get("login") != "ritesh-1918":
                users.add(a.get("login"))

        # Fetch comments to get commenters
        c_res = run_gh(["issue", "view", str(num), "--repo", REPO, "--json", "comments"])
        if c_res.returncode == 0:
            c_data = json.loads(c_res.stdout)
            for c in c_data.get("comments", []):
                commenter = c.get("author", {}).get("login") if c.get("author") else None
                if commenter and commenter != "ritesh-1918":
                    users.add(commenter)

        all_data.append({
            "number": num,
            "title": title,
            "state": state,
            "users": sorted(list(users))
        })
        
        if (idx + 1) % 10 == 0 or idx + 1 == len(issues):
            print(f"Processed {idx + 1}/{len(issues)} issues...")

    # Save to a json file in scratch
    with open("scratch/all_issues_participants.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print("Successfully saved participant data to scratch/all_issues_participants.json")

if __name__ == '__main__':
    main()
