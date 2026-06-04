# GSSoC Test Verification Reference Manual

This guide covers testing practices and verification procedures for HELPDESK.AI contributions.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Integration Testing](#integration-testing)
- [Verification Checklist](#verification-checklist)

---

## Overview

All GSSoC contributions should include appropriate tests. This guide explains how to write, run, and verify tests for the HELPDESK.AI platform.

## Backend Testing

### Setup

```bash
cd backend
pip install pytest pytest-asyncio httpx
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_classifier.py

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=. --cov-report=html
```

### Writing Unit Tests

Example test for `classifier_service.py`:

```python
import pytest
from backend.services.classifier_service import ClassifierService

def test_predict_returns_valid_category():
    service = ClassifierService()
    result = service.predict("My laptop screen is broken")
    assert "category" in result
    assert result["category"] in ["Hardware", "Software", "Network", "Access"]

def test_predict_empty_text_raises_error():
    service = ClassifierService()
    with pytest.raises(ValueError):
        service.predict("")
```

### Testing with Mocks

```python
from unittest.mock import patch, MagicMock

@patch('backend.services.classifier_service.ClassifierService.load')
def test_predict_with_mock_load(mock_load):
    mock_load.return_value = None
    service = ClassifierService()
    # Test without actually loading the model
```

## Frontend Testing

### Setup

```bash
cd Frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Writing Component Tests

```jsx
import { render, screen } from '@testing-library/react';
import { TicketStatusBadge } from '../components/TicketStatusBadge';

test('renders open status badge', () => {
  render(<TicketStatusBadge status="Open" />);
  expect(screen.getByText('Open')).toBeInTheDocument();
});
```

## Integration Testing

### API Endpoint Testing

```python
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200

def test_analyze_ticket_requires_text():
    response = client.post("/ai/analyze_ticket", json={})
    assert response.status_code == 422
```

### Supabase Integration Tests

```python
@pytest.mark.integration
def test_ticket_creation_in_supabase():
    # Uses test database
    response = supabase.table("tickets").insert({
        "title": "Test ticket",
        "description": "Test description",
        "company_id": "test-company"
    }).execute()
    assert response.data is not None
```

## Verification Checklist

Before submitting a PR, verify:

- [ ] All existing tests pass: `pytest` (backend) and `npm test` (frontend)
- [ ] New code has corresponding tests
- [ ] Test coverage does not decrease
- [ ] Edge cases are covered (empty inputs, null values, boundary conditions)
- [ ] Integration tests use test database, not production
- [ ] Mock external services (Supabase, SMTP, AI models)
- [ ] Tests are deterministic (no random failures)
- [ ] Test names clearly describe what they verify

## Common Test Patterns

### Testing Error Handling

```python
def test_handles_network_error_gracefully():
    with patch('requests.post', side_effect=ConnectionError):
        result = my_function()
        assert result["error"] is not None
```

### Testing Async Code

```python
import pytest

@pytest.mark.asyncio
async def test_async_endpoint():
    response = await client.get("/async-endpoint")
    assert response.status_code == 200
```

### Testing Date/Time

```python
from unittest.mock import patch
from datetime import datetime

@patch('datetime.datetime')
def test_uses_current_time(mock_datetime):
    mock_datetime.now.return_value = datetime(2026, 1, 1)
    result = my_function()
    assert result["timestamp"] == "2026-01-01"
```
