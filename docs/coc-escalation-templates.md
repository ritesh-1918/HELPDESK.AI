# CoC Violation Reporting & Escalation Templates

This document provides standardized templates for reporting and responding to Code of Conduct violations within the HELPDESK.AI community. These templates ensure consistent, professional handling of incidents at every escalation tier.

## Escalation Tiers

| Tier | Name | Action | SLA |
|------|------|--------|-----|
| 1 | Self-Resolution | Reporter contacts violator privately | Immediate |
| 2 | Moderation | Report to project maintainers | Acknowledgment within 48h |
| 3 | Platform Escalation | Report to GitHub/GitLab Trust & Safety | Resolution within 7 days |

---

## Tier 1: Self-Resolution Template

Use this template when you feel comfortable directly contacting the person who violated the CoC. Send via a private channel (email, DM).

```
Subject: [HELPDESK.AI] — A note about our community interaction

Hi [username],

I wanted to reach out about [specific behavior/comment] in [location — issue/PR/discussion #number].

In the spirit of keeping HELPDESK.AI a welcoming space, I felt that this interaction crossed a line because [brief explanation of why it was problematic].

I'd appreciate it if we could keep future interactions respectful and constructive per the project's Code of Conduct (CODE_OF_CONDUCT.md).

Let me know if you'd like to discuss this further.

Best,
[Your name]
```

---

## Tier 2: Moderation Report Template (Maintainers)

Use this to report a violation to the HELPDESK.AI maintainers. Open a new issue at https://github.com/ritesh-1918/HELPDESK.AI/issues with the label `coc-violation`.

```markdown
### CoC Violation Report

**Date of incident:** YYYY-MM-DD

**Reporter:** (You may remain anonymous — leave blank if preferred)

**Person(s) involved:** @username(s)

**Location of violation:**
- Issue/PR/Discussion URL: [link]
- Specific comment(s): [link to specific comment(s)]

**Description of violation:**
[What happened, with as much detail as possible]

**CoC section violated:**
[Reference the specific section of CODE_OF_CONDUCT.md]

**Previous escalation (Tier 1):**
- [ ] I have attempted self-resolution (Tier 1)
- [ ] I have NOT attempted self-resolution (explain why)

**Desired outcome:**
- [ ] Warning issued to the person
- [ ] Temporary ban from the repository
- [ ] Permanent ban from the repository
- [ ] Other: [describe]

**Evidence:**
[Screenshots, logs, or other relevant evidence — attach to this issue]
```

---

## Tier 3: Platform Escalation Template

Use this for severe violations (harassment, doxxing, threats, illegal content) that require GitHub/GitLab intervention.

### GitHub Trust & Safety Report

1. Go to: https://github.com/contact/report-abuse
2. Select **"Report content that violates GitHub's Terms of Service or Community Guidelines"**
3. Include the following in your report:

```
### GitHub Abuse Report — HELPDESK.AI Community

**Reporting user:** @[your username]
**Reported user:** @[username]

**Repository:** ritesh-1918/HELPDESK.AI

**Nature of violation:**
- [ ] Harassment or bullying
- [ ] Hate speech or discrimination
- [ ] Doxxing (sharing personal information)
- [ ] Threats of violence
- [ ] Malicious code or security exploit
- [ ] Other: [specify]

**Description:**
[Detailed description of the violation]

**Location(s):**
- Issue/PR: [URL]
- Comments: [URLs]

**Previous escalation history:**
- Tier 1 (self-resolution): [Yes/No — date]
- Tier 2 (maintainer report): [Yes/No — issue # if applicable]

**Supporting evidence:**
[Screenshots, archived pages, or other evidence]
```

---

## Maintainer Response Templates

### Warning Notice

```
### CoC Warning — @[username]

Dear @[username],

This is an official warning regarding your recent behavior in [issue/PR #].
Specifically, [describe the behavior].

This behavior does not align with our Code of Conduct, which requires all
participants to maintain a respectful and constructive tone.

**What needs to happen:**
- [ ] Please edit/remove the problematic comment(s)
- [ ] Please avoid similar behavior in future interactions

A repeat of this behavior or any further CoC violations will result in
a temporary ban from the repository.

Sincerely,
[@maintainer]
```

### Temporary Ban Notice

```
### Temporary Ban Notice — @[username]

Dear @[username],

Due to repeated or severe violation(s) of the Code of Conduct in
[issue/PR/discussion #number(s)], you are hereby temporarily banned from
participating in the HELPDESK.AI project for [duration — e.g., 7 days /
30 days].

**Terms of ban:**
- You may not open new issues, PRs, or discussions
- You may not comment on existing issues, PRs, or discussions
- You may still view the repository as a read-only visitor

**Appeals:**
If you believe this ban was issued in error, you may appeal by emailing
the maintainers at [maintainer email].

**Duration:**
Start: YYYY-MM-DD
End: YYYY-MM-DD

Your account will be automatically unblocked after the ban period ends.

Sincerely,
[@maintainer]
```

### Permanent Ban Notice

```
### Permanent Ban Notice — @[username]

Dear @[username],

Due to [severe violation(s) / repeated violations after temporary ban(s)]
of the Code of Conduct, you are hereby permanently banned from participating
in the HELPDESK.AI project.

**Reason:**
[Detailed explanation of violation(s)]

**Appeals:**
This decision is final. Appeals will only be considered in extraordinary
circumstances and must be sent via email to [maintainer email].

Sincerely,
[@maintainer]
```

## Record Keeping

All CoC violations, regardless of tier, should be recorded in a private maintainer log. The log should include:

- Date and time of incident
- Names of individuals involved
- Tier of escalation used
- Resolution and outcome
- Any follow-up actions taken

## References

- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
- [SECURITY.md](../SECURITY.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
