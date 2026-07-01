
"""
Sentiment Analysis Service for Customer Frustration Detection
Classifies ticket text into: positive, neutral, negative, frustrated
Also provides a churn risk score based on sentiment and other factors
"""

import os
import re
from typing import Dict, Optional, Tuple
from pathlib import Path

# Try to use transformers for ML-based sentiment, fallback to keyword-based if not available
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False


class SentimentService:
    """
    Service for sentiment analysis and frustration detection
    """

    def __init__(self):
        self._loaded = False
        self._classifier = None
        self._tokenizer = None

        # Frustration keywords for rule-based fallback
        self.frustration_keywords = [
            "annoying", "frustrating", "terrible", "awful", "disappointed",
            "angry", "upset", "fed up", "can't stand", "not working", "broken",
            "never works", "waste of time", "ridiculous", "unacceptable",
            "horrible", "disgusting", "pathetic", "useless", "worst",
            "hate", "stupid", "idiotic", "nonsense", "crap", "bullshit"
        ]

        # Positive keywords for rule-based fallback
        self.positive_keywords = [
            "great", "excellent", "amazing", "fantastic", "love", "perfect",
            "wonderful", "awesome", "thank you", "thanks", "appreciate",
            "good", "nice", "helpful", "satisfied", "happy"
        ]

    def load(self, model_name: str = "cardiffnlp/twitter-roberta-base-sentiment-latest") -> None:
        """
        Load the sentiment analysis model
        Uses a lightweight model for sentiment classification
        """
        if self._loaded:
            return

        if TRANSFORMERS_AVAILABLE:
            try:
                print("[Sentiment Service] Loading sentiment model...")
                self._classifier = pipeline(
                    "sentiment-analysis",
                    model=model_name,
                    tokenizer=model_name,
                    truncation=True,
                    max_length=512
                )
                self._loaded = True
                print("[Sentiment Service] Model loaded successfully")
            except Exception as e:
                print(f"[Sentiment Service] Failed to load model: {e}")
                print("[Sentiment Service] Falling back to rule-based analysis")
                self._loaded = True  # Still mark as loaded for rule-based mode
        else:
            print("[Sentiment Service] Transformers not available, using rule-based analysis")
            self._loaded = True

    def _rule_based_sentiment(self, text: str) -> Tuple[str, float, float]:
        """
        Rule-based sentiment analysis as fallback
        Returns (sentiment_label, confidence_score, frustration_score)
        """
        text_lower = text.lower()

        # Count keywords
        frustration_count = sum(1 for keyword in self.frustration_keywords if keyword in text_lower)
        positive_count = sum(1 for keyword in self.positive_keywords if keyword in text_lower)

        # Exclamation mark check (often indicates frustration)
        exclamation_count = text.count("!")

        # Calculate scores
        total_words = len(text.split())
        frustration_score = min((frustration_count * 10 + exclamation_count * 2) / max(total_words, 10), 1.0)
        positive_score = min(positive_count * 8 / max(total_words, 10), 1.0)

        if frustration_score > 0.3:
            return "frustrated", 0.7 + frustration_score * 0.3, frustration_score
        elif positive_score > 0.2:
            return "positive", 0.7 + positive_score * 0.3, 0.0
        else:
            return "neutral", 0.6, 0.0

    def analyze(self, text: str) -> Dict:
        """
        Perform sentiment analysis on the given text
        Returns a dictionary with:
        - sentiment: one of 'positive', 'neutral', 'negative', 'frustrated'
        - confidence: confidence score of the sentiment prediction
        - frustration_score: 0.0 to 1.0 indicating level of frustration
        - churn_risk: 0.0 to 1.0 estimated churn risk
        """
        if not self._loaded:
            self.load()

        text = text.strip()
        if not text:
            return {
                "sentiment": "neutral",
                "confidence": 0.5,
                "frustration_score": 0.0,
                "churn_risk": 0.0
            }

        # First check for rule-based frustration (works even without model)
        text_lower = text.lower()
        frustration_score = 0.0
        for keyword in self.frustration_keywords:
            if keyword in text_lower:
                frustration_score += 0.1
        frustration_score = min(frustration_score, 1.0)

        # Add exclamation mark intensity
        exclamation_count = text.count("!")
        frustration_score += exclamation_count * 0.05
        frustration_score = min(frustration_score, 1.0)

        # Use ML model if available
        if TRANSFORMERS_AVAILABLE and self._classifier:
            try:
                result = self._classifier(text)[0]
                label = result["label"].lower()
                confidence = result["score"]

                # Map to our labels
                if label == "positive":
                    sentiment = "positive"
                elif label == "negative":
                    # If negative and high frustration score, mark as frustrated
                    if frustration_score > 0.2:
                        sentiment = "frustrated"
                    else:
                        sentiment = "negative"
                else:
                    # Neutral, but check for frustration
                    sentiment = "frustrated" if frustration_score > 0.3 else "neutral"

            except Exception as e:
                print(f"[Sentiment Service] ML analysis failed: {e}")
                sentiment, confidence, frustration_score = self._rule_based_sentiment(text)
        else:
            sentiment, confidence, frustration_score = self._rule_based_sentiment(text)

        # Calculate churn risk
        churn_risk = self._calculate_churn_risk(sentiment, frustration_score, text)

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "frustration_score": frustration_score,
            "churn_risk": churn_risk
        }

    def _calculate_churn_risk(self, sentiment: str, frustration_score: float, text: str) -> float:
        """
        Calculate estimated churn risk based on sentiment and other signals
        Returns a score between 0.0 (no risk) and 1.0 (high risk)
        """
        risk = 0.0

        # Base risk from sentiment
        if sentiment == "frustrated":
            risk += 0.5
        elif sentiment == "negative":
            risk += 0.3
        elif sentiment == "neutral":
            risk += 0.1

        # Add frustration score contribution
        risk += frustration_score * 0.3

        # Check for churn indicators in text
        churn_indicators = [
            "cancel", "churn", "leave", "switch", "stop using", "no longer",
            "going to another", "find another", "competitor", "alternative"
        ]
        text_lower = text.lower()
        for indicator in churn_indicators:
            if indicator in text_lower:
                risk += 0.2

        # Cap at 1.0
        return min(risk, 1.0)

    def is_available(self) -> bool:
        """Check if service is available"""
        return self._loaded
