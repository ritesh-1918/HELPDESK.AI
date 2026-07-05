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
    print("                ANALYZING 8 OPEN PULL REQUESTS                      ")
    print("====================================================================")

    for num in prs:
        print(f"\n==================== PR #{num} ====================")
        res = run_gh(["pr", "view", str(num), "--repo", REPO, "--json", "number,title,author,body,files"])
        if res.returncode != 0:
            print(f"Error fetching PR #{num}: {res.stderr}")
            continue
            
        try:
            data = json.loads(res.stdout)
            print(f"Title: {data.get('title')}")
            print(f"Author: @{data.get('author', {}).get('login')}")
            print(f"Body: {data.get('body')[:500]}...")
            files = [f.get('path') for f in data.get('files', [])]
            print(f"Files Changed ({len(files)}): {files}")
            
            # Let's get the diff of the first few files to see implementation details
            diff_res = run_gh(["pr", "diff", str(num), "--repo", REPO])
            if diff_res.returncode == 0:
                print("Diff snippet:")
                # print first 800 chars of diff
                print(diff_res.stdout[:2000])
                if len(diff_res.stdout) > 2000:
                    print("... [TRUNCATED DIFF]")
            else:
                print(f"Could not get diff: {diff_res.stderr}")
        except Exception as e:
            print(f"Exception parsing JSON for PR #{num}: {e}")

if __name__ == '__main__':
    main()
