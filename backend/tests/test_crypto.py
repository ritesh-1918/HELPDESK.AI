import os
import unittest
import base64
from unittest.mock import patch, MagicMock

# Import the crypto module under test
import backend.auth.crypto as crypto

class TestCryptographicHooks(unittest.TestCase):
    
    def test_key_derivation_formats(self):
        """Test urlsafe-b64, hex, and SHA-256 stretch key parsing."""
        # 1. Test URL-safe Base64 key parsing (exactly 32 bytes once decoded)
        dummy_32bytes = os.urandom(32)
        b64_key = base64.urlsafe_b64encode(dummy_32bytes).decode('utf-8')
        derived = crypto.derive_cryptographic_key(b64_key)
        self.assertEqual(derived, dummy_32bytes)

        # 2. Test Hex key parsing (exactly 32 bytes once decoded)
        hex_key = dummy_32bytes.hex()
        derived_hex = crypto.derive_cryptographic_key(hex_key)
        self.assertEqual(derived_hex, dummy_32bytes)

        # 3. Test SHA-256 stretch parsing for arbitrary strings
        raw_key = "my-secret-bounty-key-stretch-test"
        derived_stretch = crypto.derive_cryptographic_key(raw_key)
        self.assertEqual(len(derived_stretch), 32)

    def test_encrypt_decrypt_roundtrip(self):
        """Test successful AES-256-GCM encryption and decryption round-trip."""
        # Force active encryption state by mocking AESGCM with a stretched key
        dummy_key = crypto.derive_cryptographic_key("test-key")
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        mock_aesgcm = AESGCM(dummy_key)
        
        with patch.object(crypto, "ENCRYPTION_ENABLED", True), \
             patch.object(crypto, "_aesgcm", mock_aesgcm):
            
            plaintext = "Secure GDPR/HIPAA ticket content."
            ciphertext = crypto.encrypt_value(plaintext)
            
            # Verify prefix
            self.assertTrue(ciphertext.startswith("enc:v1:"))
            self.assertNotEqual(plaintext, ciphertext)
            
            # Decrypt back
            decrypted = crypto.decrypt_value(ciphertext)
            self.assertEqual(decrypted, plaintext)

    def test_double_encryption_protection(self):
        """Test that calling encrypt twice does not double-encrypt the data (no-op)."""
        dummy_key = crypto.derive_cryptographic_key("test-key")
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        mock_aesgcm = AESGCM(dummy_key)
        
        with patch.object(crypto, "ENCRYPTION_ENABLED", True), \
             patch.object(crypto, "_aesgcm", mock_aesgcm):
            
            plaintext = "Double encrypt check."
            first_encryption = crypto.encrypt_value(plaintext)
            second_encryption = crypto.encrypt_value(first_encryption)
            
            self.assertEqual(first_encryption, second_encryption)

    def test_selectivity_of_field_hooks(self):
        """Verify only contact_email, description, and raw_text are encrypted."""
        dummy_key = crypto.derive_cryptographic_key("test-key")
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        mock_aesgcm = AESGCM(dummy_key)
        
        with patch.object(crypto, "ENCRYPTION_ENABLED", True), \
             patch.object(crypto, "_aesgcm", mock_aesgcm):
            
            payload = {
                "id": 123,
                "subject": "System crash",
                "contact_email": "user@domain.com",
                "description": "Critical exception in auth service",
                "raw_text": "Sensitive logs and stack traces",
                "company_id": "company-99",
                "priority": "critical"
            }
            
            encrypted_payload = crypto.encrypt_payload(payload)
            
            # Target fields must be encrypted
            self.assertTrue(encrypted_payload["contact_email"].startswith("enc:v1:"))
            self.assertTrue(encrypted_payload["description"].startswith("enc:v1:"))
            self.assertTrue(encrypted_payload["raw_text"].startswith("enc:v1:"))
            
            # Non-target fields must remain untouched
            self.assertEqual(encrypted_payload["id"], 123)
            self.assertEqual(encrypted_payload["subject"], "System crash")
            self.assertEqual(encrypted_payload["company_id"], "company-99")
            self.assertEqual(encrypted_payload["priority"], "critical")
            
            # Decrypt back
            decrypted_payload = crypto.decrypt_payload(encrypted_payload)
            self.assertEqual(decrypted_payload, payload)

    def test_graceful_degrade_when_no_key_is_set(self):
        """Verify database actions fall back to plaintext pass-through when encryption is disabled."""
        with patch.object(crypto, "ENCRYPTION_ENABLED", False), \
             patch.object(crypto, "_aesgcm", None):
            
            plaintext = "Normal plaintext content."
            encrypted = crypto.encrypt_value(plaintext)
            decrypted = crypto.decrypt_value(encrypted)
            
            self.assertEqual(encrypted, plaintext)
            self.assertEqual(decrypted, plaintext)

            # Test selectivity on row also passes through unchanged
            payload = {
                "contact_email": "test@test.com",
                "description": "normal text"
            }
            encrypted_payload = crypto.encrypt_payload(payload)
            self.assertEqual(encrypted_payload, payload)

    def test_legacy_data_pass_through_on_read(self):
        """Verify that existing legacy plaintext database values are read as-is without errors."""
        dummy_key = crypto.derive_cryptographic_key("test-key")
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        mock_aesgcm = AESGCM(dummy_key)
        
        with patch.object(crypto, "ENCRYPTION_ENABLED", True), \
             patch.object(crypto, "_aesgcm", mock_aesgcm):
            
            legacy_plaintext = "Old plaintext ticket from database."
            decrypted = crypto.decrypt_value(legacy_plaintext)
            self.assertEqual(decrypted, legacy_plaintext)

    def test_transparent_client_wrapping(self):
        """Test that the WrappedRequestBuilder hooks execute queries correctly."""
        dummy_key = crypto.derive_cryptographic_key("test-key")
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        mock_aesgcm = AESGCM(dummy_key)
        
        with patch.object(crypto, "ENCRYPTION_ENABLED", True), \
             patch.object(crypto, "_aesgcm", mock_aesgcm):
            
            # Mock table/builder response
            mock_builder = MagicMock()
            mock_builder.insert.return_value = mock_builder
            mock_builder.execute.return_value = MagicMock(data=[
                {"description": crypto.encrypt_value("Success")}
            ])
            
            wrapped = crypto.WrappedRequestBuilder(mock_builder, "tickets")
            
            # Test insert wraps the payload
            payload = {"description": "Sensitive content"}
            res = wrapped.insert(payload)
            
            # The underlying mock insert should receive the encrypted description
            mock_builder.insert.assert_called_once()
            called_arg = mock_builder.insert.call_args[0][0]
            self.assertTrue(called_arg["description"].startswith("enc:v1:"))
            
            # Test execute decrypts the returned data
            exec_res = res.execute()
            self.assertEqual(exec_res.data[0]["description"], "Success")
