"""
Models package for HelpDesk.AI backend.

Re-exports all Pydantic models from backend.schemas for convenient imports.
"""

from backend.schemas import (
    TicketRecord,
    TicketRequest,
    TicketSaveRequest,
    TicketResponse,
    EntityInfo,
    DuplicateInfo,
    TroubleshootRequest,
    TroubleshootResponse,
    BugReportAnalysisRequest,
    BugReportAnalysisResponse,
    HealthResponse,
    ReadinessResponse,
)

TICKETS_DB: list[TicketRecord] = []