import unittest
from unittest.mock import patch, MagicMock

# Create mock objects before importing to avoid real dependencies
mock_supabase = MagicMock()
mock_gemini_service = MagicMock()

with patch.dict('sys.modules', {'backend.main': MagicMock(supabase=mock_supabase, gemini_service=mock_gemini_service)}):
    from backend.services.digest_service import get_weekly_stats, generate_ai_summary

class TestDigestService(unittest.TestCase):
    
    @patch('backend.services.digest_service.supabase', mock_supabase)
    def test_get_weekly_stats(self):
        # Mocking the supabase response
        mock_tickets_response = MagicMock()
        mock_tickets_response.data = [
            {"id": 1, "status": "resolved", "category": "Network"},
            {"id": 2, "status": "open", "category": "Network"},
            {"id": 3, "status": "resolved", "category": "Hardware", "sla_breach_at": "2026-05-28T00:00:00Z"}
        ]
        
        mock_prev_tickets_response = MagicMock()
        mock_prev_tickets_response.data = [
            {"id": 4, "status": "resolved"}
        ]
        
        # Setting up the chained method mocks for supabase query
        mock_query = MagicMock()
        mock_query.select.return_value = mock_query
        mock_query.gte.return_value = mock_query
        mock_query.lt.return_value = mock_query
        
        # Configure execute to return different values based on calls (simplified)
        mock_query.execute.side_effect = [mock_tickets_response, mock_prev_tickets_response]
        
        mock_supabase.table.return_value = mock_query
        
        stats = get_weekly_stats()
        
        self.assertEqual(stats["total_tickets"], 3)
        self.assertEqual(stats["prev_total"], 1)
        self.assertEqual(stats["percent_change"], 200.0)
        self.assertEqual(stats["resolved_count"], 2)
        self.assertEqual(stats["resolution_rate"], 66.7)
        self.assertEqual(stats["sla_breach_count"], 1)
        self.assertEqual(stats["top_categories"][0][0], "Network")
        self.assertEqual(stats["top_categories"][0][1], 2)
        
    @patch('backend.services.digest_service.gemini_service', mock_gemini_service)
    def test_generate_ai_summary(self):
        mock_gemini_service._initialized = True
        mock_gemini_service.model_name = "test-model"
        
        mock_response = MagicMock()
        mock_response.text = "This is a summary. It has three sentences. Third sentence here."
        mock_gemini_service.client.models.generate_content.return_value = mock_response
        
        stats = {"total_tickets": 10}
        summary = generate_ai_summary(stats)
        
        self.assertEqual(summary, "This is a summary. It has three sentences. Third sentence here.")
        mock_gemini_service.client.models.generate_content.assert_called_once()

if __name__ == '__main__':
    unittest.main()
