import subprocess

REPO = "ritesh-1918/HELPDESK.AI"

prs = {
    "220": {
        "author": "Daksh7785",
        "comment": "Hi @Daksh7785! 🙌 Thank you so much for this Prettier & Markdown Linter PR! It looks incredibly useful.\n\nSince we have recently merged several large layout and documentation pages into the `gssoc` branch, your PR now has merge conflicts. \n\nCould you please **rebase your branch against the latest `gssoc` branch** and resolve the conflicts? Once the conflicts are cleared, we will merge this immediately! 🚀💻"
    },
    "219": {
        "author": "Daksh7785",
        "comment": "Hi @Daksh7785! 🙌 Great job adding this path-aware Back to Top button! \n\nSince several pages were just squashed and merged into the `gssoc` branch, your PR has encountered merge conflicts. \n\nCould you please **rebase your branch against the `gssoc` branch** to resolve these conflicts? Once resolved and green, we will merge this right away! 🚀🔥"
    },
    "204": {
        "author": "pragya0129",
        "comment": "Hi @pragya0129! 🙌 Thank you so much for creating this custom green scrollbar aesthetic! It fits our premium design guidelines beautifully.\n\nYour PR currently has merge conflicts due to recent UI merges into the `gssoc` branch. \n\nCould you please **rebase your branch against the latest `gssoc` branch** and push the updates? Once the conflicts are cleared, we will squash-merge this immediately! 🚀💻"
    }
}

for pr_num, info in prs.items():
    print(f"Commenting on PR #{pr_num}...")
    body = f"{info['comment']}\n\n---\n\n### 🌟 Project Support & Developer Network\n1. ⭐ **Star this repository**: https://github.com/ritesh-1918/HELPDESK.AI\n2. 👤 **Follow @ritesh-1918 on GitHub**: https://github.com/ritesh-1918"
    subprocess.run(["gh", "pr", "review", pr_num, "--repo", REPO, "--comment", "--body", body])
