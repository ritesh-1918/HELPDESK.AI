import os
import hashlib
import base64
import asyncio
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Initialize AESGCM with 32-byte key derived from secret key
SECRET_KEY = os.environ.get("DB_ENCRYPTION_SECRET_KEY")

_cipher = None
if SECRET_KEY:
    # Hash secret key to ensure it is exactly 32 bytes (256 bits)
    key_bytes = hashlib.sha256(SECRET_KEY.encode()).digest()
    _cipher = AESGCM(key_bytes)
else:
    print("[WARNING] DB_ENCRYPTION_SECRET_KEY not set. Data encryption is disabled (degraded mode).")

def encrypt(plain_text: str) -> str:
    """Encrypt plain text using AES-256 GCM and return base64 encoded string."""
    if not _cipher or not plain_text:
        return plain_text
    try:
        # Generate 12-byte random nonce for GCM
        nonce = os.urandom(12)
        encrypted_bytes = _cipher.encrypt(nonce, plain_text.encode(), None)
        # Combine nonce and ciphertext and encode as base64
        combined = nonce + encrypted_bytes
        return base64.b64encode(combined).decode('utf-8')
    except Exception as e:
        print(f"[Crypto Error] Encryption failed: {e}")
        return plain_text

def decrypt(cipher_text: str) -> str:
    """Decrypt base64 encoded ciphertext using AES-256 GCM and return plain text."""
    if not _cipher or not cipher_text:
        return cipher_text
    try:
        # Check if cipher_text looks like base64
        try:
            combined = base64.b64decode(cipher_text.encode('utf-8'))
        except Exception:
            return cipher_text  # Return as-is if not valid base64
            
        if len(combined) < 12:
            return cipher_text  # Not enough bytes for nonce
            
        nonce = combined[:12]
        ciphertext = combined[12:]
        decrypted_bytes = _cipher.decrypt(nonce, ciphertext, None)
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        # If decryption fails, it might be unencrypted plaintext (graceful degrade for old records)
        return cipher_text


class ConnectionManager:
    """WebSocket Connection Pool Manager mapping active connections to company_id."""
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket, company_id: str):
        await websocket.accept()
        if company_id not in self.active_connections:
            self.active_connections[company_id] = []
        self.active_connections[company_id].append(websocket)
        print(f"[WS] Connected client for company_id={company_id}")

    def disconnect(self, websocket, company_id: str):
        if company_id in self.active_connections:
            if websocket in self.active_connections[company_id]:
                self.active_connections[company_id].remove(websocket)
            if not self.active_connections[company_id]:
                del self.active_connections[company_id]
        print(f"[WS] Disconnected client for company_id={company_id}")

    async def broadcast_to_company(self, company_id: str, message: dict):
        if company_id in self.active_connections:
            for connection in list(self.active_connections[company_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might be dead, clean up safely
                    self.disconnect(connection, company_id)

ws_manager = ConnectionManager()


def apply_db_encryption_patch():
    """Apply transparent monkeypatch to Postgrest/Supabase client execute method for 'tickets' table."""
    try:
        from postgrest._sync.request_builder import SyncQueryRequestBuilder
        
        _original_execute = SyncQueryRequestBuilder.execute

        def custom_execute(self):
            path_str = getattr(self.request.path, "path", "")
            table_name = path_str.split('/')[-1]
            
            if table_name == "tickets":
                payload = self.request.json
                if isinstance(payload, dict):
                    for field in ["contact_email", "description", "raw_text"]:
                        if field in payload and payload[field] is not None:
                            payload[field] = encrypt(str(payload[field]))
                elif isinstance(payload, list):
                    for item in payload:
                        if isinstance(item, dict):
                            for field in ["contact_email", "description", "raw_text"]:
                                if field in item and item[field] is not None:
                                    item[field] = encrypt(str(item[field]))
                                    
            res = _original_execute(self)
            
            if table_name == "tickets" and res and hasattr(res, "data"):
                data = res.data
                if isinstance(data, dict):
                    for field in ["contact_email", "description", "raw_text"]:
                        if field in data and data[field] is not None:
                            data[field] = decrypt(str(data[field]))
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            for field in ["contact_email", "description", "raw_text"]:
                                if field in item and item[field] is not None:
                                    item[field] = decrypt(str(item[field]))
                
                # Broadcast database mutations transparently to connected WebSocket clients
                try:
                    http_method = str(self.request.http_method).split('.')[-1].upper()
                    if http_method in ["POST", "PATCH", "DELETE"]:
                        event_type = "INSERT" if http_method == "POST" else ("UPDATE" if http_method == "PATCH" else "DELETE")
                        rows = data if isinstance(data, list) else [data]
                        for row in rows:
                            if isinstance(row, dict):
                                company_id = row.get("company_id")
                                if company_id:
                                    message = {
                                        "event": event_type,
                                        "record": row
                                    }
                                    try:
                                        loop = asyncio.get_running_loop()
                                        loop.create_task(ws_manager.broadcast_to_company(str(company_id), message))
                                    except RuntimeError:
                                        pass  # No active loop (e.g. unit tests)
                except Exception as ex:
                    print(f"[WS Broadcast Error] {ex}")
                                    
            return res

        SyncQueryRequestBuilder.execute = custom_execute
        print("[Crypto] Supabase database encryption patch applied successfully.")
    except Exception as e:
        print(f"[Crypto WARNING] Failed to apply database encryption patch: {e}")
