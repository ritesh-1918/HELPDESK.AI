import re
from typing import List, Dict, Any
from collections import Counter

class PatternRecognitionService:
    def __init__(self):
        # Cache of identified patterns
        self.active_patterns: List[Dict[str, Any]] = []

    def detect_patterns(self, tickets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups tickets based on similarities (symptoms, categories, metadata, and entities)
        and identifies systemic operational patterns.
        """
        if len(tickets) < 2:
            return []

        # 1. Cluster tickets into groups using shared entities and text keyword overlap
        clusters = self._cluster_tickets(tickets)
        
        patterns = []
        for cluster_idx, cluster_tickets in enumerate(clusters):
            if len(cluster_tickets) < 2:
                continue

            # Determine dominant category and entities
            categories = [t.get("category", "Unknown") for t in cluster_tickets]
            subcategories = [t.get("subcategory", "Unknown") for t in cluster_tickets]
            
            dominant_category = Counter(categories).most_common(1)[0][0]
            dominant_subcategory = Counter(subcategories).most_common(1)[0][0]
            
            # Extract all canonical entities linked to these tickets
            all_entities = []
            for t in cluster_tickets:
                entities_list = t.get("linked_entities") or t.get("metadata", {}).get("linked_entities") or []
                for ent in entities_list:
                    if isinstance(ent, dict) and ent.get("canonical_id"):
                        all_entities.append((ent["canonical_id"], ent.get("type", "UNKNOWN")))
                    elif isinstance(ent, str):
                        all_entities.append((ent, "UNKNOWN"))

            # Calculate dominant entity
            affected_systems = []
            if all_entities:
                entity_counts = Counter(all_entities)
                # Keep entities appearing in at least 30% of the cluster's tickets
                min_threshold = max(1, int(len(cluster_tickets) * 0.3))
                affected_systems = [ent[0] for ent, count in entity_counts.items() if count >= min_threshold]

            # Detect pattern category
            pattern_category = self._classify_pattern_category(dominant_category, dominant_subcategory, cluster_tickets)
            
            # Formulate pattern name and description
            pattern_name = f"Systemic {pattern_category}"
            if affected_systems:
                system_names = [s.replace("_", " ").title() for s in affected_systems[:2]]
                pattern_name = f"{' & '.join(system_names)} {pattern_category}"
            else:
                pattern_name = f"Recurring {dominant_subcategory} {pattern_category}"

            # Calculate confidence score
            # Confidence grows with cluster size, category homogeneity, and entity match density
            size_factor = min(0.4, len(cluster_tickets) * 0.1) # Up to 0.4
            homogeneity = Counter(categories).most_common(1)[0][1] / len(cluster_tickets)
            homogeneity_factor = homogeneity * 0.4 # Up to 0.4
            entity_factor = 0.2 if affected_systems else 0.0
            
            confidence = round(0.3 + size_factor + homogeneity_factor + entity_factor, 2)
            confidence = min(0.98, max(0.4, confidence))

            patterns.append({
                "id": f"pattern_{cluster_idx}_{dominant_category.lower().replace(' ', '_')}",
                "name": pattern_name,
                "category": pattern_category,
                "confidence": confidence,
                "ticket_count": len(cluster_tickets),
                "ticket_ids": [t.get("id") or t.get("ticket_id") for t in cluster_tickets if t.get("id") or t.get("ticket_id")],
                "affected_systems": affected_systems,
                "evidence": [t.get("subject") or t.get("summary") or t.get("description", "")[:60] for t in cluster_tickets],
                "description": f"Detected recurring incidents involving {pattern_category.lower()} on {', '.join(affected_systems) if affected_systems else dominant_category}."
            })

        self.active_patterns = patterns
        return patterns

    def _cluster_tickets(self, tickets: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """
        Group tickets by checking intersection of keywords, categories, and entities.
        """
        clusters = []
        visited = set()

        # Build list of token sets for similarity check
        ticket_data = []
        for i, t in enumerate(tickets):
            text = ((t.get("subject") or "") + " " + (t.get("description") or "") + " " + (t.get("summary") or "")).lower()
            tokens = set(re.findall(r"\b[a-zA-Z0-9_-]{3,}\b", text))
            
            # Add entities to tokens
            entities_list = t.get("linked_entities") or t.get("metadata", {}).get("linked_entities") or []
            for ent in entities_list:
                if isinstance(ent, dict) and ent.get("canonical_id"):
                    tokens.add(ent["canonical_id"].lower())
                elif isinstance(ent, str):
                    tokens.add(ent.lower())
                    
            ticket_data.append({
                "idx": i,
                "ticket": t,
                "category": t.get("category"),
                "tokens": tokens
            })

        for i in range(len(tickets)):
            if i in visited:
                continue

            current_cluster = [ticket_data[i]["ticket"]]
            visited.add(i)

            for j in range(i + 1, len(tickets)):
                if j in visited:
                    continue

                # Check category matching
                cat_match = ticket_data[i]["category"] == ticket_data[j]["category"]
                sub_match = ticket_data[i]["ticket"].get("subcategory") == ticket_data[j]["ticket"].get("subcategory") and ticket_data[i]["ticket"].get("subcategory") not in ["Unknown", "General", "Other", None]
                
                # Check Jaccard similarity of keywords/entities
                tokens_i = ticket_data[i]["tokens"]
                tokens_j = ticket_data[j]["tokens"]
                
                intersection = tokens_i.intersection(tokens_j)
                union = tokens_i.union(tokens_j)
                
                jaccard = len(intersection) / len(union) if union else 0.0
                
                # If Jaccard is high, or categories match and there is a shared key term (e.g. database, printer)
                # or subcategories match, group them together
                is_similar = jaccard >= 0.25 or (cat_match and len(intersection) >= 2) or (cat_match and sub_match)
                
                if is_similar:
                    current_cluster.append(ticket_data[j]["ticket"])
                    visited.add(j)

            clusters.append(current_cluster)

        return clusters

    def _classify_pattern_category(self, dominant_cat: str, dominant_sub: str, tickets: List[Dict[str, Any]]) -> str:
        """
        Classify pattern into one of:
        Hardware Failures, Configuration Errors, Capacity Issues, Security Incidents, Authentication Failures, Network Problems, Software Defects
        """
        text_dump = " ".join([((t.get("subject") or "") + " " + (t.get("description") or "")).lower() for t in tickets])

        # Authentication Failures
        if dominant_cat.lower() in ["access", "iam", "security"] or any(x in text_dump for x in ["login", "password", "mfa", "auth", "permission", "denied", "revoked"]):
            return "Authentication Failures"
            
        # Hardware Failures
        if dominant_cat.lower() in ["hardware", "infrastructure"] or any(x in text_dump for x in ["printer", "keyboard", "mouse", "monitor", "disk", "hardware", "physical"]):
            return "Hardware Failures"
            
        # Network Problems
        if dominant_cat.lower() in ["network"] or any(x in text_dump for x in ["offline", "unreachable", "ping", "dns", "network", "switch", "router", "timeout"]):
            return "Network Problems"

        # Capacity Issues / Resource Exhaustion
        if any(x in text_dump for x in ["cpu", "memory", "space", "disk full", "slow", "saturation", "leak", "high usage", "capacity"]):
            return "Capacity Issues"

        # Security Incidents
        if any(x in text_dump for x in ["leak", "hack", "breach", "phishing", "unauthorized"]):
            return "Security Incidents"

        # Configuration Errors
        if any(x in text_dump for x in ["config", "settings", "policy", "misconfigured", "setup", "port"]):
            return "Configuration Errors"

        # Software Defects
        return "Software Defects"
