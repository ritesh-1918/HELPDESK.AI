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
    print("        REVERTING MERGE COMMIT db41895 ON PROTECTED MAIN BRANCH     ")
    print("====================================================================")

    # 1. Stash current staged/unstaged changes on gssoc
    print("[+] Stashing local changes on gssoc...")
    res = run_cmd(["git", "stash"])
    print(res.stdout or res.stderr)

    # 2. Checkout main branch
    print("\n[+] Checking out main branch...")
    res = run_cmd(["git", "checkout", "main"])
    print(res.stdout or res.stderr)
    if res.returncode != 0:
        print("Checkout failed!")
        return

    # 3. Pull latest origin/main
    print("\n[+] Pulling latest origin/main...")
    res = run_cmd(["git", "pull", "origin", "main"])
    print(res.stdout or res.stderr)

    # 4. Revert the merge commit db41895
    print("\n[+] Reverting merge commit db41895...")
    res = run_cmd(["git", "revert", "-m", "1", "db41895", "--no-edit"])
    print(res.stdout or res.stderr)
    if res.returncode != 0:
        print("Revert failed! Aborting revert...")
        run_cmd(["git", "revert", "--abort"])
        return

    # 5. Push revert commit to origin/main
    print("\n[+] Pushing revert commit to origin/main...")
    res = run_cmd(["git", "push", "origin", "main"])
    print(res.stdout or res.stderr)

    # 6. Checkout gssoc branch
    print("\n[+] Switching back to gssoc branch...")
    res = run_cmd(["git", "checkout", "gssoc"])
    print(res.stdout or res.stderr)

    # 7. Restore stashed changes
    print("\n[+] Restoring stashed changes on gssoc...")
    res = run_cmd(["git", "stash", "pop"])
    print(res.stdout or res.stderr)

    print("\n====================================================================")
    print("        MERGE db41895 REVERTED ON MAIN & GSSOC BRANCH RESTORED      ")
    print("====================================================================")

if __name__ == '__main__':
    main()
