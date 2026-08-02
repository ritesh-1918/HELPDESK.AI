import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

patch_file("Frontend/src/master-admin/pages/AllAdmins.jsx", [
    ("import { supabase } from \"../../lib/supabaseClient\";", "import { supabase } from \"../../lib/supabaseClient\";\nimport { api } from \"../../services/api\";"),
    ("""const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    company_rel:companies!company_id (name)
                `)
                .eq('role', 'admin')
                .order('created_at', { ascending: false });""",
     """const data = await api.apiGetProfiles('admin', null); const error = null;""")
])
