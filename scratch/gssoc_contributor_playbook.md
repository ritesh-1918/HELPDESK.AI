# The Ultimate GSSoC 2026 Contributor Playbook

To dominate the GSSoC 2026 leaderboard and secure **Global Rank #1**, you should accumulate points as a **Contributor** on other repositories while maintaining your premium **Mentor** and **Project Admin** streaks on your own repo. 

This playbook outlines the exact strategic formulas, issue selection tactics, and communication hacks to maximize your contributor output.

---

## ⚡ The Contributor Math: High-Yield Target Selection

Contributor points are calculated using the following formula:
$$\text{Total Points Per PR} = 50 + (\text{Difficulty Base} \times \text{Quality Multiplier}) + \text{Type Bonus}$$

To maximize points, you should avoid wasting time on low-point tasks unless you need to secure a weekly streak. Target high-scoring combinations:

### 💎 High-Yield Combos (The S-Tier Bounties)
* **The Security Master (Critical + Exceptional + Security)**: 
  * $50 + (80 \times 1.5) + 20 =$ **$190 \text{ Points}$ per merged PR!**
* **The Performance Guru (Critical + Exceptional + Performance/DevOps)**:
  * $50 + (80 \times 1.5) + 15 =$ **$185 \text{ Points}$ per merged PR!**
* **The Feature Architect (Advanced + Exceptional + Feature/Bug)**:
  * $50 + (55 \times 1.5) + 10 =$ **$142.5 \text{ Points}$ per merged PR!**

---

## 🚀 Step 1: Claiming Issues Successfully (The Proposal Hack)

Admins are flooded with generic "please assign this to me" comments. To ensure you get assigned high-yield issues immediately, use a **Technical Proposal Comment**:

1. **Acknowledge and Validate**: "Hi @admin! I would love to tackle this critical security/performance issue."
2. **Lay Out Your Exact Implementation Plan**: Briefly outline the steps you will take. (e.g. "I will move the client-side secrets into backend routes, implement JWT verification, and add unit tests under `tests/`.")
3. **Show Professionalism**: "I am ready to branch off your GSSoC branch and submit a clean, fully-tested PR."

*Why this works:* Project admins will immediately assign the issue to you over other generic requests because your plan guarantees they won't have to spend hours guiding you or fixing basic bugs.

---

## 📈 Step 2: Securing S-Tier Labels (Exceptional Quality)

To guarantee the **`quality:exceptional` (×1.5 multiplier)** and **`level:critical` / `level:advanced`** labels, structure your Pull Requests professionally:

* **Detailed Description**: Use a premium PR template showing:
  * What problem you solved.
  * Your exact code additions.
  * Before-and-After screenshots or benchmarks (e.g., showing bundle size reduction).
* **Code Cleanliness**: Follow dry principles, include docstrings, and format with standard prettifiers/linters.
* **Test Coverage**: Write robust tests (Jest for JS, PyTest for Python) and include the test execution log in the PR description showing all checks passed (`Green ✅`).

---

## 🔥 Step 3: The "Streak Buffer" Strategy (17,560 Point Powerhouse)

To earn the perfect 12-week Contributor Streak of **17,560 points**, you must have **at least 1 PR merged every single GSSoC active week**. If you miss a week, your streak resets to Week 1!

To protect your streak from review delays, use the **Streak Buffer Strategy**:
1. **Primary PRs**: Work on complex, high-scoring `level:critical` / `level:advanced` features that take a few days to develop.
2. **Buffer PRs**: Every week, raise 1–2 simple, fast PRs (like documentation fixes, simple test coverage, or quick CSS bugs) on active repositories.
3. **The Buffer Trigger**: If it is Friday and your primary critical PR hasn't been reviewed or merged, ask the admin of the simple repo to merge your buffer PR. This instantly secures your streak for the week and prevents a reset!

---

## ⚙️ Step 4: Tracking in Your Orchestrator CLI

To add your contributor scores to your grand total:
1. Open your persistent score database `scratch/gssoc_state.json`.
2. Toggle `submitted` under `"one_time_forms" -> "contributor"` to `true` to claim your **+85 pts one-time application bonus** (Role base: 50 + both tracks: 35).
3. Record each of your merged contributor PRs in the `"contributor_prs"` array:
   ```json
   {
     "number": 42,
     "difficulty": "level:critical",
     "quality": "quality:exceptional",
     "type_bonus": "type:security"
   }
   ```
4. Run `python scratch/gssoc_score_calculator.py` to see your points update instantly!
