from typing import List, Dict, Any
import datetime

class RootCauseAnalysisService:
    def __init__(self, gemini_service, knowledge_graph_service, log_analysis_service, pattern_recognition_service):
        self.gemini = gemini_service
        self.graph = knowledge_graph_service
        self.logs = log_analysis_service
        self.patterns = pattern_recognition_service

    def analyze_incident(self, ticket_text: str, ticket_id: str = "temp_id", ticket_category: str = "General", linked_entities: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Main orchestration endpoint for Incident Root Cause Analysis.
        Gathers topology, logs, patterns, calls Gemini (or rule fallback),
        and applies weighted confidence scoring.
        """
        if linked_entities is None:
            linked_entities = []

        # 1. Gather Telemetry: Correlate Logs
        correlated_logs = self.logs.correlate_logs(ticket_text, linked_entities)
        
        # 2. Gather Topology & Failure Propagation
        dependencies = {}
        propagation_timeline = []
        affected_services = []
        
        if linked_entities:
            # Assume first canonical entity is the main point of impact
            main_entity = linked_entities[0]["canonical_id"]
            propagation = self.graph.analyze_failure_propagation(main_entity)
            dependencies = propagation
            propagation_timeline = propagation.get("timeline", [])
            affected_services = propagation.get("affected_services", [])
        else:
            # Fallback mock/rule topology if no entity extracted
            dependencies = {
                "root_cause_node": "unknown",
                "propagation_chain": [],
                "affected_services": []
            }

        # 3. Gather Trends & Patterns
        log_patterns = self.logs.detect_patterns()
        
        # 4. Generate Hypotheses via LLM (or rule fallback)
        raw_hypotheses = self.gemini.generate_rca_hypotheses(ticket_text, correlated_logs, dependencies)

        # 5. Apply Weighted Confidence Scoring
        final_hypotheses = []
        for h in raw_hypotheses:
            h_text = h.get("hypothesis", "").lower()
            
            # --- Score 1: Historical Similarity (30%) ---
            # High if pattern recognition detects similar category/subject
            hist_score = 0.5
            for p in self.patterns.active_patterns:
                if p.get("category", "").lower() in h_text or any(sys in h_text for sys in p.get("affected_systems", [])):
                    hist_score = 0.9
                    break
            
            # --- Score 2: Log Correlation (25%) ---
            # High if error logs exist for matching source components
            log_score = 0.0
            for log in correlated_logs:
                src = log.get("source", "").lower()
                msg = log.get("message", "").lower()
                # If hypothesis mentions log source or error message keywords
                if src in h_text or any(kw in h_text for kw in src.split("-")) or (log.get("level") in ["ERROR", "CRITICAL"] and any(w in h_text for w in msg.split() if len(w) > 3)):
                    log_score = 1.0 if log.get("level") == "CRITICAL" else 0.85
                    break
                    
            # --- Score 3: Entity Relationships (20%) ---
            # High if hypothesis relates to the extracted/linked entities of the ticket
            entity_score = 0.0
            for ent in linked_entities:
                canonical = ent.get("canonical_id", "").lower()
                ent_name = ent.get("entity", "").lower()
                if canonical in h_text or ent_name in h_text:
                    entity_score = 1.0
                    break
            if not linked_entities:
                entity_score = 0.3 # default baseline
                
            # --- Score 4: Dependency Analysis (15%) ---
            # High if target node is critical in dependency chain
            dep_score = 0.0
            root_cause_node = dependencies.get("root_cause_node", "").lower()
            chain = [node.lower() for node in dependencies.get("propagation_chain", [])]
            if root_cause_node in h_text or any(node in h_text for node in chain):
                dep_score = 1.0
                
            # --- Score 5: Trend Evidence (10%) ---
            # High if logs show repeated exceptions or error spikes
            trend_score = 0.0
            if log_patterns:
                trend_score = 0.8
                for p in log_patterns:
                    if p.get("target", "").lower() in h_text:
                        trend_score = 1.0
                        break
            
            # Calculate Weighted Confidence
            weighted_conf = (
                (hist_score * 0.30) +
                (log_score * 0.25) +
                (entity_score * 0.20) +
                (dep_score * 0.15) +
                (trend_score * 0.10)
            )
            
            # Blended score with LLM prediction (50% weighted, 50% LLM)
            llm_conf = float(h.get("confidence", 0.70))
            final_conf = round((weighted_conf * 0.5) + (llm_conf * 0.5), 2)
            final_conf = min(0.98, max(0.35, final_conf))

            # Rebuild evidence list based on matching indicators
            evidence = []
            if log_score > 0:
                evidence.append("Log Correlation")
            if dep_score > 0 or entity_score > 0.8:
                evidence.append("Dependency Match")
            if hist_score > 0.8:
                evidence.append("Historical Pattern")
            if trend_score > 0.8:
                evidence.append("Trend Evidence")
            if not evidence:
                evidence.append("Symptom Analysis")

            final_hypotheses.append({
                "hypothesis": h.get("hypothesis"),
                "confidence": final_conf,
                "evidence": evidence,
                "explanation": h.get("explanation"),
                "affected_services": affected_services
            })

        # Sort hypotheses by confidence descending
        final_hypotheses.sort(key=lambda x: x["confidence"], reverse=True)

        # Build investigation timeline if empty
        if not propagation_timeline:
            base_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
            propagation_timeline = [
                {
                    "time": base_time.strftime("%H:%M"),
                    "event": "Incident Ticket Submitted by User",
                    "node": "ticket_node"
                }
            ]

        return {
            "ticket_id": ticket_id,
            "hypotheses": final_hypotheses[:5], # top 5 max
            "timeline": propagation_timeline,
            "correlated_logs": correlated_logs[:10] # top 10 max
        }
