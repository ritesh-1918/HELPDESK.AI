import re
from typing import List, Dict

class QueryExpansionService:
    def __init__(self):
        # IT-specific synonym mapping
        self.synonyms: Dict[str, List[str]] = {
            "vpn": ["virtual private network", "anyconnect", "pulse secure", "tunnel connection"],
            "printer": ["printing device", "print spooler", "printer offline", "paper jam", "print queue"],
            "login": ["authentication", "credentials", "mfa", "sso", "password reset", "sign in"],
            "network": ["connectivity", "wi-fi", "wifi dropping", "internet offline", "dhcp", "dns"],
            "software": ["application", "app crash", "compatibility update", "license key expired"],
            "hardware": ["laptop overheating", "blue screen", "bsod", "battery died", "charger not recognized"]
        }

        # Error code mappings
        self.error_mappings: Dict[str, List[str]] = {
            "err_1024": ["vpn timeout", "connection failure", "authentication timeout"],
            "err_5002": ["database connection pool exhausted", "db timeout", "postgres connection error"],
            "404": ["page not found", "url broken", "web server routing error"],
            "401": ["unauthorized access", "invalid credentials", "authentication failed", "expired session token"],
            "500": ["internal server error", "app crash", "unhandled exception"],
            "0x000000d1": ["ndis.sys driver crash", "driver_irql_not_less_or_equal", "blue screen of death", "bsod"]
        }

    def expand_query(self, query: str) -> str:
        """
        Expand the user query using the synonym thesaurus and error code mappings.
        """
        if not query:
            return ""
        
        expanded_terms = [query]
        query_lower = query.lower()

        # Check for synonyms
        for key, syn_list in self.synonyms.items():
            # Match whole words or boundary
            if re.search(r'\b' + re.escape(key) + r'\b', query_lower):
                expanded_terms.extend(syn_list)

        # Check for error codes
        for err_code, desc_list in self.error_mappings.items():
            if re.search(re.escape(err_code), query_lower):
                expanded_terms.extend(desc_list)
                if err_code not in query_lower:
                    expanded_terms.append(err_code)

        # Remove duplicate terms while preserving order
        unique_terms = []
        seen = set()
        for term in expanded_terms:
            t_clean = term.strip()
            if t_clean and t_clean.lower() not in seen:
                seen.add(t_clean.lower())
                unique_terms.append(t_clean)

        return " ".join(unique_terms)
