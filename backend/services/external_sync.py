# ServiceNow / SAP Sync Gateway
import httpx
import os
import logging

logger = logging.getLogger(__name__)

class ExternalSyncService:
    def __init__(self):
        self.servicenow_url = os.getenv("SERVICENOW_API_URL")
        self.sap_url = os.getenv("SAP_API_URL")
        
    async def sync_ticket_update(self, ticket_id, status):
        # Trigger outbound REST calls to ServiceNow & SAP endpoints
        async with httpx.AsyncClient() as client:
            if self.servicenow_url:
                try:
                    response = await client.post(
                        f"{self.servicenow_url}/tickets/{ticket_id}",
                        json={"status": status}
                    )
                    response.raise_for_status()
                except Exception as e:
                    logger.error(
                        f"ServiceNow ticket update failed for ticket_id={ticket_id}, "
                        f"status={status}, url={self.servicenow_url}: {e}"
                    )
                    
            if self.sap_url:
                try:
                    response = await client.post(
                        f"{self.sap_url}/tickets/{ticket_id}",
                        json={"status": status}
                    )
                    response.raise_for_status()
                except Exception as e:
                    logger.error(
                        f"SAP ticket update failed for ticket_id={ticket_id}, "
                        f"status={status}, url={self.sap_url}: {e}"
                    )
