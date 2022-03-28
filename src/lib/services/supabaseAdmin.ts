import { createClient } from '@supabase/supabase-js';
import { secret } from '$lib/services/secrets';

const supabaseUrl = <string>import.meta.env.VITE_PUBLIC_SUPABASE_URL;

export const supabaseAdminClient = createClient(supabaseUrl, secret.supabasePrivateKey);
