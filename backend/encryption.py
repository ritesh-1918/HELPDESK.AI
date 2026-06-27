"""
AES-256-GCM Encryption Utility for PII Fields

This module provides AES-256-GCM encryption and decryption for sensitive
ticket data (subjects and descriptions) before storing in the database.

Usage:
    from encryption import encrypt_pii, decrypt_pii

    # Encrypt sensitive data before saving
    encrypted_subject = encrypt_pii(ticket.subject)
    encrypted_description = encrypt_pii(ticket.description)

    # Decrypt data after reading from database
    subject = decrypt_pii(encrypted_subject)
    description = decrypt_pii(encrypted_description)
"""

import os
import base64
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

_ENCRYPTION_KEY: str | None = None

def get_encryption_key() -> str:
    global _ENCRYPTION_KEY
    if _ENCRYPTION_KEY is not None:
        return _ENCRYPTION_KEY
    key = os.getenv("AES_ENCRYPTION_KEY")
    if not key:
        raise ValueError(
            "AES_ENCRYPTION_KEY environment variable not set. "
            "Generate with: python3 -c \"import os; print(os.urandom(32).hex())\""
        )
    _ENCRYPTION_KEY = key
    return key

def _get_cipher(nonce: bytes | None = None):
    """Create AES-256-GCM cipher with the configured key."""
    key = get_encryption_key()
    key_bytes = bytes.fromhex(key)
    if len(key_bytes) != 32:
        raise ValueError("AES_ENCRYPTION_KEY must be 32 bytes (64 hex characters)")
    
    if nonce is None:
        nonce = get_random_bytes(12)  # 96-bit nonce for GCM
    
    return AES.new(key_bytes, AES.MODE_GCM, nonce=nonce), nonce

def encrypt_pii(plaintext: str | None) -> str | None:
    """
    Encrypt sensitive data using AES-256-GCM.
    
    Args:
        plaintext: The sensitive data to encrypt
        
    Returns:
        Base64-encoded string containing nonce + ciphertext + tag
        
    Example:
        encrypted = encrypt_pii("Sensitive ticket subject")
    """
    if not plaintext:
        return plaintext
    
    cipher, nonce = _get_cipher()
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode('utf-8'))
    
    # Combine nonce + ciphertext + tag
    encrypted_data = nonce + ciphertext + tag
    
    # Return base64-encoded string
    return base64.b64encode(encrypted_data).decode('utf-8')

def decrypt_pii(encrypted_data: str | None) -> str | None:
    """
    Decrypt data encrypted with encrypt_pii.
    
    Args:
        encrypted_data: Base64-encoded string from encrypt_pii
        
    Returns:
        Decrypted plaintext string
        
    Example:
        decrypted = decrypt_pii(encrypted_subject)
    """
    if not encrypted_data:
        return encrypted_data
    
    try:
        # Decode base64
        encrypted_bytes = base64.b64decode(encrypted_data)
        
        # Validate minimum length: nonce (12) + tag (16) + at least 1 byte ciphertext
        if len(encrypted_bytes) < 29:
            raise ValueError("Encrypted data too short")
        
        # Extract nonce (12 bytes), ciphertext, and tag (16 bytes)
        nonce = encrypted_bytes[:12]
        tag = encrypted_bytes[-16:]
        ciphertext = encrypted_bytes[12:-16]
        
        # Create cipher with the same nonce
        cipher, _ = _get_cipher(nonce=nonce)
        
        # Decrypt and verify tag
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        
        return plaintext.decode('utf-8')
        
    except Exception as e:
        raise ValueError(f"Failed to decrypt data: {e!s}") from e

def is_encrypted(data: str | None) -> bool:
    """
    Check if data appears to be encrypted (base64-encoded with valid structure).
    
    Args:
        data: String to check
        
    Returns:
        True if data appears encrypted, False otherwise
    """
    if not data:
        return False
    
    try:
        # Try to decode as base64
        decoded = base64.b64decode(data)
        
        # Check minimum length (nonce + tag + at least 1 byte of ciphertext)
        if len(decoded) < 29:  # 12 + 16 + 1
            return False
        
        return True
    except Exception:
        return False