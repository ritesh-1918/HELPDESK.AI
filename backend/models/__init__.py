"""
Models package for HelpDesk.AI backend.

Re-exports all Pydantic models from backend.schemas for convenient imports.
"""

from backend.schemas import (
    TicketRequest,
    TicketSaveRequest,
    TicketResponse,
    EntityInfo,
    DuplicateInfo,
    TroubleshootRequest,
    TroubleshootResponse,
    BugReportAnalysisRequest,
    BugReportAnalysisResponse,
    CorrectionLogRequest,
    Message,
    TicketRecord,
    HealthResponse,
    ReadinessResponse,
)

TICKETS_DB: list[TicketRecord] = []