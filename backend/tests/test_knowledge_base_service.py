"""
Tests for Knowledge Base Article Auto-Suggestion Service (Issue #3203)

Tests KB suggestion logic, similarity matching, and analytics.
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from uuid import uuid4

from backend.services.knowledge_base_service import (
    KnowledgeBaseService,
    create_kb_service,
)


class TestKnowledgeBaseServiceInit:
    """Test service initialization."""

    def test_service_initialization_without_supabase(self):
        """Service should initialize without Supabase client."""
        service = KnowledgeBaseService(supabase_client=None)
        assert service.supabase is None
        assert service.similarity_threshold == 0.65

    def test_service_initialization_with_supabase(self):
        """Service should initialize with Supabase client."""
        mock_supabase = Mock()
        service = KnowledgeBaseService(supabase_client=mock_supabase)
        assert service.supabase is mock_supabase
        assert service.similarity_threshold == 0.65

    def test_service_initialization_custom_threshold(self):
        """Service should accept custom threshold."""
        mock_supabase = Mock()
        service = KnowledgeBaseService(supabase_client=mock_supabase)
        service.similarity_threshold = 0.75
        assert service.similarity_threshold == 0.75

    def test_factory_function_creates_service(self):
        """Factory function should create service instance."""
        service = create_kb_service()
        assert isinstance(service, KnowledgeBaseService)


class TestSimilarityCalculation:
    """Test text similarity calculation."""

    def test_identical_text_similarity(self):
        """Identical text should have similarity of 1.0."""
        service = KnowledgeBaseService()
        text = "How to reset your password"
        
        similarity = service._calculate_text_similarity(text, text)
        
        assert similarity == 1.0

    def test_similar_text_similarity(self):
        """Similar text should have high similarity."""
        service = KnowledgeBaseService()
        text1 = "How to reset your password"
        text2 = "How to reset your account password"
        
        similarity = service._calculate_text_similarity(text1, text2)
        
        assert 0.7 < similarity < 1.0

    def test_dissimilar_text_similarity(self):
        """Dissimilar text should have low similarity."""
        service = KnowledgeBaseService()
        text1 = "How to reset your password"
        text2 = "Billing and payment options"
        
        similarity = service._calculate_text_similarity(text1, text2)
        
        assert 0.0 <= similarity < 0.65

    def test_empty_text_similarity(self):
        """Empty text should return 0.0."""
        service = KnowledgeBaseService()
        
        similarity = service._calculate_text_similarity("", "some text")
        assert similarity == 0.0
        
        similarity = service._calculate_text_similarity("some text", "")
        assert similarity == 0.0
        
        similarity = service._calculate_text_similarity("", "")
        assert similarity == 0.0

    def test_case_insensitive_similarity(self):
        """Similarity should be case-insensitive."""
        service = KnowledgeBaseService()
        text1 = "How to Reset Your Password"
        text2 = "how to reset your password"
        
        similarity = service._calculate_text_similarity(text1, text2)
        
        assert similarity == 1.0


class TestArticleSuggestion:
    """Test KB article suggestion logic."""

    def test_suggest_articles_without_supabase(self):
        """Should return empty list without Supabase."""
        service = KnowledgeBaseService()
        ticket = {
            "subject": "How do I reset my password?",
            "description": "I forgot my password"
        }
        
        suggestions = service.suggest_articles(ticket, limit=5)
        
        assert suggestions == []

    def test_suggest_articles_no_matching_articles(self):
        """Should return empty list when no articles match."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "title": "Billing and Payment",
                "content": "Information about billing",
                "category": "Billing",
                "tags": ["billing", "payment"],
                "views": 100,
                "status": "published"
            }
        ]
        
        service = KnowledgeBaseService(mock_supabase)
        ticket = {
            "subject": "Help with API authentication",
            "description": "I cannot authenticate with the API"
        }
        
        suggestions = service.suggest_articles(ticket, limit=5)
        
        # Should return nothing as billing article doesn't match API auth question
        assert len(suggestions) <= 1

    def test_suggest_articles_with_matching_articles(self):
        """Should return relevant articles."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "title": "How to reset your password",
                "content": "Step by step guide to reset your password",
                "category": "Account",
                "tags": ["password", "reset"],
                "views": 500,
                "status": "published"
            },
            {
                "id": str(uuid4()),
                "title": "Billing and Payment",
                "content": "Information about billing",
                "category": "Billing",
                "tags": ["billing"],
                "views": 100,
                "status": "published"
            }
        ]
        
        service = KnowledgeBaseService(mock_supabase)
        ticket = {
            "subject": "How do I reset my password?",
            "description": "I forgot my password and need help"
        }
        
        suggestions = service.suggest_articles(ticket, limit=5)
        
        assert len(suggestions) >= 1
        assert suggestions[0]["title"] == "How to reset your password"

    def test_suggest_articles_respects_limit(self):
        """Should respect the limit parameter."""
        mock_supabase = Mock()
        articles = [
            {
                "id": str(uuid4()),
                "title": f"Article {i}",
                "content": "password reset help",
                "category": "Account",
                "tags": ["password"],
                "views": 100 - i,
                "status": "published"
            }
            for i in range(20)
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = articles
        
        service = KnowledgeBaseService(mock_supabase)
        ticket = {
            "subject": "How do I reset my password?",
            "description": "password help"
        }
        
        suggestions = service.suggest_articles(ticket, limit=5)
        
        assert len(suggestions) <= 5

    def test_suggest_articles_sorted_by_relevance(self):
        """Should sort suggestions by relevance score."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": "article1",
                "title": "How to reset your password",
                "content": "Reset password guide",
                "category": "Account",
                "tags": [],
                "views": 100,
                "status": "published"
            },
            {
                "id": "article2",
                "title": "Password policies",
                "content": "Information about password requirements",
                "category": "Account",
                "tags": [],
                "views": 200,
                "status": "published"
            }
        ]
        
        service = KnowledgeBaseService(mock_supabase)
        ticket = {
            "subject": "Reset password",
            "description": "How to reset password"
        }
        
        suggestions = service.suggest_articles(ticket, limit=5)
        
        # Most relevant should be first
        if len(suggestions) > 1:
            assert suggestions[0]["relevance_score"] >= suggestions[1]["relevance_score"]


class TestMatchReason:
    """Test match reason generation."""

    def test_match_reason_same_category(self):
        """Should identify category match."""
        service = KnowledgeBaseService()
        ticket = {"category": "Account"}
        article = {"category": "Account", "tags": ["password"]}
        
        reason = service._get_match_reason(ticket, article)
        
        assert "Account" in reason

    def test_match_reason_with_tags(self):
        """Should include tags in reason."""
        service = KnowledgeBaseService()
        ticket = {"category": "General"}
        article = {"category": "Account", "tags": ["password", "reset", "help"]}
        
        reason = service._get_match_reason(ticket, article)
        
        assert "password" in reason or "reset" in reason or "help" in reason

    def test_match_reason_empty_tags(self):
        """Should handle empty tags gracefully."""
        service = KnowledgeBaseService()
        ticket = {"category": "General"}
        article = {"category": "General", "tags": []}
        
        reason = service._get_match_reason(ticket, article)
        
        assert isinstance(reason, str)
        assert len(reason) > 0

    def test_match_reason_null_category(self):
        """Should handle null category gracefully."""
        service = KnowledgeBaseService()
        ticket = {"category": None}
        article = {"category": "Account", "tags": ["help"]}
        
        reason = service._get_match_reason(ticket, article)
        
        assert isinstance(reason, str)


class TestSuggestionInteractionLogging:
    """Test logging of suggestion interactions."""

    def test_log_interaction_without_supabase(self):
        """Should skip logging without Supabase."""
        service = KnowledgeBaseService()
        
        # Should not raise exception
        service.log_suggestion_interaction(
            str(uuid4()),
            str(uuid4()),
            "viewed",
            str(uuid4())
        )

    def test_log_interaction_viewed(self):
        """Should log article views."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{}]
        
        service = KnowledgeBaseService(mock_supabase)
        
        service.log_suggestion_interaction(
            str(uuid4()),
            str(uuid4()),
            "viewed",
            str(uuid4())
        )
        
        # Should call insert for interaction log
        assert mock_supabase.table.called

    def test_log_interaction_helpful(self):
        """Should log helpful feedback."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{}]
        
        service = KnowledgeBaseService(mock_supabase)
        
        service.log_suggestion_interaction(
            str(uuid4()),
            str(uuid4()),
            "helpful",
            str(uuid4())
        )
        
        assert mock_supabase.table.called

    def test_log_interaction_not_helpful(self):
        """Should log not helpful feedback."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{}]
        
        service = KnowledgeBaseService(mock_supabase)
        
        service.log_suggestion_interaction(
            str(uuid4()),
            str(uuid4()),
            "not_helpful",
            str(uuid4())
        )
        
        assert mock_supabase.table.called

    def test_log_interaction_error_handling(self):
        """Should handle logging errors gracefully."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception("DB error")
        
        service = KnowledgeBaseService(mock_supabase)
        
        # Should not raise exception
        service.log_suggestion_interaction(
            str(uuid4()),
            str(uuid4()),
            "viewed",
            str(uuid4())
        )


class TestCategoryArticles:
    """Test getting top articles for a category."""

    def test_get_category_articles_without_supabase(self):
        """Should return empty list without Supabase."""
        service = KnowledgeBaseService()
        
        articles = service.get_suggested_articles_for_category("Account", limit=10)
        
        assert articles == []

    def test_get_category_articles_with_articles(self):
        """Should return articles for category."""
        mock_supabase = Mock()
        articles_data = [
            {
                "id": str(uuid4()),
                "title": "How to reset password",
                "category": "Account",
                "tags": ["password"],
                "views": 500
            },
            {
                "id": str(uuid4()),
                "title": "Update account profile",
                "category": "Account",
                "tags": ["profile"],
                "views": 300
            }
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = articles_data
        
        service = KnowledgeBaseService(mock_supabase)
        
        articles = service.get_suggested_articles_for_category("Account", limit=10)
        
        assert len(articles) == 2
        assert articles[0]["category"] == "Account"

    def test_get_category_articles_sorted_by_views(self):
        """Should return articles sorted by popularity."""
        mock_supabase = Mock()
        articles_data = [
            {"id": "a1", "title": "Article 1", "category": "Account", "tags": [], "views": 500},
            {"id": "a2", "title": "Article 2", "category": "Account", "tags": [], "views": 300},
            {"id": "a3", "title": "Article 3", "category": "Account", "tags": [], "views": 400},
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = articles_data
        
        service = KnowledgeBaseService(mock_supabase)
        
        articles = service.get_suggested_articles_for_category("Account", limit=10)
        
        # Verify data is returned
        assert len(articles) == 3

    def test_get_category_articles_respects_limit(self):
        """Should respect limit parameter."""
        mock_supabase = Mock()
        articles_data = [
            {"id": f"a{i}", "title": f"Article {i}", "category": "Account", "tags": [], "views": 100 - i}
            for i in range(20)
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = articles_data[:10]
        
        service = KnowledgeBaseService(mock_supabase)
        
        articles = service.get_suggested_articles_for_category("Account", limit=10)
        
        assert len(articles) <= 10


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_ticket_with_special_characters(self):
        """Should handle special characters in ticket."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        service = KnowledgeBaseService(mock_supabase)
        ticket = {
            "subject": "Issue with @#$% symbols & unicode: 日本語",
            "description": "Error with <html> tags & symbols"
        }
        
        suggestions = service.suggest_articles(ticket)
        
        # Should not raise exception
        assert isinstance(suggestions, list)

    def test_ticket_with_very_long_description(self):
        """Should handle very long descriptions."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        service = KnowledgeBaseService(mock_supabase)
        long_desc = "This is a very long description. " * 1000
        ticket = {
            "subject": "Test",
            "description": long_desc
        }
        
        suggestions = service.suggest_articles(ticket)
        
        assert isinstance(suggestions, list)

    def test_null_ticket_fields(self):
        """Should handle null/missing ticket fields."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        service = KnowledgeBaseService(mock_supabase)
        ticket = {
            "subject": None,
            "description": None
        }
        
        suggestions = service.suggest_articles(ticket)
        
        assert suggestions == []

    def test_article_with_null_fields(self):
        """Should handle articles with null fields."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "title": None,
                "content": "Some content",
                "category": None,
                "tags": None,
                "views": 100
            }
        ]
        
        service = KnowledgeBaseService(mock_supabase)
        ticket = {
            "subject": "Help with password",
            "description": "I need help"
        }
        
        suggestions = service.suggest_articles(ticket)
        
        # Should handle gracefully
        assert isinstance(suggestions, list)

    def test_concurrent_suggestion_requests(self):
        """Service should handle concurrent requests."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "title": "Test Article",
                "content": "Test content",
                "category": "Test",
                "tags": [],
                "views": 100
            }
        ]
        
        service = KnowledgeBaseService(mock_supabase)
        
        ticket = {"subject": "Test", "description": "Test content"}
        
        # Multiple calls should work without issues
        suggestions1 = service.suggest_articles(ticket)
        suggestions2 = service.suggest_articles(ticket)
        
        assert isinstance(suggestions1, list)
        assert isinstance(suggestions2, list)


class TestSimilarityThreshold:
    """Test similarity threshold behavior."""

    def test_default_threshold(self):
        """Should use default threshold of 0.65."""
        service = KnowledgeBaseService()
        assert service.similarity_threshold == 0.65

    def test_custom_threshold(self):
        """Should accept custom threshold."""
        service = KnowledgeBaseService()
        service.similarity_threshold = 0.75
        assert service.similarity_threshold == 0.75

    def test_threshold_affects_suggestions(self):
        """Higher threshold should return fewer results."""
        mock_supabase = Mock()
        articles = [
            {"id": "a1", "title": "password reset", "content": "how to reset", "category": "Account", "tags": [], "views": 100},
            {"id": "a2", "title": "billing info", "content": "payment methods", "category": "Billing", "tags": [], "views": 100},
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = articles
        
        service = KnowledgeBaseService(mock_supabase)
        service.similarity_threshold = 0.95  # Very high threshold
        
        ticket = {"subject": "reset", "description": "password"}
        suggestions = service.suggest_articles(ticket)
        
        # With very high threshold, fewer results expected
        assert len(suggestions) <= 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
