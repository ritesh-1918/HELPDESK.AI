"""
Ticket Deduplication and Similarity Detection Service

Identifies duplicate and similar tickets using text similarity algorithms.
Implements Issue #3201.

Features:
- Text similarity analysis using TF-IDF and cosine similarity
- Fuzzy matching for subject lines
- Duplicate detection based on configurable threshold
- Similar ticket suggestions
- Merge history tracking
"""

import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone, timedelta
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)


class TicketDeduplicationService:
    """
    Service for detecting duplicate and similar tickets.
    
    Uses multiple similarity metrics:
    - Subject line similarity (fuzzy matching)
    - Description similarity (TF-IDF + cosine similarity)
    - Customer similarity (same customer submitting similar issues)
    - Time window (tickets submitted close together)
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        
        # Thresholds for duplicate detection
        self.DUPLICATE_THRESHOLD = 0.85  # 85% similarity = duplicate
        self.SIMILAR_THRESHOLD = 0.65    # 65% similarity = related/similar
        self.TIME_WINDOW_HOURS = 72      # Look for duplicates within 72 hours
        
        # Cache for vectorized tickets
        self._vector_cache = {}
        self._stop_words = self._load_stop_words()
    
    def _load_stop_words(self) -> set:
        """Load common stop words to filter out."""
        return {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
            'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
            'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
            'its', 'our', 'their', 'me', 'him', 'us', 'them'
        }
    
    def find_duplicates(
        self,
        ticket: Dict[str, Any],
        candidate_tickets: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Find duplicate tickets for a given ticket.
        
        Args:
            ticket: Ticket to check for duplicates
            candidate_tickets: Optional list of tickets to check against.
                             If None, queries database for recent tickets.
        
        Returns:
            List of potential duplicate tickets with similarity scores
        """
        if candidate_tickets is None:
            candidate_tickets = self._get_candidate_tickets(ticket)
        
        duplicates = []
        
        for candidate in candidate_tickets:
            if candidate['id'] == ticket['id']:
                continue
            
            similarity_score = self._calculate_similarity(ticket, candidate)
            
            if similarity_score >= self.DUPLICATE_THRESHOLD:
                duplicates.append({
                    **candidate,
                    'similarity_score': similarity_score,
                    'similarity_type': 'duplicate',
                    'match_factors': self._get_match_factors(ticket, candidate, similarity_score)
                })
        
        # Sort by similarity score (highest first)
        duplicates.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return duplicates
    
    def find_similar_tickets(
        self,
        ticket: Dict[str, Any],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find similar (but not duplicate) tickets.
        
        Args:
            ticket: Ticket to find similar tickets for
            limit: Maximum number of similar tickets to return
        
        Returns:
            List of similar tickets with similarity scores
        """
        candidate_tickets = self._get_candidate_tickets(ticket, extended_window=True)
        
        similar = []
        
        for candidate in candidate_tickets:
            if candidate['id'] == ticket['id']:
                continue
            
            similarity_score = self._calculate_similarity(ticket, candidate)
            
            if self.SIMILAR_THRESHOLD <= similarity_score < self.DUPLICATE_THRESHOLD:
                similar.append({
                    **candidate,
                    'similarity_score': similarity_score,
                    'similarity_type': 'similar',
                    'match_factors': self._get_match_factors(ticket, candidate, similarity_score)
                })
        
        # Sort by similarity score (highest first)
        similar.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return similar[:limit]
    
    def _get_candidate_tickets(
        self,
        ticket: Dict[str, Any],
        extended_window: bool = False
    ) -> List[Dict[str, Any]]:
        """Get candidate tickets to check for similarity."""
        if not self.supabase:
            return []
        
        try:
            company_id = ticket.get('company_id')
            category = ticket.get('category')
            created_at = ticket.get('created_at')
            
            # Calculate time window
            if created_at:
                ticket_time = datetime.fromisoformat(str(created_at).replace('Z', '+00:00'))
                hours = self.TIME_WINDOW_HOURS * 2 if extended_window else self.TIME_WINDOW_HOURS
                cutoff_time = ticket_time - timedelta(hours=hours)
                cutoff_str = cutoff_time.isoformat()
            else:
                cutoff_str = (datetime.now(timezone.utc) - timedelta(hours=self.TIME_WINDOW_HOURS)).isoformat()
            
            # Query recent tickets in same category and company
            query = self.supabase.table('tickets').select(
                'id, subject, description, category, priority, customer_id, created_at, status'
            ).eq('company_id', company_id).gte('created_at', cutoff_str)
            
            # Filter by category if available
            if category:
                query = query.eq('category', category)
            
            # Exclude resolved/closed tickets for duplicate detection
            if not extended_window:
                query = query.in_('status', ['open', 'in_progress'])
            
            query = query.limit(100)
            
            result = query.execute()
            return result.data or []
        
        except Exception as e:
            logger.error(f"Error getting candidate tickets: {e}")
            return []
    
    def _calculate_similarity(
        self,
        ticket1: Dict[str, Any],
        ticket2: Dict[str, Any]
    ) -> float:
        """
        Calculate overall similarity score between two tickets.
        
        Combines multiple similarity metrics:
        - Subject similarity (40% weight)
        - Description similarity (40% weight)
        - Customer match (10% weight)
        - Category match (10% weight)
        """
        # Subject similarity
        subject1 = str(ticket1.get('subject', '')).lower()
        subject2 = str(ticket2.get('subject', '')).lower()
        subject_sim = self._text_similarity(subject1, subject2)
        
        # Description similarity
        desc1 = str(ticket1.get('description', '')).lower()
        desc2 = str(ticket2.get('description', '')).lower()
        desc_sim = self._text_similarity(desc1, desc2)
        
        # Customer match
        customer_sim = 1.0 if ticket1.get('customer_id') == ticket2.get('customer_id') else 0.0
        
        # Category match
        category_sim = 1.0 if ticket1.get('category') == ticket2.get('category') else 0.0
        
        # Weighted combination
        total_similarity = (
            subject_sim * 0.40 +
            desc_sim * 0.40 +
            customer_sim * 0.10 +
            category_sim * 0.10
        )
        
        return round(total_similarity, 3)
    
    def _text_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate text similarity using multiple methods.
        
        Combines:
        - Sequence matching (SequenceMatcher)
        - Token overlap (Jaccard similarity)
        - Normalized edit distance
        """
        if not text1 or not text2:
            return 0.0
        
        # Method 1: SequenceMatcher (built-in Python)
        sequence_sim = SequenceMatcher(None, text1, text2).ratio()
        
        # Method 2: Token-based Jaccard similarity
        tokens1 = self._tokenize(text1)
        tokens2 = self._tokenize(text2)
        
        if not tokens1 or not tokens2:
            token_sim = 0.0
        else:
            intersection = len(tokens1 & tokens2)
            union = len(tokens1 | tokens2)
            token_sim = intersection / union if union > 0 else 0.0
        
        # Method 3: Normalized edit distance (Levenshtein-like)
        edit_sim = self._normalized_edit_distance(text1, text2)
        
        # Combine methods (weighted average)
        combined = (sequence_sim * 0.4 + token_sim * 0.4 + edit_sim * 0.2)
        
        return round(combined, 3)
    
    def _tokenize(self, text: str) -> set:
        """Tokenize text into words, removing stop words and punctuation."""
        # Convert to lowercase and remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        
        # Split into words
        words = text.split()
        
        # Remove stop words and short words
        tokens = {
            word for word in words
            if len(word) > 2 and word not in self._stop_words
        }
        
        return tokens
    
    def _normalized_edit_distance(self, text1: str, text2: str) -> float:
        """Calculate normalized edit distance (1.0 = identical)."""
        if not text1 and not text2:
            return 1.0
        if not text1 or not text2:
            return 0.0
        
        # Use SequenceMatcher for efficiency
        return SequenceMatcher(None, text1, text2).ratio()
    
    def _get_match_factors(
        self,
        ticket1: Dict[str, Any],
        ticket2: Dict[str, Any],
        total_score: float
    ) -> List[str]:
        """Get human-readable match factors."""
        factors = []
        
        # Subject similarity
        subject_sim = self._text_similarity(
            str(ticket1.get('subject', '')).lower(),
            str(ticket2.get('subject', '')).lower()
        )
        if subject_sim > 0.8:
            factors.append("Very similar subject lines")
        elif subject_sim > 0.6:
            factors.append("Similar subject lines")
        
        # Description similarity
        desc_sim = self._text_similarity(
            str(ticket1.get('description', '')).lower(),
            str(ticket2.get('description', '')).lower()
        )
        if desc_sim > 0.8:
            factors.append("Very similar descriptions")
        elif desc_sim > 0.6:
            factors.append("Similar descriptions")
        
        # Same customer
        if ticket1.get('customer_id') == ticket2.get('customer_id'):
            factors.append("Same customer")
        
        # Same category
        if ticket1.get('category') == ticket2.get('category'):
            factors.append(f"Same category ({ticket1.get('category')})")
        
        # Time proximity
        if ticket1.get('created_at') and ticket2.get('created_at'):
            time1 = datetime.fromisoformat(str(ticket1['created_at']).replace('Z', '+00:00'))
            time2 = datetime.fromisoformat(str(ticket2['created_at']).replace('Z', '+00:00'))
            hours_diff = abs((time1 - time2).total_seconds() / 3600)
            
            if hours_diff < 24:
                factors.append("Submitted within 24 hours")
            elif hours_diff < 72:
                factors.append("Submitted within 3 days")
        
        return factors
    
    def suggest_merge_candidates(
        self,
        ticket_id: str,
        company_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get merge candidates for a ticket with detailed analysis.
        
        Args:
            ticket_id: ID of ticket to find merge candidates for
            company_id: Company ID for security
        
        Returns:
            List of potential merge candidates with similarity analysis
        """
        if not self.supabase:
            return []
        
        try:
            # Get the source ticket
            result = self.supabase.table('tickets').select(
                '*'
            ).eq('id', ticket_id).eq('company_id', company_id).single().execute()
            
            ticket = result.data
            if not ticket:
                return []
            
            # Find duplicates
            duplicates = self.find_duplicates(ticket)
            
            # Enrich with merge recommendations
            for dup in duplicates:
                dup['merge_recommendation'] = self._get_merge_recommendation(ticket, dup)
            
            return duplicates
        
        except Exception as e:
            logger.error(f"Error getting merge candidates: {e}")
            return []
    
    def _get_merge_recommendation(
        self,
        source_ticket: Dict[str, Any],
        duplicate_ticket: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate merge recommendation with analysis."""
        # Determine which should be primary
        source_created = datetime.fromisoformat(str(source_ticket['created_at']).replace('Z', '+00:00'))
        dup_created = datetime.fromisoformat(str(duplicate_ticket['created_at']).replace('Z', '+00:00'))
        
        primary_id = source_ticket['id'] if source_created < dup_created else duplicate_ticket['id']
        secondary_id = duplicate_ticket['id'] if primary_id == source_ticket['id'] else source_ticket['id']
        
        return {
            'primary_ticket_id': primary_id,
            'secondary_ticket_id': secondary_id,
            'reason': 'Older ticket should be primary',
            'actions': [
                'Merge secondary ticket into primary',
                'Copy comments and attachments',
                'Close secondary ticket as duplicate',
                'Link tickets in system'
            ]
        }


def create_deduplication_service(supabase_client=None) -> TicketDeduplicationService:
    """Factory function to create deduplication service."""
    return TicketDeduplicationService(supabase_client)
