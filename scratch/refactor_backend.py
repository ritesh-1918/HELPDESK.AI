import os
import re

main_path = "backend/main.py"
with open(main_path, "r") as f:
    content = f.read()

# 1. Create backend/schemas.py
os.makedirs("backend/routers", exist_ok=True)

schemas_match = re.search(r'(class TicketRequest\(BaseModel\):.*?)# ---', content, re.DOTALL)
if schemas_match:
    schemas = "from pydantic import BaseModel\nfrom typing import Optional, List, Dict, Any\n" + schemas_match.group(1)
    with open("backend/schemas.py", "w") as f:
        f.write(schemas.replace("TICKETS_DB: list[TicketRecord] = []", ""))

# 2. Extract routers
# The endpoints are mostly grouped. We will create the new router files and just write the content.
# Since it's highly complex to regex parse, I will just write the router files explicitly.

tickets_router = """from fastapi import APIRouter, HTTPException, Depends
from backend.database import supabase
from backend.schemas import *

router = APIRouter(prefix="/tickets", tags=["Tickets"])
api_router = APIRouter(prefix="/api", tags=["API Decoupled"])

@router.get("/")
async def get_tickets():
    if not supabase: return []
    res = supabase.table("tickets").select("*").execute()
    return res.data

@router.post("/save")
async def save_ticket(req: TicketSaveRequest):
    if not supabase: raise HTTPException(500, "No DB")
    payload = req.dict()
    res = supabase.table("tickets").insert(payload).execute()
    return {"status": "success", "ticket": res.data[0]}

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str):
    if not supabase: raise HTTPException(500, "No DB")
    res = supabase.table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data: raise HTTPException(404, "Ticket not found")
    return res.data[0]

@router.patch("/{ticket_id}")
async def patch_ticket(ticket_id: str, payload: dict):
    if not supabase: raise HTTPException(500, "No DB")
    res = supabase.table("tickets").update(payload).eq("id", ticket_id).execute()
    return res.data[0] if res.data else {}

# Decoupled endpoints
@api_router.get("/tickets")
async def api_get_tickets(user_id: str = None, company: str = None, limit: int = 50, offset: int = 0):
    if not supabase: return []
    query = supabase.table("tickets").select("*")
    if user_id: query = query.eq("user_id", user_id)
    if company: query = query.eq("company", company)
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data

@api_router.patch("/tickets/{ticket_id}")
async def api_update_ticket(ticket_id: str, updates: dict):
    if not supabase: return {}
    res = supabase.table("tickets").update(updates).eq("id", ticket_id).execute()
    return res.data[0] if res.data else {}
"""

with open("backend/routers/tickets.py", "w") as f:
    f.write(tickets_router)


health_router = """from fastapi import APIRouter
from backend.schemas import HealthResponse, ReadinessResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", message="Backend system operational.")

@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check():
    from backend.database import supabase
    db_status = "ok" if supabase else "unavailable"
    return ReadinessResponse(status="ready", db_status=db_status, ai_status="ready")
"""

with open("backend/routers/health.py", "w") as f:
    f.write(health_router)

admin_router = """from fastapi import APIRouter
from backend.database import supabase

router = APIRouter(prefix="/api", tags=["Admin"])

@router.get("/profiles")
async def api_get_profiles(role: str = None, status: str = None, limit: int = 50, offset: int = 0):
    if not supabase: return []
    query = supabase.table("profiles").select("*")
    if role: query = query.eq("role", role)
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data

@router.patch("/profiles/{user_id}")
async def api_update_profile(user_id: str, updates: dict):
    if not supabase: return {}
    res = supabase.table("profiles").update(updates).eq("id", user_id).execute()
    return res.data[0] if res.data else {}

@router.delete("/profiles/{user_id}")
async def api_delete_profile(user_id: str):
    if not supabase: return {"success": False}
    supabase.table("profiles").delete().eq("id", user_id).execute()
    try:
        supabase.rpc('delete_user').execute()
    except: pass
    return {"success": True}

@router.get("/companies")
async def api_get_companies():
    if not supabase: return []
    res = supabase.table("companies").select("*").execute()
    return res.data

@router.get("/admin_requests")
async def api_get_admin_requests(status: str = None, limit: int = 50, offset: int = 0):
    if not supabase: return []
    query = supabase.table("admin_requests").select("*")
    if status: query = query.eq("status", status)
    res = query.range(offset, offset + limit - 1).execute()
    return res.data
"""
with open("backend/routers/admin.py", "w") as f:
    f.write(admin_router)

# AI Router is complex. I'll retain main.py as the holder for AI router for now to avoid breaking imports and complex logic, 
# but wrap them in an APIRouter in main.py.

