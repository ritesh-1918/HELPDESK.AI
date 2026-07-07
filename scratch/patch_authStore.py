with open("Frontend/src/store/authStore.ts", "r") as f:
    content = f.read()

# Make it basic TS by just adding interface
ts_content = """import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import logger from '../utils/logger';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type User = any; // Supabase User

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
""" + content[content.find("  initialize: async () => {"):]

# Replace create((set, get) => ({ with typed version
ts_content = ts_content.replace(
    "const useAuthStore = create((set, get) => ({",
    "const useAuthStore = create<AuthState>((set, get) => ({"
)

# Fix missing properties from state in the interface definition
# It's easier to just use `any` for the store itself if we don't want to type all 10 methods, or we can just let TS infer it
# Actually, since strict=false, we don't even need to strictly type zustand. Let's just leave it as is but add the interface so we can use it in components.
