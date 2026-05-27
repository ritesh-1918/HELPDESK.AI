"""
Test fixtures for HELPDESK.AI backend tests.

Provides a mock Supabase client builder that can be used across test files.
"""

import pytest
from unittest.mock import MagicMock, PropertyMock


class MockResponse:
    """Mock for Supabase query response."""
    def __init__(self, data=None):
        self.data = data


class MockQueryBuilder:
    """
    Mock for the Supabase query builder chain.
    
    Supports: table().select().eq().single().limit().execute().update()
    All methods return self (fluent API) except execute().
    """

    def __init__(self, return_data=None):
        self._return_data = return_data

    def select(self, columns):
        return self

    def eq(self, column, value):
        return self

    def single(self):
        return self

    def limit(self, n):
        return self

    def execute(self):
        return MockResponse(data=self._return_data)

    def update(self, data):
        return self


class MockSupabaseClient:
    """
    Mock Supabase client.
    
    Usage:
        client = MockSupabaseClient()
        client.mock_table_data("tickets", [...])  # configure return data
        client.table("tickets").select(...).eq(...).execute()
        # returns MockResponse(data=[...])
    """

    def __init__(self):
        self._table_data = {}

    def mock_table_data(self, table_name, data):
        """Configure what a query on `table_name` should return."""
        self._table_data[table_name] = data
        return self

    def mock_clear(self):
        """Reset all mock data."""
        self._table_data.clear()
        return self

    def table(self, name):
        return MockQueryBuilder(return_data=self._table_data.get(name))


@pytest.fixture
def mock_supabase():
    """Fixture that patches supabase.create_client and returns a MockSupabaseClient."""
    import sys
    from unittest.mock import patch

    client = MockSupabaseClient()

    # Patch the supabase module at import level
    patcher = patch.dict(sys.modules, {
        "supabase": MagicMock(),
    })
    patcher.start()

    # Make supabase.create_client return our mock client
    import supabase
    supabase.create_client.return_value = client

    yield client

    patcher.stop()
