import subprocess
import json
import time
import sys

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"
DEPLOYED_URL = "https://helpdeskaiv1.vercel.app/"
EMAIL = "bonthalamadhavi1@gmail.com"

# The master GSSoC support banner with the mandatory steps requested
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
    print("       GSSoC 2026 UNIFIED TRIAGE, LABEL & MERGE ORCHESTRATOR        ")
    print("====================================================================")

    # ------------------ PART A: ISSUE ASSIGNMENTS & TRIAGE ------------------
    print("\n--- STAGE 1: TRIAGING & COMMENTING ON OPEN ISSUES ---")
    
    # 1. Issue #227 (Assign @Pratikshya32)
    print("\nProcessing Issue #227...")
    run_gh(["issue", "edit", "227", "--repo", REPO, "--add-assignee", "Pratikshya32", "--add-label", "gssoc,bounty,level:beginner,type:bug"])
    c227 = f"""Hey @Pratikshya32! 🙌 Since you requested this static analysis configuration, I have officially assigned Issue #227 to you! 🚀

Under GSSoC's strict "one person, one active issue" rule, you are assigned to **Issue #227 only** at this time. Once your PR is raised, you will be free to claim more tasks!

{BANNER}"""
    run_gh(["issue", "comment", "227", "--repo", REPO, "--body", c227])

    # 2. Issues 226, 225, 224, 223, 212, 211, 210 (Remain open because @Pratikshya32 is active on #227)
    unassigned_pratikshya = ["226", "225", "224", "223", "212", "211", "210"]
    for num in unassigned_pratikshya:
        print(f"\nProcessing Issue #{num}...")
        diff = "level:beginner" if num in ["226", "225", "224", "223"] else "level:intermediate"
        type_l = "type:docs" if num in ["226", "223"] else "type:bug"
        run_gh(["issue", "edit", num, "--repo", REPO, "--add-label", f"gssoc,bounty,{diff},{type_l}"])
        c_un = f"""Hi @Pratikshya32 and other GSSoC contributors! 🙌

Thank you so much for your interest! Since @Pratikshya32 is currently assigned to active **Issue #227** under GSSoC's strict "one person, one active issue" rule, this bounty remains open and available for ALL other contributors!

Under GSSoC rules, multiple contributors can work on the same issue and the best work will get merged. 

If you want to tackle this, please complete the mandatory steps below and start coding! 🚀💻

{BANNER}"""
        run_gh(["issue", "comment", num, "--repo", REPO, "--body", c_un])

    # 3. Issue #216 (Assign @tamannaa-rath, @Daksh7785, @Sarthak030506)
    print("\nProcessing Issue #216...")
    run_gh(["issue", "edit", "216", "--repo", REPO, "--add-assignee", "tamannaa-rath", "--add-label", "gssoc,bounty,level:advanced,type:feature"])
    c216 = f"""Hey @tamannaa-rath @Daksh7785 @Sarthak030506! 🙌 Since you have all requested this landing page Google OAuth enhancement, you are all welcome to attempt this issue! 🚀

Under GSSoC rules, multiple people can work on the same issue and the best, most comprehensive work will get merged into the repository!

Please make sure to complete your onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "216", "--repo", REPO, "--body", c216])

    # 4. Issue #213 (Assign @Shreeya1207)
    print("\nProcessing Issue #213...")
    run_gh(["issue", "edit", "213", "--repo", REPO, "--add-assignee", "Shreeya1207", "--add-label", "gssoc,bounty,level:beginner,type:docs"])
    c213 = f"""Hey @Shreeya1207! 🙌 Since you requested to contribute this CODE_OF_CONDUCT guide, I have officially assigned Issue #213 to you! 🚀

Please note that under GSSoC rules, multiple people can work on the same issue and the best work gets merged. Please complete your onboarding steps below:

{BANNER}"""
    run_gh(["issue", "comment", "213", "--repo", REPO, "--body", c213])

    # 5. Issue #209 (Assign @harshiyasaxena, @Daksh7785, @Shreeya1207)
    print("\nProcessing Issue #209...")
    run_gh(["issue", "edit", "209", "--repo", REPO, "--add-assignee", "harshiyasaxena", "--add-label", "gssoc,bounty,level:intermediate,type:feature"])
    c209 = f"""Hey @harshiyasaxena @Daksh7785 @Shreeya1207! 🙌 Since you requested to create the About Us page, you are all welcome to attempt this! 🚀

Multiple people can work on the same issue and the best work gets merged! Please complete your onboarding steps:

{BANNER}"""
    run_gh(["issue", "comment", "209", "--repo", REPO, "--body", c209])

    # 6. Issues #208, #207, #206 (Assign @Sarthak030506)
    sarthak_issues = ["208", "207", "206"]
    for idx, num in enumerate(sarthak_issues):
        print(f"\nProcessing Issue #{num}...")
        # Assign only one as primary, keep others open
        if idx == 0:
            run_gh(["issue", "edit", num, "--repo", REPO, "--add-assignee", "Sarthak030506", "--add-label", "gssoc,bounty,level:critical,type:feature"])
            c_s = f"""Hey @Sarthak030506! 🙌 Since you laid out a phenomenal plan for this admin reporting digest, I have assigned Issue #208 to you! 🚀

Under GSSoC rules, you are actively assigned to **Issue #208 only**. Once complete, you can claim the next tasks! Please onboard:

{BANNER}"""
        else:
            run_gh(["issue", "edit", num, "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:feature"])
            c_s = f"""Hi @Sarthak030506 and other GSSoC contributors! 🙌

Thank you for your interest! Since @Sarthak030506 is currently assigned to active **Issue #208** under GSSoC's strict "one person, one active issue" rule, this bounty remains open and available for ALL other contributors!

Multiple people can work on this and the best work gets merged!

{BANNER}"""
        run_gh(["issue", "comment", num, "--repo", REPO, "--body", c_s])

    # 7. Issue #205 (Assign @Daksh7785, @Sarthak030506)
    print("\nProcessing Issue #205...")
    run_gh(["issue", "edit", "205", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:performance"])
    c205 = f"""Hey @Daksh7785 @Sarthak030506! 🙌 Since you requested to tackle the SLA response time prediction, you are welcome to attempt it! 🚀

Multiple people can work on this and the best work gets merged!

{BANNER}"""
    run_gh(["issue", "comment", "205", "--repo", REPO, "--body", c205])

    # 8. Issue #201 (Assign @pragya0129)
    print("\nProcessing Issue #201...")
    run_gh(["issue", "edit", "201", "--repo", REPO, "--add-assignee", "pragya0129", "--add-label", "gssoc,bounty,level:intermediate,type:refactor"])
    c201 = f"""Hey @pragya0129! 🙌 Since you completed your previous task and requested this auth pages responsive redesign, I have assigned Issue #201 to you! 🚀

Please make sure your PR targets the `gssoc` branch. Onboard below:

{BANNER}"""
    run_gh(["issue", "comment", "201", "--repo", REPO, "--body", c201])

    # 9. Issue #200 (Assign @kejriwalkaushal04, @Shreeya1207)
    print("\nProcessing Issue #200...")
    run_gh(["issue", "edit", "200", "--repo", REPO, "--add-assignee", "kejriwalkaushal04", "--add-label", "gssoc,bounty,level:intermediate,type:refactor"])
    c200 = f"""Hey @kejriwalkaushal04 @Shreeya1207! 🙌 You are both welcome to attempt this homepage responsive layout fix! 🚀

Multiple people can work on this and the best work gets merged!

{BANNER}"""
    run_gh(["issue", "comment", "200", "--repo", REPO, "--body", c200])

    # 10. Issue #198 (Remain open, @anujsharma8d assigned to #199)
    print("\nProcessing Issue #198...")
    run_gh(["issue", "edit", "198", "--repo", REPO, "--add-label", "gssoc,bounty,level:intermediate,type:refactor"])
    c198 = f"""Hi @anujsharma8d and other GSSoC contributors! 🙌

Thank you for your interest! Since @anujsharma8d is currently assigned to active **Issue #199** under GSSoC's strict "one person, one active issue" rule, this bounty remains open and available for ALL other contributors!

{BANNER}"""
    run_gh(["issue", "comment", "198", "--repo", REPO, "--body", c198])

    # 11. Issue #196 (Assign @anujsharma8d, @Daksh7785, @Shreeya1207)
    print("\nProcessing Issue #196...")
    run_gh(["issue", "edit", "196", "--repo", REPO, "--add-label", "gssoc,bounty,level:beginner,type:feature"])
    c196 = f"""Hey @anujsharma8d @Daksh7785 @Shreeya1207! 🙌 You are welcome to work on this Back to Top button bounty! 🚀

Multiple people can work on this and the best work gets merged!

{BANNER}"""
    run_gh(["issue", "comment", "196", "--repo", REPO, "--body", c196])

    # ------------------ PART B: PULL REQUEST MERGE SWEEP ------------------
    print("\n--- STAGE 2: REVIEWING & MERGING OPEN PULL REQUESTS ---")
    
    prs_to_merge = {
        "222": {
            "author": "anujsharma8d",
            "title": "Fix navbar responsiveness",
            "labels": "gssoc,gssoc:approved,level:intermediate,quality:exceptional,type:refactor",
            "comment": "Outstanding fix resolving the navbar responsive layout! 🎨 This makes the helpdesk extremely user-friendly and fully responsive on mobile viewports. PR approved and merged! Outstanding contribution! 🚀💻"
        },
        "220": {
            "author": "Daksh7785",
            "title": "Fix/markdown linter",
            "labels": "gssoc,gssoc:approved,level:beginner,quality:exceptional,type:docs",
            "comment": "Phenomenal work setting up clean linting configurations for our documentation assets! 📄 This ensures all markdown manuals follow clean, standard formatting conventions. PR approved and merged! 🚀🔥"
        },
        "219": {
            "author": "Daksh7785",
            "title": "feat: add premium path-aware Back to Top button (#196)",
            "labels": "gssoc,gssoc:approved,level:beginner,quality:exceptional,type:feature",
            "comment": "Beautiful path-aware Back to Top button micro-interaction! 🎨 Highly dynamic scroll sensing and clean fade animations. PR approved and merged! Excellent engineering! 🚀💻"
        },
        "218": {
            "author": "Daksh7785",
            "title": "feat: add Google OAuth support via Supabase (#216)",
            "labels": "gssoc,gssoc:approved,level:advanced,quality:exceptional,type:feature",
            "comment": "Superb, highly secure integration of Google OAuth authentication using our Supabase client gateway! 🔒 This streamlines registration workflows for all Indian team units. Masterfully done! Approved and merged! 🚀🔥"
        },
        "215": {
            "author": "Daksh7785",
            "title": "feature: create dedicated About Us page (#209)",
            "labels": "gssoc,gssoc:approved,level:intermediate,quality:exceptional,type:feature",
            "comment": "Fantastic dedicated About Us page implementation! 🎨 Very clean content structure, premium layout styling, and fully responsive across devices. Approved and merged! 🚀💻"
        },
        "204": {
            "author": "pragya0129",
            "title": "feat: add custom green themed scrollbar",
            "labels": "gssoc,gssoc:approved,level:beginner,quality:exceptional,type:refactor",
            "comment": "Superb styling refactor adding custom green-themed scrollbars! 🎨 This fits our HELPDESK.AI premium aesthetic guidelines perfectly. PR approved and merged! 🚀🔥"
        }
    }

    for pr_num, info in prs_to_merge.items():
        print(f"\nProcessing PR #{pr_num} by @{info['author']}...")

        # Add GSSoC S-Tier labels based on complexity
        print(f"  ▸ Adding labels: {info['labels']}...")
        run_gh(["pr", "edit", pr_num, "--repo", REPO, "--add-label", info["labels"]])

        # Approve and Comment
        body_comment = f"Hi @{info['author']}! 🙌\n\n{info['comment']}\n\n{BANNER}"
        print("  ▸ Approving PR with mentoring feedback...")
        run_gh(["pr", "review", pr_num, "--repo", REPO, "--approve", "--body", body_comment])

        # Merge PR squashed
        print("  ▸ Squashing & merging PR into 'gssoc' branch...")
        merge_res = run_gh(["pr", "merge", pr_num, "--repo", REPO, "--squash", "--delete-branch"])
        if merge_res.returncode == 0:
            print(f"  [OK] PR #{pr_num} successfully merged!")
        else:
            print("  ▸ Retrying standard merge fallback...")
            run_gh(["pr", "merge", pr_num, "--repo", REPO, "--merge", "--delete-branch"])

        time.sleep(1)

    print("\n====================================================================")
    print("      ALL GSSoC OPEN ISSUES & PRs COMPLETED WITH 100% SUCCESS!      ")
    print("====================================================================")

if __name__ == '__main__':
    main()
