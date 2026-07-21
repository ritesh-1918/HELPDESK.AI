import os

# Update backend/main.py
backend_file = "backend/main.py"
with open(backend_file, "r") as f:
    content = f.read()

# Replace api_get_tickets
content = content.replace(
    'async def api_get_tickets(user_id: str = None, company: str = None):',
    'async def api_get_tickets(user_id: str = None, company: str = None, limit: int = 50, offset: int = 0):'
)
content = content.replace(
    'res = query.order("created_at", desc=True).execute()',
    'res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()'
)

# Replace api_get_profiles
content = content.replace(
    'async def api_get_profiles(role: str = None, status: str = None):',
    'async def api_get_profiles(role: str = None, status: str = None, limit: int = 50, offset: int = 0):'
)
content = content.replace(
    'res = query.execute()',
    'res = query.range(offset, offset + limit - 1).execute()'
)

# Replace api_get_admin_requests
content = content.replace(
    'async def api_get_admin_requests(status: str = None):',
    'async def api_get_admin_requests(status: str = None, limit: int = 50, offset: int = 0):'
)
# Ensure we only replace the one in api_get_admin_requests
content = content.replace(
    '    res = query.execute()\n    return res.data\n\n@app.post("/api/storage/upload")',
    '    res = query.range(offset, offset + limit - 1).execute()\n    return res.data\n\n@app.post("/api/storage/upload")'
)

with open(backend_file, "w") as f:
    f.write(content)

# Update Frontend/src/services/api.js
api_file = "Frontend/src/services/api.js"
with open(api_file, "r") as f:
    api_content = f.read()

api_content = api_content.replace(
    'apiGetTickets: async (userId, company) => {',
    'apiGetTickets: async (userId, company, limit = 50, offset = 0) => {'
)
api_content = api_content.replace(
    'if (company) params.append("company", company);',
    'if (company) params.append("company", company);\n    params.append("limit", limit);\n    params.append("offset", offset);'
)

api_content = api_content.replace(
    'apiGetProfiles: async (role, status) => {',
    'apiGetProfiles: async (role, status, limit = 50, offset = 0) => {'
)
api_content = api_content.replace(
    'if (status) params.append("status", status);',
    'if (status) params.append("status", status);\n    params.append("limit", limit);\n    params.append("offset", offset);'
)

api_content = api_content.replace(
    'apiGetAdminRequests: async (status) => {',
    'apiGetAdminRequests: async (status, limit = 50, offset = 0) => {'
)
api_content = api_content.replace(
    'if (status) url += `?status=${status}`;',
    'let params = new URLSearchParams();\n    if (status) params.append("status", status);\n    params.append("limit", limit);\n    params.append("offset", offset);\n    url += `?${params.toString()}`;'
)

with open(api_file, "w") as f:
    f.write(api_content)
