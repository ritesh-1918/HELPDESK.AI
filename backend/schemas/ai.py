from pydantic import BaseModel, Field
from typing import List, Dict, Any

class TroubleshootRequest(BaseModel):
    text: str = Field(..., description="The user's issue description")
    category: str = Field(..., description="The context category of the issue (e.g., 'Network', 'Hardware')")
    history: List[Dict[str, Any]] = Field(default_factory=list, description="Previous interaction history for the troubleshooting session")

class TroubleshootResponse(BaseModel):
    step_text: str = Field(..., description="The next troubleshooting step or question provided by the AI")
    options: List[str] = Field(..., description="List of possible answers or actions the user can select")
    is_final: bool = Field(..., description="Indicates if the troubleshooting session has reached a conclusion")

class BugReportAnalysisRequest(BaseModel):
    bug_title: str = Field(..., description="The title of the reported bug")
    description: str = Field(..., description="Detailed description of the bug behavior")
    steps_to_reproduce: str = Field("", description="Steps required to reproduce the bug")
    console_errors: List[str] = Field(default_factory=list, description="List of console or application error logs")

class BugReportAnalysisResponse(BaseModel):
    probable_cause: str = Field(..., description="The AI-generated analysis of the probable root cause of the bug")
