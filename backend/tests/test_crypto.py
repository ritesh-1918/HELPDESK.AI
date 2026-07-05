import unittest
from unittest.mock import patch, MagicMock
import backend.auth.crypto as crypto

class TestCryptoPII(unittest.TestCase):
    
    @patch("backend.auth.crypto.encrypt")
    def test_encrypt_payload(self, mock_encrypt):
        mock_encrypt.side_effect = lambda val, tenant_id=None, field_name=None: f"enc_{val}"
        
        payload = {
            "contact_email": "user@domain.com",
            "description": "Critical issue",
            "raw_text": "Sensitive logs",
            "non_pii": "public text",
            "company_id": "company-1"
        }
        
        encrypted = crypto.encrypt_payload(payload)
        
        # Verify target fields are encrypted
        self.assertEqual(encrypted["contact_email"], "enc_user@domain.com")
        self.assertEqual(encrypted["description"], "enc_Critical issue")
        self.assertEqual(encrypted["raw_text"], "enc_Sensitive logs")
        
        # Verify non-target fields are untouched
        self.assertEqual(encrypted["non_pii"], "public text")
        self.assertEqual(encrypted["company_id"], "company-1")

    @patch("backend.auth.crypto.decrypt")
    def test_decrypt_payload(self, mock_decrypt):
        mock_decrypt.side_effect = lambda val, tenant_id=None, field_name=None: val.replace("enc_", "")
        
        payload = {
            "contact_email": "enc_user@domain.com",
            "description": "enc_Critical issue",
            "raw_text": "enc_Sensitive logs",
            "non_pii": "public text",
            "company_id": "company-1"
        }
        
        decrypted = crypto.decrypt_payload(payload)
        
        self.assertEqual(decrypted["contact_email"], "user@domain.com")
        self.assertEqual(decrypted["description"], "Critical issue")
        self.assertEqual(decrypted["raw_text"], "Sensitive logs")
        self.assertEqual(decrypted["non_pii"], "public text")
        self.assertEqual(decrypted["company_id"], "company-1")

    def test_graceful_decrypt_plaintext(self):
        """Verify decrypting plaintext returns it as-is."""
        plaintext = "normal plaintext"
        self.assertEqual(crypto.decrypt(plaintext), plaintext)

    @patch("backend.auth.crypto.encrypt")
    @patch("backend.auth.crypto.decrypt")
    def test_transparent_hooks(self, mock_decrypt, mock_encrypt):
        mock_encrypt.side_effect = lambda val, tenant_id=None, field_name=None: f"enc_{val}"
        mock_decrypt.side_effect = lambda val, tenant_id=None, field_name=None: val.replace("enc_", "")
        
        mock_builder = MagicMock()
        mock_builder.insert.return_value = mock_builder
        mock_builder.execute.return_value = MagicMock(data=[
            {"description": "enc_Success"}
        ])
        
        wrapped = crypto.WrappedRequestBuilder(mock_builder, "tickets")
        
        # Test insert wraps the payload
        payload = {"description": "Sensitive content"}
        res = wrapped.insert(payload)
        
        # The underlying mock insert should receive the encrypted description
        mock_builder.insert.assert_called_once()
        called_arg = mock_builder.insert.call_args[0][0]
        self.assertEqual(called_arg["description"], "enc_Sensitive content")
        
        # Test execute decrypts the returned data
        exec_res = res.execute()
        self.assertEqual(exec_res.data[0]["description"], "Success")

if __name__ == "__main__":
    unittest.main()
