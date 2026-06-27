# Critical Architecture Enhancement: security: Implement Fine-Grained Role-Based Access Control (RBAC) Hierarchy Validator

## Overview
Replace boolean flags with a hierarchical, tree-structured RBAC validator supporting multiple authorization levels (User, Support Agent, Department Lead, Admin). Permissions inherit downwards, and routes can declarative assert required permission nodes using FastAPI dependencies.

## Verification Plan
- [x] Write architectural design documentation
- [x] Create core service components in `backend/dependencies/rbac_validator.py`
- [x] Verify verification rules and security bounds

Closes #2543