"""
Unit tests for SLA resolution target calculation (issue #3897).

Run with:  python -m unittest backend.tests.test_sla_service -v
"""

import datetime
import unittest

from backend.services.sla_service import (
    DEFAULT_SLA_HOURS,
    SLACalendar,
    get_sla_deadline,
    get_sla_hours,
)


def _dt(year, month, day, hour, minute=0):
    return datetime.datetime(year, month, day, hour, minute)


class GetSlaHoursTests(unittest.TestCase):
    def test_known_priorities(self):
        self.assertEqual(get_sla_hours("Critical"), 2)
        self.assertEqual(get_sla_hours("High"), 8)
        self.assertEqual(get_sla_hours("Medium"), 24)
        self.assertEqual(get_sla_hours("Low"), 72)

    def test_unknown_priority_defaults(self):
        self.assertEqual(get_sla_hours("Unknown"), DEFAULT_SLA_HOURS)


class GetSlaDeadlineTests(unittest.TestCase):
    def test_critical_within_same_day(self):
        start = _dt(2026, 7, 6, 10, 0)  # Monday
        deadline = get_sla_deadline(start, "Critical")
        self.assertEqual(deadline, _dt(2026, 7, 6, 12, 0))

    def test_medium_spans_to_next_day(self):
        start = _dt(2026, 7, 6, 16, 0)  # Monday 16:00, 24h budget
        deadline = get_sla_deadline(start, "Medium")
        # 1h Monday + 8h Tuesday + 8h Wednesday + 7h Thursday = 24h
        self.assertEqual(deadline, _dt(2026, 7, 9, 16, 0))

    def test_weekend_does_not_count(self):
        start = _dt(2026, 7, 4, 10, 0)  # Saturday
        deadline = get_sla_deadline(start, "Critical")
        # Rolls to Monday 09:00, then +2h => Monday 11:00
        self.assertEqual(deadline, _dt(2026, 7, 6, 11, 0))

    def test_public_holiday_does_not_count(self):
        holiday = datetime.date(2026, 7, 6)  # Monday holiday
        calendar = SLACalendar(holidays=frozenset({holiday}))
        start = _dt(2026, 7, 6, 10, 0)
        deadline = get_sla_deadline(start, "Critical", calendar=calendar)
        self.assertEqual(deadline, _dt(2026, 7, 7, 12, 0))

    def test_after_hours_rolls_to_next_opening(self):
        start = _dt(2026, 7, 6, 19, 0)  # Monday after 17:00 close
        deadline = get_sla_deadline(start, "Critical")
        self.assertEqual(deadline, _dt(2026, 7, 7, 11, 0))

    def test_custom_business_hours(self):
        calendar = SLACalendar(business_hours=(10, 16))
        start = _dt(2026, 7, 6, 10, 0)
        deadline = get_sla_deadline(start, "Critical", calendar=calendar)
        self.assertEqual(deadline, _dt(2026, 7, 6, 12, 0))

    def test_tzinfo_preserved(self):
        tz = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
        start = _dt(2026, 7, 6, 10, 0).replace(tzinfo=tz)
        deadline = get_sla_deadline(start, "Critical")
        self.assertEqual(deadline.tzinfo, tz)

    def test_custom_hours_map(self):
        start = _dt(2026, 7, 6, 10, 0)
        deadline = get_sla_deadline(start, "Critical", hours_map={"Critical": 4})
        self.assertEqual(deadline, _dt(2026, 7, 6, 14, 0))


if __name__ == "__main__":
    unittest.main()
