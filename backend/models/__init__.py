"""
Models package for HelpDesk.AI backend.

This package contains Pydantic request/response models and
data-transfer objects used across API routes and services.
"""

from backend.schemas import TicketSaveRequest, TicketRecord, TICKETS_DB

__all__ = ["TicketSaveRequest", "TicketRecord", "TICKETS_DB"]
