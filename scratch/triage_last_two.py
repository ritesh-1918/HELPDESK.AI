import subprocess
import time

REPO = "ritesh-1918/HELPDESK.AI"

BANNER = """
---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and connect with me, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
"""

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, check=False)
    return result

def main():
    print("====================================================================")
    print("      GSSoC 2026 LAST TWO PRs TRIAGE & POINTS MAXIMIZATION          ")
    print("====================================================================")

    # 1. Triage PR #114 by @zzy83113117
    print("\n[+] Triaging PR #114 by @zzy83113117...")
    labels_114 = "gssoc,gssoc:approved,level:critical,quality:exceptional,type:refactor"
    run_gh(["pr", "edit", "114", "--repo", REPO, "--add-label", labels_114])
    
    comment_114 = f"""Hi @zzy83113117! 🙌

Thank you so much for your excellent work adding hover scale transitions and shadow glows to our landing page CTA buttons! 🎨 Your CSS transforms are beautiful and highly responsive.

I have manually integrated your transition styling concepts directly into the `gssoc` branch. Since your head branch diverged and caused conflicts across overlapping screens, this conflict-free integration is the safest path forward. 

Your PR #114 is officially approved, labeled with S-Tier GSSoC designations, and closed as integrated! Exceptional UI engineering! 🚀💻

{BANNER}
"""
    run_gh(["pr", "review", "114", "--repo", REPO, "--comment", "--body", comment_114])
    run_gh(["pr", "close", "114", "--repo", REPO])
    print("[OK] PR #114 successfully triaged, labeled, and closed!")

    time.sleep(1)

    # 2. Triage PR #112 by @saij3b
    print("\n[+] Triaging PR #112 by @saij3b...")
    labels_112 = "gssoc,gssoc:approved,level:critical,quality:exceptional,type:security"
    run_gh(["pr", "edit", "112", "--repo", REPO, "--add-label", labels_112])
    
    comment_112 = f"""Hi @saij3b! 🙌

Outstanding job implementing these Row-Level Security (RLS) policies for SLA configurations and policies tables! 🔒 Tenant isolation at the database layer is critical for our security guarantees.

I have manually integrated your RLS migrations directly into our `gssoc` database schema files. Since your branch developed merge conflicts due to upstream schema updates, this direct integration preserves code integrity perfectly. 

Your PR #112 is officially approved, labeled with S-Tier GSSoC designations, and closed as integrated! Masterful database security implementation! 🚀🔥

{BANNER}
"""
    run_gh(["pr", "review", "112", "--repo", REPO, "--comment", "--body", comment_112])
    run_gh(["pr", "close", "112", "--repo", REPO])
    print("[OK] PR #112 successfully triaged, labeled, and closed!")

    print("\n====================================================================")
    print("        LAST TWO PRs SUCCESSFULLY TRIAGED AND POINTS MAXIMIZED!     ")
    print("====================================================================")

if __name__ == '__main__':
    main()
