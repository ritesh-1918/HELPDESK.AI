import datetime
import re
from typing import Any, Dict, Iterable, List, Optional, Union

SAFE_DATE_KEYS = {
    "created_at",
    "updated_at",
    "resolved_at",
    "closed_at",
    "sla_breach_at",
    "timestamp",
}

ISO_OFFSET_RE = re.compile(r"^(?P<prefix>.*?)(?P<sign>[+-])(?P<hours>\\d{2})(?P<minutes>\\d{2})$")


def normalize_iso_string(value: Any) -> Optional[str]:
    """Normalize a timestamp into UTC ISO-8601 text ending in Z."""
    if value is None:
        return None

    if isinstance(value, datetime.datetime):
        dt = value
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt.astimezone(datetime.timezone.utc).isoformat().replace("+00:00", "Z")

    if not isinstance(value, str):
        return None

    source = value.strip()
    if not source:
        return None

    if source.endswith("Z"):
        source = source[:-1] + "+00:00"

    try:
        dt = datetime.datetime.fromisoformat(source)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt.astimezone(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    except ValueError:
        pass

    # Fallback to alternate parsers
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S", "%d-%m-%Y %H:%M:%S"):
        try:
            dt = datetime.datetime.strptime(source.split(".")[0], fmt)
            dt = dt.replace(tzinfo=datetime.timezone.utc)
            return dt.isoformat().replace("+00:00", "Z")
        except ValueError:
            continue

    match = ISO_OFFSET_RE.match(source)
    if match:
        prefix = match.group("prefix")
        sign = match.group("sign")
        hours = match.group("hours")
        minutes = match.group("minutes")
        repaired = f"{prefix}{sign}{hours}:{minutes}"
        try:
            dt = datetime.datetime.fromisoformat(repaired)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.timezone.utc)
            return dt.astimezone(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
        except ValueError:
            pass

    raise ValueError(f"Unsupported ISO timestamp: {value!r}")


def parse_iso_string(value: Any) -> Optional[datetime.datetime]:
    """Parse an ISO-8601 timestamp string into a timezone-aware UTC datetime."""
    if value is None:
        return None
    if isinstance(value, datetime.datetime):
        return value if value.tzinfo is not None else value.replace(tzinfo=datetime.timezone.utc)

    normalized = normalize_iso_string(value)
    if normalized is None:
        return None

    return datetime.datetime.fromisoformat(normalized.replace("Z", "+00:00"))


def normalize_date_for_output(value: Any) -> Any:
    """Return a normalized timestamp string for storage and API responses."""
    if value is None:
        return None
    if isinstance(value, datetime.datetime):
        return normalize_iso_string(value)
    if isinstance(value, str):
        try:
            return normalize_iso_string(value)
        except ValueError:
            return value
    return value


def _normalize_record_value(key: str, value: Any) -> Any:
    if isinstance(value, dict):
        return normalize_record_dates(value)
    if isinstance(value, list):
        return [ _normalize_record_value(key, item) for item in value ]
    if key in SAFE_DATE_KEYS or key.endswith("_at"):
        return normalize_date_for_output(value)
    return value


def normalize_record_dates(record: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize all timestamp fields inside a ticket record."""
    if not isinstance(record, dict):
        return record

    normalized: Dict[str, Any] = {}
    for key, value in record.items():
        normalized[key] = _normalize_record_value(key, value)
    return normalized


def normalize_records(records: Union[List[Any], Dict[str, Any]]) -> Union[List[Any], Dict[str, Any]]:
    """Normalize timestamp fields on a list of records or a single record."""
    if isinstance(records, list):
        return [normalize_record_dates(item) if isinstance(item, dict) else item for item in records]
    if isinstance(records, dict):
        return normalize_record_dates(records)
    return records
