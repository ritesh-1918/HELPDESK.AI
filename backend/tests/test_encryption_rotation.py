import os
import json
import base64
import unittest
from unittest.mock import patch, MagicMock

# Force test secret key in environment
os.environ["DB_ENCRYPTION_SECRET_KEY"] = "super-secret-test-key-32-bytes"

from backend.security.kms_client import LocalKMSProvider, get_kms_provider
from backend.security.encryption_manager import (
    get_master_key,
    derive_tenant_key,
    derive_dek,
    encrypt_field,
    decrypt_field,
    clear_caches,
)
from backend.scripts.rotate_keys import run_rotation

class TestEncryptionRotation(unittest.TestCase):
    def setUp(self):
        clear_caches()
        # Reset context var
        from backend.security.encryption_manager import request_context
        request_context.set({})

    def tearDown(self):
        clear_caches()

    def test_local_kms_provider(self):
        """Test LocalKMSProvider encryption and decryption."""
        key = b"1" * 32
        kms = LocalKMSProvider(key)
        plaintext = b"sensitive credentials"
        ciphertext = kms.encrypt(plaintext)
        self.assertNotEqual(plaintext, ciphertext)
        self.assertTrue(len(ciphertext) > 12)
        
        decrypted = kms.decrypt(ciphertext)
        self.assertEqual(plaintext, decrypted)

    def test_kms_provider_configuration(self):
        """Test KMS provider factory resolves correctly based on environment variables."""
        with patch.dict(os.environ, {"KMS_PROVIDER": "local"}):
            provider = get_kms_provider()
            self.assertIsInstance(provider, LocalKMSProvider)

    def test_key_derivation_and_isolation(self):
        """Test tenant key derivation and isolation."""
        master_key = b"m" * 32
        
        # Unique keys per tenant
        tenant_a_key = derive_tenant_key(master_key, "tenant-a")
        tenant_b_key = derive_tenant_key(master_key, "tenant-b")
        
        self.assertEqual(len(tenant_a_key), 32)
        self.assertEqual(len(tenant_b_key), 32)
        self.assertNotEqual(tenant_a_key, tenant_b_key)
        
        # Unique DEKs per version
        dek_v1 = derive_dek(tenant_a_key, "tenant-a", 1)
        dek_v2 = derive_dek(tenant_a_key, "tenant-a", 2)
        
        self.assertEqual(len(dek_v1), 32)
        self.assertEqual(len(dek_v2), 32)
        self.assertNotEqual(dek_v1, dek_v2)

    @patch("backend.security.encryption_manager.get_active_key_version")
    @patch("backend.security.encryption_manager.get_master_key")
    def test_versioned_encryption_decryption(self, mock_master_key, mock_active_version):
        """Test that versioned encryption writes structured JSON metadata and decrypts it correctly."""
        mock_master_key.return_value = b"m" * 32
        mock_active_version.return_value = 5
        
        plain = "Top secret document"
        encrypted_json_str = encrypt_field(plain, tenant_id="company-123", field_name="description")
        
        # Verify JSON metadata format
        self.assertTrue(encrypted_json_str.startswith("{"))
        payload = json.loads(encrypted_json_str)
        self.assertIn("ciphertext", payload)
        self.assertIn("iv", payload)
        self.assertIn("tag", payload)
        self.assertEqual(payload["key_version"], 5)
        
        # Decrypt check
        decrypted = decrypt_field(encrypted_json_str, tenant_id="company-123", field_name="description")
        self.assertEqual(decrypted, plain)

    def test_legacy_fallback_decryption(self):
        """Test that legacy unversioned ciphertext falls back to DB_ENCRYPTION_SECRET_KEY decrypt."""
        from backend.auth.crypto import _cipher as legacy_cipher
        
        plain = "Legacy unversioned data"
        nonce = os.urandom(12)
        legacy_enc_bytes = legacy_cipher.encrypt(nonce, plain.encode(), None)
        legacy_b64 = base64.b64encode(nonce + legacy_enc_bytes).decode('utf-8')
        
        # Decrypting via the new decrypt_field should gracefully fall back to legacy decrypt
        decrypted = decrypt_field(legacy_b64, tenant_id="some-tenant", field_name="raw_text")
        self.assertEqual(decrypted, plain)

    @patch("backend.security.encryption_manager.is_key_version_retired")
    @patch("backend.security.encryption_manager.get_active_key_version")
    @patch("backend.security.encryption_manager.get_master_key")
    def test_retired_keys_prevent_decryption(self, mock_master_key, mock_active_version, mock_retired):
        """Test that retired key versions refuse to decrypt fields."""
        mock_master_key.return_value = b"m" * 32
        mock_active_version.return_value = 1
        
        plain = "Expired clearance details"
        encrypted = encrypt_field(plain, tenant_id="company-abc", field_name="contact_email")
        
        # Set retired cache mock to True for version 1
        mock_retired.return_value = True
        
        decrypted = decrypt_field(encrypted, tenant_id="company-abc", field_name="contact_email")
        # Decryption should fail and return the encrypted payload string as-is
        self.assertEqual(decrypted, encrypted)

    @patch("backend.scripts.rotate_keys.create_client")
    @patch.dict(os.environ, {"SUPABASE_URL": "https://dummy.supabase.co", "SUPABASE_SERVICE_ROLE_KEY": "dummy-key"})
    def test_key_rotation_sweep_reencryption(self, mock_create_client):
        """Test the rotate_keys.py script execution and re-encryption logic."""
        mock_supabase = MagicMock()
        mock_create_client.return_value = mock_supabase
        
        # Mock database tickets payload
        # Ticket 1: legacy unversioned format
        # Ticket 2: versioned but outdated key (version 1 when active is 2)
        # Ticket 3: already up-to-date (version 2 when active is 2)
        from backend.auth.crypto import _cipher as legacy_cipher
        nonce = os.urandom(12)
        legacy_ciphertext = base64.b64encode(nonce + legacy_cipher.encrypt(nonce, b"legacy@help.com", None)).decode('utf-8')
        
        # Generate versioned ciphertext using version 1 DEK
        with patch("backend.security.encryption_manager.get_active_key_version", return_value=1):
            outdated_ciphertext = encrypt_field("Outdated PII description", tenant_id="tenant-1", field_name="description")
            
        with patch("backend.security.encryption_manager.get_active_key_version", return_value=2):
            uptodate_ciphertext = encrypt_field("Uptodate raw text", tenant_id="tenant-1", field_name="raw_text")
            
        mock_tickets_data = [
            {
                "id": "ticket-legacy",
                "company_id": "tenant-1",
                "contact_email": legacy_ciphertext,
                "description": None,
                "raw_text": None,
            },
            {
                "id": "ticket-outdated",
                "company_id": "tenant-1",
                "contact_email": None,
                "description": outdated_ciphertext,
                "raw_text": None,
            },
            {
                "id": "ticket-current",
                "company_id": "tenant-1",
                "contact_email": None,
                "description": None,
                "raw_text": uptodate_ciphertext,
            }
        ]
        
        mock_supabase.table().select().execute.return_value.data = mock_tickets_data
        
        # Mock active key version is 2
        with patch("backend.security.encryption_manager.get_active_key_version", return_value=2), \
             patch("backend.scripts.rotate_keys.get_active_key_version", return_value=2):
            run_rotation()
            
        # Verify database updates were triggered for the outdated and legacy records
        self.assertTrue(mock_supabase.table().update.called)
        
        # Check updates called count
        update_calls = mock_supabase.table().update.call_args_list
        self.assertEqual(len(update_calls), 2)
        
        # Verify first call (legacy ticket re-encrypted)
        legacy_args = update_calls[0][0][0]
        self.assertIn("contact_email", legacy_args)
        payload = json.loads(legacy_args["contact_email"])
        self.assertEqual(payload["key_version"], 2)
        
        # Verify second call (outdated ticket re-encrypted)
        outdated_args = update_calls[1][0][0]
        self.assertIn("description", outdated_args)
        payload2 = json.loads(outdated_args["description"])
        self.assertEqual(payload2["key_version"], 2)

if __name__ == "__main__":
    unittest.main()
