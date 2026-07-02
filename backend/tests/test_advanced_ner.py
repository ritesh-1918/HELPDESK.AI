import sys
import os
import pytest
import time

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.advanced_ner_service import AdvancedNERService
from backend.services.entity_linking_service import EntityLinkingService
from backend.services.relationship_extraction_service import RelationshipExtractionService
from backend.services.knowledge_graph_service import KnowledgeGraphService

@pytest.fixture
def ner_service():
    return AdvancedNERService()

@pytest.fixture
def linking_service():
    return EntityLinkingService()

@pytest.fixture
def relationship_service():
    return RelationshipExtractionService()

@pytest.fixture
def graph_service():
    return KnowledgeGraphService()

def test_advanced_ner_extraction(ner_service):
    """Test that NER fallback extracts crucial support entities."""
    ticket_text = "Server-01 unreachable. CRM service reports connection timeout error 0x80004005."
    entities = ner_service.extract_entities(ticket_text)
    
    # Assertions
    assert len(entities) >= 3
    
    # Verify entity texts and types are captured
    entity_texts = [e["entity"].lower() for e in entities]
    entity_types = [e["type"] for e in entities]
    
    assert any("server-01" in text for text in entity_texts)
    assert any("crm" in text for text in entity_texts)
    assert any("0x80004005" in text for text in entity_texts)
    
    # Verify classifications
    assert "SERVER" in entity_types
    assert "APPLICATION" in entity_types or "SERVICE" in entity_types
    assert "ERROR_CODE" in entity_types

def test_entity_linking(ner_service, linking_service):
    """Test mapping of raw mentions and aliases to canonical IDs."""
    ticket_text = "DB-01 has queries failing. CRM is slow."
    extracted = ner_service.extract_entities(ticket_text)
    linked = linking_service.link_entities(extracted)
    
    # Check that DB-01 is linked to database_prod_01
    db_node = next((e for e in linked if e["entity"].lower() == "db-01"), None)
    assert db_node is not None
    assert db_node["canonical_id"] == "database_prod_01"
    assert db_node["team"] == "Database Administration"
    
    # Check that CRM is linked to crm_service
    crm_node = next((e for e in linked if e["entity"].lower() == "crm"), None)
    assert crm_node is not None
    assert crm_node["canonical_id"] == "crm_service"

def test_relationship_extraction(ner_service, linking_service, relationship_service):
    """Test identifying dependencies and cause-effect chains."""
    ticket_text = "CRM service runs on Server-01 and depends on MySQL-DB."
    extracted = ner_service.extract_entities(ticket_text)
    linked = linking_service.link_entities(extracted)
    rel_data = relationship_service.extract_relationships(ticket_text, linked)
    
    relationships = rel_data["relationships"]
    
    # Verify relationships found
    assert len(relationships) >= 1
    rel_types = [r["type"] for r in relationships]
    
    # Check at least one of these runs_on/depends_on relationships is correctly identified
    assert any(rt in ["runs_on", "depends_on", "connected_to"] for rt in rel_types)

def test_graph_query_performance_and_accuracy(graph_service):
    """Validate graph querying traversals and performance latency under 200ms."""
    # 1. Dependency query
    start_time = time.time()
    res_dependent = graph_service.query_graph("dependent_services", "database_prod_01")
    duration_ms = (time.time() - start_time) * 1000
    
    # Assertions
    assert duration_ms < 200.0  # Performance target < 200ms
    assert len(res_dependent["results"]) >= 1
    
    # Verify that CRM service depends on MySQL-DB
    dependent_ids = [n["id"] for n in res_dependent["results"]]
    assert "crm_service" in dependent_ids

    # 2. Root cause query
    start_time = time.time()
    res_root = graph_service.query_graph("root_causes", "crm_service")
    duration_ms = (time.time() - start_time) * 1000
    
    assert duration_ms < 200.0
