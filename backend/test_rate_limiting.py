            # IP 2 should still be allowed
            allowed = client.post(
                "/analyze",
                json=SAMPLE_PAYLOAD,
                headers={"X-Forwarded-For": "5.6.7.8"}
            )
            assert allowed.status_code != 429, (
                "A different IP must not be affected by another IP's rate limit"
            )

    def test_non_ml_endpoints_not_affected(self):
        """Health check or non-ML routes must not be rate limited."""
        app.state.limiter.reset()
        res = client.get("/health")
        # Should not be 429 — rate limiting only targets ML endpoints
        assert res.status_code != 429
