import asyncio
import websockets
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Constants
WS_SERVER_URL = "ws://localhost:8765"
RECONNECT_INTERVAL = 5  # Reconnect every 5 seconds if connection is lost

class ResilientWebSocket:
    def __init__(self, uri):
        self.uri = uri
        self.websocket = None
        self.is_connected = False

    async def connect(self):
        while True:
            try:
                self.websocket = await websockets.connect(self.uri)
                self.is_connected = True
                logging.info("WebSocket connected")
                await self.listen()
            except websockets.ConnectionClosed as e:
                logging.error(f"WebSocket connection closed: {e}")
                self.is_connected = False
            except Exception as e:
                logging.error(f"Error connecting to WebSocket: {e}")
                self.is_connected = False
            if not self.is_connected:
                logging.info(f"Reconnecting in {RECONNECT_INTERVAL} seconds...")
                await asyncio.sleep(RECONNECT_INTERVAL)

    async def listen(self):
        try:
            while True:
                message = await self.websocket.recv()
                logging.info(f"Received message: {message}")
                await self.handle_message(message)
        except websockets.ConnectionClosed as e:
            logging.error(f"WebSocket connection closed: {e}")
            self.is_connected = False
        except Exception as e:
            logging.error(f"Error receiving message: {e}")
            self.is_connected = False

    async def handle_message(self, message):
        # Handle incoming messages here
        data = json.loads(message)
        logging.info(f"Handling message: {data}")

    async def send_message(self, message):
        if self.is_connected:
            try:
                await self.websocket.send(json.dumps(message))
                logging.info(f"Sent message: {message}")
            except websockets.ConnectionClosed as e:
                logging.error(f"WebSocket connection closed: {e}")
                self.is_connected = False
            except Exception as e:
                logging.error(f"Error sending message: {e}")
                self.is_connected = False
        else:
            logging.warning("WebSocket is not connected. Message not sent.")

async def main():
    ws_client = ResilientWebSocket(WS_SERVER_URL)
    await ws_client.connect()

if __name__ == "__main__":
    asyncio.run(main())