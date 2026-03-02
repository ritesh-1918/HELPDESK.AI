import os
import sys
from huggingface_hub import HfApi, create_repo

def deploy_to_hf():
    print("Automating Hugging Face Deployment...")
    api = HfApi()
    
    try:
        user_info = api.whoami()
        hf_username = user_info['name']
        print(f"Authenticated as: {hf_username}")
    except Exception as e:
        print(f"Could not authenticate with Hugging Face: {e}")
        return

    space_name = "ai-helpdesk-api"
    repo_id = f"{hf_username}/{space_name}"

    # 1. Delete the existing space to clear the 1GB storage limit
    print(f"Cleaning up old Space: {repo_id}...")
    try:
        api.delete_repo(repo_id=repo_id, repo_type="space")
        print("Successfully deleted old Space history!")
    except Exception:
        print("No existing space found, skipping deletion.")

    # 2. Recreate the fresh space
    try:
        print(f"Creating fresh Docker Space: {repo_id}...")
        create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            private=False
        )
        print("Fresh Space created successfully!")

        # 3. Add Secrets
        print("Adding secrets to the Space...")
        secrets = {
            "VITE_GEMINI_API_KEY_1": "YOUR_KEY_HERE",
            "VITE_GEMINI_API_KEY_2": "YOUR_KEY_HERE",
            "VITE_GEMINI_API_KEY_3": "YOUR_KEY_HERE",
            "VITE_GEMINI_API_KEY_4": "YOUR_KEY_HERE",
            "VITE_OPENROUTER_API_KEY_1": "YOUR_KEY_HERE",
            "VITE_OPENROUTER_API_KEY_2": "YOUR_KEY_HERE",
            "VITE_OPENROUTER_API_KEY_3": "YOUR_KEY_HERE",
            "VITE_OPENROUTER_API_KEY_4": "YOUR_KEY_HERE",
            "VITE_GROQ_API_KEY_1": "YOUR_KEY_HERE",
            "VITE_GROQ_API_KEY_2": "YOUR_KEY_HERE",
            "VITE_GROQ_API_KEY_3": "YOUR_KEY_HERE",
            "VITE_SUPABASE_URL": "YOUR_URL_HERE",
            "VITE_SUPABASE_ANON_KEY": "YOUR_KEY_HERE",
            "VITE_BACKEND_URL": "https://ritesh19180-ai-helpdesk-api.hf.space"
        }
        for key, value in secrets.items():
            api.add_space_secret(repo_id=repo_id, key=key, value=value)
        print("All secrets added successfully!")

        # 4. Upload backend code
        print("Uploading backend code to Hugging Face... (This might take a minute)")
        api.upload_folder(
            folder_path="backend",
            repo_id=repo_id,
            repo_type="space",
            commit_message="Automated deployment of AI Backend",
            ignore_patterns=["venv/*", ".venv/*", "env/*", "__pycache__/*", "*.pyc", ".env", ".git/*"]
        )
        print("Upload complete!")
        print(f"Your backend is now building at: https://huggingface.co/spaces/{repo_id}")
        
    except Exception as e:
        print(f"\nError deploying to Hugging Face: {e}")
        print("Please ensure you are logged in via 'huggingface-cli login' or have a valid token.")

if __name__ == "__main__":
    deploy_to_hf()
