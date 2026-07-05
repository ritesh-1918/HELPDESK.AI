Hi @harshitanagpal05! :raised_hands:

Thank you for your interest in contributing to **HELPDESK.AI** under GSSoC 2026! :rocket:

I have officially assigned you to this issue! The `analyze_image()` signature mismatch is a critical backend bug — fixing it will directly unblock image-upload functionality for all users.

### Technical Implementation Steps:
1. **Identify the signature**: Check `backend/services/gemini_service.py` — the `analyze_image()` method signature and update all call sites in `main.py` to match.
2. **Add `context_text` support**: The method should accept optional `context_text` to improve image analysis quality.
3. **Write a test**: Add a unit test that mocks `gemini_service.analyze_image()` and confirms the call signature is correct.
4. **Branch Rule**: Ensure all your commits target the `gssoc` branch, **NOT** `main`.

Here is the onboarding process to get dashboard and testing access:

1. **Go to the Deployed Website (not local)**: https://helpdeskaiv1.vercel.app/
2. **Sign In**: Click on the **Sign In** option.
3. **Create Account**: Click on **Create Account**.
4. **Select Company**: Select **Ritesh Private Limited Company** as your organization.
5. **Verify and Reach Out**: After verifying your email, reach out at `bonthalamadhavi1@gmail.com` or right here in this issue.
6. **Access Approved**: Ritesh will add your username to the system.

### :star: Project Support and Networking Campaign
1. **Star this repository**: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. **Reach out via Email**: `bonthalamadhavi1@gmail.com`

Looking forward to your contribution! Happy coding! :rocket::computer:
