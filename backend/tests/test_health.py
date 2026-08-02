def test_health_endpoint(client):
    """Verifies that the /api/v1/health endpoint returns 200 OK and status 'healthy'."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
