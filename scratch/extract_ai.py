import re

with open("backend/main.py", "r") as f:
    content = f.read()

# Extract from first /ai route to just before @app.get("/tickets")
match = re.search(r'(@app\.post\("/ai/troubleshoot"\).*?)(?=@app\.get\("/tickets"\))', content, re.DOTALL)
if match:
    ai_routes = match.group(1)
    
    # Replace @app. with @router.
    ai_routes = ai_routes.replace("@app.", "@router.")
    
    header = """from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
import datetime
import traceback
import json
from backend.database import supabase, get_system_settings
from backend.schemas import *
from backend.services.classifier_service import ClassifierService
from backend.services.classifier_v2 import classifier_v2
from backend.services.classifier_v3 import classifier_v3
from backend.services.ner_service import NERService
from backend.services.duplicate_service import DuplicateService
from backend.services.rag_service import RagService

router = APIRouter(tags=["AI"])

# Import AI services here or pass them in
try:
    from backend.services.gemini_service import GeminiService
    gemini_service = GeminiService()
except:
    gemini_service = None

"""
    with open("backend/routers/ai.py", "w") as f:
        f.write(header + ai_routes)
