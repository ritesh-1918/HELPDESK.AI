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
        print(f"Successfully ran command.")
    return result

REPO = "ritesh-1918/HELPDESK.AI"

# 1. Issue 96
run(["issue", "edit", "96", "--repo", REPO, "--add-assignee", "harshitanagpal05", "--add-label", "gssoc,level:intermediate,type:bug,type:security"])
c96 = """Hi @harshitanagpal05! 🙌

Thank you for bringing this up! 🔒 Exposing AI provider API keys in the frontend bundle via `VITE_*` variables is indeed a critical security issue, and we are absolutely thrilled to have you work on resolving this!

### 🚀 Contributor Onboarding Guide
If you haven't already, please follow these onboarding steps to access and test the dashboard:
1. **Create an Account**: Go to the sign-up page on your local build (usually `http://localhost:5173/signup`) or our deployed link.
2. **Select the Company**: During sign-up, you **MUST** select **Ritesh Private Limited** as the company.
3. **Verify Your Email**: Complete the email verification step first.
4. **Request Access**: Reply here on this GitHub issue thread with the email address you used to sign up. I will manually approve your profile in the database!
5. **Log In**: Once approved, you can log in to test and reproduce the issue.

---

### 🛠️ Technical Implementation Steps:
1. **Remove Front-End Secrets**: Remove `VITE_OPENAI_API_KEY`, `VITE_GEMINI_API_KEY`, etc. from the client-side `.env` and avoid using them in the frontend code.
2. **Backend Gateway**: Route all AI processing requests through backend endpoints (like `/ai/analyze`) where the API keys are kept secure and never exposed to the client.
3. **Branch Rule**: Ensure all your commits target the `gssoc` branch, NOT `main`.

---

### 🌟 Project Support & Networking Campaign
If you haven't already, please take a moment to support the project and connect:
1. ⭐ **Star this repository**: Helps the project get discovered! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Create your own working copy! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong network of like-minded devs! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. ✉️ **Reach out via Email**: Contact me at **bonthalamadhavi1@gmail.com** for collaborations.

Looking forward to your PR! Happy coding! 🚀💻
"""
run(["issue", "comment", "96", "--repo", REPO, "--body", c96])

# 2. Issue 85
run(["issue", "edit", "85", "--repo", REPO, "--add-label", "gssoc,level:beginner,documentation"])
c85 = """Hi @YashKrTripathi! 🙌

Thank you for your interest and the extremely structured proposal! 📄 Adding a comprehensive Local Setup and Schema Verification Guide is a much-needed documentation enhancement to help onboarding contributors.

I have officially assigned you to this issue! 🚀

### 🛠️ Technical Implementation Steps:
1. **Backend Environment Setup**: Document virtual environment creation (`python -m venv venv` and activation) and dependency installs in a clean, step-by-step manner.
2. **Database Migration Steps**: Provide clear steps to configure Supabase locally and outline schema updates (e.g. for auto-close loop and company settings).
3. **Environment Reference**: Map environment variables (`ALLOW_DEGRADED_STARTUP`, etc.) in a table.
4. **Troubleshooting Guide**: Compile common startup and permission issues with clear fixes.
5. **Branch Rule**: Ensure all your commits target the `gssoc` branch, NOT `main`.

---

### 🌟 Project Support & Networking Campaign
If you haven't already, please take a moment to support the project and connect:
1. ⭐ **Star this repository**: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. ✉️ **Reach out via Email**: Contact me at **bonthalamadhavi1@gmail.com** for collaborations.

Looking forward to your contribution! Happy coding! 🚀💻
"""
run(["issue", "comment", "85", "--repo", REPO, "--body", c85])

# 3. Issue 69
run(["issue", "edit", "69", "--repo", REPO, "--add-assignee", "varshini-nandula", "--add-assignee", "namann5", "--add-assignee", "saurabhhhcodes", "--add-label", "gssoc,level:advanced,type:feature"])
c69 = """Hi @varshini-nandula, @namann5, and @saurabhhhcodes! 🙌

This issue is active and open for parallel contributions! Since multiple contributors are highly eager to implement these PyTest & Jest E2E test pipelines, we are encouraging you all to work on it in parallel! Whoever delivers a clean, correct, and fully validated testing pipeline first will be merged! 🏆

### 🛠️ Technical Implementation Steps:
1. **PyTest Backend Tests**: Write integration tests under `backend/tests/` verifying routes, tenant boundaries, and AI endpoint mocks.
2. **Jest Frontend Tests**: Implement component unit tests inside `Frontend/src/__tests__/`.
3. **CI/CD Integration**: Add a GitHub Action workflow in `.github/workflows/` to run tests on every PR targeting `gssoc`.
4. **Branch Rule**: Make sure all Pull Requests target the `gssoc` branch!

---

### 🌟 Project Support & Networking Campaign
If you haven't already, please support the project and connect:
1. ⭐ **Star this repository**: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. ✉️ **Reach out via Email**: Contact me at **bonthalamadhavi1@gmail.com** for collaborations.

Good luck to everyone! Happy coding! 🚀💻
"""
run(["issue", "comment", "69", "--repo", REPO, "--body", c69])

# 4. Issue 39
run(["issue", "edit", "39", "--repo", REPO, "--add-assignee", "Jiya3177", "--add-assignee", "Deniwn22", "--add-assignee", "saurabhhhcodes", "--add-label", "gssoc,level:intermediate,type:feature"])
c39 = """Hi @Jiya3177, @Deniwn22, and @saurabhhhcodes! 🙌

This issue is active and open for parallel contributions! Since multiple contributors are highly eager to implement this admin settings database persistence, you are encouraged to work on it in parallel. We will merge the first PR that implements correct, company-isolated database persistence in Supabase targeting `gssoc`!

### 🛠️ Technical Implementation Steps:
1. **Supabase Table**: Create a `system_settings` table to store SLA configs, AI confidence threshold, etc., mapped to `company_id`.
2. **Zustand & DB Synchronization**: Fetch the settings on mount and trigger Supabase updates when saving configurations in `AdminSettings.jsx`.
3. **Branch Rule**: Ensure your PR targets `gssoc` branch!

---

### 🌟 Project Support & Networking Campaign
1. ⭐ **Star this repository**: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. ✉️ **Reach out via Email**: Contact me at **bonthalamadhavi1@gmail.com** for collaborations.

Looking forward to your PRs! Happy coding! 🚀💻
"""
run(["issue", "comment", "39", "--repo", REPO, "--body", c39])

# 5. Issue 30
run(["issue", "edit", "30", "--repo", REPO, "--add-assignee", "saurabhhhcodes", "--add-label", "gssoc,level:beginner,type:bug"])
c30 = """Hi @saurabhhhcodes! 🙌

I have officially assigned this issue to you. Excellent catch on the password validation! We want the character warning to show instantly as they type rather than waiting for the form submit trigger.

---

### 🌟 Project Support & Networking Campaign
1. ⭐ **Star this repository**: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. ✉️ **Reach out via Email**: Contact me at **bonthalamadhavi1@gmail.com** for collaborations.

Let's get this fixed! 🚀💻
"""
run(["issue", "comment", "30", "--repo", REPO, "--body", c30])

# 6. Issue 28
run(["issue", "edit", "28", "--repo", REPO, "--add-assignee", "DHEVIKA", "--add-assignee", "namann5", "--add-label", "gssoc,level:beginner,type:bug"])
c28 = """Hi @DHEVIKA and @namann5! 🙌

This issue is active and open for parallel contributions! Since there is a lot of excitement around fixing the landing page transitions lag and font audits, we want you to work in parallel. The first PR with clean, performant CSS/Framer Motion optimizations targeting `gssoc` will be merged!

---

### 🌟 Project Support & Networking Campaign
1. ⭐ **Star this repository**: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. ✉️ **Reach out via Email**: Contact me at **bonthalamadhavi1@gmail.com** for collaborations.

Let's make this UI ultra-smooth! 🚀💻
"""
run(["issue", "comment", "28", "--repo", REPO, "--body", c28])

print("Triage script executed successfully!")
