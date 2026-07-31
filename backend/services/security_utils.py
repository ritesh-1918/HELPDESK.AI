"""
Security utilities.

Provides constant-time comparison helpers and password hashing/verification
primitives so that secret/credential checks are resilient against timing
attacks. Authentication for the public API is delegated to Supabase Auth, but
any local secret comparison (tenant scopes, reset tokens, stored hashes) must
go through these helpers instead of the standard equality operator.
"""

import hashlib
import hmac
import secrets

PBKDF2_ROUNDS = 260_000
HASH_SCHEME = "pbkdf2_sha256"


def constant_time_compare(value_a, value_b) -> bool:
    """
    Compare two values in constant time.

    Accepts ``str`` or ``bytes``. Returning ``False`` for inputs of different
    lengths is inherent to the API, but identical-length comparisons no longer
    leak byte-by-byte timing information the way ``==`` would.
    """
    if isinstance(value_a, str):
        value_a = value_a.encode("utf-8")
    if isinstance(value_b, str):
        value_b = value_b.encode("utf-8")
    if not isinstance(value_a, (bytes, bytearray)) or not isinstance(value_b, (bytes, bytearray)):
        raise TypeError("constant_time_compare expects str or bytes inputs")
    return hmac.compare_digest(value_a, value_b)


def hash_password(password: str, *, salt: str | None = None, rounds: int = PBKDF2_ROUNDS) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with a random per-call salt.

    Returns a self-describing string of the form:
        pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>
    """
    if not isinstance(password, str):
        raise TypeError("password must be a str")
    salt_bytes = bytes.fromhex(salt) if salt else secrets.token_bytes(16)
    salt_hex = salt_bytes.hex()
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, rounds)
    return f"{HASH_SCHEME}${rounds}${salt_hex}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify a password against a stored ``hash_password`` output.

    Both the candidate and stored digests are recomputed/parsed and compared
    with :func:`constant_time_compare`, so verification time does not depend
    on how many leading characters match.
    """
    if not isinstance(password, str) or not isinstance(stored_hash, str):
        return False
    try:
        scheme, rounds_str, salt_hex, hash_hex = stored_hash.split("$", 3)
        if scheme != HASH_SCHEME:
            return False
        rounds = int(rounds_str)
        salt_bytes = bytes.fromhex(salt_hex)
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, rounds)
        expected = bytes.fromhex(hash_hex)
        return constant_time_compare(candidate, expected)
    except (ValueError, TypeError):
        return False


def secure_compare_sha256(secret: str) -> str:
    """
    One-way redact helper for logging (e.g. user ids).

    Replaces the ad-hoc ``hashlib.sha256(...).hexdigest()[:8]`` pattern used in
    log lines so redacted identifiers are produced consistently.
    """
    return hashlib.sha256(secret.encode("utf-8")).hexdigest()[:8]
