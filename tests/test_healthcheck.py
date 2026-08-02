import pytest
from unittest.mock import MagicMock, patch
import os
import json
import urllib.error
from backend.healthcheck import Config, run_check, _validate_body, CheckResult

@pytest.fixture
def default_cfg():
    return Config(url="http://localhost:8000/health")

def test_config_from_env():
    env = {
        "HEALTHCHECK_URL": "http://test:123/ready",
        "HEALTHCHECK_TIMEOUT_SECONDS": "5.5",
        "HEALTHCHECK_RETRIES": "2",
        "HEALTHCHECK_EXPECTED_STATUS": "200-204",
        "HEALTHCHECK_HEADERS": "X-Test: value, Content-Type: application/json"
    }
    with patch.dict(os.environ, env):
        cfg = Config.from_env()
        assert cfg.url == "http://test:123/ready"
        assert cfg.timeout == 5.5
        assert cfg.retries == 2
        assert cfg.expected_status == (200, 204)
        assert cfg.extra_headers == {"X-Test": "value", "Content-Type": "application/json"}

def test_validate_body(default_cfg):
    # Test valid body contains
    default_cfg.expected_body_contains = "ready"
    valid, reason = _validate_body("system is ready", default_cfg)
    assert valid is True
    
    # Test invalid body contains
    valid, reason = _validate_body("system is down", default_cfg)
    assert valid is False
    assert "ready" in reason

    # Test valid JSON key/value
    default_cfg.expected_body_contains = None
    default_cfg.expected_json_key = "status"
    default_cfg.expected_json_value = "ok"
    valid, reason = _validate_body('{"status": "ok", "version": "1.0"}', default_cfg)
    assert valid is True

    # Test invalid JSON value
    valid, reason = _validate_body('{"status": "error"}', default_cfg)
    assert valid is False
    assert "ok" in reason

def test_run_check_success(default_cfg):
    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = b"OK"
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp
        
        result = run_check(default_cfg)
        assert result.success is True
        assert result.status_code == 200
        assert result.attempt == 1

def test_run_check_retry_failure(default_cfg):
    default_cfg.retries = 1
    default_cfg.retry_delay = 0.01
    
    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.side_effect = urllib.error.URLError("Connection refused")
        
        with patch("time.sleep"): # Skip actual sleeping
            result = run_check(default_cfg)
            assert result.success is False
            assert result.attempt == 2
            assert "Connection refused" in result.failure_reason

def test_run_check_http_error_success(default_cfg):
    # Test case where a 404 is actually "success" if expected_status includes it
    default_cfg.expected_status = (400, 404)
    
    with patch("urllib.request.urlopen") as mock_urlopen:
        # urlopen raises HTTPError for non-2xx codes usually
        exc = urllib.error.HTTPError(default_cfg.url, 404, "Not Found", {}, MagicMock())
        exc.read = MagicMock(return_value=b"Not Found but expected")
        mock_urlopen.side_effect = exc
        
        result = run_check(default_cfg)
        assert result.success is True
        assert result.status_code == 404

def test_check_result_to_dict():
    res = CheckResult(success=True, status_code=200, url="http://test")
    d = res.to_dict()
    assert d["success"] is True
    assert d["status_code"] == 200
    assert "failure_reason" not in d
