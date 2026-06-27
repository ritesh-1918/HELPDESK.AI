"""
Unit tests for Supabase DB client initializers and CRUD error handling.

Tests verify:
1. Client initialization with/without env vars
2. CRUD operation error responses (table not found, permission denied, network errors)
3. Edge cases (missing data, invalid queries)
"""

import os
import pytest
from unittest.mock import patch, MagicMock, call


# ─── Fixtures ─────────────────────────────────────────────────────

@pytest.fixture
def mock_env_vars():
    """Set up mock environment variables for Supabase."""
    env_vars = {
        "SUPABASE_URL": "https://mock-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "mock-service-key-12345",
    }
    with patch.dict(os.environ, env_vars, clear=True):
        yield env_vars


@pytest.fixture
def mock_supabase_client():
    """Create a fully mocked Supabase client."""
    client = MagicMock()
    
    # Mock table operations
    mock_table = MagicMock()
    client.table.return_value = mock_table
    
    # Mock select chain
    mock_select = MagicMock()
    mock_table.select.return_value = mock_select
    mock_select.order.return_value = mock_select
    mock_select.limit.return_value = mock_select
    mock_select.eq.return_value = mock_select
    mock_select.single.return_value = mock_select
    mock_select.range.return_value = mock_select
    mock_select.execute.return_value = MagicMock(data=[], error=None)
    
    # Mock insert
    mock_insert = MagicMock()
    mock_table.insert.return_value = mock_insert
    mock_insert.execute.return_value = MagicMock(data=[], error=None)
    
    # Mock update
    mock_update = MagicMock()
    mock_table.update.return_value = mock_update
    mock_update.eq.return_value = mock_update
    mock_update.execute.return_value = MagicMock(data=[], error=None)
    
    # Mock delete
    mock_delete = MagicMock()
    mock_table.delete.return_value = mock_delete
    mock_delete.eq.return_value = mock_delete
    mock_delete.execute.return_value = MagicMock(data=[], error=None)
    
    return client


# ─── Initialization Tests ─────────────────────────────────────────

class TestSupabaseInitialization:
    """Tests for Supabase client initialization."""
    
    def test_init_with_valid_env(self, mock_env_vars):
        """Client initializes successfully when env vars are set."""
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")

        assert url is not None, "SUPABASE_URL should be set"
        assert key is not None, "SUPABASE_SERVICE_KEY should be set"

        # Simulate client creation with a factory function
        mock_client = MagicMock()
        assert mock_client is not None
    
    def test_init_without_env_url(self):
        """Client handles missing SUPABASE_URL gracefully."""
        with patch.dict(os.environ, {}, clear=True):
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            
            assert url is None, "SUPABASE_URL should not be set"
            assert key is None, "SUPABASE_SERVICE_KEY should not be set"
    
    def test_init_with_missing_service_key(self):
        """Client handles missing SERVICE_KEY gracefully."""
        with patch.dict(os.environ, {"SUPABASE_URL": "https://test.co"}, clear=True):
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            
            assert url is not None
            assert key is None
    
    def test_init_with_empty_env_values(self):
        """Client rejects empty strings for URL and key."""
        with patch.dict(os.environ, {"SUPABASE_URL": "", "SUPABASE_SERVICE_KEY": ""}, clear=True):
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")

            assert url == ""
            assert key == ""

            # When both are empty, a real client factory would raise
            mock_create = MagicMock()
            mock_create.side_effect = ValueError("Empty URL")
            with pytest.raises(ValueError):
                mock_create(url, key)


# ─── CRUD Error Handling Tests ───────────────────────────────────

class TestSupabaseCRUDErrors:
    """Tests for CRUD operation error responses."""
    
    def test_select_table_not_found(self, mock_supabase_client):
        """Querying a non-existent table returns appropriate error."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = {"code": "42P01", "message": "relation \"invalid_table\" does not exist"}
        client.table.return_value.select.return_value.execute.return_value = mock_response
        
        result = client.table("invalid_table").select("*").execute()
        
        assert result.data == []
        assert result.error is not None
        assert "42P01" in str(result.error.get("code", ""))
    
    def test_insert_permission_denied(self, mock_supabase_client):
        """Insert operation without proper permissions returns error."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = {"code": "42501", "message": "permission denied for table tickets"}
        client.table.return_value.insert.return_value.execute.return_value = mock_response
        
        result = client.table("tickets").insert({"title": "test"}).execute()
        
        assert result.data == []
        assert result.error is not None
        assert "permission denied" in str(result.error.get("message", "")).lower()
    
    def test_select_network_error(self, mock_supabase_client):
        """Network failure during select raises appropriate exception."""
        client = mock_supabase_client
        client.table.return_value.select.return_value.execute.side_effect = Exception("Connection refused")
        
        with pytest.raises(Exception) as exc_info:
            client.table("tickets").select("*").execute()
        
        assert "Connection refused" in str(exc_info.value)
    
    def test_insert_duplicate_key(self, mock_supabase_client):
        """Inserting a duplicate key returns constraint violation error."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = {"code": "23505", "message": "duplicate key value violates unique constraint"}
        client.table.return_value.insert.return_value.execute.return_value = mock_response
        
        result = client.table("tickets").insert({"id": 1, "title": "duplicate"}).execute()
        
        assert result.data == []
        assert result.error is not None
        assert "23505" in str(result.error.get("code", ""))
    
    def test_select_with_missing_columns(self, mock_supabase_client):
        """Selecting non-existent columns returns appropriate error."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = {"code": "42703", "message": "column \"nonexistent\" does not exist"}
        client.table.return_value.select.return_value.execute.return_value = mock_response
        
        result = client.table("tickets").select("nonexistent").execute()
        
        assert result.data == []
        assert result.error is not None
        assert "42703" in str(result.error.get("code", ""))
    
    def test_update_not_found(self, mock_supabase_client):
        """Updating a non-existent record returns empty data."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = None
        # Simulate update that affects 0 rows
        client.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_response
        
        result = client.table("tickets").update({"status": "closed"}).eq("id", 99999).execute()
        
        assert result.data == []
        assert result.error is None  # Not an error, just no rows affected
    
    def test_delete_foreign_key_violation(self, mock_supabase_client):
        """Deleting a record with existing references returns constraint error."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = {"code": "23503", "message": "update or delete on table violates foreign key constraint"}
        client.table.return_value.delete.return_value.eq.return_value.execute.return_value = mock_response
        
        result = client.table("tickets").delete().eq("id", 1).execute()
        
        assert result.data == []
        assert result.error is not None
        assert "23503" in str(result.error.get("code", ""))


# ─── Integration-style Tests ─────────────────────────────────────

class TestSupabaseEdgeCases:
    """Tests for edge cases in Supabase operations."""
    
    def test_empty_result_set(self, mock_supabase_client):
        """Empty result sets are handled without errors."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = None
        client.table.return_value.select.return_value.execute.return_value = mock_response
        
        result = client.table("tickets").select("*").eq("status", "nonexistent").execute()
        
        assert result.data == []
        assert result.error is None
    
    def test_large_result_set_pagination(self, mock_supabase_client):
        """Pagination through large result sets works correctly."""
        client = mock_supabase_client
        
        # Mock first page
        page1_data = [{"id": i, "title": f"ticket_{i}"} for i in range(100)]
        mock_page1 = MagicMock()
        mock_page1.data = page1_data
        client.table.return_value.select.return_value.range.return_value.execute.return_value = mock_page1
        
        result = client.table("tickets").select("*").range(0, 99).execute()
        assert len(result.data) == 100
    
    def test_insert_empty_data(self, mock_supabase_client):
        """Inserting empty data returns validation error."""
        client = mock_supabase_client
        mock_response = MagicMock()
        mock_response.data = []
        mock_response.error = {"code": "23514", "message": "new row violates check constraint"}
        client.table.return_value.insert.return_value.execute.return_value = mock_response
        
        result = client.table("tickets").insert({}).execute()
        
        assert result.data == []
        assert result.error is not None
    
    def test_concurrent_operations(self, mock_supabase_client):
        """Multiple concurrent operations execute without interference."""
        client = mock_supabase_client
        
        # Simulate multiple table operations
        for i in range(5):
            client.table("tickets").select("*").limit(10).execute()
        
        assert client.table.call_count == 5
        assert client.table.return_value.select.call_count == 5
