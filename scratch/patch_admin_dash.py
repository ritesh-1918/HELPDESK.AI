import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

patch_file("Frontend/src/admin/pages/AdminDashboard.jsx", [
    ("import { supabase } from \"../../lib/supabaseClient\";", "import { supabase } from \"../../lib/supabaseClient\";\nimport { api } from \"../../services/api\";"),
    ("""let query = supabase
                        .from('tickets')
                        .select(`
                    *,
                    creator:profiles!tickets_user_id_fkey(full_name, email, profile_picture)
                `)
                        .order('created_at', { ascending: false });
                    if (profile?.role === 'admin' && profile?.company) query = query.eq('company', profile.company);
                    const { data, error } = await query;""", 
     """const data = await api.apiGetTickets(null, profile?.role === 'admin' ? profile?.company : null);\n                    const error = null;"""),
    ("""const { data: basicData, error: basicError } = await supabase.from('tickets').select('*').eq('company', profile?.company).order('created_at', { ascending: false });""",
     """const basicData = await api.apiGetTickets(null, profile?.company); const basicError = null;""")
])
