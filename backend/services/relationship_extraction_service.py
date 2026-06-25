"""
Relationship Extraction Service — Detects dependencies, ownerships, impacts,
and cause-effect chains between entities mentioned in support tickets.
"""

import re
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Pattern triggers for rule-based matching
RELATION_TRIGGERS = {
    "runs_on": [r"runs on", r"hosted on", r"deployed on", r"on server", r"lives on"],
    "depends_on": [r"depends on", r"requires", r"rely on", r"connecting to", r"needs database", r"calls API"],
    "caused_by": [r"caused by", r"due to", r"because of", r"failed due", r"resulting from"],
    "assigned_to": [r"assigned to", r"routed to", r"handled by"],
    "owned_by": [r"owned by", r"managed by", r"belongs to"],
    "affects": [r"affects", r"impacting", r"disrupting", r"breaks", r"down for"],
    "connected_to": [r"connected to", r"linked to", r"networked with"],
    "authenticates_with": [r"authenticates with", r"login to", r"auth using", r"sign in"]
}

class RelationshipExtractionService:
    def __init__(self, gemini_service=None):
        self.gemini_service = gemini_service

    def extract_relationships(self, text: str, linked_entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identify dependencies, connectivity, caused relationships, and cause-effect chains.
        """
        if not text or len(linked_entities) < 2:
            return {"relationships": [], "cause_effect_chain": []}

        # Try Gemini if active
        if self.gemini_service and getattr(self.gemini_service, "_initialized", False):
            try:
                result = self._extract_with_gemini(text, linked_entities)
                if result and "relationships" in result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini relationship extraction failed: {e}")

        # Fallback to pattern-based matching
        return self._extract_with_patterns(text, linked_entities)

    def _extract_with_gemini(self, text: str, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Leverages Gemini to extract entity relationships and cause-effect chains."""
        entities_schema = [{"id": e["canonical_id"], "text": e["entity"], "type": e["type"]} for e in entities]
        
        prompt = (
            "You are a production knowledge graph relationship extraction model.\n"
            f"Ticket text: '{text}'\n"
            f"Entities extracted: {json.dumps(entities_schema)}\n\n"
            "Identify relationships between these entities. Use ONLY the following relationship types:\n"
            "runs_on, depends_on, caused_by, assigned_to, owned_by, affects, connected_to, authenticates_with.\n\n"
            "Also, detect the main cause-effect chain (e.g. ['database_prod_01', 'Connection Timeout', 'crm_service'] indicating DB outage -> timeout -> CRM impact).\n"
            "Return a JSON object structured exactly as:\n"
            "{\n"
            "  \"relationships\": [\n"
            "    { \"source\": \"entity_canonical_id_1\", \"target\": \"entity_canonical_id_2\", \"type\": \"runs_on\" }\n"
            "  ],\n"
            "  \"cause_effect_chain\": [\"canonical_id_a\", \"canonical_id_b\"]\n"
            "}\n"
            "Return strictly valid JSON. Do not include markdown blocks."
        )

        response = self._client_generate_content(prompt)
        if not response:
            return {"relationships": [], "cause_effect_chain": []}

        try:
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\n|```$", "", cleaned, flags=re.MULTILINE).strip()
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse relationships JSON: {e} | Raw: {response}")
            return {"relationships": [], "cause_effect_chain": []}

    def _client_generate_content(self, prompt: str) -> str:
        try:
            response = self.gemini_service.client.models.generate_content(
                model=self.gemini_service.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            return ""

    def _extract_with_patterns(self, text: str, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Pattern/Trigger-based relationship mapping.
        """
        relationships = []
        text_lower = text.lower()

        # Iterate over pairs of entities to check if their context contains trigger keywords
        for i in range(len(entities)):
            for j in range(len(entities)):
                if i == j:
                    continue
                
                ent_a = entities[i]
                ent_b = entities[j]
                
                id_a = ent_a["canonical_id"]
                id_b = ent_b["canonical_id"]
                
                # Check context window between these two occurrences in the text
                start_a = ent_a.get("start", 0)
                start_b = ent_b.get("start", 0)
                
                start_idx = min(start_a, start_b)
                end_idx = max(start_a, start_b)
                
                # Context buffer
                context = text_lower[start_idx:end_idx]
                
                for rel_type, triggers in RELATION_TRIGGERS.items():
                    for trigger in triggers:
                        if re.search(trigger, context):
                            # Determine direction heuristic
                            # E.g. A depends_on B if A connects to B
                            # A caused_by B if A failed because of B
                            # Let's map direction:
                            source = id_a
                            target = id_b
                            
                            # Heuristic adjust based on grammar
                            if rel_type == "caused_by" and start_a > start_b:
                                source = id_a
                                target = id_b
                            elif rel_type == "runs_on" and ent_a["type"] == "SERVER":
                                source = id_b
                                target = id_a
                            elif rel_type == "affects" and ent_b["type"] in ["ERROR_CODE", "INCIDENT"]:
                                source = id_b
                                target = id_a
                            
                            # Add relationship
                            edge = {"source": source, "target": target, "type": rel_type}
                            if edge not in relationships:
                                relationships.append(edge)

        # Build cause-effect chain heuristic:
        # e.g., Database/Server -> Error Code -> Application/Service
        cause_effect_chain = []
        errors = [e["canonical_id"] for e in entities if e["type"] in ["ERROR_CODE", "INCIDENT", "ALERT"]]
        backends = [e["canonical_id"] for e in entities if e["type"] in ["DATABASE", "SERVER", "HOSTNAME", "IP_ADDRESS"]]
        frontends = [e["canonical_id"] for e in entities if e["type"] in ["APPLICATION", "SERVICE", "API"]]
        
        if backends and errors and frontends:
            cause_effect_chain = [backends[0], errors[0], frontends[0]]
        elif backends and errors:
            cause_effect_chain = [backends[0], errors[0]]
        elif errors and frontends:
            cause_effect_chain = [errors[0], frontends[0]]

        return {
            "relationships": relationships,
            "cause_effect_chain": cause_effect_chain
        }
