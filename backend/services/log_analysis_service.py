import re
import json
import datetime
from typing import List, Dict, Any

class LogAnalysisService:
    def __init__(self):
        # In-memory log store: list of dicts
        self.logs: List[Dict[str, Any]] = []
        self._seed_default_logs()

    def _seed_default_logs(self):
        """Seed default logs for testing and demo purposes."""
        base_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
        
        # We seed logs representing a database failure propagating to authentication and then CRM
        self.logs = [
            {
                "timestamp": (base_time + datetime.timedelta(minutes=5)).isoformat() + "Z",
                "level": "ERROR",
                "source": "mysql-db-prod",
                "message": "Connection timeout to database database_prod_01. Pool max limit reached.",
                "error_code": "ETIMEDOUT"
            },
            {
                "timestamp": (base_time + datetime.timedelta(minutes=8)).isoformat() + "Z",
                "level": "CRITICAL",
                "source": "auth-service",
                "message": "Database query failed for user authentication. Dependency database_prod_01 is unreachable.",
                "error_code": "AUTH_DB_ERR"
            },
            {
                "timestamp": (base_time + datetime.timedelta(minutes=11)).isoformat() + "Z",
                "level": "ERROR",
                "source": "crm-service",
                "message": "Failed to authenticate session token. Auth service returned status 503 Service Unavailable.",
                "error_code": "CRM_AUTH_FAIL"
            },
            {
                "timestamp": (base_time + datetime.timedelta(minutes=15)).isoformat() + "Z",
                "level": "WARNING",
                "source": "server_001",
                "message": "CPU Saturation alert: load average 8.42 exceeds threshold.",
                "error_code": "CPU_HIGH"
            },
            {
                "timestamp": (base_time + datetime.timedelta(minutes=16)).isoformat() + "Z",
                "level": "ERROR",
                "source": "printer-srv-03",
                "message": "Floor-3 Printer timeout: connection to host printer-offline-01 failed.",
                "error_code": "EHOSTUNREACH"
            }
        ]

    def ingest_logs(self, log_content: str) -> int:
        """
        Parses a multiline string of logs and stores them.
        Returns the number of logs successfully parsed and ingested.
        """
        lines = log_content.strip().split("\n")
        ingested_count = 0
        for line in lines:
            if not line.strip():
                continue
            parsed = self.parse_log_line(line)
            if parsed:
                self.logs.append(parsed)
                ingested_count += 1
        return ingested_count

    def parse_log_line(self, line: str) -> Dict[str, Any]:
        """
        Attempt to parse a log line using various common formats:
        - Structured JSON log
        - Syslog / Common Application Log: "YYYY-MM-DD HH:MM:SS [LEVEL] [SOURCE] message"
        - Simple level prefix: "[LEVEL] message"
        """
        line = line.strip()
        
        # 1. Try JSON parsing
        try:
            data = json.loads(line)
            if isinstance(data, dict):
                # Normalize keys
                return {
                    "timestamp": data.get("timestamp") or data.get("time") or datetime.datetime.utcnow().isoformat() + "Z",
                    "level": (data.get("level") or data.get("severity") or "INFO").upper(),
                    "source": data.get("source") or data.get("service") or "unknown",
                    "message": data.get("message") or data.get("msg") or "",
                    "error_code": data.get("error_code") or data.get("err_code") or ""
                }
        except Exception:
            pass

        # 2. Syslog / Regex pattern: YYYY-MM-DD HH:MM:SS [LEVEL] SOURCE: Message
        # E.g.: "2026-06-13 09:15:01 [ERROR] MySQL-Prod: Connection timeout"
        pattern = r"^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\s+\[([A-Z]+)\]\s+([^:]+):\s*(.*)$"
        match = re.match(pattern, line)
        if match:
            timestamp, level, source, message = match.groups()
            err_code_match = re.search(r"(error_code|err|code|0x)[ =:]*([A-Za-z0-9_]+)", message, re.IGNORECASE)
            error_code = err_code_match.group(2) if err_code_match else ""
            return {
                "timestamp": timestamp,
                "level": level.upper(),
                "source": source.strip(),
                "message": message.strip(),
                "error_code": error_code
            }

        # 3. Fallback: "[LEVEL] message" or simple extraction
        level_match = re.match(r"^\[([A-Z]+)\]\s+(.*)$", line, re.IGNORECASE)
        if level_match:
            level, message = level_match.groups()
            return {
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "level": level.upper(),
                "source": "app",
                "message": message.strip(),
                "error_code": ""
            }

        # Last resort: raw line as message
        return {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "level": "INFO",
            "source": "unknown",
            "message": line,
            "error_code": ""
        }

    def correlate_logs(self, ticket_text: str, entities: List[Dict[str, Any]], time_window_hours: float = 2.0) -> List[Dict[str, Any]]:
        """
        Correlate logs with ticket text and extracted entities.
        Filters logs that match the target entities or contain related key words.
        """
        correlated = []
        ticket_lower = ticket_text.lower()
        
        # Build list of entities to search in logs
        entity_keywords = set()
        for ent in entities:
            # ent can be EntityInfo or dict
            text = ent.get("text") if isinstance(ent, dict) else getattr(ent, "text", None)
            canonical = ent.get("canonical_id") if isinstance(ent, dict) else getattr(ent, "canonical_id", None)
            ent_type = ent.get("type") if isinstance(ent, dict) else getattr(ent, "type", None)
            
            if text:
                entity_keywords.add(text.lower())
            if canonical:
                entity_keywords.add(canonical.lower())
                # Add human readable components of canonical, e.g. database_prod_01 -> database, prod, 01
                for part in canonical.split("_"):
                    if len(part) > 2:
                        entity_keywords.add(part.lower())

        # Also add common terms
        common_terms = ["crm", "auth", "mysql", "database", "server", "timeout", "switch", "router", "network", "permission", "login", "printer"]
        matched_terms = [t for t in common_terms if t in ticket_lower]
        for t in matched_terms:
            entity_keywords.add(t)

        for log in self.logs:
            # Check matching keywords in log message or log source
            msg_lower = log["message"].lower()
            source_lower = log["source"].lower()
            
            # Simple keyword matching
            matched = False
            for kw in entity_keywords:
                if kw in msg_lower or kw in source_lower:
                    matched = True
                    break
                    
            if matched:
                correlated.append(log)

        # Sort correlated logs chronologically
        correlated.sort(key=lambda x: x["timestamp"])
        return correlated

    def detect_patterns(self) -> List[Dict[str, Any]]:
        """
        Identify repeated anomalies or errors (log pattern detection).
        - Repeated exceptions
        - Error spikes
        - CPU/Resource saturation
        """
        patterns = []
        source_errors = {}
        error_msg_counts = {}
        
        for log in self.logs:
            if log["level"] in ["ERROR", "CRITICAL"]:
                source = log["source"]
                msg = log["message"]
                
                source_errors[source] = source_errors.get(source, 0) + 1
                
                # Standardize msg a bit by stripping IDs/hashes/numbers
                std_msg = re.sub(r"\d+", "<NUM>", msg)
                error_msg_counts[std_msg] = error_msg_counts.get(std_msg, 0) + 1
        
        # Check source error spikes
        for src, count in source_errors.items():
            if count >= 3:
                patterns.append({
                    "pattern_type": "Error Spike",
                    "target": src,
                    "evidence": f"Detected {count} high-severity log events on source '{src}'.",
                    "confidence": min(0.5 + (count * 0.1), 0.95)
                })
                
        # Check repeated exceptions
        for msg, count in error_msg_counts.items():
            if count >= 2:
                patterns.append({
                    "pattern_type": "Repeated Exception",
                    "target": msg,
                    "evidence": f"Encountered identical error pattern {count} times across logs.",
                    "confidence": min(0.6 + (count * 0.08), 0.95)
                })

        return patterns
