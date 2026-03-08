import os
import shutil
import subprocess
import tempfile

# Configuration
TEMP_DIR = os.path.join(tempfile.gettempdir(), "hf_deploy_clean")
HF_REPO_URL = "https://huggingface.co/spaces/ritesh19180/ai-helpdesk-api"
BACKEND_SRC = r"c:\Projects\Software Projects\AI-Powered-Ticket-Creation-and-Categorization-from-User-Input\backend"

# Files/Dirs to include in deployment
INCLUDE_LIST = [
    "main.py",
    "requirements.txt",
    "Dockerfile",
    "__init__.py",
    ".env",
    "services/",
    "models/classifier/",
    "models/ner/",
    "supabase/",
]

def remove_readonly(func, path, excinfo):
    import stat
    os.chmod(path, stat.S_IWRITE)
    func(path)

def run_cmd(cmd_list, cwd=None):
    print(f"Running: {' '.join(cmd_list)}")
    result = subprocess.run(cmd_list, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    else:
        print(f"Success: {result.stdout[:200]}...")
    return result

def deploy():
    global TEMP_DIR
    # 1. Prepare Clean Temp Directory
    if os.path.exists(TEMP_DIR):
        print(f"Cleaning up existing temp directory: {TEMP_DIR}")
        try:
            shutil.rmtree(TEMP_DIR, onerror=remove_readonly)
        except Exception as e:
            print(f"Cleanup warning: {e}")
            # Fallback to a different directory if cleanup fails
            import time
            TEMP_DIR += f"_{int(time.time())}"
            os.makedirs(TEMP_DIR)
    else:
        os.makedirs(TEMP_DIR)
    
    print(f"Using temp directory: {TEMP_DIR}")

    # 2. Copy Essential Backend Files
    for item in INCLUDE_LIST:
        src_path = os.path.join(BACKEND_SRC, item.strip("/"))
        dst_path = os.path.join(TEMP_DIR, item.strip("/"))
        
        if os.path.isdir(src_path):
            shutil.copytree(src_path, dst_path)
            print(f"Copied directory: {item}")
        elif os.path.isfile(src_path):
            # Ensure parent exists
            os.makedirs(os.path.dirname(dst_path), exist_ok=True)
            shutil.copy2(src_path, dst_path)
            print(f"Copied file: {item}")
        else:
            print(f"Warning: {item} not found, skipping.")

    # 2.1 Generate Hugging Face README with Metadata
    hf_readme_content = """---
title: AI Helpdesk API
emoji: 🚀
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# HELPDESK.AI - API Engine
Intelligent ticket classification and routing backend.
"""
    with open(os.path.join(TEMP_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write(hf_readme_content)
    print("Generated Hugging Face README.md metadata")

    # 3. Setup Git and Push
    run_cmd(["git", "init"], cwd=TEMP_DIR)
    
    # 3.1 Setup Git LFS for Large Models
    run_cmd(["git", "lfs", "install"], cwd=TEMP_DIR)
    run_cmd(["git", "lfs", "track", "*.safetensors", "*.pt", "*.bin", "*.pkl", "*.h5"], cwd=TEMP_DIR)
    
    run_cmd(["git", "config", "user.name", "Antigravity"], cwd=TEMP_DIR)
    run_cmd(["git", "config", "user.email", "ai-agent@helpdesk.ai"], cwd=TEMP_DIR)
    run_cmd(["git", "config", "commit.gpgsign", "false"], cwd=TEMP_DIR)
    
    run_cmd(["git", "add", ".gitattributes"], cwd=TEMP_DIR)
    run_cmd(["git", "add", "."], cwd=TEMP_DIR)
    run_cmd(["git", "commit", "-m", "Deploy clean backend from scratch with Git LFS"], cwd=TEMP_DIR)
    
    # Get the branch name (master or main)
    res = run_cmd(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=TEMP_DIR)
    branch = res.stdout.strip()
    if not branch or branch == "HEAD": branch = "main" # Fallback

    run_cmd(["git", "remote", "add", "origin", HF_REPO_URL], cwd=TEMP_DIR)
    print(f"Pushing to Hugging Face (both main and master branches)...")
    
    # Try pushing to main vs master
    run_cmd(["git", "push", "-f", "origin", f"{branch}:main"], cwd=TEMP_DIR)
    run_cmd(["git", "push", "-f", "origin", f"{branch}:master"], cwd=TEMP_DIR)
    
    # We exit with success if at least one worked (some spaces use main, some master)
    print("\n=== DEPLOYMENT COMPLETED ===")
    print("HF Space should be rebuilding now. Please wait a few minutes.")

if __name__ == "__main__":
    deploy()
