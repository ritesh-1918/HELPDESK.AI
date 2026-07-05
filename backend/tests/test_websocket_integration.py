"""
Tests for WebSocket Real-Time Communication

Tests WebSocket connection management, ticket updates broadcasting, and live chat.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocketDisconnect

from backend.services.websocket_manager import ConnectionManager, manager
from backend.routers import websocket


class TestConnectionManager:
    """Tests for WebSocket ConnectionManager."""
    
    @pytest.fixture
    def connection_manager(self):
        """Create a fresh ConnectionManager for each test."""
        return ConnectionManager()
    
    @pytest.fixture
    def mock_websocket(self):
        """Create a mock WebSocket connection."""
        ws = AsyncMock()
        ws.client_state = Mock()
        ws.client_state.name = "CONNECTED"
        return ws
    
    @pytest.mark.asyncio
    async def test_connect_user(self, connection_manager, mock_websocket):
        """Test connecting a new user."""
        await connection_manager.connect(
            mock_websocket, 
            user_id="user123",
            company_id="company456",
            role="agent"
        )
        
        assert "user123" in connection_manager.active_connections
        assert mock_websocket in connection_manager.active_connections["user123"]
        assert mock_websocket in connection_manager.connection_metadata
        
        metadata = connection_manager.connection_metadata[mock_websocket]
        assert metadata["user_id"] == "user123"
        assert metadata["company_id"] == "company456"
        assert metadata["role"] == "agent"
        
        # Verify welcome message sent
        mock_websocket.send_json.assert_called_once()
        call_args = mock_websocket.send_json.call_args[0][0]
        assert call_args["type"] == "connection_established"
    
    @pytest.mark.asyncio
    async def test_disconnect_user(self, connection_manager, mock_websocket):
        """Test disconnecting a user."""
        await connection_manager.connect(
            mock_websocket, "user123", "company456", "user"
        )
        
        connection_manager.disconnect(mock_websocket)
        
        assert "user123" not in connection_manager.active_connections
        assert mock_websocket not in connection_manager.connection_metadata
    
    @pytest.mark.asyncio
    async def test_subscribe_to_ticket(self, connection_manager, mock_websocket):
        """Test subscribing to ticket updates."""
        await connection_manager.connect(
            mock_websocket, "user123", "company456", "user"
        )
        
        await connection_manager.subscribe_to_ticket(mock_websocket, "ticket789")
        
        assert "ticket789" in connection_manager.ticket_subscriptions
        assert mock_websocket in connection_manager.ticket_subscriptions["ticket789"]
        
        # Verify subscription confirmation sent
        calls = mock_websocket.send_json.call_args_list
        assert any(
            call[0][0].get("type") == "ticket_subscribed" 
            for call in calls
        )
    
    @pytest.mark.asyncio
    async def test_unsubscribe_from_ticket(self, connection_manager, mock_websocket):
        """Test unsubscribing from ticket updates."""
        await connection_manager.connect(
            mock_websocket, "user123", "company456", "user"
        )
        await connection_manager.subscribe_to_ticket(mock_websocket, "ticket789")
        
        await connection_manager.unsubscribe_from_ticket(mock_websocket, "ticket789")
        
        assert "ticket789" not in connection_manager.ticket_subscriptions
    
    @pytest.mark.asyncio
    async def test_send_personal_message(self, connection_manager, mock_websocket):
        """Test sending message to specific connection."""
        await connection_manager.connect(
            mock_websocket, "user123", "company456", "user"
        )
        
        message = {"type": "test", "data": "hello"}
        await connection_manager.send_personal_message(message, mock_websocket)
        
        # Should have 2 calls: welcome message + test message
        assert mock_websocket.send_json.call_count == 2
        last_call = mock_websocket.send_json.call_args_list[-1][0][0]
        assert last_call == message
    
    @pytest.mark.asyncio
    async def test_send_to_user(self, connection_manager):
        """Test sending message to all user connections."""
        # Create multiple connections for same user
        ws1 = AsyncMock()
        ws2 = AsyncMock()
        
        await connection_manager.connect(ws1, "user123", "company456", "user")
        await connection_manager.connect(ws2, "user123", "company456", "user")
        
        message = {"type": "test", "data": "broadcast"}
        await connection_manager.send_to_user(message, "user123")
        
        # Both connections should receive the message
        assert ws1.send_json.called
        assert ws2.send_json.called
    
    @pytest.mark.asyncio
    async def test_broadcast_ticket_update(self, connection_manager):
        """Test broadcasting ticket update to subscribers."""
        ws1 = AsyncMock()
        ws2 = AsyncMock()
        ws3 = AsyncMock()  # Different company
        
        await connection_manager.connect(ws1, "user1", "company1", "user")
        await connection_manager.connect(ws2, "user2", "company1", "agent")
        await connection_manager.connect(ws3, "user3", "company2", "user")
        
        await connection_manager.subscribe_to_ticket(ws1, "ticket123")
        await connection_manager.subscribe_to_ticket(ws2, "ticket123")
        
        await connection_manager.broadcast_ticket_update(
            ticket_id="ticket123",
            update_type="status_changed",
            data={"status": "resolved"},
            company_id="company1"
        )
        
        # Subscribers should receive update
        assert ws1.send_json.call_count >= 2  # welcome + update
        assert ws2.send_json.call_count >= 2
        
        # Different company should not receive
        # ws3 only gets welcome message
        assert ws3.send_json.call_count == 1
    
    @pytest.mark.asyncio
    async def test_send_chat_message(self, connection_manager):
        """Test sending chat message to ticket participants."""
        sender_ws = AsyncMock()
        receiver_ws = AsyncMock()
        
        await connection_manager.connect(sender_ws, "user1", "company1", "user")
        await connection_manager.connect(receiver_ws, "user2", "company1", "agent")
        
        await connection_manager.subscribe_to_ticket(sender_ws, "ticket123")
        await connection_manager.subscribe_to_ticket(receiver_ws, "ticket123")
        
        await connection_manager.send_chat_message(
            ticket_id="ticket123",
            sender_id="user1",
            sender_name="Alice",
            message_text="Hello, I need help",
            company_id="company1"
        )
        
        # Sender should not receive their own message
        # Receiver should get the message
        sender_calls = sender_ws.send_json.call_count
        receiver_calls = receiver_ws.send_json.call_count
        
        # Receiver should have more calls (welcome + subscription + message)
        assert receiver_calls > sender_calls
    
    @pytest.mark.asyncio
    async def test_broadcast_to_company(self, connection_manager):
        """Test broadcasting message to all company members."""
        ws1 = AsyncMock()
        ws2 = AsyncMock()
        ws3 = AsyncMock()  # Different company
        
        await connection_manager.connect(ws1, "user1", "company1", "user")
        await connection_manager.connect(ws2, "user2", "company1", "agent")
        await connection_manager.connect(ws3, "user3", "company2", "user")
        
        message = {"type": "announcement", "text": "System maintenance"}
        await connection_manager.broadcast_to_company(message, "company1")
        
        # Company1 members should receive
        assert ws1.send_json.call_count == 2  # welcome + announcement
        assert ws2.send_json.call_count == 2
        
        # Company2 should not receive
        assert ws3.send_json.call_count == 1  # only welcome
    
    def test_get_active_users(self, connection_manager):
        """Test getting list of active users."""
        # Mock connections without actually connecting
        connection_manager.connection_metadata = {
            Mock(): {"user_id": "user1", "company_id": "company1", "role": "user"},
            Mock(): {"user_id": "user2", "company_id": "company1", "role": "agent"},
            Mock(): {"user_id": "user3", "company_id": "company2", "role": "user"},
        }
        
        # Get all active users
        all_users = connection_manager.get_active_users()
        assert len(all_users) == 3
        
        # Get company-specific users
        company1_users = connection_manager.get_active_users("company1")
        assert len(company1_users) == 2
        assert "user1" in company1_users
        assert "user2" in company1_users
    
    def test_get_connection_count(self, connection_manager):
        """Test getting connection count."""
        connection_manager.connection_metadata = {
            Mock(): {"user_id": "user1", "company_id": "company1", "role": "user"},
            Mock(): {"user_id": "user2", "company_id": "company1", "role": "agent"},
            Mock(): {"user_id": "user3", "company_id": "company2", "role": "user"},
        }
        
        # Total connections
        assert connection_manager.get_connection_count() == 3
        
        # Company-specific count
        assert connection_manager.get_connection_count("company1") == 2
        assert connection_manager.get_connection_count("company2") == 1


class TestWebSocketRouter:
    """Tests for WebSocket router endpoints."""
    
    @pytest.mark.asyncio
    async def test_verify_ticket_access_success(self):
        """Test ticket access verification with valid access."""
        with patch('backend.routers.websocket.supabase') as mock_supabase:
            mock_supabase.table().select().eq().execute.return_value = Mock(
                data=[{
                    "id": "ticket123",
                    "company_id": "company456",
                    "customer_id": "user123"
                }]
            )
            
            from backend.routers.websocket import verify_ticket_access
            result = await verify_ticket_access(
                ticket_id="ticket123",
                company_id="company456",
                user_id="user123"
            )
            
            assert result is True
    
    @pytest.mark.asyncio
    async def test_verify_ticket_access_wrong_company(self):
        """Test ticket access verification with wrong company."""
        with patch('backend.routers.websocket.supabase') as mock_supabase:
            mock_supabase.table().select().eq().execute.return_value = Mock(
                data=[{
                    "id": "ticket123",
                    "company_id": "company456",
                    "customer_id": "user123"
                }]
            )
            
            from backend.routers.websocket import verify_ticket_access
            result = await verify_ticket_access(
                ticket_id="ticket123",
                company_id="wrong_company",
                user_id="user123"
            )
            
            assert result is False
    
    @pytest.mark.asyncio
    async def test_get_chat_history(self):
        """Test retrieving chat history."""
        with patch('backend.routers.websocket.supabase') as mock_supabase:
            mock_messages = [
                {
                    "id": "msg1",
                    "ticket_id": "ticket123",
                    "user_id": "user1",
                    "user_name": "Alice",
                    "content": "Hello",
                    "created_at": "2024-01-01T10:00:00Z"
                },
                {
                    "id": "msg2",
                    "ticket_id": "ticket123",
                    "user_id": "user2",
                    "user_name": "Bob",
                    "content": "Hi there",
                    "created_at": "2024-01-01T10:01:00Z"
                }
            ]
            
            mock_supabase.table().select().eq().eq().order().limit().execute.return_value = Mock(
                data=mock_messages
            )
            
            from backend.routers.websocket import get_chat_history
            messages = await get_chat_history("ticket123", "company456")
            
            assert len(messages) == 2
            assert messages[0]["content"] == "Hello"
    
    @pytest.mark.asyncio
    async def test_save_chat_message(self):
        """Test saving a chat message."""
        with patch('backend.routers.websocket.supabase') as mock_supabase:
            mock_supabase.table().insert().execute.return_value = Mock(
                data=[{"id": "msg123"}]
            )
            
            from backend.routers.websocket import save_chat_message
            message_id = await save_chat_message(
                ticket_id="ticket123",
                user_id="user456",
                user_name="Alice",
                content="Test message",
                company_id="company789"
            )
            
            assert message_id == "msg123"


@pytest.mark.asyncio
async def test_websocket_stats_endpoint():
    """Test WebSocket statistics endpoint."""
    # This would require setting up a full test client
    # Placeholder for integration test
    pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
