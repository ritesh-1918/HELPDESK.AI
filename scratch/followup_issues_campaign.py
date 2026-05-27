import subprocess

def post_comment(num, author):
    body = f"""Hey @{author}! 🙌 Quick follow-up here on behalf of the HelpDesk.AI team. First of all, thank you again for your incredible contribution and effort in resolving this issue! It has been successfully closed and is running beautifully in our production-grade product!

If you want to continue supporting the project and stay connected with me for future engineering opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)

Thanks again for being an awesome member of our developer community! Let's keep building! 🚀💻"""

    temp_file = f"scratch/followup_issue_{num}.md"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(body)
    
    print(f"Posting follow-up comment on Issue {num} for @{author}...")
    res = subprocess.run(f'gh issue comment {num} --body-file "{temp_file}"', shell=True, capture_output=True, text=True, encoding="utf-8")
    
    if res.returncode == 0:
        print(f"Success for Issue {num}!")
    else:
        print(f"Error for Issue {num}: {res.stderr}")

followups = [
    (28, "namann5"),
    (30, "saurabhhhcodes"),
    (39, "saurabhhhcodes"),
    (69, "namann5"),
    (71, "saurabhhhcodes"),
    (72, "harshitanagpal05"),
    (73, "saurabhhhcodes"),
    (74, "mkcash"),
    (75, "mkcash"),
    (96, "harshitanagpal05")
]

for num, author in followups:
    post_comment(num, author)
print("All issue follow-up support requests posted successfully!")
