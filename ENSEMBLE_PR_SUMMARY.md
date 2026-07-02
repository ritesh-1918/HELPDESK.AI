# Multi-Model Ensemble Classification — PR Summary

## Issue Solved
Closes #2805 — Implement Multi-Model Ensemble for Ticket Classifications

## Overview
Replaces the single-model DistilBERT classification pipeline with a **4-model weighted ensemble** that combines:
- DistilBERT (semantic understanding)
- TF-IDF + Logistic Regression (keyword detection)
- Random Forest (feature-engineered patterns)
- Rule-Based Engine (deterministic domain rules)

## Files Added

| File | Purpose |
|------|---------|
| `backend/services/tfidf_model.py` | TF-IDF + Logistic Regression classifier |
| `backend/services/rf_model.py` | Random Forest classifier with hand-crafted features |
| `backend/services/rule_engine.py` | Regex-based deterministic rule engine |
| `backend/services/ensemble_classifier.py` | Ensemble aggregator (weighted soft voting) |
| `backend/services/model_monitoring.py` | Drift detection and monitoring metrics service |
| `backend/models/ensemble_prediction.py` | EnsemblePrediction data model + A/B test record |
| `backend/tests/test_ensemble.py` | 50+ tests covering all components |
| `backend/data/monitoring/.gitkeep` | Monitoring data directory |

## Files Modified

| File | Change |
|------|--------|
| `backend/main.py` | Ensemble wired into `/ai/analyze`, `/ai/analyze_stream`, + 5 new ensemble API endpoints |
| `.gitignore` | Exclude auto-generated model caches and runtime monitoring logs |

## New API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/ensemble/classify` | POST | Run ensemble on any text, returns full metadata |
| `/ai/ensemble/health` | GET | Check which models are loaded |
| `/ai/ensemble/metrics` | GET | Dashboard metrics, drift indicators, A/B summary |
| `/ai/ensemble/weights` | POST | Dynamically update model weights |
| `/ai/ensemble/correct` | POST | Log a human correction for drift tracking |

## Ensemble Architecture

```
Input Text
    │
    ├── DistilBERT (weight: 0.40) ──→ prob vector
    ├── TF-IDF + LR  (weight: 0.30) ──→ prob vector
    ├── Random Forest (weight: 0.20) ──→ prob vector
    └── Rule Engine   (weight: 0.10) ──→ prob vector
            │
            ▼
    Weighted Soft Voting
            │
            ▼
    Final Probability Distribution
            │
    ┌───────┴────────┐
    │                │
  Entropy        Agreement
  (uncertainty)  (model consensus)
            │
            ▼
    Routing Decision:
    - confidence ≥ 0.85 → auto_route
    - confidence ≥ 0.70 → monitor
    - confidence < 0.70 → human_review
    - agreement < 0.25  → escalate
```

## Uncertainty Quantification

Every prediction now returns:
```json
{
  "prediction": "Access | Password Reset",
  "confidence": 0.92,
  "entropy": 0.15,
  "agreement": 0.87,
  "routing_action": "auto_route",
  "needs_review": false,
  "model_votes": {
    "bert": "Access | Password Reset",
    "tfidf": "Access | Password Reset",
    "rf": "Access | Password Reset",
    "rules": "Access | Password Reset"
  }
}
```

## Backward Compatibility

- The existing `/ai/analyze` and `/ai/analyze_stream` endpoints are unchanged from the consumer perspective
- The ensemble is injected transparently — if ensemble models fail to load, the pipeline falls back gracefully to the existing V3 → V1 single-model chain
- No breaking changes to the `TicketResponse` schema
- Ensemble metadata is surfaced in `env_metadata.ensemble` for frontend consumption

## Testing

Run all ensemble tests:
```bash
pytest backend/tests/test_ensemble.py -v
```

Tests cover: TF-IDF predictions, RF predictions, Rule engine pattern matching, Entropy calculations, Agreement scores, Routing decisions, Data models, Monitoring metrics, and real-world scenario tickets from Issue #2805.
