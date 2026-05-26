import asyncio
import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth.crypto import ws_manager

class TestWebSocketPool(unittest.TestCase):
    def test_websocket_connect_disconnect(self):
        client = TestClient(app)
        
        company_id = "test-company-123"
        with client.websocket_connect(f"/ws/{company_id}") as websocket:
            # Check client is registered
            self.assertIn(company_id, ws_manager.active_connections)
            self.assertEqual(len(ws_manager.active_connections[company_id]), 1)
            
            # Send heartbeat response
            websocket.send_text("pong")
            
        # Check client is disconnected
        self.assertNotIn(company_id, ws_manager.active_connections)

    def test_websocket_broadcast(self):
        client = TestClient(app)
        company_id = "test-company-456"
        
        with client.websocket_connect(f"/ws/{company_id}") as websocket:
            message = {"event": "INSERT", "record": {"id": "1", "subject": "Test ticket"}}
            
            # Run broadcast in loop
            asyncio.run(ws_manager.broadcast_to_company(company_id, message))
            
            recv_msg = websocket.receive_json()
            self.assertEqual(recv_msg["event"], "INSERT")
            self.assertEqual(recv_msg["record"]["id"], "1")

if __name__ == "__main__":
    unittest.main()
