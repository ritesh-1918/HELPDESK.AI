from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.routers.admin import router as admin_router

app = FastAPI()
app.include_router(admin_router)
client = TestClient(app)
def test_export_team_metrics_csv():
    # Mock supabase client response
    mock_response = MagicMock()
    mock_response.data = [
        {
            "assigned_team": "IT Support",
            "status": "resolved",
            "sla_status": "OK",
            "created_at": "2026-06-01T10:00:00Z",
            "closed_at": "2026-06-01T12:00:00Z" # 2 hours
        },
        {
            "assigned_team": "IT Support",
            "status": "open",
            "sla_status": "BREACHED",
            "created_at": "2026-06-01T09:00:00Z",
            "closed_at": None
        },
        {
            "assigned_team": "Billing",
            "status": "closed",
            "sla_status": "OK",
            "created_at": "2026-06-02T10:00:00Z",
            "closed_at": "2026-06-02T11:30:00Z" # 1.5 hours
        }
    ]
    
    # We patch the supabase call in backend.routers.admin where it's used
    with patch("backend.routers.admin.supabase") as mock_supabase:
        mock_supabase.table().select().eq().execute.return_value = mock_response
        
        # Override the dependency for current user to simulate a logged-in admin
        from backend.auth_cookie import get_current_user
        app.dependency_overrides[get_current_user] = lambda: {"id": "test-admin", "role": "admin"}
        
        try:
            response = client.get("/api/admin/metrics/team/csv?company_id=test-company")
            
            assert response.status_code == 200
            assert response.headers["content-type"] == "text/csv; charset=utf-8"
            assert "attachment; filename=team_statistics_test-company.csv" in response.headers["content-disposition"]
            
            content = response.content.decode("utf-8")
            lines = content.strip().split("\r\n")
            
            # Check Headers
            assert lines[0] == "Team Name,Total Tickets,Open Tickets,Resolved Tickets,SLA Breached,Avg Resolution Time (hrs)"
            
            # Check Billing Row
            assert lines[1] == "Billing,1,0,1,0,1.5"
            
            # Check IT Support Row
            assert lines[2] == "IT Support,2,1,1,1,2.0"
        finally:
            app.dependency_overrides.clear()
