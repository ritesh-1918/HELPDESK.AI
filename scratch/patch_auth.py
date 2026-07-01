import re

with open("backend/main.py", "r") as f:
    pass

import subprocess
res = subprocess.run(["git", "show", "HEAD:backend/main.py"], capture_output=True, text=True)
content = res.stdout

# Extract cookie constants to auth routes end
match = re.search(r'(ACCESS_COOKIE = "sb-access-token".*?)(?=@app\.get\("/api/tickets"\))', content, re.DOTALL)
if match:
    auth_routes = match.group(1)
    auth_routes = auth_routes.replace("@app.", "@router.")
    
    header = """from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel
from backend.database import supabase
from typing import Optional, Dict, Any

router = APIRouter(prefix="/auth", tags=["Auth"])

"""
    with open("backend/routers/auth.py", "w") as f:
        f.write(header + auth_routes.replace('"/auth', '"'))

