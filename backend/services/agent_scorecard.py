"""
Agent Scorecard — Computes agent performance scores with configurable weight variables.

Reads weight parameters from environment variables:
  SCORECARD_RESOLUTION_WEIGHT      — weight for resolution rate (default: 0.35)
  SCORECARD_SPEED_WEIGHT           — weight for average handling speed (default: 0.25)
  SCORECARD_QUALITY_WEIGHT         — weight for quality/feedback score (default: 0.20)
  SCORECARD_VOLUME_WEIGHT          — weight for ticket volume (default: 0.10)
  SCORECARD_SLA_WEIGHT             — weight for SLA compliance (default: 0.10)
  SCORECARD_MAX_SCORE              — maximum possible score (default: 100.0)
"""

import os
import logging
from typing import Optional, Dict
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[AgentScorecard] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


@dataclass
class ScorecardWeights:
    resolution_weight: float = 0.35
    speed_weight: float = 0.25
    quality_weight: float = 0.20
    volume_weight: float = 0.10
    sla_weight: float = 0.10
    max_score: float = 100.0

    def __post_init__(self):
        total = (
            self.resolution_weight
            + self.speed_weight
            + self.quality_weight
            + self.volume_weight
            + self.sla_weight
        )
        if abs(total - 1.0) > 0.001:
            logger.warning(
                f"Scorecard weights sum to {total:.4f}, expected 1.0. "
                "Scores may not be properly normalized."
            )

    @classmethod
    def from_env(cls) -> "ScorecardWeights":
        return cls(
            resolution_weight=float(os.getenv("SCORECARD_RESOLUTION_WEIGHT", "0.35")),
            speed_weight=float(os.getenv("SCORECARD_SPEED_WEIGHT", "0.25")),
            quality_weight=float(os.getenv("SCORECARD_QUALITY_WEIGHT", "0.20")),
            volume_weight=float(os.getenv("SCORECARD_VOLUME_WEIGHT", "0.10")),
            sla_weight=float(os.getenv("SCORECARD_SLA_WEIGHT", "0.10")),
            max_score=float(os.getenv("SCORECARD_MAX_SCORE", "100.0")),
        )

    def to_dict(self) -> Dict[str, float]:
        return {
            "resolution_weight": self.resolution_weight,
            "speed_weight": self.speed_weight,
            "volume_weight": self.volume_weight,
            "quality_weight": self.quality_weight,
            "sla_weight": self.sla_weight,
            "max_score": self.max_score,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, float]) -> "ScorecardWeights":
        return cls(
            resolution_weight=data.get("resolution_weight", 0.35),
            speed_weight=data.get("speed_weight", 0.25),
            quality_weight=data.get("quality_weight", 0.20),
            volume_weight=data.get("volume_weight", 0.10),
            sla_weight=data.get("sla_weight", 0.10),
            max_score=data.get("max_score", 100.0),
        )


@dataclass
class AgentMetrics:
    resolved_tickets: int = 0
    total_tickets: int = 0
    avg_handling_hours: float = 0.0
    quality_score: float = 0.0
    ticket_volume: int = 0
    sla_breaches: int = 0
    total_assigned: int = 0


class AgentScorecard:
    def __init__(self, weights: Optional[ScorecardWeights] = None):
        self.weights = weights or ScorecardWeights.from_env()

    def update_weights(self, new_weights: Dict[str, float]) -> None:
        current = self.weights.to_dict()
        current.update(new_weights)
        self.weights = ScorecardWeights.from_dict(current)
        logger.info(f"Scorecard weights updated: {self.weights.to_dict()}")

    def compute_performance_score(
        self,
        metrics: AgentMetrics,
        weights: Optional[Dict[str, float]] = None,
    ) -> dict:
        w = ScorecardWeights.from_dict(weights) if weights else self.weights

        resolution_rate = (
            metrics.resolved_tickets / metrics.total_tickets
            if metrics.total_tickets > 0
            else 0.0
        )

        speed_score = max(0.0, 1.0 - (metrics.avg_handling_hours / 48.0)) if metrics.avg_handling_hours > 0 else 1.0

        quality_score = min(metrics.quality_score / 5.0, 1.0) if metrics.quality_score > 0 else 0.0

        volume_cap = 200
        volume_score = min(metrics.ticket_volume / volume_cap, 1.0)

        sla_rate = (
            1.0 - (metrics.sla_breaches / metrics.total_assigned)
            if metrics.total_assigned > 0
            else 1.0
        )

        raw_score = (
            resolution_rate * w.resolution_weight
            + speed_score * w.speed_weight
            + quality_score * w.quality_weight
            + volume_score * w.volume_weight
            + sla_rate * w.sla_weight
        )

        final_score = round(raw_score * w.max_score, 2)

        breakdown = {
            "resolution_rate": round(resolution_rate, 4),
            "speed_score": round(speed_score, 4),
            "quality_score": round(quality_score, 4),
            "volume_score": round(volume_score, 4),
            "sla_rate": round(sla_rate, 4),
        }

        return {
            "score": final_score,
            "max_score": w.max_score,
            "breakdown": breakdown,
            "weights_applied": w.to_dict(),
            "metrics_summary": {
                "resolved_tickets": metrics.resolved_tickets,
                "total_tickets": metrics.total_tickets,
                "avg_handling_hours": metrics.avg_handling_hours,
                "quality_score": metrics.quality_score,
                "ticket_volume": metrics.ticket_volume,
                "sla_breaches": metrics.sla_breaches,
                "total_assigned": metrics.total_assigned,
            },
        }

    def compare_weights(
        self, metrics: AgentMetrics, weight_sets: list[Dict[str, float]]
    ) -> list[dict]:
        results = []
        for i, custom_weights in enumerate(weight_sets):
            result = self.compute_performance_score(metrics, weights=custom_weights)
            results.append({"scenario": i, "weights": custom_weights, "result": result})
        return results


_instance: Optional[AgentScorecard] = None


def load():
    global _instance
    if _instance is None:
        weights = ScorecardWeights.from_env()
        _instance = AgentScorecard(weights)
        logger.info(f"AgentScorecard loaded (weights={weights.to_dict()})")
    return _instance


def get_instance() -> Optional[AgentScorecard]:
    return _instance
