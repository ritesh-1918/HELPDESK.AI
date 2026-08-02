import sys

content = """
# ---------------------------------------------------------------------------
# API Endpoints (Replacing Frontend Supabase Calls)
# ---------------------------------------------------------------------------

@app.get("/api/tickets")
async def api_get_tickets(user_id: str = None, company: str = None):
    if not supabase: return []
    query = supabase.table("tickets").select("*")
    if user_id: query = query.eq("user_id", user_id)
    if company: query = query.eq("company", company)
    res = query.order("created_at", desc=True).execute()
    return res.data

@app.patch("/api/tickets/{ticket_id}")
async def api_update_ticket(ticket_id: str, updates: dict):
    if not supabase: return {}
    res = supabase.table("tickets").update(updates).eq("id", ticket_id).execute()
    return res.data[0] if res.data else {}

@app.get("/api/profiles")
async def api_get_profiles(role: str = None, status: str = None):
    if not supabase: return []
    query = supabase.table("profiles").select("*")
    if role: query = query.eq("role", role)
    if status: query = query.eq("status", status)
    res = query.execute()
    return res.data

@app.patch("/api/profiles/{user_id}")
async def api_update_profile(user_id: str, updates: dict):
    if not supabase: return {}
    res = supabase.table("profiles").update(updates).eq("id", user_id).execute()
    return res.data[0] if res.data else {}

@app.delete("/api/profiles/{user_id}")
async def api_delete_profile(user_id: str):
    if not supabase: return {"success": False}
    supabase.table("profiles").delete().eq("id", user_id).execute()
    # also call RPC to delete user from auth
    try:
        supabase.rpc('delete_user').execute()
    except:
        pass
    return {"success": True}

@app.get("/api/companies")
async def api_get_companies():
    if not supabase: return []
    res = supabase.table("companies").select("*").execute()
    return res.data

@app.get("/api/admin_requests")
async def api_get_admin_requests(status: str = None):
    if not supabase: return []
    query = supabase.table("admin_requests").select("*")
    if status: query = query.eq("status", status)
    res = query.execute()
    return res.data

@app.post("/api/storage/upload")
async def api_upload_storage(file: UploadFile, bucket: str, path: str):
    if not supabase: return {"error": "No db"}
    content = await file.read()
    res = supabase.storage.from_(bucket).upload(path, content, {"content-type": file.content_type, "upsert": "true"})
    if hasattr(res, 'error') and res.error:
        return {"error": str(res.error)}
    public_url = supabase.storage.from_(bucket).get_public_url(path)
    return {"publicUrl": public_url}
"""

with open("backend/main.py", "a") as f:
    f.write(content)
