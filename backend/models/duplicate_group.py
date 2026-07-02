"""
DuplicateGroup model — Issue #2807
Holds cluster metadata, primary ticket designation, and duplicate relationships.
"""

import uuid
import datetime
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class DuplicateMember:
    """Represents one ticket belonging to a duplicate cluster."""
    ticket_id: str
    similarity: float
    is_primary: bool = False
    joined_at: str = field(default_factory=lambda: datetime.datetime.utcnow().isoformat() + "Z")
    keyword_score: float = 0.0
    structural_score: float = 0.0
    semantic_score: float = 0.0


@dataclass
class DuplicateGroup:
    """
    A cluster of semantically similar tickets.

    Attributes:
        cluster_id:     Unique identifier for this group.
        primary_ticket: Ticket ID treated as the canonical record.
        members:        All ticket IDs + similarity metadata in this cluster.
        category:       Ticket category (for analytics).
        confidence:     Mean similarity score of cluster members.
        created_at:     ISO-8601 timestamp.
        updated_at:     ISO-8601 timestamp.
        company_id:     Tenant identifier for multi-tenancy.
        kb_suggestion:  Optional knowledge-base article suggestion.
    """
    cluster_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    primary_ticket: Optional[str] = None
    members: list = field(default_factory=list)   # list[DuplicateMember]
    category: str = "Unknown"
    confidence: float = 0.0
    created_at: str = field(default_factory=lambda: datetime.datetime.utcnow().isoformat() + "Z")
    updated_at: str = field(default_factory=lambda: datetime.datetime.utcnow().isoformat() + "Z")
    company_id: Optional[str] = None
    kb_suggestion: Optional[str] = None

    # -----------------------------------------------------------------------
    def add_member(self, ticket_id: str, similarity: float, **scores) -> None:
        """Add a ticket to this cluster."""
        member = DuplicateMember(
            ticket_id=ticket_id,
            similarity=similarity,
            is_primary=(self.primary_ticket == ticket_id),
            **scores,
        )
        self.members.append(member)
        self._recalculate_confidence()
        self.updated_at = datetime.datetime.utcnow().isoformat() + "Z"

    def set_primary(self, ticket_id: str) -> None:
        """Designate a ticket as the primary/canonical record."""
        self.primary_ticket = ticket_id
        for m in self.members:
            m.is_primary = (m.ticket_id == ticket_id)
        self.updated_at = datetime.datetime.utcnow().isoformat() + "Z"

    def _recalculate_confidence(self) -> None:
        if not self.members:
            self.confidence = 0.0
            return
        self.confidence = round(
            sum(m.similarity for m in self.members) / len(self.members), 4
        )

    @property
    def size(self) -> int:
        return len(self.members)

    def to_dict(self) -> dict:
        return {
            "cluster_id":     self.cluster_id,
            "primary_ticket": self.primary_ticket,
            "size":           self.size,
            "confidence":     self.confidence,
            "category":       self.category,
            "company_id":     self.company_id,
            "created_at":     self.created_at,
            "updated_at":     self.updated_at,
            "kb_suggestion":  self.kb_suggestion,
            "members": [
                {
                    "ticket_id":        m.ticket_id,
                    "similarity":       m.similarity,
                    "is_primary":       m.is_primary,
                    "joined_at":        m.joined_at,
                    "keyword_score":    m.keyword_score,
                    "structural_score": m.structural_score,
                    "semantic_score":   m.semantic_score,
                }
                for m in self.members
            ],
        }


# ---------------------------------------------------------------------------
# In-process cluster registry (per-process cache; persisted via Supabase)
# ---------------------------------------------------------------------------
class ClusterRegistry:
    """
    In-memory registry mapping cluster_id → DuplicateGroup.
    Populated at startup from Supabase; used for fast centroid lookups.
    """

    def __init__(self):
        self._clusters: dict[str, DuplicateGroup] = {}   # cluster_id → group
        self._ticket_map: dict[str, str] = {}             # ticket_id  → cluster_id

    def get_cluster(self, cluster_id: str) -> Optional[DuplicateGroup]:
        return self._clusters.get(cluster_id)

    def get_cluster_for_ticket(self, ticket_id: str) -> Optional[DuplicateGroup]:
        cid = self._ticket_map.get(ticket_id)
        return self._clusters.get(cid) if cid else None

    def register(self, group: DuplicateGroup) -> None:
        self._clusters[group.cluster_id] = group
        for m in group.members:
            self._ticket_map[m.ticket_id] = group.cluster_id

    def add_ticket_to_cluster(
        self, cluster_id: str, ticket_id: str, similarity: float, **scores
    ) -> Optional[DuplicateGroup]:
        group = self._clusters.get(cluster_id)
        if not group:
            return None
        group.add_member(ticket_id, similarity, **scores)
        self._ticket_map[ticket_id] = cluster_id
        return group

    def create_cluster(
        self,
        primary_ticket: str,
        category: str,
        company_id: Optional[str] = None,
    ) -> DuplicateGroup:
        group = DuplicateGroup(
            primary_ticket=primary_ticket,
            category=category,
            company_id=company_id,
        )
        self.register(group)
        return group

    def all_clusters(self, company_id: Optional[str] = None) -> list[DuplicateGroup]:
        if company_id:
            return [g for g in self._clusters.values() if g.company_id == company_id]
        return list(self._clusters.values())

    def analytics_summary(self, company_id: Optional[str] = None) -> dict:
        clusters = self.all_clusters(company_id)
        by_category: dict[str, int] = {}
        for g in clusters:
            by_category[g.category] = by_category.get(g.category, 0) + g.size

        top_categories = sorted(by_category.items(), key=lambda x: x[1], reverse=True)
        return {
            "total_clusters":   len(clusters),
            "total_duplicates": sum(g.size for g in clusters),
            "avg_confidence":   round(
                sum(g.confidence for g in clusters) / len(clusters), 4
            ) if clusters else 0.0,
            "top_categories": [
                {"category": cat, "duplicate_count": cnt}
                for cat, cnt in top_categories[:10]
            ],
        }


# Singleton
cluster_registry = ClusterRegistry()
