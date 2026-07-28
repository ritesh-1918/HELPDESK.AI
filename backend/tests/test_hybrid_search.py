import time
import sys
import os
import unittest

# Ensure root is on path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.query_expansion_service import QueryExpansionService
from backend.services.hybrid_search_service import HybridSearchService
from backend.services.reranker_service import RerankerService
from backend.services.kb_integration_service import KBIntegrationService
from backend.services.rag_service import RagService

class TestHybridSearchAndRAG(unittest.TestCase):
    def setUp(self):
        self.expansion_svc = QueryExpansionService()
        self.hybrid_svc = HybridSearchService()
        self.reranker_svc = RerankerService()
        self.kb_svc = KBIntegrationService()

    def test_query_expansion(self):
        """Test synonym and error code query expansion."""
        # Test VPN synonym expansion
        expanded_vpn = self.expansion_svc.expand_query("VPN connection issue")
        self.assertIn("virtual private network", expanded_vpn.lower())
        self.assertIn("anyconnect", expanded_vpn.lower())

        # Test Error Code mapping
        expanded_err = self.expansion_svc.expand_query("getting ERR_1024 on checkout")
        self.assertIn("vpn timeout", expanded_err.lower())
        self.assertIn("err_1024", expanded_err.lower())

        # Test capitalization independence
        expanded_caps = self.expansion_svc.expand_query("PRINTER OFFLINE")
        self.assertIn("print spooler", expanded_caps.lower())

    def test_hybrid_scoring_logic(self):
        """Test the hybrid scoring formula: 0.60 * vector_score + 0.40 * keyword_score."""
        candidates = [
            {"title": "Printer Troubleshooting", "content": "Steps to resolve offline printer print spooler errors", "source": "Notion", "similarity": 0.8},
            {"title": "VPN Guide", "content": "How to connect safely using Cisco AnyConnect VPN client", "source": "Confluence", "similarity": 0.3}
        ]
        
        # Query matching printer
        results = self.hybrid_svc.search(
            query="printer offline print spooler",
            query_embedding=[0.1] * 384,  # mock vector
            candidates=candidates,
            model=None
        )

        self.assertEqual(len(results), 2)
        # Printer should rank first due to higher similarity AND BM25 keyword matching
        self.assertEqual(results[0]["title"], "Printer Troubleshooting")
        
        # Verify weight formula: 0.6 * similarity + 0.4 * keyword
        # Printer similarity = 0.8, keyword match should be 1.0 (max BM25)
        # Score = 0.6 * 0.8 + 0.4 * 1.0 = 0.88
        self.assertAlmostEqual(results[0]["confidence"], 0.88, places=2)

    def test_reranker_sorting(self):
        """Test intelligent re-ranking using multiple dimensions."""
        candidates = [
            {
                "title": "Old VPN Guide",
                "content": "VPN setups",
                "source": "Ticket",
                "confidence": 0.75,
                "created_at": "2020-01-01T00:00:00Z",  # very old ticket
                "resolution_effectiveness": "50%"
            },
            {
                "title": "New High-Quality VPN Guide",
                "content": "Complete steps to solve VPN AnyConnect disconnect timeouts and security configurations",
                "source": "Confluence",
                "confidence": 0.70,
                "created_at": "2026-06-13T00:00:00Z",  # fresh article
                "resolution_effectiveness": "95%"
            }
        ]

        reranked = self.reranker_svc.rerank("VPN timeout", candidates, limit=2)
        self.assertEqual(len(reranked), 2)
        
        # The New High-Quality Guide has higher keyword overlap, higher effectiveness, 
        # and better recency/document quality, so it should rerank to #1
        self.assertEqual(reranked[0]["title"], "New High-Quality VPN Guide")
        self.assertGreater(reranked[0]["confidence"], reranked[1]["confidence"])

    def test_performance_latency_10k_docs(self):
        """Verify that hybrid search and reranking on 10,000+ items executes under 500ms."""
        # Generate 10,000 mock documents
        mock_docs = []
        for i in range(10000):
            mock_docs.append({
                "title": f"Document Title {i}",
                "content": f"This is some standard content text for mock document {i} with key term printer and database",
                "source": "Ticket" if i % 2 == 0 else "Confluence",
                "similarity": 0.15 + (i % 10) * 0.05,  # mock similarity in [0.15, 0.6]
                "created_at": "2026-05-31T00:00:00Z"
            })

        # Append one matching target document
        mock_docs.append({
            "title": "VPN Connectivity troubleshooting runbook for ERR_1024",
            "content": "Runbook details on how to resolve VPN timeouts and connection errors.",
            "source": "Confluence",
            "similarity": 0.85,
            "created_at": "2026-06-13T00:00:00Z"
        })

        query = "VPN connectivity guide ERR_1024"
        query_vector = [0.05] * 384

        start_time = time.time()

        # Step 1: Query expansion
        expanded_query = self.expansion_svc.expand_query(query)
        
        # Step 2: Hybrid Search Scorer
        hybrid_scored = self.hybrid_svc.search(
            query=expanded_query,
            query_embedding=query_vector,
            candidates=mock_docs,
            model=None
        )

        # Step 3: Rerank top 50 down to 5
        reranked = self.reranker_svc.rerank(expanded_query, hybrid_scored[:50], limit=5)

        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000
        
        print(f"\n[LATENCY REPORT] Processed 10,001 items in {latency_ms:.2f}ms")
        
        # Check targets
        self.assertLess(latency_ms, 500.0, f"Search latency exceeded 500ms limit! Took {latency_ms:.2f}ms")
        self.assertEqual(len(reranked), 5)
        # Target doc should be #1
        self.assertEqual(reranked[0]["title"], "VPN Connectivity troubleshooting runbook for ERR_1024")

if __name__ == "__main__":
    unittest.main()
