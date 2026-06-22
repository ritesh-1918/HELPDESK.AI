.PHONY: lint test-frontend test-backend ci

# === Frontend ===
lint:
	cd Frontend && npm run lint

test-frontend:
	cd Frontend && npx vitest run

# === Backend ===
test-backend:
	cd backend && python -m pytest

# === CI Pipeline (runs all checks) ===
ci: lint test-frontend test-backend
	@echo "All CI checks passed!"
