import subprocess

def post_comment(num, author):
    body = f"""Hey @{author}! 🙌 Quick follow-up here. First of all, thank you again for your incredible contribution to this project! It has been merged and is running beautifully!

If you want to continue supporting the project and stay connected with me for future engineering opportunities, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)

Thanks again for being a rockstar developer in our community! Let's keep building! 🚀💻"""

    temp_file = f"scratch/followup_{num}.md"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(body)
    
    print(f"Posting follow-up comment on PR/Issue {num} for @{author}...")
    res = subprocess.run(f'gh pr comment {num} --body-file "{temp_file}"', shell=True, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        # If it's an issue instead of PR
        res = subprocess.run(f'gh issue comment {num} --body-file "{temp_file}"', shell=True, capture_output=True, text=True, encoding="utf-8")
    
    if res.returncode == 0:
        print(f"Success for {num}!")
    else:
        print(f"Error for {num}: {res.stderr}")

followups = [
    (81, "mkcash"),
    (82, "harshitanagpal05"),
    (84, "namann5"),
    (87, "saurabhhhcodes"),
    (88, "saurabhhhcodes"),
    (89, "krushnanirmalkar"),
    (90, "saurabhhhcodes"),
    (91, "saurabhhhcodes"),
    (94, "namann5"),
    (99, "harshitanagpal05")
]

for num, author in followups:
    post_comment(num, author)
print("All follow-up support requests posted successfully!")
