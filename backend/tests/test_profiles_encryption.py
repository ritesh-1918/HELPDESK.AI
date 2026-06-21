import unittest
from unittest.mock import patch, MagicMock
import backend.auth.crypto as crypto

class TestProfilesCryptoPII(unittest.TestCase):
    
    @patch("backend.auth.crypto.encrypt")
    def test_encrypt_profiles_payload(self, mock_encrypt):
        mock_encrypt.side_effect = lambda val, tenant_id=None, field_name=None: f"enc_{val}"
        
        payload = {
            "email": "user@domain.com",
            "full_name": "John Doe",
            "phone": "1234567890",
            "non_pii": "public text",
            "company_id": "company-1"
        }
        
        encrypted = crypto.encrypt_payload(payload, "profiles")
        
        # Verify target fields are encrypted
        self.assertEqual(encrypted["email"], "enc_user@domain.com")
        self.assertEqual(encrypted["full_name"], "enc_John Doe")
        self.assertEqual(encrypted["phone"], "enc_1234567890")
        
        # Verify non-target fields are untouched
        self.assertEqual(encrypted["non_pii"], "public text")
        self.assertEqual(encrypted["company_id"], "company-1")

    @patch("backend.auth.crypto.decrypt")
    def test_decrypt_profiles_payload(self, mock_decrypt):
        mock_decrypt.side_effect = lambda val, tenant_id=None, field_name=None: val.replace("enc_", "")
        
        payload = {
            "email": "enc_user@domain.com",
            "full_name": "enc_John Doe",
            "phone": "enc_1234567890",
            "non_pii": "public text",
            "company_id": "company-1"
        }
        
        decrypted = crypto.decrypt_payload(payload, "profiles")
        
        self.assertEqual(decrypted["email"], "user@domain.com")
        self.assertEqual(decrypted["full_name"], "John Doe")
        self.assertEqual(decrypted["phone"], "1234567890")
        self.assertEqual(decrypted["non_pii"], "public text")
        self.assertEqual(decrypted["company_id"], "company-1")

    @patch("backend.auth.crypto.encrypt")
    @patch("backend.auth.crypto.decrypt")
    def test_profiles_transparent_hooks(self, mock_decrypt, mock_encrypt):
        mock_encrypt.side_effect = lambda val, tenant_id=None, field_name=None: f"enc_{val}"
        mock_decrypt.side_effect = lambda val, tenant_id=None, field_name=None: val.replace("enc_", "")
        
        mock_builder = MagicMock()
        mock_builder.insert.return_value = mock_builder
        mock_builder.execute.return_value = MagicMock(data=[
            {"full_name": "enc_John Doe"}
        ])
        
        wrapped = crypto.WrappedRequestBuilder(mock_builder, "profiles")
        
        # Test insert wraps the payload
        payload = {"full_name": "John Doe"}
        res = wrapped.insert(payload)
        
        # The underlying mock insert should receive the encrypted description
        mock_builder.insert.assert_called_once()
        called_arg = mock_builder.insert.call_args[0][0]
        self.assertEqual(called_arg["full_name"], "enc_John Doe")
        
        # Test execute decrypts the returned data
        exec_res = res.execute()
        self.assertEqual(exec_res.data[0]["full_name"], "John Doe")

if __name__ == "__main__":
    unittest.main()
