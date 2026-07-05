import subprocess
import json
import time
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"
DEPLOYED_URL = "https://helpdeskaiv1.vercel.app/"
EMAIL = "bonthalamadhavi1@gmail.com"

ONBOARDING_STEPS = f"""
Here is the mandatory onboarding process to get dashboard and testing access:

1. **Go to the Deployed Website (not local)**: {DEPLOYED_URL}
2. **Sign In**: Click on the **Sign In** option.
3. **Create Account**: Click on **Create Account**.
4. **Select Company**: Select **Ritesh Private Limited Company** as your organization.
5. **Verify & Reach Out**: After verifying your email, reach out to Ritesh via WhatsApp, preferably by mail at `{EMAIL}`, or right here in this GitHub issue.
6. **Access Approved**: Ritesh will add your username to the system so you can test the application.

*Note: Ensure all your PRs are branched off and target the 'gssoc' branch (not 'main').*"""

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, encoding="utf-8")
    return result

def main():
    print("====================================================================")
    print("      GSSoC 2026 COMMUNITY ONBOARDING CAMPAIGN (ALL ISSUES)         ")
    print("====================================================================")

    # 1. Fetch all issues (up to 200) both open and closed
    res = run_gh(["issue", "list", "--limit", "200", "--state", "all", "--json", "number,title,state,author,assignees"])
    if res.returncode != 0:
        print(f"Error fetching issues: {res.stderr}")
        return

    issues = json.loads(res.stdout)
    print(f"Found {len(issues)} issues to process.")

    for idx, iss in enumerate(issues):
        num = iss["number"]
        title = iss["title"]
        state = iss["state"]
        
        print(f"\n[{idx+1}/{len(issues)}] Processing Issue #{num} ({state}): {title}...")
        
        # Gather all unique participants (excluding ritesh-1918)
        participants = set()
        
        # 1. Issue Author
        author = iss.get("author", {}).get("login") if iss.get("author") else None
        if author and author != "ritesh-1918":
            participants.add(author)
            
        # 2. Issue Assignees
        for a in iss.get("assignees", []):
            login = a.get("login")
            if login and login != "ritesh-1918":
                participants.add(login)

        # 3. Commenters (fetch from gh issue view)
        view_res = run_gh(["issue", "view", str(num), "--repo", REPO, "--json", "comments"])
        if view_res.returncode == 0:
            try:
                view_data = json.loads(view_res.stdout)
                for c in view_data.get("comments", []):
                    c_author = c.get("author", {}).get("login") if c.get("author") else None
                    if c_author and c_author != "ritesh-1918":
                        participants.add(c_author)
            except Exception as e:
                print(f"  [Warning] Error parsing comments for #{num}: {e}")

        # Construct the body of the comment
        tagged_users = sorted(list(participants))
        if tagged_users:
            tag_str = " ".join([f"@{u}" for u in tagged_users])
            greeting = f"Hey {tag_str}! 🙌\n"
        else:
            greeting = "Hey GSSoC contributors! 🙌\n"

        comment_body = f"{greeting}\n{ONBOARDING_STEPS}\n\nLet's get this application tested and build something amazing together! 🚀🔥"

        # Post the comment
        comment_res = run_gh(["issue", "comment", str(num), "--repo", REPO, "--body", comment_body])
        if comment_res.returncode == 0:
            print(f"  [OK] Successfully commented on Issue #{num}! Tagged: {tagged_users}")
        else:
            print(f"  [ERROR] Failed to comment on Issue #{num}: {comment_res.stderr.strip()}")

        # Small sleep between issues to respect API rate limits
        time.sleep(1)

    print("\n====================================================================")
    print("          ONBOARDING CAMPAIGN COMPLETED FOR ALL ISSUES!             ")
    print("====================================================================")

if __name__ == '__main__':
    main()
