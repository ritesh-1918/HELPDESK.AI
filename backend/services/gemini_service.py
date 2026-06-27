import os
import base64
import io
import re
from PIL import Image
from google import genai
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from backend/.env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self._initialized = False
        self.model_name = 'gemini-2.5-flash'
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self._initialized = True
                print(f"[GeminiService] Connected to Google GenAI API (Model: {self.model_name})")
            except Exception as e:
                print(f"[GeminiService] Initialization Error: {e}")
        else:
            print("[GeminiService] WARNING: GEMINI_API_KEY not found in environment.")

    def analyze_image(self, image_base64: str) -> dict:
        """
        Perform OCR and image analysis using Gemini logic.
        """
        if not self._initialized:
            return {
                "image_description": "[Gemini API Key Missing] Could not analyze image.",
                "ocr_text": "",
                "detected_problem": ""
            }

        try:
            # Decode base64 image (actually the new SDK handles base64 easily if we just pass bytes, 
            # but we can also use PIL if we need to process it)
            image_bytes = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(image_bytes))

            prompt = (
                "Analyze this screenshot from a user reporting a technical issue. "
                "1. Provide a concise description of what is shown in the image. "
                "2. Perform OCR and extract any error messages or key text. "
                "3. Identify the main technical problem depicted. "
                "Return the result in the following format: "
                "Description: <description>\n"
                "OCR: <text>\n"
                "Problem: <problem>"
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt, img]
            )
            text_response = response.text

            description_match = re.search(r"(?:Description|1\.)\s*[:\-]?\s*(.*)", text_response, re.IGNORECASE)
            ocr_match = re.search(r"(?:OCR|2\.)\s*[:\-]?\s*(.*)", text_response, re.IGNORECASE)
            problem_match = re.search(r"(?:Problem|3\.)\s*[:\-]?\s*(.*)", text_response, re.IGNORECASE)

            return {
                "image_description": description_match.group(1).strip() if description_match else text_response[:500],
                "ocr_text": ocr_match.group(1).strip() if ocr_match else "",
                "detected_problem": problem_match.group(1).strip() if problem_match else ""
            }

        except Exception as e:
            print(f"[GeminiService] Image Analysis Error: {e}")
            return {
                "image_description": f"Error analyzing image: {str(e)}",
                "ocr_text": "",
                "detected_problem": ""
            }

    def get_summary(self, ticket_text: str) -> str:
        """
        Generate a concise, one-line summary of the ticket text.
        """
        if not self._initialized:
            return ticket_text[:100] + ("…" if len(ticket_text) > 100 else "")

        try:
            prompt = (
                "You are an expert IT triage specialized in extreme brevity. "
                "Summarize the following IT support ticket into exactly ONE concise, hard-hitting line (max 15 words) "
                "that captures the technical essence. NO intro, NO filler, just the core problem headline. "
                f"Ticket: '{ticket_text}'"
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip().replace("\n", " ")
        except Exception as e:
            print(f"[GeminiService] Summarization Error: {e}")
            return ticket_text[:100] + ("…" if len(ticket_text) > 100 else "")

    def get_reasoning(self, ticket_text: str, category: str, team: str) -> dict:
        """
        Get a deeper AI explanation and key takeaways for the ticket.
        """
        if not self._initialized:
            return {"reasoning": "", "highlights": []}

        try:
            prompt = (
                f"Analyze this IT support ticket: '{ticket_text}'\n"
                f"It was categorized as '{category}' and routed to '{team}'.\n\n"
                "Please provide:\n"
                "1. Reasoning: A professional explanation of why this category/team was chosen (max 2 sentences).\n"
                "2. Highlights: 2-3 key technical points or symptoms mentioned in the ticket (short bullets).\n"
                "\nFormat the output strictly as:\n"
                "REASONING: <text>\n"
                "HIGHLIGHTS: <point1> | <point2> | <point3>"
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            text_response = response.text.strip()

            reasoning_match = re.search(r"REASONING:\s*(.*)", text_response, re.IGNORECASE)
            highlights_match = re.search(r"HIGHLIGHTS:\s*(.*)", text_response, re.IGNORECASE)

            reasoning = reasoning_match.group(1).strip() if reasoning_match else ""
            highlights_raw = highlights_match.group(1).strip() if highlights_match else ""
            highlights = [h.strip() for h in highlights_raw.split("|") if h.strip()]

            return {
                "reasoning": reasoning,
                "highlights": highlights
            }
        except Exception as e:
            print(f"[GeminiService] Reasoning Error: {e}")
            return {"reasoning": "", "highlights": []}

    def get_troubleshooting_step(self, ticket_text: str, history: list[dict], category: str) -> dict:
        """
        Get the next troubleshooting step from Gemini based on conversation history.
        """
        if not self._initialized:
            return {
                "step_text": "AI Troubleshooting is currently unavailable.",
                "options": ["Try again later"],
                "is_final": True
            }

        try:
            history_str = ""
            for msg in history:
                role = "User" if msg["role"] == "user" else "AI"
                history_str += f"{role}: {msg['text']}\n"

            prompt = (
                f"You are an expert IT support assistant. A user is reporting this issue: '{ticket_text}' (Category: {category}).\n\n"
                f"Previous conversation:\n{history_str}\n"
                "Provide the NEXT troubleshooting step. Follow these rules:\n"
                "1. If the issue seems resolved based on history, or if you've exhausted basic steps, set is_final: True.\n"
                "2. Provide exactly 2-3 short, actionable user options (e.g., 'Yes, I did that', 'I need help').\n"
                "3. Keep the bot message concise and professional.\n\n"
                "Format your response EXACTLY like this:\n"
                "STEP: <the instructions for the user>\n"
                "OPTIONS: <option1> | <option2> | <option3>\n"
                "FINAL: <True/False>"
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            text_response = response.text.strip()

            step_match = re.search(r"STEP:\s*(.*)", text_response, re.IGNORECASE)
            options_match = re.search(r"OPTIONS:\s*(.*)", text_response, re.IGNORECASE)
            final_match = re.search(r"FINAL:\s*(True|False)", text_response, re.IGNORECASE)

            return {
                "step_text": step_match.group(1).strip() if step_match else "Let's try checking your settings.",
                "options": [o.strip() for o in (options_match.group(1).strip() if options_match else "Done | Stuck").split("|") if o.strip()],
                "is_final": final_match.group(1).lower() == "true" if final_match else False
            }
        except Exception as e:
            print(f"[GeminiService] Troubleshooting Error: {e}")
            return {
                "step_text": "I encountered an error. Let's try one more basic check.",
                "options": ["Okay", "Skip to agent"],
                "is_final": False
            }

    def analyze_bug_report(self, bug_title: str, description: str, steps: str, errors: list) -> str:
        """
        Analyze a bug report and captured console errors to generate a Probable Cause.
        """
        if not self._initialized:
            return "AI Diagnostics unavailable (API key missing or disconnected)."

        try:
            errors_schema = "\n".join([f"- {err}" for err in errors]) if errors else "None captured."
            prompt = (
                f"You are a Level 3 Senior System Engineer diagnosing a bug report.\n"
                f"Title: {bug_title}\n"
                f"Description: {description}\n"
                f"Steps to reproduce: {steps}\n"
                f"Captured Console/Network Errors: \n{errors_schema}\n\n"
                f"Steps to reproduce: {steps}\n"
                f"Captured Console/Network Errors: \n{errors_schema}\n\n"
                f"Based on this exact telemetry and report, provide a concise 'Probable Root Cause' (1-3 sentences maximum). "
                f"Focus purely on technical inference and what the developer should investigate first. "
                f"Do not include pleasantries. Do not say 'The probable cause is', just state the technical theory."
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"[GeminiService] Bug Analysis Error: {e}")
            return f"Diagnostic analysis failed: {str(e)}"

    def generate_rca_hypotheses(self, ticket_text: str, log_telemetry: list, dependencies: dict) -> list:
        """
        Generate 3-5 ranked root-cause hypotheses based on ticket, logs, and dependencies.
        Includes a rule-based fallback if the API is offline.
        """
        if not self._initialized:
            return self._fallback_rca_hypotheses(ticket_text, log_telemetry, dependencies)

        try:
            logs_str = json.dumps(log_telemetry, indent=2)
            dep_str = json.dumps(dependencies, indent=2)
            prompt = (
                f"You are a Level 3 Operations & Root Cause Analysis specialist.\n"
                f"Incident Ticket: {ticket_text}\n"
                f"Correlated Log Telemetry:\n{logs_str}\n"
                f"System Dependency Context:\n{dep_str}\n\n"
                f"Generate 3 to 5 ranked root-cause hypotheses for this incident.\n"
                f"For each hypothesis, return:\n"
                f"1. hypothesis: Concise name of the root cause.\n"
                f"2. confidence: Number between 0.0 and 1.0.\n"
                f"3. evidence: List of evidence names, e.g. ['Log Correlation', 'Dependency Match', 'Historical Similarity'].\n"
                f"4. explanation: Professional technical description of why this is a likely cause.\n\n"
                f"Output strictly as a valid JSON list. Example:\n"
                f"[\n"
                f"  {{\n"
                f"    \"hypothesis\": \"Database Connection Pool Exhaustion\",\n"
                f"    \"confidence\": 0.91,\n"
                f"    \"evidence\": [\"Log Correlation\", \"Dependency Match\"],\n"
                f"    \"explanation\": \"Database logs show max connection limits reached coincident with the CRM authentication timeout.\"\n"
                f"  }}\n"
                f"]"
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            # Clean response text from markdown code blocks
            clean_text = response.text.strip()
            if clean_text.startswith("```"):
                # Remove code blocks
                clean_text = re.sub(r"^```(?:json)?\n|```$", "", clean_text, flags=re.MULTILINE).strip()
                
            result = json.loads(clean_text)
            if isinstance(result, list):
                return result
                
            return self._fallback_rca_hypotheses(ticket_text, log_telemetry, dependencies)
        except Exception as e:
            print(f"[GeminiService] RCA Hypothesis Generation Error: {e}")
            return self._fallback_rca_hypotheses(ticket_text, log_telemetry, dependencies)

    def _fallback_rca_hypotheses(self, ticket_text: str, log_telemetry: list, dependencies: dict) -> list:
        """Rule-based fallback for RCA hypotheses."""
        text_lower = ticket_text.lower()
        hypotheses = []

        # Find logs with error/critical
        err_logs = [l for l in log_telemetry if l.get("level") in ["ERROR", "CRITICAL"]]
        has_db_log = any("db" in l.get("source", "").lower() or "database" in l.get("message", "").lower() for l in err_logs)
        has_auth_log = any("auth" in l.get("source", "").lower() or "authenticate" in l.get("message", "").lower() for l in err_logs)
        has_network_log = any("unreachable" in l.get("message", "").lower() or "timeout" in l.get("message", "").lower() for l in err_logs)

        # 1. Check database connectivity
        if has_db_log or "db" in text_lower or "database" in text_lower or "mysql" in text_lower:
            hypotheses.append({
                "hypothesis": "Database Cluster Access Failure",
                "confidence": 0.89 if has_db_log else 0.75,
                "evidence": ["Log Correlation", "Dependency Match"] if has_db_log else ["Symptom Matching"],
                "explanation": "Timeout or query execution failure detected on the production database instances."
            })

        # 2. Check Auth service
        if has_auth_log or "auth" in text_lower or "login" in text_lower or "permission" in text_lower:
            hypotheses.append({
                "hypothesis": "Authentication Service Degraded",
                "confidence": 0.82 if has_auth_log else 0.70,
                "evidence": ["Log Correlation", "Historical Pattern"] if has_auth_log else ["Symptom Matching"],
                "explanation": "Downstream authentication service timeout preventing session creation for active clients."
            })

        # 3. Check Network / Timeout
        if has_network_log or "timeout" in text_lower or "network" in text_lower or "slow" in text_lower:
            hypotheses.append({
                "hypothesis": "Network Switch Misconfiguration",
                "confidence": 0.76 if has_network_log else 0.65,
                "evidence": ["Log Correlation", "Dependency Match"] if has_network_log else ["Symptom Matching"],
                "explanation": "High packet loss or switch configuration mismatch resulting in peer connectivity drops."
            })

        # 4. Check Printer (Common hardware issue)
        if "printer" in text_lower or "printing" in text_lower:
            hypotheses.append({
                "hypothesis": "Print Server Spooler Crash",
                "confidence": 0.90,
                "evidence": ["Symptom Matching", "Historical Pattern"],
                "explanation": "The local print queue host spooler service crashed due to out-of-memory driver errors."
            })

        # Default fallback if empty
        if not hypotheses:
            hypotheses.append({
                "hypothesis": "General System Dependency Failure",
                "confidence": 0.60,
                "evidence": ["Symptom Matching"],
                "explanation": "System resources or a third-party API service degradation is causing transactional timeouts."
            })

        return hypotheses

