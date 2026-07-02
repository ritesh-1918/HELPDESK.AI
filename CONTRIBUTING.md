# Contributing to HELPDESK.AI

Thank you for considering contributing to HELPDESK.AI! This guide will help you get started with contributing to our AI-powered helpdesk platform.

## Introduction

HELPDESK.AI is an intelligent ticket triage system that uses deep learning to categorize and resolve IT issues in milliseconds. We welcome contributions from developers, designers, and documentation writers who want to help transform IT support from "Chaos to Clarity."

## Getting Started

### Forking the Repository

1. Navigate to the [HELPDESK.AI repository](https://github.com/ritesh-1918/HELPDESK.AI)
2. Click the "Fork" button in the top-right corner
3. This creates a copy of the repository in your GitHub account

### Cloning

Clone your forked repository to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/HELPDESK.AI.git
cd HELPDESK.AI
```

### Installing Dependencies

For detailed local development setup instructions, please refer to [README.md](README.md).

The repository includes multiple components:
- **Frontend**: React-based user interface
- **Backend**: FastAPI Python backend
- **MobileApp**: React Native mobile application

Install dependencies for each component you plan to work with:

```bash
# Frontend
cd Frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt

# Mobile App
cd ../MobileApp
npm install
```

### Local Development Setup

For comprehensive local setup instructions including environment configuration, database setup, and running the application locally, please refer to the [README.md](README.md) deployment section.

## Development Workflow

### Creating Feature Branches

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

### Keeping Branches Updated

Keep your branch up-to-date with the latest changes:

```bash
git fetch upstream
git rebase upstream/gssoc
```

### Syncing with Upstream

Add the upstream repository if you haven't already:

```bash
git remote add upstream https://github.com/ritesh-1918/HELPDESK.AI.git
```

### Commit Best Practices

- Write clear, descriptive commit messages
- Use the present tense ("Add feature" not "Added feature")
- Limit each commit to a single logical change
- Reference issue numbers when applicable: `Fixes #123`

## Branch Strategy

### Target Branch

**All Pull Requests MUST target the `gssoc` branch.** The `main` branch is protected and reserved for production releases.

### Branch Naming Examples

Use these prefixes for your branches:

- `feature/` - New features or functionality
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring without functional changes
- `test/` - Test additions or updates

Examples:
- `feature/ticket-priority-sorting`
- `fix/login-auth-error`
- `docs/update-readme`
- `refactor/backend-api-structure`

## Code Style Guidelines

### Formatting

- **Python**: Follow PEP 8 style guidelines
- **JavaScript/React**: Use ESLint configuration provided
- **Markdown**: Use consistent formatting with proper heading levels

### Naming Conventions

- **Variables**: Use camelCase for JavaScript, snake_case for Python
- **Components**: Use PascalCase for React components
- **Files**: Use kebab-case for file names
- **Constants**: Use UPPER_SNAKE_CASE

### Linting

Run linting before committing:

```bash
# Frontend
cd Frontend
npm run lint

# Backend
cd ../backend
ruff check .
```

### Documentation Expectations

- Add JSDoc comments for complex functions
- Update inline comments for non-obvious logic
- Document new API endpoints
- Update relevant documentation files when adding features

## Testing Requirements

### Running Lint

Always run linting before submitting a PR:

```bash
# Frontend linting
cd Frontend
npm run lint

# Backend linting
cd ../backend
ruff check .
```

### Running Tests

Run the test suite to ensure your changes don't break existing functionality:

```bash
# Frontend tests
cd Frontend
npm test

# Backend tests
cd ../backend
pytest
```

### Build Verification

Build the project to ensure there are no build errors:

```bash
# Frontend build
cd Frontend
npm run build
```

## Pull Request Process

### Creating a Focused PR

- Keep PRs small and focused on a single issue
- Large PRs should be split into smaller, manageable pieces
- Each PR should address one specific feature or bug fix

### Writing Meaningful Commit Messages

Use the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(ticket): add priority sorting to ticket list

Add ability to sort tickets by priority level (High, Medium, Low).
This improves ticket management for support agents.

Closes #123
```

### Adding Screenshots When Needed

For UI changes, include screenshots or screen recordings:
- Before and after comparisons
- Mobile and desktop views if responsive
- Different states (loading, error, success)

### Linking Issues

Always link your PR to the relevant issue:
- In commit messages: `Fixes #123` or `Closes #123`
- In the PR description: `This PR fixes #123`

### Updating Documentation

- Update relevant documentation files
- Add new pages to `PLATFORM_MAP.md` if adding new UI pages
- Update API documentation for backend changes
- Add examples for new features

### Passing CI

Ensure all CI checks pass before submitting:
- Linting checks
- Test suites
- Build verification
- Security scans

### DCO Sign-Off

This project requires Developer Certificate of Origin (DCO) sign-off. Use the `-s` flag when committing:

```bash
git commit -s -m "feat: add new feature"
```

This adds the `Signed-off-by` line automatically.

## Example Pull Request Description

```markdown
## Summary
Brief description of what this PR does (2-3 sentences).

## Changes
- List of major changes
- Bullet points for clarity

## Testing
- Describe how you tested this change
- List any manual testing performed
- Mention automated tests added

## Screenshots
(If applicable)
![Screenshot](link-to-screenshot)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Linting passes
- [ ] Tests pass
- [ ] Documentation updated
- [ ] DCO sign-off included
- [ ] Linked to relevant issue

## Related Issues
Closes #123
```

## Issue Workflow

### Finding an Issue

1. Browse the [Issues tab](https://github.com/ritesh-1918/HELPDESK.AI/issues)
2. Use labels to filter by type: `good first issue`, `enhancement`, `bug`
3. Comment on the issue to express interest
4. Wait for assignment before starting work

### Getting Assigned

- Request assignment in the issue comments
- Wait for a maintainer to assign you
- Only work on assigned issues to avoid duplication

### Working on a Separate Branch

Always create a new branch for each issue:

```bash
git checkout -b feature/issue-123-ticket-priority
```

### Referencing Issue Numbers

Include the issue number in:
- Branch names: `feature/issue-123-description`
- Commit messages: `Fixes #123`
- PR descriptions: `This PR fixes #123`

## Mentorship

For guidance and support during your contribution journey:

- Refer to project maintainers for code review feedback
- Ask questions in issue comments for clarification
- Join community discussions for broader topics
- Review existing PRs to understand contribution patterns

## Additional Resources

- [README.md](README.md) - Project overview and quick start
- [PLATFORM_MAP.md](PLATFORM_MAP.md) - Complete application structure
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- [SECURITY.md](SECURITY.md) - Security policies and reporting

---

Thank you for contributing to HELPDESK.AI! Your contributions help make IT support smarter and more efficient for everyone.
