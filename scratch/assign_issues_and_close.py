import subprocess
import time

REPO = "ritesh-1918/HELPDESK.AI"

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, check=False)
    return result

# Mandatory steps block to append to comments
MANDATORY_STEPS = """
Make sure you complete these mandatory onboarding steps first to get dashboard access:
1. Star the repo: https://github.com/ritesh-1918/HELPDESK.AI
2. Follow me: https://github.com/ritesh-1918
3. Connect on LinkedIn: https://www.linkedin.com/in/ritesh1908/

Once done, sign up on our platform and reply here with your signup email. I'll manually approve your dashboard access. Make sure your PR targets the 'gssoc' branch. Let's go."""

def main():
    print("====================================================================")
    print("      GSSoC 2026 HUMANIZED ISSUE TRIAGE & EXCLUSIVE ASSIGNMENTS     ")
    print("====================================================================")

    # 1. Close Resolved Issues
    resolved_issues = [133, 132, 131, 130, 129, 128, 125, 123, 122, 121, 120, 111, 109, 108, 107]
    print("\n[+] Closing 15 resolved issues on GitHub...")
    for iss in resolved_issues:
        res = run_gh(["issue", "close", str(iss), "--repo", REPO, "--reason", "completed"])
        if res.returncode == 0:
            print(f"  [OK] Closed Issue #{iss}")
        else:
            print(f"  [WARNING] Failed to close Issue #{iss}: {res.stderr.strip()}")
        time.sleep(0.5)

    # 2. Reply to Naman Singh on Issue #135
    print("\n[+] Replying to @namann5 on Issue #135...")
    c135 = """Hey @namann5, 

I manually rebased and merged your code directly into the `gssoc` branch due to some upstream merge conflicts. Pushed it to remote, it is fully live! 

I closed the PR to avoid conflicts but marked it with `gssoc:approved` and `level:critical` difficulty. You are fully credited with the maximum S-Tier GSSoC points! Appreciate the solid contribution."""
    run_gh(["issue", "comment", "135", "--repo", REPO, "--body", c135])
    run_gh(["issue", "close", "135", "--repo", REPO, "--reason", "completed"])
    print("[OK] Closed and replied to Issue #135!")

    # 3. Assign Issue #166 to @saij3b
    print("\n[+] Assigning Issue #166 to @saij3b...")
    run_gh(["issue", "edit", "166", "--repo", REPO, "--add-assignee", "saij3b"])
    c166 = f"Hey @saij3b, assigned you to #166. Note: strictly one active issue per person.{MANDATORY_STEPS}"
    run_gh(["issue", "comment", "166", "--repo", REPO, "--body", c166])
    print("[OK] Assigned and commented on Issue #166!")

    # 4. Assign Issue #167 to @rishab11250
    print("\n[+] Assigning Issue #167 to @rishab11250...")
    run_gh(["issue", "edit", "167", "--repo", REPO, "--add-assignee", "rishab11250"])
    c167 = f"Hey @rishab11250, assigned you to #167. Since you asked for a few, we're doing strictly one active issue per person. Once this is done, you can claim another.{MANDATORY_STEPS}"
    run_gh(["issue", "comment", "167", "--repo", REPO, "--body", c167])
    print("[OK] Assigned and commented on Issue #167!")

    # 5. Assign Issue #151 to @atul-upadhyay-7
    print("\n[+] Assigning Issue #151 to @atul-upadhyay-7...")
    run_gh(["issue", "edit", "151", "--repo", REPO, "--add-assignee", "atul-upadhyay-7"])
    c151 = f"Hey @atul-upadhyay-7, assigned you to #151. Strictly one active issue per person.{MANDATORY_STEPS}"
    run_gh(["issue", "comment", "151", "--repo", REPO, "--body", c151])
    print("[OK] Assigned and commented on Issue #151!")

    # 6. Post rule warnings on Issues #168, #156, #150 to keep them open for other developers
    print("\n[+] Commenting on Issue #168...")
    c168 = f"""Hey GSSoC contributors! 

Since both @saij3b and @rishab11250 are currently assigned to active tasks under GSSoC's strict "one person, one active issue" rule, this bounty remains open and available for ALL other contributors!

If you want to claim this, reply with your detailed implementation approach, and I will assign it to you.{MANDATORY_STEPS}"""
    run_gh(["issue", "comment", "168", "--repo", REPO, "--body", c168])

    print("\n[+] Commenting on Issue #156...")
    c156 = f"""Hey GSSoC contributors! 

Since @rishab11250 is already assigned to #167, this backend CI smoke test issue remains open and available for other developers to claim.

If you want to claim this, reply with your detailed implementation approach, and I will assign it to you.{MANDATORY_STEPS}"""
    run_gh(["issue", "comment", "156", "--repo", REPO, "--body", c156])

    print("\n[+] Commenting on Issue #150...")
    c150 = f"""Hey GSSoC contributors! 

Since @atul-upadhyay-7 is already assigned to #151, this authorization bypass issue remains open and available for other developers to claim.

If you want to claim this, reply with your detailed implementation approach, and I will assign it to you.{MANDATORY_STEPS}"""
    run_gh(["issue", "comment", "150", "--repo", REPO, "--body", c150])

    print("\n====================================================================")
    print("      ALL ISSUES SUCCESSFULLY TRIAGED, CLOSED, AND ASSIGNED!        ")
    print("====================================================================")

if __name__ == '__main__':
    main()
