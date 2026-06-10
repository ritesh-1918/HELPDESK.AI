"""
Supabase Utilities - Common Supabase operations for HELPDESK.AI
"""

import os
import time
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from postgrest.exceptions import APIError

# Initialize Supabase client
_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """Get or create Supabase client singleton."""
    global _supabase_client
    if _supabase_client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        _supabase_client = create_client(url, key)
    return _supabase_client


def execute_with_retry(query, max_retries: int = 3):
    """Execute a Supabase database query with exponential backoff on connection errors."""
    for attempt in range(max_retries):
        try:
            return query.execute()
        except (APIError, Exception) as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)


# ==================== User Operations ====================

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a user by ID."""
    client = get_supabase_client()
    query = client.table("users").select("*").eq("id", user_id)
    response = execute_with_retry(query)
    return response.data[0] if response.data else None


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetch a user by email."""
    client = get_supabase_client()
    query = client.table("users").select("*").eq("email", email)
    response = execute_with_retry(query)
    return response.data[0] if response.data else None


async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user."""
    client = get_supabase_client()
    query = client.table("users").insert(user_data)
    response = execute_with_retry(query)
    return response.data[0] if response.data else {}


async def update_user(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update a user by ID."""
    client = get_supabase_client()
    query = client.table("users").update(updates).eq("id", user_id)
    response = execute_with_retry(query)
    return response.data[0] if response.data else {}


# ==================== Ticket Operations ====================

async def get_ticket_by_id(ticket_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a ticket by ID."""
    client = get_supabase_client()
    query = client.table("tickets").select("*").eq("id", ticket_id)
    response = execute_with_retry(query)
    return response.data[0] if response.data else None


async def get_tickets_by_user(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch tickets for a user."""
    client = get_supabase_client()
    query = client.table("tickets").select("*").eq("user_id", user_id).limit(limit)
    response = execute_with_retry(query)
    return response.data or []


async def create_ticket(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new ticket."""
    client = get_supabase_client()
    query = client.table("tickets").insert(ticket_data)
    response = execute_with_retry(query)
    return response.data[0] if response.data else {}


async def update_ticket(ticket_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update a ticket by ID."""
    client = get_supabase_client()
    query = client.table("tickets").update(updates).eq("id", ticket_id)
    response = execute_with_retry(query)
    return response.data[0] if response.data else {}


async def delete_ticket(ticket_id: str) -> bool:
    """Delete a ticket by ID."""
    client = get_supabase_client()
    query = client.table("tickets").delete().eq("id", ticket_id)
    response = execute_with_retry(query)
    return len(response.data) > 0 if response.data else False


# ==================== Company Operations ====================

async def get_company_by_id(company_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a company by ID."""
    client = get_supabase_client()
    query = client.table("companies").select("*").eq("id", company_id)
    response = execute_with_retry(query)
    return response.data[0] if response.data else None


async def get_company_settings(company_id: str) -> Optional[Dict[str, Any]]:
    """Fetch company settings."""
    client = get_supabase_client()
    query = client.table("company_settings").select("*").eq("company_id", company_id)
    response = execute_with_retry(query)
    return response.data[0] if response.data else None


# ==================== Generic Operations ====================

async def fetch_all(table: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Fetch all records from a table."""
    client = get_supabase_client()
    query = client.table(table).select("*").limit(limit)
    response = execute_with_retry(query)
    return response.data or []


async def fetch_by_field(table: str, field: str, value: Any) -> List[Dict[str, Any]]:
    """Fetch records by a specific field value."""
    client = get_supabase_client()
    query = client.table(table).select("*").eq(field, value)
    response = execute_with_retry(query)
    return response.data or []


async def insert_record(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a record into a table."""
    client = get_supabase_client()
    query = client.table(table).insert(data)
    response = execute_with_retry(query)
    return response.data[0] if response.data else {}


async def update_record(table: str, record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update a record in a table."""
    client = get_supabase_client()
    query = client.table(table).update(data).eq("id", record_id)
    response = execute_with_retry(query)
    return response.data[0] if response.data else {}


async def delete_record(table: str, record_id: str) -> bool:
    """Delete a record from a table."""
    client = get_supabase_client()
    query = client.table(table).delete().eq("id", record_id)
    response = execute_with_retry(query)
    return len(response.data) > 0 if response.data else False
