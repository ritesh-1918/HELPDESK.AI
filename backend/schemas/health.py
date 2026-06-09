from pydantic import BaseModel, Field
from typing import Dict

class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall status of the backend API (e.g., 'ok')")
    classifier_loaded: bool = Field(..., description="Indicates if the main classifier model is loaded in memory")
    ner_loaded: bool = Field(..., description="Indicates if the Named Entity Recognition model is loaded")

class ReadinessResponse(BaseModel):
    status: str = Field(..., description="Readiness status ('ready' or 'not_ready')")
    checks: Dict[str, bool] = Field(..., description="Dictionary of subsystem readiness flags (e.g., database, vector index)")
