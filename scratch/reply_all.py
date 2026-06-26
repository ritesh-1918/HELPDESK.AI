import subprocess
import json

def comment_on_issue(num, body):
    # Save the body to a temp file first to avoid shell quoting issues
    temp_file = f"scratch/reply_{num}.md"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(body)
    
    print(f"Posting comment on issue {num}...")
    res = subprocess.run(f'gh issue comment {num} --body-file "{temp_file}"', shell=True, capture_output=True, text=True, encoding="utf-8")
    if res.returncode == 0:
        print(f"Success for issue {num}!")
    else:
        print(f"Error for issue {num}: {res.stderr}")

comments_map = {
    106: """Hey @Hobie1Kenobi! 🙌 Since you were the first to request this issue and laid out a fantastic approach, I have officially assigned this documentation bounty to you! 🚀

For @SarthakKharche, thank you so much for your interest in contributing! Since Hobie claimed this one first, please stay tuned for new issues coming up soon, or feel free to check out other open bounties in the repository! 🌟

@Hobie1Kenobi, please make sure your PR targets the `gssoc` branch. Looking forward to your high-quality contribution! Let's go! 💻🔥

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and stay connected with me for future opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)""",

    107: """Hey @Hobie1Kenobi! 🙌 Since you were the first to comment and request this design enhancement, I have officially assigned this landing page transition bounty to you! 🚀

For @SarthakKharche and @priyanshi-coder-2, thank you both so much for your awesome interest in contributing! Since Hobie claimed this design issue first, please follow along, stay tuned for new issues coming up shortly, or check out other open bounties in the repo! 🌟

@Hobie1Kenobi, please target the `gssoc` branch when you raise your PR. Looking forward to seeing those beautiful premium animations! Let's go! 💻🔥

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and stay connected with me for future opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)""",

    108: """Hey @SarthakKharche! 🙌 Since you were the first to comment and request this issue, I have officially assigned this automated Slack notification trigger bounty to you! 🚀

For @saij3b, thank you so much for your interest and for launching an attempt! Since Sarthak claimed this one first, please stay tuned for new issues coming up very soon, or feel free to collaborate and explore other open bounties in the repo! 🌟

@SarthakKharche, please make sure your PR targets the `gssoc` branch. Excited to see this webhook notification service in action! Let's go! 💻🔥

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and stay connected with me for future opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)""",

    109: """Hey @saij3b! 🙌 Since you were the first to initiate an attempt on this issue, I have officially assigned this Python semantic duplicate integration testing bounty to you! 🚀

For @anishachoudhary5 and @priyanshi-coder-2, thank you both so much for your interest and highly detailed proposals! Since saij3b claimed this testing issue first, please follow along, stay tuned for new issues, or feel free to check out other open bounties in the repo! 🌟

@saij3b, please ensure your integration tests target the `gssoc` branch. Looking forward to some solid pytest coverage! Let's go! 💻🔥

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and stay connected with me for future opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)""",

    110: """Hey @SarthakKharche! 🙌 Since you were the first to request this advanced AI multi-language translation bounty, I have officially assigned it to you! 🚀

For @priyanshi-coder-2 and @Hobie1Kenobi, thank you both so much for your awesome interest and extremely structured translation proposals! Since Sarthak claimed this first, please stay tuned for new issues coming up soon, or feel free to check out other open bounties in the repo! 🌟

@SarthakKharche, please make sure your PR targets the `gssoc` branch. Excited to see our edge-AI translation system live! Let's go! 💻🔥

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and stay connected with me for future opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)""",

    111: """Hey @SarthakKharche! 🙌 Since you were the first to request this security migration issue, I have officially assigned this Supabase Row-Level Security (RLS) bounty to you! 🚀

For @saij3b, @anishachoudhary5, and @Hobie1Kenobi, thank you so much for your interest and structured migration proposals! Since Sarthak claimed this security issue first, please follow along, stay tuned for new issues, or feel free to check out other open bounties in the repo! 🌟

@SarthakKharche, please target the `gssoc` branch when you write your migration scripts. Looking forward to a bulletproof security layer! Let's go! 💻🔥

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and stay connected with me for future opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)"""
}

for num, body in comments_map.items():
    comment_on_issue(num, body)
