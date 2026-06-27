import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# AdminDashboard.jsx
patch_file("Frontend/src/admin/pages/AdminDashboard.jsx", [
    ("api.apiGetTickets(null, profile?.role === 'admin' ? profile?.company : null);", "api.apiGetTickets(null, profile?.role === 'admin' ? profile?.company : null, 100);"),
    ("api.apiGetTickets(null, profile?.company);", "api.apiGetTickets(null, profile?.company, 100);")
])

# MyTickets.jsx
patch_file("Frontend/src/user/pages/MyTickets.jsx", [
    ("api.apiGetTickets(user.id);", "api.apiGetTickets(user.id, null, 50);")
])

# AdminUsers.jsx
patch_file("Frontend/src/admin/pages/AdminUsers.jsx", [
    ("supabase.from('profiles').select('*').eq('status', 'active');", "supabase.from('profiles').select('id, full_name, email, role, status, company, created_at, profile_picture').eq('status', 'active').limit(50);"),
    ("let profileQuery = supabase.from('profiles')\n                .select('*')", "let profileQuery = supabase.from('profiles')\n                .select('id, full_name, email, company, company_id, created_at, status')\n                .limit(50)")
])

# RecentTickets.jsx
patch_file("Frontend/src/user/components/RecentTickets.jsx", [
    (".order('created_at', { ascending: false });", ".order('created_at', { ascending: false }).limit(5);")
])

# PendingAdminRequests.jsx
patch_file("Frontend/src/master-admin/pages/PendingAdminRequests.jsx", [
    (".order('created_at', { ascending: false });", ".order('created_at', { ascending: false }).limit(50);")
])

# MasterBugReports.jsx
patch_file("Frontend/src/master-admin/pages/MasterBugReports.jsx", [
    (".order('created_at', { ascending: false });", ".order('created_at', { ascending: false }).limit(50);")
])

