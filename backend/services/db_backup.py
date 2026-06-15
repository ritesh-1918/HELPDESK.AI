"""
Supabase Database Backup Pipeline with AES-256-GCM Encryption & PII Redaction.

Automated backup utility that:
  1. Exports all tables from Supabase (configurable table list).
  2. Redacts PII (emails, phones, SSNs, credit cards, IPs, API keys) from
     sensitive fields using the existing pii_redaction engine.
  3. Encrypts the entire backup payload with AES-256-GCM.
  4. Produces an encrypted, auditable backup envelope.

Usage:
    python -m backend.services.db_backup \
        --passphrase "your-secure-passphrase" \
        --output backups/helpdesk_backup_2026.enc.json

Or from code:
    from backend.services.db_backup import BackupPipeline
    pipeline = BackupPipeline(supabase_client)
    envelope = pipeline.run_full()
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any

from backend.services.pii_redaction import (
    redact_all,
    set_pii_redaction_enabled,
)
from backend.services.encryption import encrypt_payload, decrypt_payload

# ── Default tables to back up ─────────────────────────────────────────────

DEFAULT_TABLES: list[str] = [
    "tickets",
    "ticket_messages",
    "profiles",
    "system_settings",
    "companies",
    "company_settings",
    "knowledge_base",
    "csat_responses",
]


class BackupPipeline:
    """Orchestrates backup + redaction + encryption for Supabase."""

    def __init__(self, supabase_client: Any):
        self.supabase = supabase_client

    def run_full(
        self,
        *,
        passphrase: str | None = None,
        tables: list[str] | None = None,
    ) -> dict[str, Any]:
        """Run the complete backup pipeline.

        Args:
            passphrase: Encryption passphrase.
            tables: Tables to back up (defaults to DEFAULT_TABLES).

        Returns:
            Encrypted backup envelope.
        """
        if passphrase is None:
            passphrase = os.environ.get("BACKUP_ENCRYPTION_KEY", "")
            if not passphrase:
                raise ValueError(
                    "passphrase required — set BACKUP_ENCRYPTION_KEY env var "
                    "or pass explicitly"
                )

        tables = tables or DEFAULT_TABLES

        # Enable PII redaction during backup
        set_pii_redaction_enabled(True)

        # 1. Export data from Supabase
        exported: dict[str, list[dict[str, Any]]] = {}
        export_errors: list[dict[str, Any]] = []
        total_rows = 0

        for table_name in tables:
            try:
                response = (
                    self.supabase.table(table_name)
                    .select("*", count="exact")
                    .execute()
                )
                rows = response.data if response.data else []
                exported[table_name] = rows
                total_rows += len(rows)
            except Exception as e:
                export_errors.append(
                    {"table": table_name, "error": str(e)}
                )
                exported[table_name] = []

        # 2. Redact PII from each table (row-level + field-level)
        redacted: dict[str, Any] = {}
        total_pii_redacted = 0

        for table_name, records in exported.items():
            if not records:
                redacted[table_name] = []
                continue

            redacted_rows = []
            for record in records:
                row = dict(record)
                # Apply redact_all to every string field
                for key, value in row.items():
                    if isinstance(value, str) and value:
                        redacted_val = redact_all(value)
                        if redacted_val != value:
                            total_pii_redacted += 1
                        row[key] = redacted_val
                redacted_rows.append(row)
            redacted[table_name] = redacted_rows

        # 3. Build backup payload
        backup_payload = {
            "metadata": {
                "backup_id": f"bkp_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "total_tables": len(tables),
                "total_rows": total_rows,
                "tables_exported": list(exported.keys()),
                "pii_redaction_applied": True,
                "pii_fields_redacted": total_pii_redacted,
            },
            "export_errors": export_errors if export_errors else None,
            "data": redacted,
        }

        # 4. Encrypt the payload
        envelope = encrypt_payload(backup_payload, passphrase=passphrase)

        # 5. Add backup-specific metadata to envelope
        envelope["backup_id"] = backup_payload["metadata"]["backup_id"]
        envelope["backup_metadata"] = {
            "total_rows": total_rows,
            "tables": list(exported.keys()),
            "errors": len(export_errors),
        }

        # Disable PII redaction after backup
        set_pii_redaction_enabled(False)

        return envelope

    def restore(
        self,
        envelope: dict[str, Any],
        passphrase: str,
        *,
        dry_run: bool = True,
    ) -> dict[str, Any]:
        """Restore data from an encrypted backup envelope.

        Args:
            envelope: The encrypted backup envelope from run_full().
            passphrase: Passphrase to decrypt.
            dry_run: If True, only validate and return the data without
                writing to Supabase.

        Returns:
            {
                "ok": bool,
                "tables_restored": list[str],
                "rows_restored": int,
                "errors": list[dict],
            }
        """
        # Decrypt
        try:
            data = decrypt_payload(envelope, passphrase=passphrase)
        except Exception as e:
            return {"ok": False, "error": str(e)}

        tables = data.get("data", {})
        result: dict[str, Any] = {
            "ok": True,
            "tables_restored": [],
            "rows_restored": 0,
            "errors": [],
        }

        for table_name, rows in tables.items():
            if not rows or dry_run:
                if not dry_run:
                    result["errors"].append(
                        {"table": table_name, "error": "empty table"}
                    )
                continue

            if dry_run:
                result["tables_restored"].append(table_name)
                result["rows_restored"] += len(rows)
                continue

            # Actual restore: upsert rows
            try:
                for row in rows:
                    self.supabase.table(table_name).upsert(row).execute()
                result["tables_restored"].append(table_name)
                result["rows_restored"] += len(rows)
            except Exception as e:
                result["errors"].append(
                    {"table": table_name, "error": str(e)}
                )

        return result


# ── CLI entry point ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        description="Supabase DB Backup with AES-256-GCM + PII Redaction"
    )
    parser.add_argument(
        "--passphrase",
        help="Encryption passphrase (or set BACKUP_ENCRYPTION_KEY env var)",
    )
    parser.add_argument(
        "--output",
        default="backup.enc.json",
        help="Output file path (default: backup.enc.json)",
    )
    parser.add_argument(
        "--tables",
        nargs="*",
        help="Tables to back up (default: all DEFAULT_TABLES)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Export and redact but skip encryption",
    )

    args = parser.parse_args()

    passphrase = args.passphrase or os.environ.get("BACKUP_ENCRYPTION_KEY", "")

    # Initialize Supabase client
    from dotenv import load_dotenv
    from pathlib import Path

    env_path = Path(__file__).parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)

    try:
        from supabase import create_client

        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            print("[ERROR] SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
            sys.exit(1)

        supabase = create_client(url, key)
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase: {e}")
        sys.exit(1)

    pipeline = BackupPipeline(supabase)

    tables = args.tables if args.tables else DEFAULT_TABLES

    if args.dry_run:
        set_pii_redaction_enabled(True)

        exported = {}
        for table_name in tables:
            try:
                response = (
                    supabase.table(table_name)
                    .select("*", count="exact")
                    .execute()
                )
                exported[table_name] = response.data if response.data else []
            except Exception as e:
                exported[table_name] = []
                print(f"[WARN] Failed to export {table_name}: {e}")

        redacted = {}
        for table_name, rows in exported.items():
            r = []
            for record in rows:
                row = dict(record)
                for k, v in row.items():
                    if isinstance(v, str) and v:
                        row[k] = redact_all(v)
                r.append(row)
            redacted[table_name] = r

        dry_run_output = {
            "dry_run": True,
            "tables": list(redacted.keys()),
            "data": {t: rows[:2] for t, rows in redacted.items()},
            "sample_only": True,
        }
        with open(args.output, "w") as f:
            json.dump(dry_run_output, f, indent=2, ensure_ascii=False)
        print(f"[OK] Dry run complete → {args.output}")

        set_pii_redaction_enabled(False)
    else:
        if not passphrase:
            print(
                "[ERROR] Passphrase required for encryption. "
                "Use --passphrase or set BACKUP_ENCRYPTION_KEY."
            )
            sys.exit(1)

        envelope = pipeline.run_full(
            passphrase=passphrase,
            tables=tables,
        )

        with open(args.output, "w") as f:
            json.dump(envelope, f, indent=2, ensure_ascii=False)

        print(f"[OK] Encrypted backup saved → {args.output}")
        print(
            f"     Tables: {envelope['backup_metadata']['tables']}"
        )
        print(
            f"     Rows: {envelope['backup_metadata']['total_rows']}"
        )
