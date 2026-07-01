"""
Resolution Summary Service — AI-generated summaries for resolved tickets.

Generates concise, human-readable summaries of how a ticket was resolved,
saves them to the ticket record, and supports an admin-editable draft flow.

The service analyses the ticket description, resolution steps taken, and
any actions performed to produce a succinct resolution summary.
"""

import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class ResolutionSummaryService:
    """Generates and manages AI resolution summaries for support tickets."""

    def __init__(self, supabase_client):
        """
        Initialise the service.

        Args:
            supabase_client: An initialised Supabase client with service-role
                             credentials for database operations.
        """
        self.supabase = supabase_client

    # ------------------------------------------------------------------
    # AI summary generation
    # ------------------------------------------------------------------

    def generate_summary(
        self,
        ticket_text: str,
        resolution_steps: Optional[list[str]] = None,
        actions_taken: Optional[list[str]] = None,
    ) -> str:
        """
        Produce a concise one-paragraph resolution summary.

        The summary is generated heuristically from the available data rather
        than calling an external LLM API, keeping the feature zero-cost and
        instant.  The format follows the pattern:

            "Resolved: <ticket issue summary>. Steps: <steps>."

        Args:
            ticket_text:     The original ticket subject / description text.
            resolution_steps: Ordered list of steps performed to resolve the ticket.
            actions_taken:   Supplementary actions (escalations, external follow-ups, etc.).

        Returns:
            A concise string summary of the resolution (≤ 3 sentences).
        """
        # Sanitise inputs
        ticket_text = (ticket_text or "").strip()
        resolution_steps = resolution_steps or []
        actions_taken = actions_taken or []

        # Truncate very long ticket text to keep summaries focused
        if len(ticket_text) > 500:
            ticket_text = ticket_text[:500] + "…"

        # --- Build the core summary sentence ---
        # Extract a short description from the ticket text
        description = self._extract_short_description(ticket_text)

        # --- Build the resolution steps summary ---
        steps_text = self._format_steps(resolution_steps)

        # --- Build the actions summary ---
        actions_text = self._format_steps(actions_taken, label="Additional actions")

        # --- Assemble final summary ---
        parts = [f"Resolved: {description}."]
        if steps_text:
            parts.append(steps_text)
        if actions_text:
            parts.append(actions_text)

        return " ".join(parts)

    def _extract_short_description(self, text: str) -> str:
        """Extract a short description from the ticket text."""
        if not text:
            return "Issue resolved without additional details available"

        # Use the first sentence or first ~100 chars as a summary
        first_sentence = text.split(".")[0].strip()
        if len(first_sentence) > 150:
            first_sentence = first_sentence[:147] + "…"
        return first_sentence

    def _format_steps(
        self,
        steps: list[str],
        label: str = "Steps",
    ) -> str:
        """Format a list of steps into a readable phrase."""
        if not steps:
            return ""

        cleaned = [s.strip().rstrip(".") for s in steps if s and s.strip()]
        if not cleaned:
            return ""

        if len(cleaned) == 1:
            return f"{label}: {cleaned[0]}."

        bullet = "; ".join(cleaned)
        return f"{label}: {bullet}."

    # ------------------------------------------------------------------
    # Database operations
    # ------------------------------------------------------------------

    def save_summary_to_ticket(self, ticket_id: str, summary: str) -> dict:
        """
        Persist a resolution summary onto the ticket record.

        The summary is written into the ticket's metadata JSONB column
        under the key "resolution_summary", and the ticket status is
        appended with resolution metadata.

        Args:
            ticket_id: UUID of the target ticket.
            summary:   The resolution summary text to save.

        Returns:
            A dict with {"status": "ok", "summary": <str>} or
            {"status": "error", "detail": <str>}.

        Raises:
            RuntimeError: If supabase client is unavailable.
        """
        if not self.supabase:
            raise RuntimeError("Database client is not available")

        try:
            # Fetch current ticket to merge into existing metadata
            res = (
                self.supabase.table("tickets")
                .select("id, metadata")
                .eq("id", ticket_id)
                .single()
                .execute()
            )
            if not res.data:
                return {"status": "error", "detail": "Ticket not found"}

            current_metadata = res.data.get("metadata") or {}
            current_metadata["resolution_summary"] = summary
            current_metadata["resolution_summary_generated_at"] = (
                __import__("datetime").datetime.utcnow().isoformat() + "Z"
            )

            self.supabase.table("tickets").update(
                {"metadata": current_metadata}
            ).eq("id", ticket_id).execute()

            logger.info(
                "Resolution summary saved for ticket %s", ticket_id
            )
            return {"status": "ok", "summary": summary}

        except Exception as exc:
            logger.error(
                "Failed to save resolution summary for ticket %s: %s",
                ticket_id, exc,
            )
            return {"status": "error", "detail": str(exc)}

    def generate_draft(self, ticket_id: str) -> dict:
        """
        Generate an editable resolution summary draft for a ticket.

        Fetches the ticket, examines its description and any existing metadata
        (solution_steps, entities, etc.), produces a draft summary,
        and returns it in a form the caller can present as an editable textarea.

        Args:
            ticket_id: UUID of the target ticket.

        Returns:
            A dict with:
            - ticket_id: str
            - draft_summary: str (the editable summary text)
            - source_fields: dict of fields used to generate the draft
            - status: str ("ok" or "error")
        """
        if not self.supabase:
            return {
                "status": "error",
                "detail": "Database client is not available",
            }

        try:
            res = (
                self.supabase.table("tickets")
                .select("*")
                .eq("id", ticket_id)
                .single()
                .execute()
            )
            if not res.data:
                return {"status": "error", "detail": "Ticket not found"}

            ticket = res.data

            # Collect inputs for summary generation
            subject = (ticket.get("subject") or "").strip()
            description = (ticket.get("description") or "").strip()
            ticket_text = f"{subject} — {description}" if subject else description

            metadata = ticket.get("metadata") or {}
            if isinstance(metadata, str):
                try:
                    metadata = json.loads(metadata)
                except (json.JSONDecodeError, TypeError):
                    metadata = {}

            solution_steps = metadata.get("solution_steps") or []
            actions_taken = metadata.get("actions_taken") or []

            draft = self.generate_summary(ticket_text, solution_steps, actions_taken)

            return {
                "status": "ok",
                "ticket_id": ticket_id,
                "draft_summary": draft,
                "source_fields": {
                    "solution_steps": solution_steps,
                    "actions_taken": actions_taken,
                    "existing_summary": metadata.get("resolution_summary"),
                },
            }

        except Exception as exc:
            logger.error(
                "Failed to generate draft for ticket %s: %s",
                ticket_id, exc,
            )
            return {"status": "error", "detail": str(exc)}
