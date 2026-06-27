import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# AdminTickets.jsx
patch_file("Frontend/src/admin/pages/AdminTickets.jsx", [
    ("import { supabase } from \"../../lib/supabaseClient\";", "import { supabase } from \"../../lib/supabaseClient\";\nimport { api } from \"../../services/api\";"),
    ("""let query = supabase
                .from('tickets')
                .select(`
                    *,
                    creator:profiles!tickets_user_id_fkey(full_name, email, profile_picture),
                    assignee:profiles!tickets_assigned_agent_id_fkey(full_name, email, profile_picture)
                `);

            if (profile?.role === 'admin' && profile?.company) {
                query = query.eq('company', profile.company);
            }

            if (statusFilter !== 'All') query = query.eq('status', statusFilter.toLowerCase());
            if (categoryFilter !== 'All') query = query.eq('category', categoryFilter);
            if (priorityFilter !== 'All') query = query.eq('priority', priorityFilter.toLowerCase());
            if (teamFilter !== 'All') query = query.eq('assigned_team', teamFilter);

            let { data, error: sbError } = await query.order('created_at', { ascending: false });""", 
    """let { data, error: sbError } = await api.apiGetTickets(null, profile?.company);"""),
    ("""const basicQuery = supabase.from('tickets').select('*, profiles(full_name, email)');
                const { data: basicData, error: basicError } = await basicQuery.eq('company', profile?.company).order('created_at', { ascending: false });""", 
     """const basicData = await api.apiGetTickets(null, profile?.company); const basicError = null;"""),
    ("""const { error: upError } = await supabase
                .from('tickets')
                .update(updates)
                .eq('id', id);""",
     """await api.apiUpdateTicket(id, updates); const upError = null;""")
])
