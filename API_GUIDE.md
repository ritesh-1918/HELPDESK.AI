# API Guide

Standard response codes used across the HELPDESK.AI backend (`backend/main.py`).

## Standard Response Codes

| Status Code | Meaning                  | Typical Scenario                                                                 |
|-------------|--------------------------|----------------------------------------------------------------------------------|
| `200`       | OK                       | Successful request — e.g. ticket list, ticket detail, search, recommendations.   |
| `201`       | Created                  | Resource successfully created — e.g. a new ticket is created.                    |
| `400`       | Bad Request              | Invalid input or payload — e.g. malformed request body, missing tenant assignment.|
| `401`       | Unauthorized             | Missing/invalid authentication — e.g. invalid credentials or invalid session.    |
| `403`       | Forbidden                | Authenticated but not permitted — e.g. user not authorized for this tenant.      |
| `404`       | Not Found                | Requested resource does not exist — e.g. ticket or user profile not found.       |
| `422`       | Unprocessable Entity     | Validation failure — e.g. `sort_by` is not an allowed sort field.                |
| `500`       | Internal Server Error    | Unexpected server failure — e.g. database connection not initialized.            |
| `503`       | Service Unavailable      | Dependency unavailable — e.g. database connection offline.                       |

> **Note:** All error responses include a `detail` field describing the failure. Clients should handle `4xx` errors as user-actionable and `5xx` errors as transient/server-side issues.
