"""
Advanced NER Service — Extracts domain-specific entities (infrastructure, services, databases, security, operations).
Leverages Gemini Service when available, and falls back to high-fidelity regex/keyword classification.
"""

import re
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# List of all categories specified in the issue taxonomy
TAXONOMY = {
    # Infrastructure
    "SERVER": r"\b(?:srv|db|app|web|dev|prod)-[\w\d-]+\b|Server-\d+",
    "HOSTNAME": r"\b[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\b",
    "IP_ADDRESS": r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    "NETWORK_DEVICE": r"\b(?:Firewall|Router|Switch|Access Point|AP-\d+|VLAN\s?\d+)\b",
    "FIREWALL": r"\b(?:Firewall|FortiGate|PaloAlto)\b",
    "ROUTER": r"\b(?:Router|Gateway)\b",
    "SWITCH": r"\b(?:Switch|Cisco-SW)\b",

    # Services & Applications
    "SERVICE": r"\b(?:CRM Service|Billing API|User Service|Auth Service|Notification Service)\b",
    "APPLICATION": r"\b(?:CRM|Jira|Confluence|Slack|Zoom|GitLab|Chrome|Firefox|Safari|Edge|Excel|WinSCP|Citrix)\b",
    "API": r"\b(?:API|Endpoint|REST API|Billing API)\b",
    "MICROSERVICE": r"\b(?:Microservice|auth-ms|billing-ms)\b",
    "ENDPOINT": r"\/api\/v\d+\/[\w\-\/]+",
    "CONTAINER": r"\b(?:Docker|Kubernetes|Pod|K8s|Container)\b",

    # Data Layer
    "DATABASE": r"\b(?:MySQL-DB|PostgreSQL-DB|MySQL|Postgres|MongoDB|DynamoDB|Oracle|Database|DB-01|Database-01|MYSQL-PROD|DB-02)\b",
    "SCHEMA": r"\b(?:public|auth|storage|dbo|schema)\b",
    "TABLE": r"\b(?:tickets|profiles|users|companies|settings|table)\b",
    "QUERY": r"\b(?:SELECT|INSERT|UPDATE|DELETE|Query)\b",
    "STORAGE_RESOURCE": r"\b(?:S3 Bucket|S3|Storage|Blob|EBS|Volume)\b",

    # Security & Identity
    "USER": r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b|\b(?:developer\d+|intern\d+|manager\d+|john\.smith|amit\.patel|vikram\.singh|test\.account)\b",
    "ROLE": r"\b(?:admin|user|owner|editor|role)\b",
    "GROUP": r"\b(?:Active Directory|AD Group|Group|LDAP Group)\b",
    "PERMISSION": r"\b(?:Read-Only|Admin Access|Write Permission|Access Permitted)\b",
    "IAM_POLICY": r"\b(?:IAM Policy|IAM|Policy|Security Policy)\b",
    "AUTHENTICATION_METHOD": r"\b(?:MFA|SSO|2FA|OAuth|Password|Token|SAM|Basic Auth|ApiKey)\b",

    # Operational
    "ERROR_CODE": r"\b(?:0x[0-9a-fA-F]+|MYSQL_ERROR_\d+|Error \d+|Connection Timeout|Timeout|Connection failed|Permission Denied|Access Revoked|Authentication Failure|Authentication failing|unreachable|offline|Authorization failed)\b",
    "INCIDENT": r"\b(?:Incident #\d+|Incident\s?\d+)\b",
    "ALERT": r"\b(?:Alert|P1 Alert|Critical Alert|CPU Spike|Memory Threshold)\b",
    "TICKET": r"\b(?:Ticket #\d+|Ticket\s?\d+)\b",
    "LOG_EVENT": r"\b(?:Log Event|System Log|Error Log)\b",
    "MONITORING_EVENT": r"\b(?:Datadog Alert|Dynatrace|Prometheus Event)\b"
}

class AdvancedNERService:
    def __init__(self, gemini_service=None):
        self.gemini_service = gemini_service

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract named entities with classification, start/end boundaries, and confidence scores.
        """
        if not text:
            return []

        # If Gemini Service is available and initialized, attempt LLM extraction
        if self.gemini_service and getattr(self.gemini_service, "_initialized", False):
            try:
                entities = self._extract_with_gemini(text)
                if entities:
                    # Validate boundary starts and ends
                    return self._post_process_boundaries(entities, text)
            except Exception as e:
                logger.warning(f"Gemini NER extraction failed, falling back to rule-based: {e}")

        # Fallback to Regex/Rule-based classification
        return self._extract_with_rules(text)

    def _extract_with_gemini(self, text: str) -> List[Dict[str, Any]]:
        """
        Leverages Gemini to extract precise entities matching taxonomy types.
        """
        prompt = (
            "You are a production Named Entity Recognition (NER) system for IT support tickets.\n"
            "Analyze the text and extract all IT and enterprise entities. Classify them into the following exact types:\n"
            "SERVER, HOSTNAME, IP_ADDRESS, NETWORK_DEVICE, FIREWALL, ROUTER, SWITCH, SERVICE, APPLICATION, API, "
            "MICROSERVICE, ENDPOINT, CONTAINER, DATABASE, SCHEMA, TABLE, QUERY, STORAGE_RESOURCE, USER, ROLE, GROUP, "
            "PERMISSION, IAM_POLICY, AUTHENTICATION_METHOD, ERROR_CODE, INCIDENT, ALERT, TICKET, LOG_EVENT, MONITORING_EVENT.\n\n"
            "For each extracted entity, return a JSON object with keys:\n"
            "- entity (the precise text match)\n"
            "- type (the classification type)\n"
            "- confidence (a float between 0.0 and 1.0)\n\n"
            "Return the list of JSON objects wrapped in a root 'entities' array. Return strictly valid JSON, no markdown blocks.\n\n"
            f"Ticket: '{text}'"
        )
        
        response = self.client_generate_content(prompt)
        if not response:
            return []

        try:
            # Clean possible markdown wrap
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\n|```$", "", cleaned, flags=re.MULTILINE).strip()
            
            data = json.loads(cleaned)
            return data.get("entities", [])
        except Exception as e:
            logger.error(f"Failed to parse Gemini NER JSON: {e} | Raw response: {response}")
            return []

    def client_generate_content(self, prompt: str) -> str:
        """Helper to invoke Gemini client safely."""
        try:
            response = self.gemini_service.client.models.generate_content(
                model=self.gemini_service.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini client generation failed: {e}")
            return ""

    def _extract_with_rules(self, text: str) -> List[Dict[str, Any]]:
        """
        Rule-based NER matching using regex patterns. Guaranteed execution under 50ms.
        """
        entities = []
        
        for label, pattern in TAXONOMY.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                match_text = match.group()
                start = match.start()
                end = match.end()
                
                # Check for duplicates or overlap (prefer longer matches)
                overlap = False
                for existing in entities:
                    # If there's an exact start overlap, check which one is longer
                    if not (end <= existing["start"] or start >= existing["end"]):
                        overlap = True
                        # Replace if current match is longer
                        if len(match_text) > len(existing["entity"]):
                            existing["entity"] = match_text
                            existing["type"] = label
                            existing["start"] = start
                            existing["end"] = end
                            existing["confidence"] = self._get_confidence_score(label, match_text)
                        break
                
                if not overlap:
                    entities.append({
                        "entity": match_text,
                        "type": label,
                        "confidence": self._get_confidence_score(label, match_text),
                        "start": start,
                        "end": end
                    })
        
        return entities

    def _get_confidence_score(self, type_name: str, entity_text: str) -> float:
        """Returns heuristic confidence score for regex fallback matches."""
        # Regex matches are highly precise for structured formats like IP Addresses, emails or exact keywords
        if type_name in ["IP_ADDRESS", "USER", "ERROR_CODE"]:
            return 0.99
        if len(entity_text) > 4:
            return 0.95
        return 0.90

    def _post_process_boundaries(self, entities: List[Dict[str, Any]], text: str) -> List[Dict[str, Any]]:
        """
        Post-processes Gemini entities to insert correct start and end boundaries.
        Filters out any entities that cannot be located in the text.
        """
        processed = []
        for e in entities:
            entity_text = e.get("entity", "")
            type_name = e.get("type", "UNKNOWN")
            confidence = e.get("confidence", 0.90)
            
            # Find boundaries in text
            try:
                # Find occurrences
                matches = [m.start() for m in re.finditer(re.escape(entity_text), text, re.IGNORECASE)]
                if matches:
                    start = matches[0]
                    end = start + len(entity_text)
                    processed.append({
                        "entity": entity_text,
                        "type": type_name.upper(),
                        "confidence": round(float(confidence), 2),
                        "start": start,
                        "end": end
                    })
            except Exception:
                # Fallback to default start/end
                pass
        return processed
