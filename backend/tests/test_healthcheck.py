import pytest
from unittest.mock import patch, MagicMock
import sys
import os


class TestHealthcheck:
    def test_main_returns_0_on_success(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "http://test:8080/ready", "HEALTHCHECK_TIMEOUT_SECONDS": "5"}):
            from backend.healthcheck import main
            with patch("backend.healthcheck.urllib.request.urlopen") as mock_urlopen:
                mock_response = MagicMock()
                mock_response.status = 200
                mock_urlopen.return_value.__enter__.return_value = mock_response
                assert main() == 0

    def test_main_returns_1_on_non_200(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "http://test:8080/ready"}):
            from backend.healthcheck import main
            with patch("backend.healthcheck.urllib.request.urlopen") as mock_urlopen:
                mock_response = MagicMock()
                mock_response.status = 500
                mock_urlopen.return_value.__enter__.return_value = mock_response
                assert main() == 1

    def test_main_returns_1_on_timeout(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "http://test:8080/ready"}):
            from backend.healthcheck import main
            with patch("backend.healthcheck.urllib.request.urlopen", side_effect=TimeoutError):
                assert main() == 1

    def test_main_returns_1_on_urlerror(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "http://test:8080/ready"}):
            from backend.healthcheck import main
            with patch("backend.healthcheck.urllib.request.urlopen", side_effect=OSError):
                assert main() == 1

    def test_main_returns_1_on_invalid_scheme(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "ftp://test:8080/ready"}):
            from backend.healthcheck import main
            assert main() == 1

    def test_main_uses_default_url(self):
        with patch.dict(os.environ, {}, clear=True):
            from backend.healthcheck import main
            with patch("backend.healthcheck.urllib.request.urlopen") as mock_urlopen:
                mock_response = MagicMock()
                mock_response.status = 200
                mock_urlopen.return_value.__enter__.return_value = mock_response
                assert main() == 0
                called_url = mock_urlopen.call_args[0][0].full_url if hasattr(mock_urlopen.call_args[0][0], 'full_url') else str(mock_urlopen.call_args[0][0])
                assert "127.0.0.1:7860/ready" in str(mock_urlopen.call_args[0][0])

    def test_main_uses_default_timeout(self):
        with patch.dict(os.environ, {"HEALTHCHECK_URL": "http://test:8080/ready", "HEALTHCHECK_TIMEOUT_SECONDS": "invalid"}):
            from backend.healthcheck import main
            with patch("backend.healthcheck.urllib.request.urlopen") as mock_urlopen:
                mock_response = MagicMock()
                mock_response.status = 200
                mock_urlopen.return_value.__enter__.return_value = mock_response
                assert main() == 0
