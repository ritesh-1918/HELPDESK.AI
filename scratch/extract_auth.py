import re

with open("backend/main.py", "r") as f:
    content = f.read()

# Extract from LoginBody to end of auth routes
match = re.search(r'(class LoginBody\(BaseModel\):.*?)(?=@app\.get\("/api/tickets"\))', content, re.DOTALL)
if match:
    auth_routes = match.group(1)
    # Replace @app. with @router.
    auth_routes = auth_routes.replace("@app.", "@router.")
    
    header = """from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from backend.database import supabase

router = APIRouter(tags=["Auth"])

"""
    with open("backend/routers/auth.py", "w") as f:
        f.write(header + auth_routes)
