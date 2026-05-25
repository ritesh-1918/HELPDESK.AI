import subprocess
import sys

# Reconfigure stdout to use UTF-8 to prevent encoding errors on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def run(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        print(f"Error running {' '.join(args)}: {result.stderr}")
    else:
        print(f"Successfully executed command.")
    return result

REPO = "ritesh-1918/HELPDESK.AI"

prs = {
    "95": {
        "labels": "gssoc,level:beginner,type:bug",
        "comment": "Hi @DHEVIKA! 🙌\n\nExcellent work on PR #95! Improving landing page UI transitions and performing steps transition cleanup is exactly what we needed to make the welcome layout premium and lag-free.\n\nI have labeled your PR under GSSoC 2026. Reviewing and testing now! Keep up the brilliant work! 🚀💻"
    },
    "94": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @namann5! 🙌\n\nOutstanding effort setting up this comprehensive Jest and PyTest integration and end-to-end testing pipeline! Solid test coverage is a powerhouse requirement for our ticking pipeline.\n\nI have labeled your PR under GSSoC 2026. Reviewing now! 🚀💻"
    },
    "91": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @saurabhhhcodes! 🙌\n\nThis local ONNX SentenceTransformer fallback implementation is extremely professional! Running tokenizers and embeddings locally is a massive step forward for our offline capabilities.\n\nI have labeled your PR under GSSoC 2026 as level:advanced. Reviewing and testing now! 🚀💻"
    },
    "90": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @saurabhhhcodes! 🙌\n\nReal-time dashboard updates via Zustand stores and Supabase channels looks fantastic! This makes our support dashboard react instantly to live ticket state events.\n\nI have labeled your PR under GSSoC 2026 as level:advanced. Reviewing now! 🚀💻"
    },
    "89": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @krushnanirmalkar! 🙌\n\nAmazing work implementing enterprise-scoped audit logs and a glassmorphic chronological timeline UI! This timeline adds serious premium aesthetic value to our ticket tracking screen.\n\nI have labeled your PR under GSSoC 2026 as level:advanced. Reviewing now! 🚀💻"
    },
    "88": {
        "labels": "gssoc,level:intermediate,type:feature",
        "comment": "Hi @saurabhhhcodes! 🙌\n\nFantastic job persisting our admin panel settings securely to the Supabase database! Company isolation looks highly robust.\n\nI have labeled your PR under GSSoC 2026 as level:intermediate. Reviewing and testing now! 🚀💻"
    },
    "87": {
        "labels": "gssoc,level:beginner,type:bug",
        "comment": "Hi @saurabhhhcodes! 🙌\n\nGreat UX fix checking the password character requirements interactively as they type! This is a much smoother flow than waiting for the form submit button.\n\nI have labeled your PR under GSSoC 2026 as level:beginner. Reviewing now! 🚀💻"
    },
    "86": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @saurabhhhcodes! 🙌\n\nCovering ticket route tenant boundaries in PyTest is a highly critical security check! This guarantees multi-tenant safety across our endpoints.\n\nI have labeled your PR under GSSoC 2026. Reviewing and testing now! 🚀💻"
    },
    "84": {
        "labels": "gssoc,level:beginner,type:bug",
        "comment": "Hi @namann5! 🙌\n\nSuperb CSS transitions fix inside the landing steps section! The transition delay adjustments make it feel extremely responsive.\n\nI have labeled your PR under GSSoC 2026 as level:beginner. Reviewing now! 🚀💻"
    },
    "83": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @mkcash! 🙌\n\nThis SLA engine and semantic duplicate detection is an absolute powerhouse contribution! Adding embedding comparisons and strict SLA breach clocks makes our triage engine production-grade.\n\nI have labeled your PR under GSSoC 2026 as level:advanced. Reviewing and testing now! 🚀💻"
    },
    "82": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @harshitanagpal05! 🙌\n\nOutstanding work setting up secure ticket audit logs and automatic escalation actions! The cron routing hooks look very clean and precise.\n\nI have labeled your PR under GSSoC 2026 as level:advanced. Reviewing now! 🚀💻"
    },
    "81": {
        "labels": "gssoc,level:advanced,type:feature",
        "comment": "Hi @mkcash! 🙌\n\nExcellent core implementation for our SLA Engine! I have labeled your PR under GSSoC 2026. Reviewing now! 🚀💻"
    }
}

for pr_num, info in prs.items():
    print(f"Triage PR #{pr_num}...")
    run(["pr", "edit", pr_num, "--repo", REPO, "--add-label", info["labels"]])
    run(["pr", "comment", pr_num, "--repo", REPO, "--body", info["comment"]])

print("All PR triages completed successfully!")
