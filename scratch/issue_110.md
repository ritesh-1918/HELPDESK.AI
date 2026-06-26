## 🏆 Advanced AI Bounty Description

In global enterprise deployments, users frequently submit tickets in their local languages (e.g. Spanish, German, Hindi). However, support teams often operate in a single language.

To solve this, we want to integrate automatic translation inside our incoming ticket analysis pipeline.

---

## 🛠️ Requirements

1. **Language Detection & Translation**:
   * Integrate language detection in `/tickets/save` or `/ai/analyze_ticket`.
   * If non-English input is detected, trigger auto-translation using an AI service (e.g. local translator, Hugging Face, or Supabase Edge function proxy).
2. **Metadata Enrichment**:
   * Preserve the original multilingual description in a `metadata.original_text` JSONB sub-field to prevent data loss.
   * Populate `subject` and `description` with translated English texts before routing to classifiers to maintain high categorization accuracy.
3. **Frontend UI Support**:
   * Highlight translated tickets in standard and admin dashboard views with a subtle global translation banner: *"Translated from [Source Language] (View Original)"*.
4. **Target Branch**: Please target the `gssoc` branch, NOT `main`.
