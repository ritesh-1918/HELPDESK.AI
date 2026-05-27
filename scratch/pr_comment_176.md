Hi @saurabhhhcodes! :raised_hands:

Thank you for the degraded backend import fix! This is an important CI/CD reliability improvement — keeping the FastAPI app importable even when optional ML dependencies are missing prevents our smoke tests from failing on clean environments.

**Review Notes:**
- The `ALLOW_DEGRADED_STARTUP` flag approach is a clean solution that doesn't compromise production behavior.
- Guarding heavy imports with try/except and graceful fallbacks is exactly the right pattern for optional ML services.
- CI smoke tests will now pass reliably without requiring full GPU/ML model downloads.

This PR is **approved and under review** by the maintainer team. :white_check_mark:

Please complete the onboarding steps below to get dashboard access and full contributor status:

1. **Go to the Deployed Website (not local)**: https://helpdeskaiv1.vercel.app/
2. **Sign In**: Click on the **Sign In** option.
3. **Create Account**: Click on **Create Account**.
4. **Select Company**: Select **Ritesh Private Limited Company** as your organization.
5. **Verify and Reach Out**: After verifying your email, reach out at `bonthalamadhavi1@gmail.com` or right here.
6. **Access Approved**: Ritesh will add your username to the system so you can test the application.

### :star: Project Support and Networking Campaign
1. **Star this repository**: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)
5. **Reach out via Email**: `bonthalamadhavi1@gmail.com`

*Note: Ensure your PR targets the `gssoc` branch (not `main`). Great work!* :rocket::computer:
