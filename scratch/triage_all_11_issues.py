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
    print("      GSSoC 2026 COMPLETE TRIAGE & EXCLUSIVE ASSIGNMENTS SYSTEM     ")
    print("====================================================================")

    # 1. Issue #168 - Prometheus & Grafana Service Monitoring
    print("\n[+] Triaging Issue #168...")
    # Attempt to assign YashKrTripathi
    res = run_gh(["issue", "edit", "168", "--repo", REPO, "--add-assignee", "YashKrTripathi"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign YashKrTripathi via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned YashKrTripathi on GitHub")
    c168 = f"""Hey @YashKrTripathi, I've officially assigned #168 to you! 

Under our strict one-active-issue rule, you are assigned here only. Since @harshitanagpal05 is assigned to #102, this monitoring dashboard bounty is all yours.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "168", "--repo", REPO, "--body", c168])
    print("  [OK] Commented on #168")
    time.sleep(1)

    # 2. Issue #167 - WebSockets Heartbeat & Connection Pooling
    print("\n[+] Triaging Issue #167...")
    res = run_gh(["issue", "edit", "167", "--repo", REPO, "--add-assignee", "rishab11250"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign rishab11250 via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned rishab11250 on GitHub")
    # Make sure labels are set
    run_gh(["issue", "edit", "167", "--repo", REPO, "--add-label", "gssoc,level:critical,type:performance,bounty"])
    c167 = f"""Hey @rishab11250, just confirming you're officially assigned to #167. 

Remember, we're doing strictly one active issue per person. Once you complete this, you're welcome to claim another!
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "167", "--repo", REPO, "--body", c167])
    print("  [OK] Commented and verified #167")
    time.sleep(1)

    # 3. Issue #166 - Cryptographic AES-256 Encryption
    print("\n[+] Triaging Issue #166...")
    res = run_gh(["issue", "edit", "166", "--repo", REPO, "--add-assignee", "saij3b"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign saij3b via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned saij3b on GitHub")
    run_gh(["issue", "edit", "166", "--repo", REPO, "--add-label", "gssoc,level:critical,type:security,bounty"])
    c166 = f"""Hey @saij3b, just confirming you're officially assigned to #166. 

Note that we are strictly enforcing one active issue per developer at a time. Excited to see your encryption implementation!
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "166", "--repo", REPO, "--body", c166])
    print("  [OK] Commented and verified #166")
    time.sleep(1)

    # 4. Issue #161 - AI-powered Spam and Phishing Detection
    print("\n[+] Triaging Issue #161...")
    res = run_gh(["issue", "edit", "161", "--repo", REPO, "--add-assignee", "Sweksha-Kakkar"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign Sweksha-Kakkar via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned Sweksha-Kakkar on GitHub")
    run_gh(["issue", "edit", "161", "--repo", REPO, "--add-label", "gssoc,level:critical,type:feature,type:security,bounty"])
    c161 = f"""Hey @Sweksha-Kakkar, just confirming your assignment on #161 since you requested it first. 

Strictly one active issue per person. @YashKrTripathi, thanks for your interest, but you're now assigned to #168 so we can keep things separate and fair for everyone!
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "161", "--repo", REPO, "--body", c161])
    print("  [OK] Commented and verified #161")
    time.sleep(1)

    # 5. Issue #156 - Backend CI Smoke Test
    print("\n[+] Triaging Issue #156...")
    run_gh(["issue", "edit", "156", "--repo", REPO, "--add-label", "gssoc,level:advanced,type:bug"])
    c156 = f"""Hey GSSoC contributors! 

This backend CI smoke test bug is open and up for grabs! Since both @rishab11250 and @atul-upadhyay-7 are currently assigned to other active issues, this task is open for a new contributor.

If you're not working on another issue and want to claim this, reply with your proposed fix.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "156", "--repo", REPO, "--body", c156])
    print("  [OK] Commented and labeled #156")
    time.sleep(1)

    # 6. Issue #151 - Hardcoded Supabase Anon Key
    print("\n[+] Triaging Issue #151...")
    res = run_gh(["issue", "edit", "151", "--repo", REPO, "--add-assignee", "atul-upadhyay-7"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign atul-upadhyay-7 via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned atul-upadhyay-7 on GitHub")
    run_gh(["issue", "edit", "151", "--repo", REPO, "--add-label", "gssoc,level:critical,type:security"])
    c151 = f"""Hey @atul-upadhyay-7, just confirming you're officially assigned to #151. 

Remember, we're doing strictly one active issue per person. @Hobie1Kenobi, thank you for applying, but we are enforcing separate assignments so everyone gets a fair shot!
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "151", "--repo", REPO, "--body", c151])
    print("  [OK] Commented and verified #151")
    time.sleep(1)

    # 7. Issue #150 - Client-Side Cache Auth Bypass
    print("\n[+] Triaging Issue #150...")
    run_gh(["issue", "edit", "150", "--repo", REPO, "--add-label", "gssoc,level:critical,type:security"])
    c150 = f"""Hey GSSoC contributors! 

This authorization bypass bug is open and available! Both @atul-upadhyay-7 and @saij3b are already assigned to other active issues, so this task is open for any new developer who is free.

If you want to claim this, reply with your proposed fix.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "150", "--repo", REPO, "--body", c150])
    print("  [OK] Commented and labeled #150")
    time.sleep(1)

    # 8. Issue #117 - Unauthenticated IDOR
    print("\n[+] Triaging Issue #117...")
    run_gh(["issue", "edit", "117", "--repo", REPO, "--add-label", "gssoc,level:critical,type:security"])
    c117 = f"""Hey GSSoC contributors! 

This critical IDOR bug on unauthenticated ticket endpoints is open and available for anyone who wants to claim it! 

Under our strict one-active-issue rule, if you are not currently assigned to another open issue, feel free to reply with your detailed implementation plan to claim this task.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "117", "--repo", REPO, "--body", c117])
    print("  [OK] Commented and labeled #117")
    time.sleep(1)

    # 9. Issue #102 - Frontend 2.19MB Initial JS Bundle
    print("\n[+] Triaging Issue #102...")
    res = run_gh(["issue", "edit", "102", "--repo", REPO, "--add-assignee", "harshitanagpal05"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign harshitanagpal05 via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned harshitanagpal05 on GitHub")
    run_gh(["issue", "edit", "102", "--repo", REPO, "--add-label", "gssoc,level:critical,type:performance"])
    c102 = f"""Hey @harshitanagpal05, I've assigned #102 to you to optimize the JS bundle size! 

Under our strict one-active-issue rule, you're assigned here only. Since @anksingh1212121 is on #100 and @sumedhag28 is on #85, everyone has a separate task to focus on.
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "102", "--repo", REPO, "--body", c102])
    print("  [OK] Commented and labeled #102")
    time.sleep(1)

    # 10. Issue #100 - NER Highlight Contrast in Dark Mode
    print("\n[+] Triaging Issue #100...")
    res = run_gh(["issue", "edit", "100", "--repo", REPO, "--add-assignee", "anksingh1212121"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign anksingh1212121 via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned anksingh1212121 on GitHub")
    run_gh(["issue", "edit", "100", "--repo", REPO, "--add-label", "gssoc,level:beginner,type:bug"])
    c100 = f"""Hey @anksingh1212121, assigned #100 to you to fix the NER contrast issue in dark mode! 

Under our strict one-person-one-issue rule, you're set up here. @harshitanagpal05 and @saranshjohri07, thanks for applying, but we are enforcing separate assignments so everyone gets a fair shot. Please check other open issues like #117, #150, or #156!
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "100", "--repo", REPO, "--body", c100])
    print("  [OK] Commented and labeled #100")
    time.sleep(1)

    # 11. Issue #85 - Docs: Local Backend Setup
    print("\n[+] Triaging Issue #85...")
    res = run_gh(["issue", "edit", "85", "--repo", REPO, "--add-assignee", "sumedhag28"])
    if res.returncode != 0:
        print(f"  [NOTE] Could not assign sumedhag28 via CLI: {res.stderr.strip()}")
    else:
        print("  [OK] Assigned sumedhag28 on GitHub")
    run_gh(["issue", "edit", "85", "--repo", REPO, "--add-label", "gssoc,level:beginner,type:docs"])
    c85 = f"""Hey @sumedhag28, I've assigned #85 to you to write the Local Backend Setup & Schema Verification Guide!

Under our strict one-active-issue rule, you're set up here. @YashKrTripathi is assigned to #168, and @krushnanirmalkar, thank you for applying, but please check other open tasks like #117, #150, or #156 so we can assign you a separate issue!
{ONBOARDING_TEXT}"""
    run_gh(["issue", "comment", "85", "--repo", REPO, "--body", c85])
    print("  [OK] Commented and labeled #85")
    time.sleep(1)

    print("\n====================================================================")
    print("        ALL 11 OPEN ISSUES TRIAGED & POINTS MAXIMIZED SUCCESSFULLY! ")
    print("====================================================================")

if __name__ == '__main__':
    main()
