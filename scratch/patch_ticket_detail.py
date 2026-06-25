import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

patch_file("Frontend/src/user/pages/TicketDetail.jsx", [
    ("import { supabase } from \"../../lib/supabaseClient\";", "import { supabase } from \"../../lib/supabaseClient\";\nimport { api } from \"../../services/api\";\nimport axios from 'axios';\nimport { API_CONFIG } from '../../config';"),
    ("""const { data, error } = await supabase
                    .from('tickets')
                    .select('*')
                    .eq('id', ticket_id)
                    .single();""",
     """const response = await axios.get(`${API_CONFIG.BACKEND_URL}/tickets/${ticket_id}`);\n                const data = response.data;\n                const error = null;"""),
    ("""const { error: upError } = await supabase
                .from('tickets')
                .update(updates)
                .eq('id', ticket.ticket_id);""",
     """await api.apiUpdateTicket(ticket.ticket_id, updates); const upError = null;""")
])
