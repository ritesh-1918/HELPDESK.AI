from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class LoginBody(BaseModel):
    email: str = Field(..., description="The user's email address")
    password: str = Field(..., description="The user's plaintext password")

class SignupBody(BaseModel):
    email: str = Field(..., description="The user's email address")
    password: str = Field(..., description="The user's plaintext password")
    full_name: str = Field(..., description="The user's full name")
    company: str = Field("", description="The name of the user's company")
    role: str = Field("user", description="The requested role (e.g., 'user', 'admin')")
    extra_metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional custom metadata for the profile")
