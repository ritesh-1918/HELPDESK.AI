import os
import json
import subprocess
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parents[1]
STATE_FILE = BASE_DIR / "issue_tracker_state.json"
TEMPLATE_FILE = BASE_DIR / "templates" / "owner_reply.txt"
REPO = "ritesh-1918/HELPDESK.AI"

# Load or initialize state
if STATE_FILE.exists():
    with open(STATE_FILE, "r", encoding="utf-8") as f:
        state = json.load(f)
else:
    state = {"processed_items": {}}

def run_gh(args):
    """Run a gh CLI command.
    Returns stdout string on success, None on failure.
    """
    try:
        result = subprocess.run(["gh"] + args, capture_output=True, text=True, check=False)
    except Exception as e:
        print(f"[ERROR] Exception while running gh: {e}")
        return None
    if result.returncode != 0:
        print(f"[ERROR] gh {' '.join(args)} failed (code {result.returncode}):\n{result.stderr}")
        return None
    return result.stdout.strip()

def fetch_issues():
    out = run_gh(["issue", "list", "--repo", REPO, "--json", "number,title,labels,state,updatedAt"])
    return json.loads(out) if out else []

def fetch_prs():
    out = run_gh(["pr", "list", "--repo", REPO, "--json", "number,title,labels,state,updatedAt"])
    return json.loads(out) if out else []

def view_issue(num):
    out = run_gh(["issue", "view", str(num), "--repo", REPO, "--json", "number,title,body,author,labels,comments,updatedAt"])
    return json.loads(out) if out else None

def view_pr(num):
    out = run_gh(["pr", "view", str(num), "--repo", REPO, "--json", "number,title,body,author,labels,comments,updatedAt"])
    return json.loads(out) if out else None

def determine_labels(item):
    title = item.get("title", "").lower()
    existing = set(label["name"] for label in item.get("labels", []))
    # Simple keyword based heuristics
    if "bug" in title:
        existing.add("bug")
    if "feature" in title or "enhancement" in title:
        existing.add("enhancement")
    # Always tag with gssoc for tracking
    existing.add("gssoc")
    return list(existing)

def ensure_labels(item_type, number, desired_labels):
    for label in desired_labels:
        run_gh([item_type, "edit", str(number), "--repo", REPO, "--add-label", label])

def load_template():
    if TEMPLATE_FILE.exists():
        return TEMPLATE_FILE.read_text(encoding="utf-8")
    # Fallback simple template
    return (
        "Hi @{author},\n\n"
        "Thank you for your contribution! 🙌\n"
        "We appreciate your effort and encourage you to continue working on the `gssoc` branch.\n"
        "If you are new, please follow the onboarding steps: sign‑up, select *Ritesh Private Limited*, verify email, request access via an issue, and wait for approval.\n"
        "Feel free to ask any questions. 🚀\n\n"
        "Best,\nRitesh"
    )

def post_comment(item_type, number, body):
    run_gh([item_type, "comment", str(number), "--repo", REPO, "--body", body])

def process_item(item_type, item):
    number = item["number"]
    key = f"{item_type}:{number}"
    last_updated = item.get("updatedAt")
    if state["processed_items"].get(key) == last_updated:
        return  # No changes since last run
    full = view_issue(number) if item_type == "issue" else view_pr(number)
    if not full:
        print(f"[WARN] Could not fetch full details for {item_type} #{number}. Skipping.")
        return
    desired = determine_labels(full)
    ensure_labels(item_type, number, desired)
    template = load_template()
    reply = template.replace("{title}", full.get("title", ""))
    reply = reply.replace("{author}", full.get("author", {}).get("login", "contributor"))
    post_comment(item_type, number, reply)
    state["processed_items"][key] = last_updated

def main():
    issues = fetch_issues()
    prs = fetch_prs()
    for issue in issues:
        process_item("issue", issue)
    for pr in prs:
        process_item("pr", pr)
    # Save updated state
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

if __name__ == "__main__":
    main()
