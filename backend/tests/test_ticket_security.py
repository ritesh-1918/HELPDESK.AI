import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os

os.environ["ALLOW_DEGRADED_STARTUP"] = "1"

from backend.routes.tickets import validate_ticket_patch_fields, TICKET_ALLOWED_FIELDS, IMMUTABLE_FIELDS, ADMIN_ONLY_FIELDS, MASTER_ADMIN_ONLY_FIELDS


class TestValidateTicketPatchFields:
    def test_allows_valid_fields_for_admin(self):
        payload = {"subject": "Updated subject", "status": "resolved", "priority": "high"}
        result = validate_ticket_patch_fields(payload, "admin")
        assert result == payload

    def test_rejects_immutable_fields(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields({"user_id": "some_id"}, "admin")
        assert "immutable" in str(exc.value).lower()

    def test_rejects_unknown_fields(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields({"arbitrary_field": "value"}, "admin")
        assert "not allowed" in str(exc.value).lower()

    def test_master_admin_fields_require_master_role(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields({"company_id": "new_company"}, "admin")
        assert "master admin privileges" in str(exc.value).lower()

    def test_master_admin_can_set_company_id(self):
        result = validate_ticket_patch_fields({"company_id": "new_company"}, "master_admin")
        assert result == {"company_id": "new_company"}

    def test_admin_only_fields_block_regular_user(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields({"priority": "critical"}, "user")
        assert "admin privileges" in str(exc.value).lower()

    def test_rejects_empty_payload(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields({}, "admin")
        assert "no valid fields" in str(exc.value).lower()

    def test_rejects_non_dict_payload(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields(["list", "not", "dict"], "admin")
        assert "json object" in str(exc.value).lower()

    def test_allows_metadata_field(self):
        result = validate_ticket_patch_fields({"metadata": {"key": "val"}}, "admin")
        assert "metadata" in result

    def test_id_is_immutable(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields({"id": "123"}, "master_admin")
        assert "immutable" in str(exc.value).lower()

    def test_sla_breach_at_is_immutable(self):
        with pytest.raises(Exception) as exc:
            validate_ticket_patch_fields({"sla_breach_at": "2025-01-01"}, "master_admin")
        assert "immutable" in str(exc.value).lower()
