from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from backend.digest_service import get_weekly_stats, generate_ai_summary, send_digest_email

router = APIRouter(prefix="/api/digest", tags=["digest"])


class DigestRequest(BaseModel):
    company_id: str
    admin_email: str
    company_name: str


@router.post("/send-now")
async def send_digest_now(req: DigestRequest):
    """Manually trigger a digest email — for testing or admin use."""
    try:
        # Get Gemini model (reuse however your project imports it)
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-pro")

        stats = get_weekly_stats(req.company_id)
        ai_summary = generate_ai_summary(stats, model)
        result = send_digest_email(req.admin_email, req.company_name, stats, ai_summary)

        return {
            "success": True,
            "message": f"Digest sent to {req.admin_email}",
            "stats": stats,
            "email_id": result.get("id"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preview/{company_id}")
async def preview_stats(company_id: str):
    """Preview this week's stats without sending email."""
    try:
        stats = get_weekly_stats(company_id)
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))