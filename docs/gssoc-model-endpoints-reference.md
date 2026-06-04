# GSSoC Model Endpoints Reference Manual

This guide documents the AI model endpoints and inference pipeline in HELPDESK.AI.

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Models](#models)
- [Request/Response Formats](#requestresponse-formats)
- [Performance](#performance)
- [Configuration](#configuration)

---

## Overview

HELPDESK.AI uses multiple AI models for ticket processing. The main inference pipeline runs through FastAPI endpoints and includes classification, NER, duplicate detection, and generative resolution.

## API Endpoints

### POST /ai/analyze_ticket

Main endpoint for ticket analysis. Runs the full AI pipeline.

**URL:** `http://localhost:8000/ai/analyze_ticket`

**Method:** `POST`

**Request Body:**
```json
{
  "text": "My laptop screen is flickering",
  "image_base64": "",
  "image_text": ""
}
```

**Response:**
```json
{
  "category": "Hardware",
  "subcategory": "Monitor Problem",
  "priority": "Low",
  "auto_resolve": true,
  "assigned_team": "Hardware Support",
  "confidence": 0.95,
  "duplicate_ticket": {
    "is_duplicate": false,
    "duplicate_ticket_id": null,
    "similarity": 0.0
  },
  "summary": "Screen flickering issue on laptop",
  "entities": ["laptop", "screen"],
  "reasoning": "Hardware issue related to display",
  "decision_factors": ["keyword_match", "model_prediction"],
  "image_description": null,
  "ocr_text": null
}
```

### POST /ai/log_correction

Feedback endpoint for model retraining.

**Request Body:**
```json
{
  "ticket_id": "TCKT-1234",
  "predicted_category": "Hardware",
  "correct_category": "Software",
  "text": "Application crash on startup"
}
```

## Models

### 1. DistilBERT Classifier (v3)

- **Purpose:** Ticket categorization and priority prediction
- **Location:** `backend/models/classifier/`
- **Input:** Text (max 128 tokens)
- **Output:** Category + Subcategory label, confidence score

### 2. NER Model

- **Purpose:** Extract technical entities (hostnames, IPs, serial numbers)
- **Location:** `backend/models/ner/`
- **Input:** Raw ticket text
- **Output:** List of extracted entities with labels

### 3. Sentence Transformers (Duplicate Detection)

- **Purpose:** Semantic similarity for duplicate ticket detection
- **Model:** `all-MiniLM-L6-v2`
- **Threshold:** 0.70 cosine similarity
- **Location:** In-memory with disk persistence

### 4. Generative AI (Gemini/GitHub Models)

- **Purpose:** Auto-resolution suggestions and knowledge base articles
- **Integration:** Via `gemini_service.py`
- **Trigger:** High-confidence tickets with auto-resolve flag

## Request/Response Formats

### Text Classification

```python
# Input
text = "My monitor is not turning on"

# Output
{
    "category": "Hardware",
    "subcategory": "Monitor Problem",
    "priority": "Low",
    "confidence": 0.92,
    "auto_resolve": true,
    "assigned_team": "Hardware Support"
}
```

### Duplicate Detection

```python
# Input
text = "Screen is flickering on my laptop"

# Output
{
    "is_duplicate": true,
    "duplicate_ticket_id": "TCKT-5678",
    "similarity": 0.8542
}
```

### Entity Extraction

```python
# Input
text = "Server SRV-001 at 192.168.1.100 is down"

# Output
{
    "entities": [
        {"text": "SRV-001", "label": "HOSTNAME"},
        {"text": "192.168.1.100", "label": "IP_ADDRESS"}
    ]
}
```

## Performance

| Model | Latency | Throughput |
|-------|---------|------------|
| Classifier | ~50ms | 100+ req/s |
| NER | ~30ms | 150+ req/s |
| Duplicate Detection | ~100ms | 50+ req/s |
| Full Pipeline | ~400ms | 25+ req/s |

## Configuration

### Environment Variables

```env
# Model paths
SENTENCE_TRANSFORMER_MODEL_PATH=./models/sentence-transformer

# Performance
ALLOW_DEGRADED_STARTUP=1
MODEL_CACHE_DIR=./models/cache

# AI Service
GEMINI_API_KEY=your-api-key
GITHUB_TOKEN=your-github-token
```

### Model Loading

Models are loaded lazily on first request. Set `ALLOW_DEGRADED_STARTUP=1` to continue without models if they fail to load.
