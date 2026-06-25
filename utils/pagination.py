"""
Pagination Utility for HELPDESK.AI API responses.
"""
from typing import Any


def paginate_queryset(queryset, page: int, page_size: int = 25) -> dict:
    """
    Apply offset pagination to a queryset or list.

    Args:
        queryset: List or ORM queryset
        page: 1-indexed page number
        page_size: Number of items per page (default: 25, max: 100)

    Returns:
        dict with items, page metadata
    """
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    offset = (page - 1) * page_size

    if hasattr(queryset, "count"):  # ORM queryset
        total = queryset.count()
        items = list(queryset[offset: offset + page_size])
    else:  # plain list
        total = len(queryset)
        items = queryset[offset: offset + page_size]

    total_pages = (total + page_size - 1) // page_size

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }
