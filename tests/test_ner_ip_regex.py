"""Tests for NER service regex patterns, specifically IP_ADDRESS validation."""

import re
import pytest

# Import the regex pattern from the service
from backend.services.ner_service import REGEX_PATTERNS


class TestIPAddressRegex:
    """Test that IP_ADDRESS regex correctly validates IPv4 addresses."""

    @pytest.fixture
    def ip_pattern(self):
        return REGEX_PATTERNS["IP_ADDRESS"]

    def test_valid_ips(self, ip_pattern):
        """Valid IPv4 addresses should match."""
        valid_ips = [
            "192.168.1.1",
            "10.0.0.5",
            "172.16.254.1",
            "0.0.0.0",
            "255.255.255.255",
            "8.8.8.8",
            "127.0.0.1",
            "10.0.0.1",
            "192.168.0.1",
        ]
        for ip in valid_ips:
            match = re.search(ip_pattern, ip)
            assert match is not None, f"Expected '{ip}' to match but it didn't"
            assert match.group() == ip, f"Expected full match '{ip}' but got '{match.group()}'"

    def test_invalid_ips_rejected(self, ip_pattern):
        """Invalid IP addresses should NOT match."""
        invalid_ips = [
            "999.999.999.999",
            "300.168.1.1",
            "256.256.256.256",
            "999.0.0.1",
            "10.999.0.1",
            "10.0.999.1",
            "10.0.0.999",
        ]
        for ip in invalid_ips:
            match = re.search(ip_pattern, ip)
            assert match is None, f"Expected '{ip}' to NOT match but it matched: '{match.group()}'"

    def test_ip_address_keyword(self, ip_pattern):
        """The 'IP Address' keyword should also match."""
        assert re.search(ip_pattern, "IP Address") is not None
        assert re.search(ip_pattern, "IPAddress") is not None

    def test_ip_in_text(self, ip_pattern):
        """IP addresses embedded in text should be extracted."""
        text = "Unable to connect to server 192.168.1.100 from my workstation"
        match = re.search(ip_pattern, text)
        assert match is not None
        assert match.group() == "192.168.1.100"

    def test_invalid_ip_in_text(self, ip_pattern):
        """Invalid IPs in text should NOT be extracted."""
        text = "Unable to connect to server 999.999.999.999 from my workstation"
        match = re.search(ip_pattern, text)
        assert match is None

    def test_boundary_octets(self, ip_pattern):
        """Test boundary values for octets (0, 1, 254, 255)."""
        boundary_ips = [
            "0.0.0.0",
            "0.0.0.1",
            "1.0.0.0",
            "255.0.0.0",
            "0.255.0.0",
            "0.0.255.0",
            "0.0.0.255",
            "254.254.254.254",
            "255.255.255.255",
        ]
        for ip in boundary_ips:
            match = re.search(ip_pattern, ip)
            assert match is not None, f"Expected boundary IP '{ip}' to match"

    def test_just_above_boundary(self, ip_pattern):
        """Values just above 255 should NOT match."""
        above_boundary = [
            "256.0.0.0",
            "0.256.0.0",
            "0.0.256.0",
            "0.0.0.256",
        ]
        for ip in above_boundary:
            match = re.search(ip_pattern, ip)
            assert match is None, f"Expected '{ip}' to NOT match (octet > 255)"
