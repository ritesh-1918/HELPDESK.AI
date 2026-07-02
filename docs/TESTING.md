# Testing Guide for HELPDESK.AI

## Overview

This guide documents the current testing approach for HELPDESK.AI. As of this writing, the project uses a combination of CI-based verification and manual testing procedures. Automated unit tests, integration tests, and end-to-end tests are not yet implemented.

## Current Testing Strategy

### 1. Continuous Integration (CI) Testing

The project uses GitHub Actions for automated verification of code integrity. The CI workflow is defined in `.github/workflows/ci.yml`.

#### CI Jobs

**Frontend Build Verification**
- Verifies that the frontend application builds successfully
- Ensures no build errors or warnings
- Runs on every push and pull request to `main`

**Backend Logic Verification**
- Verifies that backend services can be imported correctly
- Checks the integrity of the AI classifier service imports
- Ensures Python dependencies are properly installed

#### Running CI Checks Locally

To simulate the CI checks locally:

**Frontend Build Check:**
```bash
cd Frontend
npm install
npm run build
```

**Backend Import Check:**
```bash
cd backend
pip install -r requirements.txt
python -c "
import os, sys
sys.path.append(os.getcwd())
from services.classifier_service import ClassifierService
try:
    service = ClassifierService()
    print('Import logic for AI Classifier is solid.')
except Exception as e:
    print(f'AI Logic Error: {e}')
"
```

### 2. Manual Testing Procedures

The project maintains manual test cases and defect logs in `docs/testing_reports.md`. This document contains:

- **Defect Log**: Tracks discovered bugs, their status, and resolution
- **Test Cases**: Manual test procedures for key features

#### Key Manual Test Areas

Based on the existing test cases, the following areas are manually tested:

1. **Auto-categorization of Technical Support Tickets**
   - Verify NLP engine correctly assigns categories and severity
   - Test with various ticket descriptions

2. **Live Emotion Recognition Fallback**
   - Test graceful degradation when webcam is unavailable
   - Verify error handling instead of crashes

3. **Advanced Bug Report Attachments**
   - Test screenshot capture functionality
   - Verify base64 image handling in payload

4. **Simple Bug Report Submission**
   - Test public bug report widget
   - Verify auto-generated titles from descriptions

5. **Support Email Template Generation**
   - Test mailto link generation
   - Verify dynamic user context population

6. **Automated GitHub Publishing Workflow**
   - Test workflow dispatch functionality
   - Verify bot detection bypass

7. **Admin Password Rotation Security**
   - Test password mismatch validation
   - Verify API call prevention on validation failure

#### Running Manual Tests

To run manual tests:

1. Review the test cases in `docs/testing_reports.md`
2. Set up the local development environment (see `LOCAL_SETUP.md`)
3. Execute each test procedure step-by-step
4. Record results in the testing reports文档
5. Report any new defects found

## Installation Requirements

### Frontend Testing Requirements

```bash
cd Frontend
npm install
```

Required tools:
- Node.js v20+
- npm

### Backend Testing Requirements

```bash
cd backend
pip install -r requirements.txt
```

Required tools:
- Python 3.10+
- pip

Key dependencies:
- fastapi>=0.104.0
- uvicorn>=0.24.0
- torch>=2.0.0
- transformers>=4.35.0
- sentence-transformers>=2.2.0

## Test Directory Structure

Currently, the project does not have dedicated test directories. The testing-related files are organized as follows:

```
HELPDESK.AI/
├── .github/workflows/
│   └── ci.yml                    # CI workflow configuration
├── docs/
│   └── testing_reports.md       # Manual test cases and defect logs
├── scratch/                      # Manual test scripts (not for production)
│   ├── test_backend.py
│   ├── test_backend.js
│   └── ...
└── Frontend/
    └── package.json             # Build scripts for verification
```

## Test Naming Conventions

Since automated tests are not yet implemented, the following conventions are used for manual test documentation:

### Test Case IDs
- Format: `TC-XXX` (e.g., TC-001, TC-002)
- Sequential numbering for new test cases

### Defect IDs
- Format: `D-XXX` (e.g., D-001, D-002)
- Sequential numbering for new defects

### Test Case Documentation
When documenting new manual test cases in `docs/testing_reports.md`, include:
- Test Case Name
- Test Procedure (step-by-step)
- Condition to be tested
- Expected Result
- Actual Result (after testing)

## Best Practices for Writing Tests

### Manual Testing Best Practices

1. **Document Thoroughly**
   - Write clear, step-by-step procedures
   - Include expected vs actual results
   - Note any environmental dependencies

2. **Test Edge Cases**
   - Test with empty inputs
   - Test with invalid inputs
   - Test boundary conditions

3. **Test Across Environments**
   - Test on different browsers
   - Test on different screen sizes
   - Test with different user permissions

4. **Report Defects Properly**
   - Use the defect log format in `docs/testing_reports.md`
   - Include steps to reproduce
   - Attach screenshots when applicable
   - Note severity and impact

### Future Automated Testing Recommendations

When implementing automated tests in the future, consider:

1. **Unit Testing**
   - Test individual functions and components in isolation
   - Mock external dependencies (API calls, database)
   - Aim for high code coverage

2. **Integration Testing**
   - Test interactions between components
   - Test API endpoints with real database connections
   - Test authentication and authorization flows

3. **End-to-End Testing**
   - Test complete user workflows
   - Test critical paths (ticket creation, admin operations)
   - Use tools like Cypress or Playwright

## Example Test Cases

### Manual Test Case Example

**Test Case: Auto-categorization of Technical Support Tickets**

**Procedure:**
1. Enter a detailed software crash report
2. Submit the ticket
3. Verify the assigned category and severity in the dashboard

**Condition to be tested:**
Verify that the NLP engine (Classifier V3) correctly assigns category "Technical" and severity "High".

**Expected Result:**
Category: "Technical", Severity: "High"

**Actual Result:**
Category: "Technical", Severity: "High" (Pass)

### CI Verification Example

**Frontend Build Test:**

```bash
cd Frontend
npm install
npm run build
```

**Expected Result:**
Build completes successfully with no errors

**Actual Result:**
Build output in `dist/` directory, exit code 0

## CI Integration

The CI workflow automatically runs on:
- Push to `main` branch
- Pull requests targeting `main` branch

### CI Workflow Steps

1. **Frontend Build Job**
   - Checkout code
   - Setup Node.js v20
   - Install dependencies
   - Run production build

2. **Backend Logic Job**
   - Checkout code
   - Setup Python 3.10
   - Install dependencies
   - Verify classifier service imports

### Viewing CI Results

CI results are available in the GitHub Actions tab of the repository. Failed builds will block merging until resolved.

## Common Testing Errors and Troubleshooting

### Frontend Build Failures

**Error: Module not found**
- **Cause**: Missing dependencies
- **Solution**: Run `npm install` in Frontend directory

**Error: Build fails with TypeScript errors**
- **Cause**: Type mismatches in code
- **Solution**: Fix type errors in source files

### Backend Import Failures

**Error: Import error for classifier service**
- **Cause**: Missing model files or incorrect dependencies
- **Solution**: Ensure all model files are present and dependencies are installed

**Error: Python version mismatch**
- **Cause**: Using incorrect Python version
- **Solution**: Use Python 3.10+ as specified in requirements

### Manual Testing Issues

**Issue: Test results not reproducible**
- **Cause**: Environmental differences or state dependencies
- **Solution**: Document environmental setup and reset state between tests

**Issue: Cannot reproduce defect**
- **Cause**: Insufficient documentation in defect log
- **Solution**: Add more detailed steps and environmental information

## Contributing Test Cases

When contributing new test cases:

1. Add the test case to `docs/testing_reports.md`
2. Follow the existing format for consistency
3. Include clear procedures and expected results
4. Test the procedure yourself before submitting
5. Update this TESTING.md if new testing approaches are added

## Testing Resources

- **CI Configuration**: `.github/workflows/ci.yml`
- **Manual Test Reports**: `docs/testing_reports.md`
- **Local Setup Guide**: `LOCAL_SETUP.md`
- **Project Structure**: `README.md`

## Future Testing Roadmap

The following testing improvements are planned for future implementation:

1. **Unit Testing Framework**
   - Add pytest for backend Python services
   - Add Jest or Vitest for frontend React components
   - Establish minimum coverage thresholds

2. **Integration Testing**
   - Add API endpoint integration tests
   - Add database migration tests
   - Add authentication flow tests

3. **E2E Testing**
   - Implement Cypress or Playwright for critical user flows
   - Add visual regression testing
   - Add performance testing

4. **Test Automation in CI**
   - Expand CI workflow to run automated tests
   - Add coverage reporting
   - Add performance benchmarks

## Support

For questions about testing or to report issues with the testing infrastructure:
- Open an issue on GitHub
- Contact maintainers via the project communication channels
- Refer to existing test cases in `docs/testing_reports.md` for examples
