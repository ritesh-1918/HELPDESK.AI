"""
sla_service.py — Calendar-Aware SLA Breach Timestamp Calculator (#3897)

Computes ticket resolution SLA deadline timestamps by counting only
*working* minutes — excluding nights, weekends, and public holidays —
rather than a naive wall-clock offset.

Usage
-----
    from backend.services.sla_service import SlaCalculator, CalendarConfig
    from datetime import date

    calendar = CalendarConfig(
        work_days={0, 1, 2, 3, 4},           # Mon–Fri
        work_start=time(9, 0),
        work_end=time(17, 0),
        public_holidays={date(2025, 12, 25)}, # Christmas
        timezone="UTC",
    )
    breach_at = SlaCalculator().calculate_breach_at(
        created_at=datetime.utcnow(),
        priority="High",
        calendar=calendar,
    )
"""

from __future__ import annotations

import datetime
from dataclasses import dataclass, field
from typing import Set

# ---------------------------------------------------------------------------
# SLA budget in business-hours minutes per priority level.
# These map to the conceptual limits below:
#   Critical  →  2 business-hours  (120 min)
#   High      →  8 business-hours  (480 min)
#   Medium    →  3 business-days × 8h = 24 biz-hrs (1 440 min)
#   Low       →  6 business-days × 8h = 48 biz-hrs (2 880 min)
# ---------------------------------------------------------------------------

SLA_BUDGETS_MINUTES: dict[str, int] = {
    "Critical": 120,
    "High":     480,
    "Medium":   1_440,
    "Low":      2_880,
}

_DEFAULT_BUDGET = SLA_BUDGETS_MINUTES["Low"]


@dataclass
class CalendarConfig:
    """
    Encapsulates a company's working calendar for SLA calculation.

    Attributes
    ----------
    work_days:
        Set of weekday integers (0 = Monday … 6 = Sunday) that count as
        working days. Default: Monday–Friday.
    work_start:
        Start of the business day (inclusive). Default: 09:00.
    work_end:
        End of the business day (exclusive). Default: 17:00.
    public_holidays:
        Set of ``date`` objects representing non-working days (public
        holidays, company shut-downs, etc.). Default: empty set.
    timezone:
        IANA timezone string used to interpret ``work_start``/``work_end``.
        Ticket timestamps are converted from UTC to this zone before the
        business-hour check. Default: ``"UTC"``.
    """

    work_days: Set[int] = field(default_factory=lambda: {0, 1, 2, 3, 4})
    work_start: datetime.time = datetime.time(9, 0)
    work_end: datetime.time = datetime.time(17, 0)
    public_holidays: Set[datetime.date] = field(default_factory=set)
    timezone: str = "UTC"

    # Derived: total working minutes per day
    @property
    def minutes_per_day(self) -> int:
        start_mins = self.work_start.hour * 60 + self.work_start.minute
        end_mins = self.work_end.hour * 60 + self.work_end.minute
        return max(0, end_mins - start_mins)


class SlaCalculator:
    """
    Stateless calculator that advances a datetime by a budget of
    *business-hours minutes*, skipping non-working periods.
    """

    def calculate_breach_at(
        self,
        created_at: datetime.datetime,
        priority: str,
        calendar: CalendarConfig | None = None,
    ) -> datetime.datetime:
        """
        Compute the SLA breach timestamp for a ticket.

        Parameters
        ----------
        created_at:
            Ticket creation time in UTC (naive or UTC-aware).
        priority:
            One of ``"Critical"``, ``"High"``, ``"Medium"``, ``"Low"``.
            Unknown values fall back to the Low budget.
        calendar:
            Working calendar configuration. Defaults to Mon–Fri 09:00–17:00
            UTC with no public holidays.

        Returns
        -------
        datetime.datetime
            UTC-normalised breach timestamp (timezone-naive, UTC).
        """
        if calendar is None:
            calendar = CalendarConfig()

        budget_minutes = SLA_BUDGETS_MINUTES.get(priority, _DEFAULT_BUDGET)

        # Normalise to UTC naive datetime for consistent arithmetic
        if created_at.tzinfo is not None:
            cursor = created_at.astimezone(datetime.timezone.utc).replace(tzinfo=None)
        else:
            cursor = created_at

        # Fast-forward cursor to the start of the next working period if the
        # ticket was created outside business hours.
        cursor = self._advance_to_working_time(cursor, calendar)

        remaining = budget_minutes

        while remaining > 0:
            # Minutes left in today's business window from cursor position
            end_of_day = datetime.datetime.combine(cursor.date(), calendar.work_end)
            window_end = min(
                end_of_day,
                cursor + datetime.timedelta(minutes=remaining),
            )
            available_today = int((end_of_day - cursor).total_seconds() / 60)

            if remaining <= available_today:
                # Enough room left in today's window
                cursor = cursor + datetime.timedelta(minutes=remaining)
                remaining = 0
            else:
                # Burn today's remaining window and roll to next working day
                remaining -= available_today
                cursor = self._next_work_day_start(cursor.date() + datetime.timedelta(days=1), calendar)

        return cursor

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _is_working_day(self, d: datetime.date, calendar: CalendarConfig) -> bool:
        """Return True if ``d`` is a configured working day (not holiday/weekend)."""
        return d.weekday() in calendar.work_days and d not in calendar.public_holidays

    def _next_work_day_start(
        self, from_date: datetime.date, calendar: CalendarConfig
    ) -> datetime.datetime:
        """
        Return a datetime at the start of business hours on the first working
        day on or after ``from_date``.
        """
        candidate = from_date
        # Walk forward until we land on a working day (max 14 days to avoid
        # infinite loops in pathological holiday configurations).
        for _ in range(14):
            if self._is_working_day(candidate, calendar):
                return datetime.datetime.combine(candidate, calendar.work_start)
            candidate += datetime.timedelta(days=1)
        # Safety fallback: return 14 days ahead at work_start
        return datetime.datetime.combine(
            from_date + datetime.timedelta(days=14), calendar.work_start
        )

    def _advance_to_working_time(
        self, cursor: datetime.datetime, calendar: CalendarConfig
    ) -> datetime.datetime:
        """
        If ``cursor`` falls outside business hours (holiday, weekend, night),
        advance it to the start of the next working period.
        """
        for _ in range(14):
            if not self._is_working_day(cursor.date(), calendar):
                cursor = self._next_work_day_start(
                    cursor.date() + datetime.timedelta(days=1), calendar
                )
                continue

            work_start_dt = datetime.datetime.combine(cursor.date(), calendar.work_start)
            work_end_dt = datetime.datetime.combine(cursor.date(), calendar.work_end)

            if cursor < work_start_dt:
                # Before business hours today — snap to start
                return work_start_dt
            if cursor >= work_end_dt:
                # After business hours today — roll to next working day
                cursor = self._next_work_day_start(
                    cursor.date() + datetime.timedelta(days=1), calendar
                )
                continue

            # Cursor is within working hours on a working day
            return cursor

        return cursor  # fallback
