# WebSocket Real-Time Communication Feature

## Overview

This feature implements real-time communication capabilities for the HELPDESK.AI system using WebSocket connections. It enables instant ticket status updates and live chat functionality without requiring page refreshes.

## Features

### 1. Real-Time Ticket Status Updates
- Instant notifications when ticket properties change
- Status, priority, assignment, and category updates pushed to all relevant users
- Company-scoped broadcasts ensuring data isolation
- Visual badges and notifications in the UI

### 2. Live Chat
- Real-time messaging between customers and support agents
- Typing indicators to show when someone is composing a message
- Message read receipts
- Chat history retrieval
- Automatic reconnection on connection loss

### 3. Connection Management
- Automatic WebSocket connection pooling
- Exponential backoff reconnection strategy
- Ping/pong keep-alive mechanism
- User presence tracking
- Multi-tenant isolation

## Architecture

### Backend Components

#### 1. WebSocket Manager (`backend/services/websocket_manager.py`)
Central service for managing WebSocket connections:
- **ConnectionManager**: Manages active WebSocket connections
- Connection tracking by user_id and company_id
- Ticket subscription management
- Message broadcasting with tenant isolation
- Active user tracking

#### 2. WebSocket Router (`backend/routers/websocket.py`)
FastAPI router providing WebSocket endpoints:

**Endpoints:**
- `ws://host/ws/tickets`: General ticket updates
- `ws://host/ws/chat/{ticket_id}`: Live chat for specific ticket
- `GET /ws/stats`: Connection statistics

**Authentication:**
- Token-based authentication via query parameters
- JWT verification using Supabase Auth
- User profile resolution for tenant context

#### 3. Database Schema (`supabase/migrations/20260709000000_add_websocket_chat_support.sql`)
- **ticket_chat_messages**: Stores chat messages
- **message_read_receipts**: Tracks message read status
- **websocket_connection_log**: Analytics and debugging
- **RLS policies**: Multi-tenant security
- **Triggers**: Real-time pg_notify events

### Frontend Components

#### 1. WebSocket Context (`Frontend/src/contexts/WebSocketContext.jsx`)
React context provider for WebSocket functionality:
- Connection state management
- Auto-reconnection logic
- Message listener registration
- Ping/pong heartbeat
- Custom hooks: `useWebSocket`, `useTicketUpdates`, `useConnectionStatus`

#### 2. Live Chat Panel (`Frontend/src/components/LiveChatPanel.jsx`)
Full-featured chat interface:
- Real-time message sending/receiving
- Typing indicators
- Message timestamps
- Auto-scroll to latest message
- Connection status indicator
- Optimistic UI updates

#### 3. Real-Time Ticket Status (`Frontend/src/components/RealTimeTicketStatus.jsx`)
Dynamic status display component:
- Live-updating status badges
- Priority, category, assignment indicators
- Toast-style notifications for updates
- Last update timestamp
- Auto-dismissing alerts

## Message Types

### Client → Server

#### Ticket Updates Endpoint
```json
{
  "action": "subscribe",
  "ticket_id": "ticket-123"
}

{
  "action": "unsubscribe",
  "ticket_id": "ticket-123"
}

{
  "action": "ping",
  "timestamp": 1234567890
}
```

#### Live Chat Endpoint
```json
{
  "type": "message",
  "content": "Hello, I need help"
}

{
  "type": "typing",
  "is_typing": true
}

{
  "type": "read",
  "message_id": "msg-123"
}
```

### Server → Client

#### Ticket Updates
```json
{
  "type": "connection_established",
  "user_id": "user-123",
  "timestamp": "2024-01-01T10:00:00Z"
}

{
  "type": "ticket_subscribed",
  "ticket_id": "ticket-123",
  "timestamp": "2024-01-01T10:00:00Z"
}

{
  "type": "ticket_update",
  "update_type": "status_changed",
  "ticket_id": "ticket-123",
  "data": {
    "status": "resolved",
    "resolved_by": "agent-456"
  },
  "timestamp": "2024-01-01T10:00:00Z"
}

{
  "type": "pong",
  "timestamp": 1234567890
}
```

#### Live Chat
```json
{
  "type": "chat_history",
  "ticket_id": "ticket-123",
  "messages": [...]
}

{
  "type": "chat_message",
  "ticket_id": "ticket-123",
  "sender_id": "user-456",
  "sender_name": "Alice",
  "message": "Hello",
  "timestamp": "2024-01-01T10:00:00Z"
}

{
  "type": "user_typing",
  "ticket_id": "ticket-123",
  "user_id": "user-456",
  "user_name": "Alice",
  "is_typing": true
}

{
  "type": "message_sent",
  "message_id": "msg-789",
  "timestamp": 1234567890
}
```

## Setup and Configuration

### Backend Setup

1. **Install Dependencies**
   ```bash
   pip install fastapi websockets supabase-py
   ```

2. **Run Migration**
   ```bash
   supabase db push
   ```

3. **Register Router** (in `main.py`)
   ```python
   from backend.routers import websocket
   app.include_router(websocket.router)
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Wrap App with WebSocketProvider**
   ```jsx
   import { WebSocketProvider } from './contexts/WebSocketContext';
   
   function App() {
     const token = getAuthToken(); // Your auth token
     
     return (
       <WebSocketProvider token={token} enabled={true}>
         {/* Your app components */}
       </WebSocketProvider>
     );
   }
   ```

3. **Use Components**
   ```jsx
   import LiveChatPanel from './components/LiveChatPanel';
   import RealTimeTicketStatus from './components/RealTimeTicketStatus';
   
   function TicketDetail({ ticketId }) {
     return (
       <div>
         <RealTimeTicketStatus 
           ticketId={ticketId}
           initialStatus={ticket.status}
           onStatusChange={handleStatusChange}
         />
         
         <LiveChatPanel
           ticketId={ticketId}
           token={authToken}
           currentUserId={user.id}
           currentUserName={user.name}
         />
       </div>
     );
   }
   ```

## Security Considerations

### Authentication
- WebSocket connections require valid JWT tokens
- Tokens passed as query parameters (WebSocket doesn't support headers)
- Token validation on every connection
- Automatic disconnection on auth failure

### Authorization
- Ticket access verification before subscription
- Company-scoped message broadcasting
- RLS policies on all database tables
- No cross-tenant data leakage

### Data Protection
- All messages encrypted in transit (WSS in production)
- Message content not logged (privacy)
- Connection metadata minimal
- Automatic cleanup on disconnect

## Performance Optimization

### Connection Pooling
- Single WebSocket per user session
- Efficient connection reuse
- Memory-efficient data structures

### Message Batching
- Multiple updates can be queued
- Efficient broadcast to multiple subscribers
- Minimal database queries

### Caching
- Chat history cached per ticket
- User profile caching
- Connection metadata in memory

### Scalability
- Horizontal scaling ready (use Redis pub/sub for multi-instance)
- Connection count monitoring
- Graceful degradation if WebSocket unavailable

## Testing

### Unit Tests
```bash
cd backend
pytest tests/test_websocket_integration.py -v
```

### Manual Testing
1. Open browser console
2. Connect to WebSocket endpoint with token
3. Subscribe to ticket updates
4. Make changes to ticket in another tab
5. Verify real-time updates appear

### Load Testing
Use tools like `wscat` or `artillery` to test concurrent connections:
```bash
npm install -g wscat
wscat -c "ws://localhost:8000/ws/tickets?token=YOUR_TOKEN"
```

## Monitoring

### Metrics to Track
- Active connection count
- Messages sent/received per second
- Average message latency
- Connection duration
- Reconnection rate
- Error rate

### Endpoints for Monitoring
- `GET /ws/stats`: Real-time connection statistics
- Database: `websocket_connection_log` table

## Troubleshooting

### Connection Fails
- Verify token is valid and not expired
- Check CORS configuration
- Ensure WebSocket endpoint is accessible
- Check firewall/proxy settings

### Messages Not Received
- Verify subscription to correct ticket
- Check company_id matches
- Verify user has access to ticket
- Check browser console for errors

### Performance Issues
- Monitor connection count
- Check database query performance
- Review message broadcast efficiency
- Consider Redis pub/sub for scaling

## Future Enhancements

1. **Redis Integration**
   - Pub/sub for multi-instance deployments
   - Persistent connection state
   - Cross-server broadcasting

2. **Rich Media Support**
   - File attachments in chat
   - Image/video sharing
   - Screen sharing

3. **Advanced Features**
   - Voice/video calling
   - Co-browsing
   - Screen recording
   - Canned responses

4. **Analytics**
   - Response time metrics
   - Agent availability tracking
   - Chat sentiment analysis
   - Conversation quality scoring

## References

- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [React WebSocket Integration](https://react.dev/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
