import os
import base64
import binascii
import io
import re
import asyncio
import time
from PIL import Image
from google import genai
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from backend/.env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

def retry_with_backoff(max_retries=3, initial_delay=1, max_delay=10):
    """Decorator for retry logic with exponential backoff."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            retries = 0
            delay = initial_delay
            
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except (TimeoutError, Exception) as e:
                    retries += 1
                    if retries >= max_retries:
                        raise
                    
                    # Only retry on specific errors (timeout, rate limit, transient)
                    error_str = str(e).lower()
                    if any(x in error_str for x in ["timeout", "deadline", "rate limit", "503", "429"]):
                        print(f"[GeminiService] Retry {retries}/{max_retries} after {delay}s delay ({error_str[:50]})")
                        time.sleep(delay)
                        delay = min(delay * 2, max_delay)  # Exponential backoff
                    else:
                        raise
            
        return wrapper
    return decorator

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self._initialized = False
        self.model_name = 'gemini-2.5-flash'
        self.timeout = int(os.getenv("GEMINI_API_TIMEOUT", "30"))  # 30 second default timeout
        self.max_retries = int(os.getenv("GEMINI_MAX_RETRIES", "3"))
        self.max_image_bytes = int(os.getenv("GEMINI_MAX_IMAGE_BYTES", "10485760"))
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self._initialized = True
                print(f"[GeminiService] Connected to Google GenAI API (Model: {self.model_name}, Timeout: {self.timeout}s, Retries: {self.max_retries})")
            except Exception as e:
                print(f"[GeminiService] Initialization Error: {e}")
        else:
            print("[GeminiService] WARNING: GEMINI_API_KEY not found in environment.")

    async def _call_with_timeout(self, coro, timeout_sec=None):
        """Wrap API call with timeout protection."""
        timeout_sec = timeout_sec or self.timeout
        try:
            return await asyncio.wait_for(asyncio.create_task(self._async_wrapper(coro)), timeout=timeout_sec)
        except asyncio.TimeoutError:
            raise TimeoutError(f"Gemini API request exceeded {timeout_sec}s timeout")

    async def _async_wrapper(self, coro):
        """Convert sync function to async."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: coro)

    def analyze_image(self, image_base64: str) -> dict:
        """
        Perform OCR and image analysis using Gemini logic with timeout protection.
        """
        max_image_bytes = getattr(self, "max_image_bytes", 10 * 1024 * 1024)

        if not self._initialized:
            return {
                "image_description": "[Gemini API Key Missing] Could not analyze image.",
                "ocr_text": "",
                "detected_problem": ""
            }

        try:
            if not image_base64:
                raise ValueError("empty image payload")

            payload = image_base64.strip()
            if "," in payload:
                payload = payload.split(",", 1)[1].strip()

            if len(payload) > max_image_bytes:
                raise ValueError("image payload too large")

            if not re.fullmatch(r"[A-Za-z0-9+/=]+", payload):
                raise ValueError("image payload contains invalid base64 characters")

            image_bytes = base64.b64decode(payload, validate=True)
            if len(image_bytes) > max_image_bytes:
                raise ValueError("decoded image exceeds size limit")

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

            # Wrap with timeout
            response = self._timeout_call(
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=[prompt, img]
                )
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

        except (binascii.Error, ValueError) as e:
            print(f"[GeminiService] Image Validation Error: {e}")
            return {
                "image_description": f"Image validation failed: {str(e)}",
                "ocr_text": "",
                "detected_problem": ""
            }
        except TimeoutError as e:
            print(f"[GeminiService] Image Analysis Timeout: {e}")
            return {
                "image_description": "Image analysis timed out",
                "ocr_text": "",
                "detected_problem": ""
            }
        except Exception as e:
            print(f"[GeminiService] Image Analysis Error: {e}")
            return {
                "image_description": f"Error analyzing image: {str(e)}",
                "ocr_text": "",
                "detected_problem": ""
            }

    def _timeout_call(self, func, timeout_sec=None):
        """Execute function with timeout using threading, with retry logic."""
        import threading
        timeout_sec = timeout_sec or self.timeout
        
        @retry_with_backoff(max_retries=self.max_retries, initial_delay=1, max_delay=10)
        def call_with_retry():
            result = [None]
            exception = [None]
            
            def target():
                try:
                    result[0] = func()
                except Exception as e:
                    exception[0] = e
            
            thread = threading.Thread(target=target, daemon=True)
            thread.start()
            thread.join(timeout=timeout_sec)
            
            if thread.is_alive():
                raise TimeoutError(f"API call exceeded {timeout_sec}s timeout")
            if exception[0]:
                raise exception[0]
            return result[0]
        
        return call_with_retry()

    def get_summary(self, ticket_text: str) -> str:
        """
        Generate a concise, one-line summary of the ticket text with timeout.
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
            response = self._timeout_call(
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            )
            return response.text.strip().replace("\n", " ")
        except TimeoutError as e:
            print(f"[GeminiService] Summarization Timeout: {e}")
            return ticket_text[:100] + ("…" if len(ticket_text) > 100 else "")
        except Exception as e:
            print(f"[GeminiService] Summarization Error: {e}")
            return ticket_text[:100] + ("…" if len(ticket_text) > 100 else "")

    def get_reasoning(self, ticket_text: str, category: str, team: str) -> dict:
        """
        Get a deeper AI explanation and key takeaways for the ticket with timeout.
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
            response = self._timeout_call(
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
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
        except TimeoutError as e:
            print(f"[GeminiService] Reasoning Timeout: {e}")
            return {"reasoning": "", "highlights": []}
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
                "Based on this exact telemetry and report, provide a concise 'Probable Root Cause' (1-3 sentences maximum). "
                "Focus purely on technical inference and what the developer should investigate first. "
                "Do not include pleasantries. Do not say 'The probable cause is', just state the technical theory."
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"[GeminiService] Bug Analysis Error: {e}")
            return f"Diagnostic analysis failed: {str(e)}"
