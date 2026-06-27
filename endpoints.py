from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Ticket(BaseModel):
    title: str
    description: str

@router.post("/tickets")
async def create_ticket(ticket: Ticket):
    """
    Create a new ticket.

    Args:
    - ticket (Ticket): The ticket to create.

    Returns:
    - The created ticket.
    """
    # ... existing code ...

@router.get("/tickets")
async def get_tickets():
    """
    Get all tickets.

    Returns:
    - A list of tickets.
    """
    # ... existing code ...