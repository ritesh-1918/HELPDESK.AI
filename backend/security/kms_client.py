import os
import logging

logger = logging.getLogger(__name__)

class KMSProvider:
    """Base provider interface for KMS operations."""
    def encrypt(self, plaintext: bytes) -> bytes:
        raise NotImplementedError()
        
    def decrypt(self, ciphertext: bytes) -> bytes:
        raise NotImplementedError()

class LocalKMSProvider(KMSProvider):
    """
    Fallback local KMS provider that simulates cloud KMS using AES-GCM.
    Uses the local environment DB_ENCRYPTION_SECRET_KEY as the root.
    """
    def __init__(self, key: bytes):
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        self.key = key
        self.aes = AESGCM(self.key)
        
    def encrypt(self, plaintext: bytes) -> bytes:
        nonce = os.urandom(12)
        encrypted = self.aes.encrypt(nonce, plaintext, None)
        return nonce + encrypted
        
    def decrypt(self, ciphertext: bytes) -> bytes:
        if len(ciphertext) < 12:
            raise ValueError("Ciphertext too short for local KMS decrypt")
        nonce = ciphertext[:12]
        encrypted = ciphertext[12:]
        return self.aes.decrypt(nonce, encrypted, None)

class AWSKMSProvider(KMSProvider):
    """AWS Key Management Service wrapper."""
    def __init__(self, key_id: str):
        self.key_id = key_id
        try:
            import boto3
            self.client = boto3.client('kms')
        except ImportError:
            logger.error("boto3 package not installed. AWS KMS is unavailable.")
            raise ImportError("Please install 'boto3' to use AWS KMS.")
        
    def encrypt(self, plaintext: bytes) -> bytes:
        response = self.client.encrypt(
            KeyId=self.key_id,
            Plaintext=plaintext
        )
        return response['CiphertextBlob']
        
    def decrypt(self, ciphertext: bytes) -> bytes:
        response = self.client.decrypt(
            CiphertextBlob=ciphertext
        )
        return response['Plaintext']

class AzureKeyVaultProvider(KMSProvider):
    """Azure Key Vault wrapper."""
    def __init__(self, vault_url: str, key_name: str):
        self.vault_url = vault_url
        self.key_name = key_name
        try:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.keys import KeyClient
            from azure.keyvault.keys.cryptography import CryptographyClient
            
            credential = DefaultAzureCredential()
            self.key_client = KeyClient(vault_url=self.vault_url, credential=credential)
            key = self.key_client.get_key(self.key_name)
            self.crypto_client = CryptographyClient(key, credential)
        except ImportError:
            logger.error("azure-identity or azure-keyvault-keys package not installed. Azure Key Vault is unavailable.")
            raise ImportError("Please install 'azure-identity' and 'azure-keyvault-keys' to use Azure Key Vault.")
        
    def encrypt(self, plaintext: bytes) -> bytes:
        from azure.keyvault.keys.cryptography import EncryptionAlgorithm
        result = self.crypto_client.encrypt(EncryptionAlgorithm.rsa_oaep_256, plaintext)
        return result.ciphertext
        
    def decrypt(self, ciphertext: bytes) -> bytes:
        from azure.keyvault.keys.cryptography import EncryptionAlgorithm
        result = self.crypto_client.decrypt(EncryptionAlgorithm.rsa_oaep_256, ciphertext)
        return result.plaintext

class GoogleCloudKMSProvider(KMSProvider):
    """Google Cloud Key Management Service wrapper."""
    def __init__(self, key_name: str):
        self.key_name = key_name
        try:
            from google.cloud import kms
            self.client = kms.KeyManagementServiceClient()
        except ImportError:
            logger.error("google-cloud-kms package not installed. GCP KMS is unavailable.")
            raise ImportError("Please install 'google-cloud-kms' to use GCP KMS.")
        
    def encrypt(self, plaintext: bytes) -> bytes:
        response = self.client.encrypt(
            request={'name': self.key_name, 'plaintext': plaintext}
        )
        return response.ciphertext
        
    def decrypt(self, ciphertext: bytes) -> bytes:
        response = self.client.decrypt(
            request={'name': self.key_name, 'ciphertext': ciphertext}
        )
        return response.plaintext

def get_kms_provider() -> KMSProvider:
    """Instantiate and return the configured KMS provider based on environment variables."""
    provider_type = os.environ.get("KMS_PROVIDER", "local").strip().lower()
    
    if provider_type == "aws":
        key_id = os.environ.get("AWS_KMS_KEY_ID")
        if not key_id:
            raise ValueError("AWS_KMS_KEY_ID environment variable not set")
        return AWSKMSProvider(key_id)
        
    elif provider_type == "azure":
        vault_url = os.environ.get("AZURE_KEYVAULT_URL")
        key_name = os.environ.get("AZURE_KEY_NAME")
        if not vault_url or not key_name:
            raise ValueError("AZURE_KEYVAULT_URL or AZURE_KEY_NAME environment variable not set")
        return AzureKeyVaultProvider(vault_url, key_name)
        
    elif provider_type == "gcp":
        key_name = os.environ.get("GCP_KMS_KEY_NAME")
        if not key_name:
            raise ValueError("GCP_KMS_KEY_NAME environment variable not set")
        return GoogleCloudKMSProvider(key_name)
        
    else:
        # Local KMS requires DB_ENCRYPTION_SECRET_KEY to be explicitly set
        secret = os.environ.get("DB_ENCRYPTION_SECRET_KEY")
        if not secret:
            raise ValueError(
                "DB_ENCRYPTION_SECRET_KEY environment variable not set. "
                "Encryption requires a configured key. Generate one with: "
                "python3 -c \"import secrets; print(secrets.token_hex(32))\""
            )
        import hashlib
        key_bytes = hashlib.sha256(secret.encode()).digest()
        return LocalKMSProvider(key_bytes)
