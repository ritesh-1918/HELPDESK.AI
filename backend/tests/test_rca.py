import sys
import os
import pytest
import datetime

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.log_analysis_service import LogAnalysisService
from backend.services.pattern_recognition_service import PatternRecognitionService
from backend.services.knowledge_graph_service import KnowledgeGraphService
from backend.services.gemini_service import GeminiService
from backend.services.root_cause_analysis_service import RootCauseAnalysisService

@pytest.fixture
def log_service():
    return LogAnalysisService()

@pytest.fixture
def pattern_service():
    return PatternRecognitionService()

@pytest.fixture
def graph_service():
    return KnowledgeGraphService()

@pytest.fixture
def rca_service(log_service, pattern_service, graph_service):
    gemini = GeminiService() # Will use fallback since API key is not configured in test env
    return RootCauseAnalysisService(
        gemini_service=gemini,
        knowledge_graph_service=graph_service,
        log_analysis_service=log_service,
        pattern_recognition_service=pattern_service
    )

def test_log_parsing(log_service):
    """Test parsing of different log formats."""
    # 1. Test JSON log format
    json_log = '{"timestamp": "2026-06-13T09:15:00Z", "level": "ERROR", "source": "auth-service", "message": "database pool exhausted", "error_code": "DB_POOL_ERR"}'
    parsed_json = log_service.parse_log_line(json_log)
    assert parsed_json["level"] == "ERROR"
    assert parsed_json["source"] == "auth-service"
    assert parsed_json["error_code"] == "DB_POOL_ERR"

    # 2. Test Syslog format
    syslog_line = "2026-06-13 09:15:01 [CRITICAL] MySQL-Prod: Connection timeout error_code: 0x80004005"
    parsed_syslog = log_service.parse_log_line(syslog_line)
    assert parsed_syslog["level"] == "CRITICAL"
    assert parsed_syslog["source"] == "MySQL-Prod"
    assert "timeout" in parsed_syslog["message"]
    assert parsed_syslog["error_code"] == "0x80004005"

    # 3. Test generic fallback format
    fallback_line = "[WARNING] disk usage at 92%"
    parsed_fallback = log_service.parse_log_line(fallback_line)
    assert parsed_fallback["level"] == "WARNING"
    assert "disk usage" in parsed_fallback["message"]

def test_log_ingest_and_correlation(log_service):
    """Test log ingestion and correlation logic."""
    raw_logs = (
        "2026-06-13 09:15:01 [ERROR] database_prod_01: Connection timeout to mysql-db-prod\n"
        "2026-06-13 09:15:05 [INFO] server_01: Health check OK\n"
    )
    ingested = log_service.ingest_logs(raw_logs)
    assert ingested == 2
    
    # Correlate logs with a CRM database issue
    ticket_text = "CRM query failed timeout"
    entities = [{"canonical_id": "database_prod_01", "entity": "DB-01", "type": "DATABASE"}]
    
    correlated = log_service.correlate_logs(ticket_text, entities)
    assert len(correlated) >= 1
    assert any("database_prod_01" in log["source"] for log in correlated)

def test_pattern_clustering(pattern_service):
    """Test grouping similar tickets into systemic patterns."""
    tickets = [
        {"id": "t1", "category": "Hardware", "subcategory": "Printer", "subject": "Floor 3 printer offline"},
        {"id": "t2", "category": "Hardware", "subcategory": "Printer", "subject": "Printer timeout on floor 3"},
        {"id": "t3", "category": "Hardware", "subcategory": "Printer", "subject": "Cannot print on Floor 3"},
        {"id": "t4", "category": "Software", "subcategory": "Email", "subject": "Cannot access email"}
    ]
    
    patterns = pattern_service.detect_patterns(tickets)
    assert len(patterns) >= 1
    
    printer_pattern = next((p for p in patterns if "Hardware Failures" in p["category"]), None)
    assert printer_pattern is not None
    assert printer_pattern["ticket_count"] >= 3
    assert printer_pattern["confidence"] > 0.5

def test_failure_propagation(graph_service):
    """Validate graph BFS failure propagation traversal."""
    # database_prod_01 -> crm_service dependency runs downstream
    propagation = graph_service.analyze_failure_propagation("database_prod_01")
    assert propagation["root_cause_node"] == "database_prod_01"
    
    # CRM Service depends on database_prod_01, so it should be affected
    assert "CRM Service" in propagation["affected_services"]
    
    # Timeline should show database error first, then CRM service degradation
    timeline = propagation["timeline"]
    assert len(timeline) >= 2
    assert timeline[0]["node"] == "database_prod_01"
    assert "Root Incident" in timeline[0]["event"]

def test_rca_orchestration(rca_service):
    """Verify end-to-end Root Cause Analysis outputs with confidence score checks."""
    ticket_text = "CRM service connection error"
    entities = [{"canonical_id": "database_prod_01", "entity": "DB-01", "type": "DATABASE"}]
    
    analysis = rca_service.analyze_incident(
        ticket_text=ticket_text,
        ticket_id="ticket_101",
        ticket_category="Software",
        linked_entities=entities
    )
    
    assert analysis["ticket_id"] == "ticket_101"
    assert len(analysis["hypotheses"]) >= 1
    
    top_h = analysis["hypotheses"][0]
    assert "hypothesis" in top_h
    assert top_h["confidence"] > 0.4
    assert len(top_h["evidence"]) >= 1
    assert "explanation" in top_h
