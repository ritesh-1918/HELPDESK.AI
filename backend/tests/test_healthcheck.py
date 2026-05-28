"""
Unit tests for healthcheck.py
"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from healthcheck import main


class TestHealthcheck:
    """Test cases for healthcheck.main() function."""

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_success(self, mock_urlopen):
        """Test successful healthcheck with 200 status."""
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = main()
        assert result == 0

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_success_201(self, mock_urlopen):
        """Test successful healthcheck with 201 status."""
        mock_response = MagicMock()
        mock_response.status = 201
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = main()
        assert result == 0

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_failure_500(self, mock_urlopen):
        """Test failed healthcheck with 500 status."""
        mock_response = MagicMock()
        mock_response.status = 500
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = main()
        assert result == 1

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_failure_404(self, mock_urlopen):
        """Test failed healthcheck with 404 status."""
        mock_response = MagicMock()
        mock_response.status = 404
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = main()
        assert result == 1

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_timeout(self, mock_urlopen):
        """Test healthcheck with timeout error."""
        mock_urlopen.side_effect = TimeoutError("Connection timed out")

        result = main()
        assert result == 1

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_url_error(self, mock_urlopen):
        """Test healthcheck with URL error."""
        import urllib.error
        mock_urlopen.side_effect = urllib.error.URLError("Connection refused")

        result = main()
        assert result == 1

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_os_error(self, mock_urlopen):
        """Test healthcheck with OS error."""
        mock_urlopen.side_effect = OSError("Network unreachable")

        result = main()
        assert result == 1

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "ftp://invalid.com/ready"})
    def test_healthcheck_invalid_scheme(self):
        """Test healthcheck with invalid URL scheme."""
        result = main()
        assert result == 1

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_custom_timeout(self, mock_urlopen):
        """Test healthcheck with custom timeout."""
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        with patch.dict(os.environ, {"HEALTHCHECK_TIMEOUT_SECONDS": "5"}):
            result = main()
            assert result == 0
            mock_urlopen.assert_called_once_with(
                "http://localhost:7860/ready",
                timeout=5.0
            )

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_invalid_timeout(self, mock_urlopen):
        """Test healthcheck with invalid timeout value."""
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        with patch.dict(os.environ, {"HEALTHCHECK_TIMEOUT_SECONDS": "invalid"}):
            result = main()
            assert result == 0
            mock_urlopen.assert_called_once_with(
                "http://localhost:7860/ready",
                timeout=3.0
            )

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "https://example.com/health"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_https(self, mock_urlopen):
        """Test healthcheck with HTTPS URL."""
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = main()
        assert result == 0

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_boundary_299(self, mock_urlopen):
        """Test healthcheck with status 299 (success boundary)."""
        mock_response = MagicMock()
        mock_response.status = 299
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = main()
        assert result == 0

    @patch.dict(os.environ, {"HEALTHCHECK_URL": "http://localhost:7860/ready"})
    @patch("urllib.request.urlopen")
    def test_healthcheck_boundary_300(self, mock_urlopen):
        """Test healthcheck with status 300 (failure boundary)."""
        mock_response = MagicMock()
        mock_response.status = 300
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = main()
        assert result == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
