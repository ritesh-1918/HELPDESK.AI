# Critical Architecture Enhancement: security: Implement SQL Injection and Query Parameter Sanitization Middleware

## Overview
Add a high-performance query parameter and payload sanitization middleware to FastAPI to prevent SQL injection attempts. The middleware intercepts incoming requests, analyzes the parameters/body against known SQLi injection AST patterns, and returns a 400 Bad Request if validation fails, protecting backend operations.

## Verification Plan
- [x] Write architectural design documentation
- [x] Create core service components in `backend/middleware/sqli_sanitizer.py`
- [x] Verify verification rules and security bounds

Closes #2531