import os
import sys
import json
from pathlib import Path

# Reconfigure stdout to use UTF-8 to prevent encoding errors on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Setup terminal styling (ANSI color codes)
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    BG_DARK = '\033[48;5;234m'
    MUTED = '\033[90m'

def print_banner():
    banner = f"""
{Colors.BLUE}{Colors.BOLD}+-------------------------------------------------------------------+
|   * GSSoC 2026 NEURAL SCORE & STREAK ORCHESTRATOR *               |
|   Maximizing Leaderboard Points for Ritesh (@ritesh-1918)         |
+-------------------------------------------------------------------+{Colors.ENDC}
"""
    print(banner)

# Base project paths
BASE_DIR = Path(__file__).resolve().parents[1]
STATE_FILE = BASE_DIR / "scratch" / "gssoc_state.json"

# Reference Streak Tables
STREAK_TABLES = {
    "contributor": [0, 400, 600, 840, 1120, 1400, 1720, 2000, 2200, 2320, 2400, 2440, 2500],
    "mentor": [0, 600, 900, 1240, 1640, 2080, 2560, 3000, 3280, 3480, 3600, 3680, 3800],
    "project_admin": [0, 800, 1200, 1640, 2160, 2720, 3320, 3880, 4240, 4480, 4640, 4760, 4900],
    "ambassador": [0, 300, 440, 600, 800, 1000, 1240, 1440, 1600, 1720, 1840, 1920, 2000]
}

# Formula Constants
DIFFICULTY_PTS = {
    "level:beginner": 20,
    "level:intermediate": 35,
    "level:advanced": 55,
    "level:critical": 80
}

QUALITY_MULT = {
    "none": 1.0,
    "quality:clean": 1.2,
    "quality:exceptional": 1.5
}

TYPE_BONUSES = {
    "type:docs": 5,
    "type:testing": 10,
    "type:accessibility": 15,
    "type:performance": 15,
    "type:security": 20,
    "type:design": 10,
    "type:refactor": 10,
    "type:devops": 15,
    "type:bug": 10,
    "type:feature": 10
}

MENTOR_BASE_PTS = {
    "none": 30,  # Fallback approved PR
    "level:beginner": 10,
    "level:intermediate": 20,
    "level:advanced": 30,
    "level:critical": 50
}

MENTOR_QUALITY_BONUS = {
    "none": 0,
    "quality:clean": 5,
    "quality:exceptional": 10
}

def load_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    
    # Return default empty state
    return {
        "one_time_forms": {
            "contributor": {
                "submitted": True,
                "role_base": 50,
                "ai_track": True,
                "os_track": True,
                "both_tracks": True
            },
            "mentor": {
                "submitted": True,
                "role_base": 80,
                "years_experience": 3,
                "portfolio_links": True,
                "mentored_before": True,
                "expertise_areas_3plus": True,
                "hours_per_week_10plus": True
            },
            "project_admin": {
                "submitted": True,
                "role_base": 100,
                "has_beginner_issues": True,
                "excellent_readme": True,
                "good_readme": False,
                "expected_contributors_5plus": True,
                "prior_program_experience": True,
                "open_github_issues_count": 14,
                "good_first_issues_count": 5
            }
        },
        "weeks": [],
        "contributor_prs": [],
        "mentor_prs": [],
        "project_admin_actions": {
            "merge_gssoc_pr": 11,
            "label_issue_difficulty_and_type": 12,
            "label_issue_difficulty_only": 4,
            "open_issue_beginner_friendly": 6,
            "open_issue_any": 8,
            "issue_resolution_avg_days": 1.8  # yields +60 pts boost!
        }
    }

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def calculate_streak_points(weeks, track):
    min_actions = {
        "contributor": 1,
        "mentor": 2,
        "project_admin": 2,
        "ambassador": 1
    }
    
    streak = 0
    total_streak_points = 0
    streak_records = []
    
    for i, week in enumerate(weeks):
        week_num = i + 1
        
        # Determine if qualified
        qualified = False
        action_count = 0
        if track == "contributor":
            action_count = week.get("contributor_prs", 0)
        elif track == "mentor":
            action_count = week.get("mentor_reviews", 0)
        elif track == "project_admin":
            action_count = week.get("project_admin_actions", 0)
        elif track == "ambassador":
            action_count = 1 if week.get("ambassador_active", False) else 0
            
        qualified = action_count >= min_actions[track]
        
        if qualified:
            streak += 1
            streak_tier = min(streak, 12)
            pts_earned = STREAK_TABLES[track][streak_tier]
            total_streak_points += pts_earned
            streak_records.append({
                "week": week_num,
                "actions": action_count,
                "qualified": True,
                "streak": streak,
                "points_earned": pts_earned
            })
        else:
            streak = 0
            streak_records.append({
                "week": week_num,
                "actions": action_count,
                "qualified": False,
                "streak": 0,
                "points_earned": 0
            })
            
    return total_streak_points, streak, streak_records

def calculate_contributor_points(state):
    # One-time points
    f = state["one_time_forms"]["contributor"]
    one_time = 0
    if f["submitted"]:
        one_time += f["role_base"]
        if f["both_tracks"]:
            one_time += 35
        else:
            if f["ai_track"]: one_time += 20
            if f["os_track"]: one_time += 10
            
    # Ongoing PR points
    ongoing = 0
    pr_details = []
    for pr in state.get("contributor_prs", []):
        base = 50
        diff = DIFFICULTY_PTS.get(pr["difficulty"], 0)
        mult = QUALITY_MULT.get(pr["quality"], 1.0)
        bonus = TYPE_BONUSES.get(pr["type_bonus"], 0)
        
        pr_score = int(base + (diff * mult) + bonus)
        ongoing += pr_score
        pr_details.append({
            "num": pr["number"],
            "difficulty": pr["difficulty"],
            "quality": pr["quality"],
            "type_bonus": pr["type_bonus"],
            "score": pr_score
        })
        
    return one_time, ongoing, pr_details

def calculate_mentor_points(state):
    # One-time points
    f = state["one_time_forms"]["mentor"]
    one_time = 0
    if f["submitted"]:
        one_time += f["role_base"]
        one_time += f["years_experience"] * 5
        if f["portfolio_links"]: one_time += 20
        if f["mentored_before"]: one_time += 30
        if f["expertise_areas_3plus"]: one_time += 10
        if f["hours_per_week_10plus"]: one_time += 15
        
    # Ongoing Mentor PR reviews points
    ongoing = 0
    review_details = []
    for pr in state.get("mentor_prs", []):
        base = MENTOR_BASE_PTS.get(pr["difficulty"], 30)
        bonus = MENTOR_QUALITY_BONUS.get(pr["quality"], 0)
        
        review_score = base + bonus
        ongoing += review_score
        review_details.append({
            "num": pr["number"],
            "contributor": pr.get("contributor", "unknown"),
            "difficulty": pr["difficulty"],
            "quality": pr["quality"],
            "score": review_score
        })
        
    return one_time, ongoing, review_details

def calculate_project_admin_points(state):
    # One-time points
    f = state["one_time_forms"]["project_admin"]
    one_time = 0
    if f["submitted"]:
        one_time += f["role_base"]
        if f["has_beginner_issues"]: one_time += 25
        if f["excellent_readme"]: 
            one_time += 20
        elif f["good_readme"]: 
            one_time += 10
        if f["expected_contributors_5plus"]: one_time += 15
        if f["prior_program_experience"]: one_time += 20
        one_time += f["open_github_issues_count"] * 2
        one_time += f["good_first_issues_count"] * 5
        
    # Ongoing Project Admin points
    act = state["project_admin_actions"]
    ongoing = 0
    ongoing += act["merge_gssoc_pr"] * 15
    ongoing += act["label_issue_difficulty_and_type"] * 10
    ongoing += act["label_issue_difficulty_only"] * 5
    ongoing += act["open_issue_beginner_friendly"] * 8
    ongoing += act["open_issue_any"] * 3
    
    # Issue resolution boost
    boost = 0
    avg_days = act["issue_resolution_avg_days"]
    if avg_days <= 2:
        boost = 60
    elif avg_days <= 5:
        boost = 40
    elif avg_days <= 10:
        boost = 20
        
    return one_time, ongoing, boost

def calculate_profile_and_bounties(state):
    profile = state.get("profile_bonuses", {
        "github_profile": True,
        "bio_filled": True,
        "linkedin_profile": True,
        "discord_linked": True
    })
    bounties = state.get("community_bounties", {
        "cloudinary_c2c": True,
        "substack_subscribe": True,
        "twitter_follow": True,
        "instagram_follow": True
    })
    
    p_pts = 0
    if profile.get("github_profile"): p_pts += 10
    if profile.get("bio_filled"): p_pts += 5
    if profile.get("linkedin_profile"): p_pts += 5
    if profile.get("discord_linked"): p_pts += 5
    
    b_pts = 0
    if bounties.get("cloudinary_c2c"): b_pts += 500
    if bounties.get("substack_subscribe"): b_pts += 100
    if bounties.get("twitter_follow"): b_pts += 50
    if bounties.get("instagram_follow"): b_pts += 50
    
    return p_pts, b_pts

def render_dashboard(state):
    print_banner()
    
    weeks = state["weeks"]
    
    # Calculations
    c_ot, c_ong, c_prs = calculate_contributor_points(state)
    c_streak_pts, c_curr_streak, c_streak_history = calculate_streak_points(weeks, "contributor")
    c_total = c_ot + c_ong + c_streak_pts
    
    m_ot, m_ong, m_prs = calculate_mentor_points(state)
    m_streak_pts, m_curr_streak, m_streak_history = calculate_streak_points(weeks, "mentor")
    m_total = m_ot + m_ong + m_streak_pts
    
    pa_ot, pa_ong, pa_boost = calculate_project_admin_points(state)
    pa_streak_pts, pa_curr_streak, pa_streak_history = calculate_streak_points(weeks, "project_admin")
    pa_total = pa_ot + pa_ong + pa_boost + pa_streak_pts
    
    a_streak_pts, a_curr_streak, a_streak_history = calculate_streak_points(weeks, "ambassador")
    
    p_pts, b_pts = calculate_profile_and_bounties(state)
    
    grand_total = c_total + m_total + pa_total + a_streak_pts + p_pts + b_pts
    
    # Render Dashboard Grid
    print(f"\n{Colors.BOLD}=== GSSOC SCORE SUMMARY MATRIX ==={Colors.ENDC}")
    print(f"+----------------------+-------------+-------------+-------------+-------------+")
    print(f"| {Colors.BOLD}Score Categories{Colors.ENDC}     | {Colors.CYAN}Contributor{Colors.ENDC} | {Colors.GREEN}   Mentor  {Colors.ENDC} | {Colors.BLUE}Proj Admin  {Colors.ENDC} | {Colors.WARNING} Ambassador {Colors.ENDC}|")
    print(f"+----------------------+-------------+-------------+-------------+-------------+")
    print(f"| One-Time App Points  | {c_ot:11,} | {m_ot:11,} | {pa_ot:11,} |         N/A |")
    print(f"| Ongoing Work Points  | {c_ong:11,} | {m_ong:11,} | {pa_ong:11,} |         N/A |")
    print(f"| Resolution Boost     |         N/A |         N/A | {pa_boost:11,} |         N/A |")
    print(f"| Active Streak Points | {c_streak_pts:11,} | {m_streak_pts:11,} | {pa_streak_pts:11,} | {a_streak_pts:11,} |")
    print(f"| Profile Verification | {p_pts:11,} |         N/A |         N/A |         N/A |")
    print(f"| Community Bounties   | {b_pts:11,} |         N/A |         N/A |         N/A |")
    print(f"+----------------------+-------------+-------------+-------------+-------------+")
    print(f"| {Colors.BOLD}Track Totals{Colors.ENDC}         | {Colors.CYAN}{Colors.BOLD}{c_total + p_pts + b_pts:11,}{Colors.ENDC} | {Colors.GREEN}{Colors.BOLD}{m_total:11,}{Colors.ENDC} | {Colors.BLUE}{Colors.BOLD}{pa_total:11,}{Colors.ENDC} | {Colors.WARNING}{Colors.BOLD}{a_streak_pts:11,}{Colors.ENDC} |")
    print(f"+----------------------+-------------+-------------+-------------+-------------+")
    
    print(f"\n>>> {Colors.BOLD}GRAND TOTAL POINTS ACCUMULATED: {Colors.GREEN}{Colors.BOLD}{grand_total:,} PTS{Colors.ENDC} !!! (Current Rank Target: {Colors.CYAN}#1{Colors.ENDC})")
    
    # Active Streak Summary
    print(f"\n{Colors.BOLD}=== CURRENT CONSECUTIVE STREAK METRICS ==={Colors.ENDC}")
    print(f"  > Contributor Streak : {Colors.CYAN}{Colors.BOLD}{c_curr_streak} Weeks{Colors.ENDC} (Min: 1 PR/wk) | Streak Score: {c_streak_pts} pts")
    print(f"  > Mentor Streak      : {Colors.GREEN}{Colors.BOLD}{m_curr_streak} Weeks{Colors.ENDC} (Min: 2 reviews/wk) | Streak Score: {m_streak_pts} pts")
    print(f"  > Project Admin Streak: {Colors.BLUE}{Colors.BOLD}{pa_curr_streak} Weeks{Colors.ENDC} (Min: 2 actions/wk) | Streak Score: {pa_streak_pts} pts")
    print(f"  > Ambassador Streak  : {Colors.WARNING}{Colors.BOLD}{a_curr_streak} Weeks{Colors.ENDC} (Active status) | Streak Score: {a_streak_pts} pts")

    # Competitor Comparison Section
    print(f"\n{Colors.BOLD}🏆 LEADERBOARD HEAD-TO-HEAD COMPARISON 🏆{Colors.ENDC}")
    print(f"+------------------------------+------------------+------------------+--------------+")
    print(f"| Metric                       | ritesh-1918 (You)| Anuj Kulkarni #4 | Gap to #4    |")
    print(f"+------------------------------+------------------+------------------+--------------+")
    print(f"| Total Leaderboard Score      | {grand_total:16,} |           11,665 | {max(0, 11665 - grand_total):12,} |")
    print(f"| Merged Repo PRs              | {state['project_admin_actions']['merge_gssoc_pr']:16} |              248 | {max(0, 248 - state['project_admin_actions']['merge_gssoc_pr']):12} |")
    print(f"| Ongoing Mentor Reviews       | {len(state.get('mentor_prs', [])):16} |               15 | {max(0, 15 - len(state.get('mentor_prs', []))):12} |")
    print(f"| Community Bounties           | {b_pts:16,} |              700 | {max(0, 700 - b_pts):12} |")
    print(f"| Active Weeks (Streak)        | {max(c_curr_streak, m_curr_streak, pa_curr_streak):16} |                2 | {max(0, 2 - max(c_curr_streak, m_curr_streak, pa_curr_streak)):12} |")
    print(f"+------------------------------+------------------+------------------+--------------+")
    print(f"📢 {Colors.CYAN}{Colors.BOLD}Blueprint to Overtake Anuj Kulkarni (#4):{Colors.ENDC} Merge {max(0, 248 - state['project_admin_actions']['merge_gssoc_pr'])} more contributor PRs, review {max(0, 15 - len(state.get('mentor_prs', [])))} more PRs, maintain your streaks, and keep climbing!")

    # Profile Optimization Checklist
    print(f"\n{Colors.BOLD}=== PROFILE & REPOSITORY OPTIMIZATION STATS ==={Colors.ENDC}")
    print(f"  > Project README status : " + (f"{Colors.GREEN}Excellent (+20 pts){Colors.ENDC}" if state["one_time_forms"]["project_admin"]["excellent_readme"] else f"{Colors.WARNING}Good (+10 pts){Colors.ENDC}"))
    print(f"  > Beginner Issues open  : {Colors.GREEN}Yes (+25 pts){Colors.ENDC}")
    print(f"  > Expected Contributors : {Colors.GREEN}5+ expected (+15 pts){Colors.ENDC}")
    print(f"  > Current Open Issues   : {state['one_time_forms']['project_admin']['open_github_issues_count']} issues ({state['one_time_forms']['project_admin']['open_github_issues_count'] * 2} ongoing pts)")
    print(f"  > Good First Issues     : {state['one_time_forms']['project_admin']['good_first_issues_count']} issues ({state['one_time_forms']['project_admin']['good_first_issues_count'] * 5} ongoing pts)")
    print(f"  > RLS Security Tables   : {Colors.GREEN}Configured (Robust RLS migration stage online!){Colors.ENDC}")

def print_week_details(state):
    weeks = state["weeks"]
    if not weeks:
        print(f"\n{Colors.WARNING}No weekly activity logged yet. Add a week to start tracking!{Colors.ENDC}")
        return
        
    print(f"\n{Colors.BOLD}=== WEEK-BY-WEEK ACTIVITY DETAILED LOG ==={Colors.ENDC}")
    print(f"+------+------------------+------------------+------------------+--------------+")
    print(f"| Week | Contributor PRs  |  Mentor Reviews  |  Proj Admin Act  | Ambassador   |")
    print(f"+------+------------------+------------------+------------------+--------------+")
    for i, w in enumerate(weeks):
        c_status = f"{w.get('contributor_prs', 0)} PRs"
        m_status = f"{w.get('mentor_reviews', 0)} revs"
        pa_status = f"{w.get('project_admin_actions', 0)} acts"
        a_status = "Active" if w.get("ambassador_active", False) else "Inactive"
        print(f"| {i+1:4} | {c_status:16} | {m_status:16} | {pa_status:16} | {a_status:12} |")
    print(f"+------+------------------+------------------+------------------+--------------+")

def add_week(state):
    print(f"\n{Colors.BOLD}[+] LOG ACTIVITY FOR NEW ACTIVE WEEK (Week {len(state['weeks']) + 1}) [+]{Colors.ENDC}")
    try:
        c_prs = int(input("▸ Contributor PRs Merged this week (Min 1): ") or 0)
        m_revs = int(input("▸ Mentor Reviews completed this week (Min 2): ") or 0)
        pa_acts = int(input("▸ Project Admin Actions completed this week (Min 2): ") or 0)
        amb = input("▸ Active as Ambassador this week? (y/n): ").strip().lower() == 'y'
        
        new_w = {
            "contributor_prs": c_prs,
            "mentor_reviews": m_revs,
            "project_admin_actions": pa_acts,
            "ambassador_active": amb
        }
        state["weeks"].append(new_w)
        save_state(state)
        print(f"\n{Colors.GREEN}[OK] Week {len(state['weeks'])} logged and persistent state updated!{Colors.ENDC}")
    except ValueError:
        print(f"\n{Colors.FAIL}[ERROR] Invalid input. Please enter valid integers.{Colors.ENDC}")

def add_mentor_pr(state):
    print(f"\n{Colors.BOLD}[+] RECORD contributor PR review (MENTOR TRACK) [+]{Colors.ENDC}")
    try:
        num = int(input("  > Contributor PR Number: "))
        contrib = input("  > Contributor GitHub Username: ").strip()
        print("\nSelect difficulty label:")
        print("1. level:beginner (10 pts)")
        print("2. level:intermediate (20 pts)")
        print("3. level:advanced (30 pts)")
        print("4. level:critical (50 pts)")
        print("5. None / Fallback Approved (30 pts)")
        d_choice = input("Enter choice (1-5): ").strip()
        diff = "none"
        if d_choice == "1": diff = "level:beginner"
        elif d_choice == "2": diff = "level:intermediate"
        elif d_choice == "3": diff = "level:advanced"
        elif d_choice == "4": diff = "level:critical"
        
        print("\nSelect quality label:")
        print("1. quality:clean (+5 pts)")
        print("2. quality:exceptional (+10 pts)")
        print("3. None / Standard (+0 pts)")
        q_choice = input("Enter choice (1-3): ").strip()
        qual = "none"
        if q_choice == "1": qual = "quality:clean"
        elif q_choice == "2": qual = "quality:exceptional"
        
        new_pr = {
            "number": num,
            "contributor": contrib,
            "difficulty": diff,
            "quality": qual
        }
        
        if "mentor_prs" not in state:
            state["mentor_prs"] = []
            
        state["mentor_prs"].append(new_pr)
        save_state(state)
        print(f"\n{Colors.GREEN}[OK] Mentor PR review registered successfully!{Colors.ENDC}")
    except ValueError:
        print(f"\n{Colors.FAIL}[ERROR] Invalid input. Please enter numbers correctly.{Colors.ENDC}")

def edit_admin_actions(state):
    print(f"\n{Colors.BOLD}[=] MODIFY PROJECT ADMIN ONGOING ACTIONS COUNTS [=]{Colors.ENDC}")
    act = state["project_admin_actions"]
    try:
        print(f"1. Merged Contributor PRs (Current: {act['merge_gssoc_pr']})")
        print(f"2. Labeled issue difficulty AND type (Current: {act['label_issue_difficulty_and_type']})")
        print(f"3. Labeled issue difficulty only (Current: {act['label_issue_difficulty_only']})")
        print(f"4. Opened beginner friendly issues (Current: {act['open_issue_beginner_friendly']})")
        print(f"5. Opened regular issues (Current: {act['open_issue_any']})")
        print(f"6. Average issue resolution duration in days (Current: {act['issue_resolution_avg_days']} days)")
        
        choice = input("\nSelect setting to edit (1-6): ").strip()
        if choice == "1":
            act["merge_gssoc_pr"] = int(input("Enter new count: "))
        elif choice == "2":
            act["label_issue_difficulty_and_type"] = int(input("Enter new count: "))
        elif choice == "3":
            act["label_issue_difficulty_only"] = int(input("Enter new count: "))
        elif choice == "4":
            act["open_issue_beginner_friendly"] = int(input("Enter new count: "))
        elif choice == "5":
            act["open_issue_any"] = int(input("Enter new count: "))
        elif choice == "6":
            act["issue_resolution_avg_days"] = float(input("Enter average days (e.g. 1.5): "))
            
        save_state(state)
        print(f"\n{Colors.GREEN}[OK] Project Admin action metrics saved successfully!{Colors.ENDC}")
    except ValueError:
        print(f"\n{Colors.FAIL}[ERROR] Invalid input. Action aborted.{Colors.ENDC}")

def reset_streak(state):
    confirm = input(f"\n{Colors.FAIL}{Colors.BOLD}[!] WARNING: This will delete ALL logged weeks and reset your streaks. Proceed? (y/n): {Colors.ENDC}").strip().lower()
    if confirm == 'y':
        state["weeks"] = []
        save_state(state)
        print(f"\n{Colors.GREEN}[OK] All streak stats successfully reset.{Colors.ENDC}")

def sync_from_github(state):
    print(f"\n{Colors.CYAN}[*] INITIATING GITHUB REAL-TIME METRICS CRAWLER...{Colors.ENDC}")
    import subprocess
    import json
    import datetime

    # 1. Fetch merged PRs in ritesh-1918/HELPDESK.AI
    print(f"▸ Querying ritesh-1918/HELPDESK.AI for merged GSSoC PRs...")
    cmd = ["pr", "list", "--repo", "ritesh-1918/HELPDESK.AI", "--state", "merged", "--limit", "100", "--json", "number,title,labels,author,createdAt,closedAt"]
    res = subprocess.run(["gh"] + cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0:
        print(f"{Colors.FAIL}[ERROR] Failed to fetch PRs from GitHub: {res.stderr}{Colors.ENDC}")
        return
    
    prs = json.loads(res.stdout)
    mentor_prs = []
    project_admin_actions = {
        "merge_gssoc_pr": 0,
        "label_issue_difficulty_and_type": 0,
        "label_issue_difficulty_only": 0,
        "open_issue_beginner_friendly": 0,
        "open_issue_any": 0,
        "issue_resolution_avg_days": 1.2
    }
    
    # GSSoC 2026 starts on May 11th, 2026
    start_date = datetime.datetime(2026, 5, 11, tzinfo=datetime.timezone.utc)
    now = datetime.datetime.now(datetime.timezone.utc)
    num_weeks = max(1, int((now - start_date).days / 7) + 1)
    
    weekly_data = [{"contributor_prs": 0, "mentor_reviews": 0, "project_admin_actions": 0, "ambassador_active": False} for _ in range(num_weeks)]
    
    for pr in prs:
        labels = [l["name"].lower() for l in pr.get("labels", [])]
        if "gssoc" in labels or "gssoc:approved" in labels:
            # Gather Mentor PR details
            diff = "none"
            for l in labels:
                if l.startswith("level:"):
                    diff = l
            qual = "none"
            for l in labels:
                if l.startswith("quality:"):
                    qual = l
            
            mentor_prs.append({
                "number": pr["number"],
                "contributor": pr["author"]["login"],
                "difficulty": diff,
                "quality": qual
            })
            
            project_admin_actions["merge_gssoc_pr"] += 1
            
            closed_at_str = pr.get("closedAt") or pr.get("createdAt")
            dt = datetime.datetime.fromisoformat(closed_at_str.replace("Z", "+00:00"))
            w_idx = int((dt - start_date).days / 7)
            if 0 <= w_idx < len(weekly_data):
                weekly_data[w_idx]["mentor_reviews"] += 1
                weekly_data[w_idx]["project_admin_actions"] += 1

    state["mentor_prs"] = mentor_prs

    # 2. Fetch issues
    print(f"▸ Querying ritesh-1918/HELPDESK.AI for issues...")
    cmd_issues = ["issue", "list", "--repo", "ritesh-1918/HELPDESK.AI", "--limit", "100", "--json", "number,labels,state,createdAt,closedAt,author"]
    res_issues = subprocess.run(["gh"] + cmd_issues, capture_output=True, text=True, check=False)
    open_issues_count = 0
    good_first_issues_count = 0
    resolved_durations = []
    
    if res_issues.returncode == 0:
        issues = json.loads(res_issues.stdout)
        for issue in issues:
            labels = [l["name"].lower() for l in issue.get("labels", [])]
            
            if issue["state"].lower() == "open":
                open_issues_count += 1
                if "good first issue" in labels or "good-first-issue" in labels:
                    good_first_issues_count += 1
            
            elif issue["state"].lower() == "closed":
                created_at = datetime.datetime.fromisoformat(issue["createdAt"].replace("Z", "+00:00"))
                closed_at = datetime.datetime.fromisoformat(issue["closedAt"].replace("Z", "+00:00"))
                duration_days = (closed_at - created_at).total_seconds() / 86400.0
                resolved_durations.append(duration_days)
                
            if "gssoc" in labels:
                author_login = issue.get("author", {}).get("login", "")
                if author_login.lower() == "ritesh-1918":
                    if "good first issue" in labels or "good-first-issue" in labels:
                        project_admin_actions["open_issue_beginner_friendly"] += 1
                    else:
                        project_admin_actions["open_issue_any"] += 1
                
                has_diff = any(l.startswith("level:") for l in labels)
                has_type = any(l.startswith("type:") for l in labels)
                if has_diff and has_type:
                    project_admin_actions["label_issue_difficulty_and_type"] += 1
                elif has_diff:
                    project_admin_actions["label_issue_difficulty_only"] += 1
                    
                created_at = datetime.datetime.fromisoformat(issue["createdAt"].replace("Z", "+00:00"))
                w_idx = int((created_at - start_date).days / 7)
                if 0 <= w_idx < len(weekly_data):
                    weekly_data[w_idx]["project_admin_actions"] += 1

    state["one_time_forms"]["project_admin"]["open_github_issues_count"] = open_issues_count
    state["one_time_forms"]["project_admin"]["good_first_issues_count"] = good_first_issues_count
    if resolved_durations:
        project_admin_actions["issue_resolution_avg_days"] = round(sum(resolved_durations) / len(resolved_durations), 1)
    
    state["project_admin_actions"] = project_admin_actions

    # 3. Contributor PRs on other repositories
    print(f"▸ Querying GitHub for your own GSSoC Contributor PRs...")
    cmd_contrib = ["search", "prs", "--author", "ritesh-1918", "--label", "gssoc", "--json", "number,repository,title,labels,createdAt,state"]
    res_contrib = subprocess.run(["gh"] + cmd_contrib, capture_output=True, text=True, check=False)
    contributor_prs = []
    
    if res_contrib.returncode == 0:
        c_prs = json.loads(res_contrib.stdout)
        for pr in c_prs:
            repo_name = pr.get("repository", {}).get("name", "")
            if repo_name.lower() == "ritesh-1918/helpdesk.ai" or "helpdesk.ai" in repo_name.lower():
                continue
                
            labels = [l["name"].lower() for l in pr.get("labels", [])]
            
            diff = "none"
            for l in labels:
                if l.startswith("level:"):
                    diff = l
            qual = "none"
            for l in labels:
                if l.startswith("quality:"):
                    qual = l
            type_b = "none"
            for l in labels:
                if l.startswith("type:"):
                    type_b = l
                    
            contributor_prs.append({
                "number": pr["number"],
                "repository": pr.get("repository", {}).get("nameWithOwner", repo_name),
                "difficulty": diff if diff != "none" else "level:beginner",
                "quality": qual,
                "type_bonus": type_b if type_b != "none" else "type:bug"
            })
            
            created_at_str = pr.get("createdAt")
            dt = datetime.datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            w_idx = int((dt - start_date).days / 7)
            if 0 <= w_idx < len(weekly_data):
                weekly_data[w_idx]["contributor_prs"] += 1

    state["contributor_prs"] = contributor_prs
    
    for i, w in enumerate(weekly_data):
        if i < len(state.get("weeks", [])):
            w["ambassador_active"] = state["weeks"][i].get("ambassador_active", False)
            
    state["weeks"] = weekly_data
    save_state(state)
    print(f"\n{Colors.GREEN}[OK] AUTOMATED SYNC COMPLETED SUCCESSFULLY! persistent database updated!{Colors.ENDC}")

def main():
    state = load_state()
    
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        render_dashboard(state)
        
        print(f"\n{Colors.BOLD}[=] ORCHESTRATION CONSOLE ACTIONS [=]{Colors.ENDC}")
        print("1. Log details for a new GSSoC Active Week")
        print("2. Detailed week-by-week activities log view")
        print("3. Record Contributor PR Review (Mentor track)")
        print("4. Manage Ongoing Project Admin action counts")
        print("5. Sync metrics automatically from GitHub!")
        print("6. Reset weekly streaks (start fresh)")
        print("7. Exit")
        
        choice = input(f"\n{Colors.BOLD}Select console command (1-7): {Colors.ENDC}").strip()
        
        if choice == "1":
            add_week(state)
            input("\nPress Enter to return to Dashboard...")
        elif choice == "2":
            print_week_details(state)
            input("\nPress Enter to return to Dashboard...")
        elif choice == "3":
            add_mentor_pr(state)
            input("\nPress Enter to return to Dashboard...")
        elif choice == "4":
            edit_admin_actions(state)
            input("\nPress Enter to return to Dashboard...")
        elif choice == "5":
            sync_from_github(state)
            state = load_state()
            input("\nPress Enter to return to Dashboard...")
        elif choice == "6":
            reset_streak(state)
            input("\nPress Enter to return to Dashboard...")
        elif choice == "7":
            print(f"\n{Colors.BLUE}Thank you for pair programming with Antigravity! See you at Rank #1! >>>{Colors.ENDC}\n")
            break

if __name__ == "__main__":
    main()
