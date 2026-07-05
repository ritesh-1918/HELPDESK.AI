import os
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv

class RagService:
    def __init__(self):
        self.model = None
        self._loaded = False
        self._load_failed = False
        
        load_dotenv()
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if url and key:
            self.supabase: Client = create_client(url, key)
        else:
            self.supabase = None

    def is_available(self) -> bool:
        """Check if the model is available for RAG queries."""
        return self._loaded and not self._load_failed

    def load(self):
        """Load the SentenceTransformer model for knowledge base queries."""
        if self._loaded or self._load_failed:
            return
        
        print("[RAG] Loading SentenceTransformer for Knowledge Base...")
        try:
            # Check if a local model path is provided
            model_path = os.environ.get("SENTENCE_TRANSFORMER_MODEL_PATH")
            if model_path and os.path.exists(model_path):
                print(f"[RAG] Loading from local path: {model_path}")
                self.model = SentenceTransformer(model_path)
            else:
                # Download from HuggingFace
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self._loaded = True
            print("[RAG] Model loaded successfully.")
        except Exception as e:
            allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
            self._load_failed = True
            print(f"[RAG] Failed to load model: {e}")
            if allow_degraded:
                print("[RAG] DEGRADED: Continuing without model (ALLOW_DEGRADED_STARTUP=1)")
                self.model = None
                self._loaded = False
            else:
                raise

    def search_knowledge_base(self, text: str, threshold: float = 0.85, match_count: int = 1):
        """
        Embed the input text and query Supabase for a matching article.
        Returns the article text if found above threshold, else None.
        """
        if not self._loaded or not self.supabase:
            if self._load_failed:
                print("[RAG] DEGRADED: Knowledge base search skipped (model not available)")
            return None

        try:
            # Generate Embedding vector (list of 384 floats)
            vector = self.model.encode(text).tolist()

            # Call the Supabase RPC function we created in SQL
            response = self.supabase.rpc(
                'match_articles',
                {
                    'query_embedding': vector,
                    'match_threshold': threshold,
                    'match_count': match_count
                }
            ).execute()

            if response.data and len(response.data) > 0:
                best_match = response.data[0]
                return {
                    "id": best_match["id"],
                    "title": best_match["title"],
                    "content": best_match["content"],
                    "similarity": best_match["similarity"]
                }
                
            return None
            
        except Exception as e:
            print(f"[RAG ERROR] Query failed: {e}")
            return None
