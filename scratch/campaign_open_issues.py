import subprocess

def post_comment(num, tags):
    tag_str = " ".join([f"@{t}" for t in tags])
    body = f"""Hi {tag_str}! 🙌 

If you are contributing, reviewing, or following along with this active issue under GSSoC 2026, please take a quick moment to support the project and connect with the core team! 📄✨

Please take 30 seconds to:
1. ⭐ **Star this repository** to help our AI helpdesk get noticed: [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository** to save your working copy: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub** to stay updated on our live projects: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn** to build a strong engineering network: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)

Thank you all for being part of this awesome GSSoC journey! Let's keep coding and crushing it! 🚀💻"""

    temp_file = f"scratch/open_issue_campaign_{num}.md"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(body)
    
    print(f"Posting support campaign on Issue {num} tagging {tag_str}...")
    res = subprocess.run(f'gh issue comment {num} --body-file "{temp_file}"', shell=True, capture_output=True, text=True, encoding="utf-8")
    
    if res.returncode == 0:
        print(f"Success for Issue {num}!")
    else:
        print(f"Error for Issue {num}: {res.stderr}")

open_issues_campaign = [
    (85, ["YashKrTripathi", "sumedhag28", "krushnanirmalkar"]),
    (97, ["rutul2006", "rishab11250"]),
    (106, ["Hobie1Kenobi", "SarthakKharche"]),
    (107, ["Hobie1Kenobi", "SarthakKharche", "priyanshi-coder-2"]),
    (108, ["SarthakKharche", "saij3b"]),
    (109, ["saij3b", "anishachoudhary5", "priyanshi-coder-2"]),
    (110, ["SarthakKharche", "priyanshi-coder-2", "Hobie1Kenobi"]),
    (111, ["SarthakKharche", "saij3b", "anishachoudhary5", "Hobie1Kenobi"])
]

for num, tags in open_issues_campaign:
    post_comment(num, tags)
print("All open issue support campaigns posted successfully!")
