"""
SLA resolution target calculation (issue #3897).

Maps a ticket to a target resolution deadline based on its priority and a
calendar configuration. Deadlines advance in *business hours* only: weekends,
configured off-days, and public holidays do not count against the SLA budget.

Run with:  python -m unittest backend.tests.test_sla_service -v
"""

from __future__ import annotations

import datetime
from dataclasses import dataclass, field

# Default SLA budget (calendar hours) per priority when no config is supplied.
SLA_HOURS_BY_PRIORITY = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}
DEFAULT_SLA_HOURS = 72

# Business-hours calendar used when no company configuration is provided.
DEFAULT_BUSINESS_HOURS = (9, 17)  # 09:00 - 17:00
# datetime.weekday(): Monday = 0 ... Sunday = 6
DEFAULT_WORKING_DAYS = frozenset({0, 1, 2, 3, 4})


@dataclass(frozen=True)
class SLACalendar:
    """A configurable business-hours calendar for SLA deadlines."""

    business_hours: tuple[int, int] = DEFAULT_BUSINESS_HOURS
    working_days: frozenset[int] = field(default_factory=lambda: DEFAULT_WORKING_DAYS)
    holidays: frozenset[datetime.date] = field(default_factory=frozenset)

    def is_working_day(self, day: datetime.date) -> bool:
        """True when ``day`` is neither a public holiday nor an off-day."""
        if day in self.holidays:
            return False
        return day.weekday() in self.working_days

    def next_working_day(self, day: datetime.date) -> datetime.date:
        """Earliest working day on or after ``day``."""
        candidate = day
        while not self.is_working_day(candidate):
            candidate = candidate + datetime.timedelta(days=1)
        return candidate


def get_sla_hours(priority: str, hours_map: dict[str, int] | None = None) -> int:
    """SLA budget in hours for a priority, falling back to a default."""
    mapping = hours_map or SLA_HOURS_BY_PRIORITY
    return mapping.get(priority, DEFAULT_SLA_HOURS)


def get_sla_deadline(
    start: datetime.datetime,
    priority: str,
    *,
    calendar: SLACalendar | None = None,
    hours_map: dict[str, int] | None = None,
) -> datetime.datetime:
    """
    Compute the business-hours resolution deadline for ``priority``.

    ``start`` may be naive (UTC by convention) or timezone-aware; the returned
    deadline carries the same tzinfo. Only working days within
    ``calendar.business_hours`` count toward the deadline.
    """
    calendar = calendar or SLACalendar()
    open_at, close_at = calendar.business_hours
    day_seconds = (close_at - open_at) * 3600
    if day_seconds <= 0:
        raise ValueError("Business hours must have a positive duration")

    tzinfo = start.tzinfo
    current = start.replace(tzinfo=None)
    remaining_seconds = get_sla_hours(priority, hours_map) * 3600

    def _open_of_day(day: datetime.datetime) -> datetime.datetime:
        return day.replace(hour=open_at, minute=0, second=0, microsecond=0)

    # Snap to the next opening slot if the ticket arrives outside business hours.
    if current.time().hour < open_at:
        current = _open_of_day(current)
    elif current.time().hour >= close_at:
        current = _open_of_day(current) + datetime.timedelta(days=1)

    while remaining_seconds > 0:
        if not calendar.is_working_day(current.date()):
            current = _open_of_day(current) + datetime.timedelta(days=1)
            continue

        seconds_elapsed_today = (current.hour * 3600 + current.minute * 60 + current.second) - open_at * 3600
        seconds_left_today = day_seconds - seconds_elapsed_today
        if seconds_left_today <= 0:
            current = _open_of_day(current) + datetime.timedelta(days=1)
            continue

        take = min(remaining_seconds, seconds_left_today)
        current = current + datetime.timedelta(seconds=take)
        remaining_seconds -= take
        if remaining_seconds > 0:
            current = _open_of_day(current) + datetime.timedelta(days=1)

    return current.replace(tzinfo=tzinfo)
