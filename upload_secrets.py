import os
import sys
from huggingface_hub import HfApi

def add_secrets():
    print("Adding secrets to Hugging Face...")
    api = HfApi()
    
    try:
        user_info = api.whoami()
        hf_username = user_info['name']
        print(f"Authenticated as: {hf_username}")
    except Exception as e:
        print(f"Could not authenticate with Hugging Face: {e}")
        return

    repo_id = f"{hf_username}/ai-helpdesk-api"

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

    try:
        print(f"Adding secrets to: {repo_id}...")
        for key, value in secrets.items():
            api.add_space_secret(repo_id=repo_id, key=key, value=value)
            print(f"Added secret: {key}")
        
        print("\nAll secrets added successfully!")
        
    except Exception as e:
        print(f"\nError adding secrets: {e}")

if __name__ == "__main__":
    add_secrets()
