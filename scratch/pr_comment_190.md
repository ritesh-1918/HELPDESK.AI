Hi @saurabhhhcodes! :raised_hands:

Thank you for this clean fix on the Slack payload fallbacks! Normalizing missing `company`/`company_id` to `UNKNOWN` instead of `NONE` is the right approach and keeps our Slack notifications readable.

**Review Notes:**
- The payload shape and priority coloring remain unchanged — great care taken here.
- The `UNKNOWN` sentinel makes it immediately obvious in Slack that a field was missing, rather than silently passing `None`.
- Local smoke-check validation looks solid.

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

*Note: Ensure your PR targets the `gssoc` branch (not `main`). Great work — keep it up!* :rocket::computer:
