import subprocess
import time
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"

# Standard onboarding banner for Ritesh
ONBOARDING_TEXT = """
Make sure you complete these mandatory onboarding steps to get dashboard access:
1. ⭐ Star the repo: https://github.com/ritesh-1918/HELPDESK.AI
2. 👤 Follow me on GitHub: https://github.com/ritesh-1918
3. 💼 Connect on LinkedIn: https://www.linkedin.com/in/ritesh1908/
4. 🚀 Sign up on the platform and reply here with your signup email so I can manually approve your dashboard access.

Ensure your PR targets the 'gssoc' branch, not 'main'. Let's do this!"""

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, encoding="utf-8")
    return result

def main():
    print("====================================================================")
    print("      GSSoC 2026 REMAINING ISSUES TRIAGE & ONBOARDING SYSTEM        ")
    print("====================================================================")

    # 1. Issue #117 - Unauthenticated IDOR (Critical Bug)
    print("\n[+] Triaging Issue #117...")
    # Add proper labels for GSSoC points maximization
    run_gh(["issue", "edit", "117", "--repo", REPO, "--add-label", "gssoc,level:critical,type:security,type:bug"])
    c117 = f"""Hey GSSoC contributors! 

This critical IDOR bug on unauthenticated ticket endpoints is open and available for anyone who wants to claim it! 

Under our strict "one person, one active issue" rule, if you are not currently assigned to another open issue, feel free to reply with your detailed implementation plan to claim this task.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "117", "--repo", REPO, "--body", c117])
    print("  [OK] Commented and labeled #117")
    time.sleep(1)

    # 2. Issue #102 - Frontend 2.19MB Initial JS Bundle
    print("\n[+] Triaging Issue #102...")
    run_gh(["issue", "edit", "102", "--repo", REPO, "--add-label", "gssoc,level:critical,type:performance,type:bug"])
    c102 = f"""Hey @harshitanagpal05, just confirming you are officially assigned to #102 to optimize the JS bundle size! 

Under our strict "one person, one active issue" rule, you are assigned here only. Since @anksingh1212121 is on #100 and @sumedhag28 is on #85, everyone has a separate task to focus on.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "102", "--repo", REPO, "--body", c102])
    print("  [OK] Commented and labeled #102")
    time.sleep(1)

    # 3. Issue #100 - NER Highlight Contrast in Dark Mode
    print("\n[+] Triaging Issue #100...")
    run_gh(["issue", "edit", "100", "--repo", REPO, "--add-label", "gssoc,level:beginner,type:bug"])
    c100 = f"""Hey @anksingh1212121, just confirming you are officially assigned to #100 to fix the NER contrast issue in dark mode! 

Under our strict "one person, one active issue" rule, you are assigned here only. 

For @saranshjohri07 and @gopuvarshini14-creator, thank you for applying! Since @anksingh1212121 is already assigned to this issue, please check out other open tasks like #117, #150, or #156 so we can assign you a separate issue.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "100", "--repo", REPO, "--body", c100])
    print("  [OK] Commented and labeled #100")
    time.sleep(1)

    # 4. Issue #85 - Docs: Local Backend Setup
    print("\n[+] Triaging Issue #85...")
    run_gh(["issue", "edit", "85", "--repo", REPO, "--add-label", "gssoc,level:beginner,type:docs"])
    c85 = f"""Hey @YashKrTripathi and @sumedhag28, just checking in on the Local Backend Setup & Schema Verification Guide! 

Under our strict "one person, one active issue" rule, you both are assigned here to collaborate on this guide. Since @harshitanagpal05 is on #102 and @anksingh1212121 is on #100, everyone has separate tasks to focus on.

For @krushnanirmalkar, thank you for applying, but please check other open tasks like #117, #150, or #156 so we can assign you a separate issue!
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "85", "--repo", REPO, "--body", c85])
    print("  [OK] Commented and labeled #85")
    time.sleep(1)

    print("\n====================================================================")
    print("        ALL REMAINING ISSUES TRIAGED & ONBOARDING ENFORCED!         ")
    print("====================================================================")

if __name__ == '__main__':
    main()
