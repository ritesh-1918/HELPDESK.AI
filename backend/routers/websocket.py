"""
WebSocket Router for Real-Time Communication

Provides WebSocket endpoints for real-time ticket updates and live chat.
"""

import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from fastapi.responses import JSONResponse

from backend.services.websocket_manager import manager
from backend.auth.tenant_middleware import security_manager
from backend.database import supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


async def get_websocket_user(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token")
) -> dict:
    """Authenticate WebSocket connection using query parameter token."""
    try:
        # Check for mock auth (testing)
        import os
        mock_enabled = os.getenv("MOCK_AUTH_ENABLED", "false").lower() == "true"
        if mock_enabled and token.startswith("mock-token-"):
            parts = token.split("-")
            company_id = parts[2] if len(parts) > 2 else "company-mock-default"
            role = parts[3] if len(parts) > 3 else "user"
            user_id = parts[4] if len(parts) > 4 else f"user-{company_id}-{role}"
            logger.warning(f"Mock WebSocket auth — user={user_id} company={company_id}")
            return {"id": user_id, "company_id": company_id, "role": role, "name": f"User {user_id}"}
        
        # Validate token against Supabase
        if not supabase:
            raise Exception("Database not initialized")
        
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("Invalid token")
        
        # Get user profile
        user = user_res.user
        profile = security_manager.resolve_user_profile(user.id)
        if not profile:
            raise Exception("User profile not found")
        
        return profile
        
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        raise HTTPException(status_code=401, detail="Authentication failed")


@router.websocket("/tickets")
async def websocket_ticket_updates(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token")
):
    """
    WebSocket endpoint for real-time ticket updates.
    
    Clients connect to this endpoint to receive real-time notifications about:
    - Ticket status changes
    - New tickets created
    - Ticket assignments
    - Priority updates
    - Comments and updates
    
    Query Parameters:
    - token: JWT authentication token
    
    Message Types (Client -> Server):
    - subscribe: {"action": "subscribe", "ticket_id": "ticket-123"}
    - unsubscribe: {"action": "unsubscribe", "ticket_id": "ticket-123"}
    - ping: {"action": "ping"}
    
    Message Types (Server -> Client):
    - connection_established: Welcome message on connect
    - ticket_subscribed: Confirmation of ticket subscription
    - ticket_update: Real-time ticket update
    - pong: Response to ping
    """
    user = None
    
    try:
        # Authenticate user
        user = await get_websocket_user(websocket, token)
        user_id = user.get("id") or user.get("user_id")
        company_id = user.get("company_id")
        role = user.get("role", "user")
        
        if not user_id or not company_id:
            await websocket.close(code=1008, reason="Invalid user data")
            return
        
        # Connect to manager
        await manager.connect(websocket, user_id, company_id, role)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_json()
                action = data.get("action")
                
                if action == "subscribe":
                    ticket_id = data.get("ticket_id")
                    if ticket_id:
                        # Verify user has access to this ticket
                        if await verify_ticket_access(ticket_id, company_id, user_id):
                            await manager.subscribe_to_ticket(websocket, ticket_id)
                        else:
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "Access denied to ticket"
                            }, websocket)
                
                elif action == "unsubscribe":
                    ticket_id = data.get("ticket_id")
                    if ticket_id:
                        await manager.unsubscribe_from_ticket(websocket, ticket_id)
                
                elif action == "ping":
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": data.get("timestamp")
                    }, websocket)
                
                else:
                    await manager.send_personal_message({
                        "type": "error",
                        "message": f"Unknown action: {action}"
                    }, websocket)
        
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: user={user_id}")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            manager.disconnect(websocket)
    
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        if websocket.client_state.name == "CONNECTED":
            await websocket.close(code=1011, reason="Internal server error")


@router.websocket("/chat/{ticket_id}")
async def websocket_live_chat(
    websocket: WebSocket,
    ticket_id: str,
    token: str = Query(..., description="JWT authentication token")
):
    """
    WebSocket endpoint for live chat on a specific ticket.
    
    Clients connect to this endpoint to participate in real-time chat for a ticket.
    
    Path Parameters:
    - ticket_id: The ticket ID to chat about
    
    Query Parameters:
    - token: JWT authentication token
    
    Message Types (Client -> Server):
    - message: {"type": "message", "content": "Hello, I need help"}
    - typing: {"type": "typing", "is_typing": true}
    - read: {"type": "read", "message_id": "msg-123"}
    
    Message Types (Server -> Client):
    - chat_message: New message from another user
    - user_typing: Another user is typing
    - message_read: Message has been read
    - chat_history: Initial chat history on connect
    """
    user = None
    
    try:
        # Authenticate user
        user = await get_websocket_user(websocket, token)
        user_id = user.get("id") or user.get("user_id")
        company_id = user.get("company_id")
        role = user.get("role", "user")
        user_name = user.get("name") or user.get("email", "Unknown")
        
        if not user_id or not company_id:
            await websocket.close(code=1008, reason="Invalid user data")
            return
        
        # Verify user has access to this ticket
        if not await verify_ticket_access(ticket_id, company_id, user_id):
            await websocket.close(code=1008, reason="Access denied")
            return
        
        # Connect to manager
        await manager.connect(websocket, user_id, company_id, role)
        await manager.subscribe_to_ticket(websocket, ticket_id)
        
        # Send chat history
        chat_history = await get_chat_history(ticket_id, company_id)
        await manager.send_personal_message({
            "type": "chat_history",
            "ticket_id": ticket_id,
            "messages": chat_history
        }, websocket)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_json()
                message_type = data.get("type")
                
                if message_type == "message":
                    content = data.get("content", "").strip()
                    if content:
                        # Save message to database
                        message_id = await save_chat_message(
                            ticket_id, user_id, user_name, content, company_id
                        )
                        
                        # Broadcast to other participants
                        await manager.send_chat_message(
                            ticket_id, user_id, user_name, content, company_id
                        )
                        
                        # Send confirmation to sender
                        await manager.send_personal_message({
                            "type": "message_sent",
                            "message_id": message_id,
                            "timestamp": data.get("timestamp")
                        }, websocket)
                
                elif message_type == "typing":
                    # Broadcast typing indicator
                    is_typing = data.get("is_typing", False)
                    if ticket_id in manager.ticket_subscriptions:
                        for conn in manager.ticket_subscriptions[ticket_id]:
                            if conn != websocket:
                                await manager.send_personal_message({
                                    "type": "user_typing",
                                    "ticket_id": ticket_id,
                                    "user_id": user_id,
                                    "user_name": user_name,
                                    "is_typing": is_typing
                                }, conn)
                
                elif message_type == "read":
                    message_id = data.get("message_id")
                    if message_id:
                        await mark_message_read(message_id, user_id)
                        # Could broadcast read receipt here if needed
        
        except WebSocketDisconnect:
            logger.info(f"Chat WebSocket disconnected: user={user_id}, ticket={ticket_id}")
        except Exception as e:
            logger.error(f"Chat WebSocket error: {e}")
        finally:
            await manager.unsubscribe_from_ticket(websocket, ticket_id)
            manager.disconnect(websocket)
    
    except Exception as e:
        logger.error(f"Chat WebSocket connection error: {e}")
        if websocket.client_state.name == "CONNECTED":
            await websocket.close(code=1011, reason="Internal server error")


# Helper functions

async def verify_ticket_access(ticket_id: str, company_id: str, user_id: str) -> bool:
    """Verify that user has access to the ticket."""
    if not supabase:
        return True  # Allow in degraded mode
    
    try:
        response = supabase.table("tickets").select("id, company_id, customer_id, assigned_to").eq("id", ticket_id).execute()
        
        if not response.data:
            return False
        
        ticket = response.data[0]
        
        # Check company match
        if ticket["company_id"] != company_id:
            return False
        
        # User can access if they're the customer, assigned agent, or admin
        return True  # Simplified for now
        
    except Exception as e:
        logger.error(f"Error verifying ticket access: {e}")
        return False


async def get_chat_history(ticket_id: str, company_id: str, limit: int = 100) -> list:
    """Retrieve chat history for a ticket."""
    if not supabase:
        return []
    
    try:
        response = supabase.table("ticket_chat_messages").select(
            "*"
        ).eq("ticket_id", ticket_id).eq("company_id", company_id).order(
            "created_at", desc=False
        ).limit(limit).execute()
        
        return response.data or []
    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}")
        return []


async def save_chat_message(
    ticket_id: str,
    user_id: str,
    user_name: str,
    content: str,
    company_id: str
) -> Optional[str]:
    """Save a chat message to the database."""
    if not supabase:
        return None
    
    try:
        from datetime import datetime
        
        message_data = {
            "ticket_id": ticket_id,
            "user_id": user_id,
            "user_name": user_name,
            "content": content,
            "company_id": company_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("ticket_chat_messages").insert(message_data).execute()
        
        if response.data:
            return response.data[0].get("id")
        return None
    except Exception as e:
        logger.error(f"Error saving chat message: {e}")
        return None


async def mark_message_read(message_id: str, user_id: str) -> bool:
    """Mark a chat message as read by a user."""
    if not supabase:
        return False
    
    try:
        from datetime import datetime
        
        read_data = {
            "message_id": message_id,
            "user_id": user_id,
            "read_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("message_read_receipts").insert(read_data).execute()
        return True
    except Exception as e:
        logger.error(f"Error marking message as read: {e}")
        return False


@router.get("/stats")
async def get_websocket_stats(
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """Get WebSocket connection statistics for the company."""
    company_id = user.get("company_id")
    
    return {
        "active_users": list(manager.get_active_users(company_id)),
        "connection_count": manager.get_connection_count(company_id),
        "active_tickets": len([
            ticket_id for ticket_id, conns in manager.ticket_subscriptions.items()
            if any(manager.connection_metadata.get(conn, {}).get("company_id") == company_id for conn in conns)
        ])
    }
