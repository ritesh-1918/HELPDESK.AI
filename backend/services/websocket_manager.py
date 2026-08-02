"""
WebSocket Manager for Real-Time Communication

Manages WebSocket connections, broadcasts ticket updates, and handles live chat messages.
"""

import json
import logging
from typing import Dict, Set, Optional
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time communication."""

    def __init__(self):
        # Active connections by user_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        
        # Connections by ticket_id for ticket-specific updates
        self.ticket_subscriptions: Dict[str, Set[WebSocket]] = {}
        
        # Connection metadata (user_id, company_id, role)
        self.connection_metadata: Dict[WebSocket, dict] = {}

    async def connect(
        self, 
        websocket: WebSocket, 
        user_id: str, 
        company_id: str,
        role: str = "user"
    ):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        
        # Register connection
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        
        # Store metadata
        self.connection_metadata[websocket] = {
            "user_id": user_id,
            "company_id": company_id,
            "role": role,
            "connected_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"WebSocket connected: user={user_id}, company={company_id}, role={role}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        metadata = self.connection_metadata.get(websocket)
        
        if metadata:
            user_id = metadata["user_id"]
            
            # Remove from active connections
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            # Remove from ticket subscriptions
            for ticket_id, connections in list(self.ticket_subscriptions.items()):
                connections.discard(websocket)
                if not connections:
                    del self.ticket_subscriptions[ticket_id]
            
            # Remove metadata
            del self.connection_metadata[websocket]
            
            logger.info(f"WebSocket disconnected: user={user_id}")

    async def subscribe_to_ticket(self, websocket: WebSocket, ticket_id: str):
        """Subscribe a connection to ticket-specific updates."""
        if ticket_id not in self.ticket_subscriptions:
            self.ticket_subscriptions[ticket_id] = set()
        self.ticket_subscriptions[ticket_id].add(websocket)
        
        metadata = self.connection_metadata.get(websocket, {})
        logger.info(f"User {metadata.get('user_id')} subscribed to ticket {ticket_id}")
        
        await self.send_personal_message({
            "type": "ticket_subscribed",
            "ticket_id": ticket_id,
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)

    async def unsubscribe_from_ticket(self, websocket: WebSocket, ticket_id: str):
        """Unsubscribe a connection from ticket-specific updates."""
        if ticket_id in self.ticket_subscriptions:
            self.ticket_subscriptions[ticket_id].discard(websocket)
            if not self.ticket_subscriptions[ticket_id]:
                del self.ticket_subscriptions[ticket_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def send_to_user(self, message: dict, user_id: str):
        """Send a message to all connections of a specific user."""
        if user_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to user {user_id}: {e}")
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn)

    async def broadcast_ticket_update(
        self,
        ticket_id: str,
        update_type: str,
        data: dict,
        company_id: str
    ):
        """Broadcast ticket update to subscribed connections and company members."""
        message = {
            "type": "ticket_update",
            "update_type": update_type,
            "ticket_id": ticket_id,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Send to ticket subscribers
        if ticket_id in self.ticket_subscriptions:
            disconnected = set()
            for connection in self.ticket_subscriptions[ticket_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to ticket {ticket_id}: {e}")
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn)
        
        # Also send to all company members who are not subscribed to this specific ticket
        for websocket, metadata in self.connection_metadata.items():
            if (metadata["company_id"] == company_id and 
                websocket not in self.ticket_subscriptions.get(ticket_id, set())):
                try:
                    await websocket.send_json(message)
                except Exception:
                    pass

    async def send_chat_message(
        self,
        ticket_id: str,
        sender_id: str,
        sender_name: str,
        message_text: str,
        company_id: str
    ):
        """Send a chat message to all participants in a ticket conversation."""
        message = {
            "type": "chat_message",
            "ticket_id": ticket_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "message": message_text,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Send to ticket subscribers
        if ticket_id in self.ticket_subscriptions:
            disconnected = set()
            for connection in self.ticket_subscriptions[ticket_id]:
                metadata = self.connection_metadata.get(connection, {})
                # Don't send back to sender
                if metadata.get("user_id") != sender_id:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error sending chat message: {e}")
                        disconnected.add(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn)

    async def broadcast_to_company(self, message: dict, company_id: str, exclude_user: Optional[str] = None):
        """Broadcast a message to all users in a company."""
        disconnected = set()
        
        for websocket, metadata in self.connection_metadata.items():
            if metadata["company_id"] == company_id:
                if exclude_user and metadata["user_id"] == exclude_user:
                    continue
                
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to company {company_id}: {e}")
                    disconnected.add(websocket)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.disconnect(conn)

    def get_active_users(self, company_id: Optional[str] = None) -> Set[str]:
        """Get list of currently active user IDs, optionally filtered by company."""
        if company_id:
            return {
                metadata["user_id"]
                for metadata in self.connection_metadata.values()
                if metadata["company_id"] == company_id
            }
        return set(self.active_connections.keys())

    def get_connection_count(self, company_id: Optional[str] = None) -> int:
        """Get total number of active connections, optionally filtered by company."""
        if company_id:
            return sum(
                1 for metadata in self.connection_metadata.values()
                if metadata["company_id"] == company_id
            )
        return len(self.connection_metadata)


# Global connection manager instance
manager = ConnectionManager()
