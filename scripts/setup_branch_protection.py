import json
import subprocess

REPO = "ritesh-1918/HELPDESK.AI"
BRANCH = "main"

def setup_branch_protection():
    payload = {
        "required_status_checks": {
            "strict": True,
            "contexts": []
        },
        "enforce_admins": True,
        "required_pull_request_reviews": {
            "dismiss_stale_reviews": True,
            "require_code_owner_reviews": True,
            "required_approving_review_count": 1
        },
        "restrictions": None
    }
    
    print(f"Setting up branch protection for {REPO} on branch {BRANCH}...")
    
    try:
        result = subprocess.run(
            [
                "gh", "api",
                "-X", "PUT",
                f"/repos/{REPO}/branches/{BRANCH}/protection",
                "--input", "-"
            ],
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            check=False
        )
    except Exception as e:
        print(f"[ERROR] Exception while running gh: {e}")
        return
        
    if result.returncode != 0:
        print(f"[ERROR] Failed to set branch protection (code {result.returncode}):\n{result.stderr}")
    else:
        print("[SUCCESS] Branch protection rules applied successfully.")
        print(result.stdout.strip())

if __name__ == "__main__":
    setup_branch_protection()
