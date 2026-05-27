import subprocess
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def run_cmd(args):
    result = subprocess.run(args, capture_output=True, text=True, encoding="utf-8")
    return result

def main():
    print("====================================================================")
    print("        LOCAL BULLETPROOF MERGE SWEAP OF GSSoC PRs                   ")
    print("====================================================================")

    # List of PRs to fetch and merge
    # Format: (PR_NUMBER, DESCRIPTION, AUTHOR_BRANCH_NAME)
    prs_to_merge = [
        (169, "Prometheus metrics dashboard", "saij3b/bounty/168-bounty-level-advanced-set-up-prometheus"),
        (173, "PII Field Encryption", "namann5/feature/transparent-pii-encryption"),
        (178, "WebSocket heartbeat reconnect", "rishab11250/fix/issue-167-websocket-heartbeat")
    ]

    for num, desc, branch_info in prs_to_merge:
        print(f"\n[+] Fetching and Merging PR #{num} ({desc})...")
        # Fetch PR head using pull/[num]/head
        res1 = run_cmd(["git", "fetch", "origin", f"pull/{num}/head"])
        if res1.returncode != 0:
            print(f"  [ERROR] Fetch failed: {res1.stderr.strip()}")
            return
            
        # Merge FETCH_HEAD
        res2 = run_cmd(["git", "merge", "FETCH_HEAD", "-m", f"Merge pull request #{num} from {branch_info}"])
        print(res2.stdout)
        if res2.returncode != 0:
            print(f"  [ERROR] Merge failed: {res2.stderr.strip()}")
            return
        print(f"  [OK] PR #{num} merged successfully!")

    print("\n====================================================================")
    print("        ALL 3 MERGEABLE PRs MERGED LOCALLY CLEANLY!                 ")
    print("====================================================================")

if __name__ == '__main__':
    main()
