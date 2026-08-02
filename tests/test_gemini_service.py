import unittest
from unittest.mock import MagicMock, patch
from backend.services.gemini_service import GeminiService

class TestGeminiService(unittest.TestCase):
    @patch('google.genai.Client')
    def test_analyze_image_signature(self, mock_client):
        # Instantiate service with fake API key so it initializes
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'fake_key'}):
            service = GeminiService()
            self.assertTrue(service._initialized)
            
            # Mock generate_content response
            mock_response = MagicMock()
            mock_response.text = "Description: test description\nOCR: test ocr\nProblem: test problem"
            service.client.models.generate_content = MagicMock(return_value=mock_response)
            
            # 1x1 transparent GIF base64 string to avoid PIL decoding errors
            valid_base64_gif = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            
            # Test calling with one argument (base64)
            result = service.analyze_image(valid_base64_gif)
            self.assertEqual(result["image_description"], "test description")
            self.assertEqual(result["ocr_text"], "test ocr")
            self.assertEqual(result["detected_problem"], "test problem")
            
            # Test calling with two arguments (base64, context_text)
            result_with_context = service.analyze_image(valid_base64_gif, "user text context")
            self.assertEqual(result_with_context["image_description"], "test description")
            
            # Verify the generate_content was called
            self.assertEqual(service.client.models.generate_content.call_count, 2)

if __name__ == '__main__':
    unittest.main()
