import subprocess
import json
import time
import sys

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"
DEPLOYED_URL = "https://helpdeskaiv1.vercel.app/"
EMAIL = "bonthalamadhavi1@gmail.com"

BANNER = f"""
---

### 🌟 Mandatory Onboarding Steps (Must Complete!)
To ensure your GSSoC contribution is evaluated and your account cleared for dashboard testing, please complete these steps:
1. ⭐ **Star this repository**: https://github.com/ritesh-1918/HELPDESK.AI
2. 🍴 **Fork this repository**: https://github.com/ritesh-1918/HELPDESK.AI/fork
3. 👤 **Follow @ritesh-1918 on GitHub**: https://github.com/ritesh-1918
4. 💼 **Connect on LinkedIn**: https://www.linkedin.com/in/ritesh1908/
5. 🚀 **Register & Onboard**:
   - Go to the deployed app: {DEPLOYED_URL}
   - Click **Sign In** -> **Create Account** (or go directly to `{DEPLOYED_URL}admin-signup` to test administrative features).
   - Select **Ritesh Private Limited Company** as your organization.
   - Reply to your assigned thread or email ritesh at `{EMAIL}` with your username to get your access approved instantly!

*Note: All PR branches must target the `gssoc` branch, NOT `main`.*
"""

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        print(f"  [ERROR] gh {' '.join(args[:2])} failed: {result.stderr.strip()}")
    else:
        print(f"  [OK] gh {' '.join(args[:2])} succeeded!")
    return result

def main():
    print("====================================================================")
    print("        GSSoC 2026 REMAINING OPEN ISSUES TRIAGE & SWEEP             ")
    print("====================================================================")

    # 1. Issue #217
    print("\nProcessing Issue #217...")
    run_gh(["issue", "edit", "217", "--repo", REPO, "--add-label", "gssoc,bounty,level:beginner,type:docs"])
    c217 = f"""Hi GSSoC contributors! 🙌

This bounty is open and available for ALL contributors! Under GSSoC rules, multiple contributors can work on the same issue and the best work will get merged. 

If you want to tackle this, please complete the mandatory steps below and start coding! 🚀💻

{BANNER}"""
    run_gh(["issue", "comment", "217", "--repo", REPO, "--body", c217])

    # 2. Issue #199
    print("\nProcessing Issue #199...")
    run_gh(["issue", "edit", "199", "--repo", REPO, "--add-label", "gssoc,bounty,level:intermediate,type:refactor"])
    c199 = f"""Hey @anujsharma8d! 🙌 Since you are working on this responsive navbar issue, please make sure to complete your onboarding steps so we can clear your account for dashboard testing!

{BANNER}"""
    run_gh(["issue", "comment", "199", "--repo", REPO, "--body", c199])

    # 3. Issue #195
    print("\nProcessing Issue #195...")
    run_gh(["issue", "edit", "195", "--repo", REPO, "--add-label", "gssoc,bounty,level:intermediate,type:bug"])
    c195 = f"""Hey @saurabhhhcodes @harshitanagpal05! 🙌 Since we have dynamic secret tracking, please make sure your PR targets the `gssoc` branch and complete onboarding steps below:

{BANNER}"""
    run_gh(["issue", "comment", "195", "--repo", REPO, "--body", c195])

    # 4. Issue #189
    print("\nProcessing Issue #189...")
    run_gh(["issue", "edit", "189", "--repo", REPO, "--add-label", "gssoc,bounty,level:intermediate,type:bug"])
    c189 = f"""Hey @anksingh1212121! 🙌 Since you are assigned to this dark mode issue, please make sure to complete the mandatory onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "189", "--repo", REPO, "--body", c189])

    # 5. Issue #187
    print("\nProcessing Issue #187...")
    run_gh(["issue", "edit", "187", "--repo", REPO, "--add-label", "gssoc,bounty,level:intermediate,type:bug"])
    c187 = f"""Hey @saurabhhhcodes! 🙌 Since you opened a fix for this, please make sure to complete the onboarding steps so we can approve your access in the dashboard:

{BANNER}"""
    run_gh(["issue", "comment", "187", "--repo", REPO, "--body", c187])

    # 6. Issue #179
    print("\nProcessing Issue #179...")
    run_gh(["issue", "edit", "179", "--repo", REPO, "--add-label", "gssoc,bounty,level:beginner,type:bug"])
    c179 = f"""Hey @codeananyagupta! 🙌 Since you are assigned to this ticket store issue, please make sure to complete the onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "179", "--repo", REPO, "--body", c179])

    # 7. Issue #175
    print("\nProcessing Issue #175...")
    run_gh(["issue", "edit", "175", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:feature"])
    c175 = f"""Hey @codeananyagupta! 🙌 Since you are working on this webhook integration, please make sure to complete the onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "175", "--repo", REPO, "--body", c175])

    # 8. Issue #174 (Ananya is assigned to #175, so #174 remains open for others under GSSoC rules)
    print("\nProcessing Issue #174...")
    run_gh(["issue", "edit", "174", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:feature"])
    c174 = f"""Hi @codeananyagupta and other GSSoC contributors! 🙌

Thank you so much for your interest! Since @codeananyagupta is currently assigned to active **Issue #175** under GSSoC's strict "one person, one active issue" rule, this export bounty remains open and available for ALL other contributors!

Multiple contributors can work on this and the best work will get merged. Onboard below:

{BANNER}"""
    run_gh(["issue", "comment", "174", "--repo", REPO, "--body", c174])

    # 9. Issue #167
    print("\nProcessing Issue #167...")
    run_gh(["issue", "edit", "167", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:performance"])
    c167 = f"""Hey @rishab11250! 🙌 Since you are assigned to this heartbeat pooling issue, please make sure to complete the onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "167", "--repo", REPO, "--body", c167])

    # 10. Issue #156 (Rishab is assigned to #167, so #156 remains open for others under GSSoC rules)
    print("\nProcessing Issue #156...")
    run_gh(["issue", "edit", "156", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:bug"])
    c156 = f"""Hi @rishab11250 @saurabhhhcodes and other GSSoC contributors! 🙌

Thank you so much for your interest! Since @rishab11250 is assigned to active **Issue #167** under GSSoC's strict "one person, one active issue" rule, this backend smoke test bounty remains open and available for ALL other contributors!

Multiple contributors can work on this and the best work will get merged! Onboard below:

{BANNER}"""
    run_gh(["issue", "comment", "156", "--repo", REPO, "--body", c156])

    # 11. Issue #151
    print("\nProcessing Issue #151...")
    run_gh(["issue", "edit", "151", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:security"])
    c151 = f"""Hey @atul-upadhyay-7 @saurabhhhcodes! 🙌 Since you are assigned to this mobile security issue, please make sure to complete the onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "151", "--repo", REPO, "--body", c151])

    # 12. Issue #150 (Atul is assigned to #151, so #150 remains open for others under GSSoC rules)
    print("\nProcessing Issue #150...")
    run_gh(["issue", "edit", "150", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:security"])
    c150 = f"""Hi @atul-upadhyay-7 @saurabhhhcodes and other GSSoC contributors! 🙌

Thank you so much for your interest! Since @atul-upadhyay-7 is assigned to active **Issue #151** under GSSoC's strict "one person, one active issue" rule, this auth bypass bounty remains open and available for ALL other contributors!

Multiple contributors can work on this and the best work will get merged! Onboard below:

{BANNER}"""
    run_gh(["issue", "comment", "150", "--repo", REPO, "--body", c150])

    # 13. Issue #85
    print("\nProcessing Issue #85...")
    run_gh(["issue", "edit", "85", "--repo", REPO, "--add-label", "gssoc,bounty,level:beginner,type:docs"])
    c85 = f"""Hey @YashKrTripathi @sumedhag28! 🙌 Since you are assigned to this docs issue, please make sure to complete the onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "85", "--repo", REPO, "--body", c85])

    print("\n====================================================================")
    print("       REMAINING OPEN ISSUES TRIAGE & SWEEP COMPLETED!              ")
    print("====================================================================")

if __name__ == '__main__':
    main()
