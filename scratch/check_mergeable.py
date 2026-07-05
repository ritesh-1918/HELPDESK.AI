import subprocess
import json
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"
prs = [178, 177, 176, 173, 172, 171, 170, 169]

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, encoding="utf-8")
    return result

def main():
    print("====================================================================")
    print("                CHECKING PR MERGEABILITY STATE                      ")
    print("====================================================================")

    for num in prs:
        res = run_gh(["pr", "view", str(num), "--repo", REPO, "--json", "number,title,mergeable,mergeStateStatus,headRefName"])
        if res.returncode == 0:
            data = json.loads(res.stdout)
            print(f"PR #{num}: Mergeable = {data.get('mergeable')}, State = {data.get('mergeStateStatus')}, Head Branch = {data.get('headRefName')}")
        else:
            print(f"Error checking PR #{num}: {res.stderr.strip()}")

if __name__ == '__main__':
    main()
