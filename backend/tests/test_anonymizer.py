from backend.utils.anonymizer import anonymize_sensitive_text, anonymize_sensitive_value


def test_anonymize_sensitive_text_redacts_common_secrets():
    text = (
        "Contact alice@example.com from 192.168.1.45 while using "
        "mongodb+srv://admin:SecretPass123@cluster0.example.mongodb.net/helpdesk "
        "and password=OpenSesame plus Bearer eyJhbGciOiJIUzI1NiJ9."
    )

    redacted, findings = anonymize_sensitive_text(text)

    assert "[REDACTED_EMAIL]" in redacted
    assert "[REDACTED_IP_ADDRESS]" in redacted
    assert "[REDACTED_CONNECTION_STRING]" in redacted
    assert "[REDACTED_CREDENTIALS]" in redacted
    assert "alice@example.com" not in redacted
    assert "192.168.1.45" not in redacted
    assert "SecretPass123" not in redacted
    assert "OpenSesame" not in redacted
    assert "connection_string" in findings
    assert "email" in findings
    assert "ipv4" in findings
    assert "credentials" in findings


def test_anonymize_sensitive_value_handles_nested_payloads():
    payload = {
        "top_level": "Reach bob@example.com",
        "nested": {
            "token": "token=superSecretValue",
            "connection": "postgresql://admin:pw@db.example.com/app",
        },
        "items": [
            "IPv6 2001:db8:85a3::8a2e:370:7334",
            "Nothing sensitive here",
        ],
    }

    redacted, findings = anonymize_sensitive_value(payload)

    assert redacted["top_level"] == "Reach [REDACTED_EMAIL]"
    assert redacted["nested"]["token"] == "token= [REDACTED_CREDENTIALS]"
    assert "[REDACTED_CONNECTION_STRING]" in redacted["nested"]["connection"]
    assert redacted["items"][0] == "IPv6 [REDACTED_IP_ADDRESS]"
    assert "email" in findings
    assert "credentials" in findings
    assert "connection_string" in findings
    assert "ipv6" in findings


def test_ai_analyze_redacts_sensitive_data_when_enabled(test_client):
    payload = {
        "text": "VPN issue for alice@example.com on 192.168.1.45",
        "image_text": "image shows mongodb+srv://admin:SecretPass123@cluster0.example.mongodb.net/helpdesk",
        "anonymize_sensitive_data": True,
        "company_id": "company_A",
    }

    response = test_client.post("/ai/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "[REDACTED_EMAIL]" in data["original_text"]
    assert "[REDACTED_IP_ADDRESS]" in data["original_text"]
    assert "[REDACTED_CONNECTION_STRING]" in data["ocr_text"]
    assert "alice@example.com" not in data["original_text"]
    assert "192.168.1.45" not in data["original_text"]


def test_ticket_save_redacts_sensitive_payload_before_persistence(test_client, fake_db):
    payload = {
        "user_id": "user_A",
        "subject": "Password reset for alice@example.com",
        "description": "Need help with mongodb+srv://admin:SecretPass123@cluster0.example.mongodb.net/helpdesk and 10.0.0.2",
        "category": "Software",
        "subcategory": "Access",
        "priority": "medium",
        "assigned_team": "Application Support",
        "status": "open",
        "auto_resolve": False,
        "is_duplicate": False,
        "confidence": 0.95,
        "company_id": "company_A",
        "company": "Company A",
        "sla_breach_at": "",
        "ocr_text": "secret api_key=superSecretValue",
        "metadata": {
            "notes": "Contact bob@example.com or 172.16.0.24",
            "nested": {"connection": "postgresql://admin:pw@db.example.com/app"},
        },
        "routing_confidence": 0.95,
        "anonymize_sensitive_data": True,
    }

    response = test_client.post("/tickets/save", json=payload)

    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert len(fake_db["tickets"]) == 1

    saved_ticket = fake_db["tickets"][0]
    assert "[REDACTED_EMAIL]" in saved_ticket["subject"]
    assert "[REDACTED_CONNECTION_STRING]" in saved_ticket["description"]
    assert "[REDACTED_IP_ADDRESS]" in saved_ticket["description"]
    assert "[REDACTED_CREDENTIALS]" in saved_ticket["ocr_text"]
    assert saved_ticket["metadata"]["anonymization_enabled"] is True
    assert "[REDACTED_EMAIL]" in saved_ticket["metadata"]["notes"]
    assert "[REDACTED_CONNECTION_STRING]" in saved_ticket["metadata"]["nested"]["connection"]
