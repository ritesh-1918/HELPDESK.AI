import sys
import types
import unittest

google_module = types.ModuleType("google")
genai_module = types.ModuleType("google.genai")
genai_module.Client = object
google_module.genai = genai_module
sys.modules.setdefault("google", google_module)
sys.modules.setdefault("google.genai", genai_module)

from backend.services.gemini_service import GeminiService


class GeminiImageValidationTests(unittest.TestCase):
    def test_analyze_image_rejects_invalid_base64_without_crashing(self):
        service = GeminiService.__new__(GeminiService)
        service._initialized = True

        result = service.analyze_image("not-valid-base64!!")

        self.assertEqual(result["ocr_text"], "")
        self.assertEqual(result["detected_problem"], "")
        self.assertIn("validation", result["image_description"].lower())


if __name__ == "__main__":
    unittest.main()
