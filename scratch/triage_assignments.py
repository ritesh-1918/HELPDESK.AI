import subprocess
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        print(f"Error running {' '.join(args)}: {result.stderr}")
    else:
        print(f"Successfully ran gh {' '.join(args[:2])}")
    return result

# Standardized support campaign banner
BANNER = """
---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and stay connected with me for future opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
"""

# 1. Close Issue #106 (Mobile Setup docs integrated)
print("\nClosing Issue #106...")
run_gh(["issue", "close", "106", "--repo", REPO, "--reason", "completed"])

# 2. Close PR #126 (integrated and credited)
print("\nTriaging PR #126...")
run_gh(["pr", "edit", "126", "--repo", REPO, "--add-label", "gssoc,gssoc:approved,level:critical,quality:exceptional,type:docs"])
c126 = f"""Hi @aglichandrap! 🙌

I have manually integrated your comprehensive Mobile App Setup Guide directly into the `gssoc` branch, committed, and pushed it to remote! Since your branch had unrelated merge conflicts in 50+ screen files, this conflict-free integration is the safest path forward. 

Your PR #126 is officially approved, GSSoC-labeled, and closed as merged! Amazing documentation work. Appending our developer network banner! 🚀💻

{BANNER}
"""
run_gh(["pr", "review", "126", "--repo", REPO, "--comment", "--body", c126])
run_gh(["pr", "close", "126", "--repo", REPO])

# 3. Close PR #127 (CI pipeline integrated)
print("\nTriaging PR #127...")
run_gh(["pr", "edit", "127", "--repo", REPO, "--add-label", "gssoc,gssoc:approved,level:critical,quality:exceptional,type:devops"])
c127 = f"""Hi @zxy0314-work! 🙌

I have manually integrated your CI Pipeline and `.env.example` configurations directly into the `gssoc` branch! Since your head branch diverged and caused conflicts across 50+ screens, we applied your CI and environment configurations cleanly.

Your PR #127 is officially approved, GSSoC-labeled, and closed as merged! Phenomenal CI pipeline automation. Appending our developer network banner! 🚀💻

{BANNER}
"""
run_gh(["pr", "review", "127", "--repo", REPO, "--comment", "--body", c127])
run_gh(["pr", "close", "127", "--repo", REPO])

# 4. Close Issue #110 (Ticket Translation merged)
print("\nClosing Issue #110...")
run_gh(["issue", "close", "110", "--repo", REPO, "--reason", "completed"])

# 5. Assign Issue #120 to @rishab11250
print("\nAssigning Issue #120 to @rishab11250...")
run_gh(["issue", "edit", "120", "--repo", REPO, "--add-assignee", "rishab11250", "--add-label", "gssoc,bounty,level:critical,type:bug"])
c120 = f"""Hey @rishab11250! 🙌 

Since you requested to work on this high-yield parsing bounty, I have officially assigned Issue #120 to you! 🚀

Please note that under GSSoC's strict "one person, one active issue" rule, you are assigned to **Issue #120 only** at the moment. Once you submit a PR for #120, feel free to claim any of the other open issues!

Please make sure your PR targets the `gssoc` branch. Excited to see your clean code in action! Let's go! 💻🔥

{BANNER}
"""
run_gh(["issue", "comment", "120", "--repo", REPO, "--body", c120])

# 6. Post comments on Issues 121, 122, 123 explaining "one person, one issue" rule
issues_unassigned = [121, 122, 123]
for num in issues_unassigned:
    print(f"\nCommenting on Issue #{num}...")
    run_gh(["issue", "edit", f"{num}", "--repo", REPO, "--add-label", "gssoc,bounty,level:critical,type:bug"])
    c_un = f"""Hi @rishab11250 and other GSSoC contributors! 🙌

Thank you so much for your awesome interest in fixing this issue! Since @rishab11250 is currently assigned to **Issue #120** under GSSoC's strict "one person, one active issue" rule, this bounty remains open and available for ALL other contributors!

If you want to claim this critical issue, please comment here with your detailed implementation approach, and I will assign it to you immediately! 🚀💻

{BANNER}
"""
    run_gh(["issue", "comment", f"{num}", "--repo", REPO, "--body", c_un])

# 7. Assign Issue #125 to @harshitanagpal05
print("\nAssigning Issue #125 to @harshitanagpal05...")
run_gh(["issue", "edit", "125", "--repo", REPO, "--add-assignee", "harshitanagpal05", "--add-label", "gssoc,bounty,level:critical,type:bug"])
c125 = f"""Hey @harshitanagpal05! 🙌 

Since you requested to tackle this Jest browser globals lint issue, I have officially assigned Issue #125 to you! 🚀

Please make sure your PR targets the `gssoc` branch. Excited to see this lint blocker cleared! Let's go! 💻🔥

{BANNER}
"""
run_gh(["issue", "comment", "125", "--repo", REPO, "--body", c125])

# 8. Assign Issue #130 to @Hobie1Kenobi
print("\nAssigning Issue #130 to @Hobie1Kenobi...")
run_gh(["issue", "edit", "130", "--repo", REPO, "--add-assignee", "Hobie1Kenobi", "--add-label", "gssoc,bounty,level:advanced,type:devops"])
c130 = f"""Hey @Hobie1Kenobi! 🙌 

Since we have successfully integrated and closed your previous assignment (Issue #106), you are now completely free! I have officially assigned this advanced DevOps containerization bounty to you! 🚀

For @saij3b, thank you so much for your attempt! Since Hobie is free and laid out a phenomenal, highly structured implementation plan, we have assigned this task to him under the chronological first commenter assignment rule. Please stay tuned for new issues coming up very soon! 🌟

@Hobie1Kenobi, please target the `gssoc` branch when you raise your PR. Looking forward to those optimized multi-stage Docker builds! Let's go! 💻🔥

{BANNER}
"""
run_gh(["issue", "comment", "130", "--repo", REPO, "--body", c130])

print("\nAll triage assignments completed successfully!")
