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

# Complete onboarding and follow steps
MANDATORY_COMMENT = f"""
To ensure your contributions are evaluated correctly and to get access to test your changes live, please complete these mandatory onboarding steps immediately:

### 🌟 1. Project Support & Developer Network (Mandatory)
1. ⭐ **Star this repository**: https://github.com/ritesh-1918/HELPDESK.AI
2. 👤 **Follow @ritesh-1918 on GitHub**: https://github.com/ritesh-1918
3. 💼 **Connect on LinkedIn**: https://www.linkedin.com/in/ritesh1908/

---

### 🚀 2. Deployed Dashboard Testing Access Setup
1. **Go to the Deployed Website (not local)**: {DEPLOYED_URL}
2. **Sign In**: Click on the **Sign In** option.
3. **Create Account**: Click on **Create Account**.
4. **Select Company**: Select **Ritesh Private Limited Company** as your organization.
5. **Verify & Reach Out**: After verifying your email, reach out to Ritesh via WhatsApp, preferably by mail at `{EMAIL}`, or reply directly in this thread.
6. **Access Approved**: Ritesh will add your username to the system so you can test the application.

*Note: Ensure all your PRs are branched off and target the 'gssoc' branch (not 'main').*

Thank you for your hard work and amazing code! Let's get this tested and merged! 🚀💻"""

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, encoding="utf-8")
    return result

def has_mandatory_steps(comments_list):
    for c in comments_list:
        body = c.get("body", "").lower()
        if "ritesh private limited company" in body or "helpdeskaiv1.vercel.app" in body:
            return True
    return False

def main():
    print("====================================================================")
    print("      GSSoC 2026 ACTIVE ISSUES & PRs MANDATORY ONBOARDING SYNC      ")
    print("====================================================================")

    # 1. Process Open PRs
    print("\n[+] Fetching open PRs...")
    pr_res = run_gh(["pr", "list", "--state", "open", "--json", "number,title,author,assignees"])
    if pr_res.returncode != 0:
        print(f"Error fetching PRs: {pr_res.stderr}")
        return
        
    prs = json.loads(pr_res.stdout)
    print(f"Found {len(prs)} open PRs.")

    for pr in prs:
        num = pr["number"]
        title = pr["title"]
        print(f"\nProcessing PR #{num}: {title}...")

        # Fetch comments for this PR
        view_res = run_gh(["pr", "view", str(num), "--repo", REPO, "--json", "comments"])
        if view_res.returncode != 0:
            print(f"  [ERROR] Failed to view PR #{num}: {view_res.stderr.strip()}")
            continue

        try:
            view_data = json.loads(view_res.stdout)
            comments = view_data.get("comments", [])
            
            if has_mandatory_steps(comments):
                print(f"  [IGNORE] PR #{num} already has mandatory steps comment. Skipping.")
                continue

            # Gather all unique participants (excluding ritesh-1918)
            participants = set()
            author = pr.get("author", {}).get("login") if pr.get("author") else None
            if author and author != "ritesh-1918":
                participants.add(author)
            for a in pr.get("assignees", []):
                login = a.get("login")
                if login and login != "ritesh-1918":
                    participants.add(login)
            for c in comments:
                c_author = c.get("author", {}).get("login") if c.get("author") else None
                if c_author and c_author != "ritesh-1918":
                    participants.add(c_author)

            # Construct comment
            tagged_users = sorted(list(participants))
            if tagged_users:
                tag_str = " ".join([f"@{u}" for u in tagged_users])
                greeting = f"Hey {tag_str}! 🙌\n"
            else:
                greeting = "Hey GSSoC contributors! 🙌\n"

            comment_body = f"{greeting}\n{MANDATORY_COMMENT}"

            # Post the comment
            comment_res = run_gh(["pr", "review", str(num), "--repo", REPO, "--comment", "--body", comment_body])
            if comment_res.returncode == 0:
                print(f"  [OK] Successfully commented on PR #{num}! Tagged: {tagged_users}")
            else:
                # Try regular issue comment if pr review fails (sometimes helpful)
                comment_res_issue = run_gh(["issue", "comment", str(num), "--repo", REPO, "--body", comment_body])
                if comment_res_issue.returncode == 0:
                    print(f"  [OK] Successfully commented on PR #{num} (via issue comment)! Tagged: {tagged_users}")
                else:
                    print(f"  [ERROR] Failed to comment on PR #{num}: {comment_res_issue.stderr.strip()}")

        except Exception as e:
            print(f"  [ERROR] Exception processing PR #{num}: {e}")
        time.sleep(1)

    # 2. Process Open Issues (to be absolutely sure they are fully matched and ignored if already have it)
    print("\n[+] Fetching open issues...")
    iss_res = run_gh(["issue", "list", "--state", "open", "--json", "number,title,author,assignees"])
    if iss_res.returncode != 0:
        print(f"Error fetching issues: {iss_res.stderr}")
        return

    issues = json.loads(iss_res.stdout)
    print(f"Found {len(issues)} open issues.")

    for iss in issues:
        num = iss["number"]
        title = iss["title"]
        print(f"\nProcessing Issue #{num}: {title}...")

        # Fetch comments for this Issue
        view_res = run_gh(["issue", "view", str(num), "--repo", REPO, "--json", "comments"])
        if view_res.returncode != 0:
            print(f"  [ERROR] Failed to view Issue #{num}: {view_res.stderr.strip()}")
            continue

        try:
            view_data = json.loads(view_res.stdout)
            comments = view_data.get("comments", [])
            
            if has_mandatory_steps(comments):
                print(f"  [IGNORE] Issue #{num} already has mandatory steps comment. Skipping.")
                continue

            # Gather all unique participants (excluding ritesh-1918)
            participants = set()
            author = iss.get("author", {}).get("login") if iss.get("author") else None
            if author and author != "ritesh-1918":
                participants.add(author)
            for a in iss.get("assignees", []):
                login = a.get("login")
                if login and login != "ritesh-1918":
                    participants.add(login)
            for c in comments:
                c_author = c.get("author", {}).get("login") if c.get("author") else None
                if c_author and c_author != "ritesh-1918":
                    participants.add(c_author)

            # Construct comment
            tagged_users = sorted(list(participants))
            if tagged_users:
                tag_str = " ".join([f"@{u}" for u in tagged_users])
                greeting = f"Hey {tag_str}! 🙌\n"
            else:
                greeting = "Hey GSSoC contributors! 🙌\n"

            comment_body = f"{greeting}\n{MANDATORY_COMMENT}"

            # Post the comment
            comment_res = run_gh(["issue", "comment", str(num), "--repo", REPO, "--body", comment_body])
            if comment_res.returncode == 0:
                print(f"  [OK] Successfully commented on Issue #{num}! Tagged: {tagged_users}")
            else:
                print(f"  [ERROR] Failed to comment on Issue #{num}: {comment_res.stderr.strip()}")

        except Exception as e:
            print(f"  [ERROR] Exception processing Issue #{num}: {e}")
        time.sleep(1)

    print("\n====================================================================")
    print("      ACTIVE OPEN ISSUES & PRs SYNC COMPLETED SUCCESSFULLY!         ")
    print("====================================================================")

if __name__ == '__main__':
    main()
