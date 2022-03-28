import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = <string>import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = <string>import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey);
