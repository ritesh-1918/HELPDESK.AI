@app.post("/ai/troubleshoot", response_model=TroubleshootResponse)
async def troubleshoot(request: TroubleshootRequest):
    """Get dynamic troubleshooting steps from Gemini."""
    if not gemini_service or not gemini_service._initialized:
        return TroubleshootResponse(
@app.post("/ai/chat", response_model=AIChatResponse)
async def ai_chat(request: AIChatRequest):
    """Raw AI chat for troubleshooting directly replacing the frontend."""
    if not gemini_service or not gemini_service._initialized:
        return AIChatResponse(response="AI Chat is currently unavailable.")
@app.post("/ai/analyze_bug", response_model=BugReportAnalysisResponse)
async def analyze_bug(request: BugReportAnalysisRequest):
    """Analyze a bug report using Gemini to generate a Probable Cause."""
    if not gemini_service or not gemini_service._initialized:
        return BugReportAnalysisResponse(
@app.post("/ai/log_correction")
async def log_correction(raw_request: Request):
    """Log an admin correction when the AI prediction differs from the human decision."""
    try:
        body = await raw_request.json()
    except Exception as e:
        print(f"[CORRECTION ERROR] Could not parse request body: {e}")
        return {"status": "error", "message": "Invalid JSON body"}
@app.post("/ai/analyze_ticket", response_model=TicketResponse)
@limiter.limit("10/minute")
async def analyze_ticket(request_body: TicketRequest, request: Request):
    """
    Main endpoint for analyzing a new ticket using the cascade of local AI models.
    """
    text = request_body.text

    settings = get_system_settings(request_body.company)
    confidence_threshold = settings["ai_confidence_threshold"]
    duplicate_sensitivity = settings["duplicate_sensitivity"]
    enable_auto_resolve = settings["enable_auto_resolve"]
    
    # Grab client metadata
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    origin_host = request.headers.get("origin", "unknown")
    
    env_metadata = {
        "ip": client_ip,
        "user_agent": user_agent,
        "origin": origin_host
    }

    # --- Layer 1: Local OCR (CPU, no API required) ---
    local_ocr_text = ""
    if request_body.image_base64 and ocr_service:
        print("[AI] Extracting text via local OCR...")
        local_ocr_text = ocr_service.extract_text(request_body.image_base64)
        if local_ocr_text:
            text = f"{text} {local_ocr_text}".strip()
            print(f"[AI] OCR added {len(local_ocr_text)} chars to context.")

    # Initalize Timeline
    return await analyze_only(request_body)
@app.post("/ai/analyze")
async def analyze_only(request_body: TicketRequest):
    """
    PERFORMANCE UPGRADE: AI Analysis phase only. 
    Does NOT persist to DB. This allows the user to review the analysis 
    and duplicate check before committing to a ticket creation.
    """
    text = request_body.text
    print(f"[AI] Starting Analysis (READ-ONLY) for: {text[:50]}...") 
    settings = get_system_settings(request_body.company)
    confidence_threshold = settings["ai_confidence_threshold"]
    duplicate_sensitivity = settings["duplicate_sensitivity"]
    enable_auto_resolve = settings["enable_auto_resolve"]
    
    # --- Context & Environment ---
    import datetime
    def get_now_ist():
        return datetime.datetime.utcnow().isoformat() + "Z"
@app.post("/ai/analyze_stream")
async def analyze_stream(request_body: TicketRequest):
    """
    REAL-TIME SSE ENDPOINT: Streams the AI progress to the frontend dynamically.
    """
    import datetime
    def get_now_ist():
        return datetime.datetime.utcnow().isoformat() + "Z"
@app.post("/ai/analyze_ticket/legacy")
async def legacy_analyze_and_save(request_body: TicketRequest):
    """
    BACKWARD COMPATIBILITY: Strictly performs analysis only. 
    Does NOT persist to DB to avoid foreign key violations.
    """
    return await analyze_only(request_body)
@app.post("/ai/analyze-v2")
async def analyze_ticket_v2(request: TicketRequest):
    text = request.text
    try:
        prediction = classifier_v2.predict(text)
        return {
