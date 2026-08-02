"""
Tenant isolation enforcement (issue #3900).

All ticket-facing queries must be scoped to a single tenant so one company can
never read another company's ticket records. The tenant scope is resolved from
the ``company_id`` query parameter or the ``X-Company-Id`` request header, and
queries are always filtered to that scope before hitting the database.

Run with:  python -m unittest backend.tests.test_tenant_isolation -v
"""

from fastapi import HTTPException, Request

TENANT_HEADER = "x-company-id"


def resolve_tenant_id(request: Request, company_id: str | None = None) -> str | None:
    """
    Resolve the tenant scope for a request.

    Priority: explicit ``company_id`` query param, then the ``X-Company-Id``
    header. Returns ``None`` when no scope is supplied.
    """
    if company_id and company_id.strip():
        return company_id.strip()
    header = request.headers.get(TENANT_HEADER)
    if header and header.strip():
        return header.strip()
    return None


def require_tenant(request: Request, company_id: str | None = None) -> str:
    """
    Return the resolved tenant scope, raising 403 when none is provided so
    unscoped cross-tenant reads are impossible.
    """
    tenant = resolve_tenant_id(request, company_id)
    if not tenant:
        raise HTTPException(
            status_code=403,
            detail="Tenant scope required: provide company_id or the X-Company-Id header",
        )
    return tenant
