"""
Tests for AES-256-GCM Encryption Utility

This module tests the encryption and decryption functions to ensure
they work correctly and securely.
"""

import os
import importlib
import pytest

@pytest.fixture
def encryption_module(monkeypatch):
    """Fixture that provides a fresh encryption module with a dynamically generated test key."""
    monkeypatch.setenv(
        "AES_ENCRYPTION_KEY",
        os.urandom(32).hex(),
    )
    import encryption
    importlib.reload(encryption)
    return encryption

def test_encrypt_decrypt_roundtrip(encryption_module):
    """Test that encrypting and decrypting returns the original text."""
    plaintext = "This is a sensitive ticket subject"
    encrypted = encryption_module.encrypt_pii(plaintext)
    decrypted = encryption_module.decrypt_pii(encrypted)
    assert decrypted == plaintext

def test_encrypt_decrypt_empty_string(encryption_module):
    """Test that empty strings are handled correctly."""
    assert encryption_module.encrypt_pii("") == ""
    assert encryption_module.decrypt_pii("") == ""

def test_encrypt_decrypt_none(encryption_module):
    """Test that None values are handled correctly."""
    assert encryption_module.encrypt_pii(None) is None
    assert encryption_module.decrypt_pii(None) is None

def test_encrypt_produces_different_output(encryption_module):
    """Test that encrypting the same text twice produces different ciphertext."""
    plaintext = "Same text"
    encrypted1 = encryption_module.encrypt_pii(plaintext)
    encrypted2 = encryption_module.encrypt_pii(plaintext)
    # Should be different due to random nonce
    assert encrypted1 != encrypted2
    # But both should decrypt to the same plaintext
    assert encryption_module.decrypt_pii(encrypted1) == plaintext
    assert encryption_module.decrypt_pii(encrypted2) == plaintext

def test_is_encrypted(encryption_module):
    """Test the is_encrypted function."""
    plaintext = "Not encrypted"
    encrypted = encryption_module.encrypt_pii("Encrypted text")
    
    assert not encryption_module.is_encrypted(plaintext)
    assert encryption_module.is_encrypted(encrypted)
    assert not encryption_module.is_encrypted("")
    assert not encryption_module.is_encrypted(None)

def test_encrypt_decrypt_long_text(encryption_module):
    """Test encryption of long text."""
    plaintext = "A" * 10000  # 10KB of text
    encrypted = encryption_module.encrypt_pii(plaintext)
    decrypted = encryption_module.decrypt_pii(encrypted)
    assert decrypted == plaintext

def test_encrypt_decrypt_unicode(encryption_module):
    """Test encryption of unicode text."""
    plaintext = "日本語のテスト 🎉 Émojis and spëcial chars"
    encrypted = encryption_module.encrypt_pii(plaintext)
    decrypted = encryption_module.decrypt_pii(encrypted)
    assert decrypted == plaintext

def test_decrypt_invalid_data(encryption_module):
    """Test that decrypting invalid data raises an error."""
    with pytest.raises(ValueError):
        encryption_module.decrypt_pii("invalid-base64-data")

def test_decrypt_tampered_data(encryption_module):
    """Test that decrypting tampered data raises an error."""
    encrypted = encryption_module.encrypt_pii("Test")
    # Tamper with the encrypted data
    tampered = encrypted[:-2] + "XX"
    with pytest.raises(ValueError):
        encryption_module.decrypt_pii(tampered)

def test_decrypt_too_short_data(encryption_module):
    """Test that decrypting data that is too short raises an error."""
    # Create a base64 string that decodes to less than 29 bytes
    import base64
    short_data = base64.b64encode(b"short").decode('utf-8')
    with pytest.raises(ValueError, match="Encrypted data too short"):
        encryption_module.decrypt_pii(short_data)

if __name__ == "__main__":
    pytest.main([__file__])